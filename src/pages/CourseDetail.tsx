import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, Clock, Users, Award, BookmarkPlus, Flag, CheckCircle2, PlayCircle, Loader2, Star, TrendingUp, Bookmark, Lock, ZoomIn } from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  "Contenu inapproprié",
  "Spam ou publicité",
  "Harcèlement",
  "Fausses informations",
  "Violation des règles",
  "Autre"
];

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedCourses, setSavedCourses] = useState<string[]>([]);
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [userCertificate, setUserCertificate] = useState<any>(null);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [certificateZoom, setCertificateZoom] = useState(1);
  
  // Report dialog states
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  useEffect(() => {
    loadCourseData();
    loadSavedStatus();
    loadUserCertificate();
  }, [id]);

  const loadUserCertificate = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || !id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/userdata/certificates/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const courseCert = data.certificates?.find((cert: any) => cert.courseId === id);
        if (courseCert) {
          setUserCertificate(courseCert);
        }
      }
    } catch (error) {
      console.error("Error loading certificate:", error);
    }
  };

  const handleDownloadCertificate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const certificateElement = document.getElementById(`cert-preview-detail`);
      if (!certificateElement) {
        toast.error("Erreur lors de la génération du certificat");
        return;
      }

      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        const canvas = await (window as any).html2canvas(certificateElement, {
          scale: 3,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        
        const link = document.createElement('a');
        link.download = `certificat-${userCertificate.certificateId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast.success("Certificat téléchargé! 📥");
      } else {
        toast.error("html2canvas n'est pas chargé. Ajoutez le script dans votre index.html");
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const loadSavedStatus = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const saved = localStorage.getItem(`savedCourses_${userId}`);
      if (saved) {
        const savedList = JSON.parse(saved);
        setSavedCourses(savedList);
        setIsSaved(savedList.includes(id));
      }
    }
  };

  const loadCourseData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${id}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
      }

      const userId = localStorage.getItem('userId');
      if (userId) {
        const enrolledResponse = await fetch(`http://localhost:5000/api/userdata/enrolled-courses/${userId}`);
        if (enrolledResponse.ok) {
          const enrolled = await enrolledResponse.json();
          const enrolledCourse = enrolled.find((c: any) => c.courseId === id);
          const isInList = !!enrolledCourse;
          setIsEnrolled(isInList);
          
          if (enrolledCourse && enrolledCourse.completedChapterIds) {
            setCompletedChapterIds(enrolledCourse.completedChapterIds);
          }
        }
      }
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error("Erreur lors du chargement du cours");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error("Veuillez vous connecter");
      navigate("/login");
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch('http://localhost:5000/api/userdata/enroll-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId: id,
          courseTitle: course.title,
          totalChapters: course.chapters?.length || 1,
          thumbnail: course.images?.cover_image || ''
        })
      });

      if (response.ok) {
        setIsEnrolled(true);
        toast.success("Inscription réussie! 🎉");
        setTimeout(() => {
          navigate(`/course/${id}/chapter/1`);
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setEnrolling(false);
    }
  };

  const handleSave = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error("Veuillez vous connecter");
      return;
    }

    let updatedSaved = [...savedCourses];
    
    if (isSaved) {
      updatedSaved = updatedSaved.filter(courseId => courseId !== id);
      toast.success("Cours retiré des favoris");
    } else {
      updatedSaved.push(id!);
      toast.success("Cours ajouté aux favoris");
    }

    localStorage.setItem(`savedCourses_${userId}`, JSON.stringify(updatedSaved));
    setSavedCourses(updatedSaved);
    setIsSaved(!isSaved);
  };

  const handleReport = () => {
    if (!reportReason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    toast.success("Signalement envoyé. Merci d'avoir signalé ce contenu. Notre équipe va l'examiner.");
    setShowReportDialog(false);
    setReportReason("");
    setReportDetails("");
  };

  const isChapterUnlocked = (chapterIndex: number) => {
    if (!isEnrolled) return false;
    if (chapterIndex === 0) return true;
    
    const prevChapterId = String(chapterIndex);
    return completedChapterIds.includes(prevChapterId);
  };

  const handleChapterClick = (chapterIndex: number, chapterId: string) => {
    if (!isEnrolled) {
      toast.error("Veuillez vous inscrire au cours d'abord");
      return;
    }
    
    if (!isChapterUnlocked(chapterIndex)) {
      toast.error("Terminez le chapitre précédent pour débloquer celui-ci");
      return;
    }
    
    navigate(`/course/${id}/chapter/${chapterId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Cours non trouvé</h2>
            <p className="text-muted-foreground mb-4">Ce cours n'existe pas ou a été supprimé</p>
            <Button onClick={() => navigate("/dashboard")}>
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bannerImage = course.images?.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200';
  const chapters = course.chapters || [];

  const calculateTotalDuration = () => {
    if (course.chapters && course.chapters.length > 0) {
      let totalMinutes = 0;
      let hasAnyDuration = false;
      
      course.chapters.forEach((chapter: any) => {
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
    
    return 'Durée variable';
  };

  const totalDuration = calculateTotalDuration();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[500px] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 -mt-16">
        <img 
          src={bannerImage}
          alt={course.title}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute inset-0 flex items-end pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <Badge className="mb-3 bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 shadow-lg">
                {course.category}
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 drop-shadow-sm">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{totalDuration}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{course.students || 1250} étudiants</span>
                </div>
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {course.difficulty || 'Intermédiaire'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions - Mobile */}
            <div className="lg:hidden">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  {isEnrolled ? (
                    <Link to={`/course/${id}/chapter/1`}>
                      <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg" size="lg">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Commencer l'apprentissage
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg" 
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Inscription...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-5 w-5" />
                          Commencer ce cours
                        </>
                      )}
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className={`flex-1 ${isSaved ? 'bg-primary/10 border-primary text-primary' : ''}`}
                      onClick={handleSave}
                      size="sm"
                    >
                      {isSaved ? (
                        <Bookmark className="mr-2 h-4 w-4 fill-current" />
                      ) : (
                        <BookmarkPlus className="mr-2 h-4 w-4" />
                      )}
                      {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowReportDialog(true)}
                      size="sm"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Signaler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  À propos de ce cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>

            {/* Chapters List */}
            {chapters.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    Contenu du cours ({chapters.length} chapitres)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {chapters.map((chapter: any, index: number) => {
                      const chapterId = chapter.id || (index + 1);
                      const isUnlocked = isChapterUnlocked(index);
                      const isCompleted = completedChapterIds.includes(String(chapterId));
                      
                      return (
                        <div 
                          key={chapterId}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isUnlocked 
                              ? 'hover:bg-muted/50 cursor-pointer' 
                              : 'opacity-50 cursor-not-allowed bg-muted/20'
                          }`}
                          onClick={() => isUnlocked && handleChapterClick(index, String(chapterId))}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              isCompleted 
                                ? 'bg-green-500/20 text-green-600' 
                                : isUnlocked 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : isUnlocked ? (
                                chapterId
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${!isUnlocked && 'text-muted-foreground'}`}>
                                {chapter.title}
                              </p>
                              {chapter.duration && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {chapter.duration}
                                </p>
                              )}
                            </div>
                          </div>
                          {isUnlocked && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChapterClick(index, String(chapterId));
                              }}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Ce que vous allez apprendre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(course.learning_outcomes || [
                    "Maîtriser les concepts fondamentaux",
                    "Développer des projets pratiques",
                    "Acquérir des compétences professionnelles",
                    "Obtenir un certificat reconnu"
                  ]).map((outcome: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Votre instructeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {(course.author || 'Expert Synapse')[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{course.author || 'Expert Synapse'}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {course.author_bio || 'Instructeur expérimenté avec plusieurs années d\'expertise dans le domaine'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-20 z-1 hidden lg:block">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 space-y-4">
                  {isEnrolled ? (
                    <Link to={`/course/${id}/chapter/1`}>
                      <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg" size="lg">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Commencer l'apprentissage
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg" 
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Inscription...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-5 w-5" />
                          Commencer ce cours
                        </>
                      )}
                    </Button>
                  )}
                  <Separator />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className={`flex-1 ${isSaved ? 'bg-primary/10 border-primary text-primary' : ''}`}
                      onClick={handleSave}
                    >
                      {isSaved ? (
                        <Bookmark className="h-4 w-4 fill-current" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowReportDialog(true)}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Course Stats */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Étudiants inscrits</span>
                      <span className="text-sm font-semibold">{course.students || 1250}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Durée totale</span>
                      <span className="text-sm font-semibold">{totalDuration}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Niveau</span>
                      <Badge variant="secondary" className="text-xs">{course.difficulty || 'Intermédiaire'}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Chapitres</span>
                      <span className="text-sm font-semibold">{chapters.length}</span>
                    </div>
                    {isEnrolled && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Progression</span>
                          <span className="text-sm font-semibold text-primary">
                            {completedChapterIds.length}/{chapters.length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certification Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-5 w-5 text-primary" />
                    {userCertificate ? 'Votre Certificat' : 'Certificat inclus'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userCertificate ? (
                    <div 
                      className="relative rounded-xl border-2 border-primary bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 text-center overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => setShowCertificatePreview(true)}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full -ml-12 -mb-12" />
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm font-semibold mb-2 text-primary">
                          Certificat obtenu!
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          Délivré le {new Date(userCertificate.completionDate || userCertificate.issuedDate).toLocaleDateString('fr-FR')}
                        </p>
                        <Badge variant="secondary" className="text-xs font-mono">
                          {userCertificate.certificateId}
                        </Badge>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-primary">
                          <ZoomIn className="h-3 w-3" />
                          <span>Cliquer pour agrandir</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 text-center overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full -ml-12 -mb-12" />
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm font-semibold mb-2">
                          Certificat de réussite
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Terminez tous les chapitres pour recevoir votre certificat vérifié
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/courses")}>
            ← Retour aux cours
          </Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler ce cours</DialogTitle>
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
                setShowReportDialog(false);
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

      {/* Certificate Preview Dialog */}
      {userCertificate && (
        <Dialog open={showCertificatePreview} onOpenChange={setShowCertificatePreview}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="pr-12">
              <DialogTitle className="flex items-center justify-between gap-4">
                <span>Votre Certificat</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCertificateZoom(prev => Math.min(prev + 0.1, 2))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCertificateZoom(prev => Math.max(prev - 0.1, 0.5))}>
                    <ZoomIn className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadCertificate}>
                    Télécharger
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <div 
                id="cert-preview-detail"
                style={{ transform: `scale(${certificateZoom})`, transformOrigin: 'top center' }}
                className="bg-white p-12 rounded-lg shadow-2xl relative overflow-hidden"
              >
                {/* Decorative border */}
                <div className="absolute inset-4 border-4 border-double border-primary/30 rounded-lg" />
                
                {/* Corner decorations */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-primary/40" />
                <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-primary/40" />
                <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-primary/40" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-primary/40" />

                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary rounded-full blur-3xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center space-y-8">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-gray-800">
                      Certificat de Réussite
                    </h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">
                      {userCertificate.category || 'Développement Professionnel'}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/50" />
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/50" />
                  </div>

                  {/* Main text */}
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600">
                      Ceci certifie que
                    </p>
                    
                    <h2 className="text-5xl font-serif font-bold text-gray-900 py-4">
                      {localStorage.getItem('userName') || 'Étudiant'}
                    </h2>
                    
                    <p className="text-lg text-gray-600">
                      a complété avec succès le cours
                    </p>
                    
                    <h3 className="text-3xl font-semibold text-primary px-8">
                      {course.title}
                    </h3>
                  </div>

                  {/* Date and ID */}
                  <div className="pt-8 space-y-4">
                    <p className="text-sm text-gray-500">
                      Délivré le {new Date(userCertificate.completionDate || userCertificate.issuedDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      ID: {userCertificate.certificateId}
                    </p>
                  </div>

                  {/* Signature section */}
                  <div className="pt-8 flex justify-center gap-16">
                    <div className="text-center">
                      <div className="w-48 h-px bg-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Expert Synapse</p>
                      <p className="text-xs text-gray-500">Instructeur</p>
                    </div>
                  </div>

                  {/* Bottom decorative line */}
                  <div className="pt-8">
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}