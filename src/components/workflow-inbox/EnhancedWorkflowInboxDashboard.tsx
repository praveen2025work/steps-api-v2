import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowInboxFilters } from './WorkflowInboxFilters';
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

interface HierarchicalLevel {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  processes: WorkflowInboxItemData[];
  children?: HierarchicalLevel[];
}

interface EnhancedWorkflowInboxDashboardProps {
  className?: string;
}

export const EnhancedWorkflowInboxDashboard: React.FC<EnhancedWorkflowInboxDashboardProps> = ({
  className
}) => {
  const [selectedItem, setSelectedItem] = useState<WorkflowInboxItemData | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'businessDate'>('priority');
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [inlineMessages, setInlineMessages] = useState<Record<string, string>>({});
  const [detailPanelTab, setDetailPanelTab] = useState('overview');

  const { items, loading, error, refreshData, assignToMe, triggerAction } = useWorkflowInbox();

  // Initialize all applications as expanded
  useEffect(() => {
    if (items.length > 0) {
      const applications = new Set(items.map(item => item.metadata.application));
      setExpandedApplications(applications);
      
      // Also expand first level by default
      const firstLevels = new Set<string>();
      items.forEach(item => {
        const pathParts = item.metadata.hierarchyPath.split(' > ');
        if (pathParts.length > 2) {
          firstLevels.add(`${item.metadata.application}-level1`);
        }
      });
      setExpandedLevels(firstLevels);
    }
  }, [items]);

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    let filtered = items.filter(item => {
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
  }, [items, filters, sortBy]);

  // Create hierarchical structure
  const hierarchicalData = React.useMemo(() => {
    const appGroups: Record<string, HierarchicalLevel> = {};
    
    filteredItems.forEach(item => {
      const app = item.metadata.application;
      
      if (!appGroups[app]) {
        appGroups[app] = {
          id: app,
          name: app,
          level: 0,
          processes: [],
          children: []
        };
      }
      
      // Parse hierarchy path to create levels
      const pathParts = item.metadata.hierarchyPath.split(' > ').slice(1); // Remove 'Root'
      let currentLevel = appGroups[app];
      
      // Create nested levels based on hierarchy path
      for (let i = 1; i < pathParts.length - 1; i++) { // Skip app name and final process
        const levelName = pathParts[i];
        const levelId = `${app}-${levelName}-${i}`;
        
        let childLevel = currentLevel.children?.find(child => child.id === levelId);
        if (!childLevel) {
          childLevel = {
            id: levelId,
            name: levelName,
            level: i,
            parentId: currentLevel.id,
            processes: [],
            children: []
          };
          currentLevel.children = currentLevel.children || [];
          currentLevel.children.push(childLevel);
        }
        currentLevel = childLevel;
      }
      
      // Add process to the deepest level
      currentLevel.processes.push(item);
    });
    
    return Object.values(appGroups);
  }, [filteredItems]);

  // Get summary stats
  const stats = React.useMemo(() => {
    const total = items.length;
    const pending = items.filter(item => item.status === 'pending').length;
    const inProgress = items.filter(item => item.status === 'in_progress').length;
    const attestation = items.filter(item => item.metadata.processControls.attest).length;
    const approval = items.filter(item => item.metadata.processControls.attest || 
      item.status === 'requires_attention').length;

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

  const toggleApplicationExpansion = (application: string) => {
    const newExpanded = new Set(expandedApplications);
    if (newExpanded.has(application)) {
      newExpanded.delete(application);
    } else {
      newExpanded.add(application);
    }
    setExpandedApplications(newExpanded);
  };

  const toggleLevelExpansion = (levelId: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
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
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'requires_attention':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'blocked':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
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
    const isApprovalType = item.metadata.processControls.attest || item.status === 'requires_attention';
    const showInlineMessage = isApprovalType && inlineMessages[item.id] !== undefined;
    
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
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                      Auto
                    </Badge>
                  )}
                  {item.metadata.processControls.active && (
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )}
                  {item.metadata.processControls.attest && (
                    <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                      Attest
                    </Badge>
                  )}
                  {item.metadata.processControls.lock && (
                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{item.metadata.stage}</span>
                  <span>•</span>
                  <span>{item.metadata.substage}</span>
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
                  className="text-xs h-6 px-2"
                  disabled={item.status === 'blocked'}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Trigger
                </Button>
                
                {!isApprovalType && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 px-2"
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHierarchicalLevel = (level: HierarchicalLevel, depth: number = 0) => {
    const isExpanded = expandedLevels.has(level.id);
    const hasChildren = level.children && level.children.length > 0;
    const hasProcesses = level.processes.length > 0;
    const totalItems = level.processes.length + (level.children?.reduce((sum, child) => sum + child.processes.length, 0) || 0);

    return (
      <div key={level.id} className="space-y-2">
        {/* Level Header */}
        {depth > 0 && (
          <div 
            className={cn(
              "flex items-center gap-2 p-2 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
              `ml-${depth * 4}`
            )}
            onClick={() => toggleLevelExpansion(level.id)}
          >
            {hasChildren || hasProcesses ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
            <span className="font-medium text-sm">Level {depth}: {level.name}</span>
            <Badge variant="secondary" className="text-xs">
              {totalItems}
            </Badge>
          </div>
        )}

        {/* Level Content */}
        {(depth === 0 || isExpanded) && (
          <div className={cn("space-y-2", depth > 0 && `ml-${(depth + 1) * 4}`)}>
            {/* Render processes at this level */}
            {hasProcesses && level.processes.map(process => renderProcessItem(process))}
            
            {/* Render child levels */}
            {hasChildren && level.children!.map(childLevel => 
              renderHierarchicalLevel(childLevel, depth + 1)
            )}
          </div>
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
      {/* Combined Statistics Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Task Center Summary</CardTitle>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <PlayCircle className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{stats.inProgress}</span>
              </div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{stats.attestation}</span>
              </div>
              <p className="text-sm text-muted-foreground">Attestation</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.approval}</span>
              </div>
              <p className="text-sm text-muted-foreground">Approval</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters - Full Width */}
      <WorkflowInboxFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Workflow Items ({filteredItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[700px]">
                <div className="space-y-4 p-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No workflow items match your filters</p>
                    </div>
                  ) : (
                    hierarchicalData.map((appLevel) => (
                      <div key={appLevel.id} className="space-y-2">
                        {/* Application Header */}
                        <div 
                          className="flex items-center gap-2 p-3 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => toggleApplicationExpansion(appLevel.id)}
                        >
                          {expandedApplications.has(appLevel.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Database className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{appLevel.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {appLevel.processes.length + (appLevel.children?.reduce((sum, child) => sum + child.processes.length, 0) || 0)}
                          </Badge>
                        </div>

                        {/* Application Content */}
                        {expandedApplications.has(appLevel.id) && (
                          <div className="ml-6 space-y-2">
                            {/* Render hierarchical levels */}
                            {appLevel.children && appLevel.children.length > 0 ? (
                              appLevel.children.map(childLevel => 
                                renderHierarchicalLevel(childLevel, 1)
                              )
                            ) : (
                              // Render processes directly if no hierarchy
                              appLevel.processes.map(process => renderProcessItem(process))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
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