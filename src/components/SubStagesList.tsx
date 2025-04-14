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
  Zap
} from 'lucide-react';

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
  fileInfo?: { name: string; type: string }[];
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
                    {subStage.updatedBy && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Updated by:</span> {subStage.updatedBy}
                      </div>
                    )}
                    {subStage.lockedBy && (
                      <div className="text-sm flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        <span className="text-muted-foreground">Locked by:</span> {subStage.lockedBy}
                      </div>
                    )}
                    {subStage.duration !== undefined && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Duration:</span> {subStage.duration} min
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
                </div>
              </div>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <Separator />
            <div className="p-4 space-y-4 bg-accent/10">
              {/* Performance Metrics */}
              <div>
                <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subStage.avgDuration !== undefined && (
                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Average Duration</div>
                      <div className="font-medium">{subStage.avgDuration} min</div>
                    </div>
                  )}
                  {subStage.avgStartTime && (
                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Average Start Time</div>
                      <div className="font-medium">{subStage.avgStartTime}</div>
                    </div>
                  )}
                  {subStage.type === 'manual' && subStage.expectedUser && (
                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Expected User</div>
                      <div className="font-medium">{subStage.expectedUser}</div>
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
              {subStage.fileInfo && subStage.fileInfo.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Files</h4>
                  <div className="space-y-2">
                    {subStage.fileInfo.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{file.type}</Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-xs text-blue-500 hover:underline">Preview</button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Preview file</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-xs text-blue-500 hover:underline">Download</button>
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
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default SubStagesList;