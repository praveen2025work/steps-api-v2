import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, User, Calendar, ChevronRight, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme } = useTheme();
  
  // Get theme-specific status colors
  const getStatusConfig = (status: WorkflowStatus) => {
    // Base configuration
    const baseConfig = {
      "pending": {
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        label: "Pending Review",
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        borderColor: "#f59e0b"
      },
      "in-progress": {
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        label: "In Progress",
        icon: <Clock className="h-4 w-4 text-blue-500" />,
        borderColor: "#3b82f6"
      },
      "completed": {
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        label: "Completed",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        borderColor: "#10b981"
      },
      "rejected": {
        color: "bg-red-500/10 text-red-500 border-red-500/20",
        label: "Rejected",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        borderColor: "#ef4444"
      }
    };
    
    // Theme-specific overrides
    if (theme === 'banking-blue') {
      return {
        ...baseConfig[status],
        color: status === "completed" 
          ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
          : status === "in-progress"
            ? "bg-blue-600/10 text-blue-600 border-blue-600/20"
            : baseConfig[status].color,
        borderColor: status === "completed" 
          ? "#06b6d4" 
          : status === "in-progress" 
            ? "#2563eb" 
            : baseConfig[status].borderColor
      };
    }
    
    if (theme === 'regulatory-green') {
      return {
        ...baseConfig[status],
        color: status === "completed" 
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          : status === "in-progress"
            ? "bg-teal-600/10 text-teal-600 border-teal-600/20"
            : baseConfig[status].color,
        borderColor: status === "completed" 
          ? "#10b981" 
          : status === "in-progress" 
            ? "#0d9488" 
            : baseConfig[status].borderColor
      };
    }
    
    return baseConfig[status];
  };
  
  const config = getStatusConfig(status);
  
  const handleViewStages = () => {
    router.push(`/stages/${id}`);
  };
  
  const handleViewWorkflow = () => {
    router.push(`/workflow/${id}`);
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
  
  // Get progress bar colors based on theme and status
  const getProgressBarStyles = () => {
    let bgColor = "rgba(59, 130, 246, 0.2)"; // Default blue bg
    let fillColor = "#3b82f6"; // Default blue fill
    
    if (status === "completed") {
      fillColor = theme === 'regulatory-green' ? "#10b981" : theme === 'banking-blue' ? "#06b6d4" : "#10b981";
    } else if (status === "rejected") {
      bgColor = "rgba(239, 68, 68, 0.2)";
      fillColor = "#ef4444";
    } else if (status === "in-progress") {
      fillColor = theme === 'regulatory-green' ? "#0d9488" : theme === 'banking-blue' ? "#2563eb" : "#3b82f6";
    }
    
    return {
      backgroundColor: bgColor,
      "--tw-progress-fill": fillColor
    } as React.CSSProperties;
  };
  
  return (
    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: config.borderColor }}>
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
              style={getProgressBarStyles()}
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
              onClick={handleViewWorkflow}
            >
              <FileText className="h-4 w-4 mr-1" />
              Workflow Detail
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