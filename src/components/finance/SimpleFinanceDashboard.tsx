import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  AlertTriangle, CheckCircle, Clock, Pin, 
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { generateMockTiles } from '@/lib/finance';
import { TileData, TileStatus, TileSlide } from '@/types/finance-types';
import { Button } from '@/components/ui/button';

// Type definitions for our components
interface SimpleTileProps {
  title: string;
  status: TileStatus;
  children: React.ReactNode;
}

interface SlideContentProps {
  slide: TileSlide;
}

// Simple status indicator component
const StatusIndicator: React.FC<{ status: TileStatus }> = ({ status }) => {
  switch(status) {
    case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'info': return <Clock className="h-4 w-4 text-blue-500" />;
    default: return null;
  }
};

// Simple tile component
const SimpleTile: React.FC<SimpleTileProps> = ({ title, status, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <StatusIndicator status={status} />
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

// Component to render slide content based on chart type
const SlideContent: React.FC<SlideContentProps> = ({ slide }) => {
  if (!slide) return <div>No data available</div>;
  if (!slide.data || !Array.isArray(slide.data) || slide.data.length === 0) {
    return <div>No data available for this chart</div>;
  }

  switch (slide.chartType) {
    case 'bar':
      return (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slide.data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {slide.series && Array.isArray(slide.series) && slide.series.map((series, index) => (
                <Bar 
                  key={index}
                  dataKey={series.key} 
                  fill={series.color || "#3B82F6"} 
                  name={series.name || series.key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    case 'line':
      return (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={slide.data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {slide.series && Array.isArray(slide.series) && slide.series.map((series, index) => (
                <Line 
                  key={index}
                  type="monotone" 
                  dataKey={series.key} 
                  stroke={series.color || "#3B82F6"} 
                  strokeWidth={2}
                  name={series.name || series.key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    case 'pie':
      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
      const dataKey = slide.series && slide.series[0] ? slide.series[0].key : 'value';
      
      return (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slide.data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey="name"
                label
              >
                {slide.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    case 'progress':
      return (
        <div className="space-y-4">
          {slide.data.map((item, index) => {
            const value = typeof item.value === 'number' ? item.value : 0;
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.name || `Item ${index + 1}`}</span>
                  <span className="text-sm font-medium">{value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      value >= 90 ? 'bg-emerald-500' :
                      value >= 75 ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    case 'status':
      return (
        <div className="grid grid-cols-2 gap-4">
          {slide.data.map((item, index) => {
            const status = item.status || 'info';
            return (
              <div key={index} className={`p-3 rounded-lg ${
                status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                status === 'warning' ? 'bg-amber-50 text-amber-700' :
                status === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                <div className="text-sm font-medium">{item.name || `Item ${index + 1}`}</div>
                <div className="text-lg font-bold">{item.value || 'N/A'}</div>
              </div>
            );
          })}
        </div>
      );
    case 'grid':
      // If no columns are defined, create default columns from the first data item
      const columns = slide.columns && Array.isArray(slide.columns) ? 
        slide.columns : 
        (slide.data[0] ? Object.keys(slide.data[0]).map(key => ({ key, label: key })) : []);
      
      if (columns.length === 0) {
        return <div>No columns defined for grid</div>;
      }
      
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slide.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {row[column.key] !== undefined ? row[column.key] : 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return <div>No visualization available for chart type: {slide.chartType}</div>;
  }
};

// Main Dashboard Component
const SimpleFinanceDashboard: React.FC = () => {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = generateMockTiles();
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        setTiles(data);
      } catch (error) {
        console.error('Failed to load finance dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        setTiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    return () => {};
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const data = generateMockTiles();
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        setTiles(data);
        setLastRefreshed(new Date());
      } catch (error) {
        console.error('Failed to refresh finance dashboard data:', error);
        setError('Failed to refresh dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <Card key={index} className="w-full animate-pulse">
              <CardHeader className="p-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-40 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles && tiles.length > 0 ? (
            tiles.map((tile) => (
              <SimpleTile 
                key={tile.id} 
                title={tile.title || 'Untitled Tile'} 
                status={tile.status || 'neutral'}
              >
                {tile.slides && Array.isArray(tile.slides) && tile.slides.length > 0 ? (
                  <div>
                    {tile.slides[0].title && (
                      <h3 className="text-sm font-medium mb-4">{tile.slides[0].title}</h3>
                    )}
                    <SlideContent slide={tile.slides[0]} />
                  </div>
                ) : (
                  <div>No slides available for this tile</div>
                )}
              </SimpleTile>
            ))
          ) : (
            <div className="col-span-3 text-center p-8 text-gray-500">
              No dashboard tiles available. Try refreshing the data.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleFinanceDashboard;