import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Info, 
  HelpCircle, 
  GitBranch, 
  GitMerge, 
  Workflow, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Users, 
  RefreshCw,
  PanelLeft,
  PanelRight,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import WorkflowStepFunctionDiagram from './WorkflowStepFunctionDiagram';
import { convertWorkflowToDiagram } from '@/lib/workflowDiagramUtils';
import StageOverview from './StageOverview';
import AppParameters from './AppParameters';
import GlobalParameters from './GlobalParameters';
import ProcessOverview from './ProcessOverview';
import ProcessParameters from './ProcessParameters';
import ProcessDependencies from './ProcessDependencies';
import ProcessQueries from './ProcessQueries';
import AdvancedFilePreview from '../files/AdvancedFilePreview';

interface StepFunctionViewOptimizedProps {
  workflow: any;
  onBack: () => void;
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

const StepFunctionViewOptimized: React.FC<StepFunctionViewOptimizedProps> = ({ workflow, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>("diagram");
  const [detailsTab, setDetailsTab] = useState<string>("stageOverview");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  
  // Memoized calculations to prevent unnecessary re-renders
  const memoizedWorkflowData = useMemo(() => {
    try {
      // Enhanced workflow data processing
      const diagramData = convertWorkflowToDiagram(workflow);
      
      // Extract all tasks with enhanced API data support
      const tasks = safeGet(workflow, 'tasks', {});
      const allTasks = Object.values(tasks).flat();
      
      // Calculate progress using enhanced data if available
      let progressPercentage = 0;
      let totalTasks = 0;
      let completedTasks = 0;
      
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
      
      // Enhanced task counts from API data if available
      let taskCounts = {
        completed: completedTasks,
        failed: 0,
        rejected: 0,
        pending: totalTasks - completedTasks,
        processing: 0
      };
      
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
      
      return {
        diagramData,
        allTasks: Array.isArray(allTasks) ? allTasks : [],
        progressPercentage,
        totalTasks,
        completedTasks,
        taskCounts
      };
    } catch (error) {
      console.warn('Error processing workflow data:', error);
      return {
        diagramData: { nodes: [], edges: [] },
        allTasks: [],
        progressPercentage: 0,
        totalTasks: 0,
        completedTasks: 0,
        taskCounts: { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 }
      };
    }
  }, [workflow]);
  
  // Handle node click with improved navigation and error handling
  const handleNodeClick = useCallback((nodeId: string) => {
    try {
      console.log("Node clicked:", nodeId);
      
      // Find the node data safely
      const node = memoizedWorkflowData.diagramData.nodes.find(n => safeGet(n, 'id', '') === nodeId);
      setSelectedNode(node);
      
      // Show right panel with details
      setShowRightPanel(true);
      
      // If node is a stage or substage, we could navigate to it
      if (nodeId.startsWith('stage-')) {
        const stageId = nodeId.replace('stage-', '');
        const stages = safeGet(workflow, 'stages', []);
        const stage = Array.isArray(stages) ? stages.find((s: any) => safeGet(s, 'id', '') === stageId) : null;
        if (stage) {
          console.log(`Navigate to stage: ${safeToString(safeGet(stage, 'name', ''), 'Unknown Stage')}`);
        }
      } else if (nodeId.startsWith('substage-')) {
        const substageId = nodeId.replace('substage-', '');
        // Find the stage containing this substage
        const stages = safeGet(workflow, 'stages', []);
        const tasks = safeGet(workflow, 'tasks', {});
        
        if (Array.isArray(stages)) {
          for (const stage of stages) {
            const stageId = safeGet(stage, 'id', '');
            const stageTasks = Array.isArray(tasks[stageId]) ? tasks[stageId] : [];
            const task = stageTasks.find((t: any) => safeGet(t, 'id', '') === substageId);
            if (task) {
              console.log(`Navigate to substage: ${safeToString(safeGet(task, 'name', ''), 'Unknown Task')} in stage: ${safeToString(safeGet(stage, 'name', ''), 'Unknown Stage')}`);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error handling node click:', error);
    }
  }, [memoizedWorkflowData.diagramData.nodes, workflow]);
  
  // Handle node action with error handling
  const handleNodeAction = useCallback((action: string, nodeData: any) => {
    try {
      console.log(`Action ${action} on node:`, nodeData);
      
      // In a real app, you would dispatch an action to update the workflow
      const nodeLabel = safeToString(safeGet(nodeData, 'label', ''), 'Unknown Node');
      alert(`Action "${action}" performed on "${nodeLabel}"`);
    } catch (error) {
      console.warn('Error handling node action:', error);
    }
  }, []);
  
  // Handle file preview with error handling
  const handleFilePreview = useCallback((file: any) => {
    try {
      setSelectedFile(file);
      setShowFilePreview(true);
    } catch (error) {
      console.warn('Error handling file preview:', error);
    }
  }, []);
  
  // Toggle panels with error handling
  const toggleLeftPanel = useCallback(() => {
    try {
      setShowLeftPanel(!showLeftPanel);
    } catch (error) {
      console.warn('Error toggling left panel:', error);
    }
  }, [showLeftPanel]);
  
  const toggleRightPanel = useCallback(() => {
    try {
      setShowRightPanel(!showRightPanel);
    } catch (error) {
      console.warn('Error toggling right panel:', error);
    }
  }, [showRightPanel]);
  
  // Determine layout classes based on panel visibility
  const getLayoutClasses = useCallback(() => {
    if (showLeftPanel && showRightPanel) {
      return {
        container: "grid grid-cols-12 gap-4",
        leftPanel: "col-span-3",
        mainArea: "col-span-6",
        rightPanel: "col-span-3"
      };
    } else if (showLeftPanel) {
      return {
        container: "grid grid-cols-12 gap-4",
        leftPanel: "col-span-3",
        mainArea: "col-span-9",
        rightPanel: "hidden"
      };
    } else if (showRightPanel) {
      return {
        container: "grid grid-cols-12 gap-4",
        leftPanel: "hidden",
        mainArea: "col-span-9",
        rightPanel: "col-span-3"
      };
    } else {
      return {
        container: "grid grid-cols-1 gap-4",
        leftPanel: "hidden",
        mainArea: "col-span-1",
        rightPanel: "hidden"
      };
    }
  }, [showLeftPanel, showRightPanel]);
  
  const layoutClasses = getLayoutClasses();
  
  // Safe workflow data access
  const workflowTitle = safeToString(safeGet(workflow, 'title', ''), 'Unknown Workflow');
  const workflowId = safeToString(safeGet(workflow, 'id', ''), 'workflow-1');
  const stages = safeGet(workflow, 'stages', []);
  const tasks = safeGet(workflow, 'tasks', {});
  
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-semibold flex items-center">
            <GitBranch className="h-5 w-5 mr-2 text-blue-600" />
            {workflowTitle} - Step Function View
          </h1>
          {/* Enhanced progress indicator */}
          <div className="ml-4 text-sm text-muted-foreground">
            Progress: {memoizedWorkflowData.progressPercentage}% ({memoizedWorkflowData.completedTasks}/{memoizedWorkflowData.totalTasks} tasks)
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Enhanced status indicators */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{memoizedWorkflowData.taskCounts.completed}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>{memoizedWorkflowData.taskCounts.processing}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{memoizedWorkflowData.taskCounts.failed}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>{memoizedWorkflowData.taskCounts.pending}</span>
            </div>
          </div>
          
          {/* Panel toggles */}
          <div className="flex items-center gap-2">
            <Button 
              variant={showLeftPanel ? "default" : "outline"} 
              size="icon"
              onClick={toggleLeftPanel}
              title={showLeftPanel ? "Hide left panel" : "Show left panel"}
              className="h-8 w-8"
            >
              {showLeftPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
            <Button 
              variant={showRightPanel ? "default" : "outline"} 
              size="icon"
              onClick={toggleRightPanel}
              title={showRightPanel ? "Hide right panel" : "Show right panel"}
              className="h-8 w-8"
            >
              {showRightPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="diagram" className="flex items-center gap-1">
              <Workflow className="h-4 w-4" />
              Workflow Diagram
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              Help
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="diagram" className="flex-1 p-0 m-0">
          <div className="h-full">
            {showFilePreview && selectedFile ? (
              <div className="h-full p-4">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-medium">{safeToString(safeGet(selectedFile, 'name', ''), 'Unknown File')}</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowFilePreview(false);
                      setSelectedFile(null);
                    }}
                  >
                    Close Preview
                  </Button>
                </div>
                <div className="border rounded-md h-[calc(100%-60px)]">
                  <AdvancedFilePreview 
                    fileId={safeGet(selectedFile, 'id', 'unknown')} 
                    fileName={safeToString(safeGet(selectedFile, 'name', ''), 'Unknown File')} 
                    onClose={() => {
                      setShowFilePreview(false);
                      setSelectedFile(null);
                    }} 
                  />
                </div>
              </div>
            ) : (
              <div className={`${layoutClasses.container} h-full`}>
                {/* Left Panel - Enhanced Process List */}
                {showLeftPanel && (
                  <div className={`${layoutClasses.leftPanel} border-r h-full overflow-auto`}>
                    <div className="p-4">
                      <h2 className="text-lg font-medium mb-4">Process List</h2>
                      
                      {/* Enhanced summary stats */}
                      <div className="mb-4 p-3 bg-muted/30 rounded-md">
                        <div className="text-sm font-medium mb-2">Summary</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span className="font-medium">{memoizedWorkflowData.totalTasks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Completed:</span>
                            <span className="font-medium text-green-600">{memoizedWorkflowData.taskCounts.completed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Processing:</span>
                            <span className="font-medium text-blue-600">{memoizedWorkflowData.taskCounts.processing}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failed:</span>
                            <span className="font-medium text-red-600">{memoizedWorkflowData.taskCounts.failed}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {Array.isArray(stages) && stages.flatMap((stage: any) => {
                          try {
                            const stageId = safeGet(stage, 'id', '');
                            const stageName = safeToString(safeGet(stage, 'name', ''), 'Unknown Stage');
                            const stageTasks = Array.isArray(tasks[stageId]) ? tasks[stageId] : [];
                            
                            return stageTasks.map((task: any, taskIndex: number) => {
                              try {
                                const taskId = safeGet(task, 'id', `task-${taskIndex}`);
                                const taskName = safeToString(safeGet(task, 'name', ''), 'Unknown Task');
                                const taskStatus = safeGet(task, 'status', 'pending');
                                const processId = safeToString(safeGet(task, 'processId', ''), '');
                                const updatedBy = safeToString(safeGet(task, 'updatedBy', ''), '');
                                
                                return (
                                  <div 
                                    key={taskId}
                                    className={`p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${
                                      selectedNode && safeGet(selectedNode, 'id', '') === `substage-${taskId}` ? 'border-primary bg-primary/5' : ''
                                    }`}
                                    onClick={() => handleNodeClick(`substage-${taskId}`)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {taskStatus === 'completed' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : taskStatus === 'in_progress' || taskStatus === 'in-progress' ? (
                                        <Clock className="h-4 w-4 text-blue-500" />
                                      ) : taskStatus === 'failed' ? (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <Clock className="h-4 w-4 text-amber-500" />
                                      )}
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{taskName}</div>
                                        <div className="text-xs text-muted-foreground">{stageName}</div>
                                        {/* Enhanced task info */}
                                        {processId && (
                                          <div className="text-xs text-muted-foreground font-mono">{processId}</div>
                                        )}
                                        {updatedBy && (
                                          <div className="text-xs text-muted-foreground">By: {updatedBy}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              } catch (error) {
                                console.warn('Error rendering task in left panel:', error);
                                return null;
                              }
                            });
                          } catch (error) {
                            console.warn('Error processing stage in left panel:', error);
                            return [];
                          }
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Main Diagram Area */}
                <div className={`${layoutClasses.mainArea} h-full`}>
                  <WorkflowStepFunctionDiagram 
                    workflowId={workflowId}
                    workflowTitle={workflowTitle}
                    nodes={memoizedWorkflowData.diagramData.nodes}
                    edges={memoizedWorkflowData.diagramData.edges}
                    onNodeClick={handleNodeClick}
                  />
                </div>
                
                {/* Right Panel - Enhanced Node Details */}
                {showRightPanel && (
                  <div className={`${layoutClasses.rightPanel} border-l h-full overflow-auto`}>
                    <div className="p-4">
                      {selectedNode ? (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium">{safeToString(safeGet(selectedNode, 'label', ''), 'Unknown Node')}</h2>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedNode(null)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                          
                          {/* Enhanced node info */}
                          {safeGet(selectedNode, 'data', null) && (
                            <div className="mb-4 p-3 bg-muted/30 rounded-md">
                              <div className="text-sm space-y-1">
                                {safeGet(selectedNode, 'data.processId', null) && (
                                  <div className="flex justify-between">
                                    <span>Process ID:</span>
                                    <span className="font-mono text-xs">{safeToString(safeGet(selectedNode, 'data.processId', ''), '')}</span>
                                  </div>
                                )}
                                {safeGet(selectedNode, 'data.status', null) && (
                                  <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className={`font-medium ${
                                      safeGet(selectedNode, 'data.status', '') === 'completed' ? 'text-green-600' :
                                      safeGet(selectedNode, 'data.status', '') === 'in_progress' ? 'text-blue-600' :
                                      safeGet(selectedNode, 'data.status', '') === 'failed' ? 'text-red-600' :
                                      'text-amber-600'
                                    }`}>
                                      {safeToString(safeGet(selectedNode, 'data.status', ''), '').replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {safeGet(selectedNode, 'data.updatedBy', null) && (
                                  <div className="flex justify-between">
                                    <span>Updated By:</span>
                                    <span className="font-medium">{safeToString(safeGet(selectedNode, 'data.updatedBy', ''), '')}</span>
                                  </div>
                                )}
                                {safeGet(selectedNode, 'data.updatedAt', null) && (
                                  <div className="flex justify-between">
                                    <span>Updated At:</span>
                                    <span className="font-medium">{safeToString(safeGet(selectedNode, 'data.updatedAt', ''), '')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Node Actions */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleNodeAction('approve', selectedNode)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleNodeAction('reject', selectedNode)}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleNodeAction('message', selectedNode)}
                              className="flex items-center gap-1"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Message
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleNodeAction('assign', selectedNode)}
                              className="flex items-center gap-1"
                            >
                              <Users className="h-4 w-4" />
                              Assign
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleNodeAction('refresh', selectedNode)}
                              className="flex items-center gap-1"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Refresh
                            </Button>
                          </div>
                          
                          {/* Node Files */}
                          {safeGet(selectedNode, 'data.documents', null) && Array.isArray(safeGet(selectedNode, 'data.documents', [])) && safeGet(selectedNode, 'data.documents', []).length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-sm font-medium mb-2">Files ({safeGet(selectedNode, 'data.documents', []).length})</h3>
                              <div className="flex flex-wrap gap-2">
                                {safeGet(selectedNode, 'data.documents', []).map((doc: any, index: number) => {
                                  try {
                                    const docName = safeToString(safeGet(doc, 'name', ''), 'Unknown File');
                                    const docSize = safeToString(safeGet(doc, 'size', ''), '');
                                    
                                    return (
                                      <Button 
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFilePreview({
                                          id: `file-${safeGet(selectedNode, 'id', '')}-${index}`,
                                          name: docName
                                        })}
                                        className="flex items-center"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        <div className="text-left">
                                          <div className="text-xs">{docName}</div>
                                          {docSize && <div className="text-xs text-muted-foreground">{docSize}</div>}
                                        </div>
                                      </Button>
                                    );
                                  } catch (error) {
                                    console.warn('Error rendering file button:', error);
                                    return null;
                                  }
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Enhanced messages display */}
                          {safeGet(selectedNode, 'data.messages', null) && Array.isArray(safeGet(selectedNode, 'data.messages', [])) && safeGet(selectedNode, 'data.messages', []).length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-sm font-medium mb-2">Messages</h3>
                              <div className="space-y-2">
                                {safeGet(selectedNode, 'data.messages', []).map((message: string, index: number) => {
                                  try {
                                    return (
                                      <div key={index} className="bg-muted/50 p-2 rounded-md text-sm">
                                        {safeToString(message, 'No message')}
                                      </div>
                                    );
                                  } catch (error) {
                                    console.warn('Error rendering message:', error);
                                    return null;
                                  }
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Node Details Tabs */}
                          <Tabs value={detailsTab} onValueChange={setDetailsTab} className="w-full">
                            <TabsList className="w-full justify-start overflow-x-auto">
                              <TabsTrigger value="stageOverview">Stage Overview</TabsTrigger>
                              <TabsTrigger value="processOverview">Process Overview</TabsTrigger>
                              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="stageOverview" className="mt-4">
                              <StageOverview 
                                stageId={safeGet(selectedNode, 'data.stageId', workflowId)} 
                                stageName={safeToString(safeGet(selectedNode, 'data.stageName', ''), workflowTitle)} 
                              />
                            </TabsContent>
                            
                            <TabsContent value="processOverview" className="mt-4">
                              <ProcessOverview 
                                processId={safeGet(selectedNode, 'data.processId', workflowId)} 
                                processName={safeToString(safeGet(selectedNode, 'label', ''), workflowTitle)} 
                              />
                            </TabsContent>
                            
                            <TabsContent value="dependencies" className="mt-4">
                              <ProcessDependencies 
                                processId={safeGet(selectedNode, 'data.processId', workflowId)} 
                                processName={safeToString(safeGet(selectedNode, 'label', ''), workflowTitle)} 
                                onDependencyClick={(dependency) => {
                                  console.log("Dependency clicked:", dependency);
                                }}
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">No Node Selected</h3>
                          <p className="text-sm">Click on a node in the diagram to view its details</p>
                          
                          {/* Enhanced summary when no node selected */}
                          <div className="mt-6 p-4 bg-muted/30 rounded-md text-left">
                            <h4 className="font-medium mb-2">Workflow Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Total Tasks:</span>
                                <span className="font-medium">{memoizedWorkflowData.totalTasks}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Progress:</span>
                                <span className="font-medium">{memoizedWorkflowData.progressPercentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Completed:</span>
                                <span className="font-medium text-green-600">{memoizedWorkflowData.taskCounts.completed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Processing:</span>
                                <span className="font-medium text-blue-600">{memoizedWorkflowData.taskCounts.processing}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Failed:</span>
                                <span className="font-medium text-red-600">{memoizedWorkflowData.taskCounts.failed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pending:</span>
                                <span className="font-medium text-amber-600">{memoizedWorkflowData.taskCounts.pending}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="help" className="p-4 overflow-auto">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Step Function Diagram Help
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-2">Navigation</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Pan:</strong> Click and drag to move around the diagram</li>
                  <li><strong>Zoom:</strong> Use the zoom controls or Ctrl + mouse wheel to zoom in/out</li>
                  <li><strong>Reset View:</strong> Click the reset button or press Ctrl+0 to reset the view</li>
                  <li><strong>Fullscreen:</strong> Toggle fullscreen mode with the expand button or press Ctrl+F</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Node Types</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-blue-500 flex items-center justify-center">
                      <Workflow className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>Task Node - A single process or action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-blue-500 border-dashed flex items-center justify-center">
                      <GitMerge className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>Stage Node - Contains multiple tasks</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Status Colors</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span>Failed</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Interactions</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Click on a node:</strong> View detailed information about that stage or task</li>
                  <li><strong>Search:</strong> Use the search box to find specific nodes by name or ID</li>
                  <li><strong>Minimap:</strong> Use the minimap to quickly navigate to different parts of the diagram</li>
                  <li><strong>Actions:</strong> Perform actions like approve, reject, or add messages to tasks</li>
                  <li><strong>File Preview:</strong> View files associated with tasks</li>
                  <li><strong>Panels:</strong> Toggle left and right panels for additional information and controls</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StepFunctionViewOptimized;