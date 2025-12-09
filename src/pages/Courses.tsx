import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Layers } from "lucide-react";

interface Course {
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

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/courses?limit=60");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Calculate actual duration from chapters
  const calculateCourseDuration = (course: Course) => {
    if (course.chapters && course.chapters.length > 0) {
      let totalMinutes = 0;
      let hasAnyDuration = false;
      
      course.chapters.forEach((chapter) => {
        if (chapter.duration) {
          hasAnyDuration = true;
          const match = chapter.duration.match(/(\d+)\s*(min|h)/i);
          if (match) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            totalMinutes += unit === 'h' ? value * 60 : value;
          }
        }
      });
      
      if (hasAnyDuration && totalMinutes > 0) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}min`;
        } else if (hours > 0) {
          return `${hours}h`;
        } else {
          return `${minutes}min`;
        }
      }
    }
    
    // Only use duration_hours if realistic
    if (course.duration_hours && course.duration_hours < 100) {
      return `${course.duration_hours}h`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  const categories = Array.from(
    new Set(
      courses
        .map((c) => (c.category || "Général").trim())
        .filter(Boolean)
    )
  ).sort();

  const filteredCourses =
    selectedCategory === "all"
      ? courses
      : courses.filter((c) => (c.category || "Général").trim() === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tous les cours</h1>
              <p className="text-muted-foreground mt-1">
                Explorez l'ensemble des cours disponibles sur Synapse.
              </p>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                Toutes les catégories
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        {filteredCourses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">Aucun cours disponible pour le moment</p>
              <p className="text-sm text-muted-foreground">
                Revenez plus tard ou ajustez vos centres d'intérêt depuis le tableau de bord.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const cover =
                course.images?.cover_image ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
              
              const duration = calculateCourseDuration(course);

              return (
                <Link key={course._id} to={`/course/${course._id}`}>
                  <Card className="group h-full overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all flex flex-col">
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                      <img
                        src={cover}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
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
                    <CardContent className="p-5 space-y-3 flex flex-col flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {course.category && (
                          <Badge variant="secondary" className="text-xs">
                            {course.category}
                          </Badge>
                        )}
                        {course.tags && course.tags.length > 0 && (
                          <span className="text-[11px] text-muted-foreground">
                            <Layers className="inline h-3 w-3 mr-1" />
                            {course.tags.slice(0, 2).join(" • ")}
                          </span>
                        )}
                      </div>
                      <h2 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        {course.description || "Découvrez ce cours et développez de nouvelles compétences."}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>{course.author || "Expert Synapse"}</span>
                        <Button size="sm" variant="outline">
                          Voir le cours
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
