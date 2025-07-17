import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowTaskDocument {
  name: string;
  size: string;
}

export interface WorkflowTaskDependency {
  name: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'skipped';
}

export interface WorkflowTask {
  id: string;
  name: string;
  processId: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'skipped';
  duration: number; // in minutes
  expectedStart: string;
  actualDuration?: string;
  documents?: WorkflowTaskDocument[];
  dependencies?: WorkflowTaskDependency[];
  messages?: string[];
  updatedBy?: string;
  updatedAt?: string;
  
  // Enhanced fields from GetWorkflowSummary API
  workflowProcessId?: number;
  workflowAppConfigId?: number;
  stageId?: number;
  subStageId?: number;
  subStageSeq?: number;
  stageName?: string;
  subStageName?: string;
  serviceLink?: string;
  auto?: string; // "y" | "n"
  adhoc?: string; // "Y" | "N"
  isAlteryx?: string; // "Y" | "N"
  upload?: string; // "Y" | "N"
  attest?: string; // "Y" | "N"
  uploadAllowed?: string; // "Y" | "N"
  downloadAllowed?: string; // "Y" | "N"
  attestRequired?: string; // "Y" | "N"
  componentName?: string | null;
  resolvedComponentName?: string | null;
  businessDate?: string;
  attestedBy?: string | null;
  attestedOn?: string | null;
  completedBy?: string | null;
  completedOn?: string | null;
  isLocked?: string | null;
  lockedBy?: string | null;
  lockedOn?: string | null;
  approval?: string; // "Y" | "N"
  isActive?: string; // "y" | "n"
  percentage?: number;
  producer?: number;
  approver?: number;
  entitlementMapping?: number;
  isRTB?: boolean;
  hasDependencies?: string; // "y" | "n"
  dependencySubstageId?: number | null;
  depSubStageSeq?: number | null;
  userCommentary?: string | null;
  skipCommentary?: string | null;
  partialComplete?: string;
}

interface WorkflowTaskItemProps {
  task: WorkflowTask;
}

const WorkflowTaskItem: React.FC<WorkflowTaskItemProps> = ({ task }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">In Progress</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'skipped':
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Skipped</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'not_started':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Calculate completion percentage based on status
  const getCompletionPercentage = (status: string) => {
    switch (status) {
      case 'completed':
        return '100%';
      case 'in_progress':
        return '50%';
      case 'not_started':
        return '0%';
      case 'skipped':
        return 'N/A';
      default:
        return '0%';
    }
  };

  return (
    <Card className={cn(
      "mb-4 overflow-hidden",
      task.status === 'completed' && "border-l-4 border-l-green-500",
      task.status === 'in_progress' && "border-l-4 border-l-blue-500",
      task.status === 'skipped' && "border-l-4 border-l-amber-500"
    )}>
      <CardContent className="p-4">
        {/* Task Header - Task number, name, ID, and completion status */}
        <div className="grid grid-cols-12 gap-2 mb-3">
          <div className="col-span-1 flex items-center justify-center bg-muted rounded-md p-1 font-medium text-sm">
            {task.id.padStart(2, '0')}
          </div>
          <div className="col-span-11 md:col-span-8">
            <h3 className="font-medium text-base">{task.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{task.processId}</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end items-center">
            <Badge className={cn(
              "px-2 py-1",
              task.status === 'completed' && "bg-green-500/10 text-green-500 border-green-500/20",
              task.status === 'in_progress' && "bg-blue-500/10 text-blue-500 border-blue-500/20"
            )}>
              {getCompletionPercentage(task.status)}
            </Badge>
          </div>
        </div>

        {/* Task Details - Timing, dependencies, and messages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-3">
          {/* Left column */}
          <div>
            {/* Timing information */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>Expected Start: {task.expectedStart}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>Duration: {task.duration}m</span>
            </div>
            {task.updatedBy && task.updatedAt && (
              <div className="flex items-start gap-2 text-sm mt-1">
                <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span>Updated by: {task.updatedBy} ({task.updatedAt})</span>
              </div>
            )}
          </div>

          {/* Right column */}
          <div>
            {/* Dependencies */}
            {task.dependencies && task.dependencies.length > 0 && (
              <div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium flex-shrink-0">Dependencies:</span>
                  <div className="flex flex-wrap gap-1">
                    {task.dependencies.map((dep, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          dep.status === 'completed' && "bg-green-500/10 text-green-500 border-green-500/20",
                          dep.status === 'in_progress' && "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        )}
                      >
                        {dep.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {task.messages && task.messages.length > 0 && (
              <div className="mt-2">
                {task.messages.map((message, index) => (
                  <p key={index} className="text-sm text-green-500">{message}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        {task.documents && task.documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {task.documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-primary hover:underline cursor-pointer">{doc.name}</span>
                <span className="text-xs text-muted-foreground">({doc.size})</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowTaskItem;