import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Zap, Star, TrendingUp, BookOpen, PlayCircle, MessageSquare, Clock, Award, Download, ZoomIn, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: { cover_image: string };
  difficulty?: string;
  duration_hours?: number;
  calculated_duration?: string;
  chapters?: Array<{ duration?: string }>;
  total_chapters?: number;
  author?: string;
  content_type?: string;
}

interface Blog {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: { cover_image: string };
  author?: string;
  content_type?: string;
}

interface Forum {
  _id: string;
  title: string;
  description: string;
  labels: string[];
  views?: number;
  replies?: number;
  content_type?: string;
}

interface EnrolledCourse {
  courseId: string;
  title: string;
  progress: number;
  lastAccessed: string;
  completedChapters: number;
  totalChapters: number;
  thumbnail?: string;
}

export default function Dashboard() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showCertPreview, setShowCertPreview] = useState(false);
  const [certificateZoom, setCertificateZoom] = useState(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [recommendedBlogs, setRecommendedBlogs] = useState<Blog[]>([]);
  const [recommendedForums, setRecommendedForums] = useState<Forum[]>([]);
  const [subscription, setSubscription] = useState<{
    planId: string | null;
    planName: string | null;
    date: string | null;
  }>({
    planId: null,
    planName: null,
    date: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    const planId = localStorage.getItem('userSubscription');
    const planName = localStorage.getItem('userSubscriptionName');
    const date = localStorage.getItem('userSubscriptionDate');
    if (planId) {
      setSubscription({ planId, planName, date });
    }
    
    const loadCertificates = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const response = await fetch(`http://localhost:5000/api/userdata/certificates/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setCertificates(data.certificates || []);
          }
        } catch (error) {
          console.error("Error loading certificates:", error);
        }
      }
    };
    
    loadCertificates();
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const enrolledResponse = await fetch(`http://localhost:5000/api/userdata/enrolled-courses/${userId}`);
        if (enrolledResponse.ok) {
          const enrolled = await enrolledResponse.json();
          setEnrolledCourses(enrolled);
        }
      } catch (error) {
        console.error("Error loading enrolled courses:", error);
      }
    }

    const userInterests = localStorage.getItem('userInterests');
    
    if (userInterests) {
      try {
        const interests = JSON.parse(userInterests);
        
        const response = await fetch('http://localhost:8000/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topics: interests, limit: 20 })
        });

        if (response.ok) {
          const data = await response.json();
          const allRecommendations = data.recommendations;
          
          const courseRecs = allRecommendations.filter((item: any) => 
            item.content_type === 'course'
          );

          const coursesWithDetails = await Promise.all(
            courseRecs.slice(0, 6).map(async (item: any) => {
              try {
                const courseRes = await fetch(`http://localhost:5000/api/courses/${item._id}`);
                if (courseRes.ok) {
                  const fullCourse = await courseRes.json();
                  
                  return {
                    _id: fullCourse._id || item._id,
                    title: fullCourse.title || item.title,
                    description: fullCourse.description || item.desc || 'Description non disponible',
                    category: fullCourse.category || item.topic || 'Général',
                    tags: fullCourse.tags || item.tags || [],
                    images: { 
                      cover_image: fullCourse.images?.cover_image || item.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' 
                    },
                    difficulty: fullCourse.difficulty || item.difficulty || 'Intermédiaire',
                    duration_hours: fullCourse.duration_hours,
                    calculated_duration: fullCourse.calculated_duration,
                    chapters: fullCourse.chapters || [],
                    total_chapters: fullCourse.total_chapters || fullCourse.chapters?.length || 0,
                    author: fullCourse.author || item.author || 'Expert Synapse',
                    content_type: 'course'
                  };
                } else {
                  return {
                    _id: item._id || Math.random().toString(),
                    title: item.title,
                    description: item.desc || 'Description non disponible',
                    category: item.topic || 'Général',
                    tags: item.tags || [],
                    images: { 
                      cover_image: item.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' 
                    },
                    difficulty: item.difficulty || 'Intermédiaire',
                    duration_hours: item.duration_hours,
                    author: item.author || 'Expert Synapse',
                    content_type: 'course',
                    chapters: []
                  };
                }
              } catch (error) {
                console.error(`Error fetching course ${item._id}:`, error);
                return {
                  _id: item._id || Math.random().toString(),
                  title: item.title,
                  description: item.desc || 'Description non disponible',
                  category: item.topic || 'Général',
                  tags: item.tags || [],
                  images: { 
                    cover_image: item.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' 
                  },
                  difficulty: item.difficulty || 'Intermédiaire',
                  duration_hours: item.duration_hours,
                  author: item.author || 'Expert Synapse',
                  content_type: 'course',
                  chapters: []
                };
              }
            })
          );

          const blogs = allRecommendations.filter((item: any) => 
            item.content_type === 'blog'
          ).map((item: any) => ({
            _id: item._id || Math.random().toString(),
            title: item.title,
            description: item.desc || item.description || 'Description non disponible',
            category: item.topic || item.category || 'Général',
            tags: item.tags || [],
            images: { 
              cover_image: item.image || item.images?.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800' 
            },
            author: item.author || 'Expert Synapse',
            content_type: item.content_type
          }));

          const forums = allRecommendations.filter((item: any) => 
            item.content_type === 'forum'
          ).map((item: any) => ({
            _id: item._id || Math.random().toString(),
            title: item.title,
            description: item.desc || item.description || 'Description non disponible',
            labels: item.labels || item.tags || [],
            views: item.views || 0,
            replies: item.replies || 0,
            content_type: item.content_type
          }));

          setRecommendedCourses(coursesWithDetails);
          setRecommendedBlogs(blogs.slice(0, 6));
          setRecommendedForums(forums.slice(0, 6));

          toast.success(`${allRecommendations.length} recommandations chargées!`);
        }
      } catch (error) {
        console.error("Error loading recommendations:", error);
        toast.error("Erreur réseau");
      }
    } else {
      navigate("/interests");
    }

    setLoading(false);
  };

  const handleDownloadCertificate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const certificateElement = document.getElementById(`cert-preview-dashboard`);
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
        link.download = `certificat-${selectedCertificate.certificateId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast.success("Certificat téléchargé! 🔥");
      } else {
        toast.error("html2canvas n'est pas chargé. Ajoutez le script dans votre index.html");
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleCertificateClick = (cert: any) => {
    setSelectedCertificate(cert);
    setCertificateZoom(1);
    setShowCertPreview(true);
  };

  const getSubscriptionIcon = (planId: string) => {
    switch(planId) {
      case 'basic': return Star;
      case 'pro': return Zap;
      case 'premium': return Crown;
      default: return Star;
    }
  };

  const getSubscriptionColor = (planId: string) => {
    switch(planId) {
      case 'basic': return 'text-blue-500';
      case 'pro': return 'text-purple-500';
      case 'premium': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };

  const getCourseEmoji = (index: number) => {
    const emojis = ['📚', '🎨', '💻', '🧠', '⚡', '🔥', '🎯', '🚀', '🌟', '🎓'];
    return emojis[index % emojis.length];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header with Subscription */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bienvenue sur Synapse</h1>
            <p className="text-muted-foreground mt-1">Continuez votre apprentissage</p>
          </div>
          
          {subscription.planId ? (
            <Card className="w-full lg:w-auto">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getSubscriptionIcon(subscription.planId);
                    const colorClass = getSubscriptionColor(subscription.planId);
                    return (
                      <>
                        <div className={`w-10 h-10 bg-${subscription.planId === 'basic' ? 'blue' : subscription.planId === 'pro' ? 'purple' : 'amber'}-500/10 rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${colorClass}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              Plan {subscription.planName}
                            </p>
                            <Badge variant="secondary" className="text-xs">Actif</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Membre depuis {subscription.date ? new Date(subscription.date).toLocaleDateString('fr-FR') : "aujourd'hui"}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full lg:w-auto bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      Débloquez tout votre potentiel
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accédez à des milliers de cours premium
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate("/subscription")}
                    className="shrink-0"
                  >
                    S'abonner
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enrolled Courses Section - FIXED CARD HEIGHTS */}
        {enrolledCourses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Mes cours en cours</h2>
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                Voir tout
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course, index) => (
                <Link key={course.courseId} to={`/course/${course.courseId}`}>
                  <Card className="group hover:shadow-md transition-all hover:border-primary/50 flex flex-col h-full">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-3xl flex-shrink-0">{getCourseEmoji(index)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{course.completedChapters}/{course.totalChapters} chapitres</span>
                            <span>·</span>
                            <span>{course.progress}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <Progress value={course.progress} className="h-1.5 mb-2" />
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.lastAccessed}
                          </span>
                          <span className="text-primary font-medium">Continuer →</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* No Courses Enrolled */}
        {enrolledCourses.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Commencez un cours</p>
              <p className="text-sm text-muted-foreground mb-4">Explorez nos recommandations ci-dessous</p>
            </CardContent>
          </Card>
        )}

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Mes Certificats</h2>
                <p className="text-muted-foreground mt-1">
                  {certificates.length} certificat{certificates.length !== 1 ? 's' : ''} obtenu{certificates.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate("/certificates")}
              >
                Voir tout
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.slice(0, 3).map((cert: any) => (
                <Card 
                  key={cert.certificateId}
                  className="group transition-all hover:shadow-lg border-2 border-primary/20 hover:border-primary/40 flex flex-col cursor-pointer"
                  style={{ height: '200px' }}
                  onClick={() => handleCertificateClick(cert)}
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        <Award className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {cert.courseTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Complété le {new Date(cert.completionDate || cert.issuedDate).toLocaleDateString('fr-FR')}
                        </p>
                        <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                          {cert.certificateId}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCertificateClick(cert);
                        }}
                      >
                        <ZoomIn className="h-3 w-3 mr-2" />
                        Voir le certificat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Certificate Preview Dialog - Using the same beautiful design from CourseDetail */}
        {selectedCertificate && (
          <Dialog open={showCertPreview} onOpenChange={setShowCertPreview}>
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
                  id="cert-preview-dashboard"
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
                        {selectedCertificate.category || 'Développement Professionnel'}
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
                        {selectedCertificate.courseTitle}
                      </h3>
                    </div>

                    {/* Date and ID */}
                    <div className="pt-8 space-y-4">
                      <p className="text-sm text-gray-500">
                        Délivré le {new Date(selectedCertificate.completionDate || selectedCertificate.issuedDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        ID: {selectedCertificate.certificateId}
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

        {/* Recommended Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Cours recommandés pour vous</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
              onClick={() => navigate("/courses")}
            >
              Voir tout
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              Chargement des recommandations...
            </div>
          ) : recommendedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course, index) => {
                const calculateDuration = () => {
                  if (course.chapters && course.chapters.length > 0) {
                    let totalMinutes = 0;
                    course.chapters.forEach((chapter: any) => {
                      if (chapter.duration) {
                        const match = chapter.duration.match(/(\d+)\s*(min|h)/i);
                        if (match) {
                          const value = parseInt(match[1]);
                          const unit = match[2].toLowerCase();
                          totalMinutes += unit === 'h' ? value * 60 : value;
                        }
                      }
                    });
                    
                    if (totalMinutes > 0) {
                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;
                      if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
                      if (hours > 0) return `${hours}h`;
                      return `${minutes}min`;
                    }
                  }
                  return course.duration_hours ? `${course.duration_hours}h` : null;
                };

                const duration = calculateDuration();

                return (
                  <Link key={course._id || index} to={`/course/${course._id}`}>
                    <Card className="group h-full overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all flex flex-col">
                      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                        <img 
                          src={course.images?.cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
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
                              {course.tags.slice(0, 2).join(" · ")}
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
          ) : (
            <Card className="py-12">
              <CardContent>
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Aucun cours recommandé disponible</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vos intérêts: {localStorage.getItem('userInterests') || 'Non définis'}
                  </p>
                  <Button onClick={() => navigate("/interests")}>
                    Configurer mes intérêts
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recommended Blogs */}
        {recommendedBlogs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Blogs recommandés</h2>
                <p className="text-muted-foreground mt-1">Articles et guides basés sur vos intérêts</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate("/blogs")}
              >
                Voir tout
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedBlogs.map((blog, index) => (
                <Link key={blog._id || index} to={`/blog/${blog._id}`}>
                  <Card className="group h-full transition-all hover:shadow-lg overflow-hidden">
                    <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                      <img 
                        src={blog.images?.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {blog.category}
                      </Badge>
                      <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{blog.description}</p>
                      {blog.author && (
                        <p className="text-xs text-muted-foreground mt-2">Par {blog.author}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Forums */}
        {recommendedForums.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Discussions recommandées</h2>
                <p className="text-muted-foreground mt-1">Rejoignez les conversations actives</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate("/community")}
              >
                Voir tout
              </Button>
            </div>
            <div className="grid gap-4">
              {recommendedForums.map((forum, index) => (
                <Link key={forum._id || index} to={`/community/${forum._id}`}>
                  <Card className="group transition-all hover:shadow-lg border-l-4 border-l-primary/50 hover:border-l-primary">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {forum.labels && forum.labels.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {forum.labels[0]}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {forum.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{forum.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {forum.replies || 0} réponses
                            </span>
                            <span>{forum.views || 0} vues</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}