import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  FilterFn,
  Row,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronDown, 
  ArrowUpDown, 
  Filter, 
  X, 
  Search,
  FilterX
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

interface FilterableDataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sheetName?: string;
  fileName?: string;
  fileType?: 'excel' | 'csv' | 'json';
}

interface ColumnFilter {
  columnId: string;
  value: string;
  type: 'contains' | 'equals' | 'startsWith' | 'endsWith';
}

export function FilterableDataGrid<TData, TValue>({
  columns,
  data,
  sheetName,
  fileName,
  fileType = 'csv',
}: FilterableDataGridProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [advancedFilters, setAdvancedFilters] = React.useState<ColumnFilter[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

  // Determine if we need pagination (only for datasets > 20,000 records)
  const needsPagination = data.length > 20000;
  const initialPageSize = needsPagination ? 10000 : data.length;

  // Get unique values for each column for filter dropdowns
  const columnUniqueValues = React.useMemo(() => {
    const uniqueValues: Record<string, string[]> = {};
    
    columns.forEach((column) => {
      const columnId = column.id || (column.accessorKey as string);
      if (columnId) {
        const values = data
          .map((row: any) => String(row[columnId] || ''))
          .filter((value, index, array) => value && array.indexOf(value) === index)
          .sort();
        uniqueValues[columnId] = values.slice(0, 100); // Limit to 100 unique values for performance
      }
    });
    
    return uniqueValues;
  }, [columns, data]);

  // Apply advanced filters to the data
  const filteredData = React.useMemo(() => {
    if (advancedFilters.length === 0) return data;
    
    return data.filter((row: any) => {
      return advancedFilters.every((filter) => {
        const cellValue = String(row[filter.columnId] || '').toLowerCase();
        const filterValue = filter.value.toLowerCase();
        
        switch (filter.type) {
          case 'equals':
            return cellValue === filterValue;
          case 'startsWith':
            return cellValue.startsWith(filterValue);
          case 'endsWith':
            return cellValue.endsWith(filterValue);
          case 'contains':
          default:
            return cellValue.includes(filterValue);
        }
      });
    });
  }, [data, advancedFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  const addAdvancedFilter = () => {
    const availableColumns = columns.filter(col => {
      const columnId = col.id || (col.accessorKey as string);
      return columnId && !advancedFilters.some(f => f.columnId === columnId);
    });
    
    if (availableColumns.length > 0) {
      const firstColumn = availableColumns[0];
      const columnId = firstColumn.id || (firstColumn.accessorKey as string);
      
      setAdvancedFilters([...advancedFilters, {
        columnId: columnId!,
        value: '',
        type: 'contains'
      }]);
    }
  };

  const updateAdvancedFilter = (index: number, updates: Partial<ColumnFilter>) => {
    const newFilters = [...advancedFilters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setAdvancedFilters(newFilters);
  };

  const removeAdvancedFilter = (index: number) => {
    setAdvancedFilters(advancedFilters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setGlobalFilter('');
    setColumnFilters([]);
    setAdvancedFilters([]);
  };

  const getFilterContext = () => {
    if (fileType === 'excel' && sheetName) {
      return `Sheet: ${sheetName}`;
    } else if (fileName) {
      return `File: ${fileName}`;
    }
    return 'Data';
  };

  const activeFiltersCount = advancedFilters.filter(f => f.value.trim()).length + 
    (globalFilter ? 1 : 0) + 
    columnFilters.length;

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search in ${getFilterContext()}...`}
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="max-w-sm pl-8"
            />
          </div>
          {globalFilter && (
            <Button
              variant="ghost"
              onClick={() => setGlobalFilter('')}
              className="h-8 px-2 lg:px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "h-8",
              showAdvancedFilters && "bg-muted"
            )}
          >
            <Filter className="h-4 w-4 mr-1" />
            Advanced
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length.toLocaleString()} of {data.length.toLocaleString()} records
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="mb-4 p-4 border rounded-lg bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Advanced Filters - {getFilterContext()}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addAdvancedFilter}
              disabled={advancedFilters.length >= columns.length}
            >
              Add Filter
            </Button>
          </div>
          
          {advancedFilters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No advanced filters applied. Click "Add Filter" to get started.</p>
          ) : (
            <div className="space-y-2">
              {advancedFilters.map((filter, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={filter.columnId}
                    onValueChange={(value) => updateAdvancedFilter(index, { columnId: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => {
                        const columnId = column.id || (column.accessorKey as string);
                        return columnId ? (
                          <SelectItem key={columnId} value={columnId}>
                            {columnId}
                          </SelectItem>
                        ) : null;
                      })}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filter.type}
                    onValueChange={(value: any) => updateAdvancedFilter(index, { type: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="startsWith">Starts with</SelectItem>
                      <SelectItem value="endsWith">Ends with</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Filter value..."
                    value={filter.value}
                    onChange={(e) => updateAdvancedFilter(index, { value: e.target.value })}
                    className="flex-1"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdvancedFilter(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Data Table */}
      <div className="flex-1 min-h-0 rounded-md border">
        <ScrollArea className="h-full w-full">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : (
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? 'cursor-pointer select-none flex items-center'
                                    : '',
                                  onClick: header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: ' ▲',
                                  desc: ' ▼',
                                }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
      
      {/* Pagination */}
      {needsPagination && (
        <div className="flex items-center justify-between mt-4 flex-shrink-0">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="h-8 w-[80px] text-sm border rounded px-2"
              >
                {[1000, 5000, 10000, 20000].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                {'<<'}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                {'<'}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                {'>'}
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                {'>>'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}