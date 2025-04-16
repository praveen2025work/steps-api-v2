import { Task } from '@/components/SubStageTaskItem';

export type StageStatus = 'completed' | 'in-progress' | 'not-started' | 'failed' | 'skipped';
export type StageType = 'manual' | 'auto';

export interface SubStage {
  id: string;
  name: string;
  type: StageType;
  status: StageStatus;
  progress: number;
  sequence?: number;
  message?: string;
  processId?: string;
  updatedBy?: string;
  lockedBy?: string;
  duration?: number;
  avgDuration?: number;
  avgStartTime?: string;
  expectedUser?: string;
  dependencies?: { 
    name: string; 
    status: string; 
    id?: string;
  }[];
  timing?: {
    start?: string;
    duration?: string;
    avgDuration?: string;
    avgStart?: string;
  };
  stats?: {
    success?: string;
    lastRun?: string | null;
  };
  meta?: {
    updatedBy?: string | null;
    updatedOn?: string | null;
    lockedBy?: string | null;
    lockedOn?: string | null;
    completedBy?: string | null;
    completedOn?: string | null;
  };
  files?: {
    name: string;
    type: string;
    size?: string;
  }[];
  messages?: string[];
  tasks?: Task[];
  config?: {
    canTrigger?: boolean;
    canRerun?: boolean;
    canForceStart?: boolean;
    canSkip?: boolean;
    canSendEmail?: boolean;
  };
}

export interface WorkflowStage {
  id: string;
  name: string;
  status: StageStatus;
  substages?: SubStage[];
  documents?: any[]; // TODO: Define Document interface
} 