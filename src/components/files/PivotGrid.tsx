import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  ColumnDef,
  flexRender,
  Row,
  Cell,
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
import { ChevronsRight, ChevronsDown, Minus } from 'lucide-react';

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
  const [grouping, setGrouping] = React.useState<string[]>([]);
  const [aggregation, setAggregation] = React.useState<Record<string, AggregationFn>>({});

  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    return initialColumns.map(col => ({
      ...col,
      aggregationFn: col.id && aggregation[col.id] ? aggregationFns[aggregation[col.id]] : undefined,
      aggregatedCell: ({ getValue }) => <div style={{ textAlign: 'right' }}>{getValue()}</div>,
    }));
  }, [initialColumns, aggregation]);

  const table = useReactTable({
    data,
    columns,
    state: {
      grouping,
    },
    onGroupingChange: setGrouping,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const potentialGroupingColumns = initialColumns
    .filter(c => c.accessorKey)
    .map(c => c.id || c.accessorKey!.toString());

  const potentialAggregationColumns = initialColumns
    .filter(c => c.accessorKey)
    .map(c => c.id || c.accessorKey!.toString());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 p-4 border rounded-md">
        <div className="flex-1 min-w-[200px]">
          <Label>Group By</Label>
          <Select onValueChange={value => setGrouping(value === 'none' ? [] : (value ? [value] : []))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a column to group..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {potentialGroupingColumns.map(col => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {potentialAggregationColumns.map(colId => (
          <div key={colId} className="flex-1 min-w-[200px]">
            <Label>Aggregate: {colId}</Label>
            <Select
              onValueChange={value =>
                setAggregation(prev => ({ ...prev, [colId]: value as AggregationFn }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Aggregation..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} style={{ paddingLeft: `${row.depth * 2}rem` }}>
                    {cell.getIsGrouped() ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={row.getToggleExpandedHandler()}
                          className="mr-2"
                        >
                          {row.getIsExpanded() ? <ChevronsDown /> : <ChevronsRight />}
                        </Button>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}{' '}
                        ({row.subRows.length})
                      </>
                    ) : cell.getIsAggregated() ? (
                      flexRender(
                        cell.column.columnDef.aggregatedCell ??
                          cell.column.columnDef.cell,
                        cell.getContext()
                      )
                    ) : cell.getIsPlaceholder() ? null : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}