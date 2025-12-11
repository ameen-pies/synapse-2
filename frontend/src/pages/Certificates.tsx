import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Award, ZoomIn } from "lucide-react";
import Certificate from "@/components/Certificate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CertificateData {
  certificateId: string;
  courseId: string;
  courseTitle: string;
  completionDate: string;
  userId: string;
  userName: string;
  category?: string;
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [showCertPreview, setShowCertPreview] = useState(false);
  const [certificateZoom, setCertificateZoom] = useState(1);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const storedUserName = localStorage.getItem('userName') || 'Étudiant';
      setUserName(storedUserName);

      if (!userId) {
        console.error("No user ID found");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/userdata/certificates/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const certificateElement = document.getElementById(`cert-preview-certificates`);
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
        link.download = `certificat-${selectedCertificate?.certificateId}.png`;
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

  const handleCertificateClick = (cert: CertificateData) => {
    setSelectedCertificate(cert);
    setCertificateZoom(1);
    setShowCertPreview(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de vos certificats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => window.location.href = "/dashboard"}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Button>
          
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mes Certificats</h1>
              <p className="text-muted-foreground">
                {certificates.length} certificat{certificates.length !== 1 ? 's' : ''} obtenu{certificates.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Stats Card - Moved to Header */}
            {certificates.length > 0 && (
              <Card className="w-full lg:w-auto">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Vos Accomplissements</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex gap-8 justify-center lg:justify-start">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {certificates.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Certificat{certificates.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {new Set(certificates.map(c => c.courseId)).size}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cours complétés
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {certificates.length > 0 
                          ? new Date(certificates[certificates.length - 1].completionDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                          : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        Dernier certificat
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {certificates.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-3">Aucun certificat pour le moment</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Complétez vos cours pour obtenir des certificats de réussite vérifiés
              </p>
              <Button 
                onClick={() => window.location.href = "/courses"} 
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                Explorer les cours
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {certificates.map((cert) => (
    <div 
      key={cert.certificateId}
      className="cursor-pointer"
      onClick={() => handleCertificateClick(cert)}
    >
      <Card className="group transition-all hover:shadow-lg border-2 border-primary/20 hover:border-primary/40 h-full">
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
                Complété le {new Date(cert.completionDate).toLocaleDateString('fr-FR')}
              </p>
              <div className="flex items-center gap-2 mb-3"> {/* Added mb-3 for bottom margin */}
                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-mono">
                  {cert.certificateId}
                </span>
                {cert.category && (
                  <span className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                    {cert.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-border"> {/* Increased pt-3 to pt-4 */}
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
    </div>
  ))}
</div>
          </>
        )}
      </div>

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
                id="cert-preview-certificates"
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
                      {userName || 'Étudiant'}
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
                      Délivré le {new Date(selectedCertificate.completionDate).toLocaleDateString('fr-FR', {
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
    </div>
  );
}