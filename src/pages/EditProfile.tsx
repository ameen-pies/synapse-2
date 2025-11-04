import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Briefcase, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AVATAR_OPTIONS = [
  "Felix", "Aneka", "Luna", "Charlie", "Mia", "Oliver", 
  "Sophie", "Max", "Emma", "Leo", "Zoe", "Jack"
];

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    occupation: "",
    bio: "",
    avatar: "Felix"
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    navigate("/dashboard");
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Complétez votre profil</h1>
          <p className="text-muted-foreground">
            Aidez-nous à personnaliser votre expérience d'apprentissage
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatar}`} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {profile.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">Choisissez votre avatar</p>
            </div>

            {/* Avatar Selection Grid */}
            <div className="space-y-3">
              <Label className="text-foreground">Avatars disponibles</Label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setProfile({...profile, avatar: seed})}
                    className={`relative rounded-lg p-2 transition-all hover:scale-105 ${
                      profile.avatar === seed 
                        ? "ring-2 ring-primary bg-primary/10" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <Avatar className="w-full aspect-square">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} />
                    </Avatar>
                    {profile.avatar === seed && (
                      <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nom complet *</Label>
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground">Localisation</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Paris, France"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="occupation" className="text-foreground">Profession</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="occupation"
                    type="text"
                    placeholder="Développeur, Étudiant, Designer..."
                    value={profile.occupation}
                    onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                    className="pl-10"
                  />
                </div>
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
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" size="lg">
                Enregistrer et continuer
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSkip}
                className="flex-1"
                size="lg"
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
