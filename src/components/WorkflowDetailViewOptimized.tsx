import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
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
  Timer
} from 'lucide-react';
import { getFileIcon } from './DocumentsList';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SubStagesList from './SubStagesList';
import DocumentsList from './DocumentsList';
import DependencyTreeMap from './DependencyTreeMap';
import RoleAssignments from './RoleAssignments';
import ActivityLog from './ActivityLog';
import WorkflowHierarchyBreadcrumb, { HierarchyNode } from './WorkflowHierarchyBreadcrumb';
import { Progress } from '@/components/ui/progress';
import { SubStage, StageStatus, Dependency } from '@/types/workflow';
import { getStageData, getStageTasksById, getStageDocumentsById, getStageMetricsById } from '@/data/stageSpecificData';
import { workflowService } from '@/services/workflowService';

// Lazy load heavy components to reduce initial bundle size
const ModernWorkflowView = lazy(() => import('./workflow/ModernWorkflowView'));
const StepFunctionView = lazy(() => import('./workflow/StepFunctionView'));

// Loading component for lazy-loaded views
const ViewLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center gap-2">
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span>Loading view...</span>
    </div>
  </div>
);

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
  // Enhanced workflow data for Modern and Step Function views
  enhancedWorkflowData?: any;
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

// Safe property access utility
const safeGet = (obj: any, path: string, defaultValue: any = null) => {
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  } catch {
    return defaultValue;
  }
};

// Safe toString utility
const safeToString = (value: any, defaultValue: string = ''): string => {
  try {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value.toString === 'function') return value.toString();
    return String(value);
  } catch {
    return defaultValue;
  }
};

// Memory-optimized status variant function
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

const WorkflowDetailViewOptimized: React.FC<WorkflowDetailViewProps> = ({
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
  enhancedWorkflowData
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
          enhancedWorkflowData={enhancedWorkflowData}
        />;
      }}
    </SafeRouter>
  );
};

const WorkflowDetailViewContent: React.FC<WorkflowDetailViewProps & { router: any }> = ({
  router,
  workflowTitle,
  progressSteps = [],
  stages = [],
  tasks = {},
  viewMode = 'classic',
  onViewToggle,
  summaryData,
  applicationData,
  nodeData,
  onBack,
  enhancedWorkflowData
}) => {
  const { selectedDate } = useDate();
  const [activeStage, setActiveStage] = useState<string>(() => safeGet(stages, '0.id', ''));
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

  // Build hierarchy path from progressSteps with safe access
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

  // UI state preservation during refresh
  const [preservedState, setPreservedState] = useState<{
    activeTab: string;
    selectedSubStage: string | null;
    rightPanelContent: string;
    showFilePreview: boolean;
    scrollPosition: number;
  }>({
    activeTab: 'overview',
    selectedSubStage: null,
    rightPanelContent: 'stage-overview',
    showFilePreview: false,
    scrollPosition: 0
  });

  // Memoized calculations to prevent unnecessary re-renders
  const memoizedTaskCounts = useMemo(() => {
    try {
      let completed = 0;
      let failed = 0;
      let rejected = 0;
      let pending = 0;
      let processing = 0;
      
      // First priority: Use processData from workflow summary if available
      const processData = safeGet(summaryData, 'processData', []);
      if (Array.isArray(processData) && processData.length > 0) {
        processData.forEach((process: any) => {
          const status = safeToString(safeGet(process, 'status', ''), '').toLowerCase();
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
          const status = safeGet(subStage, 'status', '');
          if (status === 'completed') completed++;
          else if (status === 'failed') failed++;
          else if (status === 'rejected') rejected++;
          else if (status === 'in-progress') processing++;
          else pending++;
        });
        
        return { completed, failed, rejected, pending, processing };
      }
      
      // Fallback: Use tasks
      Object.values(tasks || {}).forEach(stageTasks => {
        if (Array.isArray(stageTasks)) {
          stageTasks.forEach(task => {
            const status = safeGet(task, 'status', '');
            if (status === 'completed') completed++;
            else if (status === 'failed') failed++;
            else if (status === 'rejected') rejected++;
            else if (status === 'in_progress' || status === 'in-progress') processing++;
            else pending++;
          });
        }
      });
      
      return { completed, failed, rejected, pending, processing };
    } catch (error) {
      console.warn('Error calculating task counts:', error);
      return { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 };
    }
  }, [summaryData, stageSpecificSubStages, tasks]);

  const memoizedOverallProgress = useMemo(() => {
    try {
      // First priority: Use hierarchy path progress if available
      if (Array.isArray(hierarchyPath) && hierarchyPath.length > 0) {
        const lastNode = hierarchyPath[hierarchyPath.length - 1];
        const progress = safeGet(lastNode, 'progress', null);
        if (typeof progress === 'number') {
          return Math.round(progress);
        }
      }
      
      // Second priority: Calculate from processData if available
      const processData = safeGet(summaryData, 'processData', []);
      if (Array.isArray(processData) && processData.length > 0) {
        const totalProcesses = processData.length;
        const completedProcesses = processData.filter((p: any) => {
          const status = safeToString(safeGet(p, 'status', ''), '').toLowerCase();
          return status === 'completed';
        }).length;
        
        return totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0;
      }
      
      // Third priority: Calculate from stage-specific sub-stages
      if (stageSpecificSubStages.length > 0) {
        const totalSubStages = stageSpecificSubStages.length;
        const completedSubStages = stageSpecificSubStages.filter(subStage => 
          safeGet(subStage, 'status', '') === 'completed'
        ).length;
        
        return totalSubStages > 0 ? Math.round((completedSubStages / totalSubStages) * 100) : 0;
      }
      
      // Fallback: Calculate from tasks
      let totalTasks = 0;
      let completedTasks = 0;
      
      Object.values(tasks || {}).forEach(stageTasks => {
        if (Array.isArray(stageTasks)) {
          totalTasks += stageTasks.length;
          completedTasks += stageTasks.filter(task => safeGet(task, 'status', '') === 'completed').length;
        }
      });
      
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    } catch (error) {
      console.warn('Error calculating overall progress:', error);
      return 0;
    }
  }, [hierarchyPath, summaryData, stageSpecificSubStages, tasks]);

  // Memoized workflow data for Modern and Step Function views
  const memoizedWorkflowData = useMemo(() => {
    try {
      const lastHierarchyNode = Array.isArray(hierarchyPath) && hierarchyPath.length > 0 
        ? hierarchyPath[hierarchyPath.length - 1] 
        : null;
      
      return {
        id: safeGet(lastHierarchyNode, 'id', 'workflow-1'),
        title: safeToString(workflowTitle, 'Unknown Workflow'),
        progressSteps: Array.isArray(progressSteps) ? progressSteps : [],
        stages: Array.isArray(stages) ? stages : [],
        tasks: tasks || {},
        summaryData,
        applicationData,
        nodeData,
        taskCounts: memoizedTaskCounts,
        progress: memoizedOverallProgress,
        allFiles: safeGet(summaryData, 'fileData', []),
        allDependencies: safeGet(summaryData, 'dependencyData', []),
        dailyParams: safeGet(summaryData, 'dailyParams', []),
        appParams: safeGet(summaryData, 'appParams', []),
        processParams: safeGet(summaryData, 'processParams', [])
      };
    } catch (error) {
      console.warn('Error creating workflow data:', error);
      return {
        id: 'workflow-1',
        title: 'Unknown Workflow',
        progressSteps: [],
        stages: [],
        tasks: {},
        summaryData: null,
        applicationData: null,
        nodeData: null,
        taskCounts: { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 },
        progress: 0,
        allFiles: [],
        allDependencies: [],
        dailyParams: [],
        appParams: [],
        processParams: []
      };
    }
  }, [hierarchyPath, workflowTitle, progressSteps, stages, tasks, summaryData, applicationData, nodeData, memoizedTaskCounts, memoizedOverallProgress]);

  // Initialize hierarchy path from progressSteps with safe access
  useEffect(() => {
    try {
      if (Array.isArray(progressSteps) && progressSteps.length > 0) {
        const path = progressSteps.map((step, index) => {
          // Determine the level based on the index
          let level = 'hierarchy';
          if (index === 0) level = 'app';
          else if (index === 1) level = 'workflow';
          
          // Generate an ID based on the name (for navigation purposes)
          const stepName = safeToString(safeGet(step, 'name', ''), `step-${index}`);
          const id = stepName.toLowerCase().replace(/\s+/g, '-');
          
          return {
            id: index === 0 ? `app-${id}` : id,
            name: stepName,
            progress: safeGet(step, 'progress', 0),
            level: level,
            onClick: (node: HierarchyNode) => handleBreadcrumbNavigation(node, index)
          };
        });
        
        setHierarchyPath(path);
      }
    } catch (error) {
      console.warn('Error initializing hierarchy path:', error);
      setHierarchyPath([]);
    }
  }, [progressSteps]);

  // Enhanced breadcrumb navigation with proper error handling
  const handleBreadcrumbNavigation = useCallback((node: HierarchyNode, index: number) => {
    try {
      if (!node || !safeGet(node, 'level', null)) {
        return;
      }
      
      const nodeLevel = safeGet(node, 'level', '');
      if (nodeLevel === 'app') {
        // Navigate to application cards view (App Level)
        router?.push('/');
      } else if (index < hierarchyPath.length - 1) {
        // Navigate to corresponding detail view
        const appNode = hierarchyPath.find(n => safeGet(n, 'level', '') === 'app');
        if (appNode) {
          const appId = safeGet(appNode, 'id', '');
          const nodeId = safeGet(node, 'id', '');
          if (index === 1) {
            // Level 1 navigation (Advisory)
            router?.push(`/hierarchy/${appId}`);
          } else {
            // Level 2+ navigation (Advisory EMA)
            router?.push(`/workflow/${nodeId}`);
          }
        }
      }
    } catch (error) {
      console.warn('Navigation failed:', error);
      showErrorToast('Navigation failed. Please try again.');
    }
  }, [hierarchyPath, router]);

  // Preserve UI state before refresh
  const preserveUIState = useCallback(() => {
    try {
      setPreservedState({
        activeTab,
        selectedSubStage,
        rightPanelContent,
        showFilePreview,
        scrollPosition: window?.scrollY || 0
      });
    } catch (error) {
      console.warn('Error preserving UI state:', error);
    }
  }, [activeTab, selectedSubStage, rightPanelContent, showFilePreview]);

  // Restore UI state after refresh
  const restoreUIState = useCallback(() => {
    try {
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
      // Restore scroll position
      setTimeout(() => {
        if (window && typeof window.scrollTo === 'function') {
          window.scrollTo(0, preservedState.scrollPosition);
        }
      }, 100);
    } catch (error) {
      console.warn('Error restoring UI state:', error);
    }
  }, [preservedState, activeTab, selectedSubStage, rightPanelContent, showFilePreview]);

  // Enhanced refresh with data fetching and error handling
  const handleRefresh = useCallback(async (isManualRefresh: boolean = false) => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    preserveUIState();
    
    try {
      // Get current workflow summary data safely
      const currentSummaryData = (window as any)?.currentWorkflowSummary;
      const applications = safeGet(currentSummaryData, 'applications', []);
      
      if (Array.isArray(applications) && applications.length > 0) {
        const currentApp = applications[0];
        const appId = safeGet(currentApp, 'appId', null);
        
        if (appId) {
          const dateString = selectedDate ? selectedDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/,/g, '') : new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/,/g, '');
          
          // Fetch fresh workflow summary
          const response = await workflowService.getWorkflowSummary({
            date: dateString,
            configId: safeToString(appId, ''),
            appId: appId
          });
          
          if (safeGet(response, 'success', false)) {
            // Update global workflow summary
            (window as any).currentWorkflowSummary = safeGet(response, 'data', null);
            
            // Update last refreshed time
            setLastRefreshed(new Date());
            setCountdown(refreshInterval);
            
            // Restore UI state after a brief delay to allow data to update
            setTimeout(() => {
              restoreUIState();
            }, 200);
            
            // Only show success message for manual refreshes
            if (isManualRefresh) {
              showSuccessToast("Workflow data refreshed successfully");
            }
          } else {
            const errorMessage = safeToString(safeGet(response, 'error', ''), 'Unknown error');
            showErrorToast(`Failed to refresh data: ${errorMessage}`);
          }
        }
      } else {
        // Fallback refresh without API call
        setLastRefreshed(new Date());
        setCountdown(refreshInterval);
        
        // Only show success message for manual refreshes
        if (isManualRefresh) {
          showSuccessToast("Workflow data refreshed successfully");
        }
      }
    } catch (error: any) {
      const errorMessage = safeToString(safeGet(error, 'message', ''), 'Unknown error occurred');
      showErrorToast(`Refresh failed: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, preserveUIState, restoreUIState, selectedDate, refreshInterval]);

  // Toggle workflow lock state
  const toggleLock = useCallback(() => {
    try {
      const newLockState = !isLocked;
      setIsLocked(newLockState);
      if (newLockState) {
        showInfoToast("Workflow locked");
      } else {
        showWarningToast("Workflow unlocked - changes can now be made");
      }
    } catch (error) {
      console.warn('Error toggling lock:', error);
    }
  }, [isLocked]);

  // Auto-refresh setup with user activity detection
  useEffect(() => {
    try {
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
    } catch (error) {
      console.warn('Error setting up auto-refresh:', error);
    }
  }, [autoRefreshEnabled, refreshInterval, handleRefresh, isUserActive]);

  // Countdown timer for auto-refresh
  useEffect(() => {
    try {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return refreshInterval;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } catch (error) {
      console.warn('Error setting up countdown timer:', error);
    }
  }, [refreshInterval]);

  const handleStageClick = useCallback((stageId: string) => {
    try {
      setActiveStage(safeToString(stageId, ''));
    } catch (error) {
      console.warn('Error handling stage click:', error);
    }
  }, []);

  const toggleSection = useCallback((section: string) => {
    try {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    } catch (error) {
      console.warn('Error toggling section:', error);
    }
  }, []);

  // Safe access to active stage data
  const activeStageTasks = useMemo(() => {
    try {
      return Array.isArray(tasks[activeStage]) ? tasks[activeStage] : [];
    } catch (error) {
      console.warn('Error getting active stage tasks:', error);
      return [];
    }
  }, [tasks, activeStage]);

  const activeStageInfo = useMemo(() => {
    try {
      return Array.isArray(stages) ? stages.find(stage => safeGet(stage, 'id', '') === activeStage) : null;
    } catch (error) {
      console.warn('Error getting active stage info:', error);
      return null;
    }
  }, [stages, activeStage]);

  // Handle view toggle with memory optimization
  const handleViewToggle = useCallback((newViewMode: 'classic' | 'modern' | 'step-function') => {
    try {
      if (onViewToggle && typeof onViewToggle === 'function') {
        onViewToggle(newViewMode as any);
      }
    } catch (error) {
      console.warn('Error toggling view:', error);
    }
  }, [onViewToggle]);

  // Render different views based on viewMode - ONLY render the active view
  if (viewMode === 'modern') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <ModernWorkflowView
          workflow={memoizedWorkflowData}
          onBack={onBack}
          onViewToggle={() => handleViewToggle('classic')}
        />
      </Suspense>
    );
  }

  if (viewMode === 'step-function') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <StepFunctionView
          workflow={memoizedWorkflowData}
          onBack={onBack || (() => handleViewToggle('classic'))}
        />
      </Suspense>
    );
  }

  // Default Classic view - Simplified and memory-optimized
  return (
    <div className="space-y-2">
      {/* Unified Workflow Header Card with Auto-Refresh Controls */}
      <WorkflowUnifiedHeader
        workflowId={safeGet(hierarchyPath[hierarchyPath.length-1], 'id', '')}
        workflowTitle={safeToString(workflowTitle, 'Unknown Workflow')}
        hierarchyPath={hierarchyPath}
        progress={memoizedOverallProgress}
        status="Active"
        isLocked={isLocked}
        onToggleLock={toggleLock}
        onRefresh={() => handleRefresh(true)}
        taskCounts={memoizedTaskCounts}
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

      {/* Modified to include completion percentage with safe calculations */}
      <WorkflowStagesBar 
        stages={Array.isArray(stages) ? stages.map(stage => {
          try {
            // Get tasks for this stage safely
            const stageId = safeGet(stage, 'id', '');
            const stageTasks = Array.isArray(tasks[stageId]) ? tasks[stageId] : [];
            
            // Calculate completion percentage safely
            let completionPercentage = 0;
            if (stageTasks.length > 0) {
              const completedTasks = stageTasks.filter(task => safeGet(task, 'status', '') === 'completed').length;
              completionPercentage = Math.round((completedTasks / stageTasks.length) * 100);
            }
            
            return {
              ...stage,
              completionPercentage
            };
          } catch (error) {
            console.warn('Error processing stage:', error);
            return {
              ...stage,
              completionPercentage: 0
            };
          }
        }) : []} 
        activeStage={activeStage} 
        onStageClick={handleStageClick} 
      />

      {/* Simplified main content area */}
      <div className="flex gap-4">
        {/* Main Content - Simplified process list */}
        <div className="flex-[0.6]">
          <div className="space-y-4">
            {activeStageTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">No tasks found for this stage</div>
                <div className="text-xs mt-1">
                  Active Stage: {activeStage} | Tasks Available: {activeStageTasks.length}
                </div>
              </div>
            ) : (
              activeStageTasks.map((task, index) => {
                try {
                  const taskId = safeGet(task, 'id', `task-${index}`);
                  const taskName = safeToString(safeGet(task, 'name', ''), 'Unknown Task');
                  const taskStatus = safeGet(task, 'status', 'not-started');
                  const processId = safeToString(safeGet(task, 'processId', ''), `PROC-${index}`);
                  
                  return (
                    <div 
                      key={taskId}
                      className={`${
                        taskStatus === 'completed' ? 'border-l-[3px] border-l-green-500' :
                        taskStatus === 'in-progress' ? 'border-l-[3px] border-l-blue-500' :
                        taskStatus === 'failed' ? 'border-l-[3px] border-l-red-500' :
                        'border-l-[3px] border-l-gray-300'
                      } bg-background p-1.5 rounded-sm mb-1 transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-medium text-sm">{taskName}</h3>
                            
                            <div className="flex items-center gap-1 ml-1">
                              {taskStatus === 'completed' ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : taskStatus === 'in-progress' ? (
                                <CircleDot className="h-3 w-3 text-blue-500" />
                              ) : taskStatus === 'failed' ? (
                                <XCircle className="h-3 w-3 text-red-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-gray-500" />
                              )}
                              
                              <span className="font-mono text-xs">{processId}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Duration: {safeToString(safeGet(task, 'duration', ''), '0')}m</span>
                            </div>
                            {safeGet(task, 'updatedBy', null) && (
                              <div className="flex items-center gap-1">
                                <UserCircle className="h-3 w-3" />
                                <span>By: {safeToString(safeGet(task, 'updatedBy', ''), 'Unknown')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.warn('Error rendering task:', error);
                  return (
                    <div key={`error-${index}`} className="p-2 border border-red-200 rounded text-red-600 text-sm">
                      Error rendering task {index + 1}
                    </div>
                  );
                }
              })
            )}
          </div>
        </div>

        {/* Right Panel - Simplified */}
        <div className="flex-[0.4] bg-background border-l">
          <div className="p-3">
            <h3 className="text-lg font-medium mb-4">
              {activeStageInfo ? safeToString(safeGet(activeStageInfo, 'name', ''), 'Unknown Stage') : 'Stage Overview'}
            </h3>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Tasks: </span>
                <span className="font-medium">{activeStageTasks.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Progress: </span>
                <span className="font-medium">{memoizedOverallProgress}%</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetailViewOptimized;