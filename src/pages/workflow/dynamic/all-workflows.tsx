import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { workflowService } from '@/services/workflowService';
import { useDate } from '@/contexts/DateContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast, showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '@/lib/toast';
import {
  WorkflowApplication,
  WorkflowNode,
  WorkflowSummary
} from '@/types/workflow-dashboard-types';
import {
  Database,
  GitBranch,
  Activity,
  Settings,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Info,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface LoadingProgress {
  stage: 'applications' | 'nodes' | 'summaries' | 'complete';
  progress: number;
  currentOperation: string;
  applicationsLoaded: number;
  nodesTraversed: number;
  summariesLoaded: number;
  errorsCount: number;
}

const AllWorkflowsPage: React.FC = () => {
  const router = useRouter();
  const { selectedDate } = useDate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    stage: 'applications',
    progress: 0,
    currentOperation: 'Initializing...',
    applicationsLoaded: 0,
    nodesTraversed: 0,
    summariesLoaded: 0,
    errorsCount: 0
  });
  
  const [applications, setApplications] = useState<WorkflowApplication[]>([]);
  const [terminalNodes, setTerminalNodes] = useState<WorkflowNode[]>([]);
  const [workflowSummaries, setWorkflowSummaries] = useState<WorkflowSummary[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Format date for API calls
  const formatDateForApi = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Load all workflow data
  const loadAllWorkflowData = async () => {
    setIsLoading(true);
    setStartTime(new Date());
    setEndTime(null);
    
    try {
      const dateString = formatDateForApi(selectedDate);
      
      // Reset state
      setApplications([]);
      setTerminalNodes([]);
      setWorkflowSummaries([]);
      setErrors([]);
      
      setLoadingProgress({
        stage: 'applications',
        progress: 10,
        currentOperation: 'Loading workflow applications...',
        applicationsLoaded: 0,
        nodesTraversed: 0,
        summariesLoaded: 0,
        errorsCount: 0
      });
      
      showInfoToast('Starting complete workflow data load...');
      
      const response = await workflowService.loadCompleteWorkflowDetails(dateString);
      
      if (response.success) {
        const { applications, terminalNodes, workflowSummaries, errors } = response.data;
        
        setApplications(applications);
        setTerminalNodes(terminalNodes);
        setWorkflowSummaries(workflowSummaries);
        setErrors(errors);
        
        setLoadingProgress({
          stage: 'complete',
          progress: 100,
          currentOperation: 'Complete',
          applicationsLoaded: applications.length,
          nodesTraversed: terminalNodes.length,
          summariesLoaded: workflowSummaries.length,
          errorsCount: errors.length
        });
        
        setEndTime(new Date());
        
        showSuccessToast(
          `Loaded ${applications.length} applications, ${terminalNodes.length} terminal nodes, ${workflowSummaries.length} summaries` +
          (errors.length > 0 ? ` (${errors.length} errors)` : '')
        );
        
        // Show warnings for errors
        if (errors.length > 0) {
          errors.slice(0, 3).forEach(error => {
            showWarningToast(error);
          });
        }
      } else {
        showErrorToast(response.error || 'Failed to load workflow data');
        setErrors([response.error || 'Failed to load workflow data']);
      }
      
    } catch (error: any) {
      console.error('Error loading all workflow data:', error);
      showErrorToast(`Error loading workflow data: ${error.message}`);
      setErrors([error.message]);
    } finally {
      setIsLoading(false);
      if (!endTime) {
        setEndTime(new Date());
      }
    }
  };

  // Initial load
  useEffect(() => {
    loadAllWorkflowData();
  }, [selectedDate]);

  // Calculate statistics
  const calculateStats = () => {
    const totalProcesses = workflowSummaries.reduce((total, summary) => total + summary.processData.length, 0);
    const completedProcesses = workflowSummaries.reduce((total, summary) => 
      total + summary.processData.filter(p => p.status === 'COMPLETED').length, 0);
    const failedProcesses = workflowSummaries.reduce((total, summary) => 
      total + summary.processData.filter(p => p.status === 'FAILED').length, 0);
    const inProgressProcesses = workflowSummaries.reduce((total, summary) => 
      total + summary.processData.filter(p => p.status === 'IN PROGRESS').length, 0);
    
    return {
      totalProcesses,
      completedProcesses,
      failedProcesses,
      inProgressProcesses,
      completionRate: totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0,
      failureRate: totalProcesses > 0 ? Math.round((failedProcesses / totalProcesses) * 100) : 0
    };
  };

  const stats = calculateStats();
  const loadDuration = startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">All Workflows - Complete Load</h1>
              <p className="text-muted-foreground">
                Comprehensive workflow data loading with recursive traversal
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Complete Load
            </Badge>
            
            <Button 
              onClick={loadAllWorkflowData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Loading Progress */}
        {isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{loadingProgress.currentOperation}</span>
                  <span>{loadingProgress.progress}%</span>
                </div>
                <Progress value={loadingProgress.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{loadingProgress.applicationsLoaded}</div>
                  <div className="text-muted-foreground">Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{loadingProgress.nodesTraversed}</div>
                  <div className="text-muted-foreground">Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{loadingProgress.summariesLoaded}</div>
                  <div className="text-muted-foreground">Summaries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{loadingProgress.errorsCount}</div>
                  <div className="text-muted-foreground">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Statistics */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium">Applications</h3>
                </div>
                <div className="text-2xl font-bold">{applications.length}</div>
                <div className="text-sm text-muted-foreground">
                  {terminalNodes.length} terminal nodes
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <h3 className="font-medium">Total Processes</h3>
                </div>
                <div className="text-2xl font-bold">{stats.totalProcesses}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.completionRate}% completion rate
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <h3 className="font-medium">Completed</h3>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.completedProcesses}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.inProgressProcesses} in progress
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <h3 className="font-medium">Failed</h3>
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.failedProcesses}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.failureRate}% failure rate
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Metrics */}
        {!isLoading && startTime && endTime && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Load Duration</div>
                  <div className="font-bold">{(loadDuration / 1000).toFixed(2)}s</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Started</div>
                  <div className="font-mono text-xs">{startTime.toLocaleTimeString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Completed</div>
                  <div className="font-mono text-xs">{endTime.toLocaleTimeString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Date</div>
                  <div className="font-mono text-xs">{formatDateForApi(selectedDate)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errors.length} error(s) occurred during data loading.
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">View all errors</summary>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </details>
            </AlertDescription>
          </Alert>
        )}

        {/* Data Tabs */}
        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="nodes" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Terminal Nodes ({terminalNodes.length})
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summaries ({workflowSummaries.length})
            </TabsTrigger>
            <TabsTrigger value="processes" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Processes ({stats.totalProcesses})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workflow Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications loaded
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{app.configName}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">ID: {app.appId}</Badge>
                            <Badge variant="secondary">{app.configType}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Config ID:</span> {app.configId}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Level:</span> {app.currentLevel} → {app.nextLevel}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Progress:</span> {app.percentageCompleted}%
                          </div>
                          <div>
                            <span className="text-muted-foreground">Terminal:</span> {app.isUsedForWorkflowInstance ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nodes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Terminal Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                {terminalNodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No terminal nodes found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {terminalNodes.map((node, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{node.configName}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">App: {node.appId}</Badge>
                            <Badge variant="secondary">{node.configType}</Badge>
                            <CheckCircle className="h-4 w-4 text-green-500" title="Terminal Node" />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Config ID:</span> {node.configId}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Level:</span> {node.currentLevel} → {node.nextLevel}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Progress:</span> {node.percentageCompleted}%
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weekly:</span> {node.isWeekly}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summaries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workflow Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                {workflowSummaries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No workflow summaries loaded
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflowSummaries.map((summary, index) => (
                      <div key={index} className="border rounded p-4">
                        <h4 className="font-medium mb-3">Summary {index + 1}</h4>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Processes</div>
                            <div className="font-bold">{summary.processData.length}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Files</div>
                            <div className="font-bold">{summary.fileData.length}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Dependencies</div>
                            <div className="font-bold">{summary.dependencyData.length}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Applications</div>
                            <div className="font-bold">{summary.applications.length}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Processes</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.totalProcesses === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No processes found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workflowSummaries.map((summary, summaryIndex) =>
                      summary.processData.map((process, processIndex) => (
                        <div key={`${summaryIndex}-${processIndex}`} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{process.subStage_Name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Stage: {process.stage_Name}</Badge>
                              <Badge 
                                variant={
                                  process.status === 'COMPLETED' ? 'default' :
                                  process.status === 'FAILED' ? 'destructive' :
                                  process.status === 'IN PROGRESS' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {process.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Process ID:</span> {process.workflow_Process_Id}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Updated By:</span> {process.updatedBy}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span> {process.duration}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Auto:</span> {process.auto}
                            </div>
                          </div>
                          {process.message && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <strong>Message:</strong> {process.message}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AllWorkflowsPage;