import { CourseCard } from "@/components/CourseCard";
import { CourseProgress } from "@/components/CourseProgress";
import { Button } from "@/components/ui/button";
import coursePython from "@/assets/course-python.jpg";
import courseBusiness from "@/assets/course-business.jpg";
import courseMath from "@/assets/course-math.jpg";
import courseMachineLearning from "@/assets/course-machine-learning.jpg";

const suggestedCourses = [
  {
    title: "Formation Complète Python - Les Bases du Développement",
    instructor: "Marie Dubois",
    level: "Débutant" as const,
    students: 118,
    rating: 5.0,
    image: coursePython,
  },
  {
    title: "Guide du Débutant: Gestion d'Entreprise et Analyse",
    instructor: "Sophie Martin",
    level: "Débutant" as const,
    students: 234,
    rating: 4.8,
    image: courseBusiness,
  },
  {
    title: "Théorie des Probabilités: Applications Pratiques",
    instructor: "Jean Dupont",
    level: "Intermédiaire" as const,
    students: 87,
    rating: 4.9,
    image: courseMath,
  },
  {
    title: "Introduction au Machine Learning et Intelligence Artificielle",
    instructor: "Thomas Bernard",
    level: "Avancé" as const,
    students: 19,
    rating: 5.0,
    image: courseMachineLearning,
  },
];

const myCourses = [
  {
    title: "IA & Réalité Virtuelle",
    icon: "🥽",
    progress: 75,
    completedSessions: 9,
    totalSessions: 12,
    students: [
      { name: "Alice Laurent" },
      { name: "Bob Martin" },
      { name: "Claire Dubois" },
      { name: "David Bernard" },
    ],
    additionalStudents: 17,
  },
  {
    title: "Photographie",
    icon: "📸",
    progress: 42,
    completedSessions: 10,
    totalSessions: 24,
    students: [
      { name: "Emma Petit" },
      { name: "Felix Moreau" },
      { name: "Grace Simon" },
      { name: "Hugo Thomas" },
    ],
    additionalStudents: 9,
  },
  {
    title: "Écosystème des Entreprises",
    icon: "🌍",
    progress: 61,
    completedSessions: 11,
    totalSessions: 18,
    students: [
      { name: "Isabelle Roux" },
      { name: "Julien Andre" },
      { name: "Karine Michel" },
      { name: "Lucas Girard" },
    ],
    additionalStudents: 11,
  },
  {
    title: "Développement React Native",
    icon: "⚛️",
    progress: 49,
    completedSessions: 18,
    totalSessions: 37,
    students: [
      { name: "Marie Blanc" },
      { name: "Nicolas Faure" },
      { name: "Olivia Morel" },
      { name: "Pierre Fontaine" },
    ],
    additionalStudents: 8,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bienvenue sur Synapse</h1>
            <p className="text-muted-foreground mt-1">Continuez votre apprentissage</p>
          </div>
        </div>

        {/* Suggested Courses Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Cours qui pourraient vous intéresser
            </h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              Voir tout
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestedCourses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>
        </section>

        {/* My Courses Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Mes cours en cours
            </h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              Voir tout
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myCourses.map((course, index) => (
              <CourseProgress key={index} {...course} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
