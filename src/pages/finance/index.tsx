import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid2X2, LayoutGrid, Table2 } from 'lucide-react';

const FinancePage = () => {
  // Simple static data for financial tiles
  const financialData = [
    { id: '1', title: 'Daily P&L', value: '$2.4M', status: 'success' },
    { id: '2', title: 'Risk Exposure', value: '$24.5M', status: 'warning' },
    { id: '3', title: 'Liquidity', value: '125%', status: 'success' },
    { id: '4', title: 'Settlement', value: '85%', status: 'info' },
    { id: '5', title: 'Regulatory', value: '3 pending', status: 'warning' },
    { id: '6', title: 'Data Quality', value: '97%', status: 'success' },
    { id: '7', title: 'Market Data', value: 'Available', status: 'success' },
    { id: '8', title: 'FX Exposure', value: '$15.2M', status: 'info' },
    { id: '9', title: 'Collateral', value: '$42.8M', status: 'neutral' }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Last refreshed: {new Date().toLocaleTimeString()}
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
            
            <TabsContent value="tile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {financialData.map(item => (
                  <FinanceTile 
                    key={item.id}
                    title={item.title}
                    value={item.value}
                    status={item.status}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="summary">
              <div className="w-full h-[400px] bg-gradient-to-r from-blue-900/20 to-emerald-900/20 rounded-lg border shadow-sm flex flex-col items-center justify-center mt-4">
                <h3 className="text-xl font-medium mb-4">Financial Summary Dashboard</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl px-4 md:px-8">
                  {financialData.slice(0, 6).map(item => (
                    <div key={item.id} className={`p-4 rounded-lg border ${
                      item.status === 'success' ? 'bg-green-100/30 border-green-200' : 
                      item.status === 'warning' ? 'bg-yellow-100/30 border-yellow-200' : 
                      item.status === 'error' ? 'bg-red-100/30 border-red-200' : 
                      'bg-blue-100/30 border-blue-200'
                    }`}>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-2xl font-bold mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="grid">
              <div className="rounded-md border mt-4">
                <div className="p-4 bg-muted/50">
                  <h3 className="text-lg font-medium">Financial Data Grid</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-sm">Title</th>
                      <th className="px-4 py-3 text-left font-medium text-sm">Value</th>
                      <th className="px-4 py-3 text-left font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.map(item => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">{item.title}</td>
                        <td className="px-4 py-3">{item.value}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${item.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                            ${item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${item.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                            ${item.status === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                            ${item.status === 'neutral' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Simple tile component with no complex logic
const FinanceTile = ({ title, value, status }) => {
  const getStatusColor = (status) => {
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
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default FinancePage;