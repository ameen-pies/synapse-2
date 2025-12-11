import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, ThumbsUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReportForm from "@/components/ReportForm";

interface ForumComment {
  _id?: string;
  userId?: string;
  userName: string;
  content: string;
  createdAt: any;
  likes?: number;
  likedBy?: string[];
}

interface ForumData {
  _id: string;
  title: string;
  description: string;
  labels?: string[];
  comments?: ForumComment[];
}

export default function ForumDetail() {
  const { id } = useParams();
  const [forum, setForum] = useState<ForumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadForum();
  }, [id]);

  const loadForum = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForum(data);
      } else {
        toast.error("Discussion introuvable");
      }
    } catch (err) {
      console.error("Error loading forum:", err);
      toast.error("Erreur lors du chargement de la discussion");
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim() || !id) return;

    const userName = localStorage.getItem("userName") || "Utilisateur";
    const userId = localStorage.getItem("userId") || undefined;

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName, content: comment }),
      });

      if (res.ok) {
        const data = await res.json();
        setForum(data.forum);
        setComment("");
        toast.success("Commentaire publié !");
      } else {
        toast.error("Erreur lors de l'envoi du commentaire");
      }
    } catch (err) {
      console.error("Post comment error:", err);
      toast.error("Erreur lors de l'envoi du commentaire");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ SAFE LIKE CHECK
  const hasUserLikedComment = (comment: ForumComment): boolean => {
    if (!userId || !comment.likedBy) return false;
    return comment.likedBy.map(String).includes(String(userId));
  };

  // ✅ OPTIMISTIC LIKE HANDLER (INSTANT UX)
  const handleLikeComment = async (commentId: string) => {
    if (!userId || !forum) {
      toast.error("Veuillez vous connecter pour liker un commentaire");
      return;
    }

    setForum((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        comments: prev.comments?.map((c) => {
          if (c._id !== commentId) return c;

          const alreadyLiked = c.likedBy?.includes(userId);

          return {
            ...c,
            likes: alreadyLiked ? (c.likes || 1) - 1 : (c.likes || 0) + 1,
            likedBy: alreadyLiked
              ? c.likedBy?.filter((id) => id !== userId)
              : [...(c.likedBy || []), userId],
          };
        }),
      };
    });

    setLikingCommentId(commentId);

    try {
      await fetch(
        `http://localhost:5000/api/forums/${id}/comments/${commentId}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setLikingCommentId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Discussion non trouvée
      </div>
    );
  }

  const comments: ForumComment[] = forum.comments || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
        <div className="relative">
          {forum.labels && forum.labels.length > 0 && (
            <Badge variant="secondary" className="mb-2">
              {forum.labels[0]}
            </Badge>
          )}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{forum.title}</h1>
              <p className="text-muted-foreground">{forum.description}</p>
            </div>
            
            {/* Report Button for Forum */}
            <ReportForm
              contentId={forum._id}
              contentType="forum"
              contentTitle={forum.title}
              trigger={
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Signaler
                </Button>
              }
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Commentaires ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Textarea
                placeholder="Partagez votre réponse..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
              />
              <Button onClick={handlePostComment} disabled={!comment.trim() || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "Publier le commentaire"
                )}
              </Button>
            </div>

            {comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((comment, idx) => {
                  const isLiked = hasUserLikedComment(comment);
                  const likesCount =
                    typeof comment.likes === "number"
                      ? comment.likes
                      : comment.likedBy?.length || 0;

                  const dateValue =
                    comment.createdAt?.$date || comment.createdAt;

                  const likeButtonClasses = `h-8 px-2 gap-1 transition-all duration-200 
                    ${
                      isLiked
                        ? "text-green-600 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900/50 dark:hover:bg-green-900"
                        : "text-muted-foreground hover:bg-muted"
                    }`;

                  return (
                    <div key={comment._id || idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{comment.userName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {dateValue
                            ? new Date(dateValue).toLocaleString("fr-FR")
                            : ""}
                        </span>
                      </div>

                      <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
                        {comment.content}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={likeButtonClasses}
                          onClick={() => comment._id && handleLikeComment(comment._id)}
                          disabled={likingCommentId === comment._id}
                        >
                          {likingCommentId === comment._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ThumbsUp
                              className={`h-3.5 w-3.5 transition-all ${
                                isLiked
                                  ? "text-green-600 fill-green-600 dark:text-green-400 dark:fill-green-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          )}
                          <span className="text-xs">{likesCount}</span>
                        </Button>

                        {isLiked && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Vous aimez
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Soyez le premier à commenter cette discussion</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}