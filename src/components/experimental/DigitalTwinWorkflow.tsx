import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  GitBranch, 
  GitMerge, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  Layers,
  Cpu,
  Network,
  Timer,
  Zap,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export function DigitalTwinWorkflow() {
  const [activeTab, setActiveTab] = useState('simulation');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [enableOptimization, setEnableOptimization] = useState(true);
  const [enableFailures, setEnableFailures] = useState(true);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState(1);
  
  const handleStartSimulation = () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentDay(1);
    setSimulationResults(null);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          
          // Set demo results
          setSimulationResults({
            completionTime: '4d 6h 12m',
            resourceUtilization: 78,
            bottlenecks: [
              { stage: 'Data Validation', severity: 'high', impact: '12h delay' },
              { stage: 'Reconciliation', severity: 'medium', impact: '4h delay' }
            ],
            optimizationPotential: 22,
            riskAreas: [
              { name: 'Market Data Processing', probability: 0.35, impact: 'medium' },
              { name: 'Cross-Border Validation', probability: 0.28, impact: 'high' }
            ],
            recommendations: [
              'Increase parallel processing for Data Validation stage',
              'Add redundancy for Market Data feeds',
              'Pre-allocate resources for peak processing times',
              'Implement circuit breaker pattern for Cross-Border Validation'
            ]
          });
          
          return 100;
        }
        
        // Update current day based on progress
        const newProgress = prev + (0.5 * simulationSpeed);
        const newDay = Math.ceil((newProgress / 100) * 5); // 5 days simulation
        if (newDay !== currentDay) {
          setCurrentDay(newDay);
        }
        
        return newProgress;
      });
    }, 100);
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setProgress(0);
    setCurrentDay(1);
    setSimulationResults(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Digital Twin Workflow Simulation</CardTitle>
              <CardDescription>Create virtual replicas of workflows to simulate, test, and optimize</CardDescription>
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
            <TabsTrigger value="simulation">
              <Play className="h-4 w-4 mr-2" />
              Simulation
            </TabsTrigger>
            <TabsTrigger value="optimization">
              <Zap className="h-4 w-4 mr-2" />
              Optimization
            </TabsTrigger>
            <TabsTrigger value="scenarios">
              <GitBranch className="h-4 w-4 mr-2" />
              Scenarios
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="simulation" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Create a digital twin of your workflow to simulate execution under various conditions. Test performance, identify bottlenecks, and validate changes before implementing them in production.
            </div>
          </TabsContent>
          
          <TabsContent value="optimization" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Automatically identify optimization opportunities in your workflow. The AI analyzes resource allocation, parallel processing potential, and scheduling to suggest improvements.
            </div>
          </TabsContent>
          
          <TabsContent value="scenarios" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Create and compare multiple what-if scenarios to evaluate different workflow configurations. Test how your workflow performs under various conditions, resource constraints, and failure modes.
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-sm font-medium">Simulation Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="simulation-speed">Simulation Speed</Label>
                <span className="text-xs text-muted-foreground">{simulationSpeed}x</span>
              </div>
              <Slider 
                id="simulation-speed"
                min={0.5} 
                max={5} 
                step={0.5} 
                value={[simulationSpeed]} 
                onValueChange={(value) => setSimulationSpeed(value[0])}
                disabled={isRunning}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="enable-optimization" 
                checked={enableOptimization} 
                onCheckedChange={setEnableOptimization}
                disabled={isRunning}
              />
              <Label htmlFor="enable-optimization">Enable AI Optimization</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="enable-failures" 
                checked={enableFailures} 
                onCheckedChange={setEnableFailures}
                disabled={isRunning}
              />
              <Label htmlFor="enable-failures">Simulate Random Failures</Label>
            </div>
          </div>
        </div>
        
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span>Simulating workflow execution...</span>
              <span>Day {currentDay} of 5</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-center space-x-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setIsRunning(false)}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button size="sm" variant="outline">
                <SkipForward className="h-4 w-4 mr-1" />
                Skip to End
              </Button>
            </div>
          </div>
        )}
        
        {simulationResults && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Simulation Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-3 space-y-1">
                <div className="text-xs text-muted-foreground">Completion Time</div>
                <div className="text-lg font-medium flex items-center">
                  <Timer className="h-4 w-4 mr-1 text-primary" />
                  {simulationResults.completionTime}
                </div>
              </div>
              
              <div className="border rounded-lg p-3 space-y-1">
                <div className="text-xs text-muted-foreground">Resource Utilization</div>
                <div className="text-lg font-medium flex items-center">
                  <Cpu className="h-4 w-4 mr-1 text-primary" />
                  {simulationResults.resourceUtilization}%
                </div>
              </div>
              
              <div className="border rounded-lg p-3 space-y-1">
                <div className="text-xs text-muted-foreground">Optimization Potential</div>
                <div className="text-lg font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-1 text-primary" />
                  {simulationResults.optimizationPotential}%
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Identified Bottlenecks</h4>
              {simulationResults.bottlenecks.map((bottleneck, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <div className={`mr-2 ${getSeverityColor(bottleneck.severity)}`}>
                      {getSeverityIcon(bottleneck.severity)}
                    </div>
                    <span>{bottleneck.stage}</span>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(bottleneck.severity)}>
                    {bottleneck.impact}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recommendations</h4>
              <ul className="space-y-2">
                {simulationResults.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset} disabled={isRunning}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleStartSimulation} disabled={isRunning}>
          {isRunning ? (
            <>
              <Layers className="h-4 w-4 mr-2 animate-pulse" />
              Simulating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Simulation
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}