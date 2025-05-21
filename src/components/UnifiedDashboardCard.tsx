import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/router";
import { 
  ChevronRight, 
  BarChart, 
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  
  const handleViewDetails = () => {
    if (type === 'workflow') {
      router.push(`/workflow/${id}`);
    } else if (type === 'application') {
      router.push(`/application/${id}`);
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
    </Card>
  );
};

export default UnifiedDashboardCard;