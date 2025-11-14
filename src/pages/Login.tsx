import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, GraduationCap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { userDataAPI } from "@/services/api";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Call login API
      const response = await userDataAPI.login(formData.email, formData.password);
      
      console.log("✅ Login successful:", response);

      // Store user data in localStorage
      localStorage.setItem('userId', response.user._id || '');
      localStorage.setItem('userName', response.user.name || '');
      localStorage.setItem('userEmail', response.user.email || '');
      localStorage.setItem('userAvatar', response.user.avatar || 'Felix');

      // Show success message
      toast({
        title: "Connexion réussie! 🎉",
        description: `Bienvenue ${response.user.name}`,
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error: any) {
      console.error("❌ Login error:", error);
      
      // Handle specific error messages
      const errorMessage = error.response?.data?.message || "Erreur lors de la connexion";
      
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border border-white rotate-45"></div>
          <div className="absolute bottom-40 right-20 w-80 h-80 border border-white rotate-12"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 border border-white -rotate-12"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">synapse</span>
          </div>

          {/* Hero Content */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Apprenez. Évoluez. Excellez.
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Rejoignez des milliers d'apprenants passionnés. Accédez à des cours de qualité, 
              collaborez avec une communauté engagée et transformez votre avenir.
            </p>
          </div>

          {/* Back to Website Link */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Retour au site</span>
          </Link>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenue!</h2>
            <p className="text-muted-foreground">
              Connectez-vous pour continuer votre apprentissage
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" disabled={loading} />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>
              <Link to="#" className="text-sm text-primary hover:text-primary/80">
                Mot de passe oublié?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full" disabled={loading}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Pas encore de compte?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}