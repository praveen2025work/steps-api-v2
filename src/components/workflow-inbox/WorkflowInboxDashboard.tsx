import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowInboxItem } from './WorkflowInboxItem';
import { ModernWorkflowDetailPanel } from './ModernWorkflowDetailPanel';
import { WorkflowInboxFilters } from './WorkflowInboxFilters';
import { useWorkflowInbox } from '@/hooks/useWorkflowInbox';

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
  estimatedDuration: number; // in minutes
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

export const WorkflowInboxDashboard: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<WorkflowInboxItemData | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'businessDate'>('priority');
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());

  const { items, loading, error, refreshData, assignToMe, triggerAction } = useWorkflowInbox();

  // Initialize all applications as expanded
  useEffect(() => {
    if (items.length > 0) {
      const applications = new Set(items.map(item => item.metadata.application));
      setExpandedApplications(applications);
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

    // Sort items
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

  // Group items by application
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, WorkflowInboxItemData[]> = {};
    filteredItems.forEach(item => {
      const app = item.metadata.application;
      if (!groups[app]) {
        groups[app] = [];
      }
      groups[app].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Get summary stats
  const stats = React.useMemo(() => {
    const total = items.length;
    const pending = items.filter(item => item.status === 'pending').length;
    const inProgress = items.filter(item => item.status === 'in_progress').length;
    const requiresAttention = items.filter(item => item.status === 'requires_attention').length;
    const highPriority = items.filter(item => item.priority === 'high').length;
    const assignedToMe = items.filter(item => item.assignedTo === 'current_user').length;

    return {
      total,
      pending,
      inProgress,
      requiresAttention,
      highPriority,
      assignedToMe
    };
  }, [items]);

  const handleItemClick = (item: WorkflowInboxItemData) => {
    setSelectedItem(item);
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

  const toggleApplicationExpansion = (application: string) => {
    const newExpanded = new Set(expandedApplications);
    if (newExpanded.has(application)) {
      newExpanded.delete(application);
    } else {
      newExpanded.add(application);
    }
    setExpandedApplications(newExpanded);
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
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
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
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="font-medium">{stats.requiresAttention}</span>
            <span className="text-muted-foreground">Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-500" />
            <span className="font-medium">{stats.assignedToMe}</span>
            <span className="text-muted-foreground">Mine</span>
          </div>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <ArrowRight className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

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
        selectedItem ? "grid grid-cols-10 gap-6" : "grid grid-cols-1"
      )}>
        {/* Items List */}
        <div className={cn(
          "space-y-4",
          selectedItem ? "col-span-3" : "col-span-1"
        )}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Workflow Items ({filteredItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[700px]">
                <div className="space-y-3 p-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No workflow items match your filters</p>
                    </div>
                  ) : (
                    Object.entries(groupedItems).map(([application, appItems]) => (
                      <div key={application} className="space-y-2">
                        {/* Application Header */}
                        <div 
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => toggleApplicationExpansion(application)}
                        >
                          {expandedApplications.has(application) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">{application}</span>
                          <Badge variant="secondary" className="text-xs">
                            {appItems.length}
                          </Badge>
                        </div>

                        {/* Application Items */}
                        {expandedApplications.has(application) && (
                          <div className="space-y-2 ml-6">
                            {appItems.map((item) => (
                              <WorkflowInboxItem
                                key={item.id}
                                item={item}
                                isSelected={selectedItem?.id === item.id}
                                onClick={() => handleItemClick(item)}
                                onAssignToMe={() => handleAssignToMe(item.id)}
                                onTriggerAction={() => handleTriggerAction(item.id)}
                              />
                            ))}
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

        {/* Detail Panel - Only show when item is selected */}
        {selectedItem && (
          <div className="col-span-7">
            <ModernWorkflowDetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onAssignToMe={() => handleAssignToMe(selectedItem.id)}
              onTriggerAction={() => handleTriggerAction(selectedItem.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};