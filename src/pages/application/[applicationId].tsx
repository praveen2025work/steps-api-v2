import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockHierarchicalWorkflows } from '@/data/hierarchicalWorkflowData';

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
      // In a real app, this would be an API call
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center flex-wrap gap-2 mb-6">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => handleBreadcrumbClick(index)}
              >
                {crumb.name}
              </Button>
            </React.Fragment>
          ))}
        </div>
        
        {/* Application Overview */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>{application.name}</CardTitle>
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
              <Badge className={`${application.status === 'in-progress' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                {application.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Last updated: {application.updatedAt}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Workflow Levels */}
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
                  <Badge variant="outline" className="text-xs">
                    {level.status}
                  </Badge>
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
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {currentLevels.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground">No workflow levels found</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default ApplicationDetailPage;