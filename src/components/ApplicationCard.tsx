import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { ChevronRight } from "lucide-react";

interface TaskCounts {
  completed: number;
  failed: number;
  rejected: number;
  pending: number;
  processing: number;
}

interface ApplicationCardProps {
  id: string;
  title: string;
  description: string;
  taskCounts: TaskCounts;
  eligibleRoles: string[];
}

const ApplicationCard = ({
  id,
  title,
  description,
  taskCounts,
  eligibleRoles
}: ApplicationCardProps) => {
  const router = useRouter();
  
  const handleViewApplication = () => {
    router.push(`/application/${id}`);
  };
  
  // Calculate total tasks
  const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-green-500/10 rounded-md">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-semibold text-green-500">{taskCounts.completed}</p>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-md">
            <p className="text-xs text-muted-foreground">Processing</p>
            <p className="text-lg font-semibold text-blue-500">{taskCounts.processing}</p>
          </div>
          <div className="p-2 bg-yellow-500/10 rounded-md">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-semibold text-yellow-500">{taskCounts.pending}</p>
          </div>
          <div className="p-2 bg-red-500/10 rounded-md">
            <p className="text-xs text-muted-foreground">Failed/Rejected</p>
            <p className="text-lg font-semibold text-red-500">{taskCounts.failed + taskCounts.rejected}</p>
          </div>
        </div>
        
        <Button 
          variant="default" 
          className="w-full"
          onClick={handleViewApplication}
        >
          View Application
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
      <CardFooter className="pt-1 text-xs text-muted-foreground border-t mt-2">
        <div>
          <p className="mb-1">Eligible Roles:</p>
          <div className="flex flex-wrap gap-1">
            {eligibleRoles.map((role, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;