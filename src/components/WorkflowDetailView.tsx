import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import SafeRouter from './SafeRouter';
import WorkflowProgressIndicator from './WorkflowProgressIndicator';
import WorkflowStagesBar from './WorkflowStagesBar';
import WorkflowTaskItem, { WorkflowTask } from './WorkflowTaskItem';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast, showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '@/lib/toast';
import { useDate } from '@/contexts/DateContext';
import { useUserActivity } from '@/hooks/useUserActivity';
import { CreateSupportIssue } from './support/CreateSupportIssue';
import ProcessQueries from './workflow/ProcessQueries';
import ProcessParameters from './workflow/ProcessParameters';
import AppParameters from './workflow/AppParameters';
import GlobalParameters from './workflow/GlobalParameters';
import ProcessDependencies from './workflow/ProcessDependencies';
import ProcessOverview from './workflow/ProcessOverview';
import StageOverview from './workflow/StageOverview';
import WorkflowUnifiedHeader from './workflow/WorkflowUnifiedHeader';
import WorkflowStepFunctionDiagram from './workflow/WorkflowStepFunctionDiagram';
import { generateSampleWorkflowDiagram } from '@/lib/workflowDiagramUtils';
import { EnhancedFilePreview } from './files/EnhancedFilePreview';
import AdvancedFilePreview from './files/AdvancedFilePreview';
import FileDataIntegration from './files/FileDataIntegration';
import FileLocationDebugger from './files/FileLocationDebugger';
import EnhancedFileViewer from './files/EnhancedFileViewer';
import EnhancedWorkflowFilePreview from './files/EnhancedWorkflowFilePreview';
import ModernWorkflowView from './workflow/ModernWorkflowView';
import StepFunctionView from './workflow/StepFunctionView';
import { 
  FileText, 
  Lock, 
  Unlock, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Network,
  Users,
  Activity,
  RefreshCw,
  Plus,
  RotateCcw,
  Unlock as UnlockIcon,
  Layers,
  Settings,
  PlayCircle,
  SkipForward,
  Mail,
  Bot,
  UserCircle,
  ArrowRightCircle,
  XCircle,
  CircleDot,
  BarChart4,
  AlertCircle,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Eye,
  EyeOff,
  GitBranch,
  Pause,
  Play,
  Timer,
  ThumbsUp,
  ThumbsDown,
  Send
} from 'lucide-react';
import WorkflowActionButtons from './workflow/WorkflowActionButtons';
import ProcessApprovalDialog from './workflow/ProcessApprovalDialog';
import { getFileIcon } from './DocumentsList';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SubStagesList from './SubStagesList';
import DocumentsList from './DocumentsList';
import DependencyTreeMap from './DependencyTreeMap';
import RoleAssignments from './RoleAssignments';
import ActivityLog from './ActivityLog';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import WorkflowHierarchyBreadcrumb, { HierarchyNode } from './WorkflowHierarchyBreadcrumb';
import { Progress } from '@/components/ui/progress';
import { SubStage, StageStatus, Dependency } from '@/types/workflow';
import { getStageData, getStageTasksById, getStageDocumentsById, getStageMetricsById } from '@/data/stageSpecificData';
import { workflowService } from '@/services/workflowService';

interface WorkflowDetailViewProps {
  workflowTitle: string;
  progressSteps: { name: string; progress: number }[];
  stages: { id: string; name: string }[];
  tasks: Record<string, WorkflowTask[]>; // Map of stageId to tasks
  viewMode?: 'classic' | 'modern' | 'step-function';
  onViewToggle?: (mode: 'classic' | 'modern' | 'step-function') => void;
  // Enhanced props for right panel binding
  summaryData?: any; // WorkflowSummary from API
  applicationData?: any; // WorkflowApplication from API
  nodeData?: any; // WorkflowNode from API
  // Navigation props
  onBack?: () => void; // Callback to navigate back to previous view
  onRefresh?: () => void; // Callback to trigger a refresh
  // Enhanced workflow data for Modern and Step Function views
  enhancedWorkflowData?: any;
  applicationId?: number;
  configId?: string;
}

interface ActivityLogItem {
  action: string;
  timestamp: string;
  user: string;
  role: string;
  substage: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'skipped';
}

interface UserActivity {
  id: string;
  name: string;
  assignedTo: string;
  email: string;
  status: string;
  lastActivity: string;
  timestamp: string;
}

interface RoleAssignments {
  roleAssignments: {
    [key: string]: UserActivity[];
  };
}

const getStatusVariant = (status: StageStatus) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'in-progress':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'skipped':
      return 'outline';
    default:
      return 'default';
  }
};

const WorkflowDetailView: React.FC<WorkflowDetailViewProps> = ({
  workflowTitle,
  progressSteps,
  stages,
  tasks,
  viewMode = 'classic',
  onViewToggle,
  summaryData,
  applicationData,
  nodeData,
  onBack,
  onRefresh,
  enhancedWorkflowData,
  applicationId,
  configId,
}) => {
  return (
    <SafeRouter>
      {(router) => {
        return <WorkflowDetailViewContent 
          router={router}
          workflowTitle={workflowTitle}
          progressSteps={progressSteps}
          stages={stages}
          tasks={tasks}
          viewMode={viewMode}
          onViewToggle={onViewToggle}
          summaryData={summaryData}
          applicationData={applicationData}
          nodeData={nodeData}
          onBack={onBack}
          onRefresh={onRefresh}
          enhancedWorkflowData={enhancedWorkflowData}
          applicationId={applicationId}
          configId={configId}
        />;
      }}
    </SafeRouter>
  );
};

const WorkflowDetailViewContent: React.FC<WorkflowDetailViewProps & { router: any }> = ({
  router,
  workflowTitle,
  progressSteps,
  stages,
  tasks,
  viewMode = 'classic',
  onViewToggle,
  summaryData,
  applicationData,
  nodeData,
  onBack,
  onRefresh,
  enhancedWorkflowData,
  applicationId,
  configId
}) => {
  const { state: breadcrumbState, navigateToLevel, setNodes } = useBreadcrumb();
  const { selectedDate } = useDate();
  const [activeStage, setActiveStage] = useState<string>(stages[0]?.id || '');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tasks: true
  });
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(15);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<'overview' | 'stage-overview' | 'process-overview' | 'stages' | 'documents' | 'parameters' | 'dependencies' | 'roles' | 'activity' | 'audit' | 'app-parameters' | 'global-parameters' | 'queries' | 'diagram'>('stage-overview');
  const [selectedSubStage, setSelectedSubStage] = useState<string | null>(null);
  const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(false);
  const [stageSpecificSubStages, setStageSpecificSubStages] = useState<SubStage[]>([]);
  const [stageSpecificDocuments, setStageSpecificDocuments] = useState<any[]>([]);
  const [showFilePreview, setShowFilePreview] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentSubStageFiles, setCurrentSubStageFiles] = useState<any[]>([]);
  const [showWorkflowDetail, setShowWorkflowDetail] = useState<boolean>(true);
  const [showSubStageCards, setShowSubStageCards] = useState<boolean>(true);
  
  // Enhanced file preview state
  const [filePreviewMode, setFilePreviewMode] = useState<'none' | 'enhanced' | 'legacy'>('none');
  const [filePreviewLeftPanel, setFilePreviewLeftPanel] = useState<boolean>(true);
  const [filePreviewRightPanel, setFilePreviewRightPanel] = useState<boolean>(false);
  const [filePreviewFullscreen, setFilePreviewFullscreen] = useState<boolean>(false);

  // Build hierarchy path from progressSteps
  const [hierarchyPath, setHierarchyPath] = useState<HierarchyNode[]>([]);

  // Auto-refresh state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(10); // 10 seconds
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // User activity detection for auto-refresh pause/resume
  const { isActive: isUserActive } = useUserActivity({
    timeout: 2 * 60 * 1000, // 2 minutes
    events: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown']
  });

  // Dependency mapping state
  const [dependencyMap, setDependencyMap] = useState<Map<string, SubStage>>(new Map());

  // UI state preservation during refresh - Enhanced to prevent jumping
  const [preservedState, setPreservedState] = useState<{
    activeTab: string;
    selectedSubStage: string | null;
    rightPanelContent: string;
    showFilePreview: boolean;
    scrollPosition: number;
    activeStage: string;
    expandedSections: Record<string, boolean>;
  }>({
    activeTab: 'overview',
    selectedSubStage: null,
    rightPanelContent: 'stage-overview',
    showFilePreview: false,
    scrollPosition: 0,
    activeStage: stages[0]?.id || '',
    expandedSections: { tasks: true }
  });

  // Initialize hierarchy path from breadcrumb context
  useEffect(() => {
    if (breadcrumbState.nodes && breadcrumbState.nodes.length > 0) {
      const path = breadcrumbState.nodes.map((node, index) => {
        return {
          id: node.id,
          name: `${node.name} (${node.level === 0 ? node.appId : (node.configId || node.appGroupId)}) (${node.completionPercentage}%)`,
          progress: node.completionPercentage,
          level: index === 0 ? 'app' : 'workflow',
          onClick: (n: HierarchyNode) => handleBreadcrumbNavigation(n, index)
        };
      });
      setHierarchyPath(path);
    }
  }, [breadcrumbState.nodes]);

  // Enhanced breadcrumb navigation with proper error handling
  const handleBreadcrumbNavigation = useCallback((node: HierarchyNode, index: number) => {
    try {
      // Allow navigation to any level except the last one (current view)
      if (index < breadcrumbState.nodes.length - 1) {
        navigateToLevel(index);
        if (onBack) {
          onBack(); // This should take us back to ApplicationsGrid
        } else {
          router.push('/dashboard'); // Fallback
        }
      }
    } catch (error) {
      showErrorToast('Navigation failed. Please try again.');
    }
  }, [breadcrumbState.nodes, router, navigateToLevel, onBack]);

  // Preserve UI state before refresh - Enhanced to prevent jumping
  const preserveUIState = useCallback(() => {
    setPreservedState({
      activeTab,
      selectedSubStage,
      rightPanelContent,
      showFilePreview,
      scrollPosition: window.scrollY,
      activeStage,
      expandedSections
    });
  }, [activeTab, selectedSubStage, rightPanelContent, showFilePreview, activeStage, expandedSections]);

  // Restore UI state after refresh - Enhanced to prevent jumping
  const restoreUIState = useCallback(() => {
    // Only update state if it has actually changed to prevent unnecessary re-renders
    if (preservedState.activeTab !== activeTab) {
      setActiveTab(preservedState.activeTab);
    }
    if (preservedState.selectedSubStage !== selectedSubStage) {
      setSelectedSubStage(preservedState.selectedSubStage);
    }
    if (preservedState.rightPanelContent !== rightPanelContent) {
      setRightPanelContent(preservedState.rightPanelContent as any);
    }
    if (preservedState.showFilePreview !== showFilePreview) {
      setShowFilePreview(preservedState.showFilePreview);
    }
    if (preservedState.activeStage !== activeStage) {
      setActiveStage(preservedState.activeStage);
    }
    if (JSON.stringify(preservedState.expandedSections) !== JSON.stringify(expandedSections)) {
      setExpandedSections(preservedState.expandedSections);
    }
    
    // Restore scroll position
    setTimeout(() => {
      window.scrollTo(0, preservedState.scrollPosition);
    }, 100);
  }, [preservedState, activeTab, selectedSubStage, rightPanelContent, showFilePreview, activeStage, expandedSections]);

  // Enhanced refresh with data fetching for main view and all breadcrumb nodes
  const handleRefresh = useCallback(async (isManualRefresh: boolean = false) => {
    if (isRefreshing) {
      return;
    }
    
    if (isManualRefresh) {
      showInfoToast("Refreshing workflow data...");
    }

    setIsRefreshing(true);
    preserveUIState();
    
    if (onRefresh) {
      try {
        await onRefresh();
        if (isManualRefresh) {
          showSuccessToast("Workflow data refreshed successfully.");
        }
      } catch (error: any) {
        showErrorToast(`Refresh failed: ${error.message}`);
      } finally {
        setIsRefreshing(false);
        setLastRefreshed(new Date());
        setCountdown(refreshInterval);
        setTimeout(restoreUIState, 200);
      }
    } else {
      showWarningToast("Refresh functionality is not configured for this view.");
      setIsRefreshing(false);
    }
  }, [isRefreshing, preserveUIState, restoreUIState, onRefresh, refreshInterval]);

  // Handle workflow action completion (Force Start, Re-run, Approve, Reject)
  const handleActionComplete = useCallback(async (action: 'force-start' | 're-run' | 'approve' | 'reject', success: boolean, processId?: string) => {
    if (success) {
      // Refresh the workflow data after successful action
      setTimeout(() => {
        handleRefresh(false); // Silent refresh after action
      }, 1000); // Small delay to allow backend processing
    }
  }, [handleRefresh]);

  // Toggle workflow lock state
  const toggleLock = () => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    if (newLockState) {
      showInfoToast("Workflow locked");
    } else {
      showWarningToast("Workflow unlocked - changes can now be made");
    }
  };

  // Format seconds since last refresh
  const getSecondsSinceRefresh = () => {
    const seconds = Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 1000);
    return seconds;
  };

  // Auto-refresh setup with user activity detection
  useEffect(() => {
    if (autoRefreshEnabled && isUserActive) {
      autoRefreshTimerRef.current = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
    } else {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    }

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [autoRefreshEnabled, refreshInterval, handleRefresh, isUserActive]);

  // Countdown timer for auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [refreshInterval]);

  const handleStageClick = (stageId: string) => {
    setActiveStage(stageId);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeStageTasks = tasks[activeStage] || [];
  const activeStageInfo = stages.find(stage => stage.id === activeStage);

  // Optimized mock data - reduced to prevent memory issues
  const mockSubStages: SubStage[] = [
    { 
      id: 'trigger_file',
      name: 'Create Trigger File for Rec Factory',
      type: 'auto',
      status: 'completed',
      progress: 100,
      processId: 'PROC-1237',
      timing: {
        start: '07:30:00',
        duration: '5m',
        avgDuration: '3m',
        avgStart: '07:30 AM'
      },
      stats: {
        success: '99%',
        lastRun: null
      },
      meta: {
        updatedBy: 'System',
        updatedOn: '2025-04-12T07:35:00',
        lockedBy: null,
        lockedOn: null,
        completedBy: 'System',
        completedOn: '2025-04-12T07:35:00'
      },
      files: [
        { name: 'trigger.dat', type: 'download', size: '2 KB' }
      ],
      messages: ['Successfully created trigger file'],
      dependencies: []
    },
    { 
      id: 'data_validation',
      name: 'Data Validation and Reconciliation',
      type: 'auto',
      status: 'completed',
      progress: 100,
      processId: 'PROC-1238',
      timing: {
        start: '08:00:00',
        duration: '12m',
        avgDuration: '10m',
        avgStart: '08:00 AM'
      },
      stats: {
        success: '98%',
        lastRun: '2025-04-12T08:12:00'
      },
      meta: {
        updatedBy: 'System',
        updatedOn: '2025-04-12T08:12:00',
        lockedBy: null,
        lockedOn: null,
        completedBy: 'System',
        completedOn: '2025-04-12T08:12:00'
      },
      files: [
        { name: 'validation_report.xlsx', type: 'download', size: '1.5 MB' }
      ],
      messages: ['Data validation completed successfully'],
      dependencies: [
        { name: 'Create Trigger File for Rec Factory', status: 'completed', id: 'trigger_file' }
      ]
    },
    { 
      id: 'final_approval',
      name: 'Final Approval and Sign-off',
      type: 'manual',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1244',
      timing: {
        start: '10:30:00',
        duration: '10m',
        avgDuration: '8m',
        avgStart: '10:30 AM'
      },
      stats: {
        success: '100%',
        lastRun: null
      },
      meta: {
        updatedBy: null,
        updatedOn: null,
        lockedBy: null,
        lockedOn: null,
        completedBy: null,
        completedOn: null
      },
      files: [],
      messages: ['Awaiting final approval'],
      dependencies: [
        { name: 'Data Validation and Reconciliation', status: 'completed', id: 'data_validation' }
      ]
    }
  ];

  const mockDocuments = [
    { id: 'doc-1', name: 'input_data.xlsx', type: 'excel', size: '2.4 MB', updatedAt: '2025-04-14 02:30', updatedBy: 'John Doe' },
    { id: 'doc-2', name: 'validation_report.pdf', type: 'pdf', size: '1.2 MB', updatedAt: '2025-04-14 02:45', updatedBy: 'System' }
  ];

  const mockParameters = {
    app: [
      { name: 'APP_TIMEOUT', value: '3600', description: 'Application timeout in seconds' },
      { name: 'MAX_RETRIES', value: '3', description: 'Maximum number of retries' },
    ],
    global: [
      { name: 'ENV', value: 'PRODUCTION', description: 'Environment' },
      { name: 'LOG_LEVEL', value: 'INFO', description: 'Logging level' },
    ],
    process: [
      { name: 'BATCH_SIZE', value: '1000', description: 'Number of records to process in a batch' },
      { name: 'VALIDATION_THRESHOLD', value: '0.95', description: 'Minimum validation score' },
    ],
  };

  const mockDependencies: Dependency[] = [
    { name: 'SOD Roll', status: 'completed', completedAt: '2025-04-14 06:15', id: 'dep-1' },
    { name: 'Market Data Load', status: 'completed', completedAt: '2025-04-14 06:30', id: 'dep-2' },
    { name: 'Risk Calculation', status: 'in-progress', completedAt: null, id: 'dep-3' },
    { name: 'Compliance Check', status: 'not-started', completedAt: null, id: 'dep-4' },
  ];

  const mockAuditInfo: ActivityLogItem[] = [
    { 
      action: 'Process Started',
      timestamp: '2025-04-14 06:45',
      user: 'System',
      role: 'System',
      substage: 'Initialization',
      status: 'completed'
    }
  ];

  const mockRoleAssignments = {
    producer: [
      {
        name: 'John Doe',
        lastActivity: 'Updated workflow parameters',
        timestamp: '2025-04-14 06:15'
      }
    ],
    approver: [
      {
        name: 'Jane Smith',
        lastActivity: 'Approved stage completion',
        timestamp: '2025-04-14 06:30'
      }
    ]
  };

  // Build dependency mapping for navigation
  const buildDependencyMap = useCallback((subStages: SubStage[]) => {
    const map = new Map<string, SubStage>();
    subStages.forEach(subStage => {
      map.set(subStage.id, subStage);
      map.set(subStage.processId, subStage);
      map.set(subStage.name, subStage);
    });
    setDependencyMap(map);
  }, []);

  // Enhanced dependency click handler
  const handleDependencyClick = useCallback((dependencyId: string) => {
    const targetSubStage = dependencyMap.get(dependencyId);
    if (targetSubStage) {
      // Navigate to the sub-stage
      setSelectedSubStage(targetSubStage.id);
      setRightPanelContent('process-overview');
      setRightPanelOpen(true);
      setIsRightPanelExpanded(true);
      
      // Scroll to the sub-stage card if it's visible
      const element = document.querySelector(`[data-process-id="${targetSubStage.processId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      showInfoToast(`Navigated to dependency: ${targetSubStage.name}`);
    } else {
      showWarningToast(`Dependency "${dependencyId}" not found in current stage`);
    }
  }, [dependencyMap]);

  // Load stage-specific data when active stage changes (memory optimized)
  useEffect(() => {
    if (activeStage && tasks[activeStage]) {
      // Convert actual API tasks to SubStage format with enhanced field mapping
      // Handle large workflows with 100+ substages
      const stageTasks = tasks[activeStage].map((task, index) => {
        // Enhanced progress calculation based on API fields
        let progress = 0;
        if (task.status === 'completed') {
          progress = 100;
        } else if (task.status === 'in_progress' || task.status === 'in-progress') {
          // Use percentage from API if available, otherwise default to 50
          progress = task.percentage || 50;
        } else if (task.status === 'failed') {
          // Failed tasks might have partial progress
          progress = task.partialComplete === 'Y' ? (task.percentage || 25) : 0;
        } else {
          progress = 0;
        }

        // Enhanced timing information
        const timing = {
          start: task.expectedStart || '09:00',
          duration: task.actualDuration || `${task.duration || 0}m`,
          avgDuration: `${task.duration || 0}m`,
          avgStart: task.expectedStart || '09:00'
        };

        // Enhanced metadata with all available API fields
        const meta = {
          updatedBy: task.updatedBy || null,
          updatedOn: task.updatedAt || null,
          lockedBy: task.lockedBy || null,
          lockedOn: task.lockedOn || null,
          completedBy: task.completedBy || null,
          completedOn: task.completedOn || null
        };

        // Enhanced file mapping with better type detection
        const files = task.documents?.map(doc => {
          const fileExtension = doc.name.split('.').pop()?.toLowerCase() || '';
          let fileType = 'download'; // default
          
          // Determine file type based on task properties and file extension
          if (task.uploadAllowed === 'Y' && ['xlsx', 'csv', 'txt', 'json'].includes(fileExtension)) {
            fileType = 'upload';
          } else if (['log', 'txt', 'json', 'xml'].includes(fileExtension)) {
            fileType = 'preview';
          }
          
          return {
            name: doc.name,
            type: fileType,
            size: doc.size
          };
        }) || [];

        // Enhanced messages with API-specific information
        const messages = [...(task.messages || [])];
        
        // Add additional contextual messages based on API fields
        if (task.isLocked === 'Y' && task.lockedBy) {
          messages.push(`Process locked by ${task.lockedBy}`);
        }
        
        if (task.attestRequired === 'Y' && !task.attestedBy) {
          messages.push('Attestation required before completion');
        } else if (task.attestRequired === 'Y' && task.attestedBy) {
          messages.push(`Attested by ${task.attestedBy}`);
        }
        
        if (task.approval === 'Y') {
          messages.push('Requires approval');
        }
        
        if (task.isRTB) {
          messages.push('Run-The-Bank (RTB) process');
        }
        
        if (task.isAlteryx === 'Y') {
          messages.push('Alteryx workflow process');
        }

        // Enhanced dependencies with better status mapping and navigation
        const dependencies = task.dependencies?.map(dep => ({
          name: dep.name,
          status: dep.status === 'in_progress' ? 'in-progress' : dep.status,
          id: dep.id || dep.name.toLowerCase().replace(/\s+/g, '_'),
          onClick: () => handleDependencyClick(dep.id || dep.name)
        })) || [];

        // Clean up processId format - convert "task-1234" to "PROC-1234" for consistency
        let cleanProcessId = task.processId;
        if (task.processId && task.processId.startsWith('task-')) {
          cleanProcessId = task.processId.replace('task-', 'PROC-');
        }

        // Use dep_Sub_Stage_Seq for global sequencing if available
        const globalSequence = task.dep_Sub_Stage_Seq || task.subStageSeq || (index + 1);
        
        return {
          id: task.id,
          name: task.name,
          type: (task.auto === 'y' || task.auto === 'Y') ? 'auto' as const : 'manual' as const,
          status: task.status === 'in_progress' ? 'in-progress' as const : task.status,
          progress,
          processId: cleanProcessId,
          sequence: globalSequence, // Use global sequence
          timing,
          stats: {
            success: '95%', // Could be enhanced with historical data
            lastRun: task.completedOn || null
          },
          meta,
          files,
          messages,
          dependencies,
          
          // Additional configuration based on API fields
          config: {
            canTrigger: task.isActive === 'y' && task.status === 'not_started',
            canRerun: task.status === 'completed' || task.status === 'failed',
            canForceStart: task.adhoc === 'Y',
            canSkip: task.status === 'not_started' || task.status === 'in_progress',
            canSendEmail: true // Could be based on notification settings
          },
          
          // Store original API data for right panel access
          apiData: {
            workflowProcessId: task.workflowProcessId,
            workflowAppConfigId: task.workflowAppConfigId,
            stageId: task.stageId,
            subStageId: task.subStageId,
            stageName: task.stageName,
            subStageName: task.subStageName,
            serviceLink: task.serviceLink,
            businessDate: task.businessDate,
            componentName: task.componentName,
            resolvedComponentName: task.resolvedComponentName,
            producer: task.producer,
            approver: task.approver,
            entitlementMapping: task.entitlementMapping,
            userCommentary: task.userCommentary,
            skipCommentary: task.skipCommentary,
            dep_Sub_Stage_Seq: task.dep_Sub_Stage_Seq,
            approval: task.approval // Add approval field for ProcessApprovalDialog
          }
        };
      });

      // Sort by global sequence to ensure proper ordering
      stageTasks.sort((a, b) => a.sequence - b.sequence);
      
      setStageSpecificSubStages(stageTasks);
      buildDependencyMap(stageTasks);
      
      // Enhanced document extraction with better categorization (optimized for large workflows)
      const stageDocuments = tasks[activeStage].reduce((docs: any[], task) => {
        if (task.documents && docs.length < 500) { // Increased limit for large workflows
          task.documents.forEach((doc, index) => { // Process all documents per task
            const fileExtension = doc.name.split('.').pop()?.toLowerCase() || 'unknown';
            docs.push({
              id: `${task.id}-doc-${index}`,
              name: doc.name,
              type: fileExtension,
              size: doc.size,
              updatedAt: task.updatedAt || new Date().toISOString(),
              updatedBy: task.updatedBy || 'System',
              category: task.uploadAllowed === 'Y' ? 'upload' : 'download',
              processId: task.processId,
              workflowProcessId: task.workflowProcessId
            });
          });
        }
        return docs;
      }, []);
      
      setStageSpecificDocuments(stageDocuments);
    } else {
      // If no stage-specific data found, clear the data
      setStageSpecificSubStages([]);
      setStageSpecificDocuments([]);
      setDependencyMap(new Map());
    }
  }, [activeStage, tasks, buildDependencyMap, handleDependencyClick]);



  // Enhanced hierarchy node click handler to properly navigate between levels
  const handleHierarchyNodeClick = (node: HierarchyNode) => {
    // Find the index of the clicked node
    const nodeIndex = hierarchyPath.findIndex(item => item.id === node.id);
    
    if (nodeIndex >= 0) {
      // Truncate the path to this node to navigate to that level
      setHierarchyPath(hierarchyPath.slice(0, nodeIndex + 1));
    }
    
    // Note: The actual navigation is now handled in the WorkflowHierarchyBreadcrumb component
  };
  
  // Handle home button click
  const handleHomeClick = () => {
    // Note: The actual navigation is now handled in the WorkflowHierarchyBreadcrumb component
  };

  const handleProcessIdClick = (processId: string) => {
    // Prevent event bubbling if event is available
    event?.stopPropagation?.();
    
    // Find the sub-stage by process ID
    const subStage = (stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages)
      .find(s => s.processId === processId);
    
    // If found, use the sub-stage ID, otherwise use the process ID
    const subStageId = subStage ? subStage.id : processId;
    
    // If clicking the same sub-stage, deselect it and hide the preview if it's open
    if (selectedSubStage === subStageId) {
      setSelectedSubStage(null);
      setRightPanelContent('stage-overview');
      
      // If file preview is open, close it when deselecting the process
      if (showFilePreview) {
        setShowFilePreview(false);
        setSelectedFile(null);
      }
    } else {
      // Switching to a different sub-stage
      setSelectedSubStage(subStageId);
      
      // Set current sub-stage files
      if (subStage && subStage.files) {
        const filesList = subStage.files.map((file, index) => ({
          id: `file-${subStage.id}-${index}`,
          name: file.name,
          type: file.name.split('.').pop() || '',
          size: file.size,
          category: file.type
        }));
        
        setCurrentSubStageFiles(filesList);
        
        // Only show process overview by default, don't auto-preview files
        setRightPanelContent('process-overview');
        setRightPanelOpen(true);
        setIsRightPanelExpanded(true);
        
        // Ensure file preview is closed when just clicking on a process card
        setShowFilePreview(false);
        setSelectedFile(null);
      } else {
        // If no sub-stage or no files, just show the process overview
        setRightPanelContent('process-overview');
        setRightPanelOpen(true);
        setIsRightPanelExpanded(true);
      }
    }
  };
  
  const handleFileClick = (file: any, subStageId: string) => {
    // Set the selected sub-stage
    setSelectedSubStage(subStageId);
    
    // Find the sub-stage
    const subStage = (stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages)
      .find(s => s.id === subStageId);
    
    // Set current sub-stage files
    if (subStage && subStage.files) {
      setCurrentSubStageFiles(subStage.files.map((file, index) => ({
        id: `file-${subStage.id}-${index}`,
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        category: file.type
      })));
    }
    
    // Navigate to the workflow detail view's Files section
    setRightPanelContent('documents');
    setRightPanelOpen(true);
    setShowWorkflowDetail(true);
    
    // Explicitly ensure file preview is closed
    setShowFilePreview(false);
    setSelectedFile(null);
  };
  
  // Enhanced file preview handlers
  const handleEnhancedFilePreview = (files: any[], processName: string, processId: string) => {
    // Set the files for preview
    setCurrentSubStageFiles(files);
    
    // Switch to enhanced preview mode
    setFilePreviewMode('enhanced');
    setShowFilePreview(true);
    
    // Hide workflow detail to maximize preview space
    setShowWorkflowDetail(false);
    
    // Show sub-stage cards by default
    setShowSubStageCards(true);
  };
  
  // Function to preview a file from a process (legacy)
  const handlePreviewFile = (fileName: string) => {
    // If we're already in preview mode, update the file
    setSelectedFile(fileName);
    setFilePreviewMode('legacy');
    setShowFilePreview(true);
    
    // In preview mode, hide workflow detail to give more space
    setShowWorkflowDetail(false);
    
    // If sub-stage cards are hidden, show them
    if (!showSubStageCards) {
      setShowSubStageCards(true);
    }
  };
  
  const toggleSubStageCards = () => {
    setShowSubStageCards(!showSubStageCards);
  };
  
  const handleCloseFilePreview = () => {
    setShowFilePreview(false);
    setSelectedFile(null);
    setFilePreviewMode('none');
    // Don't automatically show workflow detail when closing file preview
    // Let the user toggle it with the icon if they want
  };
  
  const toggleWorkflowDetail = () => {
    // Toggle the workflow detail view visibility
    setShowWorkflowDetail(!showWorkflowDetail);
  };
  
  // Enhanced file preview panel controls
  const toggleFilePreviewLeftPanel = () => {
    setFilePreviewLeftPanel(!filePreviewLeftPanel);
  };
  
  const toggleFilePreviewRightPanel = () => {
    setFilePreviewRightPanel(!filePreviewRightPanel);
  };
  
  const toggleFilePreviewFullscreen = () => {
    setFilePreviewFullscreen(!filePreviewFullscreen);
  };

  const renderRightPanelContent = () => {
    // If a specific process is selected, use its ID and name
    const currentProcessId = selectedSubStage || activeStage;
    const currentProcessName = selectedSubStage 
      ? (stageSpecificSubStages.find(s => s.id === selectedSubStage)?.name || 'Unknown Process') 
      : (activeStageInfo?.name || 'Unknown Process');
    
    // Get the process details if a specific process is selected
    const selectedProcess = selectedSubStage 
      ? stageSpecificSubStages.find(s => s.id === selectedSubStage) 
      : null;
    
    switch (rightPanelContent) {
      case 'overview':
      case 'stage-overview':
        return <StageOverview stageId={activeStage} stageName={activeStageInfo?.name || 'Unknown Stage'} />;
      case 'diagram':
        return (
          <div className="h-full">
            <WorkflowStepFunctionDiagram
              workflowId={workflowTitle.toLowerCase().replace(/\s+/g, '-')}
              workflowTitle={workflowTitle}
              {...generateSampleWorkflowDiagram()}
              onNodeClick={(nodeId) => {
                // If node is a stage or substage, we could navigate to it
                if (nodeId.startsWith('stage-')) {
                  const stageId = nodeId.replace('stage-', '');
                  const stage = stages.find(s => s.id === stageId);
                  if (stage) {
                    setActiveStage(stageId);
                    setRightPanelContent('stage-overview');
                  }
                } else if (nodeId.startsWith('substage-')) {
                  const substageId = nodeId.replace('substage-', '');
                  // Find the stage containing this substage
                  for (const stage of stages) {
                    const stageTasks = tasks[stage.id] || [];
                    const task = stageTasks.find(t => t.id === substageId);
                    if (task) {
                      setActiveStage(stage.id);
                      setSelectedSubStage(substageId);
                      setRightPanelContent('process-overview');
                      break;
                    }
                  }
                }
              }}
            />
          </div>
        );
      case 'process-overview':
        return <ProcessOverview processId={currentProcessId} processName={currentProcessName} />;
      case 'stages':
        return <SubStagesList subStages={stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages} />;
      case 'documents':
        const fileData = summaryData?.fileData || [];
        
        let filesToShow: any[] = [];
        
        if (selectedSubStage) {
          // Show files for the selected process only
          // Handle different processId formats: "PROC-1234", "task-1234", or just "1234"
          let numericProcessId = currentProcessId;
          if (currentProcessId.startsWith('PROC-')) {
            numericProcessId = currentProcessId.replace('PROC-', '');
          } else if (currentProcessId.startsWith('task-')) {
            numericProcessId = currentProcessId.replace('task-', '');
          }
          
          // Get files from API data for this specific process
          // Try multiple matching strategies to handle different data formats
          const processFiles = fileData.filter((file: any) => {
            if (!file.name) return false;
            
            const fileProcessId = file.workflow_Process_Id?.toString();
            
            // Try exact match with numeric process ID
            if (fileProcessId === numericProcessId) return true;
            
            // Try match with original process ID
            if (fileProcessId === currentProcessId) return true;
            
            // Try match with PROC- prefix
            if (fileProcessId === `PROC-${numericProcessId}`) return true;
            
            // Try match with task- prefix
            if (fileProcessId === `task-${numericProcessId}`) return true;
            
            return false;
          });
          
          // Find the selected process to get its status
          const selectedProcess = (stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages)
            .find(s => s.id === selectedSubStage);
          
          const processStatus = selectedProcess?.status === 'in-progress' ? 'IN PROGRESS' : 
                               selectedProcess?.status === 'completed' ? 'COMPLETED' :
                               selectedProcess?.status === 'failed' ? 'FAILED' : 'NOT STARTED';
          
          // Convert API files to enhanced file format
          filesToShow = processFiles.map((file: any, index: number) => ({
            id: `file-${file.workflow_Process_Id}-${index}`,
            name: file.name || 'Unknown File',
            type: (file.name || '').split('.').pop() || 'unknown',
            size: file.size || 'Unknown Size',
            location: file.value || '', // Use file.value as location
            param_Type: (file.file_Upload === true || file.file_Upload === 'Y') ? 'upload' as const : 'download' as const,
            processStatus: processStatus as any,
            updatedAt: file.updatedon || new Date().toISOString().split('T')[0],
            updatedBy: file.updatedBy || 'System'
          }));
        } else {
          // Show all files for the current stage when no specific process is selected
          const stageFiles = fileData.filter((file: any) => file.name);
          
          // Convert API files to enhanced file format
          filesToShow = stageFiles.map((file: any, index: number) => ({
            id: `file-stage-${index}`,
            name: file.name || 'Unknown File',
            type: (file.name || '').split('.').pop() || 'unknown',
            size: file.size || 'Unknown Size',
            location: file.value || '', // Use file.value as location
            param_Type: (file.file_Upload === true || file.file_Upload === 'Y') ? 'upload' as const : 'download' as const,
            processStatus: 'COMPLETED' as any, // Default status for stage-level files
            updatedAt: file.updatedon || new Date().toISOString().split('T')[0],
            updatedBy: file.updatedBy || 'System'
          }));
        }
        
        // Handle file upload
        const handleFileUpload = (file: any) => {
          // TODO: Implement file upload functionality
          // This would typically open a file picker and upload to the specified location
        };
        
        // Handle file download
        const handleFileDownload = (file: any) => {
          // TODO: Implement file download functionality
          // This would typically trigger a download from the file location
        };
        
        // Check if we should use enhanced preview
        if (filesToShow.length > 0 && selectedSubStage) {
          return (
            <div className="space-y-4">
              {/* Enhanced file preview trigger */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Process Files</h4>
                  <p className="text-sm text-muted-foreground">{filesToShow.length} files available</p>
                </div>
                <Button
                  onClick={() => handleEnhancedFilePreview(filesToShow, currentProcessName, currentProcessId)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Enhanced Preview
                </Button>
              </div>
              
              {/* Fallback to standard file viewer */}
              <EnhancedFileViewer
                files={filesToShow}
                processName={currentProcessName}
                processId={currentProcessId}
                onFileUpload={handleFileUpload}
                onFileDownload={handleFileDownload}
              />
            </div>
          );
        }
        
        return (
          <div>
            <EnhancedFileViewer
              files={filesToShow}
              processName={currentProcessName}
              processId={currentProcessId}
              onFileUpload={handleFileUpload}
              onFileDownload={handleFileDownload}
            />
          </div>
        );
      case 'parameters':
        return <ProcessParameters processId={currentProcessId} processName={currentProcessName} />;
      case 'dependencies':
        return <ProcessDependencies processId={currentProcessId} processName={currentProcessName} />;
      case 'roles':
        return <RoleAssignments roleAssignments={mockRoleAssignments} />;
      case 'activity':
        return <ActivityLog activities={mockAuditInfo} />;
      case 'audit':
        return <ActivityLog activities={mockAuditInfo} />;
      case 'app-parameters':
        return <AppParameters processId={currentProcessId} processName={currentProcessName} />;
      case 'global-parameters':
        return <GlobalParameters processId={currentProcessId} processName={currentProcessName} />;
      case 'queries':
        return <ProcessQueries processId={currentProcessId} processName={currentProcessName} />;
      default:
        return null;
    }
  };

  // Enhanced calculation of overall workflow progress with proper data binding
  const calculateOverallProgress = useCallback(() => {
    try {
      // First priority: Use hierarchy path progress if available
      if (hierarchyPath.length > 0) {
        const lastNode = hierarchyPath[hierarchyPath.length - 1];
        if (lastNode && typeof lastNode.progress === 'number') {
          return Math.round(lastNode.progress);
        }
      }
      
      // Second priority: Calculate from processData if available
      if (summaryData && summaryData.processData && summaryData.processData.length > 0) {
        const processData = summaryData.processData;
        const totalProcesses = processData.length;
        const completedProcesses = processData.filter((p: any) => 
          p.status === 'COMPLETED' || p.status === 'completed'
        ).length;
        
        return totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0;
      }
      
      // Third priority: Calculate from stage-specific sub-stages
      if (stageSpecificSubStages.length > 0) {
        const totalSubStages = stageSpecificSubStages.length;
        const completedSubStages = stageSpecificSubStages.filter(subStage => 
          subStage.status === 'completed'
        ).length;
        
        return totalSubStages > 0 ? Math.round((completedSubStages / totalSubStages) * 100) : 0;
      }
      
      // Fallback: Calculate from tasks
      let totalTasks = 0;
      let completedTasks = 0;
      
      Object.values(tasks).forEach(stageTasks => {
        totalTasks += stageTasks.length;
        completedTasks += stageTasks.filter(task => task.status === 'completed').length;
      });
      
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    } catch (error) {
      return 0;
    }
  }, [hierarchyPath, stageSpecificSubStages, tasks, summaryData]);

  // Enhanced calculation of task counts with proper data binding
  const calculateTaskCounts = useCallback(() => {
    try {
      let completed = 0;
      let failed = 0;
      let rejected = 0;
      let pending = 0;
      let processing = 0;
      
      // First priority: Use processData from workflow summary if available
      if (summaryData && summaryData.processData && summaryData.processData.length > 0) {
        summaryData.processData.forEach((process: any) => {
          const status = process.status?.toLowerCase();
          if (status === 'completed') completed++;
          else if (status === 'failed') failed++;
          else if (status === 'rejected') rejected++;
          else if (status === 'in_progress' || status === 'in-progress' || status === 'running') processing++;
          else pending++;
        });
        
        return { completed, failed, rejected, pending, processing };
      }
      
      // Second priority: Use stage-specific sub-stages
      if (stageSpecificSubStages.length > 0) {
        stageSpecificSubStages.forEach(subStage => {
          if (subStage.status === 'completed') completed++;
          else if (subStage.status === 'failed') failed++;
          else if (subStage.status === 'rejected') rejected++;
          else if (subStage.status === 'in-progress') processing++;
          else pending++;
        });
        
        return { completed, failed, rejected, pending, processing };
      }
      
      // Fallback: Use tasks
      Object.values(tasks).forEach(stageTasks => {
        stageTasks.forEach(task => {
          if (task.status === 'completed') completed++;
          else if (task.status === 'failed') failed++;
          else if (task.status === 'rejected') rejected++;
          else if (task.status === 'in_progress' || task.status === 'in-progress') processing++;
          else pending++;
        });
      });
      
      return { completed, failed, rejected, pending, processing };
    } catch (error) {
      return { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 };
    }
  }, [stageSpecificSubStages, tasks, summaryData]);

  // Prepare enhanced workflow data for Modern and Step Function views
  const workflowData = enhancedWorkflowData || {
    id: hierarchyPath[hierarchyPath.length-1]?.id || 'workflow-1',
    title: workflowTitle,
    progressSteps,
    stages,
    tasks,
    summaryData,
    applicationData,
    nodeData,
    // Enhanced task counts from actual data
    taskCounts: calculateTaskCounts(),
    // Overall progress
    progress: calculateOverallProgress(),
    // Additional computed data for better binding
    allFiles: summaryData?.fileData || [],
    allDependencies: summaryData?.dependencyData || [],
    dailyParams: summaryData?.dailyParams || [],
    appParams: summaryData?.appParams || [],
    processParams: summaryData?.processParams || []
  };

  // Handle view toggle
  const handleViewToggle = (newViewMode: 'classic' | 'modern' | 'step-function') => {
    if (onViewToggle) {
      onViewToggle(newViewMode as any);
    }
  };

  // Render different views based on viewMode
  if (viewMode === 'modern') {
    return (
      <ModernWorkflowView
        workflow={workflowData}
        onViewToggle={handleViewToggle}
        viewMode={viewMode}
      />
    );
  }

  if (viewMode === 'step-function') {
    return (
      <StepFunctionView
        workflow={workflowData}
        onViewToggle={handleViewToggle}
        viewMode={viewMode}
      />
    );
  }

  // Default Classic view
  return (
    <div className="space-y-2">
      {/* Unified Workflow Header Card with Auto-Refresh Controls */}
      <WorkflowUnifiedHeader
        workflowId={hierarchyPath[hierarchyPath.length-1]?.id || ''}
        workflowTitle={workflowTitle}
        hierarchyPath={hierarchyPath}
        progress={calculateOverallProgress()}
        status="Active"
        isLocked={isLocked}
        onToggleLock={toggleLock}
        onRefresh={() => handleRefresh(true)}
        taskCounts={calculateTaskCounts()}
        lastRefreshed={lastRefreshed}
        viewMode={viewMode}
        onViewToggle={onViewToggle}
        autoRefreshEnabled={autoRefreshEnabled && isUserActive}
        onAutoRefreshToggle={setAutoRefreshEnabled}
        refreshInterval={refreshInterval}
        countdown={countdown}
        isRefreshing={isRefreshing}
        onBreadcrumbNavigate={handleBreadcrumbNavigation}
        onBack={onBack}
      />

      {/* Modified to include completion percentage */}
      <WorkflowStagesBar 
        stages={stages.map(stage => {
          // Get tasks for this stage
          const stageTasks = tasks[stage.id] || [];
          
          // Calculate completion percentage
          let completionPercentage = 0;
          if (stageTasks.length > 0) {
            const completedTasks = stageTasks.filter(task => task.status === 'completed').length;
            completionPercentage = Math.round((completedTasks / stageTasks.length) * 100);
          }
          
          return {
            ...stage,
            completionPercentage
          };
        })} 
        activeStage={activeStage} 
        onStageClick={handleStageClick} 
      />

      {/* Control buttons row - only shown during file preview */}
      {showFilePreview && filePreviewMode !== 'enhanced' && (
        <div className="flex items-center gap-2 my-2">
          {/* Show Process Cards button - far left */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSubStageCards}
            title={showSubStageCards ? "Hide process cards" : "Show process cards"}
          >
            {showSubStageCards ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>

          {/* Status ribbon and horizontal sub-stage process would go here */}
          <div className="flex-1 flex justify-center">
            {/* Display enhanced selected sub-stage info when file preview is open */}
            {selectedSubStage && (
              <div className="flex items-center gap-3 px-3 py-1 bg-muted/40 rounded-md">
                {(() => {
                  const subStage = (stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages)
                    .find(s => s.id === selectedSubStage);
                  
                  if (!subStage) return null;
                  
                  return (
                    <>
                      <div className={`w-1.5 h-6 rounded-sm ${
                        subStage.status === 'completed' ? 'bg-green-500' :
                        subStage.status === 'in-progress' ? 'bg-blue-500' :
                        subStage.status === 'failed' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`} />
                      <div className="text-sm font-medium">{subStage.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{subStage.processId}</div>
                      
                      {/* Additional process details */}
                      <Separator orientation="vertical" className="h-5 mx-1" />
                      
                      {/* Status */}
                      <Badge variant={getStatusVariant(subStage.status as StageStatus)} className="text-xs">
                        {subStage.status}
                      </Badge>
                      
                      {/* Updated by */}
                      {subStage.meta.updatedBy && (
                        <div className="flex items-center gap-1 text-xs">
                          <UserCircle className="h-3 w-3" />
                          <span>{subStage.meta.updatedBy}</span>
                        </div>
                      )}
                      
                      {/* Messages */}
                      {subStage.messages && subStage.messages.length > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <MessageSquare className="h-3 w-3" />
                          <span>{subStage.messages[0].length > 30 
                            ? `${subStage.messages[0].substring(0, 30)}...` 
                            : subStage.messages[0]}</span>
                        </div>
                      )}
                      
                      {/* Lock status */}
                      {subStage.meta.lockedBy ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Lock className="h-3 w-3" />
                          <span>Locked by {subStage.meta.lockedBy}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs">
                          <Unlock className="h-3 w-3" />
                          <span>Unlocked</span>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-auto">
                        {subStage.status === 'in-progress' && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Complete">
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {(subStage.status === 'completed' || subStage.status === 'failed') && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Rerun">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {(subStage.status === 'not-started' || subStage.status === 'failed') && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Start">
                            <PlayCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Show Workflow Detail button - far right */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleWorkflowDetail}
            title={showWorkflowDetail ? "Hide workflow detail" : "Show workflow detail"}
          >
            {showWorkflowDetail ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}

      <div className="flex gap-4">
        {/* Main Content - Only visible when file preview is not shown or explicitly kept visible */}
        <div className={`${
          showFilePreview ? 
            (filePreviewMode === 'enhanced' ? 'hidden' : (showSubStageCards ? 'flex-[0.3] relative' : 'hidden')) : 
            'flex-[0.6]'
        }`}>
          {/* Process Overview removed from main content as it's now in the right panel */}
          <div className="space-y-4">
            {(() => {
              // Always prefer actual API data over mock data
              const subStagesToRender = stageSpecificSubStages.length > 0 ? stageSpecificSubStages : [];
              
              if (subStagesToRender.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">No sub-stages found for this stage</div>
                    <div className="text-xs mt-1">
                      Active Stage: {activeStage} | Tasks Available: {tasks[activeStage]?.length || 0}
                    </div>
                  </div>
                );
              }
              
              return subStagesToRender.map((subStage, index) => (
                <Collapsible key={subStage.id}>
                  <div 
                    className={`${
                      subStage.status === 'completed' ? 'border-l-[3px] border-l-green-500' :
                      subStage.status === 'in-progress' ? 'border-l-[3px] border-l-blue-500' :
                      subStage.status === 'failed' ? 'border-l-[3px] border-l-red-500' :
                      'border-l-[3px] border-l-gray-300'
                    } ${selectedSubStage === subStage.id ? 'bg-primary/5 ring-1 ring-primary/40' : 'bg-background'} p-1.5 rounded-sm mb-1 transition-all duration-200 cursor-pointer hover:bg-muted/30`}
                    onClick={(e) => {
                      // Prevent event bubbling for buttons inside the row
                      if ((e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      handleProcessIdClick(subStage.processId);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {String(subStage.sequence).padStart(2, '0')}
                          </span>
                          <h3 className="font-medium text-sm">{subStage.name}</h3>
                          
                          <div className="flex items-center gap-1 ml-1">
                            {subStage.status === 'completed' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : subStage.status === 'in-progress' ? (
                              <CircleDot className="h-3 w-3 text-blue-500" />
                            ) : subStage.status === 'failed' ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-gray-500" />
                            )}
                            
                            <Button 
                              variant="ghost" 
                              className={`p-0 h-auto font-mono text-xs ${selectedSubStage === subStage.id ? 'font-bold text-primary' : ''}`}
                              onClick={() => handleProcessIdClick(subStage.processId)}
                            >
                              {subStage.processId}
                            </Button>
                            
                            {subStage.type === 'auto' ? (
                              <Bot className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <UserCircle className="h-3 w-3 text-muted-foreground" />
                            )}
                            
                            {/* Process-level actions - Context-aware based on status */}
                            <div className="flex items-center gap-1 ml-1">
                              
                              {/* Files button - Always visible */}
                              {subStage.files && subStage.files.length > 0 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-1.5 hover:bg-muted flex items-center gap-1"
                                  onClick={(e) => {
                                    // Ensure event doesn't bubble up to parent elements
                                    e.stopPropagation();
                                    e.preventDefault();
                                    
                                    // Call the file click handler
                                    handleFileClick(subStage.files[0], subStage.id);
                                  }}
                                  title={`View Files (${subStage.files.length})`}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span className="text-xs">Files</span>
                                </Button>
                              )}
                              
                              {/* Process Approval Dialog - Only for in-progress processes requiring approval */}
                              {subStage.status === 'in-progress' && subStage.apiData && (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <ProcessApprovalDialog
                                    workflowProcessId={subStage.apiData.workflowProcessId || subStage.processId}
                                    processName={subStage.name}
                                    status={subStage.status}
                                    approval={subStage.apiData.approval || 'N'}
                                    existingCommentary={subStage.apiData.userCommentary || ''}
                                    updatedBy="user"
                                    onActionComplete={(action, success) => handleActionComplete(action, success, subStage.processId)}
                                    trigger={
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-1.5 hover:bg-muted flex items-center gap-1"
                                        title="Approve or Reject Process"
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span className="text-xs">Approval</span>
                                      </Button>
                                    }
                                  />
                                </div>
                              )}
                              
                              {/* Workflow Action Buttons (Force Start / Re-run) */}
                              <WorkflowActionButtons
                                workflowProcessId={subStage.apiData?.workflowProcessId || subStage.processId}
                                status={subStage.status}
                                isLocked={subStage.meta?.lockedBy ? true : false}
                                updatedBy="user" // Could be enhanced to use actual user context
                                onActionComplete={handleActionComplete}
                                size="sm"
                                variant="ghost"
                                className="h-6"
                              />
                              
                              {/* Refresh button - For all statuses */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showInfoToast(`Refreshing ${subStage.name}`);
                                }}
                                title="Refresh"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                              
                              {/* Skip button - Only for not-started or in-progress processes */}
                              {(subStage.status === 'not-started' || subStage.status === 'in-progress') && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showWarningToast(`Skipped ${subStage.name}`);
                                  }}
                                  title="Skip"
                                >
                                  <SkipForward className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              
                              {/* Notification button - For all statuses */}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showInfoToast(`Notification sent for ${subStage.name}`);
                                }}
                                title="Send Notification"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="text-xs text-muted-foreground">
                              {subStage.progress}%
                            </span>
                            <Progress 
                              value={subStage.progress} 
                              className="w-12 h-1.5"
                              {...(subStage.status === 'failed' && { 
                                className: "w-12 h-1.5 bg-destructive" 
                              })}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Start: {subStage.timing.start}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Duration: {subStage.timing.duration}</span>
                          </div>
                          {subStage.meta.updatedBy && (
                            <div className="flex items-center gap-1">
                              <UserCircle className="h-3 w-3" />
                              <span>By: {subStage.meta.updatedBy}</span>
                            </div>
                          )}
                          
                          {/* Dependencies - Compact with clickable names */}
                          {subStage.dependencies && subStage.dependencies.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Network className="h-3 w-3" />
                              <span>Deps: </span>
                              <div className="flex flex-wrap gap-1">
                                {subStage.dependencies.map((dep, depIndex) => (
                                  <Button
                                    key={dep.id}
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs underline hover:text-primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDependencyClick(dep.id);
                                    }}
                                    title={`Navigate to dependency: ${dep.name}`}
                                  >
                                    {dep.name}
                                    {depIndex < subStage.dependencies.length - 1 && ','}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Messages - Compact with truncation for long messages */}
                        {subStage.messages && subStage.messages.length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {subStage.messages[0].length > 60 
                              ? `${subStage.messages[0].substring(0, 60)}...` 
                              : subStage.messages[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    <CollapsibleTrigger className="w-full text-left mt-1">
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                        <ChevronDown className="h-3 w-3" />
                        Details
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-2 space-y-2 pt-2 border-t border-muted">
                      {/* Files section removed from sub-stage process cards */}

                      {/* Performance Metrics - Compact */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Avg Duration</div>
                          <div>{subStage.timing.avgDuration}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Start</div>
                          <div>{subStage.timing.avgStart}</div>
                        </div>
                      </div>

                      {/* Support Options - Compact */}
                      <div>
                        <CreateSupportIssue 
                          processId={subStage.processId}
                          processName={subStage.name}
                          application={hierarchyPath[0]?.name || ""}
                          buttonVariant="outline"
                          buttonSize="sm"
                          buttonClassName="h-6 text-xs"
                        />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ));
            })()}
          </div>
        </div>

        {/* File Preview Panel - Enhanced or Legacy */}
        {showFilePreview && (
          <div className="flex-1 flex flex-col relative">
            {filePreviewMode === 'enhanced' && currentSubStageFiles.length > 0 && (
              <EnhancedWorkflowFilePreview
                files={currentSubStageFiles}
                processName={selectedSubStage ? 
                  (stageSpecificSubStages.find(s => s.id === selectedSubStage)?.name || 'Unknown Process') : 
                  'Process Files'
                }
                processId={selectedSubStage || activeStage}
                onFileUpload={(file) => {
                  // TODO: Implement file upload
                }}
                onFileDownload={(file) => {
                  // TODO: Implement file download
                }}
                onClose={handleCloseFilePreview}
                showLeftPanel={filePreviewLeftPanel}
                showRightPanel={filePreviewRightPanel}
                onToggleLeftPanel={toggleFilePreviewLeftPanel}
                onToggleRightPanel={toggleFilePreviewRightPanel}
                isFullscreen={filePreviewFullscreen}
                onToggleFullscreen={toggleFilePreviewFullscreen}
              />
            )}
            
            {filePreviewMode === 'legacy' && currentSubStageFiles.length > 0 && (
              <AdvancedFilePreview 
                fileId={currentSubStageFiles[0].id}
                fileName={currentSubStageFiles[0].name}
                onClose={handleCloseFilePreview}
              />
            )}
          </div>
        )}
        
        {/* Right Panel - 40% width or 30% when file preview is shown */}
        <div className={`bg-background border-l transition-all duration-200 ${
          (!showWorkflowDetail && showFilePreview) || (filePreviewMode === 'enhanced') ? 'hidden' : 
          rightPanelContent ? (showFilePreview ? 'flex-[0.3]' : 'flex-[0.4]') : 'w-[200px]'
        }`}>
          {/* Sticky Header and Menu */}
          <div className="sticky top-0 bg-background border-b z-10">
            <div className="p-1">
              {/* Simplified menu - only show Config and Overview by default */}
              <div className="flex flex-wrap gap-1 items-center">
                {/* Show navigation options when not in preview mode or when workflow detail is explicitly shown */}
                {(!showFilePreview || showWorkflowDetail) && (
                  <>
                    {/* Stage-level navigation */}
                    <Button 
                      variant={rightPanelContent === 'stage-overview' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setRightPanelContent('stage-overview')}
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      Stage Overview
                    </Button>
                    
                    <Button 
                      variant={rightPanelContent === 'diagram' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setRightPanelContent('diagram')}
                    >
                      <GitBranch className="h-3 w-3 mr-1" />
                      Step Function View
                    </Button>
                    
                    <Button 
                      variant={rightPanelContent === 'app-parameters' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setRightPanelContent('app-parameters')}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      App Config
                    </Button>
                    
                    <Button 
                      variant={rightPanelContent === 'global-parameters' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setRightPanelContent('global-parameters')}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Global Config
                    </Button>
                    
                    {/* Show process-level navigation only when a process is selected */}
                    {selectedSubStage && (
                      <>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        
                        <Button 
                          variant={rightPanelContent === 'process-overview' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setRightPanelContent('process-overview')}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Process Overview
                        </Button>
                        
                        <Button 
                          variant={rightPanelContent === 'parameters' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setRightPanelContent('parameters')}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Process Config
                        </Button>
                        
                        <Button 
                          variant={rightPanelContent === 'documents' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            // Prevent event bubbling
                            e.stopPropagation();
                            
                            // Only navigate to documents section, never auto-preview
                            setRightPanelContent('documents');
                            
                            // Set current sub-stage files without auto-previewing
                            const subStage = (stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages)
                              .find(s => s.id === selectedSubStage);
                            
                            if (subStage && subStage.files && subStage.files.length > 0) {
                              // Set current sub-stage files
                              setCurrentSubStageFiles(subStage.files.map((file, index) => ({
                                id: `file-${subStage.id}-${index}`,
                                name: file.name,
                                type: file.name.split('.').pop() || '',
                                size: file.size,
                                category: file.type
                              })));
                              
                              // Explicitly ensure file preview is closed
                              setShowFilePreview(false);
                              setSelectedFile(null);
                            }
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Files
                        </Button>
                        
                        <Button 
                          variant={rightPanelContent === 'dependencies' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setRightPanelContent('dependencies')}
                        >
                          <Network className="h-3 w-3 mr-1" />
                          Dependencies
                        </Button>
                        
                        <Button 
                          variant={rightPanelContent === 'queries' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setRightPanelContent('queries')}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Queries
                        </Button>
                      </>
                    )}
                  </>
                )}
                {/* When in preview mode and workflow detail is hidden, show a message */}
                {showFilePreview && !showWorkflowDetail && (
                  <div className="w-full text-center text-xs text-muted-foreground py-1">
                    Navigation hidden in preview mode
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Content */}
          {rightPanelContent && (
            <div className="flex-1 overflow-y-auto p-3 bg-background">
              {renderRightPanelContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetailView;