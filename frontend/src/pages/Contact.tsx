import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock professors list - will be linked to MongoDB later
const PROFESSORS = [
  "Dr. Marie Dubois",
  "Prof. Jean Martin",
  "Dr. Sophie Laurent",
  "Prof. Pierre Bernard",
  "Dr. Claire Moreau"
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    recipient: "",
    professor: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });
    setFormData({
      name: "",
      email: "",
      recipient: "",
      professor: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Contactez-nous</h1>
        <p className="text-muted-foreground">
          Une question ? Un problème ? N'hésitez pas à nous contacter.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Destinataire *</Label>
            <Select value={formData.recipient} onValueChange={(value) => setFormData({...formData, recipient: value, professor: ""})}>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un destinataire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professor">Un professeur</SelectItem>
                <SelectItem value="synapse">L'équipe Synapse</SelectItem>
                <SelectItem value="support">Support technique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recipient === "professor" && (
            <div className="space-y-2">
              <Label htmlFor="professor">Sélectionner un professeur *</Label>
              <Select value={formData.professor} onValueChange={(value) => setFormData({...formData, professor: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez un professeur" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSORS.map((prof) => (
                    <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              type="text"
              placeholder="Objet de votre message"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Décrivez votre demande en détail..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={6}
              className="resize-none"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Send className="w-4 h-4 mr-2" />
            Envoyer le message
          </Button>
        </form>
      </Card>
    </div>
  );
}
