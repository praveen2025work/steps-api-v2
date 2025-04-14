import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, User, Calendar } from "lucide-react";

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

const statusColors = {
  "pending": "bg-yellow-500",
  "in-progress": "bg-blue-500",
  "completed": "bg-green-500",
  "rejected": "bg-red-500"
};

const statusLabels = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "rejected": "Rejected"
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
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={status === "completed" ? "default" : status === "rejected" ? "destructive" : "outline"}>
            {statusLabels[status]}
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
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{assignee}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due: {dueDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Created: {createdAt}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WorkflowStatusCard;