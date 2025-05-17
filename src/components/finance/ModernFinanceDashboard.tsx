import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ExternalLink, ChevronDown, Filter, Download, RefreshCw,
  AlertTriangle, CheckCircle, Clock, ArrowUpRight, Minus,
  Settings, Activity, TrendingUp, Pin, Layout, X
} from 'lucide-react';
import { generateMockTiles } from '@/lib/finance';
import { TileData, TileStatus } from '@/types/finance-types';

// Smart Layout Controls Component
const LayoutControls = ({ columns, setColumns }) => {
  const layouts = [2, 3, 4, 5].map(cols => ({
    cols,
    icon: '▯'.repeat(cols)
  }));

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
      {layouts.map(({ cols, icon }) => (
        <button
          key={cols}
          onClick={() => setColumns(cols)}
          className={`px-3 py-1.5 rounded-md transition-all font-mono text-xs ${
            columns === cols 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title={`${cols} column layout`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

// Smart Tile Component with Auto-Sliding
const DashboardTile = ({ 
  title, 
  slides = [], 
  status = null,
  className = "",
  onExpand = null
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [autoSlide, setAutoSlide] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    let slideInterval;
    if (autoSlide && !isPinned && slides.length > 1) {
      slideInterval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }, 15000);
    }
    return () => clearInterval(slideInterval);
  }, [autoSlide, isPinned, slides.length]);

  const StatusIcon = () => {
    switch(status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'pending': 
      case 'info': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Card className={`bg-white shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardHeader className="flex flex-col space-y-2 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
            <StatusIcon />
            {status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                status === 'warning' ? 'bg-amber-50 text-amber-700' :
                status === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`p-1.5 rounded-full transition-colors ${
                isPinned ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50 text-gray-500'
              }`}
              onClick={() => {
                setIsPinned(!isPinned);
                setAutoSlide(false);
              }}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4 text-gray-500" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 text-gray-500" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-50 transition-colors">
              <ExternalLink className="h-4 w-4 text-gray-500" />
            </button>
            <button 
              className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
                isExpanded ? 'transform rotate-180' : ''
              }`} />
            </button>
          </div>
        </div>
        {slides.length > 1 && (
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  activeSlide === index ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onClick={() => {
                  setActiveSlide(index);
                  setAutoSlide(false);
                }}
              />
            ))}
          </div>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4">
          {slides[activeSlide] && (
            <>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {slides[activeSlide].title}
              </h3>
              {slides[activeSlide].content}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

// Convert TileData to the format expected by DashboardTile
const convertTileData = (tileData: TileData) => {
  return {
    title: tileData.title,
    status: tileData.status,
    slides: tileData.slides.map(slide => ({
      title: slide.title || '',
      content: renderSlideContent(slide)
    }))
  };
};

// Render slide content based on chart type
const renderSlideContent = (slide) => {
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
              {slide.series?.map((series, index) => (
                <Bar 
                  key={index}
                  dataKey={series.key} 
                  fill={series.color || "#3B82F6"} 
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
              {slide.series?.map((series, index) => (
                <Line 
                  key={index}
                  type="monotone" 
                  dataKey={series.key} 
                  stroke={series.color || "#3B82F6"} 
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    case 'progress':
      return (
        <div className="space-y-4">
          {slide.data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    item.value >= 90 ? 'bg-emerald-500' :
                    item.value >= 75 ? 'bg-blue-500' :
                    'bg-amber-500'
                  }`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    case 'status':
      return (
        <div className="grid grid-cols-2 gap-4">
          {slide.data.map((item, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              item.status === 'success' ? 'bg-emerald-50 text-emerald-700' :
              item.status === 'warning' ? 'bg-amber-50 text-amber-700' :
              item.status === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-lg font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      );
    case 'grid':
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {slide.columns?.map((column, index) => (
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
                  {slide.columns?.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return <div>No visualization available</div>;
  }
};

// Main Dashboard Component
const ModernFinanceDashboard = () => {
  const [columns, setColumns] = useState(3);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch data from an API
        const data = generateMockTiles();
        setTiles(data);
      } catch (error) {
        console.error('Failed to load finance dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(() => {
      loadData();
      setLastRefreshed(new Date());
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            <span className="text-sm text-gray-500">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LayoutControls columns={columns} setColumns={setColumns} />
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'analysis', icon: TrendingUp, label: 'Analysis' },
            { id: 'risk', icon: AlertTriangle, label: 'Risk Metrics' }
          ].map(tab => (
            <button
              key={tab.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`grid gap-6 grid-cols-1 md:grid-cols-${columns}`}>
          {isLoading ? (
            // Loading placeholders
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-white shadow-sm animate-pulse">
                <CardHeader className="p-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-40 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Actual tiles
            tiles.map((tile, index) => (
              <DashboardTile 
                key={index} 
                {...convertTileData(tile)} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernFinanceDashboard;