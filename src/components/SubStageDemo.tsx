import React from 'react';
import SubStagesList from './SubStagesList';
import { SubStage } from '@/types/workflow';

// Sample data with different statuses for demonstration
const sampleSubStages: SubStage[] = [
  {
    id: 'substage-1',
    name: 'Data Collection',
    type: 'manual',
    status: 'completed',
    progress: 100,
    processId: 'PROC-001',
    duration: 45,
    timing: {
      start: '2025-04-19T08:00:00',
    },
  },
  {
    id: 'substage-2',
    name: 'Data Validation',
    type: 'auto',
    status: 'in-progress',
    progress: 65,
    processId: 'PROC-002',
    duration: 30,
    timing: {
      start: '2025-04-19T09:00:00',
    },
    message: 'Currently validating data entries...',
    config: {
      canRerun: true,
      canSkip: true,
    },
  },
  {
    id: 'substage-3',
    name: 'Report Generation',
    type: 'auto',
    status: 'not-started',
    progress: 0,
    processId: 'PROC-003',
    dependencies: [
      { name: 'Data Validation', status: 'in-progress' },
    ],
  },
  {
    id: 'substage-4',
    name: 'Error Handling',
    type: 'manual',
    status: 'failed',
    progress: 25,
    processId: 'PROC-004',
    message: 'Failed to process some records due to data inconsistency.',
    config: {
      canRerun: true,
    },
  },
  {
    id: 'substage-5',
    name: 'Archiving',
    type: 'auto',
    status: 'skipped',
    progress: 0,
    processId: 'PROC-005',
    message: 'Skipped as per user request.',
  },
];

const SubStageDemo: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Sub-Stage Status Demonstration</h2>
      <p className="mb-4 text-muted-foreground">
        This demo shows different sub-stage statuses, including the animated "in-progress" state.
        Hover over the status icons to see tooltips.
      </p>
      <SubStagesList subStages={sampleSubStages} />
    </div>
  );
};

export default SubStageDemo;