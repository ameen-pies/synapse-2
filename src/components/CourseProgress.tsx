import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface CourseProgressProps {
  title: string;
  icon: string;
  progress: number;
  totalSessions: number;
  completedSessions: number;
  students: Array<{ name: string; avatar?: string }>;
  additionalStudents?: number;
}

export function CourseProgress({
  title,
  icon,
  progress,
  totalSessions,
  completedSessions,
  students,
  additionalStudents,
}: CourseProgressProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow border-border">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1 truncate">{title}</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Sessions complétées: {completedSessions}/{totalSessions}
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex -space-x-2">
          {students.slice(0, 4).map((student, i) => (
            <Avatar key={i} className="w-8 h-8 border-2 border-background">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {student.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          ))}
          {additionalStudents && additionalStudents > 0 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                +{additionalStudents}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
