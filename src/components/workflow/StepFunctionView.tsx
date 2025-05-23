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
  LayoutGrid
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

interface StepFunctionViewProps {
  workflow: any;
  onBack: () => void;
}

const StepFunctionView: React.FC<StepFunctionViewProps> = ({ workflow, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>("diagram");
  const [detailsTab, setDetailsTab] = useState<string>("stageOverview");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  // No visualization type needed as we only have one view now
  
  const diagramData = convertWorkflowToDiagram(workflow);
  
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
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-semibold flex items-center">
            <GitBranch className="h-5 w-5 mr-2 text-blue-600" />
            {workflow.title} - Step Function View
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
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
                {/* Left Panel - Process List */}
                {showLeftPanel && (
                  <div className={`${layoutClasses.leftPanel} border-r h-full overflow-auto`}>
                    <div className="p-4">
                      <h2 className="text-lg font-medium mb-4">Process List</h2>
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
                                <div>
                                  <div className="font-medium text-sm">{task.name}</div>
                                  <div className="text-xs text-muted-foreground">{stage.name}</div>
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
                
                {/* Right Panel - Node Details */}
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
                              <h3 className="text-sm font-medium mb-2">Files</h3>
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
                                    {doc.name}
                                  </Button>
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