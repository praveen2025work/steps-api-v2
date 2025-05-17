import React from 'react';
import { TileConfig, TileType, ChartType } from '@/types/finance-types';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { fetchDataFromSource } from '@/lib/finance';

interface TileContentProps {
  tile: TileConfig;
  compact?: boolean;
}

export const TileContent: React.FC<TileContentProps> = ({ tile, compact = false }) => {
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchDataFromSource(tile.dataSource);
        setData(result);
      } catch (error) {
        console.error('Error loading data for tile:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [tile.dataSource]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    const height = compact ? 150 : 300;
    
    if (tile.type === TileType.Chart) {
      switch (tile.chartType) {
        case ChartType.Bar:
          return (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={tile.xAxis.field} label={{ value: tile.xAxis.label, position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: tile.yAxis.label, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey={tile.yAxis.field} fill="#0369a1" name={tile.yAxis.label} />
              </BarChart>
            </ResponsiveContainer>
          );
          
        case ChartType.Line:
          return (
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={tile.xAxis.field} label={{ value: tile.xAxis.label, position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: tile.yAxis.label, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={tile.yAxis.field} stroke="#0369a1" name={tile.yAxis.label} />
              </LineChart>
            </ResponsiveContainer>
          );
          
        case ChartType.Pie:
          const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
          return (
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={compact ? 60 : 100}
                  fill="#8884d8"
                  dataKey={tile.yAxis.field}
                  nameKey={tile.xAxis.field}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          );
          
        case ChartType.Area:
          return (
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={tile.xAxis.field} label={{ value: tile.xAxis.label, position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: tile.yAxis.label, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey={tile.yAxis.field} fill="#0369a1" stroke="#0369a1" name={tile.yAxis.label} />
              </AreaChart>
            </ResponsiveContainer>
          );
          
        case ChartType.Scatter:
          return (
            <ResponsiveContainer width="100%" height={height}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={tile.xAxis.field} name={tile.xAxis.label} />
                <YAxis dataKey={tile.yAxis.field} name={tile.yAxis.label} />
                <ZAxis range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name={tile.title} data={data} fill="#0369a1" />
              </ScatterChart>
            </ResponsiveContainer>
          );
          
        default:
          return (
            <div className="flex items-center justify-center h-full w-full">
              <p className="text-muted-foreground">Unsupported chart type</p>
            </div>
          );
      }
    } else if (tile.type === TileType.Grid) {
      return (
        <div className="overflow-auto max-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(data[0]).map((key) => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <TableCell key={colIndex}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    } else if (tile.type === TileType.Progress) {
      return (
        <div className="space-y-4">
          {data.map((item, index) => {
            const value = item[tile.yAxis.field] || 0;
            const name = item[tile.xAxis.field] || `Item ${index + 1}`;
            
            // Determine color based on value
            let progressColor = 'bg-blue-500';
            if (value < 30) progressColor = 'bg-red-500';
            else if (value < 70) progressColor = 'bg-amber-500';
            else progressColor = 'bg-emerald-500';
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="font-medium">{value}%</span>
                </div>
                <Progress value={value} className={progressColor} />
              </div>
            );
          })}
        </div>
      );
    } else if (tile.type === TileType.Text) {
      return (
        <div className="prose prose-sm max-w-none">
          <p>Text content for {tile.title}</p>
          <p>Data source: {tile.dataSource}</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-muted-foreground">Unsupported tile type</p>
      </div>
    );
  };
  
  return (
    <div className="w-full h-full">
      {renderChart()}
    </div>
  );
};