import React from 'react';
import { ArrowRight } from 'lucide-react';

interface WorkflowProgressStep {
  name: string;
  progress: number;
}

interface WorkflowProgressIndicatorProps {
  steps: WorkflowProgressStep[];
}

const WorkflowProgressIndicator: React.FC<WorkflowProgressIndicatorProps> = ({ steps }) => {
  return (
    <div className="flex items-center flex-wrap gap-2 mb-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.name}>
          <div className="flex items-center">
            <span className="font-medium">{step.name}</span>
            <span className="ml-1 text-muted-foreground">({step.progress}%)</span>
          </div>
          {index < steps.length - 1 && (
            <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WorkflowProgressIndicator;