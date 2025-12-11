import { useState } from "react";
import { Users, Star, Bookmark, Flag, ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface CourseCardProps {
  title: string;
  instructor: string;
  instructorAvatar?: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  students: number;
  rating: number;
  image: string;
}

export function CourseCard({
  title,
  instructor,
  instructorAvatar,
  level,
  students,
  rating,
  image,
}: CourseCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSatisfied, setIsSatisfied] = useState(false);
  const { toast } = useToast();

  const levelColors = {
    Débutant: "bg-success/10 text-success border-success/20",
    Intermédiaire: "bg-warning/10 text-warning border-warning/20",
    Avancé: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Retiré des favoris" : "Ajouté aux favoris",
      description: isSaved ? "Le cours a été retiré de vos favoris." : "Le cours a été ajouté à vos favoris.",
    });
  };

  const handleReport = () => {
    toast({
      title: "Signalement envoyé",
      description: "Merci d'avoir signalé ce contenu. Notre équipe va l'examiner.",
    });
  };

  const handleSatisfaction = () => {
    setIsSatisfied(!isSatisfied);
    toast({
      title: isSatisfied ? "Satisfaction retirée" : "Merci pour votre retour !",
      description: isSatisfied ? "" : "Votre satisfaction a été enregistrée.",
    });
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-border bg-card">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            className={`bg-background/80 backdrop-blur-sm hover:bg-background ${isSaved ? "text-primary" : ""}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSatisfaction}
            className={`bg-background/80 backdrop-blur-sm hover:bg-background ${isSatisfied ? "text-success" : ""}`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isSatisfied ? "fill-success" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleReport}
            className="bg-background/80 backdrop-blur-sm hover:bg-background hover:text-destructive"
          >
            <Flag className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={levelColors[level]}>
            {level}
          </Badge>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{students}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span>{rating}</span>
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-lg line-clamp-2 text-card-foreground">
          {title}
        </h3>

        <div className="flex items-center gap-2 pt-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={instructorAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {instructor.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{instructor}</span>
        </div>
      </div>
    </Card>
  );
}
