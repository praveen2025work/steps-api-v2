import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/router";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { WorkflowStatus } from "@/data/mockWorkflows";

interface WorkflowListItemProps {
  id: string;
  title: string;
  status: WorkflowStatus;
  progress: number;
  dueDate: string;
  assignee: string;
  createdAt: string;
}

const WorkflowListItem = ({
  id,
  title,
  status,
  progress,
  dueDate,
  assignee,
  createdAt
}: WorkflowListItemProps) => {
  const router = useRouter();
  
  // Get status configuration
  const getStatusConfig = (status: WorkflowStatus) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending Review",
          icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
          color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        };
      case "in-progress":
        return {
          label: "In Progress",
          icon: <Clock className="h-4 w-4 text-blue-500" />,
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
        };
      case "completed":
        return {
          label: "Completed",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          color: "bg-green-500/10 text-green-500 border-green-500/20"
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          color: "bg-red-500/10 text-red-500 border-red-500/20"
        };
    }
  };
  
  const config = getStatusConfig(status);
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (name === "Unassigned") return "U";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleViewWorkflowDetail = () => {
    router.push(`/workflow/${id}`);
  };
  
  const handleViewStages = () => {
    router.push(`/stages/${id}`);
  };
  
  return (
    <Card className="border-l-4 border-l-primary/50">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Workflow Title and Status */}
          <div className="md:col-span-3">
            <h3 className="font-medium">{title}</h3>
            <Badge className={`mt-1 ${config.color} border`} variant="outline">
              <span className="flex items-center gap-1">
                {config.icon}
                {config.label}
              </span>
            </Badge>
          </div>
          
          {/* Progress */}
          <div className="md:col-span-3">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Assignee */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(assignee)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignee}</span>
            </div>
          </div>
          
          {/* Due Date */}
          <div className="md:col-span-2 text-sm">
            {dueDate}
          </div>
          
          {/* Actions */}
          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewWorkflowDetail}
            >
              Workflow Detail
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleViewStages}
            >
              View Stages
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 text-xs text-muted-foreground border-t">
        Created: {createdAt}
      </CardFooter>
    </Card>
  );
};

export default WorkflowListItem;