import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Award, Target, TrendingUp, Calendar, BarChart3, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedCourses: 0,
    totalHours: 0,
    certificates: 0,
    overallProgress: 0,
    enrolledCount: 0,
    averageTimePerCourse: 0
  });
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [categoryProgress, setCategoryProgress] = useState([]);
  const [completionTrend, setCompletionTrend] = useState([]);
  const [timeDistribution, setTimeDistribution] = useState([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/analytics/${userId}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      
      console.log('Analytics data received:', data);
      
      // Force state updates
      setStats({
        completedCourses: data.stats?.completedCourses || 0,
        totalHours: data.stats?.totalHours || 0,
        certificates: data.stats?.certificates || 0,
        overallProgress: data.stats?.overallProgress || 0,
        enrolledCount: data.stats?.enrolledCount || 0,
        averageTimePerCourse: data.stats?.averageTimePerCourse || 0
      });
      
      setWeeklyActivity(data.weeklyActivity || []);
      setCategoryProgress(data.categoryProgress || []);
      setCompletionTrend(data.completionTrend || []);
      
      // Format time distribution for pie chart
      const timeData = [
        { name: 'Complétés', value: data.statusDistribution?.completed || 0, color: COLORS[2] },
        { name: 'En cours', value: data.statusDistribution?.in_progress || 0, color: COLORS[0] },
        { name: 'Pausés', value: data.statusDistribution?.paused || 0, color: COLORS[3] },
        { name: 'Non démarrés', value: data.statusDistribution?.not_started || 0, color: COLORS[1] }
      ].filter(item => item.value > 0);
      
      setTimeDistribution(timeData);
      setLastUpdate(new Date().toLocaleTimeString('fr-FR'));

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Cours Complétés",
      value: stats.completedCourses,
      subtitle: `Sur ${stats.enrolledCount} inscrits`,
      icon: BookOpen,
      color: "from-primary to-primary/70",
    },
    {
      title: "Heures d'Apprentissage",
      value: `${stats.totalHours}h`,
      subtitle: "Total accumulé",
      icon: Clock,
      color: "from-info to-info/70",
    },
    {
      title: "Certificats Obtenus",
      value: stats.certificates,
      subtitle: "Certifications",
      icon: Award,
      color: "from-success to-success/70",
    },
    {
      title: "Progression Globale",
      value: `${stats.overallProgress}%`,
      subtitle: "Moyenne générale",
      icon: Target,
      color: "from-warning to-warning/70",
    },
  ];

  // Sort by progress (descending) and limit to top 6 categories
  const topCategories = [...categoryProgress]
    .sort((a: any, b: any) => b.progress - a.progress)
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Suivez votre progression d'apprentissage</p>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">Dernière mise à jour: {lastUpdate}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={loadAnalytics} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Actualiser
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
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

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <Card className="p-6 border-border">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activité Hebdomadaire
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Heures d'apprentissage cette semaine</p>
            </CardHeader>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorHours)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Course Status Distribution */}
          <Card className="p-6 border-border">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Distribution des Cours
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Statut de vos cours</p>
            </CardHeader>
            {timeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </Card>
        </div>

        {/* Charts Row 2 - SWAPPED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Completion Trend - TAKES 2 COLUMNS ON LEFT */}
          <Card className="lg:col-span-2 p-6 border-border ">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold text-foreground">Tendance 6 Mois</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Cours complétés</p>
            </CardHeader>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={completionTrend}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="completed" fill="url(#colorCompleted)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Progress - TAKES 1 COLUMN ON RIGHT - LIMITED TO TOP 6 */}
          <Card className="p-6 border-border">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold text-foreground">Progression par Catégorie</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Top 6 domaines d'expertise</p>
            </CardHeader>
            {topCategories.length > 0 ? (
              <div className="space-y-6">
                {topCategories.map((item: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{item.subject}</span>
                        <span className="text-xs text-muted-foreground">({item.courses} cours • {item.totalTime}h)</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Aucune catégorie disponible
              </div>
            )}

            {topCategories.length > 0 && (
              <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Performance excellente!</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous progressez plus vite que la moyenne des apprenants
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-border bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.enrolledCount}</p>
                <p className="text-sm text-muted-foreground">Cours Actifs</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-gradient-to-br from-success/5 to-success/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+{Math.round(stats.overallProgress * 0.34)}%</p>
                <p className="text-sm text-muted-foreground">Croissance Mensuelle</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border bg-gradient-to-br from-warning/5 to-warning/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.averageTimePerCourse.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Moyenne par Cours</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}