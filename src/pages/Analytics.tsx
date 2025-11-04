import { Card } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, Award, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const statsCards = [
  {
    title: "Cours Complétés",
    value: "12+",
    subtitle: "Ce mois",
    icon: BookOpen,
    color: "from-primary to-primary/70",
  },
  {
    title: "Heures d'Apprentissage",
    value: "87h",
    subtitle: "Total",
    icon: Clock,
    color: "from-info to-info/70",
  },
  {
    title: "Certificats Obtenus",
    value: "5",
    subtitle: "Certifications",
    icon: Award,
    color: "from-success to-success/70",
  },
  {
    title: "Objectifs Atteints",
    value: "90%",
    subtitle: "Ce trimestre",
    icon: Target,
    color: "from-warning to-warning/70",
  },
];

const recentActivity = [
  {
    type: "course",
    title: "Formation Python Complétée",
    user: "Vous avez terminé le cours",
    time: "Il y a 2h",
    icon: BookOpen,
  },
  {
    type: "quiz",
    title: "Quiz Machine Learning",
    user: "Score: 95/100",
    time: "Hier",
    icon: Target,
  },
  {
    type: "certificate",
    title: "Certificat Obtenu",
    user: "Data Science Fundamentals",
    time: "Il y a 3 jours",
    icon: Award,
  },
];

const learningProgress = [
  { subject: "Python", progress: 85, color: "bg-primary" },
  { subject: "Machine Learning", progress: 65, color: "bg-info" },
  { subject: "Business Analytics", progress: 45, color: "bg-warning" },
  { subject: "Mathématiques", progress: 72, color: "bg-success" },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Suivez votre progression d'apprentissage</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="p-6 border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm mb-2">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Progress */}
          <Card className="lg:col-span-2 p-6 border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Progression par Matière</h2>
            <div className="space-y-6">
              {learningProgress.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{item.subject}</span>
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Performance en hausse!</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre vitesse d'apprentissage a augmenté de 23% ce mois
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Activités Récentes</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <activity.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-sm text-muted-foreground">Étudiants Connectés</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+34%</p>
                <p className="text-sm text-muted-foreground">Amélioration Mensuelle</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2.5h</p>
                <p className="text-sm text-muted-foreground">Temps Moyen/Jour</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
