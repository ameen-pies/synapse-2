import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function VerifyPayment() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Token de vérification manquant');
        return;
      }

      try {
        const response = await axios.post(`http://localhost:5000/api/userdata/verify-payment/${token}`);
        
        if (response.data.success) {
          setStatus('success');
          
          // Store subscription data
          const subscription = response.data.subscription;
          localStorage.setItem('userSubscription', subscription.planId);
          localStorage.setItem('userSubscriptionName', subscription.planName);
          localStorage.setItem('userSubscriptionDate', subscription.startDate);
          
          // Trigger profile update
          window.dispatchEvent(new Event('profileUpdated'));
          
          toast({
            title: "Paiement confirmé ! 🎉",
            description: "Votre abonnement a été activé avec succès",
          });
          
          // Navigate to success page
          setTimeout(() => {
            navigate("/payment-success", {
              state: {
                plan: {
                  name: subscription.planName,
                  price: subscription.price
                },
                planId: subscription.planId,
                paymentMethod: subscription.paymentMethod
              }
            });
          }, 2000);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setErrorMessage(
          error.response?.data?.message || 
          'Le lien de vérification est invalide ou expiré'
        );
        
        toast({
          title: "Erreur de vérification",
          description: errorMessage || "Une erreur s'est produite",
          variant: "destructive"
        });
      }
    };

    verifyPayment();
  }, [token, navigate, toast, errorMessage]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-8 pb-8 px-6 text-center">
            {status === 'verifying' && (
              <>
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Vérification en cours...
                </h2>
                <p className="text-muted-foreground">
                  Veuillez patienter pendant que nous confirmons votre paiement
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Paiement confirmé ! 🎉
                </h2>
                <p className="text-muted-foreground mb-4">
                  Votre abonnement a été activé avec succès
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirection vers la page de confirmation...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Erreur de vérification
                </h2>
                <p className="text-muted-foreground mb-6">
                  {errorMessage || 'Le lien de vérification est invalide ou expiré'}
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => navigate("/subscription")}
                  >
                    Retourner aux abonnements
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Retour au tableau de bord
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {status === 'error' && (
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>
              Besoin d'aide ?{" "}
              <a href="mailto:support@synapse.com" className="text-primary hover:underline">
                Contactez le support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}