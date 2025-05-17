import React, { useState, useEffect } from 'react';
import { TileConfig, TileType, ChartType, TileSlide } from '@/types/finance-types';
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
  tile?: TileConfig;
  slide?: TileSlide;
  compact?: boolean;
  isFullView?: boolean;
}

export const TileContent: React.FC<TileContentProps> = ({ tile, slide, compact = false, isFullView = false }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // If we have a slide with data, use that directly
        if (slide && slide.data) {
          setData(slide.data);
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch data from the data source if tile is provided
        if (tile && tile.dataSource) {
          const result = await fetchDataFromSource(tile.dataSource);
          setData(result);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Error loading data for tile/slide:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [tile, slide]);

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
    
    // Handle slide-based content (from the original dashboard)
    if (slide) {
      switch (slide.chartType) {
        case ChartType.Bar:
          return (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {slide.series ? (
                  slide.series.map((series, index) => (
                    <Bar 
                      key={index} 
                      dataKey={series.key} 
                      fill={series.color || '#0369a1'} 
                      name={series.name || series.key} 
                    />
                  ))
                ) : (
                  <Bar dataKey="value" fill="#0369a1" />
                )}
              </BarChart>
            </ResponsiveContainer>
          );
          
        case ChartType.Line:
          return (
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {slide.series ? (
                  slide.series.map((series, index) => (
                    <Line 
                      key={index} 
                      type="monotone" 
                      dataKey={series.key} 
                      stroke={series.color || '#0369a1'} 
                      name={series.name || series.key} 
                    />
                  ))
                ) : (
                  <Line type="monotone" dataKey="value" stroke="#0369a1" />
                )}
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
                  dataKey={slide.series?.[0]?.key || "value"}
                  nameKey="name"
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
          
        case ChartType.Grid:
          return (
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {slide.columns ? (
                      slide.columns.map((column, index) => (
                        <TableHead key={index}>{column.label}</TableHead>
                      ))
                    ) : (
                      Object.keys(data[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {slide.columns ? (
                        slide.columns.map((column, colIndex) => (
                          <TableCell key={colIndex}>
                            {column.format ? column.format(row[column.key]) : row[column.key]}
                          </TableCell>
                        ))
                      ) : (
                        Object.values(row).map((value, colIndex) => (
                          <TableCell key={colIndex}>{value}</TableCell>
                        ))
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
          
        case ChartType.Progress:
          return (
            <div className="space-y-4">
              {data.map((item, index) => {
                const value = typeof item.value === 'number' ? item.value : 0;
                const name = item.name || `Item ${index + 1}`;
                
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
          
        case ChartType.Status:
          return (
            <div className="space-y-4">
              {data.map((item, index) => {
                const statusColor = 
                  item.status === 'success' ? 'bg-emerald-500' :
                  item.status === 'warning' ? 'bg-amber-500' :
                  item.status === 'error' ? 'bg-red-500' :
                  'bg-blue-500';
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{item.value}</span>
                      <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
          
        default:
          if (slide.content) {
            return slide.content;
          }
          return (
            <div className="flex items-center justify-center h-full w-full">
              <p className="text-muted-foreground">Unsupported chart type</p>
            </div>
          );
      }
    }
    
    // Handle tile-based content (from the configurator)
    if (tile && tile.type === TileType.Chart) {
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