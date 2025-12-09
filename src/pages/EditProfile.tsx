import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Briefcase, Check, Loader2, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { userDataAPI } from "@/services/api";

// Mixed boy and girl avatars alternating for variety
const AVATAR_OPTIONS = [
  { id: "avatar-1", type: "boy", seed: "Felix" },
  { id: "avatar-2", type: "girl", seed: "Lily" },
  { id: "avatar-3", type: "boy", seed: "Oliver" },
  { id: "avatar-4", type: "girl", seed: "Emma" },
  { id: "avatar-5", type: "girl", seed: "Ava" },
  { id: "avatar-6", type: "boy", seed: "Noah" },
  { id: "avatar-7", type: "girl", seed: "Sophia" },
  { id: "avatar-8", type: "boy", seed: "Liam" },
  { id: "avatar-9", type: "boy", seed: "Ethan" },
  { id: "avatar-10", type: "girl", seed: "Isabella" },
  { id: "avatar-11", type: "boy", seed: "Lucas" },
  { id: "avatar-12", type: "girl", seed: "Mia" },
  { id: "avatar-13", type: "girl", seed: "Charlotte" },
  { id: "avatar-14", type: "boy", seed: "Mason" },
  { id: "avatar-15", type: "boy", seed: "James" },
  { id: "avatar-16", type: "girl", seed: "Amelia" },
  { id: "avatar-17", type: "girl", seed: "Harper" },
  { id: "avatar-18", type: "boy", seed: "Benjamin" },
  { id: "avatar-19", type: "boy", seed: "Alexander" },
  { id: "avatar-20", type: "girl", seed: "Evelyn" },
  { id: "avatar-21", type: "girl", seed: "Abigail" },
  { id: "avatar-22", type: "boy", seed: "Henry" },
  { id: "avatar-23", type: "boy", seed: "Sebastian" },
  { id: "avatar-24", type: "girl", seed: "Emily" }
];

const COUNTRIES = [
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+216", name: "Tunisia", flag: "🇹🇳" },
  { code: "+213", name: "Algeria", flag: "🇩🇿" },
  { code: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+91", name: "India", flag: "🇮🇳" },
];

const LOCATIONS = [
  "Tunis, Tunisia", "Paris, France", "London, UK", "New York, USA",
  "Berlin, Germany", "Madrid, Spain", "Rome, Italy", "Algiers, Algeria",
  "Casablanca, Morocco", "Dubai, UAE", "Toronto, Canada"
];

const PROFESSIONS = [
  "Étudiant", "Développeur", "Designer", "Ingénieur", "Enseignant",
  "Entrepreneur", "Marketing", "Data Scientist", "Product Manager",
  "Consultant", "Chercheur", "Autre"
];

export default function EditProfile() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    phoneCode: "+33",
    location: "",
    occupation: "",
    bio: "",
    avatar: "initials"
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const fromSignup = location.state?.fromSignup;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const storedName = localStorage.getItem('userName');
        const storedAvatar = localStorage.getItem('userAvatar');

        if (userId) {
          const userData = await userDataAPI.getById(userId);
          
          setProfile({
            name: userData.name || storedName || "",
            phone: userData.phone || "",
            phoneCode: userData.phoneCode || "+33",
            location: userData.location || "",
            occupation: userData.occupation || "",
            bio: userData.bio || "",
            avatar: userData.avatar || storedAvatar || "initials"
          });
        } else {
          setProfile(prev => ({
            ...prev,
            name: storedName || "",
            avatar: storedAvatar || "initials"
          }));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données",
          variant: "destructive"
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est requis",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error("User ID not found");
      }

      const updatedUser = await userDataAPI.update(userId, {
        name: profile.name,
        phone: profile.phone,
        phoneCode: profile.phoneCode,
        location: profile.location,
        occupation: profile.occupation,
        bio: profile.bio,
        avatar: profile.avatar
      });

      localStorage.setItem('userName', updatedUser.name);
      localStorage.setItem('userAvatar', updatedUser.avatar);

      window.dispatchEvent(new Event('profileUpdated'));

      toast({
        title: "Profil mis à jour! 🎉",
        description: "Vos informations ont été enregistrées avec succès",
      });

      setTimeout(() => {
        if (fromSignup) {
          navigate("/interests");
        } else {
          navigate("/dashboard");
        }
      }, 1000);

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (fromSignup) {
      navigate("/interests");
    } else {
      navigate("/dashboard");
    }
  };

  const handleRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * AVATAR_OPTIONS.length);
    const randomAvatar = AVATAR_OPTIONS[randomIndex];
    setProfile({...profile, avatar: randomAvatar.id});
  };

  const getAvatarUrl = (avatarId: string) => {
    if (avatarId === 'initials') {
      return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(profile.name)}`;
    }
    const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
    if (avatar) {
      return `https://avatar.iran.liara.run/public/${avatar.type}?username=${avatar.seed}`;
    }
    return `https://avatar.iran.liara.run/public`;
  };

  const scrollAvatars = (direction: 'left' | 'right') => {
    const container = document.getElementById('avatar-scroll-container');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Complétez votre profil</h1>
          <p className="text-muted-foreground">
            Aidez-nous à personnaliser votre expérience d'apprentissage
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32 ring-4 ring-primary/20">
                <AvatarImage src={getAvatarUrl(profile.avatar)} key={profile.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {profile.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">Choisissez votre avatar</p>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleRandomAvatar}
                disabled={loading}
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Avatar aléatoire
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProfile({...profile, avatar: 'initials'})}
                disabled={loading}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Initiales
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">Avatars disponibles</Label>
              <div className="relative py-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg"
                  onClick={() => scrollAvatars('left')}
                  disabled={loading || scrollPosition === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div 
                  id="avatar-scroll-container"
                  className="overflow-x-auto pb-4 pt-2 px-14 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style>
                    {`
                      #avatar-scroll-container::-webkit-scrollbar {
                        display: none;
                      }
                    `}
                  </style>
                  <div className="flex gap-3 min-w-max">
                    {AVATAR_OPTIONS.map((avatar) => {
                      const avatarUrl = `https://avatar.iran.liara.run/public/${avatar.type}?username=${avatar.seed}`;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setProfile({...profile, avatar: avatar.id})}
                          className={`relative rounded-lg p-2 transition-all hover:scale-105 flex-shrink-0 ${
                            profile.avatar === avatar.id
                              ? "ring-2 ring-primary bg-primary/10" 
                              : "hover:bg-accent"
                          }`}
                          disabled={loading}
                        >
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={avatarUrl} />
                          </Avatar>
                          {profile.avatar === avatar.id && (
                            <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg"
                  onClick={() => scrollAvatars('right')}
                  disabled={loading}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Utilisez les flèches pour naviguer entre les avatars
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="text-foreground">Nom d'affichage *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone" className="text-foreground">Téléphone</Label>
                <div className="flex gap-2">
                  <Select
                    value={profile.phoneCode}
                    onValueChange={(value) => setProfile({...profile, phoneCode: value})}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="12 34 56 78"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="flex-1"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location" className="text-foreground">Localisation</Label>
                <Select
                  value={profile.location}
                  onValueChange={(value) => setProfile({...profile, location: value})}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez votre ville">
                      {profile.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="occupation" className="text-foreground">Profession</Label>
                <Select
                  value={profile.occupation}
                  onValueChange={(value) => setProfile({...profile, occupation: value})}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez votre profession">
                      {profile.occupation && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {profile.occupation}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONS.map((profession) => (
                      <SelectItem key={profession} value={profession}>
                        {profession}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="text-foreground">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous un peu de vous et de vos objectifs d'apprentissage..."
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={4}
                  className="resize-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer et continuer"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSkip}
                className="flex-1"
                size="lg"
                disabled={loading}
              >
                Ignorer pour l'instant
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Vous pourrez modifier ces informations à tout moment dans les paramètres
        </p>
      </div>
    </div>
  );
}
