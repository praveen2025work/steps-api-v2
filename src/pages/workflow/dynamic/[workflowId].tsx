import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import DynamicWorkflowDetailView from '@/components/DynamicWorkflowDetailView';
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
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface DynamicWorkflowPageProps {
  workflowId: string;
  applicationId?: number;
  configId?: string;
  currentLevel?: number;
  nextLevel?: number;
}

const DynamicWorkflowPage: React.FC<DynamicWorkflowPageProps> = ({
  workflowId,
  applicationId,
  configId,
  currentLevel,
  nextLevel
}) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'classic' | 'alternative'>('classic');

  // Generate workflow title from ID
  const workflowTitle = workflowId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const handleViewToggle = (mode: 'classic' | 'alternative') => {
    setViewMode(mode);
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
            <DynamicWorkflowDetailView
              workflowTitle={workflowTitle}
              applicationId={applicationId}
              configId={configId}
              currentLevel={currentLevel}
              nextLevel={nextLevel}
              viewMode={viewMode}
              onViewToggle={handleViewToggle}
            />
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { workflowId } = context.params!;
  const { appId, configId, currentLevel, nextLevel } = context.query;

  return {
    props: {
      workflowId: workflowId as string,
      applicationId: appId ? parseInt(appId as string) : undefined,
      configId: configId as string || undefined,
      currentLevel: currentLevel ? parseInt(currentLevel as string) : undefined,
      nextLevel: nextLevel ? parseInt(nextLevel as string) : undefined,
    },
  };
};

export default DynamicWorkflowPage;