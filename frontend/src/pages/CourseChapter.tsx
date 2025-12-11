import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, FileText, StickyNote, CheckCircle2, Loader2, MessageSquare, ArrowLeft, Award } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function CourseChapter() {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<any>(null);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [videoWatched, setVideoWatched] = useState(false);
  const [totalChapters, setTotalChapters] = useState(0);
  const hasShownToast = useRef(false);
  
  // Activity tracking
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const progressCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const componentMountedRef = useRef(true);

  // Reset state when chapter changes
  useEffect(() => {
    console.log('🔄 Chapter changed to:', chapterId);
    componentMountedRef.current = true;
    hasShownToast.current = false;
    
    if (progressCheckInterval.current) {
      clearInterval(progressCheckInterval.current);
      progressCheckInterval.current = null;
    }
    
    return () => {
      componentMountedRef.current = false;
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current);
      }
    };
  }, [chapterId]);

  // Load YouTube IFrame API once globally
  useEffect(() => {
    if (!window.YT) {
      console.log('📺 Loading YouTube IFrame API...');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    loadChapterData();
    startActivityTracking();
    
    return () => {
      stopActivityTracking();
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, [courseId, chapterId]);

  // Initialize YouTube Player when chapter loads
  useEffect(() => {
    if (!chapter || loading || !chapter.isYouTube || !componentMountedRef.current) return;
    
    console.log('🎬 Initializing YouTube player for:', chapter.videoUrl);
    
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        console.log('⏳ Waiting for YouTube API...');
        setTimeout(initPlayer, 100);
        return;
      }
      
      if (!componentMountedRef.current) return;
      
      // Extract video ID
      let videoId = '';
      const url = chapter.videoUrl;
      
      if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0].split('&')[0];
      } else if (url.includes('youtube.com/watch?v=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
      }
      
      if (!videoId) {
        console.error('❌ Could not extract video ID from:', url);
        return;
      }
      
      console.log('🎥 Creating player with video ID:', videoId);
      
      try {
        const container = document.getElementById(`youtube-player-${chapterId}`);
        if (!container) {
          console.error('❌ Container not found');
          return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Create player
        youtubePlayerRef.current = new window.YT.Player(`youtube-player-${chapterId}`, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
          }
        });
        
        console.log('✅ YouTube player created successfully');
      } catch (error) {
        console.error('❌ Error creating player:', error);
      }
    };
    
    // Start initialization
    initPlayer();
    
    return () => {
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {
          console.log('Player cleanup error:', e);
        }
        youtubePlayerRef.current = null;
      }
      
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current);
        progressCheckInterval.current = null;
      }
    };
  }, [chapter, loading]);

  const onPlayerReady = (event: any) => {
    console.log('✅ YouTube player ready!');
    
    // Clear any existing interval
    if (progressCheckInterval.current) {
      clearInterval(progressCheckInterval.current);
    }
    
    // Check progress every 2 seconds
    progressCheckInterval.current = setInterval(() => {
      if (!componentMountedRef.current || !youtubePlayerRef.current) {
        if (progressCheckInterval.current) {
          clearInterval(progressCheckInterval.current);
        }
        return;
      }
      
      // Don't check if already completed or watched
      if (videoWatched || isCompleted || hasShownToast.current) {
        return;
      }
      
      try {
        const currentTime = youtubePlayerRef.current.getCurrentTime();
        const duration = youtubePlayerRef.current.getDuration();
        
        if (duration > 0 && currentTime > 0) {
          const progress = currentTime / duration;
          console.log(`📊 YouTube progress: ${(progress * 100).toFixed(1)}% (${currentTime.toFixed(0)}s / ${duration.toFixed(0)}s)`);
          
          if (progress >= 0.85) {
            console.log('🎉 85% threshold reached!');
            handleVideoComplete();
          }
        }
      } catch (error) {
        // Player might not be ready
        console.log('⚠️ Error checking progress:', error);
      }
    }, 2000);
  };

  const onPlayerStateChange = (event: any) => {
    const states: any = {
      '-1': 'unstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'cued'
    };
    
    console.log(`🎬 YouTube state changed: ${states[event.data]} (${event.data})`);
    
    // 0 = ended
    if (event.data === 0) {
      console.log('🏁 YouTube video ENDED!');
      if (!hasShownToast.current && !videoWatched && !isCompleted && componentMountedRef.current) {
        handleVideoComplete();
      }
    }
  };

  // Regular video (non-YouTube) detection
  useEffect(() => {
    const video = videoRef.current;
    if (loading || !video || chapter?.isYouTube) return;
    
    console.log('🎥 Setting up regular video listeners');
    
    const handleProgress = () => {
      if (!componentMountedRef.current || videoWatched || isCompleted || hasShownToast.current) {
        return;
      }
      
      if (video.duration && !isNaN(video.duration)) {
        const progress = video.currentTime / video.duration;
        if (progress >= 0.85) {
          console.log('🎉 Regular video 85% threshold reached!');
          handleVideoComplete();
        }
      }
    };
    
    const handleEnded = () => {
      console.log('🏁 Regular video ENDED!');
      if (!hasShownToast.current && !videoWatched && !isCompleted && componentMountedRef.current) {
        handleVideoComplete();
      }
    };
    
    const handleLoadedMetadata = () => {
      console.log('📹 Video metadata loaded, duration:', video.duration);
    };
    
    video.addEventListener('timeupdate', handleProgress);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      video.removeEventListener('timeupdate', handleProgress);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [chapter, loading, videoWatched, isCompleted]);

  const handleVideoComplete = () => {
    if (!componentMountedRef.current) return;
    
    console.log('🎯 handleVideoComplete called:', {
      videoWatched,
      isCompleted,
      hasShownToast: hasShownToast.current
    });
    
    if (!videoWatched && !isCompleted && !hasShownToast.current) {
      console.log('✅ Marking video as watched!');
      hasShownToast.current = true;
      setVideoWatched(true);
      toast.success("Vidéo terminée! Vous pouvez continuer.", {
        icon: "✅",
        duration: 4000
      });
    }
  };

  const startActivityTracking = () => {
    setSessionStartTime(Date.now());
    activityIntervalRef.current = setInterval(() => {
      trackActivity('continued', 2);
    }, 2 * 60 * 1000);
  };

  const stopActivityTracking = () => {
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
      activityIntervalRef.current = null;
    }
    
    if (sessionStartTime) {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 60000);
      if (timeSpent > 0) {
        trackActivity('paused', timeSpent);
      }
    }
  };

  const trackActivity = async (action: string, timeSpent: number) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !chapter) return;
    
    try {
      await fetch('http://localhost:5000/api/userdata/track-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          chapterId,
          chapterTitle: chapter.title,
          timeSpent,
          action
        })
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const loadChapterData = async () => {
    setLoading(true);
    setVideoWatched(false);
    hasShownToast.current = false;
    
    try {
      const courseResponse = await fetch(`http://localhost:5000/api/courses/${courseId}`);
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourseName(courseData.title);
        setTotalChapters(courseData.chapters?.length || 0);
        
        let chapterData = courseData.chapters?.find((c: any) => c.id?.toString() === chapterId);
        
        if (!chapterData && courseData.chapters && courseData.chapters.length > 0) {
          const index = Number(chapterId) - 1;
          if (index >= 0 && index < courseData.chapters.length) {
            chapterData = { id: chapterId, ...courseData.chapters[index] };
          }
        }
        
        if (!chapterData) {
          chapterData = {
            id: chapterId,
            title: courseData.title,
            duration: courseData.duration_hours ? `${courseData.duration_hours}h` : "45 min",
          };
        }
        
        if (chapterData) {
          const rawYoutube = 
            chapterData.youtube_url || 
            courseData.youtube_url || 
            chapterData.youtubeUrl || 
            courseData.youtubeUrl;
            
          const toYoutubeEmbed = (url: string) => {
            if (!url) return "";
            if (url.includes("youtube.com/watch")) {
              const videoId = new URL(url).searchParams.get("v");
              return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
            }
            if (url.includes("youtu.be/")) {
              const idPart = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
              return idPart ? `https://www.youtube.com/embed/${idPart}` : url;
            }
            return url;
          };
          
          const youtubeEmbed = rawYoutube ? toYoutubeEmbed(rawYoutube) : null;
          const currentChapterNum = parseInt(chapterId!);
          const totalChapters = courseData.chapters?.length || 0;
          
          setChapter({
            ...chapterData,
            videoUrl: youtubeEmbed || chapterData.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
            isYouTube: !!youtubeEmbed,
            transcription: chapterData.transcription || "Transcription du cours...",
            nextChapter: currentChapterNum < totalChapters ? currentChapterNum + 1 : null,
            prevChapter: currentChapterNum > 1 ? currentChapterNum - 1 : null,
            isLastChapter: currentChapterNum === totalChapters
          });
        }
      }
      
      if (courseId && chapterId) {
        try {
          const commentsRes = await fetch(
            `http://localhost:5000/api/courses/${courseId}/chapters/${chapterId}/comments`
          );
          if (commentsRes.ok) {
            const data = await commentsRes.json();
            setComments(data.comments || []);
          }
        } catch (err) {
          console.error("Error loading chapter comments:", err);
        }
      }
      
      const userId = localStorage.getItem('userId');
      if (userId) {
        const enrolledResponse = await fetch(`http://localhost:5000/api/userdata/enrolled-courses/${userId}`);
        if (enrolledResponse.ok) {
          const enrolled = await enrolledResponse.json();
          const course = enrolled.find((c: any) => c.courseId === courseId);
          
          if (course && course.completedChapterIds) {
            const completed = course.completedChapterIds.includes(chapterId);
            setIsCompleted(completed);
            
            // IMPORTANT: If already completed, unlock next chapter
            if (completed) {
              console.log('✅ Chapter already completed, unlocking next chapter');
              setVideoWatched(true);
              hasShownToast.current = true;
            }
          }
        }
      }
      
    } catch (error) {
      console.error("Error loading chapter:", error);
      toast.error("Erreur lors du chargement du chapitre");
    } finally {
      setLoading(false);
    }
  };

  const handleNextChapter = async () => {
    if (!videoWatched && !isCompleted) {
      toast.error("Regardez la vidéo jusqu'à la fin avant de continuer.");
      return;
    }
    
    await handleMarkComplete(false);
    
    if (chapter.nextChapter) {
      navigate(`/course/${courseId}/chapter/${chapter.nextChapter}`);
    }
  };

  const handleMarkComplete = async (showToast = true) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      if (showToast) toast.error("Veuillez vous connecter");
      return;
    }
    
    setMarking(true);
    try {
      const response = await fetch('http://localhost:5000/api/userdata/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          chapterId,
          completed: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsCompleted(true);
        setVideoWatched(true);
        
        if (showToast) {
          toast.success("Chapitre marqué comme terminé! 🎉");
          if (data.enrollment) {
            toast.success(`Progression: ${data.enrollment.progress}%`);
          }
          if (data.certificateGenerated && data.certificate) {
            toast.success(`🏆 Certificat obtenu: ${data.certificate.certificateId}`, {
              duration: 5000,
              icon: <Award className="h-5 w-5 text-yellow-500" />
            });
          }
        }
      } else {
        if (showToast) toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Mark complete error:", error);
      if (showToast) toast.error("Erreur lors de la mise à jour");
    } finally {
      setMarking(false);
    }
  };

  const handleSaveNote = () => {
    if (notes.trim()) {
      setSavedNotes([...savedNotes, notes]);
      setNotes("");
      toast.success("Note sauvegardée!");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !courseId || !chapterId) return;
    
    const userId = localStorage.getItem("userId") || undefined;
    const userName = localStorage.getItem("userName") || "Utilisateur";
    
    try {
      const res = await fetch(
        `http://localhost:5000/api/courses/${courseId}/chapters/${chapterId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, userName, content: newComment }),
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setNewComment("");
        toast.success("Commentaire publié !");
      } else {
        toast.error("Erreur lors de la publication du commentaire");
      }
    } catch (err) {
      console.error("Add comment error:", err);
      toast.error("Erreur lors de la publication du commentaire");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du chapitre...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return <div>Chapitre non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-2">
            <Link 
              to={`/course/${courseId}`} 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="truncate">{courseName}</span>
            </Link>
            
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{chapter.title}</h1>
                {chapter.duration && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {chapter.duration}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative aspect-video w-full bg-black">
                {chapter.isYouTube ? (
                  <div id={`youtube-player-${chapterId}`} className="absolute inset-0 h-full w-full" />
                ) : (
                  <video 
                    ref={videoRef}
                    src={chapter.videoUrl} 
                    className="absolute inset-0 h-full w-full" 
                    controls
                  />
                )}
              </div>
            </Card>
            
            {/* Debug Info & Manual Override */}
            {!videoWatched && !isCompleted && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Problème avec la détection automatique?</p>
                      <p className="text-xs text-muted-foreground">Cliquez ici pour débloquer manuellement le prochain chapitre</p>
                    </div>
                    <Button
                      onClick={() => {
                        console.log('🔓 Manual unlock triggered');
                        setVideoWatched(true);
                        hasShownToast.current = true;
                        toast.success("Débloqué! Vous pouvez continuer.");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Débloquer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              {chapter.prevChapter ? (
                <Link to={`/course/${courseId}/chapter/${chapter.prevChapter}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Chapitre précédent</span>
                    <span className="sm:hidden">Précédent</span>
                  </Button>
                </Link>
              ) : (
                <div className="flex-1">
                  <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" disabled>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Chapitre précédent</span>
                    <span className="sm:hidden">Précédent</span>
                  </Button>
                </div>
              )}
              
              {chapter.isLastChapter ? (
                <div className="flex-1">
                  <Button
                    onClick={() => handleMarkComplete(true)} 
                    disabled={marking || isCompleted || !videoWatched}
                    className={`w-full ${
                      isCompleted 
                        ? "bg-green-600 hover:bg-green-700" 
                        : videoWatched 
                        ? "bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" 
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {marking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Finalisation...</span>
                      </>
                    ) : isCompleted ? (
                      <>
                        <Award className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Cours Complété!</span>
                        <span className="sm:hidden">Complété!</span>
                      </>
                    ) : (
                      <>
                        <Award className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Terminer le cours</span>
                        <span className="sm:hidden">Terminer</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex-1">
                  <Button 
                    onClick={handleNextChapter} 
                    disabled={!videoWatched && !isCompleted}
                    className={`w-full ${(videoWatched || isCompleted) ? "bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" : "opacity-50 cursor-not-allowed"}`}
                  >
                    <span className="hidden sm:inline">Chapitre suivant</span>
                    <span className="sm:hidden">Suivant</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Transcription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Transcription de la vidéo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {chapter.transcription.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - Notes + Comments */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <StickyNote className="h-5 w-5 text-primary" />
                  Espace d'apprentissage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="notes" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="notes" className="text-sm">
                      📝 Notes
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="text-sm">
                      <span className="flex items-center gap-1.5">
                        💬 Discussion
                        <Badge variant="secondary" className="text-xs h-5 px-1.5">
                          {comments.length}
                        </Badge>
                      </span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="notes" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="✏️ Prenez des notes pendant l'apprentissage..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[140px] resize-none"
                      />
                      <Button onClick={handleSaveNote} className="w-full" disabled={!notes.trim()} size="sm">
                        Sauvegarder la note
                      </Button>
                    </div>
                    
                    {savedNotes.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Vos notes :</p>
                          {savedNotes.map((note, index) => (
                            <Card key={index} className="bg-muted/50">
                              <CardContent className="p-3">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{note}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="comments" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <Input
                        placeholder="💬 Posez votre question..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                      />
                      <Button className="w-full" disabled={!newComment.trim()} onClick={handleAddComment} size="sm">
                        Publier
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {comments.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Soyez le premier à commenter
                          </p>
                        </div>
                      ) : (
                        comments.map((c, idx) => (
                          <Card key={idx} className="bg-muted/50">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                    {c.userName[0]}
                                  </div>
                                  <span className="text-xs font-medium">{c.userName}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr-FR") : ""}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {c.content}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}