import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  Lock,
  User,
  FileText,
  ArrowRightLeft,
  Settings,
  Zap,
  Play,
  RotateCw,
  FastForward,
  SkipForward,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileIcon } from './DocumentsList';
import SubStageTaskItem, { Task } from './SubStageTaskItem';

interface SubStage {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'skipped';
  progress: number;
  sequence?: number;
  message?: string;
  processId?: string;
  updatedBy?: string;
  lockedBy?: string;
  duration?: number;
  type?: 'manual' | 'auto';
  avgDuration?: number;
  avgStartTime?: string;
  expectedUser?: string;
  dependencies?: { name: string; status: string; id?: string }[];
  fileInfo?: { name: string; type: string; size?: string }[];
  config?: {
    canTrigger?: boolean;
    canRerun?: boolean;
    canForceStart?: boolean;
    canSkip?: boolean;
    canSendEmail?: boolean;
  };
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
    size: string;
  }[];
  messages?: string[];
  tasks?: Task[];
}

interface SubStagesListProps {
  subStages: SubStage[];
}

const SubStagesList: React.FC<SubStagesListProps> = ({ subStages }) => {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedStages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Action handlers
  const handleTrigger = (id: string, name: string) => {
    console.log(`Triggering sub-stage: ${name} (${id})`);
    // Implement actual trigger logic here
  };
  
  const handleRerun = (id: string, name: string) => {
    console.log(`Rerunning sub-stage: ${name} (${id})`);
    // Implement actual rerun logic here
  };
  
  const handleForceStart = (id: string, name: string) => {
    console.log(`Force starting sub-stage: ${name} (${id})`);
    // Implement actual force start logic here
  };
  
  const handleSkip = (id: string, name: string) => {
    console.log(`Skipping sub-stage: ${name} (${id})`);
    // Implement actual skip logic here
  };
  
  const handleSendEmail = (id: string, name: string) => {
    console.log(`Sending email for sub-stage: ${name} (${id})`);
    // Implement actual email sending logic here
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

  const getTypeIcon = (type?: string) => {
    if (type === 'manual') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <User className="h-4 w-4 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Manual Step</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Zap className="h-4 w-4 text-blue-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Automatic Step</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
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
    <div className="space-y-4">
      {subStages.map((subStage) => (
        <Collapsible 
          key={subStage.id} 
          open={expandedStages[subStage.id]} 
          onOpenChange={() => toggleExpand(subStage.id)}
          className="border rounded-lg"
        >
          <div className="p-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-start gap-3 cursor-pointer">
                <div className="mt-1">{getStatusIcon(subStage.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {expandedStages[subStage.id] ? 
                        <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      }
                      <h3 className="font-medium">{subStage.name}</h3>
                      {subStage.sequence && (
                        <Badge variant="outline" className="ml-2">Seq: {subStage.sequence}</Badge>
                      )}
                      {getTypeIcon(subStage.type)}
                    </div>
                    {getStatusBadge(subStage.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    {subStage.processId && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Process ID:</span> {subStage.processId}
                      </div>
                    )}
                    {subStage.meta?.updatedBy && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Updated by:</span> {subStage.meta.updatedBy}
                      </div>
                    )}
                    {subStage.meta?.lockedBy && (
                      <div className="text-sm flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        <span className="text-muted-foreground">Locked by:</span> {subStage.meta.lockedBy}
                      </div>
                    )}
                    {subStage.timing?.duration && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Duration:</span> {subStage.timing.duration}
                      </div>
                    )}
                    {subStage.stats?.success && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Success Rate:</span> {subStage.stats.success}
                      </div>
                    )}
                    {subStage.timing?.start && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Start Time:</span> {subStage.timing.start}
                      </div>
                    )}
                  </div>
                  
                  {subStage.message && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {subStage.message}
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{subStage.progress}%</span>
                    </div>
                    <Progress value={subStage.progress} className="h-2" />
                  </div>

                  {/* Action Buttons for all sub-stages */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrigger(subStage.id, subStage.name);
                            }}
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>Trigger</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Trigger this step</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRerun(subStage.id, subStage.name);
                            }}
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                            <span>Rerun</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rerun this step</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleForceStart(subStage.id, subStage.name);
                            }}
                          >
                            <FastForward className="h-3.5 w-3.5" />
                            <span>Force Start</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Force start this step</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkip(subStage.id, subStage.name);
                            }}
                          >
                            <SkipForward className="h-3.5 w-3.5" />
                            <span>Skip</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Skip this step</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendEmail(subStage.id, subStage.name);
                            }}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Send Email</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send email notification</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <Separator />
            <div className="p-4 space-y-4 bg-accent/10">
              {/* Tasks Section */}
              {subStage.tasks && subStage.tasks.length > 0 && (
                <div className="space-y-4">
                  {subStage.tasks.map(task => (
                    <SubStageTaskItem key={task.id} task={task} />
                  ))}
                </div>
              )}
              
              {/* Performance Metrics */}
              <div>
                <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(subStage.timing?.avgDuration || subStage.avgDuration) && (
                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Average Duration</div>
                      <div className="font-medium">{subStage.timing?.avgDuration || `${subStage.avgDuration} min`}</div>
                    </div>
                  )}
                  {(subStage.timing?.avgStart || subStage.avgStartTime) && (
                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Average Start Time</div>
                      <div className="font-medium">{subStage.timing?.avgStart || subStage.avgStartTime}</div>
                    </div>
                  )}
                  {subStage.stats?.success && (
                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
                      <div className="font-medium">{subStage.stats.success}</div>
                    </div>
                  )}
                  {subStage.type === 'manual' && subStage.expectedUser && (
                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Expected User</div>
                      <div className="font-medium">{subStage.expectedUser}</div>
                    </div>
                  )}
                  {subStage.stats?.lastRun && (
                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Last Run</div>
                      <div className="font-medium">{subStage.stats.lastRun}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dependencies */}
              {subStage.dependencies && subStage.dependencies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Dependencies</h4>
                  <div className="space-y-2">
                    {subStage.dependencies.map((dep, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between bg-background p-2 rounded-md cursor-pointer hover:bg-accent/20"
                        onClick={() => dep.id && console.log(`Navigate to dependency: ${dep.id}`)}
                        title="Click to navigate to this step"
                      >
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <ArrowRightLeft className={
                                  dep.status === 'completed' ? 'h-4 w-4 text-green-500' : 
                                  dep.status === 'in-progress' ? 'h-4 w-4 text-blue-500' : 
                                  'h-4 w-4 text-muted-foreground'
                                } />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to navigate to this dependency</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span>{dep.name}</span>
                        </div>
                        <Badge 
                          className={
                            dep.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                            dep.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' : 
                            'bg-muted text-muted-foreground'
                          }
                        >
                          {dep.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* File Information */}
              {(subStage.files || (subStage.fileInfo && subStage.fileInfo.length > 0)) && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Files</h4>
                  <div className="space-y-2">
                    {subStage.files && subStage.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type, file.name)}
                          <span>{file.name}</span>
                          {file.size && <span className="text-xs text-muted-foreground">({file.size})</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{file.type}</Badge>
                          {file.type === 'preview' && (
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
                          )}
                          {(file.type === 'download' || !file.type) && (
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
                          )}
                          {file.type === 'upload' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    className="text-xs text-blue-500 hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(`Upload file: ${file.name}`);
                                    }}
                                  >
                                    Upload
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Upload file</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {subStage.fileInfo && subStage.fileInfo.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type, file.name)}
                          <span>{file.name}</span>
                          {file.size && <span className="text-xs text-muted-foreground">({file.size})</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{file.type}</Badge>
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
                </div>
              )}
              
              {/* Messages */}
              {subStage.messages && subStage.messages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Messages</h4>
                  <div className="space-y-2">
                    {subStage.messages.map((message, index) => (
                      <div key={index} className="bg-background p-2 rounded-md text-sm">
                        {message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default SubStagesList;