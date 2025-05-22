import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";

interface FilterableDataGridProps {
  data: any[];
  title?: string;
}

const FilterableDataGrid: React.FC<FilterableDataGridProps> = ({ data, title }) => {
  // Validate input data and use sample data if invalid
  const validData = data && Array.isArray(data) && data.length > 0 && data.every(item => item && typeof item === 'object');
  
  // Create a safe copy of the data or use sample data
  const sampleData = validData ? JSON.parse(JSON.stringify(data)) : [
    { id: 1, date: '2025-05-01', region: 'EMEA', product: 'FX', amount: 1250000, status: 'Completed' },
    { id: 2, date: '2025-05-01', region: 'APAC', product: 'Rates', amount: 2340000, status: 'Completed' },
    { id: 3, date: '2025-05-01', region: 'AMER', product: 'FX', amount: 1890000, status: 'Completed' },
    { id: 4, date: '2025-05-02', region: 'EMEA', product: 'Rates', amount: 1450000, status: 'Completed' },
    { id: 5, date: '2025-05-02', region: 'APAC', product: 'FX', amount: 1670000, status: 'Pending' },
    { id: 6, date: '2025-05-02', region: 'AMER', product: 'Rates', amount: 2120000, status: 'Processing' },
    { id: 7, date: '2025-05-03', region: 'EMEA', product: 'FX', amount: 1340000, status: 'Completed' },
    { id: 8, date: '2025-05-03', region: 'APAC', product: 'Rates', amount: 1980000, status: 'Failed' },
    { id: 9, date: '2025-05-03', region: 'AMER', product: 'FX', amount: 2250000, status: 'Completed' },
    { id: 10, date: '2025-05-04', region: 'EMEA', product: 'Rates', amount: 1560000, status: 'Processing' },
    { id: 11, date: '2025-05-04', region: 'APAC', product: 'FX', amount: 1890000, status: 'Completed' },
    { id: 12, date: '2025-05-04', region: 'AMER', product: 'Rates', amount: 2340000, status: 'Pending' },
  ];

  // Get all columns from the data
  const columns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0] || {}) : [];

  // State for sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // State for filters
  const [filters, setFilters] = useState<Record<string, string>>({});

  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns);

  // Apply sorting and filtering
  const sortedAndFilteredData = useMemo(() => {
    let filteredData = [...sampleData];
    
    // Apply filters
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filteredData = filteredData.filter(item => 
          String(item[column]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });
    
    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  }, [sampleData, sortConfig, filters]);

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Handle filter change
  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column: string) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter(col => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  // Format value based on type
  const formatValue = (value: any) => {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '-';
    }
    
    try {
      if (typeof value === 'number') {
        // Check if it's a valid number
        if (isNaN(value)) {
          return '-';
        }
        
        // Check if it looks like a currency amount
        if (value > 1000) {
          try {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          } catch (e) {
            return `$${value.toLocaleString()}`;
          }
        }
        return value.toLocaleString();
      }
      
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      // Handle status with simple text instead of components to avoid rendering issues
      if (typeof value === 'string' && ['Completed', 'Processing', 'Pending', 'Failed'].includes(value)) {
        return value;
      }
      
      // Handle dates
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          // If date parsing fails, just return the string
        }
      }
      
      // Safely convert to string
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value);
        } catch (e) {
          return '[Object]';
        }
      } else {
        return String(value);
      }
    } catch (error) {
      console.error("Error formatting value:", error, "type:", typeof value);
      return '-'; // Return a safe default if formatting fails
    }
  };

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {columns.map(column => (
                <DropdownMenuItem key={column} onClick={() => toggleColumnVisibility(column)}>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={visibleColumns.includes(column)} 
                      onChange={() => {}} 
                      className="h-4 w-4"
                    />
                    {column}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {Object.keys(filters).length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {sortedAndFilteredData.length} of {sampleData.length} rows
        </div>
      </div>
      
      <div className="rounded-md border overflow-x-auto data-grid-container">
          <Table className="data-grid">
            <TableHeader>
              <TableRow>
                {visibleColumns.map(column => (
                  <TableHead key={column} className="min-w-[150px]">
                    <div className="flex flex-col gap-2">
                      <div 
                        className="flex items-center gap-1 cursor-pointer" 
                        onClick={() => handleSort(column)}
                      >
                        {column}
                        {sortConfig?.key === column && (
                          sortConfig.direction === 'asc' 
                            ? <ChevronUp className="h-4 w-4" /> 
                            : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                      <Input
                        placeholder={`Filter ${column}...`}
                        value={filters[column] || ''}
                        onChange={(e) => handleFilterChange(column, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredData.map((row, index) => (
                <TableRow key={index}>
                  {visibleColumns.map(column => (
                    <TableCell key={column}>
                      {formatValue(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {sortedAndFilteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
};

export default FilterableDataGrid;