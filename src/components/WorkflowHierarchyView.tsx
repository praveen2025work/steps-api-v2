import React, { useState } from 'react';
import { HierarchyLevel } from '@/data/hierarchicalWorkflowData';
import WorkflowHierarchy from './WorkflowHierarchy';
import HierarchyLevelDetail from './HierarchyLevelDetail';

const WorkflowHierarchyView: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<HierarchyLevel | null>(null);
  
  const handleSelectLevel = (level: HierarchyLevel) => {
    setSelectedLevel(level);
  };
  
  const handleBack = () => {
    setSelectedLevel(null);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <WorkflowHierarchy onSelectLevel={handleSelectLevel} />
      </div>
      <div className="md:col-span-2">
        <HierarchyLevelDetail level={selectedLevel} onBack={handleBack} />
      </div>
    </div>
  );
};

export default WorkflowHierarchyView;