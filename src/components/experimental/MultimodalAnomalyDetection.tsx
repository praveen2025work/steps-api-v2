import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  BarChart4, 
  LineChart, 
  PieChart, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Eye,
  Calendar,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MultimodalAnomalyDetection() {
  const [activeTab, setActiveTab] = useState('realtime');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [dataSource, setDataSource] = useState('all');

  const handleScan = () => {
    setScanning(true);
    setProgress(0);
    setAnomalies([]);
    
    // Simulate scanning
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          
          // Set demo results
          setAnomalies([
            {
              id: 'ANM-2025-001',
              timestamp: '2025-05-21T14:32:15Z',
              type: 'transaction',
              severity: 'high',
              description: 'Unusual transaction pattern detected in Asia-Pacific reconciliation workflow',
              confidence: 0.94,
              affectedWorkflows: ['APAC-REC-001', 'APAC-REC-002'],
              suggestedAction: 'Review transaction batch #45892 for potential duplicates'
            },
            {
              id: 'ANM-2025-002',
              timestamp: '2025-05-21T15:18:42Z',
              type: 'system',
              severity: 'medium',
              description: 'Abnormal processing time in validation stage for European market data',
              confidence: 0.87,
              affectedWorkflows: ['EU-VAL-005'],
              suggestedAction: 'Check system resources and database performance'
            },
            {
              id: 'ANM-2025-003',
              timestamp: '2025-05-21T16:05:11Z',
              type: 'user',
              severity: 'low',
              description: 'Unusual access pattern detected for user ID #8742',
              confidence: 0.76,
              affectedWorkflows: ['GLOBAL-AUDIT-003'],
              suggestedAction: 'Review user activity logs for potential security concerns'
            }
          ]);
          
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-amber-500 bg-amber-50';
      case 'low': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <BarChart4 className="h-4 w-4" />;
      case 'system': return <RefreshCw className="h-4 w-4" />;
      case 'user': return <Eye className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Multimodal Anomaly Detection</CardTitle>
              <CardDescription>Detect unusual patterns across workflows, transactions, and user behaviors</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            <Sparkles className="h-3 w-3 mr-1" />
            Experimental
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="realtime">
              <Clock className="h-4 w-4 mr-2" />
              Real-time
            </TabsTrigger>
            <TabsTrigger value="historical">
              <Calendar className="h-4 w-4 mr-2" />
              Historical
            </TabsTrigger>
            <TabsTrigger value="predictive">
              <LineChart className="h-4 w-4 mr-2" />
              Predictive
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="realtime" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Monitor workflows in real-time to detect anomalies as they occur. Uses multimodal AI to analyze transaction patterns, system metrics, and user behaviors simultaneously.
            </div>
          </TabsContent>
          
          <TabsContent value="historical" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Analyze historical data to identify past anomalies that may have been missed. Useful for auditing, compliance reviews, and improving detection algorithms.
            </div>
          </TabsContent>
          
          <TabsContent value="predictive" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Forecast potential future anomalies based on current trends and patterns. Helps prevent issues before they occur by identifying emerging risk patterns.
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Data Source</label>
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="transactions">Transactions</SelectItem>
                <SelectItem value="workflows">Workflows</SelectItem>
                <SelectItem value="users">User Activity</SelectItem>
                <SelectItem value="system">System Metrics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {scanning && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Scanning for anomalies...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {anomalies.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Detected Anomalies</h3>
              <Badge variant="outline">{anomalies.length} found</Badge>
            </div>
            
            <div className="space-y-3">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getSeverityColor(anomaly.severity)}`}>
                        {getTypeIcon(anomaly.type)}
                      </div>
                      <span className="font-medium">{anomaly.id}</span>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm">{anomaly.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Confidence: {(anomaly.confidence * 100).toFixed(1)}%</span>
                    <span>•</span>
                    <span>Affected: {anomaly.affectedWorkflows.join(', ')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1">
                    <div className="text-xs text-muted-foreground">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                        Ignore
                      </Button>
                      <Button size="sm" className="h-7 px-2 text-xs">
                        Investigate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Using multimodal neural networks to analyze patterns across data sources
        </div>
        <Button onClick={handleScan} disabled={scanning}>
          {scanning ? 'Scanning...' : 'Scan for Anomalies'}
        </Button>
      </CardFooter>
    </Card>
  );
}