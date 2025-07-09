import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/router";
import { 
  ChevronRight, 
  BarChart, 
  AlertCircle,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppParameters from "@/components/workflow/AppParameters";

interface UnifiedDashboardCardProps {
  id: string;
  title: string;
  progress: number;
  status: string;
  type: 'application' | 'asset' | 'workflow';
  taskCounts?: {
    completed: number;
    failed: number;
    rejected: number;
    pending: number;
    processing: number;
  };
}

const UnifiedDashboardCard = ({
  id,
  title,
  progress,
  status,
  type,
  taskCounts
}: UnifiedDashboardCardProps) => {
  const router = useRouter();
  const [isParametersDialogOpen, setIsParametersDialogOpen] = useState(false);
  
  const handleViewDetails = () => {
    if (type === 'workflow') {
      router.push(`/workflow/${id}`);
    } else if (type === 'application') {
      // Make sure we're using the correct application ID format
      // The application ID should be in the format "app-1001"
      const appId = id.startsWith('app-') ? id : `app-${id}`;
      router.push(`/application/${appId}`);
    } else {
      router.push(`/application/${id}`);
    }
  };

  const handleFinanceDashboard = () => {
    router.push(`/finance?workflowId=${id}&workflowName=${title}`);
  };

  const handleSupportDashboard = () => {
    router.push('/support');
  };

  const handleApplicationParameters = () => {
    setIsParametersDialogOpen(true);
  };

  // Extract numeric application ID from the id string
  const getApplicationId = () => {
    if (id.startsWith('app-')) {
      return parseInt(id.replace('app-', ''));
    }
    return parseInt(id) || 1;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-col space-y-3">
          {/* Progress Section */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium flex items-center">
                <BarChart className="h-4 w-4 mr-1" />
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Task Counts - Only show if provided */}
          {taskCounts && (
            <div className="grid grid-cols-4 gap-1">
              <div className="p-1 bg-green-500/10 rounded-md">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm font-semibold text-green-500">{taskCounts.completed}</p>
              </div>
              
              <div className="p-1 bg-blue-500/10 rounded-md">
                <p className="text-xs text-muted-foreground">Processing</p>
                <p className="text-sm font-semibold text-blue-500">{taskCounts.processing}</p>
              </div>
              
              <div className="p-1 bg-yellow-500/10 rounded-md">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-sm font-semibold text-yellow-500">{taskCounts.pending}</p>
              </div>
              
              <div className="p-1 bg-red-500/10 rounded-md">
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-sm font-semibold text-red-500">{taskCounts.failed + taskCounts.rejected}</p>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-1">
            <Button 
              variant="default" 
              className="flex-1 h-8 text-xs"
              onClick={handleViewDetails}
            >
              View Details
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
            
            {/* Show Application Parameters button only for applications */}
            {type === 'application' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2"
                onClick={handleApplicationParameters}
                title="Application Parameters"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2"
              onClick={handleFinanceDashboard}
              title="Finance Dashboard"
            >
              <BarChart className="h-3.5 w-3.5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2"
              onClick={handleSupportDashboard}
              title="Support Dashboard"
            >
              <AlertCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Application Parameters Dialog */}
      {type === 'application' && (
        <Dialog open={isParametersDialogOpen} onOpenChange={setIsParametersDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Parameters - {title}</DialogTitle>
            </DialogHeader>
            <AppParameters 
              applicationId={getApplicationId()}
              applicationName={title}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default UnifiedDashboardCard;