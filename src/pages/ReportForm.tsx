import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportFormProps {
  contentId: string;
  contentType: "course" | "blog" | "forum";
  contentTitle?: string;
  trigger?: React.ReactNode;
}

export default function ReportForm({
  contentId,
  contentType,
  contentTitle,
  trigger,
}: ReportFormProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reportReasons = [
    "Contenu inapproprié",
    "Spam ou publicité",
    "Harcèlement ou intimidation",
    "Fausses informations",
    "Violation de droits d'auteur",
    "Contenu offensant",
    "Autre",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    const reporterId = localStorage.getItem("userId");
    if (!reporterId) {
      toast.error("Vous devez être connecté pour signaler du contenu");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          contentType,
          reporterId,
          reason,
          message,
        }),
      });

      if (response.ok) {
        toast.success("Signalement envoyé avec succès");
        setReason("");
        setMessage("");
        setOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de l'envoi du signalement");
      }
    } catch (error) {
      console.error("Report error:", error);
      toast.error("Erreur réseau lors de l'envoi du signalement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Signaler
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Signaler un contenu
          </DialogTitle>
          <DialogDescription>
            Aidez-nous à maintenir une communauté sûre en signalant du contenu
            inapproprié.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {contentTitle && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">
                Contenu signalé:
              </p>
              <p className="text-sm font-semibold mt-1">{contentTitle}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Raison du signalement *
            </Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="font-normal cursor-pointer">
                    {r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Détails supplémentaires (optionnel)</Label>
            <Textarea
              id="message"
              placeholder="Décrivez le problème en détail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Fournissez plus d'informations pour nous aider à traiter votre
              signalement.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Les faux signalements peuvent entraîner des
              sanctions sur votre compte. Veuillez signaler uniquement du contenu
              qui viole réellement nos conditions d'utilisation.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!reason || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer le signalement"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}