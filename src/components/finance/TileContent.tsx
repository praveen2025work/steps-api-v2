import React from 'react';
import { TileSlide, ChartType } from '@/types/finance-types';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface TileContentProps {
  slide: TileSlide;
  isFullView: boolean;
  isCompact?: boolean;
}

const TileContent: React.FC<TileContentProps> = ({ slide, isFullView, isCompact = false }) => {
  const renderChart = () => {
    const height = isFullView ? 400 : isCompact ? 100 : 200;
    
    switch (slide.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
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
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
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
          </ResponsiveContainer>
        );
        
      case 'pie':
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={slide.data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={isCompact ? 40 : 80}
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
        );
        
      case 'grid':
        if (!slide.columns || !slide.data) return null;
        
        return (
          <div className="overflow-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {slide.columns.map((column, index) => (
                    <TableHead key={index}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {slide.data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {slide.columns?.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        {column.format ? column.format(row[column.key]) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
        
      case 'progress':
        return (
          <div className="space-y-4">
            {slide.data.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
          </div>
        );
        
      case 'status':
        return (
          <div className="grid grid-cols-2 gap-2">
            {slide.data.map((item, index) => {
              let bgColor = 'bg-gray-100';
              let textColor = 'text-gray-800';
              
              if (item.status === 'success') {
                bgColor = 'bg-emerald-100';
                textColor = 'text-emerald-800';
              } else if (item.status === 'warning') {
                bgColor = 'bg-amber-100';
                textColor = 'text-amber-800';
              } else if (item.status === 'error') {
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
              } else if (item.status === 'info') {
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
              }
              
              return (
                <Card key={index} className={`p-2 ${bgColor} ${textColor}`}>
                  <div className="text-xs font-medium">{item.name}</div>
                  <div className="text-sm font-bold">{item.value}</div>
                </Card>
              );
            })}
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