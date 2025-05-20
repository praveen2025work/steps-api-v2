import React, { useState, useEffect } from 'react';
import UnifiedDashboardCard from './UnifiedDashboardCard';
import applicationsData from '@/data/applications.json';
import { mockHierarchicalWorkflows } from '@/data/hierarchicalWorkflowData';

// Interface for application data
interface Application {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  taskCounts: {
    completed: number;
    failed: number;
    rejected: number;
    pending: number;
    processing: number;
  };
  eligibleRoles: string[];
  type: 'application' | 'asset' | 'workflow';
}

const ApplicationsGrid = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [workflowInstances, setWorkflowInstances] = useState<Application[]>([]);

  useEffect(() => {
    // Transform the applications.json data to match our component needs
    const transformedApps = applicationsData.map((app: any) => {
      // Find matching hierarchical data if available
      const hierarchicalData = mockHierarchicalWorkflows.find(
        h => h.name.toLowerCase().includes(app.NAME.toLowerCase())
      );
      
      // Generate random task counts if not available from hierarchical data
      const randomTaskCounts = {
        completed: Math.floor(Math.random() * 15) + 5,
        failed: Math.floor(Math.random() * 3),
        rejected: Math.floor(Math.random() * 2),
        pending: Math.floor(Math.random() * 10) + 2,
        processing: Math.floor(Math.random() * 5) + 1
      };
      
      return {
        id: `app-${app.APP_ID}`,
        title: app.NAME,
        description: app.DESCRIPTION,
        progress: hierarchicalData?.progress || Math.floor(Math.random() * 80) + 10,
        status: app.ISACTIVE ? "active" : "inactive",
        taskCounts: randomTaskCounts,
        eligibleRoles: ["PNL Manager", "Finance Analyst", "Compliance Officer"], // Default roles
        type: 'application' as const
      };
    });
    
    // Create workflow instances from hierarchical data
    const workflows: Application[] = [];
    mockHierarchicalWorkflows.forEach(app => {
      app.assetClasses.forEach(assetClass => {
        assetClass.workflowLevels.forEach(wf => {
          workflows.push({
            id: wf.id,
            title: wf.name,
            description: `${app.name} > ${assetClass.name} > ${wf.name}`,
            progress: wf.progress,
            status: "active",
            taskCounts: {
              completed: Math.floor(Math.random() * 15) + 5,
              failed: Math.floor(Math.random() * 3),
              rejected: Math.floor(Math.random() * 2),
              pending: Math.floor(Math.random() * 10) + 2,
              processing: Math.floor(Math.random() * 5) + 1
            },
            eligibleRoles: ["PNL Manager", "Finance Analyst", "Compliance Officer"],
            type: 'workflow' as const
          });
        });
      });
    });
    
    setApplications(transformedApps);
    setWorkflowInstances(workflows);
  }, []);

  return (
    <div className="space-y-6 pl-0">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <UnifiedDashboardCard
              key={app.id}
              id={app.id}
              title={app.title}
              progress={app.progress}
              status={app.status}
              taskCounts={app.taskCounts}
              type={app.type}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Workflow Instances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowInstances.slice(0, 6).map((workflow) => (
            <UnifiedDashboardCard
              key={workflow.id}
              id={workflow.id}
              title={workflow.title}
              progress={workflow.progress}
              status={workflow.status}
              taskCounts={workflow.taskCounts}
              type={workflow.type}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsGrid;