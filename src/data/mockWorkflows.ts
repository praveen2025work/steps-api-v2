export type WorkflowStatus = "pending" | "in-progress" | "completed" | "rejected";
export type StageStatus = "pending" | "in-progress" | "completed";

export interface Workflow {
  id: string;
  title: string;
  description: string;
  status: WorkflowStatus;
  progress: number;
  dueDate: string;
  assignee: string;
  createdAt: string;
  stages: WorkflowStage[];
}

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  status: StageStatus;
  assignee: string;
  dueDate: string;
  startDate?: string;
  completionDate?: string;
  substages?: SubStage[];
  documents?: Document[];
  dependencies?: string[]; // IDs of stages that must be completed before this one
}

export interface SubStage {
  id: string;
  name: string;
  status: StageStatus;
  assignee: string;
  dueDate: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  required: boolean;
}

export const mockWorkflows: Workflow[] = [
  {
    id: "wf-001",
    title: "Invoice Approval",
    description: "Process for approving vendor invoices",
    status: "in-progress",
    progress: 65,
    dueDate: "2025-04-20",
    assignee: "John Doe",
    createdAt: "2025-04-10",
    stages: [
      {
        id: "stage-001",
        name: "Initial Review",
        description: "Review invoice details and verify against purchase order",
        status: "completed",
        assignee: "Sarah Williams",
        dueDate: "2025-04-12",
        startDate: "2025-04-10",
        completionDate: "2025-04-11",
        substages: [
          {
            id: "substage-001-1",
            name: "Document Verification",
            status: "completed",
            assignee: "Sarah Williams",
            dueDate: "2025-04-11"
          },
          {
            id: "substage-001-2",
            name: "Purchase Order Matching",
            status: "completed",
            assignee: "Sarah Williams",
            dueDate: "2025-04-12"
          }
        ],
        documents: [
          {
            id: "doc-001",
            name: "Invoice_XYZ123.pdf",
            type: "PDF",
            uploadedBy: "Vendor",
            uploadedAt: "2025-04-09",
            size: "1.2 MB",
            required: true
          },
          {
            id: "doc-002",
            name: "PO_REF456.pdf",
            type: "PDF",
            uploadedBy: "System",
            uploadedAt: "2025-04-10",
            size: "0.8 MB",
            required: true
          }
        ]
      },
      {
        id: "stage-002",
        name: "Financial Verification",
        description: "Verify financial details and budget allocation",
        status: "completed",
        assignee: "Mike Johnson",
        dueDate: "2025-04-15",
        startDate: "2025-04-12",
        completionDate: "2025-04-14",
        dependencies: ["stage-001"],
        substages: [
          {
            id: "substage-002-1",
            name: "Budget Check",
            status: "completed",
            assignee: "Mike Johnson",
            dueDate: "2025-04-13"
          },
          {
            id: "substage-002-2",
            name: "Financial Approval",
            status: "completed",
            assignee: "Mike Johnson",
            dueDate: "2025-04-15"
          }
        ],
        documents: [
          {
            id: "doc-003",
            name: "Budget_Verification.xlsx",
            type: "Excel",
            uploadedBy: "Mike Johnson",
            uploadedAt: "2025-04-13",
            size: "0.5 MB",
            required: true
          }
        ]
      },
      {
        id: "stage-003",
        name: "Manager Approval",
        description: "Department manager reviews and approves the invoice",
        status: "in-progress",
        assignee: "John Doe",
        dueDate: "2025-04-18",
        startDate: "2025-04-15",
        dependencies: ["stage-002"],
        substages: [
          {
            id: "substage-003-1",
            name: "Department Review",
            status: "completed",
            assignee: "John Doe",
            dueDate: "2025-04-16"
          },
          {
            id: "substage-003-2",
            name: "Final Approval",
            status: "in-progress",
            assignee: "John Doe",
            dueDate: "2025-04-18"
          }
        ],
        documents: [
          {
            id: "doc-004",
            name: "Approval_Form.pdf",
            type: "PDF",
            uploadedBy: "John Doe",
            uploadedAt: "2025-04-16",
            size: "0.3 MB",
            required: true
          }
        ]
      },
      {
        id: "stage-004",
        name: "Payment Processing",
        description: "Process payment to vendor",
        status: "pending",
        assignee: "Jane Smith",
        dueDate: "2025-04-20",
        dependencies: ["stage-003"],
        substages: [
          {
            id: "substage-004-1",
            name: "Payment Preparation",
            status: "pending",
            assignee: "Jane Smith",
            dueDate: "2025-04-19"
          },
          {
            id: "substage-004-2",
            name: "Payment Execution",
            status: "pending",
            assignee: "Jane Smith",
            dueDate: "2025-04-20"
          }
        ]
      }
    ]
  },
  {
    id: "wf-002",
    title: "Employee Onboarding",
    description: "New employee onboarding process",
    status: "in-progress",
    progress: 30,
    dueDate: "2025-04-30",
    assignee: "Jane Smith",
    createdAt: "2025-04-05",
    stages: [
      {
        id: "stage-005",
        name: "Document Collection",
        status: "completed",
        assignee: "Jane Smith",
        dueDate: "2025-04-10"
      },
      {
        id: "stage-006",
        name: "IT Setup",
        status: "in-progress",
        assignee: "Robert Brown",
        dueDate: "2025-04-15"
      },
      {
        id: "stage-007",
        name: "Training",
        status: "pending",
        assignee: "Sarah Williams",
        dueDate: "2025-04-25"
      },
      {
        id: "stage-008",
        name: "Department Introduction",
        status: "pending",
        assignee: "Mike Johnson",
        dueDate: "2025-04-30"
      }
    ]
  },
  {
    id: "wf-003",
    title: "Contract Review",
    description: "Legal review of client contracts",
    status: "pending",
    progress: 0,
    dueDate: "2025-05-10",
    assignee: "Robert Brown",
    createdAt: "2025-04-12",
    stages: [
      {
        id: "stage-009",
        name: "Initial Draft Review",
        status: "pending",
        assignee: "Robert Brown",
        dueDate: "2025-04-20"
      },
      {
        id: "stage-010",
        name: "Legal Assessment",
        status: "pending",
        assignee: "Jane Smith",
        dueDate: "2025-04-30"
      },
      {
        id: "stage-011",
        name: "Negotiation",
        status: "pending",
        assignee: "John Doe",
        dueDate: "2025-05-05"
      },
      {
        id: "stage-012",
        name: "Final Approval",
        status: "pending",
        assignee: "Mike Johnson",
        dueDate: "2025-05-10"
      }
    ]
  },
  {
    id: "wf-004",
    title: "Budget Approval",
    description: "Annual department budget approval",
    status: "completed",
    progress: 100,
    dueDate: "2025-04-05",
    assignee: "Mike Johnson",
    createdAt: "2025-03-15",
    stages: [
      {
        id: "stage-013",
        name: "Budget Preparation",
        status: "completed",
        assignee: "Jane Smith",
        dueDate: "2025-03-20"
      },
      {
        id: "stage-014",
        name: "Department Review",
        status: "completed",
        assignee: "John Doe",
        dueDate: "2025-03-25"
      },
      {
        id: "stage-015",
        name: "Finance Approval",
        status: "completed",
        assignee: "Robert Brown",
        dueDate: "2025-03-30"
      },
      {
        id: "stage-016",
        name: "Executive Sign-off",
        status: "completed",
        assignee: "Mike Johnson",
        dueDate: "2025-04-05"
      }
    ]
  },
  {
    id: "wf-005",
    title: "Vendor Registration",
    description: "New vendor registration and approval",
    status: "rejected",
    progress: 50,
    dueDate: "2025-04-15",
    assignee: "Sarah Williams",
    createdAt: "2025-04-01",
    stages: [
      {
        id: "stage-017",
        name: "Document Submission",
        status: "completed",
        assignee: "Robert Brown",
        dueDate: "2025-04-05"
      },
      {
        id: "stage-018",
        name: "Background Check",
        status: "completed",
        assignee: "Jane Smith",
        dueDate: "2025-04-10"
      },
      {
        id: "stage-019",
        name: "Financial Assessment",
        status: "skipped",
        assignee: "John Doe",
        dueDate: "2025-04-12"
      },
      {
        id: "stage-020",
        name: "Final Approval",
        status: "skipped",
        assignee: "Sarah Williams",
        dueDate: "2025-04-15"
      }
    ]
  },
  {
    id: "wf-006",
    title: "IT Change Request",
    description: "System change request process",
    status: "in-progress",
    progress: 75,
    dueDate: "2025-04-25",
    assignee: "Robert Brown",
    createdAt: "2025-04-08",
    stages: [
      {
        id: "stage-021",
        name: "Request Documentation",
        status: "completed",
        assignee: "Jane Smith",
        dueDate: "2025-04-10"
      },
      {
        id: "stage-022",
        name: "Impact Assessment",
        status: "completed",
        assignee: "John Doe",
        dueDate: "2025-04-15"
      },
      {
        id: "stage-023",
        name: "Technical Review",
        status: "completed",
        assignee: "Robert Brown",
        dueDate: "2025-04-20"
      },
      {
        id: "stage-024",
        name: "Implementation",
        status: "in-progress",
        assignee: "Mike Johnson",
        dueDate: "2025-04-25"
      }
    ]
  }
];