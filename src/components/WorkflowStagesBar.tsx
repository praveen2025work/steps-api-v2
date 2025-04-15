import React from 'react';
import { cn } from '@/lib/utils';

interface WorkflowStage {
  id: string;
  name: string;
  isActive?: boolean;
}

interface WorkflowStagesBarProps {
  stages: WorkflowStage[];
  activeStage: string;
  onStageClick: (stageId: string) => void;
}

const WorkflowStagesBar: React.FC<WorkflowStagesBarProps> = ({ 
  stages, 
  activeStage,
  onStageClick 
}) => {
  return (
    <div className="flex overflow-x-auto pb-2 mb-6 gap-1">
      {stages.map((stage) => (
        <button
          key={stage.id}
          onClick={() => onStageClick(stage.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors border",
            activeStage === stage.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted hover:bg-muted/80 text-foreground border-muted-foreground/20"
          )}
        >
          {stage.name}
        </button>
      ))}
    </div>
  );
};

export default WorkflowStagesBar;