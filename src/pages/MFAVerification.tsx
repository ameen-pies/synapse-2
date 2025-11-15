import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { userDataAPI } from "@/services/api";

export default function MFAVerification() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Session expirée. Veuillez vous reconnecter.",
        variant: "destructive"
      });
      navigate("/login");
    }
  }, [email, navigate, toast]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex(c => !c);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const verificationCode = code.join("");
    
    if (verificationCode.length !== 6) {
      toast({
        title: "Code incomplet",
        description: "Veuillez entrer les 6 chiffres du code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await userDataAPI.verifyMFA(email, verificationCode);
      
      console.log("✅ MFA verification successful:", response);

      // Store user data (Node.js format with _id instead of id)
      localStorage.setItem('userId', response.user._id || '');
      localStorage.setItem('userName', response.user.name || '');
      localStorage.setItem('userEmail', response.user.email || '');
      localStorage.setItem('userAvatar', response.user.avatar || 'Felix');
      
      // Store additional user data if needed
      if (response.user.phone) localStorage.setItem('userPhone', response.user.phone);
      if (response.user.phoneCode) localStorage.setItem('userPhoneCode', response.user.phoneCode);
      if (response.user.location) localStorage.setItem('userLocation', response.user.location);
      if (response.user.occupation) localStorage.setItem('userOccupation', response.user.occupation);

      toast({
        title: "Connexion réussie! 🎉",
        description: `Bienvenue ${response.user.name}`,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error: any) {
      console.error("❌ MFA verification error:", error);
      
      const errorMessage = error.response?.data?.message || "Code de vérification invalide";
      
      toast({
        title: "Erreur de vérification",
        description: errorMessage,
        variant: "destructive"
      });

      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    
    try {
      await userDataAPI.resendCode(email);
      
      toast({
        title: "Code renvoyé! 📧",
        description: "Un nouveau code a été envoyé à votre email",
      });

      setResendDisabled(true);
      setCountdown(60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

    } catch (error: any) {
      console.error("❌ Resend code error:", error);
      
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer le code. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border border-white rotate-45"></div>
          <div className="absolute bottom-40 right-20 w-80 h-80 border border-white rotate-12"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 border border-white -rotate-12"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">synapse</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Vérification de sécurité
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Nous avons envoyé un code de vérification à votre adresse email. 
              Cette étape supplémentaire garantit la sécurité de votre compte.
            </p>
          </div>

          <Link 
            to="/login" 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">synapse</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Vérification en deux étapes</h2>
            <p className="text-muted-foreground">
              Entrez le code à 6 chiffres envoyé à <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            {/* Code Input Fields */}
            <div className="space-y-4">
              <div className="flex gap-3 justify-center">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-14 h-14 text-center text-2xl font-bold"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Le code expire dans 10 minutes
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading || code.join("").length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier le code"
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas reçu le code?
              </p>
              <Button
                type="button"
                variant="link"
                onClick={handleResendCode}
                disabled={resendLoading || resendDisabled || loading}
                className="text-primary hover:text-primary/80"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : resendDisabled ? (
                  `Renvoyer dans ${countdown}s`
                ) : (
                  "Renvoyer le code"
                )}
              </Button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}