import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid2X2, LayoutGrid, Table2, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define types for our components
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface FinancialItem {
  id: string;
  title: string;
  value: string;
  status: StatusType;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

// Simple tile component
const FinanceTile: React.FC<FinancialItem> = ({ title, value, status, trend, change }) => {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-md">
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && change && (
            <div className="flex items-center">
              {trend === 'up' ? (
                <span className="text-emerald-500 flex items-center text-sm">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {change}
                </span>
              ) : trend === 'down' ? (
                <span className="text-red-500 flex items-center text-sm">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {change}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const FinancePage: React.FC = () => {
  // Static data for financial tiles
  const financialData: FinancialItem[] = [
    { id: '1', title: 'Daily P&L', value: '$2.4M', status: 'success', trend: 'up', change: '5.2%' },
    { id: '2', title: 'Risk Exposure', value: '$24.5M', status: 'warning', trend: 'up', change: '3.1%' },
    { id: '3', title: 'Liquidity', value: '125%', status: 'success', trend: 'up', change: '2.5%' },
    { id: '4', title: 'Settlement', value: '85%', status: 'info', trend: 'down', change: '1.3%' },
    { id: '5', title: 'Regulatory', value: '3 pending', status: 'warning' },
    { id: '6', title: 'Data Quality', value: '97%', status: 'success', trend: 'up', change: '0.5%' },
    { id: '7', title: 'Market Data', value: 'Available', status: 'success' },
    { id: '8', title: 'FX Exposure', value: '$15.2M', status: 'info', trend: 'down', change: '2.8%' },
    { id: '9', title: 'Collateral', value: '$42.8M', status: 'neutral' }
  ];

  // Current time for "last refreshed"
  const [lastRefreshed] = useState(new Date());

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
          
          <Tabs defaultValue="tile" className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="tile" title="Tile View">
                <Grid2X2 className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Tiles</span>
              </TabsTrigger>
              <TabsTrigger value="summary" title="Summary View">
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="grid" title="Grid View">
                <Table2 className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Grid</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Tile View */}
            <TabsContent value="tile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {financialData.map(item => (
                  <FinanceTile 
                    key={item.id}
                    {...item}
                  />
                ))}
              </div>
            </TabsContent>
            
            {/* Summary View */}
            <TabsContent value="summary">
              <div className="w-full bg-gradient-to-r from-blue-900/20 to-emerald-900/20 rounded-lg border shadow-sm flex flex-col items-center justify-center p-6 mt-4">
                <h3 className="text-xl font-medium mb-4">Financial Summary Dashboard</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
                  {financialData.slice(0, 6).map(item => (
                    <div key={item.id} className={`p-4 rounded-lg border ${
                      item.status === 'success' ? 'bg-green-100/30 border-green-200' : 
                      item.status === 'warning' ? 'bg-yellow-100/30 border-yellow-200' : 
                      item.status === 'error' ? 'bg-red-100/30 border-red-200' : 
                      item.status === 'info' ? 'bg-blue-100/30 border-blue-200' :
                      'bg-gray-100/30 border-gray-200'
                    }`}>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-2xl font-bold">{item.value}</div>
                        {item.trend && item.change && (
                          <div className="flex items-center">
                            {item.trend === 'up' ? (
                              <span className="text-emerald-500 flex items-center text-sm">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                {item.change}
                              </span>
                            ) : item.trend === 'down' ? (
                              <span className="text-red-500 flex items-center text-sm">
                                <ArrowDown className="h-3 w-3 mr-1" />
                                {item.change}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Grid View */}
            <TabsContent value="grid">
              <div className="rounded-md border mt-4">
                <div className="p-4 bg-muted/50">
                  <h3 className="text-lg font-medium">Financial Data Grid</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-sm">Title</th>
                        <th className="px-4 py-3 text-left font-medium text-sm">Value</th>
                        <th className="px-4 py-3 text-left font-medium text-sm">Change</th>
                        <th className="px-4 py-3 text-left font-medium text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.map(item => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">{item.title}</td>
                          <td className="px-4 py-3">{item.value}</td>
                          <td className="px-4 py-3">
                            {item.trend && item.change ? (
                              <div className="flex items-center">
                                {item.trend === 'up' ? (
                                  <span className="text-emerald-500 flex items-center">
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                    {item.change}
                                  </span>
                                ) : (
                                  <span className="text-red-500 flex items-center">
                                    <ArrowDown className="h-3 w-3 mr-1" />
                                    {item.change}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`
                              ${item.status === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                              ${item.status === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                              ${item.status === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                              ${item.status === 'info' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                              ${item.status === 'neutral' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : ''}
                            `}>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinancePage;