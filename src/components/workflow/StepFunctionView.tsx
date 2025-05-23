import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Info, HelpCircle, GitBranch, GitMerge, Workflow } from 'lucide-react';
import WorkflowStepFunctionDiagram from './WorkflowStepFunctionDiagram';
import { convertWorkflowToDiagram } from '@/lib/workflowDiagramUtils';

interface StepFunctionViewProps {
  workflow: any;
  onBack: () => void;
}

const StepFunctionView: React.FC<StepFunctionViewProps> = ({ workflow, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>("diagram");
  const diagramData = convertWorkflowToDiagram(workflow);
  
  // Handle node click with improved navigation
  const handleNodeClick = (nodeId: string) => {
    console.log("Node clicked:", nodeId);
    
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
  
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex items-center p-3 border-b bg-muted/30">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-lg font-semibold flex items-center">
          <GitBranch className="h-5 w-5 mr-2 text-blue-600" />
          {workflow.title} - Step Function View
        </h1>
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
            <WorkflowStepFunctionDiagram 
              workflowId={workflow.id || 'workflow-1'}
              workflowTitle={workflow.title}
              nodes={diagramData.nodes}
              edges={diagramData.edges}
              onNodeClick={handleNodeClick}
            />
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