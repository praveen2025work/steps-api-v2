import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, User, Calendar, ChevronRight, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type WorkflowStatus = "pending" | "in-progress" | "completed" | "rejected";

interface WorkflowStatusCardProps {
  id: string;
  title: string;
  status: WorkflowStatus;
  progress: number;
  dueDate: string;
  assignee: string;
  createdAt: string;
}

const statusConfig = {
  "pending": {
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    label: "Pending Review",
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />
  },
  "in-progress": {
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    label: "In Progress",
    icon: <Clock className="h-4 w-4 text-blue-500" />
  },
  "completed": {
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    label: "Completed",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
  },
  "rejected": {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    label: "Rejected",
    icon: <AlertTriangle className="h-4 w-4 text-red-500" />
  }
};

const WorkflowStatusCard = ({
  id,
  title,
  status,
  progress,
  dueDate,
  assignee,
  createdAt
}: WorkflowStatusCardProps) => {
  const router = useRouter();
  const config = statusConfig[status];
  
  const handleViewStages = () => {
    router.push(`/stages/${id}`);
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: status === "completed" ? "#10b981" : status === "rejected" ? "#ef4444" : status === "in-progress" ? "#3b82f6" : "#f59e0b" }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={`${config.color} border`} variant="outline">
            <span className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2" 
              style={{ 
                backgroundColor: status === "rejected" ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)",
                "--tw-progress-fill": status === "completed" ? "#10b981" : status === "rejected" ? "#ef4444" : "#3b82f6"
              } as React.CSSProperties}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(assignee)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignee}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dueDate}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 justify-center"
            >
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 justify-center"
              onClick={handleViewStages}
            >
              View Stages
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 text-xs text-muted-foreground border-t mt-2">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Created: {createdAt}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WorkflowStatusCard;