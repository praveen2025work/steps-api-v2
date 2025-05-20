import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart4, 
  AlertCircle, 
  RefreshCw, 
  RotateCcw, 
  Plus, 
  Unlock,
  Lock,
  ChevronRight
} from 'lucide-react';
import { HierarchyNode } from '../WorkflowHierarchyBreadcrumb';
import { showSuccessToast, showInfoToast, showWarningToast } from '@/lib/toast';

interface WorkflowUnifiedHeaderProps {
  workflowId: string;
  workflowTitle: string;
  hierarchyPath: HierarchyNode[];
  progress: number;
  status: string;
  isLocked: boolean;
  onToggleLock: () => void;
  onRefresh: () => void;
  taskCounts?: {
    completed: number;
    failed: number;
    rejected: number;
    pending: number;
    processing: number;
  };
}

const WorkflowUnifiedHeader: React.FC<WorkflowUnifiedHeaderProps> = ({
  workflowId,
  workflowTitle,
  hierarchyPath,
  progress,
  status,
  isLocked,
  onToggleLock,
  onRefresh,
  taskCounts
}) => {
  // Calculate task counts if not provided
  const defaultTaskCounts = taskCounts || {
    completed: 3,
    failed: 0,
    rejected: 0,
    pending: 2,
    processing: 1
  };

  // Handle action buttons
  const handleAddAdhocStage = () => {
    showInfoToast("Add Adhoc Stage functionality would be implemented here");
  };

  const handleResetWorkflow = () => {
    showWarningToast("Reset Workflow functionality would be implemented here");
  };

  const handleReopenTollGate = () => {
    showInfoToast("Reopen Toll Gate functionality would be implemented here");
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">{workflowTitle}</h3>
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={onToggleLock}
            title={isLocked ? "Locked - Click to unlock" : "Unlocked - Click to lock"}
          >
            {isLocked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={handleAddAdhocStage}
            title="Add Adhoc Stage"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={handleResetWorkflow}
            title="Reset Workflow"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={handleReopenTollGate}
            title="Reopen Toll Gate"
          >
            <Unlock className="h-3.5 w-3.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-col space-y-3">
          {/* Hierarchy Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hierarchyPath.map((node, index) => (
              <React.Fragment key={node.id}>
                <span className="flex items-center gap-1">
                  <span>{node.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {node.progress}%
                  </Badge>
                </span>
                {index < hierarchyPath.length - 1 && (
                  <ChevronRight className="h-3 w-3" />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Progress Section */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">
                Overall Progress
              </span>
              <span className="text-sm font-medium">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Task Counts */}
          <div className="grid grid-cols-4 gap-1">
            <div className="p-1 bg-green-500/10 rounded-md">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-sm font-semibold text-green-500">{defaultTaskCounts.completed}</p>
            </div>
            
            <div className="p-1 bg-blue-500/10 rounded-md">
              <p className="text-xs text-muted-foreground">Processing</p>
              <p className="text-sm font-semibold text-blue-500">{defaultTaskCounts.processing}</p>
            </div>
            
            <div className="p-1 bg-yellow-500/10 rounded-md">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-sm font-semibold text-yellow-500">{defaultTaskCounts.pending}</p>
            </div>
            
            <div className="p-1 bg-red-500/10 rounded-md">
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-sm font-semibold text-red-500">{defaultTaskCounts.failed + defaultTaskCounts.rejected}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1">
            <Link 
              href={`/finance?workflowId=${workflowId}&workflowName=${workflowTitle}`}
              className="flex-1"
            >
              <Button 
                variant="outline" 
                className="w-full h-8 text-xs"
              >
                <BarChart4 className="h-3.5 w-3.5 mr-1" />
                Finance Dashboard
              </Button>
            </Link>
            
            <Link 
              href="/support"
              className="flex-1"
            >
              <Button 
                variant="outline" 
                className="w-full h-8 text-xs"
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Support Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowUnifiedHeader;