import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
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
} from 'lucide-react';
import WorkflowUnifiedHeader from './WorkflowUnifiedHeader';
import { useDate } from '@/contexts/DateContext';
import { transformWorkflowToFlowDiagramData } from '@/lib/workflowDiagramUtils';
import WorkflowFlowDiagram from './WorkflowFlowDiagram';
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
  onRefresh?: () => void;
  onBack?: () => void;
}

const StepFunctionView: React.FC<StepFunctionViewProps> = ({
  workflow,
  onViewToggle,
  viewMode,
  onRefresh,
  onBack,
}) => {
  const { selectedDate } = useDate();
  const [activeTab, setActiveTab] = useState<string>('diagram');
  const [detailsTab, setDetailsTab] = useState<string>('stageOverview');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const diagramData = transformWorkflowToFlowDiagramData(workflow);
  const allTasks = Object.values(workflow.tasks || {}).flat();
  const {
    hierarchyPath = [],
    taskCounts: apiTaskCounts,
    progress: apiProgress,
  } = workflow;
  
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((task: any) => task.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const taskCounts = apiTaskCounts || {
    completed: completedTasks,
    failed: allTasks.filter((task: any) => task.status === 'failed').length,
    rejected: 0,
    pending: allTasks.filter((task: any) => task.status === 'pending' || task.status === 'not_started').length,
    processing: allTasks.filter((task: any) => task.status === 'in_progress').length,
  };

  const progress = apiProgress || progressPercentage;

  const toggleLock = () => setIsLocked(!isLocked);
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };
  
  const handleNodeClick = (nodeData: any) => {
    console.log("Node clicked:", nodeData);

    // Adapt the clicked node data to the structure expected by the right panel
    const adaptedNode = {
      id: nodeData.id,
      label: nodeData.name,
      data: {
        ...nodeData,
        ...nodeData.processData,
        label: nodeData.name,
      },
    };
    
    setSelectedNode(adaptedNode);
    setShowRightPanel(true);
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
        container: 'grid grid-cols-12 gap-4',
        leftPanel: 'col-span-3',
        mainArea: 'col-span-6',
        rightPanel: 'col-span-3',
      };
    } else if (showLeftPanel) {
      return {
        container: 'grid grid-cols-12 gap-4',
        leftPanel: 'col-span-3',
        mainArea: 'col-span-9',
        rightPanel: 'hidden',
      };
    } else if (showRightPanel) {
      return {
        container: 'grid grid-cols-12 gap-4',
        leftPanel: 'hidden',
        mainArea: 'col-span-9',
        rightPanel: 'col-span-3',
      };
    } else {
      return {
        container: 'grid grid-cols-1 gap-4',
        leftPanel: 'hidden',
        mainArea: 'col-span-1',
        rightPanel: 'hidden',
      };
    }
  };

  const layoutClasses = getLayoutClasses();

  return (
    <div className="flex flex-col h-full w-full">
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
      >
        <div className="flex items-center gap-2">
          <Button
            variant={showLeftPanel ? 'default' : 'outline'}
            size="icon"
            onClick={toggleLeftPanel}
            title={showLeftPanel ? 'Hide left panel' : 'Show left panel'}
            className="h-8 w-8"
          >
            {showLeftPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant={showRightPanel ? 'default' : 'outline'}
            size="icon"
            onClick={toggleRightPanel}
            title={showRightPanel ? 'Hide right panel' : 'Show right panel'}
            className="h-8 w-8"
          >
            {showRightPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>
      </WorkflowUnifiedHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mt-4">
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
                  <WorkflowFlowDiagram
                    workflowData={diagramData}
                    onNodeClick={handleNodeClick}
                    selectedNodeId={selectedNode?.id}
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