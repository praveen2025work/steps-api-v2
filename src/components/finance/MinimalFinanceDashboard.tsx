import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TileStatus } from '@/types/finance-types';

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

// Minimal tile component
const MinimalTile: React.FC<{
  title: string;
  status: TileStatus;
  children: React.ReactNode;
}> = ({ title, status, children }) => {
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

// Simple progress bar component
const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
    <div 
      className={`h-full transition-all duration-500`}
      style={{ width: `${value}%`, backgroundColor: color }}
    />
  </div>
);

// Main Dashboard Component
const MinimalFinanceDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Static data for the minimal dashboard
  const tiles = [
    {
      id: 'data-availability',
      title: 'Data Availability',
      status: 'success' as TileStatus,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
              <div className="text-sm font-medium">Market Data</div>
              <div className="text-lg font-bold">Available</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
              <div className="text-sm font-medium">Reference Data</div>
              <div className="text-lg font-bold">Available</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
              <div className="text-sm font-medium">Trade Data</div>
              <div className="text-lg font-bold">Available</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-700">
              <div className="text-sm font-medium">Position Data</div>
              <div className="text-lg font-bold">Delayed</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'fobo-review',
      title: 'FOBO Review',
      status: 'warning' as TileStatus,
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">BRK001</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Trade Mismatch</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Open</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">BRK002</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Missing Allocation</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Open</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'pnl-analysis',
      title: 'P&L Analysis',
      status: 'success' as TileStatus,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Equities</span>
            <span>45%</span>
          </div>
          <ProgressBar value={45} color="#0ea5e9" />
          
          <div className="flex items-center justify-between">
            <span>Fixed Income</span>
            <span>30%</span>
          </div>
          <ProgressBar value={30} color="#8b5cf6" />
          
          <div className="flex items-center justify-between">
            <span>Commodities</span>
            <span>15%</span>
          </div>
          <ProgressBar value={15} color="#f59e0b" />
          
          <div className="flex items-center justify-between">
            <span>FX</span>
            <span>10%</span>
          </div>
          <ProgressBar value={10} color="#ef4444" />
        </div>
      )
    },
    {
      id: 'fx-exposure',
      title: 'FX Exposure',
      status: 'info' as TileStatus,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>USD</span>
            <span>85%</span>
          </div>
          <ProgressBar value={85} color="#0ea5e9" />
          
          <div className="flex items-center justify-between">
            <span>EUR</span>
            <span>92%</span>
          </div>
          <ProgressBar value={92} color="#8b5cf6" />
          
          <div className="flex items-center justify-between">
            <span>GBP</span>
            <span>78%</span>
          </div>
          <ProgressBar value={78} color="#f59e0b" />
          
          <div className="flex items-center justify-between">
            <span>JPY</span>
            <span>95%</span>
          </div>
          <ProgressBar value={95} color="#ef4444" />
        </div>
      )
    },
    {
      id: 'liquidity-status',
      title: 'Liquidity Status',
      status: 'success' as TileStatus,
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
            <div className="text-sm font-medium">LCR</div>
            <div className="text-lg font-bold">125%</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
            <div className="text-sm font-medium">NSFR</div>
            <div className="text-lg font-bold">110%</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
            <div className="text-sm font-medium">Cash Reserves</div>
            <div className="text-lg font-bold">$1.2B</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
            <div className="text-sm font-medium">Intraday</div>
            <div className="text-lg font-bold">95%</div>
          </div>
        </div>
      )
    },
    {
      id: 'regulatory-reporting',
      title: 'Regulatory Reporting',
      status: 'warning' as TileStatus,
      content: (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">FINREP</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-05-30</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">In Progress</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">COREP</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-05-25</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">In Progress</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setLastRefreshed(new Date());
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
          {tiles.map((tile) => (
            <MinimalTile 
              key={tile.id} 
              title={tile.title} 
              status={tile.status}
            >
              {tile.content}
            </MinimalTile>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinimalFinanceDashboard;