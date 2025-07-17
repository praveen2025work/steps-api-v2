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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast, showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';
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
  Play,
  ExternalLink,
  Info,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const DynamicWorkflowIndexPage: React.FC = () => {
  const router = useRouter();
  const { selectedDate } = useDate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<WorkflowApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [customDate, setCustomDate] = useState('');

  // Format date for API calls
  const formatDateForApi = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Load workflow applications
  const loadApplications = async (date?: string) => {
    setIsLoading(true);
    try {
      const dateString = date || formatDateForApi(selectedDate);
      showInfoToast(`Loading workflow applications for ${dateString}...`);
      
      const response = await workflowService.getAllWorkflowApplications({ date: dateString });
      
      if (response.success) {
        setApplications(response.data);
        showSuccessToast(`Loaded ${response.data.length} workflow applications`);
      } else {
        showErrorToast(response.error || 'Failed to load applications');
        setApplications([]);
      }
    } catch (error: any) {
      showErrorToast(`Error loading applications: ${error.message}`);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadApplications();
  }, [selectedDate]);

  // Filter applications based on search term
  const filteredApplications = applications.filter(app =>
    app.configName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.configType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.appId.toString().includes(searchTerm)
  );

  // Handle application selection
  const handleApplicationSelect = (app: WorkflowApplication) => {
    const workflowId = app.configName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/workflow/dynamic/${workflowId}?appId=${app.appId}&configId=${app.configId}&currentLevel=${app.currentLevel}&nextLevel=${app.nextLevel}`);
  };

  // Handle load all workflows
  const handleLoadAllWorkflows = () => {
    router.push('/workflow/dynamic/all-workflows');
  };

  // Handle custom date load
  const handleCustomDateLoad = () => {
    if (customDate) {
      loadApplications(customDate);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dynamic Workflow Integration</h1>
            <p className="text-muted-foreground">
              Recursive API integration for workflow details loading
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Live API
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              Recursive
            </Badge>
          </div>
        </div>

        {/* Integration Overview */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This page demonstrates the dynamic workflow integration that follows the 3-step recursive process:
            <strong> Load Applications → Traverse Nodes → Load Summaries</strong>. 
            Select an application below to see the full recursive workflow detail loading in action.
          </AlertDescription>
        </Alert>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by name, type, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Custom Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="e.g., 14 Jul 2025"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={handleCustomDateLoad}
                disabled={!customDate || isLoading}
                className="w-full"
              >
                Load
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                size="sm" 
                onClick={() => loadApplications()}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleLoadAllWorkflows}
                className="w-full"
              >
                <Database className="h-4 w-4 mr-1" />
                Load All
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Workflow Applications
                {!isLoading && (
                  <Badge variant="secondary">{filteredApplications.length}</Badge>
                )}
              </CardTitle>
              
              <div className="text-sm text-muted-foreground">
                Date: {formatDateForApi(selectedDate)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading workflow applications...</span>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No applications match your search criteria.' : 'No workflow applications available for the selected date.'}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <Card 
                    key={`${app.appId}-${app.configId}-${app.currentLevel}-${app.nextLevel}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleApplicationSelect(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{app.configName}</h3>
                            <Badge variant="outline" className="text-xs">
                              ID: {app.appId}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {app.configType}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Config ID</div>
                              <div className="font-mono">{app.configId}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Current Level</div>
                              <div>{app.currentLevel}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Next Level</div>
                              <div>{app.nextLevel}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Progress</div>
                              <div className="flex items-center gap-2">
                                <Progress value={app.percentageCompleted} className="w-12 h-2" />
                                <span>{app.percentageCompleted}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {app.isUsedForWorkflowInstance ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>Terminal Node</span>
                                </>
                              ) : (
                                <>
                                  <GitBranch className="h-3 w-3" />
                                  <span>Intermediate Node</span>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {app.isConfigured ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>Configured</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 text-red-500" />
                                  <span>Not Configured</span>
                                </>
                              )}
                            </div>
                            
                            {app.isWeekly && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Weekly: {app.isWeekly}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            Load Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Quick Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/workflow/dynamic/daily-named-pnl">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <h4 className="font-medium">Daily Named PnL</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete workflow traversal for Daily Named PnL process
                    </p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/workflow/dynamic/basel">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium">Basel Workflow</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Regulatory reporting workflow with complex hierarchy
                    </p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/workflow/dynamic/risk-analytics">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <h4 className="font-medium">Risk Analytics</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Risk calculation and reporting system workflow
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DynamicWorkflowIndexPage;