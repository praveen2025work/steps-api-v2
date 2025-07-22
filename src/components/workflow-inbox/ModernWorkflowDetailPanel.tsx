import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
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
  ExternalLink,
  Settings,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square,
  Trash2,
  Edit,
  Save,
  FileImage,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowInboxItemData {
  id: string;
  title: string;
  description: string;
  processName: string;
  businessDate: string;
  status: 'pending' | 'in_progress' | 'requires_attention' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  suggestedAction: string;
  dueDate: string;
  estimatedDuration: number;
  dependencies: string[];
  tags: string[];
  files: {
    id: string;
    name: string;
    type: string;
    size: string;
    required: boolean;
    status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  }[];
  comments: {
    id: string;
    user: string;
    message: string;
    timestamp: string;
    type: 'comment' | 'query' | 'approval' | 'rejection';
  }[];
  history: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details?: string;
  }[];
  metadata: {
    application: string;
    stage: string;
    substage: string;
    hierarchyPath: string;
    processControls: {
      active: boolean;
      auto: boolean;
      attest: boolean;
      lock: boolean;
      canTrigger: boolean;
      canSelect: boolean;
      lastRun: string;
      nextRun: string | null;
    };
  };
}

interface ModernWorkflowDetailPanelProps {
  item: WorkflowInboxItemData;
  onClose: () => void;
  onAssignToMe: () => void;
  onTriggerAction: () => void;
}

export const ModernWorkflowDetailPanel: React.FC<ModernWorkflowDetailPanelProps> = ({
  item,
  onClose,
  onAssignToMe,
  onTriggerAction
}) => {
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(lowerType)) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(lowerType)) {
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
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
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file, index) => {
        const fileId = `upload-${Date.now()}-${index}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            if (currentProgress >= 100) {
              clearInterval(interval);
              return prev;
            }
            return { ...prev, [fileId]: currentProgress + 10 };
          });
        }, 200);
      });
    }
  };

  const handleFileAction = (fileId: string, action: 'download' | 'preview' | 'delete') => {
    switch (action) {
      case 'download':
        console.log(`Downloading file: ${fileId}`);
        break;
      case 'preview':
        setPreviewFile(fileId);
        break;
      case 'delete':
        console.log(`Deleting file: ${fileId}`);
        break;
    }
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleBulkAction = (action: 'download' | 'delete') => {
    console.log(`Bulk ${action} for files:`, Array.from(selectedFiles));
    setSelectedFiles(new Set());
  };

  const handleProcessControl = (control: string, value: boolean) => {
    console.log(`Setting ${control} to ${value} for process ${item.id}`);
  };

  const handleViewFullWorkflow = () => {
    // Navigate to the workflow detail page using the item's ID or a related workflow ID
    // For now, we'll use the item ID as the workflow ID
    router.push(`/workflow/${item.id}`);
  };

  return (
    <Card className="h-fit">
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
          {item.metadata.processControls.active && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
              Active
            </Badge>
          )}
          {item.metadata.processControls.auto && (
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
              Auto
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mx-4 mb-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
            <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] px-4">
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
                  {item.metadata.processControls.lastRun && (
                    <div>
                      <span className="text-muted-foreground">Last Run:</span>
                      <p className="font-medium">{formatDate(item.metadata.processControls.lastRun)}</p>
                    </div>
                  )}
                  {item.metadata.processControls.nextRun && (
                    <div>
                      <span className="text-muted-foreground">Next Run:</span>
                      <p className="font-medium">{formatDate(item.metadata.processControls.nextRun)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleViewFullWorkflow}
                    variant="default"
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Full Workflow
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={onTriggerAction}
                    disabled={!item.metadata.processControls.canTrigger}
                    className="text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Trigger Process
                  </Button>
                  {!item.assignedTo && (
                    <Button size="sm" variant="outline" onClick={onAssignToMe} className="text-xs">
                      <UserPlus className="h-3 w-3 mr-1" />
                      Assign to Me
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restart
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
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
                </div>
              </div>

              {/* Dependencies */}
              {item.dependencies.length > 0 && (
                <>
                  <Separator />
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
                </>
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Files ({item.files.length})</h4>
                <div className="flex gap-2">
                  {selectedFiles.size > 0 && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleBulkAction('download')}
                        className="text-xs h-6"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download ({selectedFiles.size})
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleBulkAction('delete')}
                        className="text-xs h-6"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete ({selectedFiles.size})
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={handleFileUpload} className="text-xs h-6">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Upload Progress */}
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="border rounded-md p-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-xs">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
              
              {item.files.length === 0 ? (
                <div className="text-center py-8">
                  <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No files attached</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {item.files.map((file) => (
                    <div key={file.id} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(file.id)}
                              onChange={() => toggleFileSelection(file.id)}
                              className="rounded"
                            />
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleFileAction(file.id, 'delete')}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* File Preview Modal */}
              {previewFile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[80vh] overflow-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">File Preview</h3>
                      <Button variant="ghost" size="icon" onClick={() => setPreviewFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">File preview would be displayed here</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="controls" className="space-y-4 mt-0">
              <h4 className="font-medium text-sm">Process Controls</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Active</label>
                    <p className="text-xs text-muted-foreground">Enable/disable process execution</p>
                  </div>
                  <Switch 
                    checked={item.metadata.processControls.active}
                    onCheckedChange={(checked) => handleProcessControl('active', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto Run</label>
                    <p className="text-xs text-muted-foreground">Automatically execute on schedule</p>
                  </div>
                  <Switch 
                    checked={item.metadata.processControls.auto}
                    onCheckedChange={(checked) => handleProcessControl('auto', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Attestation Required</label>
                    <p className="text-xs text-muted-foreground">Require manual approval</p>
                  </div>
                  <Switch 
                    checked={item.metadata.processControls.attest}
                    onCheckedChange={(checked) => handleProcessControl('attest', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Lock Process</label>
                    <p className="text-xs text-muted-foreground">Prevent modifications</p>
                  </div>
                  <Switch 
                    checked={item.metadata.processControls.lock}
                    onCheckedChange={(checked) => handleProcessControl('lock', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Process Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restart
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
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