// Type definitions for workflow data structure

export interface Application {
  id: number;
  name: string;
  category: string;
  serviceUri: string;
  description: string;
  updatedBy: string;
  updatedOn: string;
  isActive: number;
  cronExpression: string;
  runDateOffset: number;
}

export interface Stage {
  id: number;
  name: string;
  appId: number;
  description: string;
}

export interface SubStage {
  id: number;
  name: string;
  defaultStage: number;
  componentName: string;
  serviceLine: string;
}

export interface Role {
  id: number;
  department: string;
  role: string;
  userType: string;
  isReadWrite: string;
  isActive: number;
}

export interface User {
  username: string;
  isActive: number;
  displayName: string;
  email: string;
}

export interface UserRoleMap {
  appId: number;
  roleId: number;
  username: string;
}

export interface BusinessCalendar {
  calendarName: string;
  businessDate: string;
}

export interface Process {
  id: number;
  status: 'completed' | 'in_progress' | 'not_started';
  businessDate: string;
  workflowAppConfigId: number;
  appGroupId: number;
  appId: number;
  stageId: number;
  substageId: number;
  type: 'auto' | 'manual';
  updatedBy?: string;
  updatedOn?: string;
  completedBy?: string;
  completedOn?: string;
  duration: number;
  message?: string;
}

export interface ProcessFile {
  workflowProcessId: number;
  name: string;
  paramType: string;
  value: string;
  required: string;
  status: string;
  description: string;
}

export interface ProcessDependency {
  workflowProcessId: number;
  dependencySubstageId: number;
  status: string;
  updatedBy: string;
  updatedOn: string;
}

export interface HierarchyData {
  hierarchies: Hierarchy[];
  hierarchyItems: HierarchyItem[];
}

export interface Hierarchy {
  id: number;
  name: string;
  description: string;
  level: number;
}

export interface HierarchyItem {
  hierarchyId: number;
  level: number;
  value: string;
  parentLevel: number;
  parentValue: string;
}

export interface UserActivity {
  user: string;
  action: string;
  timestamp: string;
  role: string;
  substage: string;
}

export interface WorkflowData {
  applications: Application[];
  stages: Stage[];
  subStages: SubStage[];
  roles: Role[];
  users: User[];
  userRoleMap: UserRoleMap[];
  businessCalendar: BusinessCalendar[];
  processes: Process[];
  processFiles: ProcessFile[];
  processDependencies: ProcessDependency[];
  hierarchyData: HierarchyData;
  userActivity: UserActivity[];
}

// Actual workflow data
export const workflowData: WorkflowData = {
  applications: [
    {
      id: 1001,
      name: "Daily Named PNL",
      category: "Financial",
      serviceUri: "http://api.example.com/services/daily-pnl",
      description: "Daily Profit and Loss calculation for named accounts",
      updatedBy: "admin",
      updatedOn: "2025-02-15T09:30:00",
      isActive: 1,
      cronExpression: "0 0 6 * * ?",
      runDateOffset: -1
    },
    {
      id: 1002,
      name: "Daily Workspace PNL",
      category: "Financial",
      serviceUri: "http://api.example.com/services/workspace-pnl",
      description: "Daily Profit and Loss for workspace accounts",
      updatedBy: "admin",
      updatedOn: "2025-01-20T14:15:00",
      isActive: 1,
      cronExpression: "0 30 6 * * ?",
      runDateOffset: -1
    },
    {
      id: 1003,
      name: "Monthend PNL",
      category: "Financial",
      serviceUri: "http://api.example.com/services/monthend-pnl",
      description: "Month-end Profit and Loss consolidation",
      updatedBy: "admin",
      updatedOn: "2025-03-05T11:45:00",
      isActive: 1,
      cronExpression: "0 0 7 L * ?",
      runDateOffset: 0
    }
  ],
  stages: [
    {
      id: 101,
      name: "Pre WF",
      appId: 1001,
      description: "Preliminary workflow steps"
    },
    {
      id: 102,
      name: "Substantiation",
      appId: 1001,
      description: "Data validation and reconciliation"
    },
    {
      id: 103,
      name: "Review",
      appId: 1001,
      description: "User review and approval"
    },
    {
      id: 104,
      name: "Publish",
      appId: 1001,
      description: "Publishing and distribution"
    },
    {
      id: 105,
      name: "Sign Off",
      appId: 1001,
      description: "Final approval and sign-off"
    }
  ],
  subStages: [
    {
      id: 1001,
      name: "SOD Roll",
      defaultStage: 101,
      componentName: "SODRollComponent",
      serviceLine: "http://api.example.com/services/sod-roll"
    },
    {
      id: 1002,
      name: "Books Open For Correction",
      defaultStage: 101,
      componentName: "BooksOpenComponent",
      serviceLine: "http://api.example.com/services/books-open"
    },
    {
      id: 1003,
      name: "Poll Book OFC Rec Factory",
      defaultStage: 101,
      componentName: "PollBookComponent",
      serviceLine: "http://api.example.com/services/poll-book"
    },
    {
      id: 1010,
      name: "Balance in Closed, Central, Default And Other Auto Excluded Books",
      defaultStage: 102,
      componentName: "BalanceCheckComponent",
      serviceLine: "http://api.example.com/services/balance-check"
    },
    {
      id: 1011,
      name: "Recurring Adjustments",
      defaultStage: 102,
      componentName: "RecurringAdjComponent",
      serviceLine: "http://api.example.com/services/recurring-adj"
    },
    {
      id: 1020,
      name: "Trial Balance - Review",
      defaultStage: 103,
      componentName: "TrialBalanceReviewComponent",
      serviceLine: "http://api.example.com/services/tb-review"
    }
  ],
  roles: [
    {
      id: 201,
      department: "Finance",
      role: "Producer",
      userType: "Internal",
      isReadWrite: "Y",
      isActive: 1
    },
    {
      id: 202,
      department: "Finance",
      role: "Approver",
      userType: "Internal",
      isReadWrite: "Y",
      isActive: 1
    },
    {
      id: 203,
      department: "Finance",
      role: "Viewer",
      userType: "Internal",
      isReadWrite: "N",
      isActive: 1
    }
  ],
  users: [
    {
      username: "john.doe",
      isActive: 1,
      displayName: "John Doe",
      email: "john.doe@example.com"
    },
    {
      username: "jane.smith",
      isActive: 1,
      displayName: "Jane Smith",
      email: "jane.smith@example.com"
    },
    {
      username: "mike.johnson",
      isActive: 1,
      displayName: "Mike Johnson",
      email: "mike.johnson@example.com"
    },
    {
      username: "sarah.williams",
      isActive: 1,
      displayName: "Sarah Williams",
      email: "sarah.williams@example.com"
    }
  ],
  userRoleMap: [
    {
      appId: 1001,
      roleId: 201,
      username: "john.doe"
    },
    {
      appId: 1001,
      roleId: 201,
      username: "jane.smith"
    },
    {
      appId: 1001,
      roleId: 202,
      username: "mike.johnson"
    },
    {
      appId: 1001,
      roleId: 203,
      username: "sarah.williams"
    }
  ],
  businessCalendar: [
    {
      calendarName: "TRADING_CALENDAR",
      businessDate: "2025-04-12"
    },
    {
      calendarName: "TRADING_CALENDAR",
      businessDate: "2025-04-13"
    }
  ],
  processes: [
    {
      id: 5001,
      status: "completed",
      businessDate: "2025-04-12",
      workflowAppConfigId: 10001,
      appGroupId: 1,
      appId: 1001,
      stageId: 101,
      substageId: 1001,
      type: "auto",
      updatedBy: "system",
      updatedOn: "2025-04-12T06:15:00",
      completedBy: "system",
      completedOn: "2025-04-12T06:15:00",
      duration: 15,
      message: "Successfully rolled over positions"
    },
    {
      id: 5002,
      status: "in_progress",
      businessDate: "2025-04-12",
      workflowAppConfigId: 10002,
      appGroupId: 1,
      appId: 1001,
      stageId: 101,
      substageId: 1002,
      type: "manual",
      updatedBy: "john.doe",
      updatedOn: "2025-04-12T06:30:00",
      duration: 0,
      message: "Books opened for correction"
    },
    {
      id: 5003,
      status: "not_started",
      businessDate: "2025-04-12",
      workflowAppConfigId: 10003,
      appGroupId: 1,
      appId: 1001,
      stageId: 101,
      substageId: 1003,
      type: "auto",
      duration: 0
    }
  ],
  processFiles: [
    {
      workflowProcessId: 5001,
      name: "sod_report.xlsx",
      paramType: "output",
      value: "/files/2025-04-12/sod_report.xlsx",
      required: "Y",
      status: "completed",
      description: "SOD Roll Report"
    },
    {
      workflowProcessId: 5001,
      name: "validation.log",
      paramType: "log",
      value: "/files/2025-04-12/validation.log",
      required: "N",
      status: "completed",
      description: "Validation Log"
    },
    {
      workflowProcessId: 5002,
      name: "corrections.xlsx",
      paramType: "input",
      value: "/files/2025-04-12/corrections.xlsx",
      required: "Y",
      status: "in_progress",
      description: "Corrections Input File"
    }
  ],
  processDependencies: [
    {
      workflowProcessId: 5002,
      dependencySubstageId: 1001,
      status: "completed",
      updatedBy: "system",
      updatedOn: "2025-04-12T06:15:00"
    },
    {
      workflowProcessId: 5003,
      dependencySubstageId: 1002,
      status: "in_progress",
      updatedBy: "john.doe",
      updatedOn: "2025-04-12T06:30:00"
    }
  ],
  hierarchyData: {
    hierarchies: [
      {
        id: 301,
        name: "Business Hierarchy",
        description: "Business unit hierarchy for entitlements",
        level: 1
      }
    ],
    hierarchyItems: [
      {
        hierarchyId: 301,
        level: 1,
        value: "Rates",
        parentLevel: 0,
        parentValue: "root"
      },
      {
        hierarchyId: 301,
        level: 1,
        value: "Equities",
        parentLevel: 0,
        parentValue: "root"
      },
      {
        hierarchyId: 301,
        level: 2,
        value: "eRates",
        parentLevel: 1,
        parentValue: "Rates"
      },
      {
        hierarchyId: 301,
        level: 2,
        value: "FX",
        parentLevel: 1,
        parentValue: "Rates"
      }
    ]
  },
  userActivity: [
    {
      user: "system",
      action: "SOD Roll completed",
      timestamp: "2025-04-12T06:15:00",
      role: "system",
      substage: "SOD Roll"
    },
    {
      user: "john.doe",
      action: "Started Books Open For Correction",
      timestamp: "2025-04-12T06:30:00",
      role: "producer",
      substage: "Books Open For Correction"
    },
    {
      user: "jane.smith",
      action: "Uploaded corrections file",
      timestamp: "2025-04-12T06:45:00",
      role: "producer",
      substage: "Books Open For Correction"
    },
    {
      user: "mike.johnson",
      action: "Reviewed corrections",
      timestamp: "2025-04-12T07:00:00",
      role: "approver",
      substage: "Books Open For Correction"
    }
  ]
};

// Helper function to convert the new data structure to the format expected by the current UI
export const convertToMockWorkflows = () => {
  // Create a mapping of applications to workflows
  const workflows = workflowData.applications.map(app => {
    // Find all stages for this application
    const appStages = workflowData.stages.filter(stage => stage.appId === app.id);
    
    // Map stages to the format expected by the UI
    const mappedStages = appStages.map(stage => {
      // Find all substages for this stage
      const stageSubstages = workflowData.subStages.filter(substage => substage.defaultStage === stage.id);
      
      // Find processes related to this stage
      const stageProcesses = workflowData.processes.filter(process => 
        process.appId === app.id && process.stageId === stage.id
      );
      
      // Map substages to the format expected by the UI
      const mappedSubstages = stageSubstages.map(substage => {
        // Find process for this substage
        const process = workflowData.processes.find(p => 
          p.appId === app.id && p.stageId === stage.id && p.substageId === substage.id
        );
        
        // Map process status to UI status
        let status: 'pending' | 'in-progress' | 'completed' | 'skipped' = 'pending';
        if (process) {
          switch (process.status) {
            case 'completed': status = 'completed'; break;
            case 'in_progress': status = 'in-progress'; break;
            case 'not_started': status = 'pending'; break;
            default: status = 'pending';
          }
        }
        
        // Find user assigned to this substage
        const assignedUser = process?.updatedBy || 'Unassigned';
        const user = assignedUser === 'system' ? 'System' : 
          workflowData.users.find(u => u.username === assignedUser)?.displayName || assignedUser;
        
        return {
          id: `substage-${substage.id}`,
          name: substage.name,
          status,
          assignee: user,
          dueDate: process?.businessDate || app.updatedOn.split('T')[0]
        };
      });
      
      // Find documents related to this stage's processes
      const stageProcessIds = stageProcesses.map(p => p.id);
      const documents = workflowData.processFiles
        .filter(file => stageProcessIds.includes(file.workflowProcessId))
        .map(file => ({
          id: `doc-${file.workflowProcessId}-${file.name}`,
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'Unknown',
          uploadedBy: workflowData.processes.find(p => p.id === file.workflowProcessId)?.updatedBy || 'Unknown',
          uploadedAt: workflowData.processes.find(p => p.id === file.workflowProcessId)?.updatedOn?.split('T')[0] || 'Unknown',
          size: '1.0 MB', // Mock size since it's not in the data
          required: file.required === 'Y'
        }));
      
      // Determine stage status based on processes
      let stageStatus: 'pending' | 'in-progress' | 'completed' | 'skipped' = 'pending';
      if (stageProcesses.length > 0) {
        if (stageProcesses.every(p => p.status === 'completed')) {
          stageStatus = 'completed';
        } else if (stageProcesses.some(p => p.status === 'in_progress')) {
          stageStatus = 'in-progress';
        }
      }
      
      // Find dependencies
      const dependencies = workflowData.processDependencies
        .filter(dep => stageProcesses.some(p => p.id === dep.workflowProcessId))
        .map(dep => {
          const substage = workflowData.subStages.find(s => s.id === dep.dependencySubstageId);
          return substage ? `stage-${substage.defaultStage}` : '';
        })
        .filter(Boolean);
      
      return {
        id: `stage-${stage.id}`,
        name: stage.name,
        description: stage.description,
        status: stageStatus,
        assignee: mappedSubstages.length > 0 ? mappedSubstages[0].assignee : 'Unassigned',
        dueDate: app.updatedOn.split('T')[0], // Using app update date as mock due date
        startDate: stageProcesses.length > 0 ? stageProcesses[0].updatedOn?.split('T')[0] : undefined,
        completionDate: stageStatus === 'completed' ? 
          stageProcesses.find(p => p.completedOn)?.completedOn?.split('T')[0] : undefined,
        substages: mappedSubstages,
        documents,
        dependencies: dependencies.length > 0 ? dependencies : undefined
      };
    });
    
    // Calculate overall workflow progress
    const totalStages = mappedStages.length;
    const completedStages = mappedStages.filter(s => s.status === 'completed').length;
    const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    
    // Determine workflow status
    let status: 'pending' | 'in-progress' | 'completed' | 'rejected' = 'pending';
    if (progress === 100) {
      status = 'completed';
    } else if (progress > 0) {
      status = 'in-progress';
    }
    
    return {
      id: `wf-${app.id}`,
      title: app.name,
      description: app.description,
      status,
      progress,
      dueDate: app.updatedOn.split('T')[0], // Using app update date as mock due date
      assignee: workflowData.users.find(u => 
        workflowData.userRoleMap.some(m => m.appId === app.id && m.username === u.username)
      )?.displayName || 'Unassigned',
      createdAt: app.updatedOn.split('T')[0],
      stages: mappedStages
    };
  });
  
  return workflows;
};

// Export the converted data for use in the application
export const mockWorkflowsFromNewData = convertToMockWorkflows();