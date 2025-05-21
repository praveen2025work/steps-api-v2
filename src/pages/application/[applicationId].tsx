import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, ChevronRight, Info, Search, CheckCircle2, Clock, XCircle, PlayCircle, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [processStats, setProcessStats] = useState<{
    completed: number;
    inProgress: number;
    notStarted: number;
    failed: number;
    total: number;
  }>({
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    failed: 0,
    total: 0
  });
  
  // Fetch application data based on applicationId
  useEffect(() => {
    if (applicationId) {
      setLoading(true);
      console.log("Looking for application with ID:", applicationId);
      
      // First, try to find the application directly by ID
      let app = mockHierarchicalWorkflows.find(app => app.id === applicationId);
      
      // If not found by direct ID match, try to find by name (case-insensitive)
      if (!app) {
        app = mockHierarchicalWorkflows.find(
          app => app.name.toLowerCase() === String(applicationId).toLowerCase().replace('app-', '')
        );
      }
      
      // If still not found, check if it's an asset class or workflow level
      if (!app) {
        // Search through all applications for the asset class or workflow level
        for (const application of mockHierarchicalWorkflows) {
          // Check asset classes
          const assetClass = application.assetClasses.find(
            ac => ac.id === applicationId || ac.name.toLowerCase() === String(applicationId).toLowerCase()
          );
          
          if (assetClass) {
            // If it's an asset class, redirect to the parent application
            router.push(`/application/${application.id}`);
            return;
          }
          
          // Check workflow levels
          for (const ac of application.assetClasses) {
            const workflowLevel = ac.workflowLevels.find(
              wf => wf.id === applicationId || wf.name.toLowerCase() === String(applicationId).toLowerCase()
            );
            
            if (workflowLevel) {
              // If it's a workflow level, redirect to the parent application
              router.push(`/application/${application.id}`);
              return;
            }
          }
        }
      }
      
      if (app) {
        console.log("Found application:", app.name);
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
        
        // Calculate process statistics
        let completed = 0;
        let inProgress = 0;
        let notStarted = 0;
        let failed = 0;
        let total = 0;
        
        // Function to count processes recursively
        const countProcesses = (items: any[]) => {
          items.forEach(item => {
            total++;
            
            if (item.progress === 100) {
              completed++;
            } else if (item.progress === 0) {
              notStarted++;
            } else if (item.status === 'rejected' || item.status === 'failed') {
              failed++;
            } else {
              inProgress++;
            }
            
            // Count children if they exist
            if (item.children && item.children.length > 0) {
              countProcesses(item.children);
            }
            if (item.workflowLevels && item.workflowLevels.length > 0) {
              countProcesses(item.workflowLevels);
            }
          });
        };
        
        // Start counting from asset classes
        countProcesses(app.assetClasses);
        
        setProcessStats({
          completed,
          inProgress,
          notStarted,
          failed,
          total
        });
        
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
          
          // Reset process stats
          setProcessStats({
            completed: 0,
            inProgress: 0,
            notStarted: 0,
            failed: 0,
            total: 0
          });
        }
      }
      
      setLoading(false);
    }
  }, [applicationId]);

  // Calculate statistics for the current level
  const calculateLevelStats = (level: any) => {
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let failed = 0;
    let total = 0;
    
    // Function to count processes recursively
    const countProcesses = (items: any[]) => {
      if (!items || items.length === 0) return;
      
      items.forEach(item => {
        total++;
        
        if (item.progress === 100) {
          completed++;
        } else if (item.progress === 0) {
          notStarted++;
        } else if (item.status === 'rejected' || item.status === 'failed') {
          failed++;
        } else {
          inProgress++;
        }
        
        // Count children if they exist
        if (item.children && item.children.length > 0) {
          countProcesses(item.children);
        }
        if (item.workflowLevels && item.workflowLevels.length > 0) {
          countProcesses(item.workflowLevels);
        }
      });
    };
    
    // If level has children, count them
    if (level.children && level.children.length > 0) {
      countProcesses(level.children);
    } else if (level.workflowLevels && level.workflowLevels.length > 0) {
      countProcesses(level.workflowLevels);
    }
    
    return {
      completed,
      inProgress,
      notStarted,
      failed,
      total
    };
  };

  // Handle navigation to a specific level
  const handleLevelSelect = (level: WorkflowLevel) => {
    setSelectedLevel(level.id);
    
    // Update breadcrumbs
    const newBreadcrumbs = [...breadcrumbs, { id: level.id, name: level.name }];
    setBreadcrumbs(newBreadcrumbs);
    
    // If this level has children, navigate to them
    if (level.children && level.children.length > 0) {
      setCurrentLevels(level.children);
      
      // Update process statistics for this level
      setProcessStats(calculateLevelStats(level));
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
        const assetClasses = application.assetClasses.map((assetClass: any) => ({
          id: assetClass.id,
          name: assetClass.name,
          progress: assetClass.progress,
          status: assetClass.status,
          children: assetClass.workflowLevels
        }));
        
        setCurrentLevels(assetClasses);
        setBreadcrumbs([{ id: application.id, name: application.name }]);
        
        // Reset to application-level statistics
        let completed = 0;
        let inProgress = 0;
        let notStarted = 0;
        let failed = 0;
        let total = 0;
        
        // Function to count processes recursively
        const countProcesses = (items: any[]) => {
          items.forEach(item => {
            total++;
            
            if (item.progress === 100) {
              completed++;
            } else if (item.progress === 0) {
              notStarted++;
            } else if (item.status === 'rejected' || item.status === 'failed') {
              failed++;
            } else {
              inProgress++;
            }
            
            // Count children if they exist
            if (item.children && item.children.length > 0) {
              countProcesses(item.children);
            }
            if (item.workflowLevels && item.workflowLevels.length > 0) {
              countProcesses(item.workflowLevels);
            }
          });
        };
        
        // Start counting from asset classes
        countProcesses(application.assetClasses);
        
        setProcessStats({
          completed,
          inProgress,
          notStarted,
          failed,
          total
        });
      }
    } else {
      // Navigate to the selected breadcrumb level
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      
      // Find the correct level to display
      let currentApp = application;
      let levels = currentApp.assetClasses;
      let currentLevel = null;
      
      for (let i = 1; i < newBreadcrumbs.length; i++) {
        const crumbId = newBreadcrumbs[i].id;
        
        // Find the matching level
        const foundLevel = levels.find((level: any) => level.id === crumbId);
        
        if (foundLevel) {
          currentLevel = foundLevel;
          
          if (i === newBreadcrumbs.length - 1) {
            // If this is the last breadcrumb, set its children as current levels
            setCurrentLevels(foundLevel.workflowLevels || foundLevel.children || []);
          } else {
            // Otherwise, continue traversing
            levels = foundLevel.workflowLevels || foundLevel.children || [];
          }
        }
      }
      
      // Update statistics for the current level
      if (currentLevel) {
        setProcessStats(calculateLevelStats(currentLevel));
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
        {/* Header with Breadcrumb Navigation and Back Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center flex-wrap gap-2">
            {breadcrumbs.map((crumb, index) => {
              // Create the full path for copying
              const fullPath = breadcrumbs.slice(0, index + 1).map(c => c.name).join(' -> ');
              
              return (
                <React.Fragment key={crumb.id}>
                  {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleBreadcrumbClick(index)}
                    >
                      {crumb.name}
                    </Button>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(fullPath);
                              // Show a temporary tooltip or notification
                              const button = e.currentTarget;
                              button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                              setTimeout(() => {
                                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';
                              }, 2000);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy path</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="h-8"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>
        
        {/* Application Overview with Process Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>{breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].name : application.name}</CardTitle>
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
                  {breadcrumbs.length > 1 ? (
                    <span className="text-sm font-medium">
                      {breadcrumbs[breadcrumbs.length - 1].id === application.id 
                        ? application.progress 
                        : currentLevels.length > 0 
                          ? Math.round(currentLevels.reduce((sum, level) => sum + level.progress, 0) / currentLevels.length) 
                          : 0}%
                    </span>
                  ) : (
                    <span className="text-sm font-medium">{application.progress}%</span>
                  )}
                </div>
                <Progress 
                  value={breadcrumbs.length > 1 
                    ? (breadcrumbs[breadcrumbs.length - 1].id === application.id 
                      ? application.progress 
                      : currentLevels.length > 0 
                        ? Math.round(currentLevels.reduce((sum, level) => sum + level.progress, 0) / currentLevels.length) 
                        : 0)
                    : application.progress} 
                  className="h-2" 
                />
              </div>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        className={`${
                          breadcrumbs.length > 1 && breadcrumbs[breadcrumbs.length - 1].id !== application.id
                            ? currentLevels.some(level => level.status === 'in-progress') 
                              ? 'bg-blue-500' 
                              : currentLevels.every(level => level.status === 'completed') 
                                ? 'bg-green-500' 
                                : 'bg-yellow-500'
                            : application.status === 'in-progress' 
                              ? 'bg-blue-500' 
                              : 'bg-green-500'
                        } text-white`}
                      >
                        {breadcrumbs.length > 1 && breadcrumbs[breadcrumbs.length - 1].id !== application.id
                          ? currentLevels.some(level => level.status === 'in-progress') 
                            ? 'in-progress' 
                            : currentLevels.every(level => level.status === 'completed') 
                              ? 'completed' 
                              : 'pending'
                          : application.status}
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
          
          {/* Process Statistics Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Process Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold">{processStats.completed}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-full">
                    <PlayCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">In Progress</p>
                    <p className="text-2xl font-bold">{processStats.inProgress}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/10 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Not Started</p>
                    <p className="text-2xl font-bold">{processStats.notStarted}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 p-2 rounded-full">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Failed</p>
                    <p className="text-2xl font-bold">{processStats.failed}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Workflow Levels */}
        {currentLevels.length > 0 ? (
          <>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search workflow levels..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Display count of filtered items */}
            {searchTerm && (
              <p className="text-sm text-muted-foreground mb-4">
                Found {currentLevels.filter(level => 
                  level.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length} matching items
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLevels
                .filter(level => searchTerm ? 
                  level.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
                .map((level) => (
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
          </>
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