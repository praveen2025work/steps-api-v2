import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import DynamicWorkflowDetailView from '@/components/DynamicWorkflowDetailView';
import { useBreadcrumb, BreadcrumbNode } from '@/contexts/BreadcrumbContext';
import { useDate } from '@/contexts/DateContext';
import { workflowService } from '@/services/workflowService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Database, 
  GitBranch, 
  Activity, 
  Settings,
  Info,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { showErrorToast } from '@/lib/toast';

const DynamicWorkflowPage: React.FC = () => {
  const router = useRouter();
  const { state: breadcrumbState, navigateToLevel, reset, buildPath } = useBreadcrumb();
  const { selectedDate } = useDate();
  const [viewMode, setViewMode] = useState<'classic' | 'alternative'>('classic');
  const [applicationData, setApplicationData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowTitle, setWorkflowTitle] = useState('');

  // Get parameters from router
  const { workflowId, appId, configId, currentLevel, nextLevel } = router.query;

  const formatDateForApi = useCallback((date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  useEffect(() => {
    const initializeWorkflowView = async () => {
      if (!appId || !configId || !workflowId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const dateString = formatDateForApi(selectedDate);
        const appIdNum = parseInt(appId as string);

        // Step 1: Fetch all applications to find the root application name
        const appResponse = await workflowService.getAllWorkflowApplications(dateString);
        let appName = 'Application';
        if (appResponse.success) {
          const app = appResponse.data.find((a: any) => a.appId === appIdNum);
          if (app) {
            appName = app.appName;
            setApplicationData(app);
          }
        }

        // Step 2: Fetch nodes to build the breadcrumb path
        // This is a simplified version. A real implementation might need to recursively fetch
        // nodes if the full path isn't available from a single API call.
        // For now, we assume we can construct a basic path.
        
        const workflowName = (workflowId as string)
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setWorkflowTitle(workflowName);

        // Step 3: Build and set the breadcrumb
        const nodes: BreadcrumbNode[] = [
          {
            id: `app-${appId}`,
            name: appName,
            level: 0,
            appId: appIdNum,
            configId: appId as string,
          },
          {
            id: configId as string,
            name: workflowName,
            level: 1,
            appId: appIdNum,
            configId: configId as string,
            isWorkflowInstance: true,
          }
        ];
        buildPath(nodes);

      } catch (error) {
        console.error("Error initializing workflow view:", error);
        showErrorToast("Failed to load workflow context.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkflowView();
  }, [appId, configId, workflowId, selectedDate, buildPath, formatDateForApi]);
  
  // Convert query parameters to proper types
  const applicationId = appId ? parseInt(appId as string) : undefined;
  const parsedCurrentLevel = currentLevel ? parseInt(currentLevel as string) : undefined;
  const parsedNextLevel = nextLevel ? parseInt(nextLevel as string) : undefined;

  const handleViewToggle = (mode: 'classic' | 'alternative') => {
    setViewMode(mode);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = (level: number) => {
    if (level === -1) { // Home / Applications
      reset();
      router.push('/dashboard');
    } else {
      navigateToLevel(level);
      router.push('/dashboard');
    }
  };

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
              <h1 className="text-2xl font-bold">{workflowTitle}</h1>
              <p className="text-muted-foreground">
                Dynamic Workflow Detail View with Recursive API Integration
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Dynamic Loading
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              Recursive Traversal
            </Badge>
          </div>
        </div>

        {/* Integration Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This page demonstrates the 3-step recursive workflow integration:
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li><strong>Step 1:</strong> Load all workflow applications for the selected date</li>
              <li><strong>Step 2:</strong> Recursively traverse workflow nodes until terminal nodes (isUsedForWorkflowInstance = true) are found</li>
              <li><strong>Step 3:</strong> Load workflow summary data for each terminal node</li>
            </ol>
            {applicationId && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <strong>Specific Application Mode:</strong> Loading data for Application ID {applicationId}, Config ID {configId}
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* API Endpoints Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              API Endpoints Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <Badge variant="outline" className="mr-2">GET</Badge>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  /api/WF/GetAllWorkflowApplications/{'{date}'}
                </code>
                <p className="text-muted-foreground mt-1">
                  Loads all workflow applications for a given date
                </p>
              </div>
              
              <div>
                <Badge variant="outline" className="mr-2">GET</Badge>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  /api/WF/GetWorkflowNodes/{'{date}'}/{'{appId}'}/{'{configId}'}/{'{currentLevel}'}/{'{nextLevel}'}
                </code>
                <p className="text-muted-foreground mt-1">
                  Recursively traverses workflow nodes until terminal nodes are found
                </p>
              </div>
              
              <div>
                <Badge variant="outline" className="mr-2">GET</Badge>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  /api/WF/GetWorkflowSummary/{'{date}'}/{'{configId}'}/{'{appId}'}
                </code>
                <p className="text-muted-foreground mt-1">
                  Loads comprehensive workflow summary data for terminal nodes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="workflow" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Workflow Detail
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Integration Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-4">
            {/* Breadcrumb Navigation */}
            {breadcrumbState.nodes.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBreadcrumbNavigate(-1)}
                      className="h-auto p-1 text-blue-600 hover:text-blue-800"
                    >
                      Applications
                    </Button>
                    {breadcrumbState.nodes.map((node, index) => (
                      <React.Fragment key={node.id}>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBreadcrumbNavigate(index)}
                          disabled={index === breadcrumbState.nodes.length - 1}
                          className="h-auto p-1 text-blue-600 hover:text-blue-800 disabled:text-muted-foreground disabled:no-underline"
                        >
                          {node.name} ({node.level === 0 ? node.appId : node.configId}) ({node.completionPercentage}%)
                        </Button>
                      </React.Fragment>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-4">Loading workflow context...</p>
              </div>
            ) : (
              <DynamicWorkflowDetailView
                workflowTitle={workflowTitle}
                applicationId={applicationId}
                configId={configId as string}
                currentLevel={parsedCurrentLevel}
                nextLevel={parsedNextLevel}
                viewMode={viewMode}
                onViewToggle={handleViewToggle}
                onBreadcrumbNavigate={() => {}}
                applicationData={applicationData}
              />
            )}
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Integration Flow */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Integration Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">Load Applications</h4>
                        <p className="text-sm text-muted-foreground">
                          Fetch all workflow applications for the selected date using GetAllWorkflowApplications API
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">Recursive Traversal</h4>
                        <p className="text-sm text-muted-foreground">
                          For each application, recursively traverse workflow nodes using GetWorkflowNodes API until terminal nodes are found
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">Load Summaries</h4>
                        <p className="text-sm text-muted-foreground">
                          For each terminal node, load comprehensive workflow summary data using GetWorkflowSummary API
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Technical Implementation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">Recursive Algorithm</h4>
                      <p className="text-xs text-muted-foreground">
                        The system uses a depth-first traversal algorithm with cycle detection to prevent infinite loops
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Terminal Node Detection</h4>
                      <p className="text-xs text-muted-foreground">
                        Nodes with isUsedForWorkflowInstance = true are considered terminal and stop the recursion
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Error Handling</h4>
                      <p className="text-xs text-muted-foreground">
                        Comprehensive error handling with partial success support and detailed error reporting
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Data Transformation</h4>
                      <p className="text-xs text-muted-foreground">
                        API responses are transformed into the format expected by the WorkflowDetailView component
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Example Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Example Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Load All Workflows for Today</h4>
                    <code className="block bg-muted p-3 rounded text-xs">
                      {`const result = await workflowService.loadTodayCompleteWorkflowDetails();
if (result.success) {
  console.log('Applications:', result.data.applications.length);
  console.log('Terminal Nodes:', result.data.terminalNodes.length);
  console.log('Summaries:', result.data.workflowSummaries.length);
}`}
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Load Specific Application</h4>
                    <code className="block bg-muted p-3 rounded text-xs">
                      {`const result = await workflowService.loadWorkflowDetailsForApplication(
  '14 Jul 2025', // date
  17,           // appId
  '17',         // configId
  0,            // currentLevel
  1             // nextLevel
);`}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Link href="/workflow/dynamic/daily-named-pnl">
                <Button variant="outline" size="sm">
                  Daily Named PnL
                </Button>
              </Link>
              <Link href="/workflow/dynamic/basel">
                <Button variant="outline" size="sm">
                  Basel Workflow
                </Button>
              </Link>
              <Link href="/workflow/dynamic/risk-analytics">
                <Button variant="outline" size="sm">
                  Risk Analytics
                </Button>
              </Link>
              <Link href="/workflow/dynamic/daily-named-pnl?appId=1&configId=1&currentLevel=0&nextLevel=1">
                <Button variant="outline" size="sm">
                  Daily Named PnL (Specific)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DynamicWorkflowPage;