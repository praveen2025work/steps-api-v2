import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, FileText, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getFileIcon } from './DocumentsList';

export interface TaskDocument {
  name: string;
  type: string;
  size: string;
}

export interface TaskDependency {
  name: string;
  status: string;
  id?: string;
}

export interface Task {
  id: string;
  name: string;
  processId: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'skipped';
  duration: number | string; // in minutes or formatted string
  expectedStart: string;
  actualDuration?: string;
  documents?: TaskDocument[];
  dependencies?: TaskDependency[];
  messages?: string[];
  updatedBy?: string;
  updatedAt?: string;
  files?: {
    name: string;
    type: string;
    size: string;
  }[];
}

interface SubStageTaskItemProps {
  task: Task;
}

const SubStageTaskItem: React.FC<SubStageTaskItemProps> = ({ task }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">In Progress</Badge>;
      case 'not-started':
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
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'not-started':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Preview and download handlers for file info
  const handleFilePreview = (fileName: string, fileType: string) => {
    console.log(`Previewing file: ${fileName} (${fileType})`);
    // Implement actual preview logic here
  };

  const handleFileDownload = (fileName: string, fileType: string) => {
    console.log(`Downloading file: ${fileName} (${fileType})`);
    // Implement actual download logic here
  };

  return (
    <Card className={cn(
      "overflow-hidden",
      task.status === 'completed' && "border-l-4 border-l-green-500",
      task.status === 'in-progress' && "border-l-4 border-l-blue-500",
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
                    {typeof task.duration === 'number' ? `${task.duration}m` : task.duration}
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
                <span>Duration: {typeof task.duration === 'number' ? `${task.duration}m` : task.duration}</span>
              </div>
            </div>

            {/* Dependencies */}
            {task.dependencies && task.dependencies.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">Dependencies:</p>
                <div className="flex flex-wrap gap-2">
                  {task.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          dep.status === 'completed' && "bg-green-500/10 text-green-500 border-green-500/20",
                          dep.status === 'in-progress' && "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        )}
                      >
                        {dep.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{dep.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {task.files && task.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {task.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type, file.name)}
                      <span>{file.name}</span>
                      {file.size && <span className="text-xs text-muted-foreground">({file.size})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              className="text-xs text-blue-500 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFilePreview(file.name, file.type);
                              }}
                            >
                              Preview
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview file</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              className="text-xs text-blue-500 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileDownload(file.name, file.type);
                              }}
                            >
                              Download
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download file</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Documents (legacy format) */}
            {!task.files && task.documents && task.documents.length > 0 && (
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

export default SubStageTaskItem;