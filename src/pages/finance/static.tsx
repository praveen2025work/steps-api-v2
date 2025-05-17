import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, ChevronLeft } from 'lucide-react';

// Static Finance Dashboard Page
const StaticFinancePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Finance Dashboard</title>
      </Head>
      
      <div className="min-h-screen bg-background">
        {/* Simple Header */}
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span className="font-bold">STEPS</span>
              </Link>
              
              <div className="flex items-center">
                <ChevronLeft className="h-4 w-4" />
                <Link href="/" className="ml-2 text-sm text-muted-foreground">
                  Back to Dashboard
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                John Doe
              </span>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="container py-6 px-4 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Financial Dashboard</h1>
              <p className="text-muted-foreground">
                Last refreshed: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Static Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Data Availability Tile */}
            <div className="border rounded-lg shadow-sm bg-card text-card-foreground">
              <div className="p-4 flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Data Availability</h3>
              </div>
              <div className="p-4 pt-0">
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
            </div>
            
            {/* FOBO Review Tile */}
            <div className="border rounded-lg shadow-sm bg-card text-card-foreground">
              <div className="p-4 flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">FOBO Review</h3>
              </div>
              <div className="p-4 pt-0">
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
            </div>
            
            {/* P&L Analysis Tile */}
            <div className="border rounded-lg shadow-sm bg-card text-card-foreground">
              <div className="p-4 flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">P&L Analysis</h3>
              </div>
              <div className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Equities</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ width: '45%', backgroundColor: '#0ea5e9' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Fixed Income</span>
                    <span>30%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ width: '30%', backgroundColor: '#8b5cf6' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Commodities</span>
                    <span>15%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ width: '15%', backgroundColor: '#f59e0b' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>FX</span>
                    <span>10%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ width: '10%', backgroundColor: '#ef4444' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* FX Exposure Tile */}
            <div className="border rounded-lg shadow-sm bg-card text-card-foreground">
              <div className="p-4 flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">FX Exposure</h3>
              </div>
              <div className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>USD</span>
                    <span>85%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ width: '85%', backgroundColor: '#0ea5e9' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>EUR</span>
                    <span>92%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ width: '92%', backgroundColor: '#8b5cf6' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>GBP</span>
                    <span>78%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ width: '78%', backgroundColor: '#f59e0b' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>JPY</span>
                    <span>95%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ width: '95%', backgroundColor: '#ef4444' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Liquidity Status Tile */}
            <div className="border rounded-lg shadow-sm bg-card text-card-foreground">
              <div className="p-4 flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Liquidity Status</h3>
              </div>
              <div className="p-4 pt-0">
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
              </div>
            </div>
            
            {/* Regulatory Reporting Tile */}
            <div className="border rounded-lg shadow-sm bg-card text-card-foreground">
              <div className="p-4 flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Regulatory Reporting</h3>
              </div>
              <div className="p-4 pt-0">
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default StaticFinancePage;