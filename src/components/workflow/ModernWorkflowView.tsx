import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AdvancedFilePreview from "@/components/files/AdvancedFilePreview";
import { FileUpload } from "@/components/files/FileUpload";
import StageOverview from "@/components/workflow/StageOverview";
import AppParameters from "@/components/workflow/AppParameters";
import GlobalParameters from "@/components/workflow/GlobalParameters";
import ProcessOverview from "@/components/workflow/ProcessOverview";
import ProcessParameters from "@/components/workflow/ProcessParameters";
import ProcessDependencies from "@/components/workflow/ProcessDependencies";
import ProcessQueries from "@/components/workflow/ProcessQueries";
import WorkflowStepFunctionDiagram from "@/components/workflow/WorkflowStepFunctionDiagram";
import { generateSampleWorkflowDiagram, convertWorkflowToDiagram } from "@/lib/workflowDiagramUtils";
import { WorkflowFilterPanel, WorkflowFilters } from './WorkflowFilterPanel';
import {
  FileText,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart2,
  Settings,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Paperclip,
  Link,
  Upload,
  UserCheck,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import WorkflowUnifiedHeader from './WorkflowUnifiedHeader';
import { useDate } from '@/contexts/DateContext';

interface ModernWorkflowViewProps {
  workflow: any;
  onViewToggle?: (mode: 'classic' | 'modern' | 'step-function') => void;
  viewMode?: 'classic' | 'modern' | 'step-function';
  onRefresh?: () => void;
  onBack?: () => void;
}

const ModernWorkflowView: React.FC<ModernWorkflowViewProps> = ({
  workflow,
  onViewToggle,
  viewMode,
  onRefresh,
  onBack,
}) => {
  const { selectedDate } = useDate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [configTab, setConfigTab] = useState('stageOverview');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectAllTasks, setSelectAllTasks] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<WorkflowFilters>({
    status: 'all',
    processName: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<WorkflowFilters>({
    status: 'all',
    processName: '',
  });

  const allTasks = Object.values(workflow.tasks || {}).flat();
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((task: any) => task.status === 'completed').length;
  const {
    hierarchyPath = [],
    taskCounts = { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 },
    progress = 0,
  } = workflow;
  
  const toggleLock = () => setIsLocked(!isLocked);
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  const handleFiltersChange = (newFilters: WorkflowFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setIsFilterPanelOpen(false);
  };

  const handleResetFilters = () => {
    const resetFiltersState = { status: 'all', processName: '' };
    setFilters(resetFiltersState);
    setAppliedFilters(resetFiltersState);
    setIsFilterPanelOpen(false);
  };
  
  // Handle file click
  const handleFileClick = (file: any) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };
  
  // Toggle stage expansion
  const toggleStage = (stageId: string) => {
    if (expandedStage === stageId) {
      setExpandedStage(null);
    } else {
      setExpandedStage(stageId);
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-500";
      case 'in_progress':
        return "bg-blue-500";
      case 'pending':
        return "bg-amber-500";
      case 'failed':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return "outline";
      case 'in_progress':
        return "default";
      case 'pending':
        return "secondary";
      case 'failed':
        return "destructive";
      default:
        return "outline";
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format status text
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Render the overview tab content with enhanced API data
  const renderOverviewContent = () => {
    // Enhanced task counts from API data if available
    let taskCounts = {
      completed: completedTasks,
      failed: 0,
      rejected: 0,
      pending: totalTasks - completedTasks,
      processing: 0
    };
    
    if (workflow.summaryData && workflow.summaryData.processData) {
      const processData = workflow.summaryData.processData;
      taskCounts = {
        completed: 0,
        failed: 0,
        rejected: 0,
        pending: 0,
        processing: 0
      };
      
      processData.forEach((process: any) => {
        const status = process.status?.toLowerCase();
        if (status === 'completed') taskCounts.completed++;
        else if (status === 'failed') taskCounts.failed++;
        else if (status === 'rejected') taskCounts.rejected++;
        else if (status === 'in_progress' || status === 'in-progress' || status === 'running') taskCounts.processing++;
        else taskCounts.pending++;
      });
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Workflow Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Stages</h4>
                    <p className="text-2xl font-bold">{workflow.stages.length}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</h4>
                    <p className="text-2xl font-bold">{totalTasks}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Completed</h4>
                    <p className="text-2xl font-bold text-green-600">{taskCounts.completed}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Processing</h4>
                    <p className="text-2xl font-bold text-blue-600">{taskCounts.processing}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Failed</h4>
                    <p className="text-2xl font-bold text-red-600">{taskCounts.failed}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Pending</h4>
                    <p className="text-2xl font-bold text-amber-600">{taskCounts.pending}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Stage Progress</h4>
                  <div className="space-y-3">
                    {workflow.stages.map((stage: any) => {
                      // Calculate stage progress
                      const stageTasks = workflow.tasks[stage.id] || [];
                      const stageCompletedTasks = stageTasks.filter((task: any) => task.status === 'completed').length;
                      const stageProgress = stageTasks.length > 0 
                        ? Math.round((stageCompletedTasks / stageTasks.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={stage.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{stage.name}</span>
                            <span className="text-sm font-medium">{stageProgress}%</span>
                          </div>
                          <Progress value={stageProgress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-md border">
                    <div className={`p-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-600' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      task.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{task.name}</h4>
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {formatStatus(task.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.updatedBy} - {task.updatedAt}
                      </p>
                      {task.messages && task.messages.length > 0 && (
                        <p className="text-sm mt-2 bg-muted/50 p-2 rounded-md">
                          {task.messages[0]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allTasks.flatMap((task: any) => 
                  (task.documents || []).map((doc: any, index: number) => (
                    <Button 
                      key={`${task.id}-${index}`}
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => handleFileClick({
                        id: `file-${task.id}-${index}`,
                        name: doc.name
                      })}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      <div className="flex justify-between items-center w-full">
                        <span className="truncate">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                      </div>
                    </Button>
                  ))
                ).slice(0, 5)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Handle task selection
  const handleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Handle select all tasks
  const handleSelectAllTasks = () => {
    if (selectAllTasks) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(allTasks.map((task: any) => task.id));
    }
    setSelectAllTasks(!selectAllTasks);
  };

  // Update selectAll state when individual selections change
  useEffect(() => {
    if (allTasks.length > 0 && selectedTasks.length === allTasks.length) {
      setSelectAllTasks(true);
    } else {
      setSelectAllTasks(false);
    }
  }, [selectedTasks, allTasks]);

  // Handle file upload
  const handleFileUploadComplete = () => {
    setShowFileUpload(false);
    // In a real app, you would refresh the file list here
  };

  // Render the stages tab content
  const renderStagesContent = () => {
    const filteredStages = workflow.stages.map((stage: any) => ({
      ...stage,
      tasks: (workflow.tasks[stage.id] || []).filter((task: any) => {
        const statusMatch = appliedFilters.status === 'all' || task.status.toLowerCase() === appliedFilters.status.toLowerCase();
        const nameMatch = !appliedFilters.processName || task.name.toLowerCase().includes(appliedFilters.processName.toLowerCase());
        return statusMatch && nameMatch;
      }),
    })).filter((stage: any) => stage.tasks.length > 0);

    return (
    <div className="space-y-4 pt-4">
      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
          <span className="text-sm font-medium">{selectedTasks.length} tasks selected</span>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <UserCheck className="mr-2 h-4 w-4" />
                  <span>Assign to Team</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>Mark as Priority</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Mark as Complete</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload Files for Selected</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => setSelectedTasks([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {filteredStages.map((stage: any) => {
          const stageTasks = stage.tasks || [];
          const isExpanded = expandedStage === stage.id;
          
          return (
            <Card key={stage.id} className="overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                onClick={() => toggleStage(stage.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">{stage.order}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{stage.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stageTasks.length} tasks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    {stageTasks.length > 0 && (
                      <div className="flex -space-x-2">
                        {stageTasks.slice(0, 3).map((task: any, index: number) => (
                          <div 
                            key={index}
                            className={`h-6 w-6 rounded-full border-2 border-background flex items-center justify-center ${
                              task.status === 'completed' ? 'bg-green-100' :
                              task.status === 'in_progress' ? 'bg-blue-100' :
                              task.status === 'failed' ? 'bg-red-100' :
                              'bg-amber-100'
                            }`}
                          >
                            {getStatusIcon(task.status)}
                          </div>
                        ))}
                        {stageTasks.length > 3 && (
                          <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">+{stageTasks.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-4 pb-4">
                  <Separator className="mb-4" />
                  <div className="space-y-3">
                    {stageTasks.length > 0 ? (
                      stageTasks.map((task: any) => (
                        <div key={task.id} className="relative border rounded-md p-4 hover:bg-muted/30">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(task.status)}`}></div>
                          <div className="pl-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  checked={selectedTasks.includes(task.id)}
                                  onCheckedChange={() => handleTaskSelection(task.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1"
                                />
                                <div>
                                  <h4 className="font-medium">{task.name}</h4>
                                  <p className="text-sm text-muted-foreground">ID: {task.processId}</p>
                                </div>
                              </div>
                              <Badge variant={getStatusBadgeVariant(task.status)}>
                                {formatStatus(task.status)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium">{task.duration} minutes</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Expected Start</p>
                                <p className="font-medium">{task.expectedStart}</p>
                              </div>
                            </div>
                            
                            {task.dependencies && task.dependencies.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground mb-1">Dependencies</p>
                                <div className="flex flex-wrap gap-2">
                                  {task.dependencies.map((dep: any, index: number) => (
                                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                                      {getStatusIcon(dep.status)}
                                      <span>{dep.name}</span>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {task.documents && task.documents.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground mb-1">Documents</p>
                                <div className="flex flex-wrap gap-2">
                                  {task.documents.map((doc: any, index: number) => (
                                    <Button 
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFileClick({
                                        id: `file-${task.id}-${index}`,
                                        name: doc.name
                                      })}
                                      className="flex items-center"
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      {doc.name}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {task.messages && task.messages.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground mb-1">Messages</p>
                                <div className="space-y-2">
                                  {task.messages.map((message: string, index: number) => (
                                    <div key={index} className="bg-muted/50 p-2 rounded-md text-sm">
                                      {message}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-3 text-right text-xs text-muted-foreground">
                              Last updated by {task.updatedBy} at {task.updatedAt}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No tasks available for this stage
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  )};
  
  // Render the files tab content
  const renderFilesContent = () => (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">All Files</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowFileUpload(true)}
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Files</span>
        </Button>
      </div>

      {/* File Upload Dialog */}
      <FileUpload
        processId={workflow.id}
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onUploadComplete={handleFileUploadComplete}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTasks.flatMap((task: any) => 
          (task.documents || []).map((doc: any, index: number) => (
            <Card 
              key={`${task.id}-${index}`}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFileClick({
                id: `file-${task.id}-${index}`,
                name: doc.name
              })}
            >
              <div className="bg-muted/50 p-6 flex items-center justify-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardContent className="p-4">
                <h4 className="font-medium truncate">{doc.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">{doc.size}</span>
                  <Badge variant="outline">{doc.name.split('.').pop()?.toUpperCase()}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  From: {task.name}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
  
  // Render the config tab content
  const renderConfigContent = () => (
    <div className="pt-4">
      <Tabs value={configTab} onValueChange={setConfigTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="stageOverview">Stage Overview</TabsTrigger>
          <TabsTrigger value="appConfig">App Config</TabsTrigger>
          <TabsTrigger value="globalConfig">Global Config</TabsTrigger>
          <TabsTrigger value="processOverview">Process Overview</TabsTrigger>
          <TabsTrigger value="processConfig">Process Config</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stageOverview" className="mt-4">
          <StageOverview 
            stageId={workflow.id} 
            stageName={workflow.title} 
          />
        </TabsContent>
        
        <TabsContent value="appConfig" className="mt-4">
          <AppParameters 
            processId={workflow.id} 
            processName={workflow.title} 
          />
        </TabsContent>
        
        <TabsContent value="globalConfig" className="mt-4">
          <GlobalParameters 
            processId={workflow.id} 
            processName={workflow.title} 
          />
        </TabsContent>
        
        <TabsContent value="processOverview" className="mt-4">
          <ProcessOverview 
            processId={workflow.id} 
            processName={workflow.title} 
          />
        </TabsContent>
        
        <TabsContent value="processConfig" className="mt-4">
          <ProcessParameters 
            processId={workflow.id} 
            processName={workflow.title} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
  
  // Render the dependencies tab content
  const renderDependenciesContent = () => (
    <div className="pt-4">
      <ProcessDependencies 
        processId={workflow.id} 
        processName={workflow.title} 
        onDependencyClick={(dependency) => {
          console.log("Dependency clicked:", dependency);
        }}
      />
    </div>
  );
  
  const filterControls = (
    <WorkflowFilterPanel
      open={isFilterPanelOpen}
      onOpenChange={setIsFilterPanelOpen}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
    />
  );
  
  return (
    <div className="space-y-4">
      <WorkflowUnifiedHeader
        workflowId={hierarchyPath[hierarchyPath.length - 1]?.id || ''}
        workflowTitle={workflow.title}
        hierarchyPath={hierarchyPath}
        progress={progress}
        status="Active"
        isLocked={isLocked}
        onToggleLock={toggleLock}
        onRefresh={handleRefresh}
        taskCounts={taskCounts}
        lastRefreshed={lastRefreshed}
        viewMode={viewMode}
        onViewToggle={onViewToggle}
        autoRefreshEnabled={autoRefreshEnabled}
        onAutoRefreshToggle={setAutoRefreshEnabled}
        isRefreshing={isRefreshing}
        onBack={onBack}
        appGroupId={workflow.nodeData?.configId || workflow.applicationData?.configId}
        appId={workflow.nodeData?.appId || workflow.applicationData?.appId}
        date={selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
        filterControls={filterControls}
      />
      {showFilePreview && selectedFile ? (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">File Preview</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowFilePreview(false);
                setSelectedFile(null);
              }}
            >
              Close Preview
            </Button>
          </CardHeader>
          <CardContent>
            <AdvancedFilePreview 
              fileId={selectedFile.id || 'unknown'} 
              fileName={selectedFile.name || 'Unknown File'} 
              onClose={() => {
                setShowFilePreview(false);
                setSelectedFile(null);
              }} 
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="diagram" className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  <span>Step Function View</span>
                </TabsTrigger>
                <TabsTrigger value="stages" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Stages & Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Files</span>
                </TabsTrigger>
                <TabsTrigger value="config" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span>Configuration</span>
                </TabsTrigger>
                <TabsTrigger value="dependencies" className="flex items-center gap-1">
                  <Link className="h-4 w-4" />
                  <span>Dependencies</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0">
                {renderOverviewContent()}
              </TabsContent>
              
              <TabsContent value="diagram" className="mt-0">
                <div className="pt-4">
                  <WorkflowStepFunctionDiagram
                    workflowId={workflow.id || 'workflow-1'}
                    workflowTitle={workflow.title}
                    {...generateSampleWorkflowDiagram()}
                    onNodeClick={(nodeId) => {
                      console.log("Node clicked:", nodeId);
                      // If node is a stage or substage, we could navigate to it
                      if (nodeId.startsWith('stage-')) {
                        const stageId = nodeId.replace('stage-', '');
                        const stage = workflow.stages.find(s => s.id === stageId);
                        if (stage) {
                          setActiveTab('stages');
                          setExpandedStage(stageId);
                        }
                      } else if (nodeId.startsWith('substage-')) {
                        const substageId = nodeId.replace('substage-', '');
                        setActiveTab('stages');
                        // Find the stage containing this substage
                        workflow.stages.forEach(stage => {
                          const tasks = workflow.tasks[stage.id] || [];
                          const task = tasks.find(t => t.id === substageId);
                          if (task) {
                            setExpandedStage(stage.id);
                          }
                        });
                      }
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="stages" className="mt-0">
                {renderStagesContent()}
              </TabsContent>
              
              <TabsContent value="files" className="mt-0">
                {renderFilesContent()}
              </TabsContent>
              
              <TabsContent value="config" className="mt-0">
                {renderConfigContent()}
              </TabsContent>
              
              <TabsContent value="dependencies" className="mt-0">
                {renderDependenciesContent()}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default ModernWorkflowView;