import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, User } from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  images?: { cover_image?: string };
  author?: string;
  created_at?: string;
  read_time?: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/blogs?limit=60");
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error("Error loading blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  const categories = Array.from(
    new Set(
      blogs
        .map((b) => (b.category || "Général").trim())
        .filter(Boolean)
    )
  ).sort();

  const filteredBlogs =
    selectedCategory === "all"
      ? blogs
      : blogs.filter((b) => (b.category || "Général").trim() === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Blogs & Articles</h1>
              <p className="text-muted-foreground mt-1">
                Lisez des guides, analyses et retours d'expérience sélectionnés pour vous.
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

        {filteredBlogs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">Aucun article disponible pour le moment</p>
              <p className="text-sm text-muted-foreground">
                Revenez plus tard ou explorez les cours et forums pour continuer à apprendre.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => {
              const cover =
                blog.images?.cover_image ||
                "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800";

              return (
                <Link key={blog._id} to={`/blog/${blog._id}`}>
                  <Card className="group h-full overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all flex flex-col">
                    <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                      <img
                        src={cover}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <CardContent className="p-5 space-y-3 flex flex-col flex-1">
                      <Badge variant="secondary" className="text-xs">
                        {blog.category || "Article"}
                      </Badge>
                      <h2 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        {blog.description ||
                          blog.content ||
                          "Découvrez cet article pour approfondir vos connaissances."}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {blog.author || "Auteur Synapse"}
                        </span>
                        <span className="flex items-center gap-2">
                          {blog.created_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(blog.created_at).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {blog.read_time || "5 min"}
                          </span>
                        </span>
                      </div>
                      <div className="pt-1 flex justify-end">
                        <Button size="sm" variant="outline">
                          Lire l'article
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


