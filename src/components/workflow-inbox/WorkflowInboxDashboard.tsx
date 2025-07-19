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
  SortDesc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowInboxItem } from './WorkflowInboxItem';
import { WorkflowDetailPanel } from './WorkflowDetailPanel';
import { WorkflowInboxFilters } from './WorkflowInboxFilters';
import { useWorkflowInbox } from '@/hooks/useWorkflowInbox';

export interface WorkflowInboxItemData {
  id: string;
  title: string;
  description: string;
  processName: string;
  businessDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'requires_attention' | 'blocked';
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

  const { items, loading, error, refreshData, assignToMe, triggerAction } = useWorkflowInbox();

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
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.requiresAttention}</p>
                <p className="text-xs text-muted-foreground">Needs Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.highPriority}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.assignedToMe}</p>
                <p className="text-xs text-muted-foreground">Assigned to Me</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Filters and List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <WorkflowInboxFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Workflow Items ({filteredItems.length})</span>
                <Button onClick={refreshData} variant="outline" size="sm">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No workflow items match your filters</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <WorkflowInboxItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItem?.id === item.id}
                        onClick={() => handleItemClick(item)}
                        onAssignToMe={() => handleAssignToMe(item.id)}
                        onTriggerAction={() => handleTriggerAction(item.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Detail View */}
        <div className="lg:col-span-1">
          {selectedItem ? (
            <WorkflowDetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onAssignToMe={() => handleAssignToMe(selectedItem.id)}
              onTriggerAction={() => handleTriggerAction(selectedItem.id)}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a workflow item to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};