import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
  ArrowRight
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
  const router = useRouter();
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
          {/* Hierarchy Path with Progress - Made clickable */}
          <div className="flex items-center gap-1 text-sm">
            {hierarchyPath.map((node, index) => (
              <React.Fragment key={node.id}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 flex items-center gap-1 hover:bg-secondary/50"
                  onClick={() => {
                    // Navigate to the appropriate level
                    if (node.level === 'app') {
                      router.push(`/application/${node.id}`);
                    } else if (index < hierarchyPath.length - 1) {
                      // If not the last node (current level), navigate to application with this level selected
                      const appNode = hierarchyPath.find(n => n.level === 'app');
                      if (appNode) {
                        router.push(`/application/${appNode.id}`);
                      }
                    }
                  }}
                >
                  <span className="font-medium">{node.name}</span>
                  <span className="ml-1 text-muted-foreground">({node.progress}%)</span>
                </Button>
                {index < hierarchyPath.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
                )}
              </React.Fragment>
            ))}
            <Badge variant="outline" className="ml-2 text-xs">
              Active
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Left side: Progress and Task Counts in a more compact layout */}
            <div className="flex-1 min-w-[280px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Overall Progress</span>
                <span className="text-xs font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5 mb-2" />
              
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Completed: {defaultTaskCounts.completed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Processing: {defaultTaskCounts.processing}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Pending: {defaultTaskCounts.pending}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Failed: {defaultTaskCounts.failed + defaultTaskCounts.rejected}</span>
                </div>
              </div>
            </div>
            
            {/* Right side: Action Buttons */}
            <div className="flex gap-1">
              <Link 
                href={`/finance?workflowId=${workflowId}&workflowName=${workflowTitle}`}
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                >
                  <BarChart4 className="h-3.5 w-3.5 mr-1" />
                  Finance
                </Button>
              </Link>
              
              <Link 
                href="/support"
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                >
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowUnifiedHeader;