import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowDetailView from '@/components/WorkflowDetailView';
import ModernWorkflowView from '@/components/workflow/ModernWorkflowView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, LayoutDashboard, Layers, Sparkles } from 'lucide-react';
import { WorkflowTask } from '@/components/WorkflowTaskItem';
import { mockHierarchicalWorkflows } from '@/data/hierarchicalWorkflowData';
import { getAllStages } from '@/data/stageSpecificData';

// Find workflow by ID from hierarchical data
const findWorkflowById = (id: string) => {
  console.log("Finding workflow with ID or name:", id);
  
  // Helper function to search through the hierarchy
  const searchInWorkflowLevels = (levels: any[], targetId: string): any => {
    for (const level of levels) {
      // Case-insensitive ID comparison
      if (level.id.toLowerCase() === targetId.toLowerCase() || 
          (level.name && level.name.toLowerCase() === targetId.toLowerCase())) {
        console.log(`Found match: ${level.name} (${level.id})`);
        return level;
      }
      
      // Check children if they exist
      if (level.children && level.children.length > 0) {
        const found = searchInWorkflowLevels(level.children, targetId);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  // Search through all applications
  for (const app of mockHierarchicalWorkflows) {
    // Check if the app itself is the target (case-insensitive)
    if (app.id.toLowerCase() === id.toLowerCase() || 
        (app.name && app.name.toLowerCase() === id.toLowerCase())) {
      console.log(`Found application match: ${app.name} (${app.id})`);
      return app;
    }
    
    // Check asset classes
    for (const assetClass of app.assetClasses) {
      if (assetClass.id.toLowerCase() === id.toLowerCase() || 
          (assetClass.name && assetClass.name.toLowerCase() === id.toLowerCase())) {
        console.log(`Found asset class match: ${assetClass.name} (${assetClass.id})`);
        return assetClass;
      }
      
      // Check workflow levels
      for (const wfLevel of assetClass.workflowLevels) {
        if (wfLevel.id.toLowerCase() === id.toLowerCase() || 
            (wfLevel.name && wfLevel.name.toLowerCase() === id.toLowerCase())) {
          console.log(`Found workflow level match: ${wfLevel.name} (${wfLevel.id})`);
          return wfLevel;
        }
        
        // Check children if they exist
        if (wfLevel.children && wfLevel.children.length > 0) {
          const found = searchInWorkflowLevels(wfLevel.children, id);
          if (found) return found;
        }
      }
    }
  }
  
  console.log("No workflow found with ID or name:", id);
  return null;
};

// Mock data for the workflow detail view
const getMockWorkflowData = (workflowId: string) => {
  // Find the workflow in our hierarchical data
  const workflow = findWorkflowById(workflowId);
  
  if (!workflow) return null;
  
  // Build the breadcrumb path
  const buildProgressSteps = (workflow: any) => {
    const steps = [];
    
    // Find the application this workflow belongs to
    for (const app of mockHierarchicalWorkflows) {
      let found = false;
      
      // Check if this is the app itself
      if (app.id === workflow.id) {
        steps.push({ name: app.name, progress: app.progress });
        found = true;
        break;
      }
      
      // Check asset classes
      for (const assetClass of app.assetClasses) {
        if (assetClass.id === workflow.id) {
          steps.push({ name: app.name, progress: app.progress });
          steps.push({ name: assetClass.name, progress: assetClass.progress });
          found = true;
          break;
        }
        
        // Check workflow levels
        for (const wfLevel of assetClass.workflowLevels) {
          if (wfLevel.id === workflow.id) {
            steps.push({ name: app.name, progress: app.progress });
            steps.push({ name: assetClass.name, progress: assetClass.progress });
            steps.push({ name: wfLevel.name, progress: wfLevel.progress });
            found = true;
            break;
          }
          
          // Check deeper levels if they exist
          if (wfLevel.children && wfLevel.children.length > 0) {
            for (const childLevel of wfLevel.children) {
              if (childLevel.id === workflow.id) {
                steps.push({ name: app.name, progress: app.progress });
                steps.push({ name: assetClass.name, progress: assetClass.progress });
                steps.push({ name: wfLevel.name, progress: wfLevel.progress });
                steps.push({ name: childLevel.name, progress: childLevel.progress });
                found = true;
                break;
              }
            }
          }
          
          if (found) break;
        }
        
        if (found) break;
      }
      
      if (found) break;
    }
    
    return steps;
  };
  
  // Get all available stages from our stage-specific data
  const allStages = getAllStages();
  
  return {
    id: workflow.id,
    title: workflow.name,
    progressSteps: buildProgressSteps(workflow),
    stages: allStages,
    tasks: {
      'stage-001': [
        {
          id: 'task-001',
          name: 'SOD Roll',
          processId: 'PROC-1234',
          status: 'completed',
          duration: 15,
          expectedStart: '06:00',
          documents: [
            { name: 'sod_report.xlsx', size: '2.4 MB' },
            { name: 'validation.log', size: '150 KB' },
          ],
          messages: [
            'Successfully rolled over positions',
            'All 2,500 positions processed',
          ],
          updatedBy: 'System',
          updatedAt: '4/12/2025, 6:15:00 AM',
        },
        {
          id: 'task-002',
          name: 'Books Open For Correction',
          processId: 'PROC-1235',
          status: 'in_progress',
          duration: 30,
          expectedStart: '06:30',
          dependencies: [
            { name: 'SOD Roll', status: 'completed' },
          ],
          documents: [
            { name: 'corrections.xlsx', size: '1.2 MB' },
          ],
          messages: [
            'Books opened for correction',
          ],
          updatedBy: 'John Doe',
          updatedAt: '4/12/2025, 6:30:00 AM',
        },
      ],
      'stage-002': [],
      'stage-003': [],
      'stage-004': [],
      'stage-005': [],
      'stage-006': [],
      'stage-007': [],
    },
  };
};

const WorkflowDetailPage = () => {
  const router = useRouter();
  const { workflowId } = router.query;
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [hierarchyData, setHierarchyData] = useState<any>({
    applications: [],
    categories: {}
  });
  // State to toggle between classic and alternative view
  const [viewMode, setViewMode] = useState<'classic' | 'alternative'>('classic');
  
  // Generate hierarchy data for navigation based on the actual workflow structure
  const generateHierarchyData = React.useCallback(() => {
    // Default hierarchy data structure
    const data = {
      applications: mockHierarchicalWorkflows.map(app => ({
        id: app.id,
        name: app.name,
        completion: app.progress
      })),
      categories: {} as Record<string, { id: string; name: string; completion: number }[]>
    };
    
    // Populate categories based on the workflow structure
    mockHierarchicalWorkflows.forEach(app => {
      data.categories[app.id] = app.assetClasses.map(assetClass => ({
        id: assetClass.id,
        name: assetClass.name,
        completion: assetClass.progress
      }));
      
      // Add workflow levels as categories
      app.assetClasses.forEach(assetClass => {
        data.categories[assetClass.id] = assetClass.workflowLevels.map(wfLevel => ({
          id: wfLevel.id,
          name: wfLevel.name,
          completion: wfLevel.progress
        }));
      });
    });
    
    return data;
  }, []);
  
  // Determine the current path based on the workflow ID
  const determineCurrentPath = React.useCallback(() => {
    // Default path is empty
    const path: string[] = [];
    
    // Safety check - if workflowData is not available, return empty path
    if (!workflowData || !workflowData.id) {
      return path;
    }
    
    // Find the workflow in the hierarchy (case-insensitive)
    for (const app of mockHierarchicalWorkflows) {
      // If this is the app itself (case-insensitive comparison)
      if (app.id.toLowerCase() === workflowData.id.toLowerCase() || 
          (app.name && app.name.toLowerCase() === workflowData.id.toLowerCase())) {
        path.push(app.id);
        return path;
      }
      
      // Check asset classes
      for (const assetClass of app.assetClasses) {
        if (assetClass.id.toLowerCase() === workflowData.id.toLowerCase() || 
            (assetClass.name && assetClass.name.toLowerCase() === workflowData.id.toLowerCase())) {
          path.push(app.id, assetClass.id);
          return path;
        }
        
        // Check workflow levels
        for (const wfLevel of assetClass.workflowLevels) {
          if (wfLevel.id.toLowerCase() === workflowData.id.toLowerCase() || 
              (wfLevel.name && wfLevel.name.toLowerCase() === workflowData.id.toLowerCase())) {
            path.push(app.id, assetClass.id, wfLevel.id);
            return path;
          }
          
          // Check deeper levels if they exist
          if (wfLevel.children && wfLevel.children.length > 0) {
            for (const childLevel of wfLevel.children) {
              if (childLevel.id.toLowerCase() === workflowData.id.toLowerCase() || 
                  (childLevel.name && childLevel.name.toLowerCase() === workflowData.id.toLowerCase())) {
                path.push(app.id, assetClass.id, wfLevel.id, childLevel.id);
                return path;
              }
            }
          }
        }
      }
    }
    
    return path;
  }, [workflowData]);
  
  // Initialize hierarchy data
  useEffect(() => {
    setHierarchyData(generateHierarchyData());
  }, [generateHierarchyData]);
  
  // Fetch workflow data based on workflowId
  useEffect(() => {
    if (workflowId) {
      console.log(`Fetching workflow data for ID: ${workflowId}`);
      
      // Check if we're looking for a workflow by name (like "erates")
      console.log(`Checking if "${workflowId}" matches any workflow names or IDs (case-insensitive)`);
      
      // In a real application, you would fetch the workflow data from an API
      const data = getMockWorkflowData(workflowId as string);
      console.log(`Workflow data found:`, data ? 'Yes' : 'No');
      
      // Add more detailed logging to help diagnose issues
      if (!data) {
        console.error(`Failed to find workflow with ID: ${workflowId}`);
        console.log('Available workflow IDs and names in hierarchical data:');
        mockHierarchicalWorkflows.forEach(app => {
          console.log(`- App: ${app.id} (${app.name})`);
          app.assetClasses.forEach(assetClass => {
            console.log(`  - Asset Class: ${assetClass.id} (${assetClass.name})`);
            assetClass.workflowLevels.forEach(level => {
              console.log(`    - Workflow Level: ${level.id} (${level.name})`);
              if (level.children && level.children.length > 0) {
                level.children.forEach(child => {
                  console.log(`      - Child Level: ${child.id} (${child.name})`);
                });
              }
            });
          });
        });
      } else {
        console.log(`Successfully found workflow: ${data.title}`);
      }
      
      setWorkflowData(data);
      setLoading(false);
    }
  }, [workflowId]);
  
  // Update currentPath when workflowData is available
  useEffect(() => {
    if (workflowData) {
      const path = determineCurrentPath();
      setCurrentPath(path);
    }
  }, [workflowData, determineCurrentPath]);
  
  if (loading) {
    return (
      <DashboardLayout title="Loading Workflow...">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!workflowData) {
    return (
      <DashboardLayout title="Workflow Not Found">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Workflow Not Found</h2>
          <p className="text-muted-foreground mb-4">The workflow you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/')}>Return to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleNavigate = (id: string, level: string) => {
    if (level === 'root') {
      setCurrentPath([]);
    } else if (level === 'application') {
      setCurrentPath([id]);
    } else if (level === 'category') {
      // If we're already at this level, don't change the path
      if (currentPath.includes(id)) {
        setCurrentPath(currentPath.slice(0, currentPath.indexOf(id) + 1));
      } else {
        // Check if this is a direct child of the current path's last item
        const lastId = currentPath[currentPath.length - 1];
        if (hierarchyData.categories[lastId]?.some((item: any) => item.id === id)) {
          // Add this level to the path
          setCurrentPath([...currentPath, id]);
        } else {
          // This is not a direct child, so we need to find its parent
          for (const [parentId, children] of Object.entries(hierarchyData.categories)) {
            if (children.some((item: any) => item.id === id)) {
              // If the parent is already in the path, truncate to it and add this item
              if (currentPath.includes(parentId)) {
                setCurrentPath([
                  ...currentPath.slice(0, currentPath.indexOf(parentId) + 1),
                  id
                ]);
              } else {
                // Otherwise, just set to this item
                setCurrentPath([id]);
              }
              break;
            }
          }
        }
      }
    }
  };



  return (
    <>
      <Head>
        <title>Workflow Tool | {workflowData.title}</title>
        <meta name="description" content={`Workflow details for ${workflowData.title}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout title={workflowData.title}>
        <div className="flex flex-col h-full">
          {/* Main Content - Takes full available height */}
          <div className="flex-1">
            {viewMode === 'classic' ? (
              <WorkflowDetailView 
                workflowTitle={workflowData.title}
                progressSteps={workflowData.progressSteps}
                stages={workflowData.stages}
                tasks={workflowData.tasks as Record<string, WorkflowTask[]>}
                viewMode={viewMode}
                onViewToggle={(mode) => setViewMode(mode)}
              />
            ) : (
              <ModernWorkflowView 
                workflow={workflowData}
                onBack={() => setViewMode('classic')}
                onViewToggle={() => setViewMode('classic')}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default WorkflowDetailPage;