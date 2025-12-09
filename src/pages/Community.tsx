
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare, ThumbsUp, ThumbsDown, Share2, Flag, Bookmark, BookmarkPlus, Send, Loader2, ArrowLeft, Trash2, ChevronDown, ChevronUp, Reply, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Reply {
  _id?: string;
  userId?: string;
  userName: string;
  content: string;
  likes?: number;
  likedBy?: string[];
  createdAt: string;
}

interface Comment {
  _id?: string;
  userId?: string;
  userName: string;
  content: string;
  likes?: number;
  likedBy?: string[];
  replies: Reply[];
  createdAt: string;
}

interface ForumPost {
  _id: string;
  title: string;
  description: string;
  labels?: string[];
  tags?: string[];
  upvotes?: number;
  downvotes?: number;
  views?: number;
  replies?: number;
  comments?: Comment[];
  ownerId?: string;
  userName?: string;
  voters?: Array<{ userId: string; vote: string }>;
}

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
  const navigate = useNavigate();
  const { id } = useParams();
  const isDetail = !!id;
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [replyingToComment, setReplyingToComment] = useState<{postId: string, commentId?: string, commentIndex?: number} | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const { toast } = useToast();

  const currentUser = localStorage.getItem('userName') || "Utilisateur";
  const currentUserId = localStorage.getItem('userId') || "";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadForums();
    loadSavedPosts();
  }, [id]);

  const loadSavedPosts = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const saved = JSON.parse(localStorage.getItem(`savedForums_${userId}`) || '[]');
      setSavedPosts(saved);
    }
  };

  const loadForums = async () => {
    setLoading(true);
    try {
      const url = id
        ? `http://localhost:5000/api/forums/${id}`
        : "http://localhost:5000/api/forums";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(id ? [data] : data);
      }
    } catch (err) {
      console.error("Error loading forums:", err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les discussions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, type: "up" | "down") => {
    const userId = localStorage.getItem('userId') || undefined;
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vote: type }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => p._id === postId ? data.forum : p));
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  const handleSavePost = (postId: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour sauvegarder des discussions",
        variant: "destructive"
      });
      return;
    }

    const storageKey = `savedForums_${userId}`;
    let saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (saved.includes(postId)) {
      saved = saved.filter((id: string) => id !== postId);
      toast({
        title: "Retiré des favoris",
        description: "La discussion a été retirée de vos favoris"
      });
    } else {
      saved.push(postId);
      toast({
        title: "Ajouté aux favoris",
        description: "La discussion a été ajoutée à vos favoris"
      });
    }
    
    localStorage.setItem(storageKey, JSON.stringify(saved));
    setSavedPosts(saved);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }

    try {
      const userId = currentUserId || undefined;
      const userName = currentUser;
      const res = await fetch("http://localhost:5000/api/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle,
          description: newPostContent,
          labels: [newPostCategory],
          tags: [newPostCategory],
          userId,
          userName,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setPosts([created, ...posts]);
        setNewPostTitle("");
        setNewPostContent("");
        setNewPostCategory("");
        setShowNewPostForm(false);

        toast({
          title: "Post publié! 🎉",
          description: "Votre post a été publié avec succès.",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer le post.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Create forum error:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentContent.trim()) return;

    const userId = localStorage.getItem('userId') || undefined;
    const userName = currentUser;

    try {
      const res = await fetch(`http://localhost:5000/api/forums/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName, content: commentContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => (post._id === postId ? data.forum : post)));
        setCommentContent("");
        setCommentingPostId(null);

        toast({
          title: "Commentaire ajouté",
          description: "Votre commentaire a été publié.",
        });
      }
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  const handleAddReply = async (postId: string, commentId?: string, commentIndex?: number) => {
    if (!replyContent.trim()) return;

    const userId = localStorage.getItem('userId') || undefined;
    const userName = currentUser;

    try {
      const res = await fetch(`http://localhost:5000/api/forums/${postId}/comments/${commentId || commentIndex}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName, content: replyContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => (post._id === postId ? data.forum : post)));
        setReplyContent("");
        setReplyingToComment(null);
        
        // Expand the comment to show replies
        if (commentId) {
          setExpandedComments(prev => new Set(prev).add(commentId));
        }

        toast({
          title: "Réponse ajoutée",
          description: "Votre réponse a été publiée.",
        });
      }
    } catch (err) {
      console.error("Add reply error:", err);
    }
  };

  const handleLikeComment = async (postId: string, commentIndex: number) => {
    const userId = localStorage.getItem("userId") || undefined;
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${postId}/comments/${commentIndex}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => (post._id === postId ? data.forum : post)));
      }
    } catch (err) {
      console.error("Like comment error:", err);
    }
  };

  const handleLikeReply = async (postId: string, commentIndex: number, replyId: string) => {
    const userId = localStorage.getItem("userId") || undefined;
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${postId}/comments/${commentIndex}/replies/${replyId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => (post._id === postId ? data.forum : post)));
      }
    } catch (err) {
      console.error("Like reply error:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (res.ok) {
        if (isDetail) {
          navigate("/community");
        }
        setPosts(posts.filter(p => p._id !== postId));
        toast({
          title: "Discussion supprimée",
          description: "Votre discussion a été supprimée.",
        });
      } else {
        toast({
          title: "Impossible de supprimer",
          description: "Vous n'êtes pas autorisé à supprimer cette discussion.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Delete forum error:", err);
    }
  };

  const handleDeleteComment = async (postId: string, index: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${postId}/comments/${index}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => (post._id === postId ? data.forum : post)));
      } else {
        toast({
          title: "Impossible de supprimer",
          description: "Vous n'êtes pas autorisé à supprimer ce commentaire.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  const handleDeleteReply = async (postId: string, commentIndex: number, replyId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${postId}/comments/${commentIndex}/replies/${replyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => (post._id === postId ? data.forum : post)));
      } else {
        toast({
          title: "Impossible de supprimer",
          description: "Vous n'êtes pas autorisé à supprimer cette réponse.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Delete reply error:", err);
    }
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

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const allLabels = Array.from(
    new Set(
      posts
        .flatMap((p) => p.labels || [])
        .filter((l: string) => Boolean(l?.trim()))
    )
  ).sort();

  const visiblePosts =
    isDetail || selectedCategory === "all"
      ? posts
      : posts.filter((p) => (p.labels || []).includes(selectedCategory));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isDetail && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate("/community")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isDetail ? "Discussion" : "Forum & Communauté"}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {isDetail
                  ? "Explorez la discussion et participez à la conversation."
                  : "Partagez et discutez avec la communauté Synapse"}
              </p>
            </div>
          </div>
          {!isDetail && (
            <Button 
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              {showNewPostForm ? "Annuler" : "Nouveau Post"}
            </Button>
          )}
        </div>

        {!isDetail && allLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              Toutes les discussions
            </Button>
            {allLabels.map((label) => (
              <Button
                key={label}
                size="sm"
                variant={selectedCategory === label ? "default" : "outline"}
                onClick={() => setSelectedCategory(label)}
                className="rounded-full text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        )}

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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {visiblePosts.map((post) => {
              const isOwner = !!post.ownerId && post.ownerId === currentUserId;
              const commentsWithIndex = (post.comments || []).map((c, idx) => ({
                comment: c as any,
                index: idx,
              }));

              const sortedComments = [...commentsWithIndex].sort((a, b) => {
                const aLikes = (a.comment.likes || 0) as number;
                const bLikes = (b.comment.likes || 0) as number;
                if (bLikes !== aLikes) return bLikes - aLikes;
                const aDate = a.comment.createdAt ? new Date(a.comment.createdAt) : new Date(0);
                const bDate = b.comment.createdAt ? new Date(b.comment.createdAt) : new Date(0);
                return bDate.getTime() - aDate.getTime();
              });

              const topComment = sortedComments[0]?.comment;
              const isSaved = savedPosts.includes(post._id);

              return (
                <Card
                  key={post._id}
                  className="p-4 sm:p-6 border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (!isDetail) {
                      navigate(`/community/${post._id}`);
                    }
                  }}
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-1 sm:gap-2 pt-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(post._id, "up");
                        }}
                        className={`h-7 w-7 sm:h-8 sm:w-8 hover:text-success hover:bg-success/10 ${
                          post.voters?.some((v: any) => v.userId === currentUserId && v.vote === 'up') 
                            ? 'text-success bg-success/10' 
                            : ''
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          post.voters?.some((v: any) => v.userId === currentUserId && v.vote === 'up') 
                            ? 'fill-current' 
                            : ''
                        }`} />
                      </Button>
                      <span className="text-xs sm:text-sm font-semibold text-foreground">
                        {(post.upvotes || 0) - (post.downvotes || 0)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(post._id, "down");
                        }}
                        className={`h-7 w-7 sm:h-8 sm:w-8 hover:text-destructive hover:bg-destructive/10 ${
                          post.voters?.some((v: any) => v.userId === currentUserId && v.vote === 'down') 
                            ? 'text-destructive bg-destructive/10' 
                            : ''
                        }`}
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          post.voters?.some((v: any) => v.userId === currentUserId && v.vote === 'down') 
                            ? 'fill-current' 
                            : ''
                        }`} />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {post.labels && post.labels.length > 0 && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                {post.labels[0]}
                              </Badge>
                            )}
                            {post.tags && post.tags[1] && (
                              <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                                {post.tags[1]}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {post.replies || 0} réponses • {post.views || 0} vues
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 break-words">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground text-xs sm:text-sm break-words">
                            {post.description}
                          </p>
                          {!isDetail && topComment && (
                            <div className="mt-3 rounded-md bg-muted/40 border border-border px-3 py-2">
                              <p className="text-[11px] text-muted-foreground font-medium mb-1">
                                Meilleur commentaire
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {topComment.content}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 sm:gap-2 pt-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (!isDetail) {
                              navigate(`/community/${post._id}`);
                            } else {
                              setCommentingPostId(commentingPostId === post._id ? null : post._id);
                            }
                          }}
                          className="text-muted-foreground hover:text-foreground h-8 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {(post.comments || []).length}
                        </Button>
                        <div className="ml-auto flex items-center gap-1 sm:gap-2">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSavePost(post._id);
                            }}
                            className={`h-8 px-2 ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            {isSaved ? (
                              <Bookmark className="w-3 h-3 fill-current" />
                            ) : (
                              <BookmarkPlus className="w-3 h-3" />
                            )}
                          </Button>
                          {isOwner && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive h-8 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post._id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReportPostId(post._id);
                            }}
                            className="text-muted-foreground hover:text-destructive h-8 px-2"
                          >
                            <Flag className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {isDetail && sortedComments.length > 0 && (
                        <div className="mt-4 space-y-3 pl-0 sm:pl-4 border-l-2 border-border">
                          {sortedComments.map(({ comment, index }) => {
                            const isCommentOwner = !!comment.userId && comment.userId === currentUserId;
                            const commentReplies = comment.replies || [];
                            const isExpanded = expandedComments.has(comment._id || index.toString());
                            const showReplyInput = replyingToComment?.postId === post._id && 
                              (replyingToComment?.commentId === comment._id || replyingToComment?.commentIndex === index);

                            return (
                              <div key={comment._id || index} className="pl-3 sm:pl-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="w-4 h-4 sm:w-5 sm:h-5">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {comment.userName.split(" ").map((n: string) => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-medium">{comment.userName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString("fr-FR") : ""}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleLikeComment(post._id, index);
                                      }}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <span className="text-[11px] text-muted-foreground">
                                      {comment.likes || 0}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs text-muted-foreground hover:text-primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReplyingToComment({ 
                                          postId: post._id, 
                                          commentId: comment._id,
                                          commentIndex: index 
                                        });
                                        setReplyContent("");
                                      }}
                                    >
                                      <Reply className="h-3 w-3 mr-1" />
                                      Répondre
                                    </Button>
                                    {commentReplies.length > 0 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-muted-foreground hover:text-primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleCommentExpansion(comment._id || index.toString());
                                        }}
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3 w-3 mr-1" />
                                            Masquer {commentReplies.length} réponse{commentReplies.length > 1 ? 's' : ''}
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3 w-3 mr-1" />
                                            Voir {commentReplies.length} réponse{commentReplies.length > 1 ? 's' : ''}
                                          </>
                                        )}
                                      </Button>
                                    )}
                                    {(isCommentOwner || isOwner) && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                          >
                                            <MoreVertical className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteComment(post._id, index);
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3 mr-2" />
                                            Supprimer
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground ml-6 sm:ml-7 break-words">
                                  {comment.content}
                                </p>

                                {/* Reply Input */}
                                {showReplyInput && (
                                  <div className="ml-6 sm:ml-7 mt-3 flex gap-2">
                                    <Input
                                      placeholder="Votre réponse..."
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          handleAddReply(post._id, comment._id, index);
                                        }
                                      }}
                                      className="flex-1 text-sm"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddReply(post._id, comment._id, index)}
                                      disabled={!replyContent.trim()}
                                      className="flex-shrink-0"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}

                                {/* Replies */}
                                {isExpanded && commentReplies.length > 0 && (
                                  <div className="ml-6 sm:ml-10 mt-3 space-y-3 border-l-2 border-border pl-3">
                                    {commentReplies.map((reply: Reply) => {
                                      const isReplyOwner = !!reply.userId && reply.userId === currentUserId;
                                      return (
                                        <div key={reply._id} className="relative">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Avatar className="w-4 h-4 sm:w-5 sm:h-5">
                                              <AvatarFallback className="bg-secondary/10 text-secondary text-xs">
                                                {reply.userName.split(" ").map((n: string) => n[0]).join("")}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs sm:text-sm font-medium">{reply.userName}</span>
                                              <span className="text-xs text-muted-foreground">
                                                {reply.createdAt ? new Date(reply.createdAt).toLocaleString("fr-FR") : ""}
                                              </span>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-muted-foreground hover:text-primary"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleLikeReply(post._id, index, reply._id!);
                                                }}
                                              >
                                                <ThumbsUp className="h-2.5 w-2.5" />
                                              </Button>
                                              <span className="text-[10px] text-muted-foreground">
                                                {reply.likes || 0}
                                              </span>
                                              {(isReplyOwner || isOwner) && (
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                                    >
                                                      <MoreVertical className="h-2.5 w-2.5" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                      className="text-destructive focus:text-destructive"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteReply(post._id, index, reply._id!);
                                                      }}
                                                    >
                                                      <Trash2 className="h-3 w-3 mr-2" />
                                                      Supprimer
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-xs sm:text-sm text-muted-foreground ml-6 sm:ml-7 break-words">
                                            {reply.content}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Comment Input */}
                      {isDetail && commentingPostId === post._id && (
                        <div className="mt-3 flex gap-2">
                          <Input
                            placeholder="Ajouter un commentaire..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post._id);
                              }
                            }}
                            className="flex-1 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post._id)}
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
              );
            })}
          </div>
        )}

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
