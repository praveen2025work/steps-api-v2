import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import { WorkflowAppConfig } from '@src/types/workflow-config-types';

interface DraggableSubstageItemProps {
  config: WorkflowAppConfig;
}

export const DraggableSubstageItem: React.FC<DraggableSubstageItemProps> = ({ config }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.workflowAppConfigId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="p-2 mb-2 flex items-center bg-background hover:bg-muted/50">
        <button {...listeners} className="cursor-grab active:cursor-grabbing mr-2 text-muted-foreground">
          <GripVertical size={16} />
        </button>
        <span className="text-sm">{config.workflowSubstage.name} ({config.workflowSubstage.substageId})</span>
      </Card>
    </div>
  );
};