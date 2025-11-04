import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Share2, Flag, Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ForumPost {
  id: string;
  author: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timeAgo: string;
  isSaved: boolean;
}

const initialPosts: ForumPost[] = [
  {
    id: "1",
    author: "Sophie Martin",
    title: "Comment intégrer l'IA dans un projet de data science ?",
    content: "Je cherche des conseils sur l'intégration de modèles d'IA dans mes projets de data science. Quelles sont les meilleures pratiques ?",
    category: "IA & Machine Learning",
    upvotes: 42,
    downvotes: 3,
    comments: 18,
    timeAgo: "il y a 2h",
    isSaved: false,
  },
  {
    id: "2",
    author: "Thomas Bernard",
    title: "Ressources pour débutants en Python",
    content: "Je compile une liste de ressources pour apprendre Python. N'hésitez pas à partager vos recommandations !",
    category: "Programmation",
    upvotes: 89,
    downvotes: 1,
    comments: 34,
    timeAgo: "il y a 5h",
    isSaved: false,
  },
  {
    id: "3",
    author: "Marie Dubois",
    title: "Stratégies de révision pour les examens",
    content: "Quelles sont vos meilleures stratégies pour réviser efficacement ? Je prépare mes examens et j'ai besoin de conseils.",
    category: "Méthodes d'apprentissage",
    upvotes: 67,
    downvotes: 2,
    comments: 25,
    timeAgo: "il y a 1j",
    isSaved: false,
  },
  {
    id: "4",
    author: "Jean Dupont",
    title: "Débat: L'avenir des métiers avec l'IA",
    content: "Pensez-vous que l'IA va remplacer la plupart des emplois ou créer de nouvelles opportunités ?",
    category: "Discussions",
    upvotes: 156,
    downvotes: 12,
    comments: 78,
    timeAgo: "il y a 2j",
    isSaved: false,
  },
];

export default function Community() {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const { toast } = useToast();

  const handleVote = (postId: string, type: "up" | "down") => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          upvotes: type === "up" ? post.upvotes + 1 : post.upvotes,
          downvotes: type === "down" ? post.downvotes + 1 : post.downvotes,
        };
      }
      return post;
    }));
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        toast({
          title: post.isSaved ? "Post retiré des favoris" : "Post sauvegardé",
          description: post.isSaved ? "Le post a été retiré de vos favoris." : "Le post a été ajouté à vos favoris.",
        });
        return { ...post, isSaved: !post.isSaved };
      }
      return post;
    }));
  };

  const handleReport = (postId: string) => {
    toast({
      title: "Signalement envoyé",
      description: "Merci d'avoir signalé ce contenu. Notre équipe va l'examiner.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Forum & Communauté</h1>
            <p className="text-muted-foreground mt-1">Partagez et discutez avec la communauté Synapse</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Nouveau Post
          </Button>
        </div>

        {/* New Post Card */}
        <Card className="p-4 border-border bg-card">
          <Textarea
            placeholder="Partagez vos idées avec la communauté..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[100px] resize-none border-input bg-background"
          />
          <div className="flex justify-end mt-3">
            <Button 
              onClick={() => {
                if (newPostContent.trim()) {
                  toast({
                    title: "Post publié",
                    description: "Votre post a été publié avec succès.",
                  });
                  setNewPostContent("");
                }
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Publier
            </Button>
          </div>
        </Card>

        {/* Forum Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6 border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2 pt-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(post.id, "up")}
                    className="h-8 w-8 hover:text-success hover:bg-success/10"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-semibold text-foreground">
                    {post.upvotes - post.downvotes}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(post.id, "down")}
                    className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {post.author.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{post.author}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {post.category}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments} commentaires
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Partager
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave(post.id)}
                      className={post.isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                    >
                      <Bookmark className={`w-4 h-4 mr-1 ${post.isSaved ? "fill-primary" : ""}`} />
                      {post.isSaved ? "Sauvegardé" : "Sauvegarder"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReport(post.id)}
                      className="text-muted-foreground hover:text-destructive ml-auto"
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
