import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockHierarchicalWorkflows } from '@/data/hierarchicalWorkflowData';
import applicationsData from '@/data/applications.json';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define types for our workflow hierarchy
interface WorkflowLevel {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: string;
  children?: WorkflowLevel[];
}

const ApplicationDetailPage = () => {
  const router = useRouter();
  const { applicationId } = router.query;
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [currentLevels, setCurrentLevels] = useState<WorkflowLevel[]>([]);
  
  // Fetch application data based on applicationId
  useEffect(() => {
    if (applicationId) {
      setLoading(true);
      
      // Find the application in the hierarchical data
      const app = mockHierarchicalWorkflows.find(app => app.id === applicationId);
      
      if (app) {
        setApplication(app);
        // Initialize with top-level asset classes
        setCurrentLevels(app.assetClasses.map(assetClass => ({
          id: assetClass.id,
          name: assetClass.name,
          progress: assetClass.progress,
          status: assetClass.status,
          children: assetClass.workflowLevels
        })));
        setBreadcrumbs([{ id: app.id, name: app.name }]);
      } else {
        // If not found in hierarchical data, try to find in applications.json
        const appData = applicationsData.find((a: any) => `app-${a.APP_ID}` === applicationId);
        
        if (appData) {
          // Create a placeholder application with empty asset classes
          const placeholderApp = {
            id: `app-${appData.APP_ID}`,
            name: appData.NAME,
            description: appData.DESCRIPTION,
            progress: 0,
            status: appData.ISACTIVE ? "active" : "inactive",
            createdAt: appData.STARTDATE,
            updatedAt: new Date().toISOString().split('T')[0],
            assetClasses: []
          };
          
          setApplication(placeholderApp);
          setCurrentLevels([]);
          setBreadcrumbs([{ id: placeholderApp.id, name: placeholderApp.NAME }]);
        }
      }
      
      setLoading(false);
    }
  }, [applicationId]);

  // Handle navigation to a specific level
  const handleLevelSelect = (level: WorkflowLevel) => {
    setSelectedLevel(level.id);
    
    // Update breadcrumbs
    const newBreadcrumbs = [...breadcrumbs, { id: level.id, name: level.name }];
    setBreadcrumbs(newBreadcrumbs);
    
    // If this level has children, navigate to them
    if (level.children && level.children.length > 0) {
      setCurrentLevels(level.children);
    } else {
      // If no children, navigate to the workflow instance view
      router.push(`/workflow/${level.id}`);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // If clicking the application name, reset to asset classes
      if (application) {
        setCurrentLevels(application.assetClasses.map((assetClass: any) => ({
          id: assetClass.id,
          name: assetClass.name,
          progress: assetClass.progress,
          status: assetClass.status,
          children: assetClass.workflowLevels
        })));
        setBreadcrumbs([{ id: application.id, name: application.name }]);
      }
    } else {
      // Navigate to the selected breadcrumb level
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      
      // Find the correct level to display
      let currentApp = application;
      let levels = currentApp.assetClasses;
      
      for (let i = 1; i < newBreadcrumbs.length; i++) {
        const crumbId = newBreadcrumbs[i].id;
        
        // Find the matching level
        const foundLevel = levels.find((level: any) => level.id === crumbId);
        
        if (foundLevel) {
          if (i === newBreadcrumbs.length - 1) {
            // If this is the last breadcrumb, set its children as current levels
            setCurrentLevels(foundLevel.workflowLevels || foundLevel.children || []);
          } else {
            // Otherwise, continue traversing
            levels = foundLevel.workflowLevels || foundLevel.children || [];
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-muted-foreground mb-4">The application you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/')}>Return to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Workflow Tool | {application.name}</title>
        <meta name="description" content={`Workflow details for ${application.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        <div className="mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Return to dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center flex-wrap gap-2 mb-6">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleBreadcrumbClick(index)}
                    >
                      {crumb.name}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Navigate to {crumb.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </React.Fragment>
          ))}
        </div>
        
        {/* Application Overview */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>{application.name}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Application details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">{application.description}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{application.progress}%</span>
              </div>
              <Progress value={application.progress} className="h-2" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={`${application.status === 'in-progress' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                      {application.status}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm text-muted-foreground">
                Last updated: {application.updatedAt}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Workflow Levels */}
        {currentLevels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentLevels.map((level) => (
              <Card 
                key={level.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleLevelSelect(level)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{level.name}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs">
                            {level.status}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Status: {level.status}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-medium">{level.progress}%</span>
                    </div>
                    <Progress value={level.progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {level.children ? `${level.children.length} sub-levels` : 'View details'}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View {level.name} details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Data Available</h3>
                <p className="text-muted-foreground max-w-md">
                  This application doesn't have any workflow levels defined yet or you don't have access to view them.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </>
  );
};

export default ApplicationDetailPage;