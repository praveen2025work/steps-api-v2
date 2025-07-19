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
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFilterCount()} active
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-7"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-blue-500" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="requires_attention">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      Requires Attention
                    </div>
                  </SelectItem>
                  <SelectItem value="blocked">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                      Blocked
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-green-500" />
                      Completed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Low
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Assignee</label>
              <Select value={filters.assignee} onValueChange={(value) => updateFilter('assignee', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="me">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Assigned to Me
                    </div>
                  </SelectItem>
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      Unassigned
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Sort By</label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-3 w-3" />
                      Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="dueDate">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Due Date
                    </div>
                  </SelectItem>
                  <SelectItem value="businessDate">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Business Date
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filters.status}
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
                <Badge variant="secondary" className="text-xs">
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
                <Badge variant="secondary" className="text-xs">
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
                <Badge variant="secondary" className="text-xs">
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