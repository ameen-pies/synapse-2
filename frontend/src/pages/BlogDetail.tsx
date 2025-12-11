import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, Clock, Bookmark, BookmarkPlus, ThumbsUp, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Blog {
  _id: string;
  title: string;
  description: string;
  content?: string;
  category?: string;
  tags?: string[];
  author?: string;
  createdAt?: string;
  images?: {
    cover_image?: string;
  };
  readTime?: string;
}

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    loadBlog();
    checkSavedAndLiked();
  }, [id]);

  const checkSavedAndLiked = () => {
    const userId = localStorage.getItem('userId');
    if (userId && id) {
      const saved = JSON.parse(localStorage.getItem(`savedBlogs_${userId}`) || '[]');
      setIsSaved(saved.includes(id));
      
      const liked = JSON.parse(localStorage.getItem(`likedBlogs_${userId}`) || '[]');
      setIsLiked(liked.includes(id));
      
      // Get like count from localStorage or initialize
      const likesData = JSON.parse(localStorage.getItem('blogLikes') || '{}');
      setLikes(likesData[id!] || 0);
    }
  };

  const loadBlog = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBlog(data);
      } else {
        toast.error("Article introuvable");
      }
    } catch (err) {
      console.error("Error loading blog:", err);
      toast.error("Erreur lors du chargement de l'article");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error("Veuillez vous connecter");
      navigate("/login");
      return;
    }

    const storageKey = `savedBlogs_${userId}`;
    let saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (isSaved) {
      saved = saved.filter((blogId: string) => blogId !== id);
      toast.success("Retiré des favoris");
    } else {
      saved.push(id);
      toast.success("Ajouté aux favoris");
    }
    
    localStorage.setItem(storageKey, JSON.stringify(saved));
    setIsSaved(!isSaved);
  };

  const handleLike = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error("Veuillez vous connecter");
      navigate("/login");
      return;
    }

    const storageKey = `likedBlogs_${userId}`;
    let liked = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Update global likes count
    const likesData = JSON.parse(localStorage.getItem('blogLikes') || '{}');
    
    if (isLiked) {
      liked = liked.filter((blogId: string) => blogId !== id);
      likesData[id!] = Math.max(0, (likesData[id!] || 0) - 1);
      setLikes(likesData[id!]);
    } else {
      liked.push(id);
      likesData[id!] = (likesData[id!] || 0) + 1;
      setLikes(likesData[id!]);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(liked));
    localStorage.setItem('blogLikes', JSON.stringify(likesData));
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.description,
        url: window.location.href,
      }).catch(() => {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié dans le presse-papiers");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-medium mb-4">Article non trouvé</p>
            <Button onClick={() => navigate("/blogs")}>
              Retour aux articles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bannerImage = blog.images?.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 -mt-16">
        <img 
          src={bannerImage}
          alt={blog.title}
          className="h-full w-full object-cover opacity-40"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-1">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/blogs")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux articles
          </Button>

          {/* Main Content Card */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              {/* Category Badge */}
              {blog.category && (
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  {blog.category}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {blog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{blog.author || 'Expert Synapse'}</span>
                </div>
                {blog.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(blog.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                )}
                {blog.readTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{blog.readTime}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 py-4 border-y mb-8">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? "bg-primary" : ""}
                >
                  <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {likes > 0 && <span className="ml-1">{likes}</span>}
                </Button>
                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  onClick={handleSave}
                  className={isSaved ? "bg-primary" : ""}
                >
                  {isSaved ? (
                    <>
                      <Bookmark className="h-4 w-4 mr-2 fill-current" />
                      Sauvegardé
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>

              {/* Description */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {blog.description}
                </p>
              </div>

              <Separator className="my-8" />

              {/* Content */}
              {blog.content && (
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </div>
              )}

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Articles Section (Optional) */}
          <Card className="mt-8 border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Articles similaires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                D'autres articles qui pourraient vous intéresser seront bientôt disponibles ici.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}