import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Briefcase, Check, Loader2, Mail, Phone, Lock, ArrowLeft, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCode: "+33",
    location: "",
    occupation: "",
    bio: "",
    avatar: "initials"
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const storedName = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');
        const storedAvatar = localStorage.getItem('userAvatar');

        if (userId) {
          const userData = await userDataAPI.getById(userId);
          
          setProfile({
            name: userData.name || storedName || "",
            email: userData.email || storedEmail || "",
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
            email: storedEmail || "",
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
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
        email: profile.email,
        phone: profile.phone,
        phoneCode: profile.phoneCode,
        location: profile.location,
        occupation: profile.occupation,
        bio: profile.bio,
        avatar: profile.avatar
      });

      localStorage.setItem('userName', updatedUser.name);
      localStorage.setItem('userEmail', updatedUser.email);
      localStorage.setItem('userAvatar', updatedUser.avatar);

      // Dispatch custom event to update UI immediately
      window.dispatchEvent(new Event('profileUpdated'));

      toast({
        title: "Profil mis à jour! 🎉",
        description: "Vos informations ont été enregistrées avec succès",
      });

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
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

      await userDataAPI.update(userId, {
        password: passwordData.newPassword
      });

      toast({
        title: "Mot de passe modifié! 🔒",
        description: "Votre mot de passe a été mis à jour",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordSection(false);

    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du mot de passe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate random avatar
  const handleRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * AVATAR_OPTIONS.length);
    const randomAvatar = AVATAR_OPTIONS[randomIndex];
    setProfile({...profile, avatar: randomAvatar.id});
  };

  // Get avatar URL based on type
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
      const scrollAmount = 250;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto py-3 px-3 sm:py-4 sm:px-4 md:py-6 md:px-6 lg:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-2 -ml-2"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Retour au tableau de bord</span>
            <span className="sm:hidden">Retour</span>
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Paramètres du profil</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          {/* Avatar Section */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Photo de profil</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Choisissez un avatar qui vous représente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 md:space-y-5">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 ring-4 ring-primary/20">
                  <AvatarImage src={getAvatarUrl(profile.avatar)} key={profile.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl md:text-3xl">
                    {profile.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs sm:text-sm text-muted-foreground">Avatar actuel</p>
              </div>

              {/* Random Avatar Button */}
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRandomAvatar}
                  disabled={loading}
                  className="gap-2 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                >
                  <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Générer un avatar aléatoire</span>
                  <span className="sm:hidden">Avatar aléatoire</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProfile({...profile, avatar: 'initials'})}
                  disabled={loading}
                  className="gap-2 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Utiliser mes initiales</span>
                  <span className="sm:hidden">Mes initiales</span>
                </Button>
              </div>

              {/* Scrollable Avatar Grid with Arrows */}
              <div className="space-y-2">
                <Label className="text-foreground text-xs sm:text-sm">Avatars disponibles</Label>
                <div className="relative py-2 sm:py-3">
                  {/* Left Arrow */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => scrollAvatars('left')}
                    disabled={loading || scrollPosition === 0}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>

                  {/* Avatar Container */}
                  <div 
                    id="avatar-scroll-container"
                    className="overflow-x-auto pb-2 sm:pb-3 pt-1 px-8 sm:px-10"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <style>
                      {`
                        #avatar-scroll-container::-webkit-scrollbar {
                          display: none;
                        }
                      `}
                    </style>
                    <div className="flex gap-1.5 sm:gap-2 md:gap-3 min-w-max">
                      {AVATAR_OPTIONS.map((avatar) => {
                        const avatarUrl = `https://avatar.iran.liara.run/public/${avatar.type}?username=${avatar.seed}`;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => setProfile({...profile, avatar: avatar.id})}
                            className={`relative rounded-lg p-1 sm:p-1.5 transition-all hover:scale-105 flex-shrink-0 ${
                              profile.avatar === avatar.id 
                                ? "ring-2 ring-primary bg-primary/10" 
                                : "hover:bg-accent"
                            }`}
                            disabled={loading}
                          >
                            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                              <AvatarImage src={avatarUrl} />
                            </Avatar>
                            {profile.avatar === avatar.id && (
                              <div className="absolute top-0.5 right-0.5 bg-primary rounded-full p-0.5">
                                <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => scrollAvatars('right')}
                    disabled={loading}
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Utilisez les flèches pour naviguer entre les avatars
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Informations personnelles</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Mettez à jour vos informations de profil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-3 sm:space-y-4 md:space-y-5">
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Name */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="name" className="text-foreground text-xs sm:text-sm">Nom d'affichage *</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Jean Dupont"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="pl-9 h-9 sm:h-10 text-sm"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="email" className="text-foreground text-xs sm:text-sm">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="pl-9 h-9 sm:h-10 text-sm"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                    <Label htmlFor="phone" className="text-foreground text-xs sm:text-sm">Téléphone</Label>
                    <div className="flex gap-2">
                      <Select
                        value={profile.phoneCode}
                        onValueChange={(value) => setProfile({...profile, phoneCode: value})}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-24 sm:w-28 h-9 sm:h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code} className="text-sm">
                              {country.flag} {country.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="12 34 56 78"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          className="pl-9 h-9 sm:h-10 text-sm"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="location" className="text-foreground text-xs sm:text-sm">Localisation</Label>
                    <Select
                      value={profile.location}
                      onValueChange={(value) => setProfile({...profile, location: value})}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full h-9 sm:h-10 text-sm">
                        <SelectValue placeholder="Sélectionnez votre ville">
                          {profile.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" />
                              {profile.location}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location} className="text-sm">
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Profession */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="occupation" className="text-foreground text-xs sm:text-sm">Profession</Label>
                    <Select
                      value={profile.occupation}
                      onValueChange={(value) => setProfile({...profile, occupation: value})}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full h-9 sm:h-10 text-sm">
                        <SelectValue placeholder="Sélectionnez votre profession">
                          {profile.occupation && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5" />
                              {profile.occupation}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PROFESSIONS.map((profession) => (
                          <SelectItem key={profession} value={profession} className="text-sm">
                            {profession}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-foreground text-xs sm:text-sm">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Parlez-nous un peu de vous et de vos objectifs d'apprentissage..."
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={3}
                      className="resize-none text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1 sm:pt-2">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer les modifications"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Mot de passe</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Modifiez votre mot de passe pour sécuriser votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordSection ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordSection(true)}
                  className="w-full md:w-auto h-9 sm:h-10 text-sm"
                >
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Changer le mot de passe
                </Button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className="text-xs sm:text-sm">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                      disabled={loading}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs sm:text-sm">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                      disabled={loading}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                      disabled={loading}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-1 sm:pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        });
                      }}
                      disabled={loading}
                      className="flex-1 sm:flex-none h-9 sm:h-10 text-sm"
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 sm:flex-none h-9 sm:h-10 text-sm">
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          <span className="hidden sm:inline">Modification...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Modifier le mot de passe</span>
                          <span className="sm:hidden">Modifier</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}