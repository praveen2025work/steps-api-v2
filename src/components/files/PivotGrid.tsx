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
  sum: (leafValues: number[]) =&gt; leafValues.reduce((a, b) =&gt; a + b, 0),
  count: (leafValues: any[]) =&gt; leafValues.length,
  average: (leafValues: number[]) =&gt;
    leafValues.reduce((a, b) =&gt; a + b, 0) / leafValues.length,
};

type AggregationFn = keyof typeof aggregationFns;

export function PivotGrid<TData extends object>({
  data,
  columns: initialColumns,
}: PivotGridProps<TData>) {
  const [grouping, setGrouping] = React.useState<string[]>([]);
  const [aggregation, setAggregation] = React.useState<Record<string, AggregationFn>>({});

  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    return initialColumns.map(col =&gt; ({
      ...col,
      aggregationFn: col.id && aggregation[col.id] ? aggregationFns[aggregation[col.id]] : undefined,
      aggregatedCell: ({ getValue }) =&gt; &lt;div style={{ textAlign: 'right' }}&gt;{getValue()}&lt;/div&gt;,
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
    .filter(c =&gt; c.accessorKey)
    .map(c =&gt; c.id || c.accessorKey!.toString());

  const potentialAggregationColumns = initialColumns
    .filter(c =&gt; c.accessorKey)
    .map(c =&gt; c.id || c.accessorKey!.toString());

  return (
    &lt;div className="space-y-4"&gt;
      &lt;div className="flex flex-wrap gap-4 p-4 border rounded-md"&gt;
        &lt;div className="flex-1 min-w-[200px]"&gt;
          &lt;Label&gt;Group By&lt;/Label&gt;
          &lt;Select onValueChange={value =&gt; setGrouping(value ? [value] : [])}&gt;
            &lt;SelectTrigger&gt;
              &lt;SelectValue placeholder="Select a column to group..." /&gt;
            &lt;/SelectTrigger&gt;
            &lt;SelectContent&gt;
              &lt;SelectItem value=""&gt;None&lt;/SelectItem&gt;
              {potentialGroupingColumns.map(col =&gt; (
                &lt;SelectItem key={col} value={col}&gt;{col}&lt;/SelectItem&gt;
              ))}
            &lt;/SelectContent&gt;
          &lt;/Select&gt;
        &lt;/div&gt;
        {potentialAggregationColumns.map(colId =&gt; (
          &lt;div key={colId} className="flex-1 min-w-[200px]"&gt;
            &lt;Label&gt;Aggregate: {colId}&lt;/Label&gt;
            &lt;Select
              onValueChange={value =&gt;
                setAggregation(prev =&gt; ({ ...prev, [colId]: value as AggregationFn }))
              }
            &gt;
              &lt;SelectTrigger&gt;
                &lt;SelectValue placeholder="Aggregation..." /&gt;
              &lt;/SelectTrigger&gt;
              &lt;SelectContent&gt;
                &lt;SelectItem value="count"&gt;Count&lt;/SelectItem&gt;
                &lt;SelectItem value="sum"&gt;Sum&lt;/SelectItem&gt;
                &lt;SelectItem value="average"&gt;Average&lt;/SelectItem&gt;
              &lt;/SelectContent&gt;
            &lt;/Select&gt;
          &lt;/div&gt;
        ))}
      &lt;/div&gt;
      &lt;div className="rounded-md border"&gt;
        &lt;Table&gt;
          &lt;TableHeader&gt;
            {table.getHeaderGroups().map(headerGroup =&gt; (
              &lt;TableRow key={headerGroup.id}&gt;
                {headerGroup.headers.map(header =&gt; (
                  &lt;TableHead key={header.id}&gt;
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  &lt;/TableHead&gt;
                ))}
              &lt;/TableRow&gt;
            ))}
          &lt;/TableHeader&gt;
          &lt;TableBody&gt;
            {table.getRowModel().rows.map(row =&gt; (
              &lt;TableRow key={row.id}&gt;
                {row.getVisibleCells().map(cell =&gt; (
                  &lt;TableCell key={cell.id} style={{ paddingLeft: `${row.depth * 2}rem` }}&gt;
                    {cell.getIsGrouped() ? (
                      &lt;&gt;
                        &lt;Button
                          variant="ghost"
                          size="sm"
                          onClick={row.getToggleExpandedHandler()}
                          className="mr-2"
                        &gt;
                          {row.getIsExpanded() ? &lt;ChevronsDown /&gt; : &lt;ChevronsRight /&gt;}
                        &lt;/Button&gt;
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}{' '}
                        ({row.subRows.length})
                      &lt;/&gt;
                    ) : cell.getIsAggregated() ? (
                      flexRender(
                        cell.column.columnDef.aggregatedCell ??
                          cell.column.columnDef.cell,
                        cell.getContext()
                      )
                    ) : cell.getIsPlaceholder() ? null : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  &lt;/TableCell&gt;
                ))}
              &lt;/TableRow&gt;
            ))}
          &lt;/TableBody&gt;
        &lt;/Table&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}