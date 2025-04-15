// Type definitions for hierarchical workflow data structure based on the provided sample data

export type WorkflowStatus = "pending" | "in-progress" | "completed" | "rejected";
export type ConfigStatus = "configured" | "not-configured";

// Level 1 - Applications
export interface Application {
  appId: number;
  configName: string;
  configType: string;
  isConfigured: boolean;
  percentageCompleted: number;
  usedForWorkflowInstance: boolean;
  nextLevel: number;
}

// Level 2 - Business Areas (Asset Classes)
export interface BusinessArea {
  configId: number;
  name: string;
  configType: string;
  isConfigured: boolean;
  percentageCompleted: number;
  nextLevel: number;
  appId?: number; // Reference to parent application
}

// Level 3 - Workflow Instances
export interface WorkflowInstance {
  configId: number;
  name: string;
  appId: number;
  isUsedForWorkflowInstance: boolean;
  percentageCompleted: number;
  isWeekly: boolean;
  nextLevel: number;
  businessAreaId?: number; // Reference to parent business area
}

// Workflow Process Data (Detailed Step Info)
export interface WorkflowProcessStep {
  stage: string;
  subStage: string;
  serviceLink?: string;
  auto: boolean;
  adhoc: boolean;
  alteryx: boolean;
  uploadAllowed: boolean;
  attestationRequired: boolean;
  dependenciesPresent: boolean;
  status: string;
  updatedOn: string;
  completedBy?: string;
  duration: number;
  workflowId: number;
  workflowAppConfigId: number;
  configId?: number; // Reference to parent workflow instance
}

// Sample data based on the provided information
export const sampleApplications: Application[] = [
  {
    appId: 2,
    configName: "Daily Named PnL",
    configType: "APPLICATION",
    isConfigured: false,
    percentageCompleted: 46,
    usedForWorkflowInstance: false,
    nextLevel: 2
  },
  {
    appId: 8,
    configName: "Daily Workspace PnI",
    configType: "APPLICATION",
    isConfigured: true,
    percentageCompleted: 50,
    usedForWorkflowInstance: false,
    nextLevel: 1
  },
  {
    appId: 98,
    configName: "Month End Workflow",
    configType: "APPLICATION",
    isConfigured: false,
    percentageCompleted: 0,
    usedForWorkflowInstance: false,
    nextLevel: 1
  }
];

export const sampleBusinessAreas: BusinessArea[] = [
  {
    configId: 5000161,
    name: "BI Funding and Risk Management",
    configType: "Asset Class",
    isConfigured: true,
    percentageCompleted: 19,
    nextLevel: 2,
    appId: 2 // Associated with Daily Named PnL
  },
  {
    configId: 2140452,
    name: "Barclays Investment Managers",
    configType: "Asset Class",
    isConfigured: true,
    percentageCompleted: 50,
    nextLevel: 2,
    appId: 2 // Associated with Daily Named PnL
  },
  {
    configId: 1021188,
    name: "Capital Markets Execution",
    configType: "Asset Class",
    isConfigured: true,
    percentageCompleted: 71,
    nextLevel: 2,
    appId: 2 // Associated with Daily Named PnL
  }
];

export const sampleWorkflowInstances: WorkflowInstance[] = [
  {
    configId: 22881,
    name: "BFAJL Asia",
    appId: 1,
    isUsedForWorkflowInstance: true,
    percentageCompleted: 56,
    isWeekly: false,
    nextLevel: 3,
    businessAreaId: 5000161 // Associated with BI Funding and Risk Management
  },
  {
    configId: 5113,
    name: "Cross Markets Barclays Investment Managers - EMEA",
    appId: 1,
    isUsedForWorkflowInstance: true,
    percentageCompleted: 44,
    isWeekly: false,
    nextLevel: 3,
    businessAreaId: 2140452 // Associated with Barclays Investment Managers
  }
];

export const sampleWorkflowProcessSteps: WorkflowProcessStep[] = [
  {
    stage: "PRE WF",
    subStage: "SOD Roll",
    serviceLink: "http://SFAS_SERVICES:$FAS_SERVICE_PORTS/fas-feign-client/start-of-day",
    auto: true,
    adhoc: false,
    alteryx: false,
    uploadAllowed: false,
    attestationRequired: false,
    dependenciesPresent: true,
    status: "COMPLETED",
    updatedOn: "14/04/2025 00:51:17",
    completedBy: "MOTIFPRD",
    duration: -2322, // Note: might be a data issue or reverse time logic
    workflowId: 21658670,
    workflowAppConfigId: 43442,
    configId: 5113 // Associated with Cross Markets Barclays Investment Managers - EMEA
  }
];

// Helper function to get the full hierarchical path for a workflow instance
export const getWorkflowHierarchyPath = (workflowInstanceId: number): { level: string, id: number, name: string, percentage: number }[] => {
  const path: { level: string, id: number, name: string, percentage: number }[] = [];
  
  // Find the workflow instance
  const workflowInstance = sampleWorkflowInstances.find(wi => wi.configId === workflowInstanceId);
  if (!workflowInstance) return path;
  
  // Add workflow instance to path
  path.push({
    level: 'workflow-instance',
    id: workflowInstance.configId,
    name: workflowInstance.name,
    percentage: workflowInstance.percentageCompleted
  });
  
  // Find and add business area
  const businessArea = sampleBusinessAreas.find(ba => ba.configId === workflowInstance.businessAreaId);
  if (businessArea) {
    path.unshift({
      level: 'business-area',
      id: businessArea.configId,
      name: businessArea.name,
      percentage: businessArea.percentageCompleted
    });
    
    // Find and add application
    const application = sampleApplications.find(app => app.appId === businessArea.appId);
    if (application) {
      path.unshift({
        level: 'application',
        id: application.appId,
        name: application.configName,
        percentage: application.percentageCompleted
      });
    }
  }
  
  return path;
};

// Helper function to convert the hierarchical path to the format expected by WorkflowHierarchyBreadcrumb
export const convertToHierarchyNodes = (path: { level: string, id: number, name: string, percentage: number }[]): {
  id: string;
  name: string;
  progress: number;
  level: 'app' | 'workflow' | 'hierarchy';
}[] => {
  return path.map(item => {
    let level: 'app' | 'workflow' | 'hierarchy';
    
    switch (item.level) {
      case 'application':
        level = 'app';
        break;
      case 'business-area':
        level = 'workflow';
        break;
      case 'workflow-instance':
        level = 'hierarchy';
        break;
      default:
        level = 'hierarchy';
    }
    
    return {
      id: item.id.toString(),
      name: item.name,
      progress: item.percentage,
      level
    };
  });
};

// Example usage:
// const workflowPath = getWorkflowHierarchyPath(5113);
// const hierarchyNodes = convertToHierarchyNodes(workflowPath);