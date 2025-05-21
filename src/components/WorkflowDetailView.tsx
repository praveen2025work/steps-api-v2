import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import WorkflowProgressIndicator from './WorkflowProgressIndicator';
import WorkflowStagesBar from './WorkflowStagesBar';
import WorkflowTaskItem, { WorkflowTask } from './WorkflowTaskItem';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast, showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '@/lib/toast';
import { useDate } from '@/contexts/DateContext';
import { CreateSupportIssue } from './support/CreateSupportIssue';
import ProcessQueries from './workflow/ProcessQueries';
import ProcessParameters from './workflow/ProcessParameters';
import AppParameters from './workflow/AppParameters';
import GlobalParameters from './workflow/GlobalParameters';
import ProcessDependencies from './workflow/ProcessDependencies';
import ProcessOverview from './workflow/ProcessOverview';
import StageOverview from './workflow/StageOverview';
import WorkflowUnifiedHeader from './workflow/WorkflowUnifiedHeader';
import { EnhancedFilePreview } from './files/EnhancedFilePreview';
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
  EyeOff
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

interface WorkflowDetailViewProps {
  workflowTitle: string;
  progressSteps: { name: string; progress: number }[];
  stages: { id: string; name: string }[];
  tasks: Record<string, WorkflowTask[]>; // Map of stageId to tasks
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
}) => {
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
  const [rightPanelContent, setRightPanelContent] = useState<'overview' | 'stage-overview' | 'process-overview' | 'stages' | 'documents' | 'parameters' | 'dependencies' | 'roles' | 'activity' | 'audit' | 'app-parameters' | 'global-parameters' | 'queries'>('stage-overview');
  const [selectedSubStage, setSelectedSubStage] = useState<string | null>(null);
  const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(false);
  const [stageSpecificSubStages, setStageSpecificSubStages] = useState<SubStage[]>([]);
  const [stageSpecificDocuments, setStageSpecificDocuments] = useState<any[]>([]);
  const [showFilePreview, setShowFilePreview] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentSubStageFiles, setCurrentSubStageFiles] = useState<any[]>([]);
  const [showWorkflowDetail, setShowWorkflowDetail] = useState<boolean>(true);
  const [showSubStageCards, setShowSubStageCards] = useState<boolean>(true);

  // Build hierarchy path from progressSteps
  const [hierarchyPath, setHierarchyPath] = useState<HierarchyNode[]>([]);

  // Initialize hierarchy path from progressSteps
  useEffect(() => {
    if (progressSteps && progressSteps.length > 0) {
      const path = progressSteps.map((step, index) => {
        // Determine the level based on the index
        let level = 'hierarchy';
        if (index === 0) level = 'app';
        else if (index === 1) level = 'workflow';
        
        // Generate an ID based on the name (for navigation purposes)
        const id = step.name.toLowerCase().replace(/\s+/g, '-');
        
        return {
          id: index === 0 ? `app-${id}` : id,
          name: step.name,
          progress: step.progress,
          level: level
        };
      });
      
      setHierarchyPath(path);
    }
  }, [progressSteps]);

  // This function has been replaced with an enhanced version below

  // Handle manual refresh
  const handleRefresh = () => {
    setLastRefreshed(new Date());
    setCountdown(15);
    // In a real application, this would fetch fresh data
    showSuccessToast("Workflow data refreshed successfully");
  };

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

  // Updated mock data with different statuses
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
      dependencies: [
        { name: 'Poll Book OFC Rec Factory', status: 'completed', id: 'poll_book' }
      ]
    },
    { 
      id: 'file_rec_adj',
      name: 'File Availability - Recurring Adjustment',
      type: 'manual',
      status: 'in-progress',
      progress: 45,
      processId: 'PROC-1238',
      timing: {
        start: '08:00:00',
        duration: '20m',
        avgDuration: '15m',
        avgStart: '08:00 AM'
      },
      stats: {
        success: '92%',
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
      files: [
        { name: 'recurring_adj.xlsx', type: 'upload', size: '1.8 MB' },
        { name: 'adj_template.xlsx', type: 'download', size: '250 KB' }
      ],
      messages: [],
      dependencies: [
        { name: 'SOD Roll', status: 'completed', id: 'sod_roll' }
      ]
    },
    { 
      id: 'file_dod',
      name: 'File Availability - DOD Rule',
      type: 'manual',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1239',
      timing: {
        start: '08:15:00',
        duration: '15m',
        avgDuration: '10m',
        avgStart: '08:15 AM'
      },
      stats: {
        success: '90%',
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
      files: [
        { name: 'dod_rules.xlsx', type: 'upload', size: '950 KB' },
        { name: 'dod_template.xlsx', type: 'download', size: '180 KB' }
      ],
      messages: [],
      dependencies: []
    },
    { 
      id: 'balance_check',
      name: 'Balance in Closed, Central, Default And Other Auto Excluded Books',
      type: 'auto',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1243',
      timing: {
        start: '09:15:00',
        duration: '15m',
        avgDuration: '12m',
        avgStart: '09:15 AM'
      },
      stats: {
        success: '94%',
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
      files: [
        { name: 'balance_report.xlsx', type: 'download', size: '2.2 MB' },
        { name: 'exceptions.log', type: 'preview', size: '120 KB' }
      ],
      messages: [],
      dependencies: [
        { name: 'Books Open For Correction', status: 'completed', id: 'books_open' }
      ]
    },
    { 
      id: 'recurring_adj',
      name: 'Recurring Adjustments',
      type: 'auto',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1244',
      timing: {
        start: '09:30:00',
        duration: '20m',
        avgDuration: '18m',
        avgStart: '09:30 AM'
      },
      stats: {
        success: '91%',
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
      files: [
        { name: 'rec_adjustments.xlsx', type: 'download', size: '1.8 MB' },
        { name: 'adj_log.txt', type: 'preview', size: '95 KB' }
      ],
      messages: [],
      dependencies: [
        { name: 'Books Open For Correction', status: 'completed', id: 'books_open' },
        { name: 'File Availability - Recurring Adjustment', status: 'not-started', id: 'file_rec_adj' }
      ]
    },
    { 
      id: 'non_rec_adj',
      name: 'Post Non-recurring Adjustments',
      type: 'manual',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1245',
      timing: {
        start: '09:50:00',
        duration: '30m',
        avgDuration: '25m',
        avgStart: '09:50 AM'
      },
      stats: {
        success: '88%',
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
      files: [
        { name: 'non_rec_adj.xlsx', type: 'upload', size: '1.4 MB' },
        { name: 'adj_template.xlsx', type: 'download', size: '230 KB' }
      ],
      messages: [],
      dependencies: [
        { name: 'SOD Roll', status: 'completed', id: 'sod_roll' }
      ]
    },
    { 
      id: 'review_pnl_dod',
      name: 'Review Daily PnL-Generate DoD Movement',
      type: 'auto',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1246',
      timing: {
        start: '10:30:00',
        duration: '20m',
        avgDuration: '18m',
        avgStart: '10:30 AM'
      },
      stats: {
        success: '95%',
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
      files: [
        { name: 'dod_movement.xlsx', type: 'download', size: '1.9 MB' },
        { name: 'movement_log.txt', type: 'preview', size: '110 KB' }
      ],
      messages: [],
      dependencies: [
        { name: 'File Availability - DOD Rule', status: 'not-started', id: 'file_dod' },
        { name: 'Recurring Adjustments', status: 'not-started', id: 'recurring_adj' }
      ]
    }
  ];

  const mockDocuments = [
    { id: 'doc-1', name: 'input_data.xlsx', type: 'excel', size: '2.4 MB', updatedAt: '2025-04-14 02:30', updatedBy: 'John Doe' },
    { id: 'doc-2', name: 'validation_report.pdf', type: 'pdf', size: '1.2 MB', updatedAt: '2025-04-14 02:45', updatedBy: 'System' },
    { id: 'doc-3', name: 'process_log.txt', type: 'text', size: '450 KB', updatedAt: '2025-04-14 03:00', updatedBy: 'System' },
    { id: 'doc-4', name: 'report_template.html', type: 'html', size: '120 KB', updatedAt: '2025-04-14 03:15', updatedBy: 'Jane Smith' },
    { id: 'doc-5', name: 'styles.css', type: 'css', size: '45 KB', updatedAt: '2025-04-14 03:20', updatedBy: 'Jane Smith' },
    { id: 'doc-6', name: 'notification.msg', type: 'email', size: '75 KB', updatedAt: '2025-04-14 03:30', updatedBy: 'System' },
    { id: 'doc-7', name: 'archive.zip', type: 'archive', size: '3.2 MB', updatedAt: '2025-04-14 03:45', updatedBy: 'John Doe' },
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
    },
    { 
      action: 'Manual Intervention',
      timestamp: '2025-04-14 07:15',
      user: 'John Doe',
      role: 'Supervisor',
      substage: 'Review',
      status: 'in-progress'
    },
    { 
      action: 'Process Resumed',
      timestamp: '2025-04-14 07:20',
      user: 'John Doe',
      role: 'Supervisor',
      substage: 'Review',
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
    ],
    viewer: [
      {
        name: 'Mike Johnson',
        lastActivity: 'Viewed workflow status',
        timestamp: '2025-04-14 06:45'
      }
    ]
  };

  // Load stage-specific data when active stage changes
  useEffect(() => {
    if (activeStage) {
      // Get stage data from our new utility
      const stageData = getStageData(activeStage);
      
      if (stageData) {
        // Convert stage tasks to SubStage format for our component
        const stageTasks = stageData.tasks.map(task => ({
          id: task.id,
          name: task.name,
          type: task.processId.includes('AUTO') ? 'auto' : 'manual',
          status: task.status,
          progress: task.status === 'completed' ? 100 : 
                   task.status === 'in-progress' ? 50 : 
                   task.status === 'failed' ? 0 : 0,
          processId: task.processId,
          timing: {
            start: task.expectedStart,
            duration: `${task.duration}m`,
            avgDuration: `${task.duration}m`,
            avgStart: task.expectedStart
          },
          stats: {
            success: '95%',
            lastRun: null
          },
          meta: {
            updatedBy: task.updatedBy,
            updatedOn: task.updatedAt,
            lockedBy: null,
            lockedOn: null,
            completedBy: task.status === 'completed' ? task.updatedBy : null,
            completedOn: task.status === 'completed' ? task.updatedAt : null
          },
          files: task.documents?.map(doc => ({
            name: doc.name,
            type: 'download',
            size: doc.size
          })) || [],
          messages: task.messages || [],
          dependencies: task.dependencies?.map(dep => ({
            name: dep.name,
            status: dep.status,
            id: dep.name.toLowerCase().replace(/\s+/g, '_')
          })) || []
        }));
        
        setStageSpecificSubStages(stageTasks);
        
        // Convert stage documents to the format expected by DocumentsList
        const stageDocuments = stageData.documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type.toLowerCase(),
          size: doc.size,
          updatedAt: doc.uploadedAt,
          updatedBy: doc.uploadedBy
        }));
        
        setStageSpecificDocuments(stageDocuments);
      } else {
        // If no stage-specific data found, use default tasks
        setStageSpecificSubStages([]);
        setStageSpecificDocuments([]);
      }
    }
  }, [activeStage]);

  // Set up auto-refresh effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Enhanced hierarchy node click handler to properly navigate between levels
  const handleHierarchyNodeClick = (node: HierarchyNode) => {
    console.log(`Navigate to ${node.level} level: ${node.name}`);
    
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
    console.log('Navigate to home dashboard');
    // Note: The actual navigation is now handled in the WorkflowHierarchyBreadcrumb component
  };

  const handleProcessIdClick = (processId: string) => {
    // Find the sub-stage by process ID
    const subStage = (stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages)
      .find(s => s.processId === processId);
    
    // If found, use the sub-stage ID, otherwise use the process ID
    const subStageId = subStage ? subStage.id : processId;
    
    // If clicking the same sub-stage, just toggle the panel
    if (selectedSubStage === subStageId) {
      setSelectedSubStage(null);
      setRightPanelContent('stage-overview');
    } else {
      setSelectedSubStage(subStageId);
      setRightPanelContent('process-overview');
      setRightPanelOpen(true);
      setIsRightPanelExpanded(true);
      
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
    }
  };
  
  const handleFileClick = (file: any, subStageId: string) => {
    setSelectedFile(file.name);
    setShowFilePreview(true);
    // Hide both workflow detail view and sub-stage cards to give more space to file preview
    setShowWorkflowDetail(false);
    setShowSubStageCards(false);
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
  };
  
  const toggleSubStageCards = () => {
    setShowSubStageCards(!showSubStageCards);
  };
  
  const handleCloseFilePreview = () => {
    setShowFilePreview(false);
    setSelectedFile(null);
    // Don't automatically show workflow detail when closing file preview
    // Let the user toggle it with the icon if they want
  };
  
  const toggleWorkflowDetail = () => {
    setShowWorkflowDetail(!showWorkflowDetail);
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
      case 'process-overview':
        return <ProcessOverview processId={currentProcessId} processName={currentProcessName} />;
      case 'stages':
        return <SubStagesList subStages={stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages} />;
      case 'documents':
        return <DocumentsList documents={stageSpecificDocuments.length > 0 ? stageSpecificDocuments : mockDocuments} />;
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

  const renderSubStageCard = (subStage: SubStage) => {
    const isSelected = selectedSubStage === subStage.id;
    const isInProgress = subStage.status === 'in-progress';
    
    return (
      <Card 
        key={subStage.id}
        className={`mb-4 transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setSelectedSubStage(subStage.id)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{subStage.name}</div>
            <div className={`px-2 py-1 rounded-full text-xs ${
              subStage.status === 'completed' ? 'bg-green-100 text-green-800' :
              subStage.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              subStage.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {subStage.status}
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{isInProgress ? '...' : `${subStage.progress}%`}</span>
            </div>
            <Progress 
              value={subStage.progress} 
              className={`h-2 ${isInProgress ? 'animate-pulse' : ''}`} 
            />
            <div className="flex items-center justify-between text-sm">
              <span>Type</span>
              <span className="capitalize">{subStage.type}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Process ID</span>
              <span>{subStage.processId}</span>
            </div>
            {subStage.messages && subStage.messages.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {subStage.messages[0]}
              </div>
            )}
            {subStage.timing && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Expected Start: {subStage.timing.start || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {subStage.timing.duration || 'N/A'}</span>
                </div>
              </div>
            )}
            {subStage.meta && subStage.meta.updatedBy && (
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                <span>Updated by: {subStage.meta.updatedBy} {subStage.meta.updatedOn && `(${subStage.meta.updatedOn})`}</span>
              </div>
            )}
            {subStage.dependencies && subStage.dependencies.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium mb-2">Dependencies</h4>
                <div className="space-y-2">
                  {subStage.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{dep.name}</span>
                      <Badge variant={getStatusVariant(dep.status as StageStatus)}>
                        {dep.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Calculate overall workflow progress
  const calculateOverallProgress = () => {
    // If we have hierarchy path, use the last node's progress
    if (hierarchyPath.length > 0) {
      return hierarchyPath[hierarchyPath.length - 1].progress;
    }
    
    // Otherwise calculate from tasks
    let totalTasks = 0;
    let completedTasks = 0;
    
    Object.values(tasks).forEach(stageTasks => {
      totalTasks += stageTasks.length;
      completedTasks += stageTasks.filter(task => task.status === 'completed').length;
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Calculate task counts
  const calculateTaskCounts = () => {
    let completed = 0;
    let failed = 0;
    let rejected = 0;
    let pending = 0;
    let processing = 0;
    
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
  };

  return (
    <div className="space-y-2">
      {/* Unified Workflow Header Card */}
      <WorkflowUnifiedHeader
        workflowId={hierarchyPath[hierarchyPath.length-1]?.id || ''}
        workflowTitle={workflowTitle}
        hierarchyPath={hierarchyPath}
        progress={calculateOverallProgress()}
        status="Active"
        isLocked={isLocked}
        onToggleLock={toggleLock}
        onRefresh={handleRefresh}
        taskCounts={calculateTaskCounts()}
        lastRefreshed={lastRefreshed}
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

      <div className="flex gap-4">
        {/* Main Content - Only visible when file preview is not shown or explicitly kept visible */}
        <div className={`${showFilePreview ? (showSubStageCards ? 'flex-[0.3] relative' : 'hidden') : 'flex-[0.6]'}`}>
          {/* Process Overview removed from main content as it's now in the right panel */}
          <div className="space-y-4">
            {(stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages).map((subStage, index) => (
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
                          {String(index + 1).padStart(2, '0')}
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
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileClick(subStage.files[0], subStage.id);
                                }}
                                title={`Files (${subStage.files.length})`}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            
                            {/* Start button - Only for not-started or failed processes */}
                            {(subStage.status === 'not-started' || subStage.status === 'failed') && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showSuccessToast(`Started ${subStage.name}`);
                                }}
                                title="Start"
                              >
                                <PlayCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            
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
                            
                            {/* Complete button - Only for in-progress processes */}
                            {subStage.status === 'in-progress' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showSuccessToast(`Completed ${subStage.name}`);
                                }}
                                title="Complete"
                              >
                                <ArrowRightCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            
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
                            
                            {/* Rerun button - Only for completed or failed processes */}
                            {(subStage.status === 'completed' || subStage.status === 'failed') && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showInfoToast(`Rerunning ${subStage.name}`);
                                }}
                                title="Rerun"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
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
                        
                        {/* Dependencies - Compact */}
                        {subStage.dependencies && subStage.dependencies.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Network className="h-3 w-3" />
                            <span>Deps: {subStage.dependencies.map(d => d.name).join(', ')}</span>
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
            ))}
          </div>
        </div>

        {/* File Preview Panel - Only shown when a file is selected */}
        {showFilePreview && (
          <div className="flex-1 flex flex-col relative">
            {/* Toggle buttons for workflow detail and sub-stage cards */}
            <div className="absolute -left-4 top-2 flex flex-col gap-2 z-10">
              {/* Workflow detail toggle */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-background border shadow-sm"
                onClick={toggleWorkflowDetail}
                title={showWorkflowDetail ? "Hide workflow detail" : "Show workflow detail"}
              >
                {showWorkflowDetail ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </Button>
              
              {/* Sub-stage cards toggle */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-background border shadow-sm"
                onClick={toggleSubStageCards}
                title={showSubStageCards ? "Hide process cards" : "Show process cards"}
              >
                {showSubStageCards ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
            {/* Display the selected sub-stage card in a horizontal layout above the file preview */}
            {selectedSubStage && (
              <div className="border-b p-2">
                <div className="flex items-center">
                  {/* Render a horizontal version of the selected sub-stage card */}
                  {(() => {
                    const subStage = (stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages)
                      .find(s => s.id === selectedSubStage) || 
                      (stageSpecificSubStages.length > 0 ? stageSpecificSubStages : mockSubStages)[0];
                    
                    return (
                      <div className="flex-1 flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-sm ${
                          subStage.status === 'completed' ? 'bg-green-500' :
                          subStage.status === 'in-progress' ? 'bg-blue-500' :
                          subStage.status === 'failed' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`} />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{subStage.name}</div>
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              subStage.status === 'completed' ? 'bg-green-100 text-green-800' :
                              subStage.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              subStage.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {subStage.status}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span className="font-mono">{subStage.processId}</span>
                            </div>
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
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span>{subStage.progress}%</span>
                          </div>
                          <Progress 
                            value={subStage.progress} 
                            className="w-20 h-2" 
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            <EnhancedFilePreview 
              files={currentSubStageFiles}
              processId={selectedSubStage || undefined}
              onClose={handleCloseFilePreview}
              subStageId={selectedSubStage || undefined}
              onToggleWorkflowDetail={toggleWorkflowDetail}
              showWorkflowDetail={showWorkflowDetail}
              onToggleSubStageCards={toggleSubStageCards}
              showSubStageCards={showSubStageCards}
            />
          </div>
        )}
        
        {/* Right Panel - 40% width or 30% when file preview is shown */}
        <div className={`bg-background border-l transition-all duration-200 ${
          !showWorkflowDetail && showFilePreview ? 'flex-[0.3]' : 
          rightPanelContent ? (showFilePreview ? 'flex-[0.3]' : 'flex-[0.4]') : 'w-[200px]'
        }`}>
          {/* Sticky Header and Menu */}
          <div className="sticky top-0 bg-background border-b z-10">
            <div className="p-1">
              {/* Simplified menu - only show Config and Overview by default */}
              <div className="flex flex-wrap gap-1 items-center">
                {/* Always show Overview and Config options */}
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
                
                {/* Show additional options only when a process is selected */}
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
                      onClick={() => setRightPanelContent('documents')}
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
                    
                    <div className="flex items-center ml-auto">
                      <Button 
                        variant={rightPanelContent === 'queries' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setRightPanelContent('queries')}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Queries
                      </Button>
                    </div>
                  </>
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