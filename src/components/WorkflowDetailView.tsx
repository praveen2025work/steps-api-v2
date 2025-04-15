import React, { useState } from 'react';
import WorkflowProgressIndicator from './WorkflowProgressIndicator';
import WorkflowStagesBar from './WorkflowStagesBar';
import WorkflowTaskItem, { WorkflowTask } from './WorkflowTaskItem';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Unlock as UnlockIcon
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SubStagesList from './SubStagesList';
import DocumentsList from './DocumentsList';
import DependencyTreeMap from './DependencyTreeMap';
import RoleAssignments from './RoleAssignments';
import ActivityLog from './ActivityLog';
import WorkflowHierarchyBreadcrumb, { HierarchyNode } from './WorkflowHierarchyBreadcrumb';

interface WorkflowDetailViewProps {
  workflowTitle: string;
  progressSteps: { name: string; progress: number }[];
  stages: { id: string; name: string }[];
  tasks: Record<string, WorkflowTask[]>; // Map of stageId to tasks
}

const WorkflowDetailView: React.FC<WorkflowDetailViewProps> = ({
  workflowTitle,
  progressSteps,
  stages,
  tasks,
}) => {
  const [activeStage, setActiveStage] = useState<string>(stages[0]?.id || '');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tasks: true
  });
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(15);

  // Mock hierarchy path for the breadcrumb navigation - removing percentages from display
  const [hierarchyPath, setHierarchyPath] = useState<HierarchyNode[]>([
    { id: 'app-001', name: 'Daily Named PNL', progress: 45, level: 'app' },
    { id: 'asset-001', name: 'Rates', progress: 60, level: 'workflow' },
    { id: 'wf-level-001', name: 'eRates', progress: 75, level: 'hierarchy' },
  ]);

  // This function has been replaced with an enhanced version below

  // Handle manual refresh
  const handleRefresh = () => {
    setLastRefreshed(new Date());
    setCountdown(15);
    // In a real application, this would fetch fresh data
  };

  // Toggle workflow lock state
  const toggleLock = () => {
    setIsLocked(prev => !prev);
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

  // Enhanced mock data for the additional tabs with the new structure
  const mockSubStages = [
    { 
      id: 'trigger_file',
      name: 'Create Trigger File for Rec Factory',
      type: 'auto',
      status: 'not-started',
      progress: 0,
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
        updatedBy: null,
        updatedOn: null,
        lockedBy: null,
        lockedOn: null,
        completedBy: null,
        completedOn: null
      },
      files: [
        { name: 'trigger.dat', type: 'download', size: '2 KB' }
      ],
      messages: [],
      dependencies: [
        { name: 'Poll Book OFC Rec Factory', status: 'in_progress', id: 'poll_book' }
      ]
    },
    { 
      id: 'file_rec_adj',
      name: 'File Availability - Recurring Adjustment',
      type: 'manual',
      status: 'not-started',
      progress: 0,
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

  const mockDependencies = [
    { name: 'SOD Roll', status: 'completed', completedAt: '2025-04-14 06:15', id: 'dep-1' },
    { name: 'Market Data Load', status: 'completed', completedAt: '2025-04-14 06:30', id: 'dep-2' },
    { name: 'Risk Calculation', status: 'in-progress', completedAt: null, id: 'dep-3' },
    { name: 'Compliance Check', status: 'not-started', completedAt: null, id: 'dep-4' },
  ];

  const mockAuditInfo = [
    { action: 'Process Started', timestamp: '2025-04-14 06:45', user: 'System' },
    { action: 'Manual Intervention', timestamp: '2025-04-14 07:15', user: 'John Doe' },
    { action: 'Process Resumed', timestamp: '2025-04-14 07:20', user: 'John Doe' },
  ];

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

  return (
    <div className="space-y-4">
      {/* Hierarchy Navigation Breadcrumb */}
      <WorkflowHierarchyBreadcrumb 
        nodes={hierarchyPath}
        onNodeClick={handleHierarchyNodeClick}
        onHomeClick={handleHomeClick}
      />
      
      <div className="flex justify-between items-start">
        <div className="w-8"></div> {/* Empty div for spacing */}
        
        {/* Restored Workflow Controls with all requested buttons */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={toggleLock}
            >
              {isLocked ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Locked</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlocked</span>
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Adhoc Stage</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Workflow</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <UnlockIcon className="h-3.5 w-3.5" />
              <span>Reopen Toll Gate</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Last refreshed: {getSecondsSinceRefresh()} seconds ago | Auto-refresh in: {countdown}s
          </div>
        </div>
      </div>

      {/* Options Toolbar */}
      <div className="bg-accent/5 p-4 rounded-lg mb-4">
        <div className="space-y-4">
          {/* Workflow Control Options */}
          <div>
            <h3 className="text-sm font-medium mb-2">Workflow Controls</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('Toggle locked state')}
              >
                Locked
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('Add adhoc stage')}
              >
                Adhoc Stage
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('Reset adhoc')}
              >
                Reset Adhoc
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('Reopen toll gate')}
              >
                Reopen Toll Gate
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('Refresh data')}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Information Options */}
          <div>
            <h3 className="text-sm font-medium mb-2">Information</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('View activity')}
              >
                Activity
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('View roles')}
              >
                Roles
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('View app parameters')}
              >
                App Parameters
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('View global parameters')}
              >
                Global Parameters
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('View dependencies')}
              >
                Dependency
              </Button>
            </div>
          </div>

          {/* View Options */}
          <div>
            <h3 className="text-sm font-medium mb-2">Views</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('View overview')}
              >
                Overview
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => console.log('View documents')}
              >
                Documents
              </Button>
            </div>
          </div>
        </div>
      </div>

      <WorkflowStagesBar 
        stages={stages} 
        activeStage={activeStage} 
        onStageClick={handleStageClick} 
      />

      <div>
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>{activeStageInfo?.name || 'Tasks'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stages">Stages</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="audit">Audit Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Workflow Information</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-accent/5 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">Workflow ID</div>
                          <div className="font-medium">WF-2025-04-14-001</div>
                        </div>
                        <div className="bg-accent/5 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">Business Date</div>
                          <div className="font-medium">2025-04-14</div>
                        </div>
                        <div className="bg-accent/5 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">Expected Completion</div>
                          <div className="font-medium">2025-04-14 11:30 AM</div>
                        </div>
                        <div className="bg-accent/5 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">Priority</div>
                          <div className="font-medium">High</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Pre-Execution Checks</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-accent/5 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>System Availability</span>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500">Passed</Badge>
                          </div>
                          <div className="flex items-center justify-between bg-accent/5 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Data Integrity</span>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500">Passed</Badge>
                          </div>
                          <div className="flex items-center justify-between bg-accent/5 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Prerequisite Workflows</span>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500">Passed</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stages">
                <div className="space-y-4">
                  <SubStagesList 
                    subStages={[
                      // SOD Roll with tasks
                      {
                        id: 'sod_roll',
                        name: 'SOD Roll',
                        status: 'completed',
                        progress: 100,
                        processId: 'PROC-1234',
                        type: 'auto',
                        timing: {
                          start: '06:00',
                          duration: '15m',
                          avgDuration: '12m',
                          avgStart: '06:00 AM'
                        },
                        message: 'Successfully rolled over positions',
                        meta: {
                          updatedBy: 'System',
                          updatedOn: '2025-04-12T06:15:00',
                        },
                        files: [
                          { name: 'sod_report.xlsx', type: 'download', size: '2.4 MB' },
                          { name: 'validation.log', type: 'preview', size: '150 KB' }
                        ],
                        tasks: [
                          {
                            id: 'task-1',
                            name: 'SOD Roll',
                            processId: 'PROC-1234',
                            status: 'completed',
                            duration: '15m',
                            expectedStart: '06:00',
                            files: [
                              { name: 'sod_report.xlsx', type: 'download', size: '2.4 MB' },
                              { name: 'validation.log', type: 'preview', size: '150 KB' }
                            ],
                            messages: [
                              'Successfully rolled over positions',
                              'All 2,500 positions processed'
                            ],
                            updatedBy: 'System',
                            updatedAt: '2025-04-12T06:15:00'
                          }
                        ]
                      },
                      // Books Open For Correction with tasks
                      {
                        id: 'books_open',
                        name: 'Books Open For Correction',
                        status: 'in-progress',
                        progress: 50,
                        processId: 'PROC-1235',
                        type: 'manual',
                        timing: {
                          start: '06:30',
                          duration: '30m',
                          avgDuration: '25m',
                          avgStart: '06:30 AM'
                        },
                        message: 'Books opened for correction',
                        meta: {
                          updatedBy: 'John Doe',
                          updatedOn: '2025-04-12T06:30:00',
                        },
                        files: [
                          { name: 'corrections.xlsx', type: 'download', size: '1.2 MB' }
                        ],
                        dependencies: [
                          { name: 'SOD Roll', status: 'completed', id: 'sod_roll' }
                        ],
                        tasks: [
                          {
                            id: 'task-2',
                            name: 'Books Open For Correction',
                            processId: 'PROC-1235',
                            status: 'in-progress',
                            duration: '30m',
                            expectedStart: '06:30',
                            dependencies: [
                              { name: 'SOD Roll', status: 'completed' }
                            ],
                            files: [
                              { name: 'corrections.xlsx', type: 'download', size: '1.2 MB' }
                            ],
                            messages: [
                              'Books opened for correction'
                            ],
                            updatedBy: 'John Doe',
                            updatedAt: '2025-04-12T06:30:00'
                          }
                        ]
                      },
                      // Add remaining sub-stages
                      ...mockSubStages.filter(s => 
                        s.id !== 'sod_roll' && 
                        s.id !== 'books_open'
                      )
                    ]} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <DocumentsList documents={mockDocuments} />
              </TabsContent>
              
              <TabsContent value="parameters">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Application Parameters</h3>
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Value</th>
                            <th className="text-left p-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockParameters.app.map((param, index) => (
                            <tr key={index} className={index < mockParameters.app.length - 1 ? "border-b" : ""}>
                              <td className="p-2 font-mono text-sm">{param.name}</td>
                              <td className="p-2 font-mono text-sm">{param.value}</td>
                              <td className="p-2 text-sm text-muted-foreground">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Global Parameters</h3>
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Value</th>
                            <th className="text-left p-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockParameters.global.map((param, index) => (
                            <tr key={index} className={index < mockParameters.global.length - 1 ? "border-b" : ""}>
                              <td className="p-2 font-mono text-sm">{param.name}</td>
                              <td className="p-2 font-mono text-sm">{param.value}</td>
                              <td className="p-2 text-sm text-muted-foreground">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Process Parameters</h3>
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Value</th>
                            <th className="text-left p-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockParameters.process.map((param, index) => (
                            <tr key={index} className={index < mockParameters.process.length - 1 ? "border-b" : ""}>
                              <td className="p-2 font-mono text-sm">{param.name}</td>
                              <td className="p-2 font-mono text-sm">{param.value}</td>
                              <td className="p-2 text-sm text-muted-foreground">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dependencies">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium mb-2">Dependency Tree</h3>
                  <div className="border rounded-lg p-4 bg-accent/5">
                    {/* Using the new DependencyTreeMap component */}
                    <DependencyTreeMap 
                      dependencies={[
                        {
                          id: 'dep-1',
                          name: 'SOD Roll',
                          status: 'completed',
                          completedAt: '2025-04-14 06:15',
                          children: [
                            {
                              id: 'dep-2',
                              name: 'Market Data Load',
                              status: 'completed',
                              completedAt: '2025-04-14 06:30',
                              children: [
                                {
                                  id: 'dep-3',
                                  name: 'Risk Calculation',
                                  status: 'in-progress'
                                }
                              ]
                            },
                            {
                              id: 'dep-4',
                              name: 'Books Open For Correction',
                              status: 'in-progress',
                              children: [
                                {
                                  id: 'dep-5',
                                  name: 'Compliance Check',
                                  status: 'not-started'
                                }
                              ]
                            }
                          ]
                        }
                      ]}
                      onDependencyClick={(id) => {
                        console.log(`Navigate to dependency: ${id}`);
                        // In a real application, this would navigate to the specific step
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="roles">
                <RoleAssignments roleAssignments={{
                  "producer": [
                    { name: "John Doe", lastActivity: "Completed Books Open For Correction", timestamp: "2025-04-14T07:00:00" },
                    { name: "Jane Smith", lastActivity: "Uploaded corrections file", timestamp: "2025-04-14T06:45:00" },
                    { name: "Robert Chen", lastActivity: "Preparing Non-recurring Adjustments", timestamp: "2025-04-14T07:30:00" }
                  ],
                  "approver": [
                    { name: "Mike Johnson", lastActivity: "Reviewed Books Open For Correction", timestamp: "2025-04-14T07:20:00" },
                    { name: "Sarah Williams", lastActivity: "Logged in", timestamp: "2025-04-14T07:15:00" }
                  ],
                  "viewer": [
                    { name: "Tom Brown", lastActivity: "Viewed workflow status", timestamp: "2025-04-14T07:25:00" }
                  ]
                }} />
              </TabsContent>
              
              <TabsContent value="activity">
                <ActivityLog activities={[
                  {
                    user: 'System',
                    action: 'SOD Roll completed successfully',
                    timestamp: '2025-04-14T06:15:00',
                    role: 'system',
                    substage: 'SOD Roll',
                    status: 'completed'
                  },
                  {
                    user: 'John Doe',
                    action: 'Started Books Open For Correction',
                    timestamp: '2025-04-14T06:30:00',
                    role: 'producer',
                    substage: 'Books Open For Correction',
                    status: 'in_progress'
                  },
                  {
                    user: 'Jane Smith',
                    action: 'Uploaded corrections file',
                    timestamp: '2025-04-14T06:45:00',
                    role: 'producer',
                    substage: 'Books Open For Correction',
                    status: 'in_progress'
                  },
                  {
                    user: 'John Doe',
                    action: 'Completed Books Open For Correction',
                    timestamp: '2025-04-14T07:00:00',
                    role: 'producer',
                    substage: 'Books Open For Correction',
                    status: 'completed'
                  },
                  {
                    user: 'System',
                    action: 'Started Poll Book OFC Rec Factory',
                    timestamp: '2025-04-14T07:15:00',
                    role: 'system',
                    substage: 'Poll Book OFC Rec Factory',
                    status: 'in_progress'
                  },
                  {
                    user: 'Mike Johnson',
                    action: 'Reviewed Books Open For Correction process',
                    timestamp: '2025-04-14T07:20:00',
                    role: 'approver',
                    substage: 'Books Open For Correction',
                    status: 'completed'
                  }
                ]} />
              </TabsContent>
              
              <TabsContent value="audit">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Action</th>
                        <th className="text-left p-2">Timestamp</th>
                        <th className="text-left p-2">User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAuditInfo.map((audit, index) => (
                        <tr key={index} className={index < mockAuditInfo.length - 1 ? "border-b" : ""}>
                          <td className="p-2">{audit.action}</td>
                          <td className="p-2 text-sm">{audit.timestamp}</td>
                          <td className="p-2 text-sm">{audit.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Updated: 2025-04-14 07:20
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sequence: 3/5
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowDetailView;