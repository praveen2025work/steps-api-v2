import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/router";
import { ChevronRight, CheckCircle, AlertCircle, Clock, BarChart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  progress?: number;
  status?: string;
}

const ApplicationCard = ({
  id,
  title,
  description,
  taskCounts,
  eligibleRoles,
  progress = 0,
  status = "pending"
}: ApplicationCardProps) => {
  const router = useRouter();
  
  const handleViewApplication = () => {
    // Navigate to the application detail page which will show the hierarchy levels
    router.push(`/application/${id}`);
  };
  
  // Calculate total tasks
  const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  {status}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Application Status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium flex items-center">
                    <BarChart className="h-4 w-4 mr-1" />
                    {progress}%
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Overall Progress</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 bg-green-500/10 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <p className="text-lg font-semibold text-green-500">{taskCounts.completed}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Completed Tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 bg-blue-500/10 rounded-md">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Processing</p>
                  </div>
                  <p className="text-lg font-semibold text-blue-500">{taskCounts.processing}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Processing Tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 bg-yellow-500/10 rounded-md">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <p className="text-lg font-semibold text-yellow-500">{taskCounts.pending}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pending Tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 bg-red-500/10 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                    <p className="text-xs text-muted-foreground">Failed/Rejected</p>
                  </div>
                  <p className="text-lg font-semibold text-red-500">{taskCounts.failed + taskCounts.rejected}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Failed or Rejected Tasks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                className="w-full"
                onClick={handleViewApplication}
              >
                View Application
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open application details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
      <CardFooter className="pt-1 text-xs text-muted-foreground border-t mt-2">
        <div>
          <p className="mb-1">Eligible Roles:</p>
          <div className="flex flex-wrap gap-1">
            {eligibleRoles.map((role, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Users with {role} role can access this application</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;