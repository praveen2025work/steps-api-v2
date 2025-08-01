import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableStageItem } from './DraggableStageItem';
import { DraggableSubstageItem } from './DraggableSubstageItem';
import { WorkflowStage, WorkflowAppConfig } from '@src/types/workflow-config-types';

type StageWithFullSubstages = WorkflowStage & { substages: WorkflowAppConfig[] };

interface StageReorderViewProps {
  stages: StageWithFullSubstages[];
  onOrderChange: (stages: StageWithFullSubstages[]) => void;
  layout: 'grid' | 'list';
}

export const StageReorderView: React.FC<StageReorderViewProps> = ({ stages: initialStages, onOrderChange, layout }) => {
  const [stages, setStages] = useState<StageWithFullSubstages[]>(initialStages);
  const [activeId, setActiveId] = useState<string | number | null>(null);

  useEffect(() => {
    setStages(initialStages);
  }, [initialStages]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isStageDrag = stages.some(s => s.stageId === activeId);
    
    let newStages: StageWithFullSubstages[];

    if (isStageDrag) {
      const oldIndex = stages.findIndex(s => s.stageId === activeId);
      const newIndex = stages.findIndex(s => s.stageId === overId);
      newStages = arrayMove(stages, oldIndex, newIndex);
    } else {
      // Handle substage drag
      const sourceStage = stages.find(s => s.substages.some(ss => ss.workflowAppConfigId === activeId));
      const destStage = stages.find(s => s.substages.some(ss => ss.workflowAppConfigId === overId));
      
      if (sourceStage && destStage) {
        const oldSubstageIndex = sourceStage.substages.findIndex(ss => ss.workflowAppConfigId === activeId);
        const newSubstageIndex = destStage.substages.findIndex(ss => ss.workflowAppConfigId === overId);
        
        if (sourceStage.stageId === destStage.stageId) {
          // Drag within the same stage
          newStages = stages.map(stage => {
            if (stage.stageId === sourceStage.stageId) {
              const reorderedSubstages = arrayMove(stage.substages, oldSubstageIndex, newSubstageIndex);
              return { ...stage, substages: reorderedSubstages };
            }
            return stage;
          });
        } else {
          // Drag to a different stage
          const [movedSubstage] = sourceStage.substages.splice(oldSubstageIndex, 1);
          destStage.substages.splice(newSubstageIndex, 0, movedSubstage);
          newStages = [...stages];
        }
      } else {
        newStages = [...stages];
      }
    }
    
    const updatedStagesWithSequences = newStages.map((stage, stageIndex) => ({
      ...stage,
      stageSeq: stageIndex + 1,
      substages: stage.substages?.map((substage, substageIndex) => ({
        ...substage,
        substageSeq: substageIndex + 1,
        workflowStage: { stageId: stage.stageId, name: stage.stageName, updatedby: 'system' } // Update stage reference
      })) || [],
    }));

    setStages(updatedStagesWithSequences);
    onOrderChange(updatedStagesWithSequences);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const stageIds = stages.map(s => s.stageId);
  
  const activeStage = stages.find(s => s.stageId === activeId);
  const activeConfig = stages.flatMap(s => s.substages || []).find(ss => ss.workflowAppConfigId === activeId);

  const strategy = layout === 'grid' ? horizontalListSortingStrategy : verticalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={stageIds} strategy={strategy}>
        <div className={`p-4 bg-background rounded-lg ${
          layout === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-4'
        }`}>
          {stages.map(stage => (
            <DraggableStageItem key={stage.stageId} stage={stage} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeStage ? <DraggableStageItem stage={activeStage} /> : null}
        {activeConfig ? <DraggableSubstageItem config={activeConfig} /> : null}
      </DragOverlay>
    </DndContext>
  );
};