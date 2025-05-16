import React, { useState } from 'react';
import { TileSlide, ChartType } from '@/types/finance-types';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area,
  ScatterChart, Scatter, ZAxis, ComposedChart, ReferenceLine
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, ArrowUpDown, ChevronDown, ChevronUp, 
  ArrowUp, ArrowDown, Filter, Download, RefreshCw 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TileContentProps {
  slide: TileSlide;
  isFullView: boolean;
  isCompact?: boolean;
}

const TileContent: React.FC<TileContentProps> = ({ slide, isFullView, isCompact = false }) => {
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableSortField, setTableSortField] = useState<string | null>(null);
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('asc');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie' | 'composed'>(
    slide.chartType === 'bar' ? 'bar' : 
    slide.chartType === 'line' ? 'line' : 
    slide.chartType === 'pie' ? 'pie' : 'bar'
  );

  const toggleTableSort = (field: string) => {
    if (tableSortField === field) {
      setTableSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortField(field);
      setTableSortDirection('asc');
    }
  };

  const renderChart = () => {
    const height = isFullView ? 400 : isCompact ? 100 : 200;
    
    switch (slide.chartType) {
      case 'bar':
        return (
          <div>
            {isFullView && (
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium">Chart Type:</div>
                <div className="flex gap-1">
                  <Button 
                    variant={chartType === 'bar' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('bar')}
                  >
                    Bar
                  </Button>
                  <Button 
                    variant={chartType === 'line' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('line')}
                  >
                    Line
                  </Button>
                  <Button 
                    variant={chartType === 'area' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('area')}
                  >
                    Area
                  </Button>
                  <Button 
                    variant={chartType === 'composed' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('composed')}
                  >
                    Combined
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={height}>
              {chartType === 'bar' ? (
                <BarChart data={slide.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {slide.series?.map((series, index) => (
                    <Bar 
                      key={index} 
                      dataKey={series.key} 
                      fill={series.color || '#0369a1'} 
                      name={series.name || series.key}
                    />
                  ))}
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={slide.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {slide.series?.map((series, index) => (
                    <Line 
                      key={index} 
                      type="monotone" 
                      dataKey={series.key} 
                      stroke={series.color || '#0369a1'} 
                      name={series.name || series.key}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={slide.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {slide.series?.map((series, index) => (
                    <Area 
                      key={index} 
                      type="monotone" 
                      dataKey={series.key} 
                      fill={series.color || '#0369a1'} 
                      stroke={series.color || '#0369a1'} 
                      name={series.name || series.key}
                      fillOpacity={0.3}
                    />
                  ))}
                </AreaChart>
              ) : (
                <ComposedChart data={slide.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {slide.series?.map((series, index) => 
                    index === 0 ? (
                      <Bar 
                        key={index} 
                        dataKey={series.key} 
                        fill={series.color || '#0369a1'} 
                        name={series.name || series.key}
                      />
                    ) : (
                      <Line 
                        key={index} 
                        type="monotone" 
                        dataKey={series.key} 
                        stroke={series.color || '#8884d8'} 
                        name={series.name || series.key}
                        activeDot={{ r: 8 }}
                      />
                    )
                  )}
                  <ReferenceLine y={0} stroke="#000" />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        );
        
      case 'line':
        return (
          <div>
            {isFullView && (
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium">Chart Type:</div>
                <div className="flex gap-1">
                  <Button 
                    variant={chartType === 'line' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('line')}
                  >
                    Line
                  </Button>
                  <Button 
                    variant={chartType === 'area' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('area')}
                  >
                    Area
                  </Button>
                  <Button 
                    variant={chartType === 'bar' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('bar')}
                  >
                    Bar
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={height}>
              {chartType === 'line' ? (
                <LineChart data={slide.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {slide.series?.map((series, index) => (
                    <Line 
                      key={index} 
                      type="monotone" 
                      dataKey={series.key} 
                      stroke={series.color || '#0369a1'} 
                      name={series.name || series.key}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={slide.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {slide.series?.map((series, index) => (
                    <Area 
                      key={index} 
                      type="monotone" 
                      dataKey={series.key} 
                      fill={series.color || '#0369a1'} 
                      stroke={series.color || '#0369a1'} 
                      name={series.name || series.key}
                      fillOpacity={0.3}
                    />
                  ))}
                </AreaChart>
              ) : (
                <BarChart data={slide.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {slide.series?.map((series, index) => (
                    <Bar 
                      key={index} 
                      dataKey={series.key} 
                      fill={series.color || '#0369a1'} 
                      name={series.name || series.key}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        );
        
      case 'pie':
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
        return (
          <div>
            {isFullView && (
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={slide.data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={isCompact ? 40 : isFullView ? 120 : 80}
                  fill="#8884d8"
                  dataKey={slide.series?.[0]?.key || 'value'}
                  nameKey="name"
                  label={!isCompact}
                >
                  {slide.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'grid':
        if (!slide.columns || !slide.data) return null;
        
        // Filter and sort data
        let filteredData = [...slide.data];
        
        if (tableSearchQuery) {
          const query = tableSearchQuery.toLowerCase();
          filteredData = filteredData.filter(row => {
            return Object.values(row).some(value => 
              String(value).toLowerCase().includes(query)
            );
          });
        }
        
        if (tableSortField) {
          filteredData.sort((a, b) => {
            const aValue = a[tableSortField];
            const bValue = b[tableSortField];
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return tableSortDirection === 'asc' 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue);
            } else {
              return tableSortDirection === 'asc' 
                ? (aValue > bValue ? 1 : -1) 
                : (aValue < bValue ? 1 : -1);
            }
          });
        }
        
        return (
          <div>
            {isFullView && (
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-8"
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            )}
            
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {slide.columns.map((column, index) => (
                      <TableHead 
                        key={index} 
                        className="cursor-pointer"
                        onClick={() => toggleTableSort(column.key)}
                      >
                        <div className="flex items-center">
                          {column.label}
                          {tableSortField === column.key && (
                            tableSortDirection === 'asc' 
                              ? <ChevronUp className="ml-1 h-4 w-4" /> 
                              : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={slide.columns.length} className="text-center py-4">
                        No results found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {slide.columns?.map((column, colIndex) => (
                          <TableCell key={colIndex}>
                            {column.format ? column.format(row[column.key]) : row[column.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        );
        
      case 'progress':
        return (
          <div>
            {isFullView && (
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            )}
            
            <div className="space-y-4">
              {slide.data.map((item, index) => {
                // Determine color based on value
                let progressColor = 'bg-blue-500';
                if (item.value < 30) progressColor = 'bg-red-500';
                else if (item.value < 70) progressColor = 'bg-amber-500';
                else progressColor = 'bg-emerald-500';
                
                // Determine trend icon if available
                let trendIcon = null;
                if (item.trend > 0) {
                  trendIcon = <ArrowUp className="h-4 w-4 text-emerald-500" />;
                } else if (item.trend < 0) {
                  trendIcon = <ArrowDown className="h-4 w-4 text-red-500" />;
                }
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-1">
                        {trendIcon}
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                        <div
                          style={{ width: `${item.value}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressColor}`}
                        ></div>
                      </div>
                      {isFullView && item.target && (
                        <div 
                          className="absolute top-1 w-0.5 h-2 bg-black" 
                          style={{ left: `${item.target}%` }}
                        ></div>
                      )}
                    </div>
                    {isFullView && item.description && (
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      case 'status':
        return (
          <div>
            {isFullView && (
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            )}
            
            <div className={`grid ${isFullView ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
              {slide.data.map((item, index) => {
                let bgColor = 'bg-gray-100';
                let textColor = 'text-gray-800';
                let borderColor = 'border-gray-200';
                
                if (item.status === 'success') {
                  bgColor = 'bg-emerald-50';
                  textColor = 'text-emerald-800';
                  borderColor = 'border-emerald-200';
                } else if (item.status === 'warning') {
                  bgColor = 'bg-amber-50';
                  textColor = 'text-amber-800';
                  borderColor = 'border-amber-200';
                } else if (item.status === 'error') {
                  bgColor = 'bg-red-50';
                  textColor = 'text-red-800';
                  borderColor = 'border-red-200';
                } else if (item.status === 'info') {
                  bgColor = 'bg-blue-50';
                  textColor = 'text-blue-800';
                  borderColor = 'border-blue-200';
                }
                
                return (
                  <Card 
                    key={index} 
                    className={`p-3 ${bgColor} ${textColor} border ${borderColor} transition-all hover:shadow-md`}
                  >
                    <div className="text-xs font-medium">{item.name}</div>
                    <div className="text-base font-bold">{item.value}</div>
                    {isFullView && item.description && (
                      <div className="text-xs mt-1 opacity-80">{item.description}</div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
        
      case 'text':
      default:
        return (
          <div className="prose prose-sm max-w-none">
            {slide.content}
          </div>
        );
    }
  };
  
  return (
    <div className={`w-full ${isCompact ? 'h-24' : ''}`}>
      {renderChart()}
    </div>
  );
};

export default TileContent;