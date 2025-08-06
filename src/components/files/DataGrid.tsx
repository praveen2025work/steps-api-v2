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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ArrowUpDown } from 'lucide-react';

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

interface DataTableProps&lt;TData, TValue&gt; {
  columns: ColumnDef&lt;TData, TValue&gt;[];
  data: TData[];
}

export function DataGrid&lt;TData, TValue&gt;({
  columns,
  data,
}: DataTableProps&lt;TData, TValue&gt;) {
  const [sorting, setSorting] = React.useState&lt;SortingState&gt;([]);
  const [columnFilters, setColumnFilters] = React.useState&lt;ColumnFiltersState&gt;([]);
  const [columnVisibility, setColumnVisibility] = React.useState&lt;VisibilityState&gt;({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
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

  return (
    &lt;div className="w-full space-y-4"&gt;
      &lt;div className="flex items-center justify-between"&gt;
        &lt;Input
          placeholder="Filter all columns..."
          value={globalFilter ?? ''}
          onChange={(event) =&gt;
            setGlobalFilter(String(event.target.value))
          }
          className="max-w-sm"
        /&gt;
        &lt;DropdownMenu&gt;
          &lt;DropdownMenuTrigger asChild&gt;
            &lt;Button variant="outline" className="ml-auto"&gt;
              Columns &lt;ChevronDown className="ml-2 h-4 w-4" /&gt;
            &lt;/Button&gt;
          &lt;/DropdownMenuTrigger&gt;
          &lt;DropdownMenuContent align="end"&gt;
            {table
              .getAllColumns()
              .filter((column) =&gt; column.getCanHide())
              .map((column) =&gt; {
                return (
                  &lt;DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =&gt;
                      column.toggleVisibility(!!value)
                    }
                  &gt;
                    {column.id}
                  &lt;/DropdownMenuCheckboxItem&gt;
                );
              })}
          &lt;/DropdownMenuContent&gt;
        &lt;/DropdownMenu&gt;
      &lt;/div&gt;
      &lt;div className="rounded-md border"&gt;
        &lt;Table&gt;
          &lt;TableHeader&gt;
            {table.getHeaderGroups().map((headerGroup) =&gt; (
              &lt;TableRow key={headerGroup.id}&gt;
                {headerGroup.headers.map((header) =&gt; {
                  return (
                    &lt;TableHead key={header.id}&gt;
                      {header.isPlaceholder
                        ? null
                        : (
                          &lt;div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none flex items-center'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          &gt;
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' ▲',
                              desc: ' ▼',
                            }[header.column.getIsSorted() as string] ?? null}
                          &lt;/div&gt;
                        )}
                    &lt;/TableHead&gt;
                  );
                })}
              &lt;/TableRow&gt;
            ))}
          &lt;/TableHeader&gt;
          &lt;TableBody&gt;
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) =&gt; (
                &lt;TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                &gt;
                  {row.getVisibleCells().map((cell) =&gt; (
                    &lt;TableCell key={cell.id}&gt;
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    &lt;/TableCell&gt;
                  ))}
                &lt;/TableRow&gt;
              ))
            ) : (
              &lt;TableRow&gt;
                &lt;TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                &gt;
                  No results.
                &lt;/TableCell&gt;
              &lt;/TableRow&gt;
            )}
          &lt;/TableBody&gt;
        &lt;/Table&gt;
      &lt;/div&gt;
      &lt;div className="flex items-center justify-between"&gt;
        &lt;div className="flex-1 text-sm text-muted-foreground"&gt;
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        &lt;/div&gt;
        &lt;div className="flex items-center space-x-6 lg:space-x-8"&gt;
          &lt;div className="flex items-center space-x-2"&gt;
            &lt;p className="text-sm font-medium"&gt;Rows per page&lt;/p&gt;
            &lt;select
              value={table.getState().pagination.pageSize}
              onChange={e =&gt; {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 w-[70px] text-sm"
            &gt;
              {[10, 20, 30, 40, 50].map(pageSize =&gt; (
                &lt;option key={pageSize} value={pageSize}&gt;
                  {pageSize}
                &lt;/option&gt;
              ))}
            &lt;/select&gt;
          &lt;/div&gt;
          &lt;div className="flex w-[100px] items-center justify-center text-sm font-medium"&gt;
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          &lt;/div&gt;
          &lt;div className="flex items-center space-x-2"&gt;
            &lt;Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =&gt; table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            &gt;
              &lt;span className="sr-only"&gt;Go to first page&lt;/span&gt;
              &lt;&lt;
            &lt;/Button&gt;
            &lt;Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =&gt; table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            &gt;
              &lt;span className="sr-only"&gt;Go to previous page&lt;/span&gt;
              &lt;
            &lt;/Button&gt;
            &lt;Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =&gt; table.nextPage()}
              disabled={!table.getCanNextPage()}
            &gt;
              &lt;span className="sr-only"&gt;Go to next page&lt;/span&gt;
              &gt;
            &lt;/Button&gt;
            &lt;Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =&gt; table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            &gt;
              &lt;span className="sr-only"&gt;Go to last page&lt;/span&gt;
              &gt;&gt;
            &lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}