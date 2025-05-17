import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TileData } from '@/types/finance-types';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, 
  ArrowRight, Download, RefreshCw, Lightbulb, 
  BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';

interface FinanceAnalysisProps {
  selectedTile: TileData | null;
  tiles: TileData[];
}

const FinanceAnalysis: React.FC<FinanceAnalysisProps> = ({ selectedTile, tiles }) => {
  if (!selectedTile) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Brain className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium">Select a tile from the Overview tab</h3>
            <p className="text-muted-foreground max-w-md">
              AI-powered analysis will be generated based on your selected tile data.
              Go to the Overview tab and click on any tile to see insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate mock insights based on the selected tile
  const generateInsights = () => {
    const insights = [];
    
    // Basic insight based on tile status
    if (selectedTile.status === 'success') {
      insights.push({
        type: 'positive',
        title: 'Positive Performance',
        description: `${selectedTile.title} is showing strong performance metrics with healthy indicators across all measured dimensions.`,
        icon: <TrendingUp className="h-5 w-5 text-emerald-500" />
      });
    } else if (selectedTile.status === 'warning') {
      insights.push({
        type: 'warning',
        title: 'Potential Concerns',
        description: `${selectedTile.title} shows some concerning patterns that may require attention in the coming reporting period.`,
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
      });
    } else if (selectedTile.status === 'error') {
      insights.push({
        type: 'negative',
        title: 'Critical Issues Detected',
        description: `${selectedTile.title} has critical issues that require immediate attention and remediation.`,
        icon: <TrendingDown className="h-5 w-5 text-red-500" />
      });
    }
    
    // Add some generic insights
    insights.push({
      type: 'insight',
      title: 'Pattern Recognition',
      description: 'Our AI analysis has detected a cyclical pattern in this data that correlates with quarterly reporting periods.',
      icon: <Lightbulb className="h-5 w-5 text-blue-500" />
    });
    
    insights.push({
      type: 'insight',
      title: 'Predictive Analysis',
      description: 'Based on historical trends, we project a 12% increase in activity for the next reporting period.',
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />
    });
    
    // Add a recommendation
    insights.push({
      type: 'recommendation',
      title: 'Recommended Action',
      description: 'Consider reallocating resources to optimize performance based on the detected patterns.',
      icon: <ArrowRight className="h-5 w-5 text-purple-500" />
    });
    
    return insights;
  };
  
  const insights = generateInsights();
  
  // Generate predictive data based on the selected tile
  const generatePredictiveData = () => {
    if (!selectedTile.slides || !selectedTile.slides[0] || !selectedTile.slides[0].data) {
      return [];
    }
    
    const baseData = selectedTile.slides[0].data;
    
    // Create a predictive extension of the data
    return baseData.map(item => {
      const value = typeof item.value === 'number' ? item.value : 
                   (typeof item.pv === 'number' ? item.pv : 
                   (typeof item.uv === 'number' ? item.uv : Math.random() * 100));
      
      // Add some random variation for prediction
      const predictedValue = value * (1 + (Math.random() * 0.4 - 0.2));
      
      return {
        ...item,
        predicted: Math.round(predictedValue * 10) / 10
      };
    });
  };
  
  const predictiveData = generatePredictiveData();
  
  // Generate correlation data with other tiles
  const generateCorrelationData = () => {
    return tiles.map(tile => ({
      name: tile.title,
      correlation: tile.id === selectedTile.id ? 1 : Math.random().toFixed(2),
      value: Math.round(Math.random() * 100)
    })).sort((a, b) => parseFloat(b.correlation) - parseFloat(a.correlation));
  };
  
  const correlationData = generateCorrelationData();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis: {selectedTile.title}
              </CardTitle>
              <CardDescription>
                Machine learning insights based on selected data
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {insights.map((insight, index) => (
              <Card key={index} className={`
                ${insight.type === 'positive' ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' : ''}
                ${insight.type === 'warning' ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' : ''}
                ${insight.type === 'negative' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : ''}
                ${insight.type === 'insight' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' : ''}
                ${insight.type === 'recommendation' ? 'border-purple-200 bg-purple-50 dark:bg-purple-950/20' : ''}
              `}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {insight.icon}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Tabs defaultValue="predictive">
            <TabsList>
              <TabsTrigger value="predictive" className="flex items-center gap-1">
                <LineChartIcon className="h-4 w-4" />
                Predictive Analysis
              </TabsTrigger>
              <TabsTrigger value="correlation" className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4" />
                Correlation Analysis
              </TabsTrigger>
              <TabsTrigger value="impact" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4" />
                Impact Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="predictive" className="mt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Predictive Trend Analysis</CardTitle>
                  <CardDescription>
                    AI-generated forecast based on historical patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={predictiveData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0369a1" 
                          name="Actual" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#6366f1" 
                          name="Predicted" 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="correlation" className="mt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Correlation with Other Metrics</CardTitle>
                  <CardDescription>
                    How this metric relates to other financial indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={correlationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="correlation" fill="#0369a1" name="Correlation Coefficient" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="impact" className="mt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Business Impact Analysis</CardTitle>
                  <CardDescription>
                    Estimated impact on key business areas
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Revenue', value: 35 },
                            { name: 'Cost Reduction', value: 25 },
                            { name: 'Risk Mitigation', value: 20 },
                            { name: 'Compliance', value: 15 },
                            { name: 'Other', value: 5 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Revenue', value: 35, color: '#0369a1' },
                            { name: 'Cost Reduction', value: 25, color: '#10b981' },
                            { name: 'Risk Mitigation', value: 20, color: '#f59e0b' },
                            { name: 'Compliance', value: 15, color: '#6366f1' },
                            { name: 'Other', value: 5, color: '#d1d5db' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              Analysis generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FinanceAnalysis;