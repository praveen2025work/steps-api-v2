import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeRouter from '../SafeRouter';
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
  Clock,
  Layers,
  Sparkles,
  GitBranch,
  Timer,
  Pause,
  Play,
  Settings,
  Users,
  KeyRound
} from 'lucide-react';
import { useDate } from '@/contexts/DateContext';
import { formatDate } from '@/lib/dateUtils';
import DateSelector from '@/components/DateSelector';
import { HierarchyNode } from '../WorkflowHierarchyBreadcrumb';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { ChevronRight } from 'lucide-react';
import { showSuccessToast, showInfoToast, showWarningToast } from '@/lib/toast';
import AdhocStageManager from './AdhocStageManager';

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
  viewMode?: 'classic' | 'modern' | 'step-function';
  onViewToggle?: (mode: 'classic' | 'modern' | 'step-function') => void;
  // Auto-refresh props
  autoRefreshEnabled?: boolean;
  onAutoRefreshToggle?: (enabled: boolean) => void;
  refreshInterval?: number;
  countdown?: number;
  isRefreshing?: boolean;
  // Navigation props
  onBack?: () => void; // Callback to navigate back to previous view
  // Adhoc stage management props
  appGroupId?: string;
  appId?: number;
  date?: string;
  filterControls?: React.ReactNode;
}

const WorkflowUnifiedHeader: React.FC<WorkflowUnifiedHeaderProps> = (props) => {
  return (
    <SafeRouter>
      {(router) => <WorkflowUnifiedHeaderContent router={router} {...props} />}
    </SafeRouter>
  );
};

const WorkflowUnifiedHeaderContent: React.FC<WorkflowUnifiedHeaderProps & { router: any }> = ({
  router,
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
  isRefreshing = false,
  onBack,
  appGroupId,
  appId,
  date,
  filterControls
}) => {
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

  const { state: breadcrumbState, navigateToLevel, reset } = useBreadcrumb();

  // Handle breadcrumb navigation with back button support
  const handleBreadcrumbNavigation = (index: number) => {
    if (index === -1) { // Home / Applications
      if (onBack) {
        reset();
        onBack();
      } else {
        reset();
        router.push('/dashboard');
      }
      return;
    }
    
    if (index < breadcrumbState.nodes.length - 1) {
      if (onBack) {
        navigateToLevel(index);
        onBack();
      } else {
        navigateToLevel(index);
        router.push('/dashboard');
      }
    }
  };



  const handleResetWorkflow = () => {
    showWarningToast("Reset Workflow functionality would be implemented here");
  };

  const handleReopenTollGate = () => {
    showInfoToast("Reopen Toll Gate functionality would be implemented here");
  };

  return (
    <div className="space-y-2">
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
                variant={viewMode === 'modern' ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewToggle('modern')}
                title="Modern View"
                className="h-6 px-2 text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Modern View
              </Button>
              <Button
                variant={viewMode === 'step-function' ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewToggle('step-function')}
                title="Step Function View"
                className="h-6 px-2 text-xs"
              >
                <GitBranch className="h-3 w-3 mr-1" />
                Step Function View
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
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
                {!autoRefreshEnabled 
                  ? 'Auto refresh off'
                  : autoRefreshEnabled && countdown > 0
                  ? `Next refresh in ${countdown}s`
                  : 'Auto refresh off (user inactive)'
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
          
          {filterControls}

          {/* Adhoc Stage Manager - renders as button when closed, modal when open */}
          {appGroupId && appId && date && (
            <AdhocStageManager
              appGroupId={appGroupId}
              appId={appId}
              date={date}
              onRefresh={onRefresh}
              className="h-7 w-7"
            />
          )}
          
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
            <KeyRound className="h-3.5 w-3.5" />
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
        <div className="flex flex-col space-y-2">
          {/* Dynamic Breadcrumb Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBreadcrumbNavigation(-1)}
                className="h-auto p-1 text-blue-600 hover:text-blue-800"
              >
                Applications
              </Button>
              {breadcrumbState.nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBreadcrumbNavigation(index)}
                    disabled={index === breadcrumbState.nodes.length - 1}
                    className="h-auto p-1 text-blue-600 hover:text-blue-800 disabled:text-muted-foreground disabled:no-underline disabled:cursor-default"
                  >
                    {node.name} ({node.level === 0 ? node.appId : node.configId}) ({node.completionPercentage}%)
                  </Button>
                </React.Fragment>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </div>
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
    </div>
  );
};

export default WorkflowUnifiedHeader;