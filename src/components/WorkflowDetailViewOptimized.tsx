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

  // Memoized calculations to prevent unnecessary re-renders - WITH COMPREHENSIVE LOGGING
  const memoizedTaskCounts = useMemo(() => {
    console.log('📊 [TASK COUNTS DEBUG] Starting task counts calculation');
    
    try {
      let completed = 0;
      let failed = 0;
      let rejected = 0;
      let pending = 0;
      let processing = 0;
      
      console.log('📊 [TASK COUNTS DEBUG] Input data:', {
        summaryDataExists: !!summaryData,
        summaryDataType: typeof summaryData,
        stageSpecificSubStagesLength: stageSpecificSubStages.length,
        tasksKeys: Object.keys(tasks || {})
      });
      
      // First priority: Use processData from workflow summary if available
      const processData = safeGet(summaryData, 'processData', []);
      console.log('📊 [TASK COUNTS DEBUG] ProcessData:', {
        isArray: Array.isArray(processData),
        length: processData?.length || 0,
        type: typeof processData
      });
      
      if (Array.isArray(processData) && processData.length > 0) {
        console.log('📊 [TASK COUNTS DEBUG] Processing processData array');
        
        processData.forEach((process: any, index: number) => {
          try {
            console.log(`📊 [TASK COUNTS DEBUG] Processing process ${index}:`, {
              processExists: !!process,
              processType: typeof process,
              processKeys: process ? Object.keys(process) : []
            });
            
            const rawStatus = safeGet(process, 'status', '');
            console.log(`📊 [TASK COUNTS DEBUG] Process ${index} raw status:`, {
              rawStatus,
              rawStatusType: typeof rawStatus
            });
            
            const status = safeToString(rawStatus, '').toLowerCase();
            console.log(`📊 [TASK COUNTS DEBUG] Process ${index} converted status:`, status);
            
            if (status === 'completed') completed++;
            else if (status === 'failed') failed++;
            else if (status === 'rejected') rejected++;
            else if (status === 'in_progress' || status === 'in-progress' || status === 'running') processing++;
            else pending++;
            
          } catch (processError) {
            console.error(`❌ [TASK COUNTS DEBUG] Error processing process ${index}:`, processError);
          }
        });
        
        const result = { completed, failed, rejected, pending, processing };
        console.log('✅ [TASK COUNTS DEBUG] ProcessData result:', result);
        return result;
      }
      
      // Second priority: Use stage-specific sub-stages
      if (stageSpecificSubStages.length > 0) {
        console.log('📊 [TASK COUNTS DEBUG] Processing stageSpecificSubStages');
        
        stageSpecificSubStages.forEach((subStage, index) => {
          try {
            console.log(`📊 [TASK COUNTS DEBUG] Processing substage ${index}:`, {
              subStageExists: !!subStage,
              subStageType: typeof subStage,
              subStageKeys: subStage ? Object.keys(subStage) : []
            });
            
            const status = safeGet(subStage, 'status', '');
            console.log(`📊 [TASK COUNTS DEBUG] Substage ${index} status:`, status);
            
            if (status === 'completed') completed++;
            else if (status === 'failed') failed++;
            else if (status === 'rejected') rejected++;
            else if (status === 'in-progress') processing++;
            else pending++;
            
          } catch (subStageError) {
            console.error(`❌ [TASK COUNTS DEBUG] Error processing substage ${index}:`, subStageError);
          }
        });
        
        const result = { completed, failed, rejected, pending, processing };
        console.log('✅ [TASK COUNTS DEBUG] StageSpecificSubStages result:', result);
        return result;
      }
      
      // Fallback: Use tasks
      console.log('📊 [TASK COUNTS DEBUG] Processing tasks fallback');
      
      Object.entries(tasks || {}).forEach(([stageId, stageTasks]) => {
        try {
          console.log(`📊 [TASK COUNTS DEBUG] Processing stage ${stageId}:`, {
            stageTasksIsArray: Array.isArray(stageTasks),
            stageTasksLength: stageTasks?.length || 0
          });
          
          if (Array.isArray(stageTasks)) {
            stageTasks.forEach((task, taskIndex) => {
              try {
                console.log(`📊 [TASK COUNTS DEBUG] Processing task ${stageId}-${taskIndex}:`, {
                  taskExists: !!task,
                  taskType: typeof task,
                  taskKeys: task ? Object.keys(task) : []
                });
                
                const status = safeGet(task, 'status', '');
                console.log(`📊 [TASK COUNTS DEBUG] Task ${stageId}-${taskIndex} status:`, status);
                
                if (status === 'completed') completed++;
                else if (status === 'failed') failed++;
                else if (status === 'rejected') rejected++;
                else if (status === 'in_progress' || status === 'in-progress') processing++;
                else pending++;
                
              } catch (taskError) {
                console.error(`❌ [TASK COUNTS DEBUG] Error processing task ${stageId}-${taskIndex}:`, taskError);
              }
            });
          }
        } catch (stageError) {
          console.error(`❌ [TASK COUNTS DEBUG] Error processing stage ${stageId}:`, stageError);
        }
      });
      
      const result = { completed, failed, rejected, pending, processing };
      console.log('✅ [TASK COUNTS DEBUG] Tasks fallback result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ [TASK COUNTS DEBUG] Error calculating task counts:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
      
      // Enhanced error logging for toString issues
      if (error?.message?.includes('toString')) {
        console.error('🔍 [TASK COUNTS DEBUG] toString error detected:', {
          errorMessage: error.message,
          summaryData,
          stageSpecificSubStages,
          tasks
        });
      }
      
      return { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 };
    }
  }, [summaryData, stageSpecificSubStages, tasks]);

  const memoizedOverallProgress = useMemo(() => {
    console.log('📈 [PROGRESS DEBUG] Starting overall progress calculation');
    
    try {
      console.log('📈 [PROGRESS DEBUG] Input data:', {
        hierarchyPathLength: hierarchyPath?.length || 0,
        summaryDataExists: !!summaryData,
        stageSpecificSubStagesLength: stageSpecificSubStages.length,
        tasksKeys: Object.keys(tasks || {})
      });
      
      // First priority: Use hierarchy path progress if available
      if (Array.isArray(hierarchyPath) && hierarchyPath.length > 0) {
        console.log('📈 [PROGRESS DEBUG] Processing hierarchy path');
        
        const lastNode = hierarchyPath[hierarchyPath.length - 1];
        console.log('📈 [PROGRESS DEBUG] Last node:', {
          lastNodeExists: !!lastNode,
          lastNodeType: typeof lastNode,
          lastNodeKeys: lastNode ? Object.keys(lastNode) : []
        });
        
        const progress = safeGet(lastNode, 'progress', null);
        console.log('📈 [PROGRESS DEBUG] Hierarchy progress:', {
          progress,
          progressType: typeof progress,
          isNumber: typeof progress === 'number'
        });
        
        if (typeof progress === 'number') {
          const result = Math.round(progress);
          console.log('✅ [PROGRESS DEBUG] Hierarchy path result:', result);
          return result;
        }
      }
      
      // Second priority: Calculate from processData if available
      const processData = safeGet(summaryData, 'processData', []);
      console.log('📈 [PROGRESS DEBUG] ProcessData:', {
        isArray: Array.isArray(processData),
        length: processData?.length || 0
      });
      
      if (Array.isArray(processData) && processData.length > 0) {
        console.log('📈 [PROGRESS DEBUG] Processing processData for progress');
        
        const totalProcesses = processData.length;
        let completedProcesses = 0;
        
        processData.forEach((p: any, index: number) => {
          try {
            console.log(`📈 [PROGRESS DEBUG] Processing process ${index} for completion:`, {
              processExists: !!p,
              processType: typeof p
            });
            
            const rawStatus = safeGet(p, 'status', '');
            console.log(`📈 [PROGRESS DEBUG] Process ${index} raw status:`, {
              rawStatus,
              rawStatusType: typeof rawStatus
            });
            
            const status = safeToString(rawStatus, '').toLowerCase();
            console.log(`📈 [PROGRESS DEBUG] Process ${index} converted status:`, status);
            
            if (status === 'completed') {
              completedProcesses++;
            }
          } catch (processError) {
            console.error(`❌ [PROGRESS DEBUG] Error processing process ${index}:`, processError);
          }
        });
        
        const result = totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0;
        console.log('✅ [PROGRESS DEBUG] ProcessData result:', {
          totalProcesses,
          completedProcesses,
          result
        });
        return result;
      }
      
      // Third priority: Calculate from stage-specific sub-stages
      if (stageSpecificSubStages.length > 0) {
        console.log('📈 [PROGRESS DEBUG] Processing stageSpecificSubStages for progress');
        
        const totalSubStages = stageSpecificSubStages.length;
        let completedSubStages = 0;
        
        stageSpecificSubStages.forEach((subStage, index) => {
          try {
            console.log(`📈 [PROGRESS DEBUG] Processing substage ${index} for completion:`, {
              subStageExists: !!subStage,
              subStageType: typeof subStage
            });
            
            const status = safeGet(subStage, 'status', '');
            console.log(`📈 [PROGRESS DEBUG] Substage ${index} status:`, status);
            
            if (status === 'completed') {
              completedSubStages++;
            }
          } catch (subStageError) {
            console.error(`❌ [PROGRESS DEBUG] Error processing substage ${index}:`, subStageError);
          }
        });
        
        const result = totalSubStages > 0 ? Math.round((completedSubStages / totalSubStages) * 100) : 0;
        console.log('✅ [PROGRESS DEBUG] StageSpecificSubStages result:', {
          totalSubStages,
          completedSubStages,
          result
        });
        return result;
      }
      
      // Fallback: Calculate from tasks
      console.log('📈 [PROGRESS DEBUG] Processing tasks fallback for progress');
      
      let totalTasks = 0;
      let completedTasks = 0;
      
      Object.entries(tasks || {}).forEach(([stageId, stageTasks]) => {
        try {
          console.log(`📈 [PROGRESS DEBUG] Processing stage ${stageId} for progress:`, {
            stageTasksIsArray: Array.isArray(stageTasks),
            stageTasksLength: stageTasks?.length || 0
          });
          
          if (Array.isArray(stageTasks)) {
            totalTasks += stageTasks.length;
            
            stageTasks.forEach((task, taskIndex) => {
              try {
                console.log(`📈 [PROGRESS DEBUG] Processing task ${stageId}-${taskIndex} for completion:`, {
                  taskExists: !!task,
                  taskType: typeof task
                });
                
                const status = safeGet(task, 'status', '');
                console.log(`📈 [PROGRESS DEBUG] Task ${stageId}-${taskIndex} status:`, status);
                
                if (status === 'completed') {
                  completedTasks++;
                }
              } catch (taskError) {
                console.error(`❌ [PROGRESS DEBUG] Error processing task ${stageId}-${taskIndex}:`, taskError);
              }
            });
          }
        } catch (stageError) {
          console.error(`❌ [PROGRESS DEBUG] Error processing stage ${stageId}:`, stageError);
        }
      });
      
      const result = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      console.log('✅ [PROGRESS DEBUG] Tasks fallback result:', {
        totalTasks,
        completedTasks,
        result
      });
      return result;
      
    } catch (error) {
      console.error('❌ [PROGRESS DEBUG] Error calculating overall progress:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
      
      // Enhanced error logging for toString issues
      if (error?.message?.includes('toString')) {
        console.error('🔍 [PROGRESS DEBUG] toString error detected:', {
          errorMessage: error.message,
          hierarchyPath,
          summaryData,
          stageSpecificSubStages,
          tasks
        });
      }
      
      return 0;
    }
  }, [hierarchyPath, summaryData, stageSpecificSubStages, tasks]);

  // Memoized workflow data for Modern and Step Function views - WITH COMPREHENSIVE LOGGING
  const memoizedWorkflowData = useMemo(() => {
    console.log('🔧 [WORKFLOW DATA DEBUG] Starting workflow data creation');
    
    try {
      console.log('🔧 [WORKFLOW DATA DEBUG] Input parameters:', {
        hierarchyPathLength: hierarchyPath?.length || 0,
        workflowTitleType: typeof workflowTitle,
        progressStepsIsArray: Array.isArray(progressSteps),
        stagesIsArray: Array.isArray(stages),
        tasksType: typeof tasks,
        summaryDataExists: !!summaryData,
        applicationDataExists: !!applicationData,
        nodeDataExists: !!nodeData,
        memoizedTaskCountsType: typeof memoizedTaskCounts,
        memoizedOverallProgressType: typeof memoizedOverallProgress
      });
      
      const lastHierarchyNode = Array.isArray(hierarchyPath) && hierarchyPath.length > 0 
        ? hierarchyPath[hierarchyPath.length - 1] 
        : null;
      
      console.log('🔧 [WORKFLOW DATA DEBUG] Last hierarchy node:', {
        lastHierarchyNodeExists: !!lastHierarchyNode,
        lastHierarchyNodeType: typeof lastHierarchyNode,
        lastHierarchyNodeKeys: lastHierarchyNode ? Object.keys(lastHierarchyNode) : []
      });
      
      // Safe extraction of workflow ID
      const workflowId = safeGet(lastHierarchyNode, 'id', 'workflow-1');
      console.log('🔧 [WORKFLOW DATA DEBUG] Workflow ID:', {
        workflowId,
        workflowIdType: typeof workflowId
      });
      
      // Safe conversion of workflow title
      const workflowTitleSafe = safeToString(workflowTitle, 'Unknown Workflow');
      console.log('🔧 [WORKFLOW DATA DEBUG] Workflow title:', {
        originalTitle: workflowTitle,
        safeTitle: workflowTitleSafe,
        safeTitleType: typeof workflowTitleSafe
      });
      
      // Safe extraction of summary data arrays
      const allFiles = safeGet(summaryData, 'fileData', []);
      const allDependencies = safeGet(summaryData, 'dependencyData', []);
      const dailyParams = safeGet(summaryData, 'dailyParams', []);
      const appParams = safeGet(summaryData, 'appParams', []);
      const processParams = safeGet(summaryData, 'processParams', []);
      
      console.log('🔧 [WORKFLOW DATA DEBUG] Summary data arrays:', {
        allFilesIsArray: Array.isArray(allFiles),
        allFilesLength: allFiles?.length || 0,
        allDependenciesIsArray: Array.isArray(allDependencies),
        allDependenciesLength: allDependencies?.length || 0,
        dailyParamsIsArray: Array.isArray(dailyParams),
        dailyParamsLength: dailyParams?.length || 0,
        appParamsIsArray: Array.isArray(appParams),
        appParamsLength: appParams?.length || 0,
        processParamsIsArray: Array.isArray(processParams),
        processParamsLength: processParams?.length || 0
      });
      
      const workflowData = {
        id: workflowId,
        title: workflowTitleSafe,
        progressSteps: Array.isArray(progressSteps) ? progressSteps : [],
        stages: Array.isArray(stages) ? stages : [],
        tasks: tasks || {},
        summaryData,
        applicationData,
        nodeData,
        taskCounts: memoizedTaskCounts,
        progress: memoizedOverallProgress,
        allFiles,
        allDependencies,
        dailyParams,
        appParams,
        processParams
      };
      
      console.log('✅ [WORKFLOW DATA DEBUG] Workflow data created successfully:', {
        id: workflowData.id,
        title: workflowData.title,
        progressStepsLength: workflowData.progressSteps.length,
        stagesLength: workflowData.stages.length,
        tasksKeys: Object.keys(workflowData.tasks),
        taskCounts: workflowData.taskCounts,
        progress: workflowData.progress,
        allFilesLength: workflowData.allFiles.length,
        allDependenciesLength: workflowData.allDependencies.length,
        dailyParamsLength: workflowData.dailyParams.length,
        appParamsLength: workflowData.appParams.length,
        processParamsLength: workflowData.processParams.length
      });
      
      return workflowData;
      
    } catch (error) {
      console.error('❌ [WORKFLOW DATA DEBUG] Error creating workflow data:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
      
      // Enhanced error logging for toString issues
      if (error?.message?.includes('toString')) {
        console.error('🔍 [WORKFLOW DATA DEBUG] toString error detected:', {
          errorMessage: error.message,
          hierarchyPath,
          workflowTitle,
          progressSteps,
          stages,
          tasks,
          summaryData,
          applicationData,
          nodeData,
          memoizedTaskCounts,
          memoizedOverallProgress
        });
      }
      
      const fallbackData = {
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
      
      console.log('⚠️ [WORKFLOW DATA DEBUG] Returning fallback data:', fallbackData);
      return fallbackData;
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

  // Enhanced refresh with data fetching and error handling - WITH COMPREHENSIVE LOGGING
  const handleRefresh = useCallback(async (isManualRefresh: boolean = false) => {
    console.log('🔄 [REFRESH DEBUG] Starting refresh process', {
      isManualRefresh,
      isRefreshing,
      timestamp: new Date().toISOString()
    });

    if (isRefreshing) {
      console.log('⚠️ [REFRESH DEBUG] Refresh already in progress, skipping');
      return; // Prevent multiple simultaneous refreshes
    }
    
    setIsRefreshing(true);
    preserveUIState();
    
    try {
      console.log('📊 [REFRESH DEBUG] Getting current workflow summary data');
      
      // Get current workflow summary data safely with detailed logging
      const currentSummaryData = (window as any)?.currentWorkflowSummary;
      console.log('📊 [REFRESH DEBUG] Current summary data type:', typeof currentSummaryData);
      console.log('📊 [REFRESH DEBUG] Current summary data exists:', !!currentSummaryData);
      
      if (currentSummaryData) {
        console.log('📊 [REFRESH DEBUG] Current summary data keys:', Object.keys(currentSummaryData));
      }
      
      // Try to extract configId and appId from current data or hierarchy path
      let configId: string | null = null;
      let appId: number | null = null;
      
      // First, try to get from applications array in current summary data
      const applications = safeGet(currentSummaryData, 'applications', []);
      console.log('📊 [REFRESH DEBUG] Applications array:', {
        isArray: Array.isArray(applications),
        length: applications?.length || 0,
        type: typeof applications
      });
      
      if (Array.isArray(applications) && applications.length > 0) {
        const currentApp = applications[0];
        console.log('📊 [REFRESH DEBUG] Current app data:', {
          exists: !!currentApp,
          type: typeof currentApp,
          keys: currentApp ? Object.keys(currentApp) : []
        });
        
        appId = safeGet(currentApp, 'appId', null);
        configId = safeToString(appId, ''); // Use appId as configId for now
        
        console.log('📊 [REFRESH DEBUG] Extracted from applications:', {
          appId,
          configId,
          appIdType: typeof appId,
          configIdType: typeof configId
        });
      }
      
      // If not found in applications, try to extract from hierarchy path or URL
      if (!appId || !configId) {
        console.log('📊 [REFRESH DEBUG] Trying to extract from hierarchy path');
        
        // Try to get from hierarchy path
        if (Array.isArray(hierarchyPath) && hierarchyPath.length > 0) {
          const lastNode = hierarchyPath[hierarchyPath.length - 1];
          console.log('📊 [REFRESH DEBUG] Last hierarchy node:', {
            exists: !!lastNode,
            type: typeof lastNode,
            keys: lastNode ? Object.keys(lastNode) : []
          });
          
          if (lastNode) {
            const nodeId = safeGet(lastNode, 'id', '');
            console.log('📊 [REFRESH DEBUG] Node ID from hierarchy:', nodeId);
            
            // Try to parse appId from node ID (assuming format like "app-17" or just "17")
            const idMatch = nodeId.match(/(\d+)$/);
            if (idMatch) {
              appId = parseInt(idMatch[1], 10);
              configId = safeToString(appId, '');
              console.log('📊 [REFRESH DEBUG] Extracted from hierarchy path:', {
                appId,
                configId
              });
            }
          }
        }
        
        // If still not found, try to extract from URL
        if (!appId || !configId) {
          console.log('📊 [REFRESH DEBUG] Trying to extract from URL');
          
          if (typeof window !== 'undefined') {
            const url = window.location.href;
            console.log('📊 [REFRESH DEBUG] Current URL:', url);
            
            // Try to match patterns like /workflow/123 or appId=123
            const urlMatch = url.match(/(?:workflow\/|appId=)(\d+)/);
            if (urlMatch) {
              appId = parseInt(urlMatch[1], 10);
              configId = safeToString(appId, '');
              console.log('📊 [REFRESH DEBUG] Extracted from URL:', {
                appId,
                configId
              });
            }
          }
        }
      }
      
      console.log('📊 [REFRESH DEBUG] Final extracted values:', {
        appId,
        configId,
        isValid: appId !== null && configId !== null
      });
      
      if (appId && configId) {
        console.log('📅 [REFRESH DEBUG] Processing date for API call');
        
        let dateString;
        try {
          dateString = selectedDate ? selectedDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/,/g, '') : new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/,/g, '');
          
          console.log('📅 [REFRESH DEBUG] Date string created:', dateString);
        } catch (dateError) {
          console.error('❌ [REFRESH DEBUG] Error creating date string:', dateError);
          dateString = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/,/g, '');
          console.log('📅 [REFRESH DEBUG] Fallback date string:', dateString);
        }
        
        console.log('🌐 [REFRESH DEBUG] Making API call with params:', {
          date: dateString,
          configId: configId,
          appId: appId
        });
        
        console.log('🌐 [REFRESH DEBUG] Expected API URL:', `http://api.com/api/WF/GetWorkflowSummary/${dateString}/${configId}/${appId}`);
        
        // Fetch fresh workflow summary
        const response = await workflowService.getWorkflowSummary({
          date: dateString,
          configId: configId,
          appId: appId
        });
        
        console.log('🌐 [REFRESH DEBUG] API response received:', {
          success: safeGet(response, 'success', false),
          hasData: !!safeGet(response, 'data', null),
          error: safeGet(response, 'error', null),
          timestamp: safeGet(response, 'timestamp', null)
        });
        
        if (safeGet(response, 'success', false)) {
          const responseData = safeGet(response, 'data', null);
          console.log('✅ [REFRESH DEBUG] Processing successful response:', {
            dataExists: !!responseData,
            dataType: typeof responseData,
            dataKeys: responseData ? Object.keys(responseData) : []
          });
          
          // Update global workflow summary
          (window as any).currentWorkflowSummary = responseData;
          console.log('✅ [REFRESH DEBUG] Updated global workflow summary');
          
          // Update last refreshed time
          setLastRefreshed(new Date());
          setCountdown(refreshInterval);
          console.log('✅ [REFRESH DEBUG] Updated refresh timestamps');
          
          // Restore UI state after a brief delay to allow data to update
          setTimeout(() => {
            console.log('🔄 [REFRESH DEBUG] Restoring UI state');
            try {
              restoreUIState();
              console.log('✅ [REFRESH DEBUG] UI state restored successfully');
            } catch (uiError) {
              console.error('❌ [REFRESH DEBUG] Error restoring UI state:', uiError);
            }
          }, 200);
          
          // Only show success message for manual refreshes
          if (isManualRefresh) {
            console.log('✅ [REFRESH DEBUG] Showing success toast for manual refresh');
            showSuccessToast("Workflow data refreshed successfully");
          }
        } else {
          const errorMessage = safeToString(safeGet(response, 'error', ''), 'Unknown error');
          console.error('❌ [REFRESH DEBUG] API call failed:', errorMessage);
          showErrorToast(`Failed to refresh data: ${errorMessage}`);
        }
      } else {
        console.warn('⚠️ [REFRESH DEBUG] No valid appId/configId found, cannot make API call');
        console.warn('⚠️ [REFRESH DEBUG] Available data sources:', {
          currentSummaryData: !!currentSummaryData,
          hierarchyPath: hierarchyPath?.length || 0,
          url: typeof window !== 'undefined' ? window.location.href : 'N/A'
        });
        
        // Fallback refresh without API call
        setLastRefreshed(new Date());
        setCountdown(refreshInterval);
        
        // Only show success message for manual refreshes
        if (isManualRefresh) {
          console.log('✅ [REFRESH DEBUG] Showing success toast for manual fallback refresh');
          showSuccessToast("Workflow data refreshed successfully");
        }
      }
    } catch (error: any) {
      console.error('❌ [REFRESH DEBUG] Caught error in refresh process:', {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        type: typeof error
      });
      
      // Enhanced error logging for toString issues
      if (error?.message?.includes('toString')) {
        console.error('🔍 [REFRESH DEBUG] toString error detected - investigating:', {
          errorMessage: error.message,
          errorObject: error,
          currentSummaryData: (window as any)?.currentWorkflowSummary,
          selectedDate,
          refreshInterval
        });
      }
      
      const errorMessage = safeToString(safeGet(error, 'message', ''), 'Unknown error occurred');
      console.error('❌ [REFRESH DEBUG] Final error message:', errorMessage);
      showErrorToast(`Refresh failed: ${errorMessage}`);
    } finally {
      console.log('🏁 [REFRESH DEBUG] Refresh process completed, setting isRefreshing to false');
      setIsRefreshing(false);
    }
  }, [isRefreshing, preserveUIState, restoreUIState, selectedDate, refreshInterval, hierarchyPath]);

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
                console.log(`🎨 [TASK RENDER DEBUG] Rendering task ${index}:`, {
                  taskExists: !!task,
                  taskType: typeof task,
                  taskKeys: task ? Object.keys(task) : [],
                  index
                });
                
                try {
                  const rawTaskId = safeGet(task, 'id', `task-${index}`);
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} ID extraction:`, {
                    rawTaskId,
                    rawTaskIdType: typeof rawTaskId
                  });
                  
                  const taskId = safeToString(rawTaskId, `task-${index}`);
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} safe ID:`, taskId);
                  
                  const rawTaskName = safeGet(task, 'name', '');
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} name extraction:`, {
                    rawTaskName,
                    rawTaskNameType: typeof rawTaskName
                  });
                  
                  const taskName = safeToString(rawTaskName, 'Unknown Task');
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} safe name:`, taskName);
                  
                  const taskStatus = safeGet(task, 'status', 'not-started');
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} status:`, taskStatus);
                  
                  const rawProcessId = safeGet(task, 'processId', '');
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} processId extraction:`, {
                    rawProcessId,
                    rawProcessIdType: typeof rawProcessId
                  });
                  
                  const processId = safeToString(rawProcessId, `PROC-${index}`);
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} safe processId:`, processId);
                  
                  const rawDuration = safeGet(task, 'duration', '');
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} duration extraction:`, {
                    rawDuration,
                    rawDurationType: typeof rawDuration
                  });
                  
                  const safeDuration = safeToString(rawDuration, '0');
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} safe duration:`, safeDuration);
                  
                  const rawUpdatedBy = safeGet(task, 'updatedBy', null);
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} updatedBy extraction:`, {
                    rawUpdatedBy,
                    rawUpdatedByType: typeof rawUpdatedBy
                  });
                  
                  const safeUpdatedBy = rawUpdatedBy ? safeToString(rawUpdatedBy, 'Unknown') : null;
                  console.log(`🎨 [TASK RENDER DEBUG] Task ${index} safe updatedBy:`, safeUpdatedBy);
                  
                  console.log(`✅ [TASK RENDER DEBUG] Task ${index} all values extracted safely`);
                  
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
                              <span>Duration: {safeDuration}m</span>
                            </div>
                            {safeUpdatedBy && (
                              <div className="flex items-center gap-1">
                                <UserCircle className="h-3 w-3" />
                                <span>By: {safeUpdatedBy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error(`❌ [TASK RENDER DEBUG] Error rendering task ${index}:`, {
                    error,
                    message: error?.message,
                    stack: error?.stack,
                    task
                  });
                  
                  // Enhanced error logging for toString issues
                  if (error?.message?.includes('toString')) {
                    console.error(`🔍 [TASK RENDER DEBUG] toString error in task ${index}:`, {
                      errorMessage: error.message,
                      task,
                      taskType: typeof task,
                      taskKeys: task ? Object.keys(task) : []
                    });
                  }
                  
                  return (
                    <div key={`error-${index}`} className="p-2 border border-red-200 rounded text-red-600 text-sm">
                      Error rendering task {index + 1}: {error?.message || 'Unknown error'}
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