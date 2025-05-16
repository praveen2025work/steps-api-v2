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
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />;
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

// Main Dashboard Component
const ModernDashboard = () => {
  const [columns, setColumns] = useState(3);
  const [selectedTile, setSelectedTile] = useState(null);

  // Example tiles data
  const tiles = [
    {
      title: "Data Availability & Review",
      status: "success",
      slides: [
        {
          title: "Feed Status",
          content: (
            <div className="space-y-4">
              {[
                { label: "Feeds Available", value: 85 },
                { label: "Book OFC", value: 92 },
                { label: "FOBO Reports", value: 78 },
                { label: "PLEX", value: 95 }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.label}</span>
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
          )
        }
      ]
    },
    {
      title: "FOBO Rev/Adjust",
      status: "warning",
      slides: [
        {
          title: "Adjustments",
          content: (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Total Breaks", value: 450 },
                  { name: "High Priority", value: 280 },
                  { name: "Medium Priority", value: 170 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        }
      ]
    },
    {
      title: "FX Exp & FX Reval",
      status: "warning",
      slides: [
        {
          title: "Exposure Analysis",
          content: (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: "USD", value: 150 },
                  { name: "EUR", value: 250 },
                  { name: "GBP", value: 180 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        }
      ]
    },
    {
      title: "P&L Analysis",
      status: "success",
      slides: [
        {
          title: "Daily Overview",
          content: (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Trading", value: 1200 },
                  { name: "Investment", value: 2800 },
                  { name: "Other", value: 500 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Financial Dashboard
              </h1>
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <LayoutControls columns={columns} setColumns={setColumns} />
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`grid gap-6 grid-cols-${columns}`}>
          {tiles.map((tile, index) => (
            <DashboardTile key={index} {...tile} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;