import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Bookmark, Clock, MessageSquare, BookOpen, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SavedCourse {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  images?: { cover_image?: string };
  difficulty?: string;
  duration_hours?: number;
  author?: string;
  chapters?: Array<{ duration?: string }>;
}

interface SavedBlog {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  author?: string;
  images?: { cover_image?: string };
  createdAt?: string;
}

interface SavedForum {
  _id: string;
  title: string;
  description?: string;
  labels?: string[];
  replies?: number;
  views?: number;
  userName?: string;
}

export default function SavedContent() {
  const [activeTab, setActiveTab] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([]);
  const [savedBlogs, setSavedBlogs] = useState<SavedBlog[]>([]);
  const [savedForums, setSavedForums] = useState<SavedForum[]>([]);

  useEffect(() => {
    loadSavedContent();
  }, []);

  const loadSavedContent = async () => {
    setLoading(true);
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Load saved courses
      const savedCoursesIds = JSON.parse(localStorage.getItem(`savedCourses_${userId}`) || '[]');
      if (savedCoursesIds.length > 0) {
        const coursesPromises = savedCoursesIds.map((id: string) =>
          fetch(`http://localhost:5000/api/courses/${id}`).then(r => r.ok ? r.json() : null)
        );
        const coursesData = await Promise.all(coursesPromises);
        setSavedCourses(coursesData.filter(Boolean));
      }

      // Load saved blogs
      const savedBlogsIds = JSON.parse(localStorage.getItem(`savedBlogs_${userId}`) || '[]');
      if (savedBlogsIds.length > 0) {
        const blogsPromises = savedBlogsIds.map((id: string) =>
          fetch(`http://localhost:5000/api/blogs/${id}`).then(r => r.ok ? r.json() : null)
        );
        const blogsData = await Promise.all(blogsPromises);
        setSavedBlogs(blogsData.filter(Boolean));
      }

      // Load saved forums
      const savedForumsIds = JSON.parse(localStorage.getItem(`savedForums_${userId}`) || '[]');
      if (savedForumsIds.length > 0) {
        const forumsPromises = savedForumsIds.map((id: string) =>
          fetch(`http://localhost:5000/api/forums/${id}`).then(r => r.ok ? r.json() : null)
        );
        const forumsData = await Promise.all(forumsPromises);
        setSavedForums(forumsData.filter(Boolean));
      }
    } catch (error) {
      console.error("Error loading saved content:", error);
      toast.error("Erreur lors du chargement du contenu sauvegardé");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = (type: 'courses' | 'blogs' | 'forums', id: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const storageKey = `saved${type.charAt(0).toUpperCase() + type.slice(1)}_${userId}`;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = saved.filter((itemId: string) => itemId !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Update state
    if (type === 'courses') {
      setSavedCourses(savedCourses.filter(c => c._id !== id));
    } else if (type === 'blogs') {
      setSavedBlogs(savedBlogs.filter(b => b._id !== id));
    } else if (type === 'forums') {
      setSavedForums(savedForums.filter(f => f._id !== id));
    }

    toast.success("Retiré des favoris");
  };

  const calculateCourseDuration = (course: SavedCourse) => {
    if (!course.chapters || course.chapters.length === 0) {
      return course.duration_hours ? `${course.duration_hours}h` : null;
    }
    
    let totalMinutes = 0;
    course.chapters.forEach((chapter) => {
      if (chapter.duration) {
        const match = chapter.duration.match(/(\d+)\s*(min|h)/i);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          totalMinutes += unit === 'h' ? value * 60 : value;
        }
      }
    });
    
    if (totalMinutes === 0) {
      return course.duration_hours ? `${course.duration_hours}h` : null;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Chargement du contenu sauvegardé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contenu Sauvegardé</h1>
          <p className="text-muted-foreground mt-1">Retrouvez tous vos contenus favoris</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              Cours
              {savedCourses.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {savedCourses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              Articles
              {savedBlogs.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {savedBlogs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="forums" className="flex items-center gap-2">
              Discussions
              {savedForums.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {savedForums.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            {savedCourses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucun cours sauvegardé</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez à sauvegarder des cours pour les retrouver facilement ici
                  </p>
                  <Link to="/courses">
                    <Button>Explorer les cours</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCourses.map((course) => {
                  const duration = calculateCourseDuration(course);
                  const cover = course.images?.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                  
                  return (
                    <Card key={course._id} className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all flex flex-col">
                      <div className="relative">
                        <Link to={`/course/${course._id}`}>
                          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                            <img
                              src={cover}
                              alt={course.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {course.difficulty && (
                              <Badge className="absolute right-3 top-3 bg-primary/90 text-primary-foreground border-0">
                                {course.difficulty}
                              </Badge>
                            )}
                            {duration && (
                              <Badge className="absolute left-3 top-3 bg-white/90 text-foreground border-0 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {duration}
                              </Badge>
                            )}
                          </div>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-destructive hover:text-destructive"
                          onClick={() => handleUnsave('courses', course._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-5 space-y-3 flex flex-col flex-1">
                        <Link to={`/course/${course._id}`}>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {course.category && (
                              <Badge variant="secondary" className="text-xs">
                                {course.category}
                              </Badge>
                            )}
                          </div>
                          <h2 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                            {course.title}
                          </h2>
                          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                            {course.description || "Découvrez ce cours et développez de nouvelles compétences."}
                          </p>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blogs" className="mt-6">
            {savedBlogs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucun article sauvegardé</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez à sauvegarder des articles pour les retrouver facilement ici
                  </p>
                  <Link to="/blogs">
                    <Button>Explorer les articles</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedBlogs.map((blog) => (
                  <Card key={blog._id} className="p-6 border-border bg-card hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {blog.category || 'Article'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleUnsave('blogs', blog._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Link to={`/blog/${blog._id}`}>
                      <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {blog.description || 'Découvrez cet article intéressant'}
                      </p>
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {blog.author || 'Expert Synapse'}
                      </div>
                      {blog.createdAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(blog.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="forums" className="mt-6">
            {savedForums.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucune discussion sauvegardée</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez à sauvegarder des discussions pour les retrouver facilement ici
                  </p>
                  <Link to="/community">
                    <Button>Explorer le forum</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedForums.map((post) => (
                  <Card key={post._id} className="p-6 border-border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.labels && post.labels.length > 0 && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {post.labels[0]}
                            </Badge>
                          )}
                        </div>
                        <Link to={`/community/${post._id}`}>
                          <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {post.description}
                          </p>
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {post.userName && <span>Par {post.userName}</span>}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.replies || 0} réponses
                          </span>
                          <span>•</span>
                          <span>{post.views || 0} vues</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleUnsave('forums', post._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}