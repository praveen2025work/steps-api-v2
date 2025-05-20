import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface WorkflowStage {
  id: string;
  name: string;
  isActive?: boolean;
  completionPercentage?: number;
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
            "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors border relative",
            activeStage === stage.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted hover:bg-muted/80 text-foreground border-muted-foreground/20"
          )}
        >
          <div className="flex items-center gap-2">
            <span>{stage.name}</span>
            {typeof stage.completionPercentage === 'number' && (
              <span className="text-xs opacity-80">
                {stage.completionPercentage}%
              </span>
            )}
          </div>
          
          {/* Progress bar at the bottom of the button */}
          {typeof stage.completionPercentage === 'number' && (
            <div className="absolute bottom-0 left-0 right-0 h-1">
              <Progress 
                value={stage.completionPercentage} 
                className={cn(
                  "h-1 rounded-none rounded-b-md",
                  activeStage === stage.id
                    ? "bg-primary-foreground/20" 
                    : "bg-background/20"
                )}
              />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default WorkflowStagesBar;