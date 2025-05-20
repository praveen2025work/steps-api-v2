import React, { useState } from 'react';
import { 
  PlayCircle, 
  PauseCircle, 
  SkipForward, 
  RotateCcw, 
  Clock, 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Hourglass,
  Gauge,
  Users,
  Calendar,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { showSuccessToast, showInfoToast, showWarningToast } from '@/lib/toast';

// Types for simulation
interface SimulationStage {
  id: string;
  name: string;
  duration: number; // in minutes
  resourceRequirement: number; // 1-10 scale
  dependsOn: string[];
  status: 'pending' | 'inProgress' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  assignedTo?: string;
  bottleneck: boolean;
  criticalPath: boolean;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  stages: SimulationStage[];
  resources: number;
  startDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  status: 'notStarted' | 'inProgress' | 'completed' | 'failed';
  progress: number;
  bottlenecks: string[];
  risks: {
    id: string;
    description: string;
    probability: number; // 0-1
    impact: number; // 1-10
    mitigated: boolean;
  }[];
}

// Sample data
const sampleScenarios: SimulationScenario[] = [
  {
    id: 'scenario-1',
    name: 'Standard Daily PnL Run',
    description: 'Simulation of a typical daily PnL calculation workflow with normal resource allocation',
    stages: [
      {
        id: 'stage-1',
        name: 'Data Collection',
        duration: 30,
        resourceRequirement: 3,
        dependsOn: [],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      },
      {
        id: 'stage-2',
        name: 'Data Validation',
        duration: 45,
        resourceRequirement: 5,
        dependsOn: ['stage-1'],
        status: 'pending',
        progress: 0,
        bottleneck: true,
        criticalPath: true
      },
      {
        id: 'stage-3',
        name: 'Calculation',
        duration: 60,
        resourceRequirement: 7,
        dependsOn: ['stage-2'],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      },
      {
        id: 'stage-4',
        name: 'Review',
        duration: 90,
        resourceRequirement: 4,
        dependsOn: ['stage-3'],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      },
      {
        id: 'stage-5',
        name: 'Approval',
        duration: 30,
        resourceRequirement: 2,
        dependsOn: ['stage-4'],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      },
      {
        id: 'stage-6',
        name: 'Reporting',
        duration: 45,
        resourceRequirement: 3,
        dependsOn: ['stage-5'],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      }
    ],
    resources: 10,
    startDate: new Date(),
    targetCompletionDate: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), // 8 hours from now
    status: 'notStarted',
    progress: 0,
    bottlenecks: ['stage-2', 'stage-3'],
    risks: [
      {
        id: 'risk-1',
        description: 'Data source unavailability',
        probability: 0.2,
        impact: 8,
        mitigated: false
      },
      {
        id: 'risk-2',
        description: 'Resource contention with other workflows',
        probability: 0.4,
        impact: 6,
        mitigated: false
      },
      {
        id: 'risk-3',
        description: 'Calculation errors requiring rework',
        probability: 0.15,
        impact: 7,
        mitigated: true
      }
    ]
  },
  {
    id: 'scenario-2',
    name: 'Month-End PnL with Reduced Resources',
    description: 'Simulation of month-end PnL process with 30% fewer resources than normal',
    stages: [
      {
        id: 'stage-1',
        name: 'Data Collection',
        duration: 45,
        resourceRequirement: 4,
        dependsOn: [],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      },
      {
        id: 'stage-2',
        name: 'Data Validation',
        duration: 90,
        resourceRequirement: 6,
        dependsOn: ['stage-1'],
        status: 'pending',
        progress: 0,
        bottleneck: true,
        criticalPath: true
      },
      {
        id: 'stage-3',
        name: 'Reconciliation',
        duration: 120,
        resourceRequirement: 5,
        dependsOn: ['stage-2'],
        status: 'pending',
        progress: 0,
        bottleneck: true,
        criticalPath: true
      },
      {
        id: 'stage-4',
        name: 'Calculation',
        duration: 90,
        resourceRequirement: 8,
        dependsOn: ['stage-3'],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      },
      {
        id: 'stage-5',
        name: 'Review',
        duration: 120,
        resourceRequirement: 5,
        dependsOn: ['stage-4'],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      },
      {
        id: 'stage-6',
        name: 'Management Approval',
        duration: 60,
        resourceRequirement: 3,
        dependsOn: ['stage-5'],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      },
      {
        id: 'stage-7',
        name: 'Regulatory Reporting',
        duration: 90,
        resourceRequirement: 4,
        dependsOn: ['stage-6'],
        status: 'pending',
        progress: 0,
        bottleneck: false,
        criticalPath: true
      }
    ],
    resources: 7,
    startDate: new Date(),
    targetCompletionDate: new Date(new Date().getTime() + 16 * 60 * 60 * 1000), // 16 hours from now
    status: 'notStarted',
    progress: 0,
    bottlenecks: ['stage-2', 'stage-3', 'stage-4'],
    risks: [
      {
        id: 'risk-1',
        description: 'Staff unavailability due to month-end activities',
        probability: 0.6,
        impact: 9,
        mitigated: false
      },
      {
        id: 'risk-2',
        description: 'System performance degradation due to high load',
        probability: 0.5,
        impact: 7,
        mitigated: false
      },
      {
        id: 'risk-3',
        description: 'Delayed approvals from senior management',
        probability: 0.4,
        impact: 8,
        mitigated: false
      },
      {
        id: 'risk-4',
        description: 'Data quality issues requiring manual intervention',
        probability: 0.3,
        impact: 6,
        mitigated: true
      }
    ]
  }
];

export const WorkflowSimulator = () => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(sampleScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
  const [simulationTime, setSimulationTime] = useState<number>(0); // in minutes
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const [showBottlenecks, setShowBottlenecks] = useState<boolean>(true);
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true);
  
  const selectedScenario = selectedScenarioId 
    ? scenarios.find(scenario => scenario.id === selectedScenarioId) 
    : null;
  
  const handleSelectScenario = (scenarioId: string) => {
    // Stop any running simulation first
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    
    setSelectedScenarioId(scenarioId);
    setIsSimulationRunning(false);
    setSimulationTime(0);
    setActiveTab('overview');
    
    // Reset the stages of the selected scenario
    setScenarios(prevScenarios => 
      prevScenarios.map(scenario => 
        scenario.id === scenarioId 
          ? {
              ...scenario,
              status: 'notStarted',
              progress: 0,
              stages: scenario.stages.map(stage => ({
                ...stage,
                status: 'pending',
                progress: 0,
                startTime: undefined,
                endTime: undefined
              }))
            } 
          : scenario
      )
    );
  };
  
  const startSimulation = () => {
    if (!selectedScenarioId) return;
    
    // Mark scenario as in progress
    setScenarios(prevScenarios => 
      prevScenarios.map(scenario => 
        scenario.id === selectedScenarioId 
          ? {
              ...scenario,
              status: 'inProgress',
              startDate: new Date()
            } 
          : scenario
      )
    );
    
    setIsSimulationRunning(true);
    
    // Start the simulation interval
    const interval = setInterval(() => {
      setSimulationTime(prevTime => {
        const newTime = prevTime + simulationSpeed;
        updateSimulation(newTime);
        return newTime;
      });
    }, 1000); // Update every second, but each tick represents simulationSpeed minutes
    
    setSimulationInterval(interval);
  };
  
  const pauseSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    setIsSimulationRunning(false);
  };
  
  const resetSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    
    setIsSimulationRunning(false);
    setSimulationTime(0);
    
    // Reset the stages of the selected scenario
    if (selectedScenarioId) {
      setScenarios(prevScenarios => 
        prevScenarios.map(scenario => 
          scenario.id === selectedScenarioId 
            ? {
                ...scenario,
                status: 'notStarted',
                progress: 0,
                stages: scenario.stages.map(stage => ({
                  ...stage,
                  status: 'pending',
                  progress: 0,
                  startTime: undefined,
                  endTime: undefined
                }))
              } 
            : scenario
        )
      );
    }
  };
  
  const skipToEnd = () => {
    if (!selectedScenarioId) return;
    
    // Calculate the total duration of the critical path
    const scenario = scenarios.find(s => s.id === selectedScenarioId);
    if (!scenario) return;
    
    // Find the longest path through the workflow
    const criticalPathDuration = calculateCriticalPathDuration(scenario.stages);
    
    // Update the simulation to the end state
    updateSimulation(criticalPathDuration);
    
    // Stop the simulation
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    
    setSimulationTime(criticalPathDuration);
    setIsSimulationRunning(false);
    
    showInfoToast("Simulation completed");
  };
  
  const calculateCriticalPathDuration = (stages: SimulationStage[]): number => {
    // This is a simplified calculation - in a real app, you'd use a proper algorithm
    // to find the longest path through the directed acyclic graph
    
    // For this demo, we'll just sum up the durations of stages marked as critical path
    return stages.filter(stage => stage.criticalPath).reduce((sum, stage) => sum + stage.duration, 0);
  };
  
  const updateSimulation = (currentTime: number) => {
    if (!selectedScenarioId) return;
    
    setScenarios(prevScenarios => 
      prevScenarios.map(scenario => {
        if (scenario.id !== selectedScenarioId) return scenario;
        
        // Create a working copy of stages that we'll update
        let updatedStages = [...scenario.stages];
        
        // First pass: update stages that can start or are in progress
        updatedStages = updatedStages.map(stage => {
          // Check if all dependencies are completed
          const canStart = stage.dependsOn.length === 0 || 
            stage.dependsOn.every(depId => {
              const depStage = updatedStages.find(s => s.id === depId);
              return depStage && depStage.status === 'completed';
            });
          
          if (stage.status === 'pending' && canStart) {
            // Start the stage
            return {
              ...stage,
              status: 'inProgress',
              progress: 0,
              startTime: new Date(scenario.startDate.getTime() + currentTime * 60 * 1000)
            };
          } else if (stage.status === 'inProgress') {
            // Calculate how long the stage has been running
            const startTime = stage.startTime || scenario.startDate;
            const elapsedMinutes = currentTime - ((startTime.getTime() - scenario.startDate.getTime()) / (60 * 1000));
            
            // Calculate progress as a percentage
            const progress = Math.min(100, Math.round((elapsedMinutes / stage.duration) * 100));
            
            // Check if the stage is complete
            if (progress >= 100) {
              return {
                ...stage,
                status: 'completed',
                progress: 100,
                endTime: new Date(scenario.startDate.getTime() + currentTime * 60 * 1000)
              };
            } else {
              return {
                ...stage,
                progress
              };
            }
          }
          
          return stage;
        });
        
        // Calculate overall progress
        const totalStages = updatedStages.length;
        const completedStages = updatedStages.filter(s => s.status === 'completed').length;
        const inProgressStages = updatedStages.filter(s => s.status === 'inProgress');
        const inProgressPercentage = inProgressStages.reduce((sum, stage) => sum + stage.progress, 0) / (inProgressStages.length || 1);
        
        const overallProgress = Math.round(
          ((completedStages * 100) + (inProgressStages.length * inProgressPercentage)) / totalStages
        );
        
        // Check if all stages are completed
        const isCompleted = updatedStages.every(stage => stage.status === 'completed');
        
        return {
          ...scenario,
          stages: updatedStages,
          progress: overallProgress,
          status: isCompleted ? 'completed' : 'inProgress',
          actualCompletionDate: isCompleted 
            ? new Date(scenario.startDate.getTime() + currentTime * 60 * 1000) 
            : undefined
        };
      })
    );
  };
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const formatDateTime = (date?: Date): string => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };
  
  const calculateSLAStatus = (scenario: SimulationScenario): 'onTrack' | 'atRisk' | 'delayed' => {
    if (scenario.status !== 'completed') {
      // For in-progress scenarios, estimate completion based on current progress
      const totalDuration = calculateCriticalPathDuration(scenario.stages);
      const estimatedRemainingTime = totalDuration * (1 - (scenario.progress / 100));
      const estimatedCompletionTime = new Date(
        scenario.startDate.getTime() + (simulationTime + estimatedRemainingTime) * 60 * 1000
      );
      
      if (estimatedCompletionTime > scenario.targetCompletionDate) {
        const delay = (estimatedCompletionTime.getTime() - scenario.targetCompletionDate.getTime()) / (60 * 60 * 1000);
        return delay > 2 ? 'delayed' : 'atRisk';
      }
      return 'onTrack';
    } else {
      // For completed scenarios, compare actual completion to target
      if (!scenario.actualCompletionDate) return 'onTrack'; // Shouldn't happen
      
      return scenario.actualCompletionDate > scenario.targetCompletionDate ? 'delayed' : 'onTrack';
    }
  };
  
  const renderStageTimeline = () => {
    if (!selectedScenario) return null;
    
    const totalDuration = calculateCriticalPathDuration(selectedScenario.stages);
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Simulation Timeline</h3>
          <div className="text-sm text-muted-foreground">
            Current Time: {formatDuration(simulationTime)}
          </div>
        </div>
        
        <div className="relative border rounded-md p-4 bg-muted/20">
          {/* Time markers */}
          <div className="flex justify-between mb-2">
            {[0, 25, 50, 75, 100].map(percent => (
              <div key={percent} className="text-xs text-muted-foreground">
                {formatDuration(Math.round(totalDuration * (percent / 100)))}
              </div>
            ))}
          </div>
          
          {/* Current time indicator */}
          <div 
            className="absolute top-4 bottom-4 w-0.5 bg-primary z-10"
            style={{ 
              left: `${Math.min(100, (simulationTime / totalDuration) * 100)}%`,
              display: simulationTime > 0 ? 'block' : 'none'
            }}
          />
          
          {/* Stages */}
          <div className="space-y-3">
            {selectedScenario.stages.map(stage => {
              // Calculate position and width based on dependencies and duration
              const startPercent = stage.startTime 
                ? ((stage.startTime.getTime() - selectedScenario.startDate.getTime()) / (60 * 1000)) / totalDuration * 100
                : 0;
              
              const widthPercent = stage.status === 'completed' && stage.endTime
                ? ((stage.endTime.getTime() - (stage.startTime?.getTime() || selectedScenario.startDate.getTime())) / (60 * 1000)) / totalDuration * 100
                : stage.status === 'inProgress'
                  ? (stage.progress / 100) * (stage.duration / totalDuration * 100)
                  : (stage.duration / totalDuration * 100);
              
              return (
                <div key={stage.id} className="relative h-8">
                  <div className="absolute left-0 top-0 h-full flex items-center text-xs font-medium">
                    {stage.name}
                  </div>
                  
                  <div 
                    className={`absolute h-4 rounded-md ${
                      stage.status === 'completed' 
                        ? 'bg-green-500/70' 
                        : stage.status === 'inProgress' 
                          ? 'bg-blue-500/70' 
                          : 'bg-gray-300/50'
                    } ${stage.bottleneck ? 'border-2 border-yellow-500' : ''} ${stage.criticalPath && showCriticalPath ? 'border-b-2 border-primary' : ''}`}
                    style={{ 
                      left: `${stage.status !== 'pending' ? startPercent : Math.max(startPercent, (simulationTime / totalDuration) * 100)}%`,
                      width: `${widthPercent}%`,
                      top: '16px'
                    }}
                  >
                    {stage.status === 'inProgress' && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                        {stage.progress}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderResourceUtilization = () => {
    if (!selectedScenario) return null;
    
    // Calculate resource utilization over time
    const activeStages = selectedScenario.stages.filter(
      stage => stage.status === 'inProgress' || stage.status === 'completed'
    );
    
    const totalResourceRequirement = activeStages.reduce(
      (sum, stage) => sum + (stage.status === 'inProgress' ? stage.resourceRequirement : 0), 
      0
    );
    
    const utilizationPercentage = Math.min(100, Math.round((totalResourceRequirement / selectedScenario.resources) * 100));
    
    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Resource Utilization</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Current Utilization</span>
              <span className="text-sm font-medium">{utilizationPercentage}%</span>
            </div>
            <Progress value={utilizationPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {totalResourceRequirement} of {selectedScenario.resources} resources in use
            </p>
          </div>
          
          <div className="border rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Resource Efficiency</span>
              <span className="text-sm font-medium">
                {selectedScenario.progress > 0 
                  ? Math.round((selectedScenario.progress / utilizationPercentage) * 100) 
                  : 0}%
              </span>
            </div>
            <Progress 
              value={selectedScenario.progress > 0 
                ? Math.round((selectedScenario.progress / utilizationPercentage) * 100) 
                : 0} 
              className="h-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Progress relative to resource consumption
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  const renderRisksAndBottlenecks = () => {
    if (!selectedScenario) return null;
    
    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Risks & Bottlenecks</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="border rounded-md p-3">
            <h4 className="text-sm font-medium mb-2">Identified Bottlenecks</h4>
            
            {selectedScenario.bottlenecks.length > 0 ? (
              <div className="space-y-2">
                {selectedScenario.bottlenecks.map(bottleneckId => {
                  const stage = selectedScenario.stages.find(s => s.id === bottleneckId);
                  if (!stage) return null;
                  
                  return (
                    <div key={bottleneckId} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>{stage.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {formatDuration(stage.duration)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No bottlenecks identified</p>
            )}
          </div>
          
          <div className="border rounded-md p-3">
            <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
            
            {selectedScenario.risks.length > 0 ? (
              <div className="space-y-2">
                {selectedScenario.risks.map(risk => (
                  <div key={risk.id} className="flex items-start gap-2 text-sm">
                    <div className={`mt-0.5 h-3 w-3 rounded-full ${
                      risk.impact * risk.probability > 5 
                        ? 'bg-red-500' 
                        : risk.impact * risk.probability > 2 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span>{risk.description}</span>
                        {risk.mitigated && (
                          <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500">
                            Mitigated
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Probability: {Math.round(risk.probability * 100)}% | Impact: {risk.impact}/10
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No risks identified</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderSLAAnalysis = () => {
    if (!selectedScenario) return null;
    
    const slaStatus = calculateSLAStatus(selectedScenario);
    
    // Calculate estimated completion time
    const totalDuration = calculateCriticalPathDuration(selectedScenario.stages);
    const estimatedRemainingTime = selectedScenario.status !== 'completed'
      ? totalDuration * (1 - (selectedScenario.progress / 100))
      : 0;
    
    const estimatedCompletionTime = selectedScenario.status === 'completed'
      ? selectedScenario.actualCompletionDate
      : new Date(selectedScenario.startDate.getTime() + (simulationTime + estimatedRemainingTime) * 60 * 1000);
    
    // Calculate variance from target
    const targetTime = selectedScenario.targetCompletionDate.getTime();
    const estimatedTime = estimatedCompletionTime?.getTime() || targetTime;
    const varianceHours = (estimatedTime - targetTime) / (60 * 60 * 1000);
    
    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">SLA Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-md p-3">
            <h4 className="text-xs text-muted-foreground">SLA Status</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-3 w-3 rounded-full ${
                slaStatus === 'onTrack' 
                  ? 'bg-green-500' 
                  : slaStatus === 'atRisk' 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {slaStatus === 'onTrack' 
                  ? 'On Track' 
                  : slaStatus === 'atRisk' 
                    ? 'At Risk' 
                    : 'Delayed'}
              </span>
            </div>
          </div>
          
          <div className="border rounded-md p-3">
            <h4 className="text-xs text-muted-foreground">Target Completion</h4>
            <p className="text-sm font-medium mt-1">
              {formatDateTime(selectedScenario.targetCompletionDate)}
            </p>
          </div>
          
          <div className="border rounded-md p-3">
            <h4 className="text-xs text-muted-foreground">Estimated Completion</h4>
            <p className="text-sm font-medium mt-1">
              {formatDateTime(estimatedCompletionTime)}
            </p>
          </div>
        </div>
        
        <div className="border rounded-md p-3 mt-4">
          <h4 className="text-sm font-medium mb-2">Variance Analysis</h4>
          
          <div className="flex items-center gap-2">
            <div className={`h-2 flex-1 rounded-full bg-gradient-to-r ${
              varianceHours <= 0 
                ? 'from-green-500 to-green-300' 
                : varianceHours <= 2 
                  ? 'from-yellow-500 to-yellow-300' 
                  : 'from-red-500 to-red-300'
            }`} />
            
            <span className="text-sm font-medium">
              {varianceHours <= 0 
                ? `${Math.abs(varianceHours).toFixed(1)}h ahead of schedule` 
                : `${varianceHours.toFixed(1)}h behind schedule`}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h5 className="text-xs text-muted-foreground mb-1">Critical Path Duration</h5>
              <p className="text-sm font-medium">{formatDuration(totalDuration)}</p>
            </div>
            
            <div>
              <h5 className="text-xs text-muted-foreground mb-1">Elapsed Time</h5>
              <p className="text-sm font-medium">{formatDuration(simulationTime)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderOptimizationSuggestions = () => {
    if (!selectedScenario) return null;
    
    // Generate some mock optimization suggestions based on the scenario
    const suggestions = [
      {
        id: 'opt-1',
        title: 'Parallelize Data Validation',
        description: 'Split data validation into multiple parallel streams to reduce processing time',
        impact: 'high',
        effort: 'medium',
        timeReduction: 20 // minutes
      },
      {
        id: 'opt-2',
        title: 'Increase Resources for Calculation Stage',
        description: 'Add 2 additional resources to the calculation stage to reduce processing time',
        impact: 'medium',
        effort: 'low',
        timeReduction: 15 // minutes
      },
      {
        id: 'opt-3',
        title: 'Automate Manual Review Steps',
        description: 'Implement automated validation rules to reduce manual review time',
        impact: 'high',
        effort: 'high',
        timeReduction: 30 // minutes
      },
      {
        id: 'opt-4',
        title: 'Pre-cache Reference Data',
        description: 'Pre-load reference data before workflow starts to reduce lookup times',
        impact: 'low',
        effort: 'low',
        timeReduction: 8 // minutes
      }
    ];
    
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Optimization Suggestions</h3>
          <Button variant="outline" size="sm" onClick={() => showInfoToast("Optimization analysis would be applied to the workflow")}>
            Apply Optimizations
          </Button>
        </div>
        
        <div className="space-y-3">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium">{suggestion.title}</h4>
                <Badge variant={
                  suggestion.impact === 'high' 
                    ? 'default' 
                    : suggestion.impact === 'medium' 
                      ? 'secondary' 
                      : 'outline'
                }>
                  {suggestion.timeReduction} min
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
              
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Impact: {suggestion.impact}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Effort: {suggestion.effort}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            <CardTitle>Workflow Simulator</CardTitle>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </div>
          <CardDescription>
            Simulate and analyze workflow execution to identify bottlenecks and optimize performance
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-0">
          <div className="grid grid-cols-12 h-full">
            {/* Scenarios List */}
            <div className="col-span-3 border-r h-full overflow-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Scenarios</h3>
              </div>
              
              <div className="space-y-2">
                {scenarios.map(scenario => (
                  <div 
                    key={scenario.id}
                    className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedScenarioId === scenario.id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleSelectScenario(scenario.id)}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge variant={
                        scenario.status === 'completed' 
                          ? 'default' 
                          : scenario.status === 'inProgress' 
                            ? 'secondary' 
                            : 'outline'
                      }>
                        {scenario.status === 'notStarted' 
                          ? 'Not Started' 
                          : scenario.status === 'inProgress' 
                            ? 'In Progress' 
                            : 'Completed'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{scenario.description}</p>
                    
                    {scenario.status !== 'notStarted' && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span>Progress</span>
                          <span>{scenario.progress}%</span>
                        </div>
                        <Progress value={scenario.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Simulation Details */}
            <div className="col-span-9 h-full overflow-auto">
              {selectedScenario ? (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{selectedScenario.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedScenario.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isSimulationRunning ? (
                        <Button variant="outline" onClick={pauseSimulation}>
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button variant="default" onClick={startSimulation} disabled={selectedScenario.status === 'completed'}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {simulationTime > 0 ? 'Resume' : 'Start'}
                        </Button>
                      )}
                      
                      <Button variant="outline" onClick={resetSimulation}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      
                      <Button variant="outline" onClick={skipToEnd}>
                        <SkipForward className="h-4 w-4 mr-2" />
                        Skip to End
                      </Button>
                    </div>
                  </div>
                  
                  {/* Simulation Controls */}
                  <div className="flex items-center gap-4 mb-6 p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Speed:</span>
                    </div>
                    
                    <div className="flex-1">
                      <Slider 
                        value={[simulationSpeed]} 
                        min={1} 
                        max={10} 
                        step={1} 
                        onValueChange={(value) => setSimulationSpeed(value[0])}
                      />
                    </div>
                    
                    <div className="text-sm font-medium">
                      {simulationSpeed}x
                    </div>
                    
                    <Separator orientation="vertical" className="h-6" />
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="show-bottlenecks" 
                          checked={showBottlenecks} 
                          onCheckedChange={setShowBottlenecks}
                        />
                        <label htmlFor="show-bottlenecks" className="text-sm">
                          Show Bottlenecks
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="show-critical-path" 
                          checked={showCriticalPath} 
                          onCheckedChange={setShowCriticalPath}
                        />
                        <label htmlFor="show-critical-path" className="text-sm">
                          Show Critical Path
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Cards */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Progress</h3>
                      </div>
                      <p className="text-2xl font-bold mt-1">{selectedScenario.progress}%</p>
                      <Progress value={selectedScenario.progress} className="h-1.5 mt-2" />
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Elapsed Time</h3>
                      </div>
                      <p className="text-2xl font-bold mt-1">{formatDuration(simulationTime)}</p>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Resources</h3>
                      </div>
                      <p className="text-2xl font-bold mt-1">{selectedScenario.resources}</p>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">SLA Status</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`h-3 w-3 rounded-full ${
                          calculateSLAStatus(selectedScenario) === 'onTrack' 
                            ? 'bg-green-500' 
                            : calculateSLAStatus(selectedScenario) === 'atRisk' 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        }`} />
                        <p className="text-lg font-bold">
                          {calculateSLAStatus(selectedScenario) === 'onTrack' 
                            ? 'On Track' 
                            : calculateSLAStatus(selectedScenario) === 'atRisk' 
                              ? 'At Risk' 
                              : 'Delayed'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tabs for different analysis views */}
                  <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start mb-4">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-primary/5">
                        <Layers className="h-4 w-4 mr-2" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="data-[state=active]:bg-primary/5">
                        <Users className="h-4 w-4 mr-2" />
                        Resources
                      </TabsTrigger>
                      <TabsTrigger value="sla" className="data-[state=active]:bg-primary/5">
                        <Clock className="h-4 w-4 mr-2" />
                        SLA Analysis
                      </TabsTrigger>
                      <TabsTrigger value="optimization" className="data-[state=active]:bg-primary/5">
                        <Gauge className="h-4 w-4 mr-2" />
                        Optimization
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="m-0">
                      {renderStageTimeline()}
                      {renderRisksAndBottlenecks()}
                    </TabsContent>
                    
                    <TabsContent value="resources" className="m-0">
                      {renderStageTimeline()}
                      {renderResourceUtilization()}
                    </TabsContent>
                    
                    <TabsContent value="sla" className="m-0">
                      {renderStageTimeline()}
                      {renderSLAAnalysis()}
                    </TabsContent>
                    
                    <TabsContent value="optimization" className="m-0">
                      {renderStageTimeline()}
                      {renderOptimizationSuggestions()}
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Select a Scenario</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose a workflow scenario from the list to start simulation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};