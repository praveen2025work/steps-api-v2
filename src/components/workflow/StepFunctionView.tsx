import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import WorkflowStepFunctionDiagram from './WorkflowStepFunctionDiagram';
import { convertWorkflowToDiagram } from '@/lib/workflowDiagramUtils';

interface StepFunctionViewProps {
  workflow: any;
  onBack: () => void;
}

const StepFunctionView: React.FC<StepFunctionViewProps> = ({ workflow, onBack }) => {
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-semibold">{workflow.title} - Step Function View</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <WorkflowStepFunctionDiagram 
          workflowId={workflow.id || 'workflow-1'}
          workflowTitle={workflow.title}
          {...convertWorkflowToDiagram(workflow)}
          onNodeClick={(nodeId) => {
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
          }}
        />
      </div>
    </div>
  );
};

export default StepFunctionView;