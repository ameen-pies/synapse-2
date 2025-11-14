import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Share2, Flag, Bookmark, X, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timeAgo: string;
}

interface ForumPost {
  id: string;
  author: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  timeAgo: string;
  isSaved: boolean;
  userVote?: "up" | "down" | null;
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
    comments: [],
    timeAgo: "il y a 2h",
    isSaved: false,
    userVote: null,
  },
  {
    id: "2",
    author: "Thomas Bernard",
    title: "Ressources pour débutants en Python",
    content: "Je compile une liste de ressources pour apprendre Python. N'hésitez pas à partager vos recommandations !",
    category: "Programmation",
    upvotes: 89,
    downvotes: 1,
    comments: [],
    timeAgo: "il y a 5h",
    isSaved: false,
    userVote: null,
  },
  {
    id: "3",
    author: "Marie Dubois",
    title: "Stratégies de révision pour les examens",
    content: "Quelles sont vos meilleures stratégies pour réviser efficacement ? Je prépare mes examens et j'ai besoin de conseils.",
    category: "Méthodes d'apprentissage",
    upvotes: 67,
    downvotes: 2,
    comments: [],
    timeAgo: "il y a 1j",
    isSaved: false,
    userVote: null,
  },
  {
    id: "4",
    author: "Jean Dupont",
    title: "Débat: L'avenir des métiers avec l'IA",
    content: "Pensez-vous que l'IA va remplacer la plupart des emplois ou créer de nouvelles opportunités ?",
    category: "Discussions",
    upvotes: 156,
    downvotes: 12,
    comments: [],
    timeAgo: "il y a 2j",
    isSaved: false,
    userVote: null,
  },
];

const CATEGORIES = [
  "IA & Machine Learning",
  "Programmation",
  "Méthodes d'apprentissage",
  "Discussions",
  "Aide & Support",
  "Projets",
  "Autre"
];

const REPORT_REASONS = [
  "Contenu inapproprié",
  "Spam ou publicité",
  "Harcèlement",
  "Fausses informations",
  "Violation des règles",
  "Autre"
];

export default function Community() {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const { toast } = useToast();

  const currentUser = localStorage.getItem('userName') || "Utilisateur";

  const handleVote = (postId: string, type: "up" | "down") => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;
        let newUserVote: "up" | "down" | null = type;

        // If user already voted this way, remove vote
        if (post.userVote === type) {
          if (type === "up") newUpvotes--;
          else newDownvotes--;
          newUserVote = null;
        }
        // If user voted opposite way, switch vote
        else if (post.userVote) {
          if (post.userVote === "up") {
            newUpvotes--;
            newDownvotes++;
          } else {
            newDownvotes--;
            newUpvotes++;
          }
        }
        // New vote
        else {
          if (type === "up") newUpvotes++;
          else newDownvotes++;
        }

        return {
          ...post,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote,
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

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }

    const newPost: ForumPost = {
      id: Date.now().toString(),
      author: currentUser,
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      timeAgo: "à l'instant",
      isSaved: false,
      userVote: null,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostCategory("");
    setShowNewPostForm(false);
    
    toast({
      title: "Post publié! 🎉",
      description: "Votre post a été publié avec succès.",
    });
  };

  const handleAddComment = (postId: string) => {
    if (!commentContent.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: currentUser,
          content: commentContent,
          timeAgo: "à l'instant",
        };
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      }
      return post;
    }));

    setCommentContent("");
    setCommentingPostId(null);
    
    toast({
      title: "Commentaire ajouté",
      description: "Votre commentaire a été publié.",
    });
  };

  const handleReport = () => {
    if (!reportReason) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une raison.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Signalement envoyé",
      description: "Merci d'avoir signalé ce contenu. Notre équipe va l'examiner.",
    });

    setReportPostId(null);
    setReportReason("");
    setReportDetails("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Forum & Communauté</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Partagez et discutez avec la communauté Synapse</p>
          </div>
          <Button 
            onClick={() => setShowNewPostForm(!showNewPostForm)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            {showNewPostForm ? "Annuler" : "Nouveau Post"}
          </Button>
        </div>

        {/* New Post Form */}
        {showNewPostForm && (
          <Card className="p-4 sm:p-6 border-border bg-card">
            <h2 className="text-lg font-semibold mb-4">Créer un nouveau post</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  placeholder="Un titre accrocheur pour votre post..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  placeholder="Partagez vos idées avec la communauté..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowNewPostForm(false);
                    setNewPostTitle("");
                    setNewPostContent("");
                    setNewPostCategory("");
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Publier
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Forum Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4 sm:p-6 border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex gap-3 sm:gap-4">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-1 sm:gap-2 pt-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(post.id, "up")}
                    className={`h-7 w-7 sm:h-8 sm:w-8 ${
                      post.userVote === "up" 
                        ? "text-success bg-success/10" 
                        : "hover:text-success hover:bg-success/10"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    {post.upvotes - post.downvotes}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(post.id, "down")}
                    className={`h-7 w-7 sm:h-8 sm:w-8 ${
                      post.userVote === "down" 
                        ? "text-destructive bg-destructive/10" 
                        : "hover:text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Avatar className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {post.author.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">{post.author}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                        <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {post.category}
                        </Badge>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 break-words">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm break-words">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 pt-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                      className="text-muted-foreground hover:text-foreground h-8 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {post.comments.length}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground h-8 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Partager</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave(post.id)}
                      className={`h-8 text-xs sm:text-sm px-2 sm:px-3 ${
                        post.isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Bookmark className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${post.isSaved ? "fill-primary" : ""}`} />
                      <span className="hidden sm:inline">{post.isSaved ? "Sauvegardé" : "Sauvegarder"}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReportPostId(post.id)}
                      className="text-muted-foreground hover:text-destructive ml-auto h-8 px-2"
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 space-y-3 pl-0 sm:pl-4 border-l-2 border-border">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="pl-3 sm:pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="w-4 h-4 sm:w-5 sm:h-5">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {comment.author.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs sm:text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground ml-6 sm:ml-7 break-words">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  {commentingPostId === post.id && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        placeholder="Ajouter un commentaire..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentContent.trim()}
                        className="flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Report Dialog */}
        <Dialog open={!!reportPostId} onOpenChange={() => setReportPostId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Signaler ce post</DialogTitle>
              <DialogDescription>
                Aidez-nous à maintenir une communauté saine en signalant les contenus inappropriés.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Raison du signalement *</Label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Détails supplémentaires (optionnel)</Label>
                <Textarea
                  id="details"
                  placeholder="Donnez plus d'informations sur ce signalement..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReportPostId(null);
                  setReportReason("");
                  setReportDetails("");
                }}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                onClick={handleReport}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Envoyer le signalement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}