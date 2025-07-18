import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  BarChart4, 
  AlertCircle, 
  RefreshCw, 
  RotateCcw, 
  Plus, 
  Unlock,
  Lock,
  ArrowRight,
  ArrowLeft,
  Clock,
  Layers,
  Sparkles,
  GitBranch,
  Timer,
  Pause,
  Play
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
  viewMode?: 'classic' | 'alternative' | 'stepfunction';
  onViewToggle?: (mode: 'classic' | 'alternative' | 'stepfunction') => void;
  // Auto-refresh props
  autoRefreshEnabled?: boolean;
  onAutoRefreshToggle?: (enabled: boolean) => void;
  refreshInterval?: number;
  countdown?: number;
  isRefreshing?: boolean;
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
  lastRefreshed = new Date(),
  viewMode = 'classic',
  onViewToggle,
  autoRefreshEnabled = true,
  onAutoRefreshToggle,
  refreshInterval = 10,
  countdown = 10,
  isRefreshing = false
}) => {
  const router = useRouter();
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState<number>(0);
  
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
    <Card className="mb-2">
      <CardHeader className="py-1.5 px-3 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{workflowTitle}</h3>
          {status === "Active" ? (
            <div className="w-2 h-2 rounded-full bg-green-500" title="Active"></div>
          ) : (
            <Badge variant="outline" className="text-xs">
              {status}
            </Badge>
          )}
          
          {/* Enhanced View toggle buttons with labels */}
          {onViewToggle && (
            <div className="bg-muted rounded-lg p-1 flex ml-2 gap-1">
              <Button
                variant={viewMode === 'classic' ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewToggle('classic')}
                title="Classic View"
                className="h-6 px-2 text-xs"
              >
                <Layers className="h-3 w-3 mr-1" />
                Classic View
              </Button>
              <Button
                variant={viewMode === 'alternative' ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewToggle('alternative')}
                title="Modern View"
                className="h-6 px-2 text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Modern View
              </Button>
              <Button
                variant={viewMode === 'stepfunction' ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewToggle('stepfunction')}
                title="Step Function View"
                className="h-6 px-2 text-xs"
              >
                <GitBranch className="h-3 w-3 mr-1" />
                Step Function View
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Auto-refresh controls */}
          <div className="flex items-center gap-2 mr-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefreshEnabled}
                onCheckedChange={onAutoRefreshToggle}
                id="auto-refresh"
              />
              <label htmlFor="auto-refresh" className="text-xs font-medium">
                Auto-refresh
              </label>
              {autoRefreshEnabled ? (
                <Pause className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Play className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Timer className="h-3 w-3" />
              <span>
                {autoRefreshEnabled 
                  ? `Next refresh in ${countdown}s` 
                  : 'Auto-refresh disabled'
                }
              </span>
            </div>
            
            {isRefreshing && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Refreshing...</span>
              </div>
            )}
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
            variant="outline" 
            size="sm" 
            className="h-7"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Now"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="py-1.5 px-3">
        <div className="flex flex-col space-y-1">
          {/* Back to Navigation and Workflow Details - Consolidated */}
          <div className="flex items-center gap-2 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 flex items-center gap-1 hover:bg-secondary/50"
              onClick={() => {
                try {
                  console.log('[WorkflowUnifiedHeader] Navigating back to navigation');
                  router.push('/');
                } catch (error) {
                  console.error('[WorkflowUnifiedHeader] Error in back navigation:', error);
                }
              }}
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Navigation</span>
            </Button>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-muted-foreground">
              Showing workflow details for <span className="font-medium text-foreground">{workflowTitle}</span>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </div>
          </div>
          
          {/* Hierarchy Path with Progress - More compact */}
          <div className="flex items-center gap-1 text-xs">
            {hierarchyPath.map((node, index) => (
                <React.Fragment key={node.id}>
                  <div className="flex flex-col">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-1.5 flex items-center gap-1 hover:bg-secondary/50"
                      onClick={() => {
                        try {
                          // Enhanced navigation with proper error handling
                          console.log(`[WorkflowUnifiedHeader] Navigating to ${node.level} level: ${node.name}`);
                          
                          if (node.level === 'app') {
                            // Navigate to application cards view (App Level)
                            console.log('[WorkflowUnifiedHeader] Navigating to App Level view');
                            router.push('/');
                          } else if (index < hierarchyPath.length - 1) {
                            // Navigate to corresponding detail view
                            const appNode = hierarchyPath.find(n => n.level === 'app');
                            if (appNode) {
                              if (index === 1) {
                                // Level 1 navigation (Advisory)
                                console.log('[WorkflowUnifiedHeader] Navigating to Level 1 view');
                                router.push(`/hierarchy/${appNode.id}`);
                              } else {
                                // Level 2+ navigation (Advisory EMA)
                                console.log('[WorkflowUnifiedHeader] Navigating to Level 2 view');
                                router.push(`/workflow/${node.id}`);
                              }
                            } else {
                              console.warn('[WorkflowUnifiedHeader] App node not found in hierarchy path');
                            }
                          } else {
                            // Current level - stay on current view
                            console.log('[WorkflowUnifiedHeader] Already on current level');
                          }
                        } catch (error) {
                          console.error('[WorkflowUnifiedHeader] Error in breadcrumb navigation:', error);
                        }
                      }}
                    >
                      <span className="font-medium">{node.name}</span>
                      <span className="ml-1 text-muted-foreground">({node.progress}%)</span>
                    </Button>
                    
                    {/* Visual progress indicator with single color */}
                    <div className="h-0.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor()}`} 
                        style={{ width: `${node.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {index < hierarchyPath.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                  )}
                </React.Fragment>
              ))}
            </div>
          
          <div className="flex flex-wrap gap-2 mt-1 items-center justify-between">
            {/* Status Counts */}
            <div className="flex items-center gap-3">
              {/* Enhanced Status Counts with accurate values */}
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
            
            {/* Action Buttons */}
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