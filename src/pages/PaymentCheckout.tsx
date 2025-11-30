import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft, CreditCard, Lock, Check, AlertCircle, 
  Loader2, Mail, Calendar, User, Building, Landmark, Smartphone 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { plan, planId } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    email: localStorage.getItem('userEmail') || "",
    country: "Tunisie",
    phoneNumber: ""
  });

  // Redirect if no plan selected
  if (!plan || !planId) {
    setTimeout(() => {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un plan",
        variant: "destructive"
      });
      navigate("/subscription");
    }, 0);
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16));
    handleInputChange('cardNumber', formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    handleInputChange('expiryDate', formatted);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!paymentData.email.includes('@')) {
      toast({
        title: "Erreur",
        description: "Email invalide",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === "card") {
      if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
        toast({
          title: "Erreur",
          description: "Numéro de carte invalide",
          variant: "destructive"
        });
        return;
      }

      if (paymentData.cvv.length !== 3) {
        toast({
          title: "Erreur",
          description: "CVV invalide",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        toast({
          title: "Erreur",
          description: "Session expirée. Veuillez vous reconnecter.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Initiate payment - send verification email
      const response = await axios.post('http://localhost:5000/api/userdata/initiate-payment', {
        userId: userId,
        email: paymentData.email,
        planId: planId,
        plan: plan,
        paymentMethod: paymentMethod
      });

      if (response.data.success) {
        toast({
          title: "Email envoyé ! 📧",
          description: "Vérifiez votre boîte mail pour confirmer le paiement",
        });

        // Navigate to waiting page
        setTimeout(() => {
          setLoading(false);
          navigate("/payment-pending", { 
            state: { 
              email: paymentData.email,
              plan: plan,
              planId: planId
            } 
          });
        }, 1500);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur s'est produite",
        variant: "destructive"
      });
    }
  };

  const calculateTotal = () => {
    const price = parseFloat(plan.price);
    const tax = price * 0.19; // 19% TVA
    return {
      subtotal: price.toFixed(3),
      tax: tax.toFixed(3),
      total: (price + tax).toFixed(3)
    };
  };

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/subscription")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux plans
          </Button>
          
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Finaliser votre abonnement
            </h1>
            <p className="text-muted-foreground">
              Un email de confirmation sera envoyé pour valider votre paiement
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations de contact
                  </CardTitle>
                  <CardDescription>
                    Un email de confirmation sera envoyé à cette adresse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={paymentData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Select
                      value={paymentData.country}
                      onValueChange={(value) => handleInputChange('country', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tunisie">🇹🇳 Tunisie</SelectItem>
                        <SelectItem value="France">🇫🇷 France</SelectItem>
                        <SelectItem value="Belgique">🇧🇪 Belgique</SelectItem>
                        <SelectItem value="Suisse">🇨🇭 Suisse</SelectItem>
                        <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Méthode de paiement</CardTitle>
                  <CardDescription>
                    Choisissez votre méthode de paiement préférée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="w-5 h-5" />
                        <span>Carte bancaire</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Landmark className="w-5 h-5" />
                        <span>Virement bancaire</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="w-5 h-5" />
                        <span>Paiement mobile (D17, Ooredoo Money)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Information based on method */}
              {paymentMethod === "card" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Informations de paiement
                    </CardTitle>
                    <CardDescription>
                      Tous les paiements sont sécurisés et cryptés
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardHolder">Titulaire de la carte *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="cardHolder"
                          type="text"
                          placeholder="AHMED BEN MOHAMED"
                          value={paymentData.cardHolder}
                          onChange={(e) => handleInputChange('cardHolder', e.target.value.toUpperCase())}
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Numéro de carte *</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={handleCardNumberChange}
                          className="pl-10"
                          required
                          disabled={loading}
                          maxLength={19}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Date d'expiration *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="expiry"
                            type="text"
                            placeholder="MM/AA"
                            value={paymentData.expiryDate}
                            onChange={handleExpiryChange}
                            className="pl-10"
                            required
                            disabled={loading}
                            maxLength={5}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="cvv"
                            type="text"
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                            className="pl-10"
                            required
                            disabled={loading}
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "mobile" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Paiement mobile
                    </CardTitle>
                    <CardDescription>
                      Entrez votre numéro de téléphone
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+216 XX XXX XXX"
                        value={paymentData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "bank" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Landmark className="w-5 h-5" />
                      Virement bancaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Coordonnées bancaires :</p>
                      <p>Banque : STB Tunisie</p>
                      <p>RIB : XX XX XXXX XXXX XXXX XXXX XX</p>
                      <p>Bénéficiaire : Synapse Learning Platform</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong>Nouvelle sécurité :</strong> Un email avec un lien de confirmation sera envoyé à votre adresse. 
                  Cliquez sur le lien pour valider votre paiement et activer votre abonnement.
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Envoi de l'email...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Envoyer l'email de confirmation
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    {plan.popular && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        Populaire
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    {plan.features?.slice(0, 3).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features && plan.features.length > 3 && (
                      <p className="text-sm text-primary mt-2">
                        +{plan.features.length - 3} autres avantages
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Abonnement mensuel</span>
                    <span className="font-medium">{totals.subtotal} TND</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TVA (19%)</span>
                    <span className="font-medium">{totals.tax} TND</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">{totals.total} TND</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Facturé mensuellement. Annulez à tout moment.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Ce que vous obtenez :
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Confirmation par email sécurisée
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Accès immédiat après validation
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Support client 24/7
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Annulation en un clic
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Paiement sécurisé SSL</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    <span>Conforme PCI DSS</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Plus de 10,000 étudiants nous font confiance
          </p>
        </div>
      </div>
    </div>
  );
}