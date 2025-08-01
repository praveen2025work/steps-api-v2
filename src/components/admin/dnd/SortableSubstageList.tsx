import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableSubstageItem } from './DraggableSubstageItem';
import { WorkflowAppConfig } from '@src/types/workflow-config-types';

interface SortableSubstageListProps {
  configs: WorkflowAppConfig[];
  substageStartIndex: number;
}

export const SortableSubstageList: React.FC<SortableSubstageListProps> = ({ configs, substageStartIndex }) => {
  const configIds = configs.map(c => c.workflowAppConfigId);

  return (
    <SortableContext items={configIds} strategy={verticalListSortingStrategy}>
      <div className="p-2 space-y-1 bg-muted/20 rounded-md">
        {configs.map((config, index) => (
          <DraggableSubstageItem 
            key={config.workflowAppConfigId} 
            config={config} 
            sequenceNumber={substageStartIndex + index + 1}
          />
        ))}
      </div>
    </SortableContext>
  );
};