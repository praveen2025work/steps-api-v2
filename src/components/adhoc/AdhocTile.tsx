import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Maximize2,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { AdhocTileData, AdhocChartType } from '@/types/adhoc-types';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface AdhocTileProps {
  tile: AdhocTileData;
  onFocus: () => void;
  isFocused: boolean;
  isFullView?: boolean;
  isCompact?: boolean;
}

const AdhocTile: React.FC<AdhocTileProps> = ({
  tile,
  onFocus,
  isFocused,
  isFullView = false,
  isCompact = false
}) => {
  const getStatusIcon = () => {
    switch (tile.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (tile.status) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const renderChart = () => {
    if (tile.isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (tile.error) {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{tile.error}</p>
          </div>
        </div>
      );
    }

    if (!tile.data || tile.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    const chartHeight = isFullView ? 400 : isCompact ? 150 : 200;
    const colors = ['#0369a1', '#0891b2', '#059669', '#dc2626', '#ea580c', '#d97706', '#65a30d', '#7c3aed'];

    switch (tile.config.type) {
      case AdhocChartType.Bar:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={tile.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={tile.config.xAxis?.field || Object.keys(tile.data[0])[0]} 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {!isCompact && <Legend />}
              <Bar 
                dataKey={tile.config.yAxis?.field || Object.keys(tile.data[0])[1]} 
                fill={colors[0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case AdhocChartType.Line:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={tile.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={tile.config.xAxis?.field || Object.keys(tile.data[0])[0]} 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {!isCompact && <Legend />}
              <Line 
                type="monotone" 
                dataKey={tile.config.yAxis?.field || Object.keys(tile.data[0])[1]} 
                stroke={colors[0]} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case AdhocChartType.Area:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={tile.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={tile.config.xAxis?.field || Object.keys(tile.data[0])[0]} 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {!isCompact && <Legend />}
              <Area 
                type="monotone" 
                dataKey={tile.config.yAxis?.field || Object.keys(tile.data[0])[1]} 
                stroke={colors[0]} 
                fill={colors[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case AdhocChartType.Pie:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={tile.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={!isCompact ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
                outerRadius={isCompact ? 50 : 80}
                fill="#8884d8"
                dataKey={tile.config.yAxis?.field || Object.keys(tile.data[0])[1]}
                nameKey={tile.config.xAxis?.field || Object.keys(tile.data[0])[0]}
              >
                {tile.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {!isCompact && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case AdhocChartType.Scatter:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart data={tile.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={tile.config.xAxis?.field || Object.keys(tile.data[0])[0]} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                dataKey={tile.config.yAxis?.field || Object.keys(tile.data[0])[1]} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Scatter fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case AdhocChartType.Grid:
        const fields = Object.keys(tile.data[0]);
        const displayData = isCompact ? tile.data.slice(0, 5) : tile.data.slice(0, 10);
        
        return (
          <div className="overflow-auto" style={{ maxHeight: chartHeight }}>
            <Table>
              <TableHeader>
                <TableRow>
                  {fields.map((field) => (
                    <TableHead key={field} className="text-xs">{field}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((row, index) => (
                  <TableRow key={index}>
                    {fields.map((field) => (
                      <TableCell key={field} className="text-xs">
                        {typeof row[field] === 'object' 
                          ? JSON.stringify(row[field]) 
                          : String(row[field] || '')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {tile.data.length > displayData.length && (
              <p className="text-xs text-muted-foreground p-2">
                Showing {displayData.length} of {tile.data.length} rows
              </p>
            )}
          </div>
        );

      case AdhocChartType.Progress:
        const progressField = tile.config.yAxis?.field || Object.keys(tile.data[0])[1];
        return (
          <div className="space-y-4 p-4">
            {tile.data.slice(0, isCompact ? 3 : 6).map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item[tile.config.xAxis?.field || Object.keys(tile.data[0])[0]]}</span>
                  <span>{item[progressField]}%</span>
                </div>
                <Progress value={item[progressField]} className="h-2" />
              </div>
            ))}
          </div>
        );

      case AdhocChartType.Metric:
        const metricValue = tile.data[0]?.[tile.config.yAxis?.field || Object.keys(tile.data[0])[1]];
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {typeof metricValue === 'number' ? metricValue.toLocaleString() : metricValue}
              </div>
              <div className="text-sm text-muted-foreground">
                {tile.config.yAxis?.label || 'Value'}
              </div>
            </div>
          </div>
        );

      case AdhocChartType.Status:
        return (
          <div className="grid grid-cols-2 gap-2 p-4">
            {tile.data.slice(0, isCompact ? 4 : 8).map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded border">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'success' ? 'bg-emerald-500' :
                  item.status === 'warning' ? 'bg-amber-500' :
                  item.status === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {item[tile.config.xAxis?.field || Object.keys(tile.data[0])[0]]}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item[tile.config.yAxis?.field || Object.keys(tile.data[0])[1]]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unsupported chart type</p>
          </div>
        );
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isFocused ? `ring-2 ring-primary ${getStatusColor()}` : ''
      }`}
      onClick={onFocus}
    >
      <CardHeader className={`pb-2 ${isCompact ? 'p-3' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getStatusIcon()}
            <CardTitle className={`truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
              {tile.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {tile.config.type}
            </Badge>
            {!isFullView && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Maximize2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        {tile.description && !isCompact && (
          <p className="text-xs text-muted-foreground truncate">{tile.description}</p>
        )}
      </CardHeader>
      <CardContent className={`${isCompact ? 'p-3 pt-0' : 'pt-0'}`}>
        <div className={isFullView ? 'min-h-[400px]' : isCompact ? 'h-[150px]' : 'h-[200px]'}>
          {renderChart()}
        </div>
        {!isCompact && (
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>Updated: {new Date(tile.lastUpdated).toLocaleTimeString()}</span>
            <span>{tile.data?.length || 0} records</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdhocTile;