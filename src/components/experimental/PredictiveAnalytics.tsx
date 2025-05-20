import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, Clock, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

// Mock data for predictions
const timeSeriesData = [
  { date: '2025-05-01', actual: 45, predicted: 48 },
  { date: '2025-05-02', actual: 52, predicted: 50 },
  { date: '2025-05-03', actual: 49, predicted: 51 },
  { date: '2025-05-04', actual: 63, predicted: 60 },
  { date: '2025-05-05', actual: 59, predicted: 62 },
  { date: '2025-05-06', actual: 67, predicted: 65 },
  { date: '2025-05-07', actual: 72, predicted: 70 },
  { date: '2025-05-08', actual: 78, predicted: 75 },
  { date: '2025-05-09', actual: 82, predicted: 80 },
  { date: '2025-05-10', actual: 76, predicted: 78 },
  { date: '2025-05-11', actual: 84, predicted: 82 },
  { date: '2025-05-12', actual: 90, predicted: 87 },
  { date: '2025-05-13', actual: 92, predicted: 93 },
  { date: '2025-05-14', actual: 96, predicted: 98 },
  { date: '2025-05-15', actual: 104, predicted: 102 },
  { date: '2025-05-16', actual: 110, predicted: 108 },
  { date: '2025-05-17', actual: 108, predicted: 112 },
  { date: '2025-05-18', actual: 118, predicted: 115 },
  { date: '2025-05-19', actual: 125, predicted: 120 },
  { date: '2025-05-20', actual: null, predicted: 128 },
  { date: '2025-05-21', actual: null, predicted: 135 },
  { date: '2025-05-22', actual: null, predicted: 142 },
  { date: '2025-05-23', actual: null, predicted: 148 },
  { date: '2025-05-24', actual: null, predicted: 155 },
  { date: '2025-05-25', actual: null, predicted: 160 },
  { date: '2025-05-26', actual: null, predicted: 168 },
  { date: '2025-05-27', actual: null, predicted: 175 },
];

const bottleneckData = [
  { stage: 'Data Collection', frequency: 12, avgDuration: 45 },
  { stage: 'Data Validation', frequency: 28, avgDuration: 120 },
  { stage: 'Risk Assessment', frequency: 8, avgDuration: 60 },
  { stage: 'Compliance Check', frequency: 18, avgDuration: 90 },
  { stage: 'Manager Approval', frequency: 32, avgDuration: 240 },
  { stage: 'Final Review', frequency: 15, avgDuration: 75 },
  { stage: 'Publication', frequency: 5, avgDuration: 30 },
];

const anomalyData = [
  { date: '2025-05-01', value: 45, isAnomaly: false },
  { date: '2025-05-02', value: 52, isAnomaly: false },
  { date: '2025-05-03', value: 49, isAnomaly: false },
  { date: '2025-05-04', value: 63, isAnomaly: false },
  { date: '2025-05-05', value: 59, isAnomaly: false },
  { date: '2025-05-06', value: 67, isAnomaly: false },
  { date: '2025-05-07', value: 72, isAnomaly: false },
  { date: '2025-05-08', value: 78, isAnomaly: false },
  { date: '2025-05-09', value: 82, isAnomaly: false },
  { date: '2025-05-10', value: 76, isAnomaly: false },
  { date: '2025-05-11', value: 84, isAnomaly: false },
  { date: '2025-05-12', value: 90, isAnomaly: false },
  { date: '2025-05-13', value: 92, isAnomaly: false },
  { date: '2025-05-14', value: 96, isAnomaly: false },
  { date: '2025-05-15', value: 104, isAnomaly: false },
  { date: '2025-05-16', value: 110, isAnomaly: false },
  { date: '2025-05-17', value: 108, isAnomaly: false },
  { date: '2025-05-18', value: 118, isAnomaly: false },
  { date: '2025-05-19', value: 125, isAnomaly: false },
  { date: '2025-05-20', value: 180, isAnomaly: true },
  { date: '2025-05-21', value: 135, isAnomaly: false },
  { date: '2025-05-22', value: 142, isAnomaly: false },
  { date: '2025-05-23', value: 148, isAnomaly: false },
  { date: '2025-05-24', value: 155, isAnomaly: false },
  { date: '2025-05-25', value: 160, isAnomaly: false },
  { date: '2025-05-26', value: 168, isAnomaly: false },
  { date: '2025-05-27', value: 175, isAnomaly: false },
];

export const PredictiveAnalytics = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState('pnl-workflow');
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            Predictive Analytics
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            AI-powered predictions and insights for your workflows
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pnl-workflow">Daily Named PnL</SelectItem>
              <SelectItem value="rates-workflow">Rates</SelectItem>
              <SelectItem value="erates-workflow">eRates</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="forecasting">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="forecasting" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Forecasting
          </TabsTrigger>
          <TabsTrigger value="bottlenecks" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Bottleneck Detection
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomaly Detection
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChartIcon className="h-5 w-5 mr-2" />
                Workflow Completion Time Forecast
              </CardTitle>
              <CardDescription>
                Predicted vs. actual completion times for {selectedWorkflow === 'pnl-workflow' ? 'Daily Named PnL' : selectedWorkflow === 'rates-workflow' ? 'Rates' : 'eRates'} workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#8884d8" 
                      name="Actual Time" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#82ca9d" 
                      name="Predicted Time" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">AI Insights:</h4>
                <p>Based on historical data, we predict that the {selectedWorkflow === 'pnl-workflow' ? 'Daily Named PnL' : selectedWorkflow === 'rates-workflow' ? 'Rates' : 'eRates'} workflow will see a 15% increase in processing time over the next week. Consider allocating additional resources to maintain SLAs.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Workflow Bottleneck Analysis
              </CardTitle>
              <CardDescription>
                Identifying stages that frequently cause delays in your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bottleneckData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Avg Duration (min)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="frequency" name="Delay Frequency" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="avgDuration" name="Avg Duration (min)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">AI Insights:</h4>
                <p>The "Manager Approval" stage is the most significant bottleneck in your workflow, with both high frequency of delays and long average duration. Consider implementing an automated pre-approval system for standard cases to reduce the burden on managers.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Anomaly Detection
              </CardTitle>
              <CardDescription>
                Automatically detecting unusual patterns in your workflow execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={anomalyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      name="Completion Time" 
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.isAnomaly) {
                          return (
                            <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red">
                              <circle cx="10" cy="10" r="8" stroke="red" strokeWidth="2" fill="none" />
                              <circle cx="10" cy="10" r="4" fill="red" />
                            </svg>
                          );
                        }
                        return <circle cx={cx} cy={cy} r={4} fill="#8884d8" />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">AI Insights:</h4>
                <p>An anomaly was detected on May 20th, where the workflow completion time was 44% higher than expected. This coincided with a system update in the data processing pipeline. Consider scheduling future updates during off-peak hours.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};