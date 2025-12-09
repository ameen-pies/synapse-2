import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CertificateProps {
  courseName: string;
  userName: string;
  completionDate: string;
  certificateId: string;
  courseCategory?: string;
  courseId?: string;
  compact?: boolean;
}

export default function Certificate({ 
  courseName, 
  userName, 
  completionDate, 
  certificateId,
  courseCategory,
  compact = false
}: CertificateProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      const certificateElement = document.getElementById(`cert-preview-${certificateId}`);
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
        link.download = `certificat-${certificateId}.png`;
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

  const CertificatePreview = ({ id }: { id: string }) => (
    <div 
      id={id}
      className="bg-white rounded-lg shadow-2xl relative overflow-hidden mx-auto"
      style={{ 
        width: '1000px',
        height: '707px',
        padding: '60px 48px'
      }}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-purple-500/8 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-4 border-[3px] border-double border-purple-200 rounded-lg" />
      
      <div className="absolute top-6 left-6 w-12 h-12 border-l-[3px] border-t-[3px] border-purple-300" />
      <div className="absolute top-6 right-6 w-12 h-12 border-r-[3px] border-t-[3px] border-purple-300" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-l-[3px] border-b-[3px] border-purple-300" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r-[3px] border-b-[3px] border-purple-300" />

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-600 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center h-full flex flex-col justify-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <Award className="h-11 w-11 text-white" />
            </div>
          </div>
          <h1 className="text-[42px] font-serif font-bold text-gray-800 mb-2">
            Certificat de Réussite
          </h1>
          <p className="text-sm text-gray-500 uppercase tracking-[0.35em]">
            {courseCategory || 'Développement Professionnel'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 my-6">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-purple-300" />
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-purple-300" />
        </div>

        <div className="my-6">
          <p className="text-lg text-gray-600 mb-4">Ceci certifie que</p>
          
          <h2 className="text-[52px] font-serif font-bold text-gray-900 my-6">
            {userName}
          </h2>
          
          <p className="text-lg text-gray-600 mb-4">a complété avec succès le cours</p>
          
          <h3 className="text-[32px] font-semibold text-purple-600 px-12 leading-tight">
            {courseName}
          </h3>
        </div>

        <div className="mt-8 mb-6">
          <p className="text-base text-gray-500 mb-3">
            Délivré le {new Date(completionDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-400 font-mono">ID: {certificateId}</p>
        </div>

        <div className="mt-8">
          <div className="text-center inline-block mx-auto">
            <div className="w-48 h-px bg-gray-400 mb-2" />
            <p className="text-base font-semibold text-gray-700">Expert Synapse</p>
            <p className="text-sm text-gray-500">Instructeur</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <>
        <Card 
          className="group transition-all hover:shadow-lg border-2 border-primary/20 hover:border-primary/40 cursor-pointer flex flex-col"
          style={{ height: '200px' }}
          onClick={() => setShowPreview(true)}
        >
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                  {courseName}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(completionDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                  {certificateId}
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
                  handleDownload(e);
                }}
              >
                <Download className="h-3 w-3 mr-2" />
                Télécharger
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-lg">Certificat de Réussite</span>
                <Button
                  size="sm"
                  onClick={(e) => handleDownload(e)}
                  className="bg-gradient-to-r from-primary to-purple-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="overflow-auto p-6" style={{ maxHeight: 'calc(95vh - 100px)' }}>
              <CertificatePreview id={`cert-preview-${certificateId}`} />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Regular (non-compact) version for Certificates page
  return (
    <>
      <Card 
        className="group transition-all hover:shadow-lg border-2 border-primary/20 hover:border-primary/40 flex flex-col"
        style={{ height: '200px' }}
      >
        <CardContent className="p-5 flex flex-col h-full">
          <div 
            className="flex items-start gap-4 flex-1 cursor-pointer"
            onClick={() => setShowPreview(true)}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {courseName}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Complété le {new Date(completionDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                {certificateId}
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
                handleDownload(e);
              }}
            >
              <Download className="h-3 w-3 mr-2" />
              Télécharger
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-lg">Certificat de Réussite</span>
              <Button
                size="sm"
                onClick={(e) => handleDownload(e)}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto p-6" style={{ maxHeight: 'calc(95vh - 100px)' }}>
            <CertificatePreview id={`cert-preview-${certificateId}`} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}