import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  Minus,
  Users,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useWorkflowInbox } from '@/hooks/useWorkflowInbox';
import ProcessOverview from '@/components/workflow/ProcessOverview';
import ProcessDependencies from '@/components/workflow/ProcessDependencies';
import ProcessParameters from '@/components/workflow/ProcessParameters';
import { AdvancedFilePreview } from '@/components/files/AdvancedFilePreview';

export interface UnifiedWorkflowInboxItemData {
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
    group: string;
    instance: string;
    role: string;
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
    isManual: boolean;
  };
}

interface UnifiedWorkflowInboxDashboardProps {
  className?: string;
}

export const UnifiedWorkflowInboxDashboard: React.FC<UnifiedWorkflowInboxDashboardProps> = ({
  className
}) => {
  const [selectedItem, setSelectedItem] = useState<UnifiedWorkflowInboxItemData | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedTab, setSelectedTab] = useState('userTrigger');
  const [selectedApplication, setSelectedApplication] = useState<string>('all');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    group: 'all',
    instance: 'all',
    role: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'businessDate'>('priority');
  const [inlineMessages, setInlineMessages] = useState<Record<string, string>>({});
  const [detailPanelTab, setDetailPanelTab] = useState('overview');
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const { items, loading, error, refreshData, assignToMe, triggerAction } = useWorkflowInbox();

  // Convert items to unified format
  const unifiedItems: UnifiedWorkflowInboxItemData[] = React.useMemo(() => {
    return items.map(item => ({
      ...item,
      metadata: {
        ...item.metadata,
        group: item.metadata.application, // Map application to group for compatibility
        instance: 'Daily Run', // Default instance
        role: 'Operator' // Default role
      }
    }));
  }, [items]);

  // Get unique values for filters
  const uniqueApplications = React.useMemo(() => {
    const appSet = new Set(unifiedItems.map(item => item.metadata.application));
    return ['all', ...Array.from(appSet)];
  }, [unifiedItems]);

  const uniqueGroups = React.useMemo(() => {
    const groupSet = new Set(unifiedItems.map(item => item.metadata.group));
    return Array.from(groupSet);
  }, [unifiedItems]);

  const uniqueInstances = React.useMemo(() => {
    const instanceSet = new Set(unifiedItems.map(item => item.metadata.instance));
    return Array.from(instanceSet);
  }, [unifiedItems]);

  const uniqueRoles = React.useMemo(() => {
    const roleSet = new Set(unifiedItems.map(item => item.metadata.role));
    return Array.from(roleSet);
  }, [unifiedItems]);

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    let filtered = unifiedItems.filter(item => {
      // Only show manual processes
      if (!item.metadata.isManual) return false;
      
      if (selectedApplication !== 'all' && item.metadata.application !== selectedApplication) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
      if (filters.group !== 'all' && item.metadata.group !== filters.group) return false;
      if (filters.instance !== 'all' && item.metadata.instance !== filters.instance) return false;
      if (filters.role !== 'all' && item.metadata.role !== filters.role) return false;
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
  }, [unifiedItems, filters, sortBy, selectedApplication]);

  // Get processes based on tab selection
  const getProcessesByTab = (tab: string) => {
    switch (tab) {
      case "userTrigger":
        return filteredItems.filter(p => p.status === "INPROGRESS" || p.status === "READY" || p.status === "POSTMANUAL");
      case "completed":
        return filteredItems.filter(p => p.status === "COMPLETED");
      case "notStarted":
        return filteredItems.filter(p => p.status === "NOTSTARTED");
      default:
        return filteredItems;
    }
  };

  const tabProcesses = getProcessesByTab(selectedTab);

  // Get summary stats
  const stats = React.useMemo(() => {
    const manualItems = unifiedItems.filter(item => item.metadata.isManual);
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
  }, [unifiedItems]);

  const handleItemClick = (item: UnifiedWorkflowInboxItemData) => {
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
        console.log('Rejecting item:', itemId, 'with message:', message);
      }
      
      setInlineMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[itemId];
        return newMessages;
      });
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
    }
  };

  // Handle process selection
  const handleProcessSelection = (processId: string) => {
    setSelectedProcesses(prev => 
      prev.includes(processId)
        ? prev.filter(id => id !== processId)
        : [...prev, processId]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(tabProcesses.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll state when individual selections change
  useEffect(() => {
    if (tabProcesses.length > 0 && selectedProcesses.length === tabProcesses.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedProcesses, tabProcesses]);

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
            NOT STARTED
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
            IN PROGRESS
          </span>
        );
      case 'POSTMANUAL':
        return (
          <span className={`${baseClasses} bg-orange-100 text-orange-800 border border-orange-300`}>
            POST MANUAL
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return "bg-green-500";
      case 'INPROGRESS':
        return "bg-blue-500";
      case 'READY':
        return "bg-amber-500";
      case 'FAILED':
        return "bg-red-500";
      case 'NOTSTARTED':
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderProcessItem = (item: UnifiedWorkflowInboxItemData) => {
    const isApprovalType = item.metadata.processControls.attest || item.status === 'POSTMANUAL';
    
    const hierarchyLevels = item.metadata.hierarchyPath
      ? item.metadata.hierarchyPath.split(' > ').slice(1)
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
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectAll} 
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all processes"
                />
              </TableHead>
              <TableHead>Process</TableHead>
              {selectedApplication === 'all' && <TableHead>Application</TableHead>}
              <TableHead>Group</TableHead>
              <TableHead>Instance</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabProcesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No processes found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              tabProcesses.map((process) => (
                <TableRow 
                  key={process.id} 
                  className={`relative ${selectedItem?.id === process.id ? "bg-muted/50" : ""}`}
                >
                  <TableCell className="relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(process.status)}`}></div>
                    <Checkbox 
                      checked={selectedProcesses.includes(process.id)}
                      onCheckedChange={() => handleProcessSelection(process.id)}
                      aria-label={`Select ${process.title}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell onClick={() => handleItemClick(process)} className="cursor-pointer">
                    <div>
                      <div className="font-medium">{process.title}</div>
                      <div className="text-xs text-muted-foreground">ID: {process.id}</div>
                    </div>
                  </TableCell>
                  {selectedApplication === 'all' && <TableCell>{process.metadata.application}</TableCell>}
                  <TableCell>{process.metadata.group}</TableCell>
                  <TableCell>{process.metadata.instance}</TableCell>
                  <TableCell>
                    <Badge variant={
                      process.priority === "high" ? "destructive" : 
                      process.priority === "medium" ? "default" : 
                      "outline"
                    }>
                      {process.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(process.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-muted/30">
                      <Users className="h-3 w-3 mr-1" />
                      {process.metadata.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleItemClick(process)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderCardView = () => {
    return (
      <div className="space-y-2 p-4">
        {tabProcesses.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No workflow items match your filters</p>
          </div>
        ) : (
          tabProcesses.map((item) => renderProcessItem(item))
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
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={detailPanelTab} onValueChange={setDetailPanelTab}>
            <TabsList className="grid w-full grid-cols-4 mx-4 mb-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
              <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">Audit History</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[600px] px-4">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <ProcessOverview 
                  processId={selectedItem.id}
                  processName={selectedItem.title}
                />
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

              <TabsContent value="comments" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Comments & Messages</h4>
                  {selectedItem.comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No comments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedItem.comments.map((comment) => (
                        <div key={comment.id} className="border rounded-md p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium text-sm">{comment.user}</span>
                              <Badge variant="outline" className="text-xs">
                                {comment.type}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Audit History</h4>
                  {selectedItem.history.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No history available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedItem.history.map((entry) => (
                        <div key={entry.id} className="border-l-2 border-muted pl-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{entry.action}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            by {entry.user}
                          </div>
                          {entry.details && (
                            <p className="text-sm mt-1">{entry.details}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    {uniqueApplications.filter(name => name !== 'all').map(name => (
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

            {/* Advanced Filters */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-9 h-8"
                  />
                </div>

                <div className="flex items-center gap-2">
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

                  {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || filters.search !== '') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ status: 'all', priority: 'all', assignee: 'all', group: 'all', instance: 'all', role: 'all', search: '' })}
                      className="h-8 px-3"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="userTrigger" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>User Trigger/Approval</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed</span>
          </TabsTrigger>
          <TabsTrigger value="notStarted" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Not Started</span>
          </TabsTrigger>
        </TabsList>

        {/* Bulk Actions */}
        {selectedProcesses.length > 0 && (
          <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md mt-4">
            <span className="text-sm font-medium">{selectedProcesses.length} processes selected</span>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <UserCheck className="mr-2 h-4 w-4" />
                    <span>Assign to Team</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span>Mark as Priority</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    <span>Mark as Complete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={() => setSelectedProcesses([])}>
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <TabsContent value="userTrigger" className="mt-4">
          <div className={cn(
            "transition-all duration-300",
            showDetailPanel ? "grid grid-cols-10 gap-6" : "grid grid-cols-1"
          )}>
            <div className={cn(
              "space-y-4",
              showDetailPanel ? "col-span-3" : "col-span-1"
            )}>
              {viewMode === 'table' ? (
                <ScrollArea className="h-[700px]">
                  {renderTableView()}
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

            {showDetailPanel && (
              <div className="col-span-7">
                {renderDetailPanel()}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className={cn(
            "transition-all duration-300",
            showDetailPanel ? "grid grid-cols-10 gap-6" : "grid grid-cols-1"
          )}>
            <div className={cn(
              "space-y-4",
              showDetailPanel ? "col-span-3" : "col-span-1"
            )}>
              {viewMode === 'table' ? (
                <ScrollArea className="h-[700px]">
                  {renderTableView()}
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

            {showDetailPanel && (
              <div className="col-span-7">
                {renderDetailPanel()}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notStarted" className="mt-4">
          <div className={cn(
            "transition-all duration-300",
            showDetailPanel ? "grid grid-cols-10 gap-6" : "grid grid-cols-1"
          )}>
            <div className={cn(
              "space-y-4",
              showDetailPanel ? "col-span-3" : "col-span-1"
            )}>
              {viewMode === 'table' ? (
                <ScrollArea className="h-[700px]">
                  {renderTableView()}
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

            {showDetailPanel && (
              <div className="col-span-7">
                {renderDetailPanel()}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};