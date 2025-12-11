import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, Bell, Shield, GraduationCap, Accessibility, 
  Database, Users, Trash2, Download, Globe, Moon, Sun,
  Monitor, Check, Volume2, Clock, Eye, Mail,
  MessageSquare, Laptop, Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Appearance
    theme: "system",
    language: "fr",
    fontSize: "medium",
    reducedMotion: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    forumReplies: true,
    newMessages: true,
    weeklyDigest: true,
    
    // Privacy
    profileVisibility: "public",
    showActivity: true,
    showCourses: true,
    allowMessages: "everyone",
    
    // Learning
    autoplayVideos: true,
    showSubtitles: false,
    videoQuality: "auto",
    defaultView: "grid",
    
    // Accessibility
    screenReader: false,
    keyboardShortcuts: true,
    highContrast: false,
    
    // Community
    allowComments: true,
    moderateComments: false,
    showOnlineStatus: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Paramètre mis à jour",
      description: "Vos préférences ont été enregistrées",
    });
  };

  const SettingRow = ({ icon: Icon, title, description, children }: any) => (
    <div className="flex items-start justify-between py-4 gap-4">
      <div className="flex gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <Label className="text-base font-medium text-foreground cursor-pointer">{title}</Label>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Personnalisez votre expérience d'apprentissage
          </p>
        </div>

        {/* Appearance Section */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Apparence</CardTitle>
                <CardDescription>Personnalisez l'interface selon vos préférences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              icon={settings.theme === "light" ? Sun : settings.theme === "dark" ? Moon : Monitor}
              title="Thème"
              description="Choisissez entre le mode clair, sombre ou système"
            >
              <Select value={settings.theme} onValueChange={(v) => handleSettingChange("theme", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" /> Clair
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" /> Sombre
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> Système
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Globe}
              title="Langue"
              description="Langue de l'interface"
            >
              <Select value={settings.language} onValueChange={(v) => handleSettingChange("language", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="ar">🇹🇳 العربية</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Eye}
              title="Taille du texte"
              description="Ajustez la taille de la police"
            >
              <Select value={settings.fontSize} onValueChange={(v) => handleSettingChange("fontSize", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Petit</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="large">Grand</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Monitor}
              title="Réduire les animations"
              description="Minimiser les mouvements et transitions"
            >
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(v) => handleSettingChange("reducedMotion", v)}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Gérez vos préférences de notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              icon={Mail}
              title="Notifications par email"
              description="Recevez des mises à jour par email"
            >
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(v) => handleSettingChange("emailNotifications", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Smartphone}
              title="Notifications push"
              description="Notifications sur votre appareil"
            >
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(v) => handleSettingChange("pushNotifications", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={GraduationCap}
              title="Mises à jour de cours"
              description="Nouveaux contenus et leçons"
            >
              <Switch
                checked={settings.courseUpdates}
                onCheckedChange={(v) => handleSettingChange("courseUpdates", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={MessageSquare}
              title="Réponses du forum"
              description="Quand quelqu'un répond à vos posts"
            >
              <Switch
                checked={settings.forumReplies}
                onCheckedChange={(v) => handleSettingChange("forumReplies", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={MessageSquare}
              title="Nouveaux messages"
              description="Messages privés et conversations"
            >
              <Switch
                checked={settings.newMessages}
                onCheckedChange={(v) => handleSettingChange("newMessages", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Clock}
              title="Résumé hebdomadaire"
              description="Récapitulatif de votre activité"
            >
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(v) => handleSettingChange("weeklyDigest", v)}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Confidentialité et Sécurité</CardTitle>
                <CardDescription>Contrôlez qui peut voir vos informations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              icon={Eye}
              title="Visibilité du profil"
              description="Qui peut voir votre profil complet"
            >
              <Select value={settings.profileVisibility} onValueChange={(v) => handleSettingChange("profileVisibility", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="students">Étudiants uniquement</SelectItem>
                  <SelectItem value="private">Privé</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Clock}
              title="Afficher mon activité"
              description="Montrer mes dernières actions"
            >
              <Switch
                checked={settings.showActivity}
                onCheckedChange={(v) => handleSettingChange("showActivity", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={GraduationCap}
              title="Cours visibles"
              description="Afficher les cours suivis sur mon profil"
            >
              <Switch
                checked={settings.showCourses}
                onCheckedChange={(v) => handleSettingChange("showCourses", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={MessageSquare}
              title="Messages privés"
              description="Qui peut vous envoyer des messages"
            >
              <Select value={settings.allowMessages} onValueChange={(v) => handleSettingChange("allowMessages", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Tout le monde</SelectItem>
                  <SelectItem value="students">Étudiants uniquement</SelectItem>
                  <SelectItem value="none">Personne</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Préférences d'apprentissage</CardTitle>
                <CardDescription>Personnalisez votre expérience de cours</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              icon={Volume2}
              title="Lecture automatique des vidéos"
              description="Démarrer automatiquement la prochaine vidéo"
            >
              <Switch
                checked={settings.autoplayVideos}
                onCheckedChange={(v) => handleSettingChange("autoplayVideos", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={MessageSquare}
              title="Sous-titres par défaut"
              description="Afficher les sous-titres automatiquement"
            >
              <Switch
                checked={settings.showSubtitles}
                onCheckedChange={(v) => handleSettingChange("showSubtitles", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Monitor}
              title="Qualité vidéo"
              description="Qualité de lecture par défaut"
            >
              <Select value={settings.videoQuality} onValueChange={(v) => handleSettingChange("videoQuality", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatique</SelectItem>
                  <SelectItem value="1080p">1080p (HD)</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Laptop}
              title="Affichage des cours"
              description="Vue par défaut de la liste de cours"
            >
              <Select value={settings.defaultView} onValueChange={(v) => handleSettingChange("defaultView", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grille</SelectItem>
                  <SelectItem value="list">Liste</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Accessibility className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Accessibilité</CardTitle>
                <CardDescription>Options pour améliorer votre expérience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              icon={Volume2}
              title="Support lecteur d'écran"
              description="Optimiser pour les lecteurs d'écran"
            >
              <Switch
                checked={settings.screenReader}
                onCheckedChange={(v) => handleSettingChange("screenReader", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Laptop}
              title="Raccourcis clavier"
              description="Activer la navigation au clavier"
            >
              <Switch
                checked={settings.keyboardShortcuts}
                onCheckedChange={(v) => handleSettingChange("keyboardShortcuts", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Eye}
              title="Contraste élevé"
              description="Augmenter le contraste des couleurs"
            >
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(v) => handleSettingChange("highContrast", v)}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Community */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Communauté</CardTitle>
                <CardDescription>Gérez vos interactions avec la communauté</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              icon={MessageSquare}
              title="Autoriser les commentaires"
              description="Permettre aux autres de commenter vos posts"
            >
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(v) => handleSettingChange("allowComments", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Shield}
              title="Modération des commentaires"
              description="Approuver les commentaires avant publication"
            >
              <Switch
                checked={settings.moderateComments}
                onCheckedChange={(v) => handleSettingChange("moderateComments", v)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              icon={Users}
              title="Statut en ligne"
              description="Montrer quand vous êtes connecté"
            >
              <Switch
                checked={settings.showOnlineStatus}
                onCheckedChange={(v) => handleSettingChange("showOnlineStatus", v)}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Données et Stockage</CardTitle>
                <CardDescription>Gérez vos données et votre stockage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-4">
              <div>
                <Label className="text-base font-medium text-foreground">Vider le cache</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Supprimer les fichiers temporaires (243 MB)
                </p>
              </div>
              <Button variant="outline">Vider</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-4">
              <div>
                <Label className="text-base font-medium text-foreground">Exporter mes données</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Télécharger toutes vos données personnelles
                </p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-4">
              <div>
                <Label className="text-base font-medium text-destructive">Supprimer mon compte</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Supprimer définitivement votre compte et toutes vos données
                </p>
              </div>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 pb-8">
          <Button variant="outline">Réinitialiser</Button>
          <Button className="gap-2">
            <Check className="w-4 h-4" />
            Enregistrer tous les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
}