import React, { useState } from 'react';
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
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define types for our pivot table
interface PivotTableProps {
  data: any[];
}

interface PivotConfig {
  rows: string[];
  columns: string[];
  values: string[];
  filters: Record<string, string>;
}

const PivotTable: React.FC<PivotTableProps> = ({ data }) => {
  // Validate input data and use sample data if invalid
  const validData = data && Array.isArray(data) && data.length > 0 && data.every(item => item && typeof item === 'object');
  
  // Create a safe copy of the data or use sample data
  const sampleData = validData ? JSON.parse(JSON.stringify(data)) : [
    { date: '2025-05-01', region: 'EMEA', product: 'FX', amount: 1250000, status: 'Completed' },
    { date: '2025-05-01', region: 'APAC', product: 'Rates', amount: 2340000, status: 'Completed' },
    { date: '2025-05-01', region: 'AMER', product: 'FX', amount: 1890000, status: 'Completed' },
    { date: '2025-05-02', region: 'EMEA', product: 'Rates', amount: 1450000, status: 'Completed' },
    { date: '2025-05-02', region: 'APAC', product: 'FX', amount: 1670000, status: 'Pending' },
    { date: '2025-05-02', region: 'AMER', product: 'Rates', amount: 2120000, status: 'Processing' },
    { date: '2025-05-03', region: 'EMEA', product: 'FX', amount: 1340000, status: 'Completed' },
    { date: '2025-05-03', region: 'APAC', product: 'Rates', amount: 1980000, status: 'Failed' },
    { date: '2025-05-03', region: 'AMER', product: 'FX', amount: 2250000, status: 'Completed' },
    { date: '2025-05-04', region: 'EMEA', product: 'Rates', amount: 1560000, status: 'Processing' },
    { date: '2025-05-04', region: 'APAC', product: 'FX', amount: 1890000, status: 'Completed' },
    { date: '2025-05-04', region: 'AMER', product: 'Rates', amount: 2340000, status: 'Pending' },
  ];

  // Get all available fields from the data
  const allFields = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0] || {}) : [];
  
  // Initial pivot configuration
  const [pivotConfig, setPivotConfig] = useState<PivotConfig>({
    rows: ['region'],
    columns: ['product'],
    values: ['amount'],
    filters: {},
  });

  // Function to get unique values for a field
  const getUniqueValues = (field: string) => {
    if (!sampleData || !Array.isArray(sampleData) || sampleData.length === 0) {
      return [];
    }
    return Array.from(new Set(sampleData.map(item => item[field])));
  };

  // Function to calculate pivot data
  const calculatePivotData = () => {
    try {
      // Validate input data
      if (!Array.isArray(sampleData) || sampleData.length === 0) {
        return {
          rowCombinations: [['No Data']],
          columnCombinations: [['No Data']],
          pivotData: { 'No Data': { 'No Data': 0 } }
        };
      }
      
      // Validate pivot configuration
      if (!Array.isArray(pivotConfig.rows) || pivotConfig.rows.length === 0 ||
          !Array.isArray(pivotConfig.columns) || pivotConfig.columns.length === 0 ||
          !Array.isArray(pivotConfig.values) || pivotConfig.values.length === 0) {
        return {
          rowCombinations: [['Invalid Config']],
          columnCombinations: [['Invalid Config']],
          pivotData: { 'Invalid Config': { 'Invalid Config': 0 } }
        };
      }
      
      // Filter data based on filters
      let filteredData = [...sampleData];
      if (pivotConfig.filters && typeof pivotConfig.filters === 'object') {
        Object.entries(pivotConfig.filters).forEach(([field, value]) => {
          if (field && value && value !== 'all') {
            filteredData = filteredData.filter(item => {
              if (!item || typeof item !== 'object') return false;
              return String(item[field]) === value;
            });
          }
        });
      }

      // Get unique values for rows and columns
      const rowValues = pivotConfig.rows.map(field => {
        if (!field || typeof field !== 'string') return ['Invalid Field'];
        return getUniqueValues(field);
      });
      
      const columnValues = pivotConfig.columns.map(field => {
        if (!field || typeof field !== 'string') return ['Invalid Field'];
        return getUniqueValues(field);
      });

      // Generate row combinations
      const rowCombinations = generateCombinations(rowValues);
      if (!Array.isArray(rowCombinations) || rowCombinations.length === 0) {
        return {
          rowCombinations: [['No Row Data']],
          columnCombinations: [['No Data']],
          pivotData: { 'No Row Data': { 'No Data': 0 } }
        };
      }
      
      // Generate column combinations
      const columnCombinations = generateCombinations(columnValues);
      if (!Array.isArray(columnCombinations) || columnCombinations.length === 0) {
        return {
          rowCombinations: rowCombinations,
          columnCombinations: [['No Column Data']],
          pivotData: { [rowCombinations[0].join('-')]: { 'No Column Data': 0 } }
        };
      }

      // Calculate aggregated values
      const pivotData: Record<string, Record<string, number>> = {};
      
      rowCombinations.forEach(rowComb => {
        if (!Array.isArray(rowComb)) return;
        
        const rowKey = rowComb.join('-');
        pivotData[rowKey] = {};
        
        columnCombinations.forEach(colComb => {
          if (!Array.isArray(colComb)) return;
          
          const colKey = colComb.join('-');
          
          // Filter data for this combination
          const matchingData = filteredData.filter(item => {
            if (!item || typeof item !== 'object') return false;
            
            const rowMatch = pivotConfig.rows.every((field, index) => {
              if (!field || typeof field !== 'string' || index >= rowComb.length) return false;
              return item[field] === rowComb[index];
            });
            
            const colMatch = pivotConfig.columns.every((field, index) => {
              if (!field || typeof field !== 'string' || index >= colComb.length) return false;
              return item[field] === colComb[index];
            });
            
            return rowMatch && colMatch;
          });
          
          // Aggregate values
          if (matchingData.length > 0) {
            pivotConfig.values.forEach(valueField => {
              if (!valueField || typeof valueField !== 'string') return;
              
              const sum = matchingData.reduce((acc, item) => {
                if (!item || typeof item !== 'object') return acc;
                const value = item[valueField];
                const numValue = typeof value === 'number' ? value : 
                                 typeof value === 'string' ? parseFloat(value) : 0;
                return acc + (isNaN(numValue) ? 0 : numValue);
              }, 0);
              
              pivotData[rowKey][colKey] = sum;
            });
          } else {
            pivotData[rowKey][colKey] = 0;
          }
        });
      });

      return {
        rowCombinations,
        columnCombinations,
        pivotData
      };
    } catch (error) {
      console.error("Error calculating pivot data:", error);
      // Return a minimal valid structure
      return {
        rowCombinations: [['Error']],
        columnCombinations: [['Error']],
        pivotData: { 'Error': { 'Error': 0 } }
      };
    }
  };

  // Helper function to generate combinations
  const generateCombinations = (arrays: any[][]) => {
    if (arrays.length === 0) return [[]];
    
    const result: any[][] = [];
    const restCombinations = generateCombinations(arrays.slice(1));
    
    arrays[0].forEach(item => {
      restCombinations.forEach(combination => {
        result.push([item, ...combination]);
      });
    });
    
    return result;
  };

  // Calculate pivot data with error handling
  let rowCombinations: any[][] = [[]];
  let columnCombinations: any[][] = [[]];
  let pivotData: Record<string, Record<string, number>> = {};
  
  try {
    const result = calculatePivotData();
    rowCombinations = result.rowCombinations || [['Sample']];
    columnCombinations = result.columnCombinations || [['Data']];
    pivotData = result.pivotData || { 'Sample': { 'Data': 0 } };
    
    // Ensure rowCombinations is valid
    if (!Array.isArray(rowCombinations) || rowCombinations.length === 0) {
      rowCombinations = [['Sample']];
    }
    
    // Ensure columnCombinations is valid
    if (!Array.isArray(columnCombinations) || columnCombinations.length === 0) {
      columnCombinations = [['Data']];
    }
    
    // Ensure pivotData is valid
    if (typeof pivotData !== 'object' || pivotData === null) {
      pivotData = { 'Sample': { 'Data': 0 } };
    }
  } catch (error) {
    console.error("Error calculating pivot data:", error);
    // Set default values for a minimal working pivot table
    rowCombinations = [['Sample']];
    columnCombinations = [['Data']];
    pivotData = { 'Sample': { 'Data': 0 } };
  }

  // Handle field selection changes
  const handleFieldChange = (type: 'rows' | 'columns' | 'values', value: string) => {
    setPivotConfig(prev => ({
      ...prev,
      [type]: [value]
    }));
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setPivotConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value
      }
    }));
  };

  // Format number for display
  const formatNumber = (num: number) => {
    try {
      if (typeof num !== 'number' || isNaN(num)) {
        return '$0';
      }
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num);
    } catch (error) {
      console.error("Error formatting number:", error);
      return '$0'; // Return a safe default if formatting fails
    }
  };
  
  // Safely get row total
  const getRowTotal = (rowKey: string) => {
    try {
      if (!rowKey || !pivotData[rowKey]) return 0;
      
      return columnCombinations.reduce((sum, colComb) => {
        const colKey = colComb.join('-');
        const value = pivotData[rowKey]?.[colKey];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
    } catch (error) {
      console.error("Error calculating row total:", error);
      return 0;
    }
  };
  
  // Safely get column total
  const getColumnTotal = (colKey: string) => {
    try {
      if (!colKey) return 0;
      
      return rowCombinations.reduce((sum, rowComb) => {
        const rowKey = rowComb.join('-');
        const value = pivotData[rowKey]?.[colKey];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
    } catch (error) {
      console.error("Error calculating column total:", error);
      return 0;
    }
  };
  
  // Safely get grand total
  const getGrandTotal = () => {
    try {
      return rowCombinations.reduce((rowSum, rowComb) => {
        const rowKey = rowComb.join('-');
        return rowSum + getRowTotal(rowKey);
      }, 0);
    } catch (error) {
      console.error("Error calculating grand total:", error);
      return 0;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Row:</span>
          <Select value={pivotConfig.rows[0]} onValueChange={(value) => handleFieldChange('rows', value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {allFields.map(field => (
                <SelectItem key={field} value={field}>{field}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Column:</span>
          <Select value={pivotConfig.columns[0]} onValueChange={(value) => handleFieldChange('columns', value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {allFields.map(field => (
                <SelectItem key={field} value={field}>{field}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Value:</span>
          <Select value={pivotConfig.values[0]} onValueChange={(value) => handleFieldChange('values', value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {allFields.map(field => (
                <SelectItem key={field} value={field}>{field}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <Select value={Object.keys(pivotConfig.filters)[0] || 'none'} onValueChange={(field) => {
            const newFilters: Record<string, string> = {};
            if (field !== 'none') newFilters[field] = 'all';
            setPivotConfig(prev => ({ ...prev, filters: newFilters }));
          }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {allFields.map(field => (
                <SelectItem key={field} value={field}>{field}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {Object.keys(pivotConfig.filters).length > 0 && (
            <Select 
              value={pivotConfig.filters[Object.keys(pivotConfig.filters)[0]] || 'all'} 
              onValueChange={(value) => handleFilterChange(Object.keys(pivotConfig.filters)[0], value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {getUniqueValues(Object.keys(pivotConfig.filters)[0]).map(value => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto data-grid-container">
        <Table className="data-grid">
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">{pivotConfig.rows[0]}</TableHead>
              {columnCombinations.map((colComb, index) => (
                <TableHead key={index} className="text-right font-bold">
                  {colComb[0]}
                </TableHead>
              ))}
              <TableHead className="text-right font-bold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowCombinations.map((rowComb, rowIndex) => {
              const rowKey = rowComb.join('-');
              
              return (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium">{rowComb[0]}</TableCell>
                  {columnCombinations.map((colComb, colIndex) => {
                    const colKey = colComb.join('-');
                    const value = pivotData[rowKey]?.[colKey] || 0;
                    
                    return (
                      <TableCell key={colIndex} className="text-right">
                        {formatNumber(value)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-bold">
                    {formatNumber(getRowTotal(rowKey))}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold">Total</TableCell>
              {columnCombinations.map((colComb, colIndex) => {
                const colKey = colComb.join('-');
                
                return (
                  <TableCell key={colIndex} className="text-right font-bold">
                    {formatNumber(getColumnTotal(colKey))}
                  </TableCell>
                );
              })}
              <TableCell className="text-right font-bold">
                {formatNumber(getGrandTotal())}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PivotTable;