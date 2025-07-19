import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  SortDesc, 
  X,
  Clock,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';

interface WorkflowInboxFiltersProps {
  filters: {
    status: string;
    priority: string;
    assignee: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  sortBy: 'priority' | 'dueDate' | 'businessDate';
  onSortChange: (sortBy: 'priority' | 'dueDate' | 'businessDate') => void;
}

export const WorkflowInboxFilters: React.FC<WorkflowInboxFiltersProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange
}) => {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      assignee: 'all',
      search: ''
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.assignee !== 'all' || 
                          filters.search !== '';

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.assignee !== 'all') count++;
    if (filters.search !== '') count++;
    return count;
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Search and Controls in one row */}
          <div className="flex items-center gap-3">
            {/* Search - takes more space */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            {/* Filter Controls - compact */}
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="h-8 w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="requires_attention">Attention</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
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
              <Select value={filters.assignee} onValueChange={(value) => updateFilter('assignee', value)}>
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
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="h-8 w-32">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="businessDate">Business Date</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-3"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display - only if there are active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1">
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="text-xs h-5">
                  Status: {filters.status.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => updateFilter('status', 'all')}
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
                    onClick={() => updateFilter('priority', 'all')}
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
                    onClick={() => updateFilter('assignee', 'all')}
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
                    onClick={() => updateFilter('search', '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};