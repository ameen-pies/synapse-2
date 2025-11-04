import { useState } from "react";
import { CourseCard } from "@/components/CourseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Bookmark } from "lucide-react";
import coursePython from "@/assets/course-python.jpg";
import courseBusiness from "@/assets/course-business.jpg";

const savedCourses = [
  {
    title: "Formation Complète Python - Les Bases du Développement",
    instructor: "Marie Dubois",
    level: "Débutant" as const,
    students: 118,
    rating: 5.0,
    image: coursePython,
  },
  {
    title: "Guide du Débutant: Gestion d'Entreprise et Analyse",
    instructor: "Sophie Martin",
    level: "Débutant" as const,
    students: 234,
    rating: 4.8,
    image: courseBusiness,
  },
];

const savedBlogs = [
  {
    id: "1",
    title: "10 astuces pour améliorer votre productivité",
    author: "Thomas Bernard",
    date: "15 Mars 2024",
    category: "Productivité",
    excerpt: "Découvrez les meilleures techniques pour optimiser votre temps et atteindre vos objectifs plus rapidement.",
  },
  {
    id: "2",
    title: "L'avenir de l'intelligence artificielle dans l'éducation",
    author: "Sophie Martin",
    date: "10 Mars 2024",
    category: "IA & Éducation",
    excerpt: "Comment l'IA transforme-t-elle les méthodes d'apprentissage et quel impact aura-t-elle sur l'avenir ?",
  },
];

const savedForumPosts = [
  {
    id: "1",
    title: "Comment intégrer l'IA dans un projet de data science ?",
    author: "Jean Dupont",
    category: "IA & Machine Learning",
    comments: 18,
  },
  {
    id: "2",
    title: "Ressources pour débutants en Python",
    author: "Marie Dubois",
    category: "Programmation",
    comments: 34,
  },
];

export default function SavedContent() {
  const [activeTab, setActiveTab] = useState("courses");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contenu Sauvegardé</h1>
          <p className="text-muted-foreground mt-1">Retrouvez tous vos contenus favoris</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted">
            <TabsTrigger value="courses">Cours</TabsTrigger>
            <TabsTrigger value="blogs">Articles de Blog</TabsTrigger>
            <TabsTrigger value="forums">Posts du Forum</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCourses.map((course, index) => (
                <CourseCard key={index} {...course} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blogs" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedBlogs.map((blog) => (
                <Card key={blog.id} className="p-6 border-border bg-card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {blog.category}
                    </Badge>
                    <Bookmark className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {blog.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {blog.date}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forums" className="mt-6">
            <div className="space-y-4">
              {savedForumPosts.map((post) => (
                <Card key={post.id} className="p-6 border-border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {post.category}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Par {post.author}</span>
                        <span>•</span>
                        <span>{post.comments} commentaires</span>
                      </div>
                    </div>
                    <Bookmark className="w-4 h-4 text-primary fill-primary" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
