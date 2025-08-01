import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import { WorkflowAppConfig } from '@src/types/workflow-config-types';

interface DraggableSubstageItemProps {
  config: WorkflowAppConfig;
  sequenceNumber?: number;
  isOverlay?: boolean;
}

export const DraggableSubstageItem: React.FC<DraggableSubstageItemProps> = ({ config, sequenceNumber, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.workflowAppConfigId, disabled: isOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const content = (
    <Card className="p-2 mb-2 flex items-center bg-background hover:bg-muted/50">
      <button {...listeners} className="cursor-grab active:cursor-grabbing mr-2 text-muted-foreground">
        <GripVertical size={16} />
      </button>
      <span className="text-sm font-semibold mr-2">{sequenceNumber}.</span>
      <span className="text-sm flex-grow">{config.workflowSubstage.name}</span>
      <span className="text-xs text-muted-foreground">({config.workflowSubstage.substageId})</span>
    </Card>
  );

  if (isOverlay) {
    return content;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {content}
    </div>
  );
};