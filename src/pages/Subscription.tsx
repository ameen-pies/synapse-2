import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, CreditCard, Zap, Crown, Star, Loader2, XCircle, Calendar, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PLANS = [
  {
    id: "basic",
    name: "Basique",
    price: "29.99",
    period: "mois",
    icon: Star,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "Parfait pour commencer",
    features: [
      "Accès à 50+ cours",
      "Certificats de base",
      "Support par email",
      "1 téléchargement/mois",
      "Accès forum communauté"
    ]
  },
  {
    id: "pro",
    name: "Professionnel",
    price: "59.99",
    period: "mois",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    description: "Le plus populaire",
    popular: true,
    features: [
      "Accès illimité à tous les cours",
      "Certificats professionnels",
      "Support prioritaire 24/7",
      "Téléchargements illimités",
      "Accès forum & groupes privés",
      "Sessions de mentorat mensuel",
      "Contenu exclusif"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "119.99",
    period: "mois",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    description: "Pour les experts",
    features: [
      "Tout du plan Professionnel",
      "Coaching 1-sur-1 hebdomadaire",
      "Accès anticipé aux nouveaux cours",
      "Projets réels d'entreprise",
      "Networking avec professionnels",
      "Certification premium",
      "Garantie emploi",
      "API & outils développeur"
    ]
  }
];

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<{
    planId: string | null;
    planName: string | null;
    date: string | null;
  }>({
    planId: null,
    planName: null,
    date: null
  });
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load current subscription
  useEffect(() => {
    const planId = localStorage.getItem('userSubscription');
    const planName = localStorage.getItem('userSubscriptionName');
    const date = localStorage.getItem('userSubscriptionDate');
    
    if (planId) {
      setCurrentSubscription({ planId, planName, date });
    }
  }, []);

  const handleSelectPlan = (planId: string) => {
    // Check if user already has an active subscription
    if (currentSubscription.planId) {
      toast({
        title: "Abonnement actif",
        description: "Vous avez déjà un abonnement actif. Annulez-le d'abord pour souscrire à un nouveau plan.",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlan(planId);
    const plan = PLANS.find(p => p.id === planId);
    
    toast({
      title: `Plan ${plan?.name} sélectionné`,
      description: "Cliquez sur 'Continuer vers le paiement' pour finaliser",
    });
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un plan d'abonnement",
        variant: "destructive"
      });
      return;
    }

    // Double check they don't have active subscription
    if (currentSubscription.planId) {
      toast({
        title: "Abonnement actif",
        description: "Vous avez déjà un abonnement actif",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const plan = PLANS.find(p => p.id === selectedPlan);
    
    // Remove icon components before passing to navigation state
    const planData = {
      id: plan?.id,
      name: plan?.name,
      price: plan?.price,
      period: plan?.period,
      description: plan?.description,
      features: plan?.features,
      popular: plan?.popular
    };
    
    // Navigate immediately to payment page
    setTimeout(() => {
      setLoading(false);
      navigate("/payment-checkout", { 
        state: { 
          plan: planData,
          planId: selectedPlan 
        },
        replace: false
      });
    }, 500);
  };

  const handleCancelSubscription = async () => {
    setCancelingSubscription(true);
    
    try {
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        // Remove subscription from database
        const response = await fetch(`http://localhost:5000/api/userdata/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: null // This will remove the subscription field
          })
        });

        if (!response.ok) {
          throw new Error('Failed to cancel subscription in database');
        }
      }

      // Remove subscription data from localStorage
      localStorage.removeItem('userSubscription');
      localStorage.removeItem('userSubscriptionName');
      localStorage.removeItem('userSubscriptionDate');
      
      // Update state
      setCurrentSubscription({
        planId: null,
        planName: null,
        date: null
      });

      // Trigger profile update
      window.dispatchEvent(new Event('profileUpdated'));

      toast({
        title: "Abonnement annulé",
        description: "Votre abonnement a été annulé avec succès. Vous pouvez vous réabonner à tout moment.",
      });

      setCancelingSubscription(false);
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'abonnement",
        variant: "destructive"
      });
      setCancelingSubscription(false);
    }
  };

  const getCurrentPlanDetails = () => {
    if (!currentSubscription.planId) return null;
    return PLANS.find(p => p.id === currentSubscription.planId);
  };

  const currentPlan = getCurrentPlanDetails();
  const nextBillingDate = currentSubscription.date 
    ? new Date(new Date(currentSubscription.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {currentSubscription.planId ? "Gérer mon abonnement" : "Choisissez votre plan d'abonnement"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {currentSubscription.planId 
                ? "Consultez les détails de votre abonnement ou changez de plan"
                : "Accédez à des milliers de cours et développez vos compétences sans limites"
              }
            </p>
          </div>
        </div>

        {/* Current Subscription Management */}
        {currentSubscription.planId && currentPlan && (
          <Card className="mb-12 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Badge className="bg-green-500 text-white">Actif</Badge>
                    Abonnement {currentPlan.name}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Votre abonnement actuel et ses avantages
                  </CardDescription>
                </div>
                <div className={`w-16 h-16 ${currentPlan.bgColor} rounded-2xl flex items-center justify-center`}>
                  <currentPlan.icon className={`w-8 h-8 ${currentPlan.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subscription Details */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-background/60 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Prix mensuel</div>
                  <div className="text-2xl font-bold text-foreground">{currentPlan.price} TND</div>
                  <div className="text-xs text-muted-foreground">+ TVA (19%)</div>
                </div>
                
                <div className="p-4 bg-background/60 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Date d'activation</div>
                  <div className="text-lg font-semibold text-foreground">
                    {currentSubscription.date 
                      ? new Date(currentSubscription.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Aujourd\'hui'
                    }
                  </div>
                </div>
                
                <div className="p-4 bg-background/60 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Prochain paiement</div>
                  <div className="text-lg font-semibold text-foreground">
                    {nextBillingDate || 'Dans 30 jours'}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Vos avantages actuels
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 ${currentPlan.color} flex-shrink-0 mt-0.5`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Subscription */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">
                      Annuler mon abonnement
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Vous perdrez l'accès à tous les avantages de votre plan. Vous pourrez vous réabonner à tout moment.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={cancelingSubscription}
                        >
                          {cancelingSubscription ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Annulation...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Annuler l'abonnement
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action annulera votre abonnement {currentPlan.name}. 
                            Vous perdrez immédiatement l'accès à :
                            <ul className="list-disc list-inside mt-3 space-y-1">
                              {currentPlan.features.slice(0, 4).map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                            <p className="mt-3 font-semibold">
                              Vous pourrez vous réabonner à tout moment.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Non, garder mon abonnement</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Oui, annuler l'abonnement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show plans only if no active subscription */}
        {!currentSubscription.planId && (
          <>
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <Card 
                    key={plan.id}
                    className={`relative transition-all cursor-pointer hover:shadow-lg flex flex-col ${
                      isSelected 
                        ? `ring-2 ring-primary ${plan.borderColor}` 
                        : 'border-border hover:border-primary/50'
                    } ${plan.popular ? 'md:scale-105' : ''}`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1">
                          Le plus populaire
                        </Badge>
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 ${plan.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`w-8 h-8 ${plan.color}`} />
                      </div>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                      <div className="mt-4">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                          <span className="text-muted-foreground text-sm">TND</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">par {plan.period}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-grow">
                      <ul className="space-y-3 mb-6 flex-grow">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className={`w-5 h-5 ${plan.color} flex-shrink-0 mt-0.5`} />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className="w-full mt-auto"
                        variant={isSelected ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(plan.id);
                        }}
                      >
                        {isSelected ? "Plan sélectionné" : "Choisir ce plan"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action Button */}
            {selectedPlan && (
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="min-w-[300px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Continuer vers le paiement
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-16 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Paiement sécurisé • Annulation à tout moment • Support 24/7
              </p>
              <div className="flex justify-center items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Satisfait ou remboursé 30 jours</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">+10,000 étudiants satisfaits</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Certification reconnue</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}