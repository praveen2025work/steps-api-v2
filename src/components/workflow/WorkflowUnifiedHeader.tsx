import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Clock
} from 'lucide-react';
import { useDate } from '@/contexts/DateContext';
import { formatDate } from '@/lib/dateUtils';
import DateSelector from '@/components/DateSelector';
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
  lastRefreshed?: Date;
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
  taskCounts,
  lastRefreshed = new Date()
}) => {
  const router = useRouter();
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(15);
  
  // Calculate task counts if not provided
  const defaultTaskCounts = taskCounts || {
    completed: 3,
    failed: 0,
    rejected: 0,
    pending: 2,
    processing: 1
  };
  
  // Update seconds since last refresh
  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 1000);
      setSecondsSinceRefresh(seconds);
      
      setCountdown(prev => {
        if (prev <= 1) {
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastRefreshed]);
  
  // Use a single color for progress indicators
  const getProgressColor = () => {
    return "bg-blue-500";
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
          <div className="flex items-center mr-3 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last refreshed: {secondsSinceRefresh}s | Auto-refresh in: {countdown}s</span>
          </div>
          
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
          {/* Hierarchy Path with Progress - Made clickable with visual indicators */}
          <div className="flex items-center gap-1 text-sm">
            {hierarchyPath.map((node, index) => (
                <React.Fragment key={node.id}>
                  <div className="flex flex-col">
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
                    
                    {/* Visual progress indicator with single color */}
                    <div className="h-1 w-full bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor()}`} 
                        style={{ width: `${node.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {index < hierarchyPath.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
                  )}
                </React.Fragment>
              ))}
            </div>

          
          <div className="flex flex-wrap gap-3 mt-3">
            {/* Left side: Task Counts in a more compact layout */}
            <div className="flex-1 min-w-[280px]">
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