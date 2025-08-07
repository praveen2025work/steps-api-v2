import React, { useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  GroupingState,
  ExpandedState,
  SortingState,
  ColumnFiltersState,
  Row,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Minus, Plus, X } from 'lucide-react';

interface PivotGridProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
}

const aggregationFns = {
  sum: (leafValues: number[]) => leafValues.reduce((a, b) => a + b, 0),
  count: (leafValues: any[]) => leafValues.length,
  average: (leafValues: number[]) =>
    leafValues.reduce((a, b) => a + b, 0) / leafValues.length,
};

type AggregationFn = keyof typeof aggregationFns;

export function PivotGrid<TData extends object>({
  data,
  columns: initialColumns,
}: PivotGridProps<TData>) {
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedGroupColumn, setSelectedGroupColumn] = useState<string>('');
  const [aggregation, setAggregation] = useState<Record<string, AggregationFn>>({});

  // Memoized groupable columns to prevent re-renders
  const groupableColumns = useMemo(() => {
    return initialColumns
      .filter(c => c.accessorKey)
      .map(c => ({
        id: c.id || c.accessorKey!.toString(),
        header: c.header as string,
        accessorKey: c.accessorKey!.toString()
      }));
  }, [initialColumns]);

  // Memoized callback functions to prevent cursor jumping
  const handleGroupByColumn = useCallback((columnId: string) => {
    if (columnId && columnId !== 'none' && !grouping.includes(columnId)) {
      setGrouping(prev => [...prev, columnId]);
      setSelectedGroupColumn('');
    } else if (columnId === 'none') {
      setGrouping([]);
      setExpanded({});
    }
  }, [grouping]);

  const removeGrouping = useCallback((columnId: string) => {
    setGrouping(prev => prev.filter(id => id !== columnId));
    // Clear expanded state when removing grouping
    setExpanded({});
  }, []);

  const clearAllGrouping = useCallback(() => {
    setGrouping([]);
    setExpanded({});
  }, []);

  // Enhanced columns with stable references and proper aggregation
  const enhancedColumns = useMemo<ColumnDef<TData>[]>(() => {
    return initialColumns.map(col => ({
      ...col,
      aggregationFn: col.id && aggregation[col.id] ? aggregationFns[aggregation[col.id]] : undefined,
      aggregatedCell: ({ getValue }) => (
        <div className="text-right font-medium text-primary">
          {getValue()?.toString() || '0'}
        </div>
      ),
      cell: ({ row, getValue, cell }) => {
        const value = getValue();
        
        // If this is a grouped row, show group info with expand/collapse
        if (cell.getIsGrouped()) {
          const groupValue = value?.toString() || 'Unknown';
          const subRowCount = row.subRows?.length || 0;
          
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  row.getToggleExpandedHandler()();
                }}
                className="p-1 h-6 w-6 hover:bg-muted"
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
              <Badge variant="secondary" className="text-xs">
                <strong>{groupValue}</strong> ({subRowCount} items)
              </Badge>
            </div>
          );
        }

        // If this is an aggregated cell, use the aggregated cell renderer
        if (cell.getIsAggregated()) {
          return (
            <div className="text-right font-medium text-primary">
              {value?.toString() || '0'}
            </div>
          );
        }

        // If this is a placeholder cell, don't render anything
        if (cell.getIsPlaceholder()) {
          return null;
        }

        // Regular cell rendering for leaf rows
        return <span className="text-sm">{value?.toString() || ''}</span>;
      },
    }));
  }, [initialColumns, aggregation]);

  // Stable table configuration
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: {
      grouping,
      expanded,
      sorting,
      columnFilters,
      globalFilter,
    },
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableGrouping: true,
    enableExpanding: true,
    // Prevent unnecessary re-renders
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  });

  // Memoized row rendering to prevent cursor jumping
  const tableRows = useMemo(() => {
    return table.getRowModel().rows.map((row) => {
      const isGrouped = row.getIsGrouped();
      
      return (
        <TableRow
          key={row.id}
          className={`${
            isGrouped 
              ? 'bg-muted/30 hover:bg-muted/50 font-medium cursor-pointer' 
              : 'hover:bg-muted/20'
          }`}
          onClick={isGrouped ? () => row.getToggleExpandedHandler()() : undefined}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell 
              key={cell.id} 
              style={{ paddingLeft: `${row.depth * 1.5}rem` }}
              className="py-2"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    });
  }, [table]);

  return (
    <div className="space-y-4">
      {/* Pivot Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Group by:</Label>
          <Select value={selectedGroupColumn} onValueChange={setSelectedGroupColumn}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select column to group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {groupableColumns.map((col) => (
                <SelectItem 
                  key={col.id} 
                  value={col.id}
                  disabled={grouping.includes(col.id)}
                >
                  {col.header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => handleGroupByColumn(selectedGroupColumn)}
            disabled={!selectedGroupColumn || selectedGroupColumn === 'none'}
            size="sm"
          >
            Add Group
          </Button>
        </div>

        {/* Active Groupings */}
        {grouping.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Grouped by:</span>
            {grouping.map((columnId) => {
              const column = groupableColumns.find(col => col.id === columnId);
              return (
                <Badge key={columnId} variant="outline" className="gap-1">
                  {column?.header || columnId}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGrouping(columnId);
                    }}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              );
            })}
            <Button variant="outline" size="sm" onClick={clearAllGrouping}>
              Clear All
            </Button>
          </div>
        )}

        {/* Expand/Collapse All */}
        {grouping.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.toggleAllRowsExpanded(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.toggleAllRowsExpanded(false)}
            >
              <Minus className="h-3 w-3 mr-1" />
              Collapse All
            </Button>
          </div>
        )}

        {/* Global Filter */}
        <div className="flex items-center gap-2 ml-auto">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Aggregation Controls */}
      {grouping.length > 0 && (
        <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-background">
          <Label className="text-sm font-medium">Aggregations:</Label>
          {groupableColumns.map(col => (
            <div key={col.id} className="flex items-center gap-2">
              <Label className="text-xs">{col.header}:</Label>
              <Select
                value={aggregation[col.id] || ''}
                onValueChange={value =>
                  setAggregation(prev => ({ 
                    ...prev, 
                    [col.id]: value ? value as AggregationFn : undefined 
                  }))
                }
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="border-b">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Showing {table.getRowModel().rows.length} rows
          {grouping.length > 0 && ` (grouped by ${grouping.length} column${grouping.length > 1 ? 's' : ''})`}
        </div>
        <div>
          {table.getRowModel().rows.filter(row => row.getIsGrouped()).length} groups, {' '}
          {table.getRowModel().rows.filter(row => !row.getIsGrouped()).length} items
        </div>
      </div>
    </div>
  );
}