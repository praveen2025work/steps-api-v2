import React, { useState } from 'react';
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
  PanelRightClose,
  Layers,
  Sparkles
} from 'lucide-react';
import WorkflowStepFunctionDiagram from './WorkflowStepFunctionDiagram';
import StageOverview from './StageOverview';
import AppParameters from './AppParameters';
import GlobalParameters from './GlobalParameters';
import ProcessOverview from './ProcessOverview';
import ProcessParameters from './ProcessParameters';
import ProcessDependencies from './ProcessDependencies';
import ProcessQueries from './ProcessQueries';
import AdvancedFilePreview from '../files/AdvancedFilePreview';

interface StepFunctionViewProps {
  workflow: any;
  onViewToggle?: (mode: 'classic' | 'modern' | 'step-function') => void;
  viewMode?: 'classic' | 'modern' | 'step-function';
}

const StepFunctionView: React.FC<StepFunctionViewProps> = ({ workflow, onViewToggle, viewMode }) => {
  const [activeTab, setActiveTab] = useState<string>("diagram");
  const [detailsTab, setDetailsTab] = useState<string>("stageOverview");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  
  // Generate diagram data directly from workflow prop to ensure it's dynamic
  const diagramData = (() => {
    const nodes: any[] = [];
    const edges: any[] = [];
    let yPos = 50;

    if (!workflow || !workflow.stages || !workflow.tasks) {
      console.log('[StepFunctionView] No workflow data available:', { workflow: !!workflow, stages: !!workflow?.stages, tasks: !!workflow?.tasks });
      return { nodes: [], edges: [] };
    }

    console.log('[StepFunctionView] Generating diagram data from workflow:', {
      stagesCount: workflow.stages.length,
      tasksKeys: Object.keys(workflow.tasks),
      totalTasks: Object.values(workflow.tasks).flat().length
    });

    workflow.stages.forEach((stage: any, stageIndex: number) => {
      const stageNodeId = `stage-${stage.id}`;
      const stageTasks = workflow.tasks[stage.id] || [];
      const stageHeight = stageTasks.length > 0 ? stageTasks.length * 130 + 60 : 150;

      // Create stage node with proper data structure for WorkflowStepFunctionDiagram
      nodes.push({
        id: stageNodeId,
        type: 'parallel', // Use 'parallel' type for stage containers
        label: stage.name,
        status: stageTasks.length > 0 ? 
          (stageTasks.every((t: any) => t.status === 'completed') ? 'completed' :
           stageTasks.some((t: any) => t.status === 'in_progress' || t.status === 'in-progress') ? 'in-progress' :
           stageTasks.some((t: any) => t.status === 'failed') ? 'failed' : 'pending') : 'pending',
        x: 25,
        y: yPos,
        width: 650,
        height: stageHeight,
        data: {
          label: stage.name,
          stageId: stage.id,
          totalSubtasks: stageTasks.length,
          progress: stageTasks.length > 0 ? 
            Math.round((stageTasks.filter((t: any) => t.status === 'completed').length / stageTasks.length) * 100) : 0,
          order: stageIndex + 1
        }
      });

      let taskY = yPos + 80;
      stageTasks.forEach((task: any, taskIndex: number) => {
        const taskNodeId = `substage-${task.id}`;
        
        // Create task node with proper data structure
        nodes.push({
          id: taskNodeId,
          type: 'task',
          label: task.name,
          status: task.status === 'in_progress' ? 'in-progress' : task.status,
          x: 50,
          y: taskY,
          width: 580,
          height: 100,
          data: {
            ...task,
            label: task.name,
            stageId: stage.id,
            stageName: stage.name,
            processId: task.processId,
            progress: task.status === 'completed' ? 100 : 
                     task.status === 'in_progress' || task.status === 'in-progress' ? 50 : 0
          }
        });

        // Connect tasks within the same stage
        if (taskIndex > 0) {
          const prevTaskNodeId = `substage-${stageTasks[taskIndex - 1].id}`;
          edges.push({
            id: `e-${prevTaskNodeId}-${taskNodeId}`,
            source: prevTaskNodeId,
            target: taskNodeId,
            type: 'default',
            label: undefined
          });
        }
        taskY += 130;
      });

      yPos += stageHeight + 50;
    });

    // Connect stages
    for (let i = 0; i < workflow.stages.length - 1; i++) {
      const sourceStage = workflow.stages[i];
      const targetStage = workflow.stages[i + 1];
      const sourceTasks = workflow.tasks[sourceStage.id] || [];
      const targetTasks = workflow.tasks[targetStage.id] || [];

      if (sourceTasks.length > 0 && targetTasks.length > 0) {
        const sourceTaskNodeId = `substage-${sourceTasks[sourceTasks.length - 1].id}`;
        const targetTaskNodeId = `substage-${targetTasks[0].id}`;
        edges.push({
          id: `e-stage-${sourceStage.id}-${targetStage.id}`,
          source: sourceTaskNodeId,
          target: targetTaskNodeId,
          type: 'default',
          label: `${sourceStage.name} → ${targetStage.name}`
        });
      }
    }

    console.log('[StepFunctionView] Generated diagram data:', {
      nodesCount: nodes.length,
      edgesCount: edges.length,
      nodeTypes: [...new Set(nodes.map(n => n.type))],
      firstNode: nodes[0]
    });

    return { nodes, edges };
  })();
  
  // Extract all tasks with enhanced API data support
  const allTasks = Object.values(workflow.tasks || {}).flat();
  
  // Calculate progress using enhanced data if available
  let progressPercentage = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  
  if (workflow.summaryData && workflow.summaryData.processData) {
    const processData = workflow.summaryData.processData;
    totalTasks = processData.length;
    completedTasks = processData.filter((p: any) => 
      p.status === 'COMPLETED' || p.status === 'completed'
    ).length;
    progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  } else {
    // Fallback to task-based calculation
    completedTasks = allTasks.filter((task: any) => task.status === 'completed').length;
    totalTasks = allTasks.length;
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
  
  // Handle node click with improved navigation
  const handleNodeClick = (nodeId: string) => {
    console.log("Node clicked:", nodeId);
    
    // Find the node data
    const node = diagramData.nodes.find(n => n.id === nodeId);
    setSelectedNode(node);
    
    // Show right panel with details
    setShowRightPanel(true);
    
    // If node is a stage or substage, we could navigate to it
    if (nodeId.startsWith('stage-')) {
      const stageId = nodeId.replace('stage-', '');
      const stage = workflow.stages.find((s: any) => s.id === stageId);
      if (stage) {
        console.log(`Navigate to stage: ${stage.name}`);
      }
    } else if (nodeId.startsWith('substage-')) {
      const substageId = nodeId.replace('substage-', '');
      // Find the stage containing this substage
      for (const stage of workflow.stages) {
        const stageTasks = workflow.tasks[stage.id] || [];
        const task = stageTasks.find((t: any) => t.id === substageId);
        if (task) {
          console.log(`Navigate to substage: ${task.name} in stage: ${stage.name}`);
          break;
        }
      }
    }
  };
  
  // Handle node action
  const handleNodeAction = (action: string, nodeData: any) => {
    console.log(`Action ${action} on node:`, nodeData);
    
    // In a real app, you would dispatch an action to update the workflow
    alert(`Action "${action}" performed on "${nodeData.label}"`);
  };
  
  // Handle file preview
  const handleFilePreview = (file: any) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };
  
  // Toggle panels
  const toggleLeftPanel = () => setShowLeftPanel(!showLeftPanel);
  const toggleRightPanel = () => setShowRightPanel(!showRightPanel);
  
  // Determine layout classes based on panel visibility
  const getLayoutClasses = () => {
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
  };
  
  const layoutClasses = getLayoutClasses();
  
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold flex items-center">
            <GitBranch className="h-5 w-5 mr-2 text-blue-600" />
            {workflow.title} - Step Function View
          </h1>
          {/* Enhanced progress indicator */}
          <div className="ml-4 text-sm text-muted-foreground">
            Progress: {progressPercentage}% ({completedTasks}/{totalTasks} tasks)
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View toggle icons */}
          <div className="bg-muted rounded-lg p-1 flex mr-2">
            <Button
              variant={viewMode === 'classic' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewToggle?.('classic')}
              title="Classic View"
              className="h-8 w-8"
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'modern' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewToggle?.('modern')}
              title="Modern View"
              className="h-8 w-8"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'step-function' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewToggle?.('step-function')}
              title="Step Function View"
              className="h-8 w-8"
            >
              <GitBranch className="h-4 w-4" />
            </Button>
          </div>
          {/* Enhanced status indicators */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{taskCounts.completed}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>{taskCounts.processing}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{taskCounts.failed}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>{taskCounts.pending}</span>
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
                  <h2 className="text-lg font-medium">{selectedFile.name}</h2>
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
                    fileId={selectedFile.id || 'unknown'} 
                    fileName={selectedFile.name || 'Unknown File'} 
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
                            <span className="font-medium">{totalTasks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Completed:</span>
                            <span className="font-medium text-green-600">{taskCounts.completed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Processing:</span>
                            <span className="font-medium text-blue-600">{taskCounts.processing}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failed:</span>
                            <span className="font-medium text-red-600">{taskCounts.failed}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {workflow.stages.flatMap((stage: any) => {
                          const stageTasks = workflow.tasks[stage.id] || [];
                          return stageTasks.map((task: any) => (
                            <div 
                              key={task.id}
                              className={`p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${
                                selectedNode && selectedNode.id === `substage-${task.id}` ? 'border-primary bg-primary/5' : ''
                              }`}
                              onClick={() => handleNodeClick(`substage-${task.id}`)}
                            >
                              <div className="flex items-center gap-2">
                                {task.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : task.status === 'in_progress' ? (
                                  <Clock className="h-4 w-4 text-blue-500" />
                                ) : task.status === 'failed' ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-500" />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{task.name}</div>
                                  <div className="text-xs text-muted-foreground">{stage.name}</div>
                                  {/* Enhanced task info */}
                                  {task.processId && (
                                    <div className="text-xs text-muted-foreground font-mono">{task.processId}</div>
                                  )}
                                  {task.updatedBy && (
                                    <div className="text-xs text-muted-foreground">By: {task.updatedBy}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ));
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Main Diagram Area */}
                <div className={`${layoutClasses.mainArea} h-full`}>
                  <WorkflowStepFunctionDiagram 
                    workflowId={workflow.id || 'workflow-1'}
                    workflowTitle={workflow.title}
                    nodes={diagramData.nodes}
                    edges={diagramData.edges}
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
                            <h2 className="text-lg font-medium">{selectedNode.label}</h2>
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
                          {selectedNode.data && (
                            <div className="mb-4 p-3 bg-muted/30 rounded-md">
                              <div className="text-sm space-y-1">
                                {selectedNode.data.processId && (
                                  <div className="flex justify-between">
                                    <span>Process ID:</span>
                                    <span className="font-mono text-xs">{selectedNode.data.processId}</span>
                                  </div>
                                )}
                                {selectedNode.data.status && (
                                  <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className={`font-medium ${
                                      selectedNode.data.status === 'completed' ? 'text-green-600' :
                                      selectedNode.data.status === 'in_progress' ? 'text-blue-600' :
                                      selectedNode.data.status === 'failed' ? 'text-red-600' :
                                      'text-amber-600'
                                    }`}>
                                      {selectedNode.data.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {selectedNode.data.updatedBy && (
                                  <div className="flex justify-between">
                                    <span>Updated By:</span>
                                    <span className="font-medium">{selectedNode.data.updatedBy}</span>
                                  </div>
                                )}
                                {selectedNode.data.updatedAt && (
                                  <div className="flex justify-between">
                                    <span>Updated At:</span>
                                    <span className="font-medium">{selectedNode.data.updatedAt}</span>
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
                          {selectedNode.data && selectedNode.data.documents && selectedNode.data.documents.length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-sm font-medium mb-2">Files ({selectedNode.data.documents.length})</h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedNode.data.documents.map((doc: any, index: number) => (
                                  <Button 
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFilePreview({
                                      id: `file-${selectedNode.id}-${index}`,
                                      name: doc.name
                                    })}
                                    className="flex items-center"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    <div className="text-left">
                                      <div className="text-xs">{doc.name}</div>
                                      {doc.size && <div className="text-xs text-muted-foreground">{doc.size}</div>}
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Enhanced messages display */}
                          {selectedNode.data && selectedNode.data.messages && selectedNode.data.messages.length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-sm font-medium mb-2">Messages</h3>
                              <div className="space-y-2">
                                {selectedNode.data.messages.map((message: string, index: number) => (
                                  <div key={index} className="bg-muted/50 p-2 rounded-md text-sm">
                                    {message}
                                  </div>
                                ))}
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
                                stageId={selectedNode.data?.stageId || workflow.id} 
                                stageName={selectedNode.data?.stageName || workflow.title} 
                              />
                            </TabsContent>
                            
                            <TabsContent value="processOverview" className="mt-4">
                              <ProcessOverview 
                                processId={selectedNode.data?.processId || workflow.id} 
                                processName={selectedNode.label || workflow.title} 
                              />
                            </TabsContent>
                            
                            <TabsContent value="dependencies" className="mt-4">
                              <ProcessDependencies 
                                processId={selectedNode.data?.processId || workflow.id} 
                                processName={selectedNode.label || workflow.title} 
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
                                <span className="font-medium">{totalTasks}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Progress:</span>
                                <span className="font-medium">{progressPercentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Completed:</span>
                                <span className="font-medium text-green-600">{taskCounts.completed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Processing:</span>
                                <span className="font-medium text-blue-600">{taskCounts.processing}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Failed:</span>
                                <span className="font-medium text-red-600">{taskCounts.failed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pending:</span>
                                <span className="font-medium text-amber-600">{taskCounts.pending}</span>
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

export default StepFunctionView;