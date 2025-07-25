import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  PlayCircle, 
  Eye,
  Calendar,
  FileText,
  MessageSquare,
  ArrowRight,
  Filter,
  Search,
  SortDesc,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Zap,
  CheckSquare,
  XCircle,
  RefreshCw,
  MoreHorizontal,
  Send,
  Paperclip,
  Download,
  Upload,
  Settings,
  Lock,
  Unlock,
  Activity,
  GitBranch,
  Network,
  Database,
  Shield,
  X,
  List,
  Grid3X3,
  Bot,
  Check,
  AlertTriangle,
  Circle,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useWorkflowInbox } from '@/hooks/useWorkflowInbox';
import ProcessOverview from '@/components/workflow/ProcessOverview';
import ProcessDependencies from '@/components/workflow/ProcessDependencies';
import ProcessParameters from '@/components/workflow/ProcessParameters';
import { AdvancedFilePreview } from '@/components/files/AdvancedFilePreview';

export interface WorkflowInboxItemData {
  id: string;
  title: string;
  description: string;
  processName: string;
  businessDate: string;
  status: 'NOTSTARTED' | 'READY' | 'INPROGRESS' | 'POSTMANUAL' | 'COMPLETED' | 'FAILED';
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
    isManual: boolean; // Flag to identify manual processes
  };
}

interface ApplicationGroup {
  application: string;
  processes: WorkflowInboxItemData[];
}

interface EnhancedWorkflowInboxDashboardProps {
  className?: string;
}

export const EnhancedWorkflowInboxDashboard: React.FC<EnhancedWorkflowInboxDashboardProps> = ({
  className
}) => {
  const [selectedItem, setSelectedItem] = useState<WorkflowInboxItemData | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedApplication, setSelectedApplication] = useState<string>('all');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'businessDate'>('priority');
  const [inlineMessages, setInlineMessages] = useState<Record<string, string>>({});
  const [detailPanelTab, setDetailPanelTab] = useState('overview');


  const { items, loading, error, refreshData, assignToMe, triggerAction } = useWorkflowInbox();

  // Get unique application names for the filter dropdown
  const applicationNames = React.useMemo(() => {
    const appSet = new Set(items.map(item => item.metadata.application));
    return ['all', ...Array.from(appSet)];
  }, [items]);

  // Filter and sort items - only show manual processes
  const filteredItems = React.useMemo(() => {
    let filtered = items.filter(item => {
      // Only show manual processes
      if (!item.metadata.isManual) return false;
      
      if (selectedApplication !== 'all' && item.metadata.application !== selectedApplication) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
      if (filters.assignee !== 'all') {
        if (filters.assignee === 'me' && item.assignedTo !== 'current_user') return false;
        if (filters.assignee === 'unassigned' && item.assignedTo) return false;
      }
      if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !item.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'businessDate':
          return new Date(b.businessDate).getTime() - new Date(a.businessDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, filters, sortBy, selectedApplication]);

  // Get summary stats - only for manual processes
  const stats = React.useMemo(() => {
    const manualItems = items.filter(item => item.metadata.isManual);
    const total = manualItems.length;
    const pending = manualItems.filter(item => item.status === 'NOTSTARTED' || item.status === 'READY').length;
    const inProgress = manualItems.filter(item => item.status === 'INPROGRESS').length;
    const attestation = manualItems.filter(item => item.metadata.processControls.attest).length;
    const approval = manualItems.filter(item => item.metadata.processControls.attest || 
      item.status === 'POSTMANUAL').length;

    return {
      total,
      pending,
      inProgress,
      attestation,
      approval
    };
  }, [items]);

  const handleItemClick = (item: WorkflowInboxItemData) => {
    setSelectedItem(item);
    setShowDetailPanel(true);
  };

  const handleAssignToMe = async (itemId: string) => {
    try {
      await assignToMe(itemId);
      await refreshData();
    } catch (error) {
      console.error('Failed to assign item:', error);
    }
  };

  const handleTriggerAction = async (itemId: string) => {
    try {
      await triggerAction(itemId);
      await refreshData();
    } catch (error) {
      console.error('Failed to trigger action:', error);
    }
  };

  const handleApprove = async (itemId: string, message?: string) => {
    try {
      // Simulate approval action
      console.log('Approving item:', itemId, 'with message:', message);
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshData();
    } catch (error) {
      console.error('Failed to approve item:', error);
    }
  };

  const handleInlineMessageChange = (itemId: string, message: string) => {
    setInlineMessages(prev => ({
      ...prev,
      [itemId]: message
    }));
  };

  const handleInlineMessageSubmit = async (itemId: string, action: 'approve' | 'reject') => {
    const message = inlineMessages[itemId] || '';
    try {
      if (action === 'approve') {
        await handleApprove(itemId, message);
      } else {
        // Handle rejection
        console.log('Rejecting item:', itemId, 'with message:', message);
      }
      
      // Clear the message
      setInlineMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[itemId];
        return newMessages;
      });
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'INPROGRESS':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'POSTMANUAL':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'READY':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'NOTSTARTED':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Circle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Minus className="h-4 w-4 text-green-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusRibbon = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
    
    switch (status) {
      case 'NOTSTARTED':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-300`}>
            NOTSTARTED
          </span>
        );
      case 'READY':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800 border border-blue-300`}>
            READY
          </span>
        );
      case 'INPROGRESS':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-300`}>
            INPROGRESS
          </span>
        );
      case 'POSTMANUAL':
        return (
          <span className={`${baseClasses} bg-orange-100 text-orange-800 border border-orange-300`}>
            POSTMANUAL
          </span>
        );
      case 'COMPLETED':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 border border-green-300`}>
            COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800 border border-red-300`}>
            FAILED
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-300`}>
            {status}
          </span>
        );
    }
  };

  const getProcessControlIcon = (control: string) => {
    switch (control) {
      case 'active':
        return <Activity className="h-3 w-3" />;
      case 'attest':
        return <Shield className="h-3 w-3" />;
      case 'auto':
        return <Bot className="h-3 w-3" />;
      case 'lock':
        return <Lock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-green-500';
    }
  };

  const renderProcessItem = (item: WorkflowInboxItemData) => {
    const isApprovalType = item.metadata.processControls.attest || item.status === 'POSTMANUAL';
    
    // Extract hierarchy levels from hierarchyPath for inline display
    const hierarchyLevels = item.metadata.hierarchyPath
      ? item.metadata.hierarchyPath.split(' > ').slice(1) // Remove 'Root'
      : [];
    
    return (
      <Card 
        key={item.id}
        className={cn(
          "mb-3 border-l-4 hover:shadow-sm transition-all duration-200",
          getPriorityColor(item.priority),
          selectedItem?.id === item.id && "ring-1 ring-primary bg-primary/5"
        )}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(item.status)}
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  {item.metadata.processControls.auto && (
                    <div className="flex items-center">
                      {getProcessControlIcon('auto')}
                    </div>
                  )}
                  {item.metadata.processControls.active && (
                    <div className="flex items-center text-green-600">
                      {getProcessControlIcon('active')}
                    </div>
                  )}
                  {item.metadata.processControls.attest && (
                    <div className="flex items-center text-purple-600">
                      {getProcessControlIcon('attest')}
                    </div>
                  )}
                  {item.metadata.processControls.lock && (
                    <div className="flex items-center text-gray-600">
                      {getProcessControlIcon('lock')}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                
                {/* Inline hierarchy levels display */}
                {hierarchyLevels.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">Levels:</span>
                    <span>{hierarchyLevels.join(' → ')}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{item.metadata.substage} ({item.metadata.stage})</span>
                  {item.assignedTo && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">{item.assignedTo}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleItemClick(item)}
                  className="text-xs h-7 px-2"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  More Info
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-1"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Inline Message Box for Approval/Attestation */}
            {isApprovalType && (
              <div className="bg-muted/30 rounded-md p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    {item.metadata.processControls.attest ? 'Attestation Required' : 'Approval Required'}
                  </span>
                </div>
                <Textarea
                  placeholder="Enter your message or comments..."
                  value={inlineMessages[item.id] || ''}
                  onChange={(e) => handleInlineMessageChange(item.id, e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInlineMessageSubmit(item.id, 'reject')}
                    className="text-xs h-7"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleInlineMessageSubmit(item.id, 'approve')}
                    className="text-xs h-7"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex gap-1">
                {!item.assignedTo && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssignToMe(item.id)}
                    className="text-xs h-6 px-2"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={() => handleTriggerAction(item.id)}
                  className="text-xs h-6 px-1"
                  disabled={item.status === 'COMPLETED'}
                  title="Trigger"
                >
                  <Zap className="h-3 w-3" />
                </Button>
                
                {!isApprovalType && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 px-1"
                    title="Approve"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTableView = () => {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {selectedApplication === 'all' && <TableHead className="w-[200px]">Application</TableHead>}
                <TableHead className="w-[400px]">Sub-stage (Stage)</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[120px]">Assigned To</TableHead>
                <TableHead className="w-[100px]">Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isApprovalType = item.metadata.processControls.attest || item.status === 'POSTMANUAL';
                
                return (
                  <TableRow 
                    key={item.id}
                    className={cn(
                      "hover:bg-muted/50 cursor-pointer transition-colors",
                      selectedItem?.id === item.id && "bg-primary/5"
                    )}
                    onClick={() => handleItemClick(item)}
                  >
                    {selectedApplication === 'all' && <TableCell>{item.metadata.application}</TableCell>}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium text-sm">
                            {item.metadata.substage} ({item.metadata.stage})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.metadata.processControls.auto && (
                            <div className="flex items-center text-blue-600" title="Auto">
                              {getProcessControlIcon('auto')}
                            </div>
                          )}
                          {item.metadata.processControls.active && (
                            <div className="flex items-center text-green-600" title="Active">
                              {getProcessControlIcon('active')}
                            </div>
                          )}
                          {item.metadata.processControls.attest && (
                            <div className="flex items-center text-purple-600" title="Attest">
                              {getProcessControlIcon('attest')}
                            </div>
                          )}
                          {item.metadata.processControls.lock && (
                            <div className="flex items-center text-gray-600" title="Locked">
                              {getProcessControlIcon('lock')}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusRibbon(item.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getPriorityIcon(item.priority)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {item.assignedTo || (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!item.assignedTo && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignToMe(item.id);
                            }}
                            className="text-xs h-6 px-2"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle reject action
                          }}
                          className="text-xs h-6 px-1"
                          title="Reject"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(item.id);
                          }}
                          className="text-xs h-6 px-1"
                          title="Approve"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerAction(item.id);
                          }}
                          className="text-xs h-6 px-1"
                          disabled={item.status === 'COMPLETED'}
                          title="Trigger"
                        >
                          <Zap className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item);
                          }}
                          className="text-xs h-6 px-2"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          More Info
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const renderCardView = () => {
    return (
      <div className="space-y-2 p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No workflow items match your filters</p>
          </div>
        ) : (
          filteredItems.map((item) => renderProcessItem(item))
        )}
      </div>
    );
  };

  const renderDetailPanel = () => {
    if (!selectedItem) return null;

    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(selectedItem.status)}
                <CardTitle className="text-lg truncate">{selectedItem.title}</CardTitle>
              </div>
              <CardDescription className="text-sm">{selectedItem.description}</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowDetailPanel(false)}
              className="ml-2"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={detailPanelTab} onValueChange={setDetailPanelTab}>
            <TabsList className="grid w-full grid-cols-5 mx-4 mb-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="assignments" className="text-xs">Roles</TabsTrigger>
              <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
              <TabsTrigger value="dependencies" className="text-xs">Dependencies</TabsTrigger>
              <TabsTrigger value="parameters" className="text-xs">Parameters</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[600px] px-4">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <ProcessOverview 
                  processId={selectedItem.id}
                  processName={selectedItem.title}
                />
              </TabsContent>

              <TabsContent value="assignments" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Role Assignments</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Process Owner</span>
                      </div>
                      <span className="text-sm">{selectedItem.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Approver</span>
                      </div>
                      <span className="text-sm">Manager</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Files ({selectedItem.files.length})</h4>
                    <Button size="sm" variant="outline" className="text-xs h-6">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  </div>
                  
                  {selectedItem.files.length === 0 ? (
                    <div className="text-center py-8">
                      <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No files attached</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedItem.files.map((file) => (
                        <div key={file.id} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <div>
                                <span className="text-sm font-medium">{file.name}</span>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>{file.type}</span>
                                  <span>{file.size}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {file.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="space-y-4 mt-0">
                <ProcessDependencies 
                  processId={selectedItem.id}
                  processName={selectedItem.title}
                />
              </TabsContent>

              <TabsContent value="parameters" className="space-y-4 mt-0">
                <ProcessParameters 
                  processId={selectedItem.id}
                  processName={selectedItem.title}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load workflow items</p>
          <Button onClick={refreshData} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Combined Task Center Summary and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Compact Summary Stats & App Filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.total}</span>
                  <span className="text-muted-foreground">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{stats.pending}</span>
                  <span className="text-muted-foreground">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{stats.inProgress}</span>
                  <span className="text-muted-foreground">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{stats.attestation}</span>
                  <span className="text-muted-foreground">Attestation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{stats.approval}</span>
                  <span className="text-muted-foreground">Approval</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                  <SelectTrigger className="h-8 w-48">
                    <SelectValue placeholder="Application" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    {applicationNames.filter(name => name !== 'all').map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            <Separator />

            {/* Filters Section */}
            <div className="space-y-3">
              {/* Search and Controls in one row */}
              <div className="flex items-center gap-3">
                {/* Search - takes more space */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-9 h-8"
                  />
                </div>

                {/* Filter Controls - compact */}
                <div className="flex items-center gap-2">
                  {/* Status Filter */}
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="NOTSTARTED">Not Started</SelectItem>
                      <SelectItem value="READY">Ready</SelectItem>
                      <SelectItem value="INPROGRESS">In Progress</SelectItem>
                      <SelectItem value="POSTMANUAL">Post Manual</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Priority Filter */}
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Assignee Filter */}
                  <Select value={filters.assignee} onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}>
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      <SelectItem value="me">Assigned to Me</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="businessDate">Business Date</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('card')}
                      className="h-8 px-3 rounded-r-none"
                    >
                      <List className="h-3 w-3 mr-1" />
                      Cards
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="h-8 px-3 rounded-l-none"
                    >
                      <Grid3X3 className="h-3 w-3 mr-1" />
                      Table
                    </Button>
                  </div>

                  {/* Clear Filters */}
                  {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || filters.search !== '') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ status: 'all', priority: 'all', assignee: 'all', search: '' })}
                      className="h-8 px-3"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters Display - only if there are active filters */}
              {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || filters.search !== '') && (
                <div className="flex flex-wrap gap-1">
                  {filters.status !== 'all' && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Status: {filters.status.replace('_', ' ')}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.priority !== 'all' && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Priority: {filters.priority}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => setFilters(prev => ({ ...prev, priority: 'all' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.assignee !== 'all' && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Assignee: {filters.assignee}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => setFilters(prev => ({ ...prev, assignee: 'all' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.search !== '' && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Search: "{filters.search}"
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        showDetailPanel ? "grid grid-cols-10 gap-6" : "grid grid-cols-1"
      )}>
        {/* Items List */}
        <div className={cn(
          "space-y-4",
          showDetailPanel ? "col-span-3" : "col-span-1"
        )}>
          {viewMode === 'table' ? (
            <ScrollArea className="h-[700px]">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No workflow items match your filters</p>
                </div>
              ) : (
                renderTableView()
              )}
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[700px]">
                  {renderCardView()}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detail Panel */}
        {showDetailPanel && (
          <div className="col-span-7">
            {renderDetailPanel()}
          </div>
        )}
      </div>
    </div>
  );
};