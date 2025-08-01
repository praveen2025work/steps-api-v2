import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import { SortableSubstageList } from './SortableSubstageList';
import { WorkflowStage, WorkflowAppConfig } from '@src/types/workflow-config-types';

type StageWithFullSubstages = WorkflowStage & { substages: WorkflowAppConfig[] };

interface DraggableStageItemProps {
  stage: StageWithFullSubstages;
  substageStartIndex?: number;
  isOverlay?: boolean;
}

export const DraggableStageItem: React.FC<DraggableStageItemProps> = ({ stage, substageStartIndex = 0, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.stageId, disabled: isOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 20 : 'auto',
  };

  const cardContent = (
    <Card className="mb-4 bg-card border">
      <CardHeader className="p-3 flex flex-row items-center justify-between bg-muted/50 rounded-t-lg">
        <CardTitle className="text-md font-semibold">{stage.stageName}</CardTitle>
        <button {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground">
          <GripVertical size={20} />
        </button>
      </CardHeader>
      <CardContent className="p-2">
        {stage.substages && stage.substages.length > 0 ? (
          <SortableSubstageList 
            configs={stage.substages} 
            substageStartIndex={substageStartIndex}
          />
        ) : (
          <p className="text-sm text-muted-foreground p-4 text-center">No substages in this stage.</p>
        )}
      </CardContent>
    </Card>
  );

  if (isOverlay) {
    return cardContent;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {cardContent}
    </div>
  );
};