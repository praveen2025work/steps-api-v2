// Type definitions for hierarchical workflow data structure

export type WorkflowStatus = "pending" | "in-progress" | "completed" | "rejected";

export interface HierarchyLevel {
  id: string;
  name: string;
  level: number;
  progress: number; // Percentage of completion
  status: WorkflowStatus;
  children?: HierarchyLevel[];
  parentId?: string;
}

export interface WorkflowApplication {
  id: string;
  name: string;
  description: string;
  progress: number; // Percentage of completion
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  assetClasses: AssetClass[];
}

export interface AssetClass {
  id: string;
  name: string;
  progress: number; // Percentage of completion
  status: WorkflowStatus;
  workflowLevels: WorkflowLevel[];
}

export interface WorkflowLevel {
  id: string;
  name: string;
  level: number; // Level in the hierarchy (2, 3, 4, etc.)
  progress: number; // Percentage of completion
  status: WorkflowStatus;
  children?: WorkflowLevel[]; // For deeper levels
}

// Mock data for hierarchical workflow structure
export const mockHierarchicalWorkflows: WorkflowApplication[] = [
  {
    id: "app-1001",
    name: "Daily Named PNL",
    description: "Daily profit and loss reporting for named accounts",
    progress: 45,
    status: "in-progress",
    createdAt: "2025-04-01",
    updatedAt: "2025-04-14",
    assetClasses: [
      {
        id: "asset-001",
        name: "Rates",
        progress: 60,
        status: "in-progress",
        workflowLevels: [
          {
            id: "wf-level-001",
            name: "eRates",
            level: 2,
            progress: 75,
            status: "in-progress"
          },
          {
            id: "wf-level-002",
            name: "Euro Bonds",
            level: 2,
            progress: 50,
            status: "in-progress"
          },
          {
            id: "wf-level-003",
            name: "BRIE",
            level: 2,
            progress: 40,
            status: "in-progress"
          }
        ]
      },
      {
        id: "asset-002",
        name: "FI Credit",
        progress: 30,
        status: "in-progress",
        workflowLevels: [
          {
            id: "wf-level-004",
            name: "IG Credit",
            level: 2,
            progress: 35,
            status: "in-progress"
          },
          {
            id: "wf-level-005",
            name: "HY Credit",
            level: 2,
            progress: 25,
            status: "in-progress"
          }
        ]
      },
      {
        id: "asset-003",
        name: "Prime",
        progress: 20,
        status: "in-progress",
        workflowLevels: [
          {
            id: "wf-level-006",
            name: "Prime Brokerage",
            level: 2,
            progress: 20,
            status: "in-progress",
            children: [
              {
                id: "wf-level-007",
                name: "US Prime",
                level: 3,
                progress: 25,
                status: "in-progress"
              },
              {
                id: "wf-level-008",
                name: "EMEA Prime",
                level: 3,
                progress: 15,
                status: "in-progress"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "app-1002",
    name: "Workspace PNL",
    description: "Workspace profit and loss management and reporting",
    progress: 65,
    status: "in-progress",
    createdAt: "2025-04-01",
    updatedAt: "2025-04-14",
    assetClasses: [
      {
        id: "asset-004",
        name: "Equities",
        progress: 70,
        status: "in-progress",
        workflowLevels: [
          {
            id: "wf-level-009",
            name: "Cash Equities",
            level: 2,
            progress: 80,
            status: "in-progress"
          },
          {
            id: "wf-level-010",
            name: "Equity Derivatives",
            level: 2,
            progress: 60,
            status: "in-progress",
            children: [
              {
                id: "wf-level-011",
                name: "Options",
                level: 3,
                progress: 65,
                status: "in-progress"
              },
              {
                id: "wf-level-012",
                name: "Futures",
                level: 3,
                progress: 55,
                status: "in-progress"
              }
            ]
          }
        ]
      },
      {
        id: "asset-005",
        name: "Commodities",
        progress: 60,
        status: "in-progress",
        workflowLevels: [
          {
            id: "wf-level-013",
            name: "Energy",
            level: 2,
            progress: 65,
            status: "in-progress"
          },
          {
            id: "wf-level-014",
            name: "Metals",
            level: 2,
            progress: 55,
            status: "in-progress"
          }
        ]
      }
    ]
  },
  {
    id: "app-1003",
    name: "Monthend PNL",
    description: "Month-end profit and loss consolidation and reporting",
    progress: 10,
    status: "in-progress",
    createdAt: "2025-04-01",
    updatedAt: "2025-04-14",
    assetClasses: [
      {
        id: "asset-006",
        name: "Global Markets",
        progress: 10,
        status: "in-progress",
        workflowLevels: [
          {
            id: "wf-level-015",
            name: "FICC",
            level: 2,
            progress: 15,
            status: "in-progress",
            children: [
              {
                id: "wf-level-016",
                name: "Rates",
                level: 3,
                progress: 20,
                status: "in-progress",
                children: [
                  {
                    id: "wf-level-017",
                    name: "G10 Rates",
                    level: 4,
                    progress: 25,
                    status: "in-progress"
                  },
                  {
                    id: "wf-level-018",
                    name: "EM Rates",
                    level: 4,
                    progress: 15,
                    status: "in-progress"
                  }
                ]
              },
              {
                id: "wf-level-019",
                name: "Credit",
                level: 3,
                progress: 10,
                status: "in-progress"
              }
            ]
          },
          {
            id: "wf-level-020",
            name: "Equities",
            level: 2,
            progress: 5,
            status: "in-progress"
          }
        ]
      }
    ]
  }
];

// Function to flatten the hierarchical structure for easier rendering
export const flattenHierarchy = (applications: WorkflowApplication[]): HierarchyLevel[] => {
  const result: HierarchyLevel[] = [];
  
  applications.forEach(app => {
    // Add application level
    const appLevel: HierarchyLevel = {
      id: app.id,
      name: app.name,
      level: 0, // Application is level 0
      progress: app.progress,
      status: app.status,
      children: []
    };
    result.push(appLevel);
    
    // Add asset classes (level 1)
    app.assetClasses.forEach(assetClass => {
      const assetClassLevel: HierarchyLevel = {
        id: assetClass.id,
        name: assetClass.name,
        level: 1, // Asset class is level 1
        progress: assetClass.progress,
        status: assetClass.status,
        parentId: app.id,
        children: []
      };
      result.push(assetClassLevel);
      
      // Add workflow levels (level 2+)
      const addWorkflowLevels = (
        workflowLevels: WorkflowLevel[],
        parentId: string
      ) => {
        workflowLevels.forEach(wfLevel => {
          const wfLevelItem: HierarchyLevel = {
            id: wfLevel.id,
            name: wfLevel.name,
            level: wfLevel.level,
            progress: wfLevel.progress,
            status: wfLevel.status,
            parentId: parentId,
            children: []
          };
          result.push(wfLevelItem);
          
          // Recursively add children if they exist
          if (wfLevel.children && wfLevel.children.length > 0) {
            addWorkflowLevels(wfLevel.children, wfLevel.id);
          }
        });
      };
      
      addWorkflowLevels(assetClass.workflowLevels, assetClass.id);
    });
  });
  
  return result;
};

// Export flattened hierarchy for easier consumption
export const flattenedHierarchy = flattenHierarchy(mockHierarchicalWorkflows);