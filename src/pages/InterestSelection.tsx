import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const pastelMap = ['#C7D7FF','#D6C9FF','#DDEBFF','#CFE9F9','#E8DCFF','#BFD7ED'];

const topics = {
  "AI": ["Machine Learning","Deep Learning","NLP","Computer Vision","AI Agents","Reinforcement Learning","Generative AI"],
  "Web Development": ["Frontend","Backend","Full Stack","React","Vue","Django","APIs"],
  "Data Science": ["Pandas","NumPy","Statistics","Visualization","Big Data","Feature Engineering"],
  "Cloud": ["AWS","Azure","Google Cloud","Kubernetes","Serverless","MLOps"],
  "Cybersecurity": ["Ethical Hacking","Cryptography","Network Security","Pen Testing","Cloud Security"],
  "Blockchain": ["Smart Contracts","Solidity","DeFi","NFTs","Web3 Development"],
  "Robotics": ["ROS","Control Systems","Autonomous Vehicles","Drone Tech"],
  "Mobile": ["Android","iOS","Flutter","React Native"],
  "Math & Stats": ["Linear Algebra","Calculus","Probability","Optimization"],
  "UX/UI": ["Figma","Accessibility","Design Systems","Prototyping"],
  "DevOps": ["CI/CD","Docker","Monitoring","Terraform"],
  "Business": ["Product Management","Marketing","Entrepreneurship","Finance"],
  "IoT": ["Edge Computing","MQTT","Sensors","IoT Security"],
  "AR/VR": ["Unity","Unreal","3D Modeling","Spatial UX"],
  "Bio & HealthTech": ["Bioinformatics","Medical Imaging","Health Analytics"],
  "Graphics & GameDev": ["Shaders","3D Modeling","Game Physics"],
  "Quantum": ["Qubits","Qiskit","Quantum Algorithms"],
  "Soft Skills": ["Interview Prep","Communication","Time Management"]
};

export default function InterestSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRoots, setSelectedRoots] = useState<Set<string>>(new Set());
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [subchips, setSubchips] = useState<{[key: string]: string}>({});

  const userId = localStorage.getItem('userId');
  const userEmail = location.state?.email || localStorage.getItem('userEmail');

  const pastelForIndex = (i: number) => pastelMap[i % pastelMap.length];

  const handleRootClick = (root: string, idx: number) => {
    const newSelectedRoots = new Set(selectedRoots);
    const newSubchips = { ...subchips };
    const color = pastelForIndex(idx);

    if (selectedRoots.has(root)) {
      newSelectedRoots.delete(root);
      topics[root as keyof typeof topics].forEach(sub => {
        delete newSubchips[sub];
        selectedSubs.delete(sub);
      });
    } else {
      newSelectedRoots.add(root);
      topics[root as keyof typeof topics].forEach(sub => {
        newSubchips[sub] = color;
      });
    }

    setSelectedRoots(newSelectedRoots);
    setSubchips(newSubchips);
    setSelectedSubs(new Set(selectedSubs));
  };

  const handleSubClick = (sub: string) => {
    const newSelectedSubs = new Set(selectedSubs);
    if (selectedSubs.has(sub)) {
      newSelectedSubs.delete(sub);
    } else {
      newSelectedSubs.add(sub);
    }
    setSelectedSubs(newSelectedSubs);
  };

  const handleClear = () => {
    setSelectedRoots(new Set());
    setSelectedSubs(new Set());
    setSubchips({});
  };

  const handleStart = async () => {
    const all = [...Array.from(selectedRoots), ...Array.from(selectedSubs)];
    
    if (all.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un sujet d'intérêt",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Save interests to database
      const response = await fetch('http://localhost:5000/api/userdata/save-interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          email: userEmail,
          interests: all
        })
      });

      if (!response.ok) throw new Error('Failed to save interests');

      // Store in localStorage for immediate use
      localStorage.setItem('userInterests', JSON.stringify(all));

      toast({
        title: "Intérêts enregistrés! 🎉",
        description: "Génération de vos recommandations personnalisées...",
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      console.error("Error saving interests:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos intérêts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Commencez votre parcours d'apprentissage
          </h1>
          <p className="text-muted-foreground text-lg">
            Sélectionnez vos sujets d'intérêt. Choisir une catégorie principale révèle des sous-thèmes associés.
          </p>
        </div>

        {/* Root Topics */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.keys(topics).map((root, idx) => (
              <button
                key={root}
                onClick={() => handleRootClick(root, idx)}
                className={`px-5 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-1 shadow-md ${
                  selectedRoots.has(root)
                    ? 'bg-green-500 text-white scale-105 shadow-lg shadow-green-500/30'
                    : 'bg-card hover:bg-card/80'
                }`}
                style={!selectedRoots.has(root) ? { backgroundColor: '#eef4ff' } : undefined}
              >
                {root}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Topics */}
        {Object.keys(subchips).length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.entries(subchips).map(([sub, color]) => (
                <button
                  key={sub}
                  onClick={() => handleSubClick(sub)}
                  className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-1 shadow-md ${
                    selectedSubs.has(sub)
                      ? 'bg-green-500 text-white scale-105 shadow-lg shadow-green-500/30'
                      : ''
                  }`}
                  style={!selectedSubs.has(sub) ? { backgroundColor: color, color: '#0c1630' } : undefined}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Summary */}
        {(selectedRoots.size > 0 || selectedSubs.size > 0) && (
          <div className="mb-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card rounded-2xl p-6 shadow-lg border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">VOS SÉLECTIONS :</h3>
              <div className="flex flex-wrap gap-3">
                {Array.from(selectedRoots).map((root, idx) => (
                  <div key={root} className="flex items-center gap-2">
                    <Badge 
                      className="text-sm px-4 py-2 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: pastelForIndex(Object.keys(topics).indexOf(root)) }}
                    >
                      <span className="text-foreground">{root}</span>
                      <button
                        onClick={() => handleRootClick(root, Object.keys(topics).indexOf(root))}
                        className="ml-2 hover:scale-110 transition-transform"
                      >
                        ×
                      </button>
                    </Badge>
                    {Array.from(selectedSubs).filter(sub => 
                      topics[root as keyof typeof topics]?.includes(sub)
                    ).map(sub => (
                      <Badge 
                        key={sub}
                        className="text-sm px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: pastelForIndex(Object.keys(topics).indexOf(root)) }}
                      >
                        <span className="text-foreground">{sub}</span>
                        <button
                          onClick={() => handleSubClick(sub)}
                          className="ml-2 hover:scale-110 transition-transform"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <Button
            onClick={handleStart}
            disabled={loading || (selectedRoots.size === 0 && selectedSubs.size === 0)}
            size="lg"
            className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Commencer mon apprentissage"
            )}
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            size="lg"
            disabled={loading}
            className="px-8 py-6 text-lg font-semibold"
          >
            Effacer les sélections
          </Button>
        </div>
      </div>
    </div>
  );
}