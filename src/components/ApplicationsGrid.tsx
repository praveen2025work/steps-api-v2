import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UnifiedDashboardCard from './UnifiedDashboardCard';
import WorkflowDetailView from './WorkflowDetailView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWorkflowDashboard } from '@/hooks/useWorkflowDashboard';
import { workflowService } from '@/services/workflowService';
import { 
  WorkflowApplication, 
  WorkflowNode, 
  WorkflowSummary 
} from '@/types/workflow-dashboard-types';
import { WorkflowTask, WorkflowTaskDocument, WorkflowTaskDependency } from './WorkflowTaskItem';
import applicationsData from '@/data/applications.json';
import { mockHierarchicalWorkflows } from '@/data/hierarchicalWorkflowData';
import { 
  ArrowLeft, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  ChevronRight,
  Database,
  Network,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';

// Interface for application data
interface Application {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  taskCounts: {
    completed: number;
    failed: number;
    rejected: number;
    pending: number;
    processing: number;
  };
  eligibleRoles: string[];
  type: 'application' | 'asset' | 'workflow';
}

// Navigation breadcrumb item
interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'application' | 'node';
  appId?: number;
  configId?: string;
  currentLevel?: number;
  nextLevel?: number;
}

const ApplicationsGrid = () => {
  const router = useRouter();
  const { applications: workflowApps, loading, error, refresh, selectedDate, dateString } = useWorkflowDashboard();
  
  // Legacy applications from JSON data
  const [legacyApplications, setLegacyApplications] = useState<Application[]>([]);
  
  // Navigation state
  const [navigationPath, setNavigationPath] = useState<BreadcrumbItem[]>([]);
  const [currentNodes, setCurrentNodes] = useState<WorkflowNode[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [nodeError, setNodeError] = useState<string | null>(null);
  
  // Workflow detail state
  const [selectedWorkflow, setSelectedWorkflow] = useState<{
    summary: WorkflowSummary;
    application: WorkflowApplication;
    node: WorkflowNode;
  } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Initialize legacy applications
  useEffect(() => {
    const transformedApps = applicationsData.map((app: any) => {
      const hierarchicalData = mockHierarchicalWorkflows.find(
        h => h.name.toLowerCase().includes(app.NAME.toLowerCase())
      );
      
      const randomTaskCounts = {
        completed: Math.floor(Math.random() * 15) + 5,
        failed: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2),
        pending: Math.floor(Math.random() * 10) + 2,
        processing: Math.floor(Math.random() * 5) + 1
      };
      
      return {
        id: `app-${app.APP_ID}`,
        title: app.NAME,
        description: app.DESCRIPTION,
        progress: hierarchicalData?.progress || Math.floor(Math.random() * 80) + 10,
        status: app.ISACTIVE ? "active" : "inactive",
        taskCounts: randomTaskCounts,
        eligibleRoles: ["PNL Manager", "Finance Analyst", "Compliance Officer"],
        type: 'application' as const
      };
    });
    
    setLegacyApplications(transformedApps);
  }, []);

  // Handle application click - load first level nodes
  const handleApplicationClick = async (app: WorkflowApplication) => {
    setLoadingNodes(true);
    setNodeError(null);
    setCurrentNodes([]);
    
    try {
      const response = await workflowService.getWorkflowNodes({
        date: dateString,
        appId: app.appId,
        configId: app.configId,
        currentLevel: app.currentLevel,
        nextLevel: app.nextLevel
      });
      
      if (response.success) {
        setCurrentNodes(response.data);
        setNavigationPath([{
          id: app.configId,
          name: app.configName,
          type: 'application',
          appId: app.appId,
          configId: app.configId,
          currentLevel: app.currentLevel,
          nextLevel: app.nextLevel
        }]);
      } else {
        setNodeError(response.error || 'Failed to load workflow nodes');
      }
    } catch (err: any) {
      setNodeError(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingNodes(false);
    }
  };

  // Handle node click - either navigate deeper or show summary
  const handleNodeClick = async (node: WorkflowNode) => {
    if (node.isUsedForWorkflowInstance) {
      // Terminal node - load workflow summary
      setLoadingSummary(true);
      setSummaryError(null);
      
      console.log('[ApplicationsGrid] Loading workflow summary for terminal node:', {
        configId: node.configId,
        appId: node.appId,
        configName: node.configName,
        date: dateString
      });
      
      try {
        const response = await workflowService.getWorkflowSummary({
          date: dateString,
          configId: node.configId,
          appId: node.appId
        });
        
        console.log('[ApplicationsGrid] Workflow summary response:', {
          success: response.success,
          error: response.error,
          dataKeys: response.data ? Object.keys(response.data) : [],
          processDataLength: response.data?.processData?.length || 0
        });
        
        if (response.success) {
          // Validate that we have the required data structure
          if (!response.data) {
            setSummaryError('No data received from workflow summary API');
            return;
          }
          
          // Log the structure for debugging
          console.log('[ApplicationsGrid] Workflow summary data structure:', {
            processData: response.data.processData?.length || 0,
            fileData: response.data.fileData?.length || 0,
            dependencyData: response.data.dependencyData?.length || 0,
            attestationData: response.data.attestationData?.length || 0,
            dailyParams: response.data.dailyParams?.length || 0,
            applications: response.data.applications?.length || 0,
            appParams: response.data.appParams?.length || 0,
            processParams: response.data.processParams?.length || 0
          });
          
          // Find the original application
          const originalApp = workflowApps.find(app => app.appId === node.appId);
          if (originalApp) {
            setSelectedWorkflow({
              summary: response.data,
              application: originalApp,
              node: node
            });
          } else {
            setSummaryError(`Could not find application with ID ${node.appId} in workflow applications list`);
          }
        } else {
          setSummaryError(response.error || 'Failed to load workflow summary');
        }
      } catch (err: any) {
        console.error('[ApplicationsGrid] Error loading workflow summary:', err);
        setSummaryError(err.message || 'An unexpected error occurred');
      } finally {
        setLoadingSummary(false);
      }
    } else {
      // Non-terminal node - navigate deeper
      setLoadingNodes(true);
      setNodeError(null);
      
      try {
        const response = await workflowService.getWorkflowNodes({
          date: dateString,
          appId: node.appId,
          configId: node.configId,
          currentLevel: node.currentLevel,
          nextLevel: node.nextLevel
        });
        
        if (response.success) {
          setCurrentNodes(response.data);
          setNavigationPath(prev => [...prev, {
            id: node.configId,
            name: node.configName,
            type: 'node',
            appId: node.appId,
            configId: node.configId,
            currentLevel: node.currentLevel,
            nextLevel: node.nextLevel
          }]);
        } else {
          setNodeError(response.error || 'Failed to load workflow nodes');
        }
      } catch (err: any) {
        setNodeError(err.message || 'An unexpected error occurred');
      } finally {
        setLoadingNodes(false);
      }
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      // Navigate back to applications list
      setNavigationPath([]);
      setCurrentNodes([]);
      setSelectedWorkflow(null);
      return;
    }
    
    const targetItem = navigationPath[index];
    if (!targetItem) return;
    
    setLoadingNodes(true);
    setNodeError(null);
    
    try {
      const response = await workflowService.getWorkflowNodes({
        date: dateString,
        appId: targetItem.appId!,
        configId: targetItem.configId!,
        currentLevel: targetItem.currentLevel!,
        nextLevel: targetItem.nextLevel!
      });
      
      if (response.success) {
        setCurrentNodes(response.data);
        setNavigationPath(prev => prev.slice(0, index + 1));
        setSelectedWorkflow(null);
      } else {
        setNodeError(response.error || 'Failed to load workflow nodes');
      }
    } catch (err: any) {
      setNodeError(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingNodes(false);
    }
  };

  // Convert workflow summary to WorkflowDetailView format
  const convertSummaryToWorkflowData = (
    summary: WorkflowSummary, 
    application: WorkflowApplication, 
    node: WorkflowNode
  ) => {
    console.log('[ApplicationsGrid] Converting workflow summary to UI format:', {
      processDataCount: summary.processData?.length || 0,
      fileDataCount: summary.fileData?.length || 0,
      dependencyDataCount: summary.dependencyData?.length || 0,
      attestationDataCount: summary.attestationData?.length || 0,
      dailyParamsCount: summary.dailyParams?.length || 0,
      applicationsCount: summary.applications?.length || 0,
      appParamsCount: summary.appParams?.length || 0,
      processParamsCount: summary.processParams?.length || 0
    });

    // Build progress steps from navigation path
    const progressSteps = navigationPath.map((item, index) => ({
      name: item.name,
      progress: index === navigationPath.length - 1 ? node.percentageCompleted : 75
    }));

    // Ensure processData exists and is an array
    const processData = summary.processData || [];
    console.log('[ApplicationsGrid] Processing', processData.length, 'process data items');

    // Step 1: Group processData by stage_Id to create stages
    const stageMap = new Map<number, { 
      id: string; 
      name: string; 
      stageId: number;
      steps: Map<string, WorkflowTask[]>; // Map of subStage key to tasks
    }>();
    
    processData.forEach((process, index) => {
      if (!process) {
        console.warn('[ApplicationsGrid] Skipping null/undefined process at index', index);
        return;
      }

      const stageId = process.stage_Id;
      const stageName = process.stage_Name || `Stage ${stageId}`;
      
      if (!stageMap.has(stageId)) {
        stageMap.set(stageId, {
          id: `stage-${stageId}`,
          name: stageName,
          stageId: stageId,
          steps: new Map()
        });
      }
      
      const stage = stageMap.get(stageId)!;
      
      // Step 2: Within each stage, group by subStage_Id or subStage_Seq to create steps
      const subStageKey = process.subStage_Id ? `substage-${process.subStage_Id}` : `substage-seq-${process.subStage_Seq}`;
      
      if (!stage.steps.has(subStageKey)) {
        stage.steps.set(subStageKey, []);
      }
      
      // Enhanced status mapping with more comprehensive coverage
      let uiStatus: 'completed' | 'in_progress' | 'not_started' | 'skipped' = 'not_started';
      const apiStatus = (process.status || '').toUpperCase().trim();
      
      switch (apiStatus) {
        case 'COMPLETED':
        case 'COMPLETE':
          uiStatus = 'completed';
          break;
        case 'IN PROGRESS':
        case 'IN_PROGRESS':
        case 'RUNNING':
        case 'PROCESSING':
          uiStatus = 'in_progress';
          break;
        case 'FAILED':
        case 'ERROR':
        case 'REJECTED':
          uiStatus = 'not_started'; // Failed tasks show as not started for retry
          break;
        case 'SKIPPED':
        case 'SKIP':
        case 'POST MANUAL':
          uiStatus = 'skipped';
          break;
        case 'NOT STARTED':
        case 'PENDING':
        case 'WAITING':
        default:
          uiStatus = 'not_started';
      }

      // Enhanced document creation from fileData with better filtering
      const processDocuments: WorkflowTaskDocument[] = [];
      const fileData = summary.fileData || [];
      const processFiles = fileData.filter(file => 
        file.workflow_Process_Id === process.workflow_Process_Id && file.name
      );
      
      processFiles.forEach(file => {
        processDocuments.push({
          name: file.name!,
          size: file.file_Upload === 'Y' ? (file.value || 'Uploaded') : 'Available for download'
        });
      });

      // Enhanced dependency creation with better status mapping
      const processDependencies: WorkflowTaskDependency[] = [];
      const dependencyData = summary.dependencyData || [];
      const processDeps = dependencyData.filter(dep => 
        dep.workflow_Process_Id === process.workflow_Process_Id && 
        dep.dependency_Substage_Id && 
        dep.dependency_Substage_Id !== 0
      );
      
      processDeps.forEach(dep => {
        // Find the dependency process name using subStage_Id
        const depProcess = processData.find(p => 
          p.subStage_Id === dep.dependency_Substage_Id
        );
        
        let depStatus: 'completed' | 'in_progress' | 'not_started' | 'skipped' = 'not_started';
        const depApiStatus = (dep.dep_Status || '').toUpperCase().trim();
        
        switch (depApiStatus) {
          case 'COMPLETED':
          case 'COMPLETE':
            depStatus = 'completed';
            break;
          case 'IN PROGRESS':
          case 'IN_PROGRESS':
          case 'RUNNING':
            depStatus = 'in_progress';
            break;
          case 'FAILED':
          case 'ERROR':
          case 'REJECTED':
            depStatus = 'not_started';
            break;
          case 'SKIPPED':
          case 'SKIP':
            depStatus = 'skipped';
            break;
          default:
            depStatus = 'not_started';
        }
        
        processDependencies.push({
          name: depProcess?.subStage_Name || `Dependency ${dep.dependency_Substage_Id}`,
          status: depStatus
        });
      });

      // Enhanced message creation with more context
      const messages: string[] = [];
      
      // Add primary message if available
      if (process.message) {
        messages.push(process.message);
      }
      
      // Add user commentary if available
      if (process.userCommentary) {
        messages.push(`User Comment: ${process.userCommentary}`);
      }
      
      // Add skip commentary if available
      if (process.skipCommentary) {
        messages.push(`Skip Reason: ${process.skipCommentary}`);
      }
      
      // Add status-specific contextual messages
      if (process.status === 'FAILED' && process.message) {
        messages.push(`Error Details: ${process.message}`);
      } else if (process.status === 'COMPLETED') {
        if (process.completedBy && process.completedon) {
          messages.push(`Completed by ${process.completedBy} on ${new Date(process.completedon).toLocaleString()}`);
        } else {
          messages.push('Process completed successfully');
        }
      } else if (process.status === 'IN PROGRESS') {
        messages.push(`Currently processing... (${process.percentage || 0}% complete)`);
      }
      
      // Add attestation info if required and available
      if (process.attest === 'Y' && process.attestedBy) {
        messages.push(`Attested by ${process.attestedBy} on ${new Date(process.attestedon || '').toLocaleString()}`);
      } else if (process.attest === 'Y' && !process.attestedBy) {
        messages.push('Attestation required');
      }
      
      // Add lock information if locked
      if (process.isLocked && process.lockedBy) {
        messages.push(`Locked by ${process.lockedBy} on ${new Date(process.lockedOn || '').toLocaleString()}`);
      }

      // Create the enhanced workflow task with all API fields properly mapped
      const task: WorkflowTask = {
        id: `task-${process.workflow_Process_Id}`,
        name: process.subStage_Name || 'Unknown Task',
        processId: `PROC-${process.workflow_Process_Id}`,
        status: uiStatus,
        duration: process.duration || 0,
        expectedStart: '09:00', // Could be enhanced with actual timing data from serviceLink or other fields
        actualDuration: process.duration ? `${process.duration}m` : undefined,
        documents: processDocuments.length > 0 ? processDocuments : undefined,
        messages: messages.length > 0 ? messages : undefined,
        updatedBy: process.updatedBy || 'System',
        updatedAt: process.updatedon || new Date().toISOString(),
        dependencies: processDependencies.length > 0 ? processDependencies : undefined,
        
        // Enhanced additional fields for comprehensive right panel binding
        workflowProcessId: process.workflow_Process_Id,
        workflowAppConfigId: process.workflow_App_Config_Id,
        stageId: process.stage_Id,
        subStageId: process.subStage_Id,
        subStageSeq: process.subStage_Seq,
        stageName: process.stage_Name,
        subStageName: process.subStage_Name,
        serviceLink: process.serviceLink,
        auto: process.auto,
        adhoc: process.adhoc,
        isAlteryx: process.isAlteryx,
        upload: process.upload,
        attest: process.attest,
        uploadAllowed: process.upload_Allowed,
        downloadAllowed: process.download_Allowed,
        attestRequired: process.attest_Reqd,
        componentName: process.componentName,
        resolvedComponentName: process.resolvedComponentName,
        businessDate: process.businessdate,
        attestedBy: process.attestedBy,
        attestedOn: process.attestedon,
        completedBy: process.completedBy,
        completedOn: process.completedon,
        isLocked: process.isLocked,
        lockedBy: process.lockedBy,
        lockedOn: process.lockedOn,
        approval: process.approval,
        isActive: process.isActive,
        percentage: process.percentage,
        producer: process.producer,
        approver: process.approver,
        entitlementMapping: process.entitlementMapping,
        isRTB: process.isRTB,
        hasDependencies: process.hasDependencies,
        dependencySubstageId: process.dependency_Substage_Id,
        depSubStageSeq: process.dep_Sub_Stage_Seq,
        userCommentary: process.userCommentary,
        skipCommentary: process.skipCommentary,
        partialComplete: process.partialComplete
      };

      stage.steps.get(subStageKey)!.push(task);
    });

    // Step 3: Convert stage map to the format expected by WorkflowDetailView
    const stages = Array.from(stageMap.values()).map(stage => ({
      id: stage.id,
      name: stage.name
    }));

    const tasks: Record<string, WorkflowTask[]> = {};
    stageMap.forEach((stage, stageId) => {
      // Create tasks array for this stage by properly organizing sub-stages
      const stageTasks: WorkflowTask[] = [];
      
      // Convert the steps map to an array and sort by the first task's subStage_Seq
      const sortedSteps = Array.from(stage.steps.entries()).sort((a, b) => {
        const aSeq = (a[1][0] as any)?.subStageSeq || 0;
        const bSeq = (b[1][0] as any)?.subStageSeq || 0;
        return aSeq - bSeq;
      });
      
      // For each sub-stage group, add all its tasks
      sortedSteps.forEach(([subStageKey, stepTasks]) => {
        // Sort tasks within each sub-stage by subStage_Seq
        const sortedStepTasks = stepTasks.sort((a, b) => {
          const aSeq = (a as any).subStageSeq || 0;
          const bSeq = (b as any).subStageSeq || 0;
          return aSeq - bSeq;
        });
        
        stageTasks.push(...sortedStepTasks);
      });
      
      tasks[stage.id] = stageTasks;
    });

    // If no stages were created from processData, create a default stage
    if (stages.length === 0 && processData.length > 0) {
      console.warn('[ApplicationsGrid] No stages created from process data, creating default stage');
      const defaultStage = {
        id: 'stage-default',
        name: 'Workflow Processes'
      };
      
      const defaultTasks: WorkflowTask[] = [];
      
      // Add all processes to the default stage with enhanced mapping
      processData.forEach((process, index) => {
        if (!process) return;
        
        let uiStatus: 'completed' | 'in_progress' | 'not_started' | 'skipped' = 'not_started';
        const apiStatus = (process.status || '').toUpperCase().trim();
        
        switch (apiStatus) {
          case 'COMPLETED':
          case 'COMPLETE':
            uiStatus = 'completed';
            break;
          case 'IN PROGRESS':
          case 'IN_PROGRESS':
          case 'RUNNING':
            uiStatus = 'in_progress';
            break;
          case 'FAILED':
          case 'ERROR':
          case 'REJECTED':
            uiStatus = 'not_started';
            break;
          case 'SKIPPED':
          case 'SKIP':
          case 'POST MANUAL':
            uiStatus = 'skipped';
            break;
          default:
            uiStatus = 'not_started';
        }

        const messages: string[] = [];
        if (process.message) {
          messages.push(process.message);
        }
        if (process.userCommentary) {
          messages.push(`User Comment: ${process.userCommentary}`);
        }

        defaultTasks.push({
          id: `task-${process.workflow_Process_Id}`,
          name: process.subStage_Name || 'Unknown Task',
          processId: `PROC-${process.workflow_Process_Id}`,
          status: uiStatus,
          duration: process.duration || 0,
          expectedStart: '09:00',
          actualDuration: process.duration ? `${process.duration}m` : undefined,
          messages: messages.length > 0 ? messages : undefined,
          updatedBy: process.updatedBy || 'System',
          updatedAt: process.updatedon || new Date().toISOString(),
          
          // Enhanced additional fields
          workflowProcessId: process.workflow_Process_Id,
          workflowAppConfigId: process.workflow_App_Config_Id,
          stageId: process.stage_Id,
          subStageId: process.subStage_Id,
          subStageSeq: process.subStage_Seq,
          stageName: process.stage_Name,
          subStageName: process.subStage_Name,
          serviceLink: process.serviceLink,
          auto: process.auto,
          adhoc: process.adhoc,
          isAlteryx: process.isAlteryx,
          upload: process.upload,
          attest: process.attest,
          uploadAllowed: process.upload_Allowed,
          downloadAllowed: process.download_Allowed,
          attestRequired: process.attest_Reqd,
          componentName: process.componentName,
          resolvedComponentName: process.resolvedComponentName,
          businessDate: process.businessdate,
          attestedBy: process.attestedBy,
          attestedOn: process.attestedon,
          completedBy: process.completedBy,
          completedOn: process.completedon,
          isLocked: process.isLocked,
          lockedBy: process.lockedBy,
          lockedOn: process.lockedOn,
          approval: process.approval,
          isActive: process.isActive,
          percentage: process.percentage,
          producer: process.producer,
          approver: process.approver,
          entitlementMapping: process.entitlementMapping,
          isRTB: process.isRTB,
          hasDependencies: process.hasDependencies,
          dependencySubstageId: process.dependency_Substage_Id,
          depSubStageSeq: process.dep_Sub_Stage_Seq,
          userCommentary: process.userCommentary,
          skipCommentary: process.skipCommentary,
          partialComplete: process.partialComplete
        });
      });
      
      stages.push(defaultStage);
      tasks[defaultStage.id] = defaultTasks;
    }

    console.log('[ApplicationsGrid] Conversion complete:', {
      stagesCount: stages.length,
      totalTasks: Object.values(tasks).reduce((sum, stageTasks) => sum + stageTasks.length, 0),
      stageNames: stages.map(s => s.name),
      processDataLength: processData.length,
      hasDefaultStage: stages.some(s => s.id === 'stage-default')
    });

    // Log the first few tasks for debugging
    if (stages.length > 0 && tasks[stages[0].id]?.length > 0) {
      console.log('[ApplicationsGrid] Sample task with enhanced fields:', tasks[stages[0].id][0]);
    }

    // Log any issues with empty data
    if (stages.length === 0) {
      console.error('[ApplicationsGrid] No stages created! This will cause the UI to not display any data.');
    }

    if (Object.values(tasks).every(stageTasks => stageTasks.length === 0)) {
      console.error('[ApplicationsGrid] No tasks created! This will cause the UI to show empty stages.');
    }

    // Store the summary data globally for right panel access with enhanced structure
    (window as any).currentWorkflowSummary = summary;
    (window as any).currentWorkflowApplication = application;
    (window as any).currentWorkflowNode = node;

    return {
      workflowTitle: `${application.configName} - ${node.configName}`,
      progressSteps,
      stages,
      tasks,
      // Pass the raw summary data for right panel components
      summaryData: summary,
      applicationData: application,
      nodeData: node
    };
  };

  // Show workflow detail view if a workflow is selected
  if (selectedWorkflow) {
    const workflowData = convertSummaryToWorkflowData(
      selectedWorkflow.summary,
      selectedWorkflow.application,
      selectedWorkflow.node
    );

    return (
      <div className="space-y-4">
        {/* Back navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedWorkflow(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Navigation
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-sm text-muted-foreground">
            Showing workflow details for {selectedWorkflow.node.configName}
          </div>
        </div>

        {/* Workflow Detail View */}
        <WorkflowDetailView
          workflowTitle={workflowData.workflowTitle}
          progressSteps={workflowData.progressSteps}
          stages={workflowData.stages}
          tasks={workflowData.tasks}
          summaryData={selectedWorkflow.summary}
          applicationData={selectedWorkflow.application}
          nodeData={selectedWorkflow.node}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pl-0">
      {/* Header with date and refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Showing data for {dateString} • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Breadcrumb navigation */}
      {navigationPath.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBreadcrumbClick(-1)}
                className="h-auto p-1 text-blue-600 hover:text-blue-800"
              >
                Applications
              </Button>
              {navigationPath.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBreadcrumbClick(index)}
                    className="h-auto p-1 text-blue-600 hover:text-blue-800"
                  >
                    {item.name}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {nodeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{nodeError}</AlertDescription>
        </Alert>
      )}

      {summaryError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{summaryError}</AlertDescription>
        </Alert>
      )}

      {loadingSummary && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading workflow summary...</AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      {navigationPath.length === 0 ? (
        // Show applications list
        <div className="space-y-6">
          {/* Workflow Applications */}
          {workflowApps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Workflow Applications</h3>
                <Badge variant="secondary">{workflowApps.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflowApps.map((app) => (
                  <Card 
                    key={`${app.appId}-${app.configId}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleApplicationClick(app)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{app.configName}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            App ID: {app.appId} • Config: {app.configId}
                          </p>
                        </div>
                        <Badge variant={app.isConfigured ? "default" : "secondary"}>
                          {app.isConfigured ? "Configured" : "Not Configured"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span>Level {app.currentLevel} → {app.nextLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span>{app.percentageCompleted}%</span>
                        </div>
                      </div>
                      {app.isWeekly && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Weekly Process
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Applications */}
          {legacyApplications.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Legacy Applications</h3>
                <Badge variant="outline">{legacyApplications.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {legacyApplications.map((app) => (
                  <UnifiedDashboardCard
                    key={app.id}
                    id={app.id}
                    title={app.title}
                    progress={app.progress}
                    status={app.status}
                    taskCounts={app.taskCounts}
                    type={app.type}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && workflowApps.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading workflow applications...</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && workflowApps.length === 0 && legacyApplications.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                <p className="text-muted-foreground">
                  No workflow applications are available for the selected date.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Show workflow nodes
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Workflow Nodes</h3>
            {currentNodes.length > 0 && <Badge variant="secondary">{currentNodes.length}</Badge>}
          </div>

          {loadingNodes ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading workflow nodes...</p>
              </div>
            </div>
          ) : currentNodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentNodes.map((node) => (
                <Card 
                  key={`${node.appId}-${node.configId}-${node.currentLevel}-${node.nextLevel}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleNodeClick(node)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{node.configName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {node.configType} • ID: {node.configId}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={node.isUsedForWorkflowInstance ? "default" : "secondary"}>
                          {node.isUsedForWorkflowInstance ? "Terminal" : "Navigate"}
                        </Badge>
                        {node.isConfigured && (
                          <Badge variant="outline" className="text-xs">
                            Configured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-muted-foreground" />
                          <span>Level {node.currentLevel} → {node.nextLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span>{node.percentageCompleted}%</span>
                        </div>
                      </div>
                      
                      {node.isWeekly && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Weekly: {node.isWeekly}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>App ID: {node.appId}</span>
                        {node.isUsedForWorkflowInstance ? (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>Click for details</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" />
                            <span>Click to navigate</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Nodes Found</h3>
                <p className="text-muted-foreground">
                  No workflow nodes are available at this level.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationsGrid;