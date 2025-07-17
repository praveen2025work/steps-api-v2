import React, { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/services/workflowService';
import { useDate } from '@/contexts/DateContext';
import WorkflowDetailView from './WorkflowDetailView';
import { WorkflowTask } from './WorkflowTaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast, showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '@/lib/toast';
import {
  WorkflowApplication,
  WorkflowNode,
  WorkflowSummary,
  WorkflowProcessData,
  WorkflowStatus
} from '@/types/workflow-dashboard-types';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Database,
  GitBranch,
  Activity,
  Users,
  FileText,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react';

interface DynamicWorkflowDetailViewProps {
  workflowTitle: string;
  applicationId?: number;
  configId?: string;
  currentLevel?: number;
  nextLevel?: number;
  viewMode?: 'classic' | 'alternative';
  onViewToggle?: (mode: 'classic' | 'alternative') => void;
}

interface LoadingState {
  isLoading: boolean;
  stage: 'applications' | 'nodes' | 'summaries' | 'complete';
  progress: number;
  currentOperation: string;
}

interface WorkflowData {
  applications: WorkflowApplication[];
  terminalNodes: WorkflowNode[];
  workflowSummaries: WorkflowSummary[];
  errors: string[];
}

const DynamicWorkflowDetailView: React.FC<DynamicWorkflowDetailViewProps> = ({
  workflowTitle,
  applicationId,
  configId,
  currentLevel,
  nextLevel,
  viewMode = 'classic',
  onViewToggle
}) => {
  const { selectedDate } = useDate();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    stage: 'applications',
    progress: 0,
    currentOperation: 'Initializing...'
  });
  
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    applications: [],
    terminalNodes: [],
    workflowSummaries: [],
    errors: []
  });
  
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Format date for API calls
  const formatDateForApi = useCallback((date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  // Load workflow data using the 3-step recursive process
  const loadWorkflowData = useCallback(async (showToast: boolean = true) => {
    try {
      setLoadingState({
        isLoading: true,
        stage: 'applications',
        progress: 10,
        currentOperation: 'Loading workflow applications...'
      });

      const dateString = formatDateForApi(selectedDate);
      
      let response;
      
      if (applicationId && configId && currentLevel !== undefined && nextLevel !== undefined) {
        // Load data for specific application
        if (showToast) {
          showInfoToast('Loading workflow details for specific application...');
        }
        
        setLoadingState(prev => ({
          ...prev,
          stage: 'nodes',
          progress: 30,
          currentOperation: 'Traversing workflow hierarchy...'
        }));
        
        response = await workflowService.loadWorkflowDetailsForApplication(
          dateString,
          applicationId,
          configId,
          currentLevel,
          nextLevel
        );
        
        if (response.success) {
          setWorkflowData({
            applications: [], // Not loaded for specific application
            terminalNodes: response.data.terminalNodes,
            workflowSummaries: response.data.workflowSummaries,
            errors: response.data.errors
          });
        }
      } else {
        // Load complete workflow data for all applications
        if (showToast) {
          showInfoToast('Loading complete workflow details...');
        }
        
        response = await workflowService.loadCompleteWorkflowDetails(dateString);
        
        if (response.success) {
          setWorkflowData(response.data);
        }
      }
      
      setLoadingState(prev => ({
        ...prev,
        stage: 'summaries',
        progress: 70,
        currentOperation: 'Loading workflow summaries...'
      }));
      
      // Simulate progress for summaries loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingState(prev => ({
        ...prev,
        stage: 'complete',
        progress: 100,
        currentOperation: 'Processing workflow data...'
      }));
      
      if (response && response.success) {
        setLastRefreshed(new Date());
        
        if (showToast) {
          const { terminalNodes, workflowSummaries, errors } = response.data;
          showSuccessToast(
            `Loaded ${terminalNodes.length} workflow instances with ${workflowSummaries.length} summaries` +
            (errors.length > 0 ? ` (${errors.length} errors)` : '')
          );
        }
        
        // Show warnings for any errors
        if (response.data.errors.length > 0 && showToast) {
          response.data.errors.slice(0, 3).forEach(error => {
            showWarningToast(error);
          });
        }
      } else {
        if (showToast) {
          showErrorToast(response?.error || 'Failed to load workflow data');
        }
      }
      
    } catch (error: any) {
      console.error('Error loading workflow data:', error);
      if (showToast) {
        showErrorToast(`Failed to load workflow data: ${error.message}`);
      }
    } finally {
      setLoadingState({
        isLoading: false,
        stage: 'complete',
        progress: 100,
        currentOperation: 'Complete'
      });
    }
  }, [selectedDate, applicationId, configId, currentLevel, nextLevel, formatDateForApi]);

  // Initial load
  useEffect(() => {
    loadWorkflowData(false);
  }, [loadWorkflowData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      loadWorkflowData(false);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval, loadWorkflowData]);

  // Convert workflow summaries to the format expected by WorkflowDetailView
  const convertToWorkflowDetailFormat = useCallback(() => {
    const stages: { id: string; name: string }[] = [];
    const tasks: Record<string, WorkflowTask[]> = {};
    const progressSteps: { name: string; progress: number }[] = [];

    // Build progress steps from terminal nodes
    workflowData.terminalNodes.forEach((node, index) => {
      progressSteps.push({
        name: node.configName,
        progress: node.percentageCompleted
      });
    });

    // Process workflow summaries to create stages and tasks
    workflowData.workflowSummaries.forEach((summary, summaryIndex) => {
      // Group processes by stage
      const stageGroups = summary.processData.reduce((groups, process) => {
        const stageKey = `stage-${process.stage_Id}`;
        if (!groups[stageKey]) {
          groups[stageKey] = {
            id: stageKey,
            name: process.stage_Name,
            processes: []
          };
        }
        groups[stageKey].processes.push(process);
        return groups;
      }, {} as Record<string, { id: string; name: string; processes: WorkflowProcessData[] }>);

      // Convert stage groups to stages and tasks
      Object.values(stageGroups).forEach(stageGroup => {
        // Add stage if not already added
        if (!stages.find(s => s.id === stageGroup.id)) {
          stages.push({
            id: stageGroup.id,
            name: stageGroup.name
          });
        }

        // Convert processes to tasks
        const stageTasks: WorkflowTask[] = stageGroup.processes.map(process => ({
          id: `task-${process.workflow_Process_Id}`,
          name: process.subStage_Name,
          status: mapWorkflowStatusToTaskStatus(process.status),
          assignedTo: process.updatedBy || 'System',
          dueDate: process.businessdate,
          priority: process.auto === 'y' ? 'low' : 'medium',
          description: process.message || `${process.subStage_Name} process`,
          processId: `PROC-${process.workflow_Process_Id}`,
          duration: process.duration,
          updatedBy: process.updatedBy,
          updatedAt: process.updatedon,
          dependencies: process.hasDependencies === 'y' ? ['Previous Stage'] : [],
          messages: process.message ? [process.message] : [],
          documents: summary.fileData
            .filter(file => file.workflow_Process_Id === process.workflow_Process_Id)
            .map(file => ({
              id: `doc-${file.workflow_Process_Id}`,
              name: file.name || 'Unknown File',
              type: 'file',
              size: '1 MB',
              uploadedAt: file.businessdate,
              uploadedBy: 'System'
            }))
        }));

        // Add or merge tasks for this stage
        if (tasks[stageGroup.id]) {
          tasks[stageGroup.id].push(...stageTasks);
        } else {
          tasks[stageGroup.id] = stageTasks;
        }
      });
    });

    return { stages, tasks, progressSteps };
  }, [workflowData]);

  // Map workflow status to task status
  const mapWorkflowStatusToTaskStatus = (status: string): 'completed' | 'in_progress' | 'failed' | 'not_started' | 'pending' | 'rejected' => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'completed';
      case 'IN PROGRESS':
      case 'RUNNING':
        return 'in_progress';
      case 'FAILED':
      case 'ERROR':
        return 'failed';
      case 'NOT STARTED':
        return 'not_started';
      case 'PENDING':
      case 'PENDING APPROVAL':
        return 'pending';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'not_started';
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    loadWorkflowData(true);
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    if (!autoRefreshEnabled) {
      showInfoToast(`Auto-refresh enabled (${refreshInterval}s interval)`);
    } else {
      showInfoToast('Auto-refresh disabled');
    }
  };

  // Render loading state
  if (loadingState.isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Workflow Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{loadingState.currentOperation}</span>
                <span>{loadingState.progress}%</span>
              </div>
              <Progress value={loadingState.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if no data loaded
  if (!workflowData.workflowSummaries.length && !loadingState.isLoading) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No workflow data available for the selected date. 
            {workflowData.errors.length > 0 && (
              <div className="mt-2">
                <strong>Errors:</strong>
                <ul className="list-disc list-inside mt-1">
                  {workflowData.errors.slice(0, 3).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                  {workflowData.errors.length > 3 && (
                    <li className="text-sm">...and {workflowData.errors.length - 3} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Workflow Data</h3>
            <p className="text-muted-foreground text-center mb-4">
              Unable to load workflow details for {formatDateForApi(selectedDate)}
            </p>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert data for WorkflowDetailView
  const { stages, tasks, progressSteps } = convertToWorkflowDetailFormat();

  return (
    <div className="space-y-4">
      {/* Data Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Workflow Data Summary
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoRefresh}
                className={autoRefreshEnabled ? 'bg-green-50 border-green-200' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefreshEnabled ? 'animate-spin' : ''}`} />
                Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Applications</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {workflowData.applications.length}
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Terminal Nodes</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {workflowData.terminalNodes.length}
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Workflow Summaries</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {workflowData.workflowSummaries.length}
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Processes</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {workflowData.workflowSummaries.reduce((total, summary) => total + summary.processData.length, 0)}
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          {lastRefreshed && (
            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </div>
          )}
          
          {workflowData.errors.length > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {workflowData.errors.length} error(s) occurred during data loading.
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">View errors</summary>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {workflowData.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </details>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Workflow Detail View */}
      <WorkflowDetailView
        workflowTitle={workflowTitle}
        progressSteps={progressSteps}
        stages={stages}
        tasks={tasks}
        viewMode={viewMode}
        onViewToggle={onViewToggle}
      />
    </div>
  );
};

export default DynamicWorkflowDetailView;