import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Home, GraduationCap, Download, 
  Mail, Calendar, CreditCard, Sparkles, Landmark, Smartphone 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { plan, planId, paymentMethod } = location.state || {};

  // Redirect if no data
  if (!plan || !planId) {
    setTimeout(() => {
      toast({
        title: "Redirection",
        description: "Retour au tableau de bord",
      });
      navigate("/dashboard");
    }, 0);
    return null;
  }

  const subscriptionDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalWithTax = (parseFloat(plan.price) * 1.19).toFixed(3);

  const getPaymentMethodIcon = () => {
    switch(paymentMethod) {
      case 'card': return CreditCard;
      case 'bank': return Landmark;
      case 'mobile': return Smartphone;
      default: return CreditCard;
    }
  };

  const getPaymentMethodLabel = () => {
    switch(paymentMethod) {
      case 'card': return 'Carte bancaire';
      case 'bank': return 'Virement bancaire';
      case 'mobile': return 'Paiement mobile';
      default: return 'Carte bancaire';
    }
  };

  // Download receipt function
  const handleDownloadReceipt = () => {
    try {
      const receiptContent = `
╔════════════════════════════════════════════════════════════╗
║                    REÇU DE PAIEMENT                        ║
║                      SYNAPSE                               ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Date: ${new Date().toLocaleString('fr-FR')}              ║
║  Reçu #: ${Date.now()}                                     ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  DÉTAILS CLIENT                                            ║
╠════════════════════════════════════════════════════════════╣
║  Nom: ${localStorage.getItem('userName') || 'Client'}     ║
║  Email: ${localStorage.getItem('userEmail') || 'N/A'}     ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  DÉTAILS DE L'ABONNEMENT                                   ║
╠════════════════════════════════════════════════════════════╣
║  Plan: ${plan.name}                                        ║
║  Type: Abonnement mensuel                                 ║
║  Méthode de paiement: ${getPaymentMethodLabel()}          ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  MONTANT                                                   ║
╠════════════════════════════════════════════════════════════╣
║  Prix mensuel:                            ${plan.price} TND║
║  TVA (19%):                ${(parseFloat(plan.price) * 0.19).toFixed(3)} TND║
║  ─────────────────────────────────────────────────────     ║
║  TOTAL PAYÉ:                              ${totalWithTax} TND║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  INFORMATIONS D'ABONNEMENT                                 ║
╠════════════════════════════════════════════════════════════╣
║  Date d'activation: ${subscriptionDate}                    ║
║  Prochain paiement: ${nextBillingDate}                     ║
║  Statut: ACTIF ✓                                          ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  CE QUE VOUS OBTENEZ                                       ║
╠════════════════════════════════════════════════════════════╣
${(plan.features || []).map((f: string) => `║  ✓ ${f.padEnd(55)}║`).join('\n')}
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  SUPPORT CLIENT                                            ║
╠════════════════════════════════════════════════════════════╣
║  Email: support@synapse.com                               ║
║  Disponible 24/7                                          ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  Merci pour votre confiance !                             ║
║  © 2024 Synapse - Tous droits réservés                    ║
╚════════════════════════════════════════════════════════════╝

Ce reçu est généré automatiquement et constitue une preuve
de paiement valide.

Pour toute question concernant votre abonnement, contactez-nous
à support@synapse.com
      `.trim();

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Synapse_Recu_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Reçu téléchargé ✓",
        description: "Votre reçu a été téléchargé avec succès",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le reçu",
        variant: "destructive"
      });
    }
  };

  const PaymentIcon = getPaymentMethodIcon();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-green-500/20 shadow-xl">
          <CardContent className="pt-8 pb-8 px-6 sm:px-12">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Paiement réussi ! 🎉
              </h1>
              
              <p className="text-lg text-muted-foreground mb-4">
                Félicitations ! Votre abonnement est maintenant actif
              </p>
              
              <Badge className="bg-primary text-primary-foreground text-base px-4 py-1.5">
                Abonnement {plan.name}
              </Badge>
            </div>

            {/* Subscription Details */}
            <div className="space-y-4 mb-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Montant payé</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {totalWithTax} TND
                  </p>
                  <p className="text-xs text-muted-foreground">TVA incluse (19%)</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <PaymentIcon className="w-4 h-4" />
                    <span className="text-sm">Méthode de paiement</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {getPaymentMethodLabel()}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date d'activation</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {subscriptionDate}
                </p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      Email de confirmation envoyé
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Un reçu et les détails de votre abonnement ont été envoyés à votre adresse email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">
                      Prochain paiement
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Le {nextBillingDate} • {plan.price} TND + TVA
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vous pouvez annuler à tout moment depuis vos paramètres
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-3 mb-8">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Prochaines étapes
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-primary-foreground text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Explorez vos cours</p>
                    <p className="text-sm text-muted-foreground">
                      Accédez immédiatement à tous les cours de votre plan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-primary-foreground text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Rejoignez la communauté</p>
                    <p className="text-sm text-muted-foreground">
                      Participez aux forums et groupes d'étude
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-primary-foreground text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Complétez votre profil</p>
                    <p className="text-sm text-muted-foreground">
                      Personnalisez votre expérience d'apprentissage
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - FIXED CONTRAST */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={() => navigate("/dashboard")}
              >
                <Home className="w-5 h-5 mr-2" />
                Aller au tableau de bord
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate("/courses")}
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Explorer les cours
              </Button>
            </div>

            {/* Download Receipt - FIXED */}
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadReceipt}
                className="text-primary hover:text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le reçu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Info */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            Des questions ? Contactez notre support à{" "}
            <a href="mailto:support@synapse.com" className="text-primary hover:underline">
              support@synapse.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}