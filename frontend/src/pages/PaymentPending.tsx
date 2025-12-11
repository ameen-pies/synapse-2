import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, CheckCircle2, XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function PaymentPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { email, plan, planId } = location.state || {};
  
  const [status, setStatus] = useState<'pending' | 'verified' | 'expired'>('pending');
  const [countdown, setCountdown] = useState(30 * 60); // 30 minutes in seconds

  // Redirect if no data
  if (!email || !plan || !planId) {
    setTimeout(() => {
      navigate("/subscription");
    }, 0);
    return null;
  }

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && status === 'pending') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setStatus('expired');
    }
  }, [countdown, status]);

  // Poll for verification status
  useEffect(() => {
    if (status !== 'pending') return;

    const checkStatus = async () => {
      try {
        // Get token from email URL or stored token
        const token = sessionStorage.getItem('paymentToken');
        if (!token) return;

        const response = await axios.get(`http://localhost:5000/api/userdata/check-verification/${token}`);
        
        if (response.data.verified) {
          setStatus('verified');
          
          // Store subscription data
          const subscription = response.data.subscription;
          localStorage.setItem('userSubscription', subscription.planId);
          localStorage.setItem('userSubscriptionName', subscription.planName);
          localStorage.setItem('userSubscriptionDate', subscription.startDate);
          
          // Trigger profile update
          window.dispatchEvent(new Event('profileUpdated'));
          
          toast({
            title: "Paiement confirmé ! 🎉",
            description: "Votre abonnement est maintenant actif",
          });
          
          // Navigate to success page
          setTimeout(() => {
            navigate("/payment-success", {
              state: {
                plan: plan,
                planId: planId,
                paymentMethod: 'email_verified'
              }
            });
          }, 2000);
        } else if (response.data.expired) {
          setStatus('expired');
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    // Check immediately
    checkStatus();
    
    // Then check every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, [status, navigate, plan, planId, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendEmail = async () => {
    try {
      toast({
        title: "Email renvoyé",
        description: "Vérifiez votre boîte mail",
      });
      setCountdown(30 * 60); // Reset countdown
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'email",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/subscription")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="border-2">
          <CardHeader className="text-center">
            {status === 'pending' && (
              <>
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <Mail className="w-10 h-10 text-blue-500 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">En attente de confirmation</CardTitle>
                <CardDescription className="text-base">
                  Vérifiez votre boîte mail pour confirmer votre paiement
                </CardDescription>
              </>
            )}
            
            {status === 'verified' && (
              <>
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-600">Paiement confirmé !</CardTitle>
                <CardDescription className="text-base">
                  Redirection en cours...
                </CardDescription>
              </>
            )}
            
            {status === 'expired' && (
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <CardTitle className="text-2xl text-red-600">Lien expiré</CardTitle>
                <CardDescription className="text-base">
                  Le lien de confirmation a expiré
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email sent info */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Email envoyé à :
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur le bouton "Confirmer le paiement" dans l'email pour activer votre abonnement.
                  </p>
                </div>
              </div>
            </div>

            {/* Plan details */}
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Détails de l'abonnement</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan sélectionné</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix mensuel</span>
                  <span className="font-medium">{plan.price} TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total avec TVA</span>
                  <span className="font-medium text-primary">
                    {(parseFloat(plan.price) * 1.19).toFixed(3)} TND
                  </span>
                </div>
              </div>
            </div>

            {/* Status specific content */}
            {status === 'pending' && (
              <>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Temps restant : {formatTime(countdown)}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    En attente de votre confirmation...
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-center">Vous n'avez pas reçu l'email ?</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleResendEmail}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renvoyer l'email
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => navigate("/subscription")}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Conseil : Vérifiez également votre dossier spam ou courrier indésirable
                  </p>
                </div>
              </>
            )}

            {status === 'expired' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Le lien de confirmation a expiré. Veuillez recommencer le processus de paiement.
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate("/subscription")}
                >
                  Retourner aux abonnements
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help text */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            Des problèmes ? Contactez{" "}
            <a href="mailto:support@synapse.com" className="text-primary hover:underline">
              support@synapse.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}