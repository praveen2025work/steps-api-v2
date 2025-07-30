import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { 
  FileText, 
  ArrowLeft,
  RefreshCw,
  Clock,
  Calendar,
  User,
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
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Link,
  ExternalLink,
  Upload,
  UserCheck,
  Sparkles,
  GitBranch
} from "lucide-react";

interface ModernWorkflowViewOptimizedProps {
  workflow: any;
  onBack?: () => void;
  onViewToggle?: () => void;
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

const ModernWorkflowViewOptimized: React.FC<ModernWorkflowViewOptimizedProps> = ({
  workflow,
  onBack,
  onViewToggle
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [configTab, setConfigTab] = useState("stageOverview");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectAllTasks, setSelectAllTasks] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // Memoized calculations to prevent unnecessary re-renders
  const memoizedTaskData = useMemo(() => {
    try {
      // Extract tasks from workflow data with enhanced API data support
      const tasks = safeGet(workflow, 'tasks', {});
      const allTasks = Object.values(tasks).flat();
      
      // Calculate overall progress using enhanced data if available
      let progressPercentage = 0;
      let completedTasks = 0;
      let totalTasks = 0;
      
      // First priority: Use summaryData from API if available
      const summaryData = safeGet(workflow, 'summaryData', null);
      const processData = safeGet(summaryData, 'processData', []);
      
      if (Array.isArray(processData) && processData.length > 0) {
        totalTasks = processData.length;
        completedTasks = processData.filter((p: any) => {
          const status = safeToString(safeGet(p, 'status', ''), '').toLowerCase();
          return status === 'completed';
        }).length;
        progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      } else {
        // Fallback to task-based calculation
        completedTasks = Array.isArray(allTasks) ? allTasks.filter((task: any) => safeGet(task, 'status', '') === 'completed').length : 0;
        totalTasks = Array.isArray(allTasks) ? allTasks.length : 0;
        progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      }
      
      return {
        allTasks: Array.isArray(allTasks) ? allTasks : [],
        progressPercentage,
        completedTasks,
        totalTasks
      };
    } catch (error) {
      console.warn('Error calculating task data:', error);
      return {
        allTasks: [],
        progressPercentage: 0,
        completedTasks: 0,
        totalTasks: 0
      };
    }
  }, [workflow]);

  const memoizedTaskCounts = useMemo(() => {
    try {
      // Enhanced task counts from API data if available
      let taskCounts = {
        completed: memoizedTaskData.completedTasks,
        failed: 0,
        rejected: 0,
        pending: memoizedTaskData.totalTasks - memoizedTaskData.completedTasks,
        processing: 0
      };
      
      const summaryData = safeGet(workflow, 'summaryData', null);
      const processData = safeGet(summaryData, 'processData', []);
      
      if (Array.isArray(processData) && processData.length > 0) {
        taskCounts = {
          completed: 0,
          failed: 0,
          rejected: 0,
          pending: 0,
          processing: 0
        };
        
        processData.forEach((process: any) => {
          const status = safeToString(safeGet(process, 'status', ''), '').toLowerCase();
          if (status === 'completed') taskCounts.completed++;
          else if (status === 'failed') taskCounts.failed++;
          else if (status === 'rejected') taskCounts.rejected++;
          else if (status === 'in_progress' || status === 'in-progress' || status === 'running') taskCounts.processing++;
          else taskCounts.pending++;
        });
      }
      
      return taskCounts;
    } catch (error) {
      console.warn('Error calculating task counts:', error);
      return {
        completed: 0,
        failed: 0,
        rejected: 0,
        pending: 0,
        processing: 0
      };
    }
  }, [workflow, memoizedTaskData]);
  
  // Handle file click with error handling
  const handleFileClick = useCallback((file: any) => {
    try {
      setSelectedFile(file);
      setShowFilePreview(true);
    } catch (error) {
      console.warn('Error handling file click:', error);
    }
  }, []);
  
  // Toggle stage expansion with error handling
  const toggleStage = useCallback((stageId: string) => {
    try {
      if (expandedStage === stageId) {
        setExpandedStage(null);
      } else {
        setExpandedStage(stageId);
      }
    } catch (error) {
      console.warn('Error toggling stage:', error);
    }
  }, [expandedStage]);
  
  // Get status color with safe access
  const getStatusColor = useCallback((status: string) => {
    const safeStatus = safeToString(status, '').toLowerCase();
    switch (safeStatus) {
      case 'completed':
        return "bg-green-500";
      case 'in_progress':
      case 'in-progress':
        return "bg-blue-500";
      case 'pending':
        return "bg-amber-500";
      case 'failed':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }, []);
  
  // Get status badge variant with safe access
  const getStatusBadgeVariant = useCallback((status: string): "default" | "secondary" | "destructive" | "outline" => {
    const safeStatus = safeToString(status, '').toLowerCase();
    switch (safeStatus) {
      case 'completed':
        return "outline";
      case 'in_progress':
      case 'in-progress':
        return "default";
      case 'pending':
        return "secondary";
      case 'failed':
        return "destructive";
      default:
        return "outline";
    }
  }, []);
  
  // Get status icon with safe access
  const getStatusIcon = useCallback((status: string) => {
    const safeStatus = safeToString(status, '').toLowerCase();
    switch (safeStatus) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  }, []);
  
  // Format status text with safe access
  const formatStatus = useCallback((status: string) => {
    const safeStatus = safeToString(status, '');
    return safeStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, []);
  
  // Render the overview tab content with enhanced API data and error handling
  const renderOverviewContent = useCallback(() => {
    try {
      const stages = safeGet(workflow, 'stages', []);
      const tasks = safeGet(workflow, 'tasks', {});
      
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
                      <p className="text-2xl font-bold">{Array.isArray(stages) ? stages.length : 0}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</h4>
                      <p className="text-2xl font-bold">{memoizedTaskData.totalTasks}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Completed</h4>
                      <p className="text-2xl font-bold text-green-600">{memoizedTaskCounts.completed}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Processing</h4>
                      <p className="text-2xl font-bold text-blue-600">{memoizedTaskCounts.processing}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Failed</h4>
                      <p className="text-2xl font-bold text-red-600">{memoizedTaskCounts.failed}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Pending</h4>
                      <p className="text-2xl font-bold text-amber-600">{memoizedTaskCounts.pending}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Stage Progress</h4>
                    <div className="space-y-3">
                      {Array.isArray(stages) && stages.map((stage: any) => {
                        try {
                          // Calculate stage progress safely
                          const stageId = safeGet(stage, 'id', '');
                          const stageTasks = Array.isArray(tasks[stageId]) ? tasks[stageId] : [];
                          const stageCompletedTasks = stageTasks.filter((task: any) => safeGet(task, 'status', '') === 'completed').length;
                          const stageProgress = stageTasks.length > 0 
                            ? Math.round((stageCompletedTasks / stageTasks.length) * 100) 
                            : 0;
                          
                          return (
                            <div key={stageId} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">{safeToString(safeGet(stage, 'name', ''), 'Unknown Stage')}</span>
                                <span className="text-sm font-medium">{stageProgress}%</span>
                              </div>
                              <Progress value={stageProgress} className="h-2" />
                            </div>
                          );
                        } catch (error) {
                          console.warn('Error rendering stage progress:', error);
                          return null;
                        }
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
                  {memoizedTaskData.allTasks.slice(0, 3).map((task: any, index: number) => {
                    try {
                      const taskId = safeGet(task, 'id', `task-${index}`);
                      const taskName = safeToString(safeGet(task, 'name', ''), 'Unknown Task');
                      const taskStatus = safeGet(task, 'status', 'pending');
                      const updatedBy = safeToString(safeGet(task, 'updatedBy', ''), 'System');
                      const updatedAt = safeToString(safeGet(task, 'updatedAt', ''), 'Unknown');
                      const messages = safeGet(task, 'messages', []);
                      
                      return (
                        <div key={taskId} className="flex items-start gap-3 p-3 rounded-md border">
                          <div className={`p-2 rounded-full ${
                            taskStatus === 'completed' ? 'bg-green-100 text-green-600' :
                            taskStatus === 'in_progress' || taskStatus === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                            taskStatus === 'failed' ? 'bg-red-100 text-red-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {getStatusIcon(taskStatus)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{taskName}</h4>
                              <Badge variant={getStatusBadgeVariant(taskStatus)}>
                                {formatStatus(taskStatus)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {updatedBy} - {updatedAt}
                            </p>
                            {Array.isArray(messages) && messages.length > 0 && (
                              <p className="text-sm mt-2 bg-muted/50 p-2 rounded-md">
                                {safeToString(messages[0], 'No message')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.warn('Error rendering recent activity item:', error);
                      return null;
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Workflow
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Assign to Team
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Flag as Priority
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={onViewToggle}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Classic View
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {memoizedTaskData.allTasks.flatMap((task: any, taskIndex: number) => {
                    try {
                      const documents = safeGet(task, 'documents', []);
                      const taskId = safeGet(task, 'id', `task-${taskIndex}`);
                      
                      return Array.isArray(documents) ? documents.map((doc: any, docIndex: number) => {
                        try {
                          const docName = safeToString(safeGet(doc, 'name', ''), 'Unknown File');
                          const docSize = safeToString(safeGet(doc, 'size', ''), 'Unknown Size');
                          
                          return (
                            <Button 
                              key={`${taskId}-${docIndex}`}
                              variant="ghost" 
                              className="w-full justify-start"
                              onClick={() => handleFileClick({
                                id: `file-${taskId}-${docIndex}`,
                                name: docName
                              })}
                            >
                              <Paperclip className="h-4 w-4 mr-2" />
                              <div className="flex justify-between items-center w-full">
                                <span className="truncate">{docName}</span>
                                <span className="text-xs text-muted-foreground">{docSize}</span>
                              </div>
                            </Button>
                          );
                        } catch (error) {
                          console.warn('Error rendering file item:', error);
                          return null;
                        }
                      }) : [];
                    } catch (error) {
                      console.warn('Error processing task documents:', error);
                      return [];
                    }
                  }).filter(Boolean).slice(0, 5)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    } catch (error) {
      console.warn('Error rendering overview content:', error);
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Error loading overview content</p>
        </div>
      );
    }
  }, [workflow, memoizedTaskData, memoizedTaskCounts, getStatusIcon, getStatusBadgeVariant, formatStatus, handleFileClick, onViewToggle]);

  // Handle task selection with error handling
  const handleTaskSelection = useCallback((taskId: string) => {
    try {
      setSelectedTasks(prev => 
        prev.includes(taskId)
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      );
    } catch (error) {
      console.warn('Error handling task selection:', error);
    }
  }, []);

  // Handle select all tasks with error handling
  const handleSelectAllTasks = useCallback(() => {
    try {
      if (selectAllTasks) {
        setSelectedTasks([]);
      } else {
        setSelectedTasks(memoizedTaskData.allTasks.map((task: any) => safeGet(task, 'id', '')).filter(Boolean));
      }
      setSelectAllTasks(!selectAllTasks);
    } catch (error) {
      console.warn('Error handling select all tasks:', error);
    }
  }, [selectAllTasks, memoizedTaskData.allTasks]);

  // Update selectAll state when individual selections change
  useEffect(() => {
    try {
      if (memoizedTaskData.allTasks.length > 0 && selectedTasks.length === memoizedTaskData.allTasks.length) {
        setSelectAllTasks(true);
      } else {
        setSelectAllTasks(false);
      }
    } catch (error) {
      console.warn('Error updating select all state:', error);
    }
  }, [selectedTasks, memoizedTaskData.allTasks]);

  // Handle file upload with error handling
  const handleFileUploadComplete = useCallback(() => {
    try {
      setShowFileUpload(false);
      // In a real app, you would refresh the file list here
    } catch (error) {
      console.warn('Error handling file upload complete:', error);
    }
  }, []);

  // Safe workflow data access
  const workflowTitle = safeToString(safeGet(workflow, 'title', ''), 'Unknown Workflow');
  const workflowId = safeToString(safeGet(workflow, 'id', ''), 'workflow-1');
  const progressSteps = safeGet(workflow, 'progressSteps', []);
  
  return (
    <div className="space-y-4">
      {/* Compact header with workflow info and key stats */}
      <Card>
        <CardHeader className="pb-2 pt-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onBack}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{workflowTitle}</CardTitle>
                  <Badge variant="outline" className="ml-auto">
                    {memoizedTaskData.progressPercentage === 100 ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle icons */}
              <div className="bg-muted rounded-lg p-1 flex mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onViewToggle}
                  title="Classic View"
                  className="h-8 w-8"
                >
                  <Layers className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  title="Modern View"
                  className="h-8 w-8"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button variant="default" size="sm">
                Actions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-2">
          {/* Progress Steps - Horizontal scrollable bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {Array.isArray(progressSteps) && progressSteps.map((step: any, index: number) => {
              try {
                const stepName = safeToString(safeGet(step, 'name', ''), `Step ${index + 1}`);
                const stepProgress = safeGet(step, 'progress', 0);
                
                return (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    <div className="flex items-center gap-1 bg-muted/40 px-3 py-1 rounded-md">
                      <span className="text-sm whitespace-nowrap">{stepName}</span>
                      <Badge variant="outline" className="ml-1 text-xs">
                        {stepProgress}%
                      </Badge>
                    </div>
                  </React.Fragment>
                );
              } catch (error) {
                console.warn('Error rendering progress step:', error);
                return null;
              }
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Main content with tabs */}
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
              fileId={safeGet(selectedFile, 'id', 'unknown')} 
              fileName={safeToString(safeGet(selectedFile, 'name', ''), 'Unknown File')} 
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
              </TabsList>
              
              <TabsContent value="overview" className="mt-0">
                {renderOverviewContent()}
              </TabsContent>
              
              <TabsContent value="diagram" className="mt-0">
                <div className="pt-4">
                  <WorkflowStepFunctionDiagram
                    workflowId={workflowId}
                    workflowTitle={workflowTitle}
                    {...generateSampleWorkflowDiagram()}
                    onNodeClick={(nodeId) => {
                      console.log("Node clicked:", nodeId);
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default ModernWorkflowViewOptimized;