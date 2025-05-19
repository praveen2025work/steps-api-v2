import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import TileRenderer from './TileRenderer';
import { getApplications, getDashboardConfig } from '@/lib/operations';
import type { Application, DashboardConfig } from '@/types/operations-types';

export default function OperationsDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('operational');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const apps = await getApplications();
        setApplications(apps);
        
        // Load default dashboard or app-specific dashboard
        const config = await getDashboardConfig(selectedApp !== 'all' ? selectedApp : 'default');
        setDashboardConfig(config);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedApp]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const config = await getDashboardConfig(selectedApp !== 'all' ? selectedApp : 'default');
      setDashboardConfig(config);
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = () => {
      handleRefresh();
    };
    
    window.addEventListener('app:refresh', handleGlobalRefresh);
    return () => {
      window.removeEventListener('app:refresh', handleGlobalRefresh);
    };
  }, [selectedApp]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Select value={selectedApp} onValueChange={setSelectedApp}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Application" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            {applications.map(app => (
              <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Critical Alerts Section */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Critical Alert</AlertTitle>
        <AlertDescription>
          PnL process failures detected in APAC region. 3 processes require immediate attention.
        </AlertDescription>
      </Alert>

      {/* Dashboard Views */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="operational">Operational View</TabsTrigger>
          <TabsTrigger value="sla">SLA View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="operational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Active Processes</CardTitle>
                <CardDescription>Currently running processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">42</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Failed Processes</CardTitle>
                <CardDescription>Processes requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-destructive">7</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>SLA Status</CardTitle>
                <CardDescription>Process SLA compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-500">86%</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Dynamic Tile Grid */}
          {dashboardConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {dashboardConfig.layout.map(tileLayout => (
                <div key={tileLayout.id} className={`col-span-${tileLayout.width} row-span-${tileLayout.height}`}>
                  <TileRenderer config={tileLayout.tileConfig} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sla" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>On Track</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500">36</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>At Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-500">5</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Breached</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-destructive">2</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>SLA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">86%</div>
              </CardContent>
            </Card>
          </div>
          
          {/* SLA-specific tiles would be rendered here */}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Avg. Process Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">42m</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500">94%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Manual Interventions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">12</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Analytics-specific tiles would be rendered here */}
        </TabsContent>
      </Tabs>
    </div>
  );
}