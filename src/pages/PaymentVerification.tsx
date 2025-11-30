import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Shield, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function PaymentVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { email, plan, planId, paymentMethod } = location.state || {};
  
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Redirect if no data
  if (!email || !plan || !planId) {
    setTimeout(() => {
      toast({
        title: "Erreur",
        description: "Session expirée. Veuillez recommencer.",
        variant: "destructive"
      });
      navigate("/subscription");
    }, 0);
    return null;
  }

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-send verification email on mount
  useEffect(() => {
    sendVerificationEmail();
  }, []);

  const sendVerificationEmail = async () => {
    try {
      // In a real app, you'd call your backend to send the email
      // For now, we'll simulate it
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('paymentVerificationCode', code);
      
      console.log('Verification code for testing:', code);
      
      toast({
        title: "Code de vérification envoyé",
        description: `Un code a été envoyé à ${email}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du code",
        variant: "destructive"
      });
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newCode = [...verificationCode];
    pastedData.forEach((char, index) => {
      if (index < 6) {
        newCode[index] = char;
      }
    });
    setVerificationCode(newCode);
  };

  const handleResendCode = async () => {
    setResending(true);
    
    try {
      await sendVerificationEmail();
      setResending(false);
      setCanResend(false);
      setCountdown(60);
    } catch (error) {
      setResending(false);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du code",
        variant: "destructive"
      });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = verificationCode.join("");
    
    if (code.length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le code complet",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Verify code (in real app, verify with backend)
      const storedCode = sessionStorage.getItem('paymentVerificationCode');
      
      if (code !== storedCode) {
        toast({
          title: "Code invalide",
          description: "Le code saisi est incorrect",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Update user subscription in backend
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          // Store subscription data
          await axios.put(`http://localhost:5000/api/userdata/${userId}`, {
            subscription: {
              planId: planId,
              planName: plan.name,
              price: plan.price,
              startDate: new Date().toISOString(),
              status: 'active',
              paymentMethod: paymentMethod
            }
          });

          // Also store in localStorage for immediate UI updates
          localStorage.setItem('userSubscription', planId);
          localStorage.setItem('userSubscriptionName', plan.name);
          localStorage.setItem('userSubscriptionDate', new Date().toISOString());
          
          // Trigger profile update event
          window.dispatchEvent(new Event('profileUpdated'));
        } catch (error) {
          console.error('Error updating subscription:', error);
          // Continue anyway - we have localStorage backup
        }
      }

      toast({
        title: "Paiement confirmé ! 🎉",
        description: `Votre abonnement ${plan.name} est maintenant actif`,
      });

      // Clear verification code
      sessionStorage.removeItem('paymentVerificationCode');

      // Navigate to success page
      setTimeout(() => {
        navigate("/payment-success", {
          state: {
            plan: plan,
            planId: planId,
            paymentMethod: paymentMethod
          }
        });
      }, 1500);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la vérification",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/payment-checkout", { state: { plan, planId } })}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Vérification de paiement</CardTitle>
            <CardDescription>
              Entrez le code de vérification envoyé à
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-center block">Code de vérification</Label>
                <div className="flex gap-2 justify-center">
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      disabled={loading}
                      required
                    />
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading || verificationCode.join("").length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Vérifier et activer l'abonnement
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas reçu le code ?
                </p>
                
                {canResend ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="text-primary"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Renvoyer le code
                      </>
                    )}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Renvoyer dans {countdown}s
                  </p>
                )}
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex gap-2">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">
                    Vérifiez votre boîte de réception
                  </p>
                  <p>
                    Le code de vérification a été envoyé à votre adresse email. 
                    N'oubliez pas de vérifier vos spams.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}