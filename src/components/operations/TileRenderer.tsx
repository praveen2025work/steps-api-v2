import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowRight, BarChart3, List, Table } from 'lucide-react';
import { fetchTileData } from '@/lib/operations';
import type { TileConfig, TileAction } from '@/types/operations-types';

interface TileRendererProps {
  config: TileConfig;
}

export default function TileRenderer({ config }: TileRendererProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchTileData(config.dataSource);
        setData(result);
      } catch (err) {
        setError('Failed to load tile data');
        console.error('Tile data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up refresh interval if specified
    if (config.refreshInterval) {
      const intervalId = setInterval(loadData, config.refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [config]);

  const renderTileContent = () => {
    if (isLoading) {
      return <TileLoadingSkeleton />;
    }

    if (error) {
      return <TileError message={error} />;
    }

    switch (config.type) {
      case 'status':
        return <StatusTile data={data} visualization={config.visualization} />;
      case 'metric':
        return <MetricTile data={data} visualization={config.visualization} />;
      case 'chart':
        return <ChartTile data={data} visualization={config.visualization} />;
      case 'list':
        return <ListTile data={data} visualization={config.visualization} />;
      case 'table':
        return <TableTile data={data} visualization={config.visualization} />;
      default:
        return <div>Unsupported tile type: {config.type}</div>;
    }
  };

  const handleAction = (action: TileAction) => {
    console.log('Tile action triggered:', action);
    // Implementation would depend on action type (link, function, api)
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{config.title}</CardTitle>
        {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
      </CardHeader>
      <CardContent>{renderTileContent()}</CardContent>
      {config.actions && config.actions.length > 0 && (
        <CardFooter className="pt-0 flex justify-end gap-2">
          {config.actions.map(action => (
            <Button 
              key={action.id} 
              variant="ghost" 
              size="sm" 
              onClick={() => handleAction(action)}
            >
              {action.label}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}

// Tile Type Components
function StatusTile({ data, visualization }: { data: any, visualization: any }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'completed':
      case 'success':
        return 'text-green-500';
      case 'warning':
      case 'at-risk':
        return 'text-amber-500';
      case 'error':
      case 'failed':
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-4">
      <div className={`text-3xl font-bold ${getStatusColor(data.status)}`}>
        {data.status}
      </div>
      {data.message && <p className="text-sm mt-2 text-center">{data.message}</p>}
    </div>
  );
}

function MetricTile({ data, visualization }: { data: any, visualization: any }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-4">
      <div className="text-4xl font-bold">{data.value}</div>
      {data.change !== undefined && (
        <div className={`text-sm mt-1 ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {data.change >= 0 ? '↑' : '↓'} {Math.abs(data.change)}%
        </div>
      )}
      {data.label && <p className="text-sm mt-1 text-muted-foreground">{data.label}</p>}
    </div>
  );
}

function ChartTile({ data, visualization }: { data: any, visualization: any }) {
  // Add defensive checks to prevent rendering errors
  const isValidChartData = data && 
    data.labels && 
    Array.isArray(data.labels) && 
    data.datasets && 
    Array.isArray(data.datasets) && 
    data.datasets.length > 0 && 
    data.datasets[0].data && 
    Array.isArray(data.datasets[0].data) && 
    data.datasets[0].data.length > 0;

  // Basic chart rendering with the data we now have
  return (
    <div className="h-full py-4">
      {isValidChartData ? (
        <div>
          <div className="flex justify-between mb-2">
            {data.datasets.map((dataset: any, index: number) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: index === 0 ? '#0369a1' : '#64748b' }}
                />
                <span className="text-xs">{dataset.label || `Dataset ${index + 1}`}</span>
              </div>
            ))}
          </div>
          
          <div className="relative h-40 mt-4">
            {/* Simple bar chart visualization */}
            <div className="flex h-full items-end justify-between">
              {data.labels.map((label: string, i: number) => {
                // Add safety checks for data access
                const dataset = data.datasets[0];
                const value = dataset && dataset.data && i < dataset.data.length ? dataset.data[i] : 0;
                const maxValue = dataset && dataset.data ? Math.max(...dataset.data.filter((v: any) => typeof v === 'number')) : 1;
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                
                return (
                  <div key={i} className="flex flex-col items-center w-full">
                    <div 
                      className="w-4/5 bg-blue-500 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs mt-1">{label}</div>
                    <div className="text-xs font-medium">{value}</div>
                  </div>
                );
              })}
            </div>
            
            {/* Target line - with safety checks */}
            {data.datasets.length > 1 && data.datasets[1].data && data.datasets[1].data.length > 0 && (
              <div 
                className="absolute w-full border-t border-dashed border-gray-400"
                style={{ 
                  bottom: `${(data.datasets[1].data[0] / Math.max(...data.datasets[0].data.filter((v: any) => typeof v === 'number'))) * 100}%` 
                }}
              >
                <span className="absolute right-0 -top-4 text-xs">Target</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <BarChart3 className="h-24 w-24 text-muted-foreground" />
          <p className="text-sm mt-2 text-center">No chart data available</p>
        </div>
      )}
    </div>
  );
}

function ListTile({ data, visualization }: { data: any, visualization: any }) {
  return (
    <div className="space-y-2">
      {data.items && data.items.length > 0 ? (
        <ul className="space-y-1">
          {data.items.slice(0, 5).map((item: any, index: number) => (
            <li key={index} className="text-sm py-1 border-b last:border-0">
              <div className="flex justify-between">
                <span>{item.label}</span>
                {item.value && <span className="font-medium">{item.value}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-4">
          <List className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm mt-2 text-center">No items to display</p>
        </div>
      )}
    </div>
  );
}

function TableTile({ data, visualization }: { data: any, visualization: any }) {
  return (
    <div className="space-y-2">
      {data.rows && data.rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {data.columns.map((col: any, index: number) => (
                  <th key={index} className="text-left py-2 font-medium">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.slice(0, 3).map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="border-b last:border-0">
                  {data.columns.map((col: any, colIndex: number) => (
                    <td key={colIndex} className="py-2">{row[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4">
          <Table className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm mt-2 text-center">No data to display</p>
        </div>
      )}
    </div>
  );
}

function TileLoadingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function TileError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-destructive">
      <AlertCircle className="h-8 w-8" />
      <p className="text-sm mt-2 text-center">{message}</p>
    </div>
  );
}