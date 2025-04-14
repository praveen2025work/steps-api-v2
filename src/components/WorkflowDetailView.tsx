import React, { useState } from 'react';
import WorkflowProgressIndicator from './WorkflowProgressIndicator';
import WorkflowStagesBar from './WorkflowStagesBar';
import WorkflowTaskItem, { WorkflowTask } from './WorkflowTaskItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const handleStageClick = (stageId: string) => {
    setActiveStage(stageId);
  };

  const activeStageTasks = tasks[activeStage] || [];
  const activeStageInfo = stages.find(stage => stage.id === activeStage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Workflow for {workflowTitle}</h1>
        <WorkflowProgressIndicator steps={progressSteps} />
      </div>

      <WorkflowStagesBar 
        stages={stages} 
        activeStage={activeStage} 
        onStageClick={handleStageClick} 
      />

      <div>
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>{activeStageInfo?.name || 'Tasks'}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeStageTasks.length > 0 ? (
              <div className="space-y-4">
                {activeStageTasks.map(task => (
                  <WorkflowTaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No tasks found for this stage.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowDetailView;