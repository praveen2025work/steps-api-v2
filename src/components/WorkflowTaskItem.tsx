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

  return (
    <Card className={cn(
      "mb-4 overflow-hidden",
      task.status === 'completed' && "border-l-4 border-l-green-500",
      task.status === 'in_progress' && "border-l-4 border-l-blue-500",
      task.status === 'skipped' && "border-l-4 border-l-amber-500"
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Left column - Task info */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-1">{getStatusIcon(task.status)}</div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{task.name}</h3>
                  {getStatusBadge(task.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{task.processId}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {task.duration}m
                  </Badge>
                  {task.status === 'completed' && task.actualDuration && (
                    <span className="text-xs text-muted-foreground">Actual: {task.actualDuration}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Timing information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Expected Start: {task.expectedStart}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Duration: {task.duration}m</span>
              </div>
            </div>

            {/* Dependencies */}
            {task.dependencies && task.dependencies.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">Dependencies:</p>
                <div className="flex flex-wrap gap-2">
                  {task.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {dep.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{dep.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Messages */}
            {task.messages && task.messages.length > 0 && (
              <div className="mt-4 space-y-1">
                {task.messages.map((message, index) => (
                  <p key={index} className="text-sm">{message}</p>
                ))}
              </div>
            )}
          </div>

          {/* Right column - Update info */}
          {task.updatedBy && task.updatedAt && (
            <div className="text-sm text-right text-muted-foreground mt-4 md:mt-0">
              <p>Updated by: {task.updatedBy}</p>
              <p>({task.updatedAt})</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowTaskItem;