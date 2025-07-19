import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  X,
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  PlayCircle, 
  Calendar,
  FileText,
  MessageSquare,
  Download,
  Upload,
  Eye,
  UserPlus,
  Zap,
  History,
  Paperclip,
  Send,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowInboxItemData } from './WorkflowInboxDashboard';

interface WorkflowDetailPanelProps {
  item: WorkflowInboxItemData;
  onClose: () => void;
  onAssignToMe: () => void;
  onTriggerAction: () => void;
}

export const WorkflowDetailPanel: React.FC<WorkflowDetailPanelProps> = ({
  item,
  onClose,
  onAssignToMe,
  onTriggerAction
}) => {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'requires_attention':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'requires_attention':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'blocked':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would make an API call
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const handleFileAction = (fileId: string, action: 'download' | 'preview' | 'upload') => {
    // In a real app, this would handle file operations
    console.log(`File action: ${action} for file ${fileId}`);
  };

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(item.status)}
              <CardTitle className="text-lg truncate">{item.title}</CardTitle>
            </div>
            <CardDescription className="text-sm">{item.description}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Badge variant="outline" className={cn("text-xs", getPriorityColor(item.priority))}>
            {item.priority} priority
          </Badge>
          <Badge variant="outline" className={cn("text-xs", getStatusColor(item.status))}>
            {item.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mx-4 mb-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] px-4">
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Process Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Process Information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Process:</span>
                    <p className="font-medium">{item.processName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Business Date:</span>
                    <p className="font-medium">{item.businessDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <p className="font-medium">{formatDate(item.dueDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{formatDuration(item.estimatedDuration)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Hierarchy Path */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Hierarchy</h4>
                <div className="text-xs">
                  <p className="text-muted-foreground">{item.metadata.hierarchyPath}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">{item.metadata.application}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{item.metadata.stage}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{item.metadata.substage}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Assignment */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Assignment</h4>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    {item.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{item.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                  {!item.assignedTo && (
                    <Button size="sm" variant="outline" onClick={onAssignToMe} className="text-xs h-6">
                      <UserPlus className="h-3 w-3 mr-1" />
                      Assign to Me
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Suggested Action */}
              {item.suggestedAction && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Suggested Action</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-xs text-blue-800">{item.suggestedAction}</p>
                      <Button 
                        size="sm" 
                        className="mt-2 text-xs h-6"
                        onClick={onTriggerAction}
                        disabled={item.status === 'blocked'}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Trigger Action
                      </Button>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Dependencies */}
              {item.dependencies.length > 0 && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Dependencies</h4>
                    <div className="space-y-1">
                      {item.dependencies.map((dep, index) => (
                        <div key={index} className="text-xs p-2 bg-muted rounded">
                          {dep}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Files ({item.files.length})</h4>
                <Button size="sm" variant="outline" className="text-xs h-6">
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
              </div>
              
              {item.files.length === 0 ? (
                <div className="text-center py-8">
                  <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No files attached</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {item.files.map((file) => (
                    <div key={file.id} className="border rounded-md p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                            {file.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{file.type}</span>
                            <span>{file.size}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleFileAction(file.id, 'preview')}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleFileAction(file.id, 'download')}
                            className="h-6 w-6 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Comments & Queries ({item.comments.length})</h4>
              </div>
              
              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment or query..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="text-xs h-6"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              {item.comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No comments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {item.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-md p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.user}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-3 mt-0">
              <h4 className="font-medium text-sm">Activity History ({item.history.length})</h4>
              
              {item.history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No activity history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {item.history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-2 border rounded-md">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{entry.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">by {entry.user}</span>
                        </div>
                        {entry.details && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};