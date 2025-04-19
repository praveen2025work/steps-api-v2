// Type definitions for stage-specific workflow data

export type WorkflowStage = 'pre-wf' | 'substantiation' | 'review' | 'publish' | 'sign-off' | 'rainy-day' | 'exception';

export interface StageData {
  id: string;
  name: string;
  description: string;
  tasks: StageTask[];
  documents: StageDocument[];
  metrics?: StageMetrics;
}

export interface StageTask {
  id: string;
  name: string;
  processId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  duration: number;
  expectedStart: string;
  dependencies?: { name: string; status: string }[];
  documents?: { name: string; size: string }[];
  messages?: string[];
  updatedBy: string;
  updatedAt: string;
}

export interface StageDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  required: boolean;
}

export interface StageMetrics {
  [key: string]: number | string;
}

// Mock data for different workflow stages
export const stageSpecificData: Record<WorkflowStage, StageData> = {
  'pre-wf': {
    id: 'stage-001',
    name: 'Pre WF',
    description: 'Preliminary workflow steps before main processing',
    tasks: [
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
        status: 'in-progress',
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
      {
        id: 'task-003',
        name: 'Poll Book OFC Rec Factory',
        processId: 'PROC-1236',
        status: 'pending',
        duration: 20,
        expectedStart: '07:00',
        dependencies: [
          { name: 'Books Open For Correction', status: 'in-progress' },
        ],
        updatedBy: 'System',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
    ],
    documents: [
      {
        id: 'doc-001',
        name: 'sod_report.xlsx',
        type: 'XLSX',
        size: '2.4 MB',
        uploadedBy: 'System',
        uploadedAt: '4/12/2025',
        required: true,
      },
      {
        id: 'doc-002',
        name: 'validation.log',
        type: 'LOG',
        size: '150 KB',
        uploadedBy: 'System',
        uploadedAt: '4/12/2025',
        required: false,
      },
      {
        id: 'doc-003',
        name: 'corrections.xlsx',
        type: 'XLSX',
        size: '1.2 MB',
        uploadedBy: 'John Doe',
        uploadedAt: '4/12/2025',
        required: true,
      },
    ],
    metrics: {
      'Total Books': 250,
      'Books Processed': 250,
      'Books with Corrections': 15,
      'Processing Time': '15 min',
    },
  },
  'substantiation': {
    id: 'stage-002',
    name: 'Substantiation',
    description: 'Data validation and reconciliation process',
    tasks: [
      {
        id: 'task-004',
        name: 'Balance in Closed, Central, Default And Other Auto Excluded Books',
        processId: 'PROC-1237',
        status: 'pending',
        duration: 25,
        expectedStart: '07:30',
        dependencies: [
          { name: 'Poll Book OFC Rec Factory', status: 'pending' },
        ],
        updatedBy: 'System',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
      {
        id: 'task-005',
        name: 'Recurring Adjustments',
        processId: 'PROC-1238',
        status: 'pending',
        duration: 20,
        expectedStart: '08:00',
        dependencies: [
          { name: 'Balance in Closed, Central, Default And Other Auto Excluded Books', status: 'pending' },
        ],
        updatedBy: 'System',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
    ],
    documents: [
      {
        id: 'doc-004',
        name: 'balance_report.xlsx',
        type: 'XLSX',
        size: '3.1 MB',
        uploadedBy: 'System',
        uploadedAt: '4/12/2025',
        required: true,
      },
      {
        id: 'doc-005',
        name: 'adjustments.xlsx',
        type: 'XLSX',
        size: '1.8 MB',
        uploadedBy: 'System',
        uploadedAt: '4/12/2025',
        required: true,
      },
    ],
    metrics: {
      'Total Adjustments': 45,
      'Manual Adjustments': 12,
      'Auto Adjustments': 33,
      'Total Value': '$2.5M',
    },
  },
  'review': {
    id: 'stage-003',
    name: 'Review',
    description: 'User review and approval of processed data',
    tasks: [
      {
        id: 'task-006',
        name: 'Trial Balance - Review',
        processId: 'PROC-1239',
        status: 'pending',
        duration: 60,
        expectedStart: '08:30',
        dependencies: [
          { name: 'Recurring Adjustments', status: 'pending' },
        ],
        updatedBy: 'Mike Johnson',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
      {
        id: 'task-007',
        name: 'Approve Adjustments',
        processId: 'PROC-1240',
        status: 'pending',
        duration: 30,
        expectedStart: '09:30',
        dependencies: [
          { name: 'Trial Balance - Review', status: 'pending' },
        ],
        updatedBy: 'Jane Smith',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
    ],
    documents: [
      {
        id: 'doc-006',
        name: 'trial_balance.xlsx',
        type: 'XLSX',
        size: '4.2 MB',
        uploadedBy: 'Mike Johnson',
        uploadedAt: '4/12/2025',
        required: true,
      },
      {
        id: 'doc-007',
        name: 'review_comments.docx',
        type: 'DOCX',
        size: '350 KB',
        uploadedBy: 'Mike Johnson',
        uploadedAt: '4/12/2025',
        required: false,
      },
    ],
    metrics: {
      'Items to Review': 78,
      'Items Reviewed': 0,
      'Items Approved': 0,
      'Items Rejected': 0,
    },
  },
  'publish': {
    id: 'stage-004',
    name: 'Publish',
    description: 'Publishing and distribution of final reports',
    tasks: [
      {
        id: 'task-008',
        name: 'Generate Final Reports',
        processId: 'PROC-1241',
        status: 'pending',
        duration: 20,
        expectedStart: '10:00',
        dependencies: [
          { name: 'Approve Adjustments', status: 'pending' },
        ],
        updatedBy: 'System',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
      {
        id: 'task-009',
        name: 'Distribute Reports',
        processId: 'PROC-1242',
        status: 'pending',
        duration: 15,
        expectedStart: '10:30',
        dependencies: [
          { name: 'Generate Final Reports', status: 'pending' },
        ],
        updatedBy: 'System',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
    ],
    documents: [
      {
        id: 'doc-008',
        name: 'final_pnl_report.pdf',
        type: 'PDF',
        size: '5.7 MB',
        uploadedBy: 'System',
        uploadedAt: '4/12/2025',
        required: true,
      },
      {
        id: 'doc-009',
        name: 'distribution_log.txt',
        type: 'TXT',
        size: '120 KB',
        uploadedBy: 'System',
        uploadedAt: '4/12/2025',
        required: false,
      },
    ],
    metrics: {
      'Reports Generated': 0,
      'Reports Distributed': 0,
      'Recipients': 25,
      'Distribution Time': '0 min',
    },
  },
  'sign-off': {
    id: 'stage-005',
    name: 'Sign Off',
    description: 'Final approval and sign-off by authorized personnel',
    tasks: [
      {
        id: 'task-010',
        name: 'Management Review',
        processId: 'PROC-1243',
        status: 'pending',
        duration: 45,
        expectedStart: '11:00',
        dependencies: [
          { name: 'Distribute Reports', status: 'pending' },
        ],
        updatedBy: 'Sarah Williams',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
      {
        id: 'task-011',
        name: 'Final Sign-Off',
        processId: 'PROC-1244',
        status: 'pending',
        duration: 15,
        expectedStart: '11:45',
        dependencies: [
          { name: 'Management Review', status: 'pending' },
        ],
        updatedBy: 'Sarah Williams',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
    ],
    documents: [
      {
        id: 'doc-010',
        name: 'sign_off_form.pdf',
        type: 'PDF',
        size: '1.2 MB',
        uploadedBy: 'Sarah Williams',
        uploadedAt: '4/12/2025',
        required: true,
      },
    ],
    metrics: {
      'Approvers Required': 3,
      'Approvers Signed': 0,
      'Pending Approvals': 3,
      'Sign-off Status': 'Not Started',
    },
  },
  'rainy-day': {
    id: 'stage-006',
    name: 'Rainy Day',
    description: 'Handling of exceptional scenarios and edge cases',
    tasks: [
      {
        id: 'task-012',
        name: 'Identify Exceptions',
        processId: 'PROC-1245',
        status: 'pending',
        duration: 30,
        expectedStart: '12:00',
        updatedBy: 'John Doe',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
      {
        id: 'task-013',
        name: 'Process Exceptions',
        processId: 'PROC-1246',
        status: 'pending',
        duration: 60,
        expectedStart: '12:30',
        dependencies: [
          { name: 'Identify Exceptions', status: 'pending' },
        ],
        updatedBy: 'Jane Smith',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
    ],
    documents: [
      {
        id: 'doc-011',
        name: 'exceptions_log.xlsx',
        type: 'XLSX',
        size: '2.1 MB',
        uploadedBy: 'John Doe',
        uploadedAt: '4/12/2025',
        required: true,
      },
    ],
    metrics: {
      'Exceptions Identified': 0,
      'Exceptions Processed': 0,
      'Critical Exceptions': 0,
      'Resolution Time': '0 min',
    },
  },
  'exception': {
    id: 'stage-007',
    name: 'Exception',
    description: 'Handling of workflow exceptions and error conditions',
    tasks: [
      {
        id: 'task-014',
        name: 'Log Errors',
        processId: 'PROC-1247',
        status: 'pending',
        duration: 15,
        expectedStart: '13:30',
        updatedBy: 'System',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
      {
        id: 'task-015',
        name: 'Notify Support Team',
        processId: 'PROC-1248',
        status: 'pending',
        duration: 5,
        expectedStart: '13:45',
        dependencies: [
          { name: 'Log Errors', status: 'pending' },
        ],
        updatedBy: 'System',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
      {
        id: 'task-016',
        name: 'Resolve Issues',
        processId: 'PROC-1249',
        status: 'pending',
        duration: 120,
        expectedStart: '14:00',
        dependencies: [
          { name: 'Notify Support Team', status: 'pending' },
        ],
        updatedBy: 'Support Team',
        updatedAt: '4/12/2025, 6:00:00 AM',
      },
    ],
    documents: [
      {
        id: 'doc-012',
        name: 'error_log.txt',
        type: 'TXT',
        size: '450 KB',
        uploadedBy: 'System',
        uploadedAt: '4/12/2025',
        required: true,
      },
      {
        id: 'doc-013',
        name: 'incident_report.pdf',
        type: 'PDF',
        size: '1.8 MB',
        uploadedBy: 'Support Team',
        uploadedAt: '4/12/2025',
        required: true,
      },
    ],
    metrics: {
      'Total Errors': 0,
      'Critical Errors': 0,
      'Resolved Issues': 0,
      'Mean Time to Resolution': '0 min',
    },
  },
};

// Helper function to get stage data by stage ID or name
export const getStageData = (stageIdOrName: string): StageData | null => {
  // Normalize the input to lowercase for case-insensitive comparison
  const normalizedInput = stageIdOrName.toLowerCase();
  
  // First, try to find by exact stage ID
  for (const [key, data] of Object.entries(stageSpecificData)) {
    if (data.id.toLowerCase() === normalizedInput) {
      return data;
    }
  }
  
  // If not found by ID, try to find by stage name
  for (const [key, data] of Object.entries(stageSpecificData)) {
    if (data.name.toLowerCase() === normalizedInput) {
      return data;
    }
  }
  
  // If not found by name, try to match with the stage key
  if (normalizedInput in stageSpecificData) {
    return stageSpecificData[normalizedInput as WorkflowStage];
  }
  
  // If still not found, try to match with similar names
  if (normalizedInput === 'pre' || normalizedInput === 'pre wf' || normalizedInput === 'prewf') {
    return stageSpecificData['pre-wf'];
  }
  if (normalizedInput === 'sub' || normalizedInput === 'substantiate') {
    return stageSpecificData['substantiation'];
  }
  if (normalizedInput === 'rev') {
    return stageSpecificData['review'];
  }
  if (normalizedInput === 'pub') {
    return stageSpecificData['publish'];
  }
  if (normalizedInput === 'sign' || normalizedInput === 'signoff') {
    return stageSpecificData['sign-off'];
  }
  if (normalizedInput === 'rainy' || normalizedInput === 'rainyday') {
    return stageSpecificData['rainy-day'];
  }
  if (normalizedInput === 'except' || normalizedInput === 'error') {
    return stageSpecificData['exception'];
  }
  
  // If no match found, return null
  return null;
};

// Helper function to get tasks for a specific stage
export const getStageTasksById = (stageId: string): StageTask[] => {
  const stageData = getStageData(stageId);
  return stageData ? stageData.tasks : [];
};

// Helper function to get documents for a specific stage
export const getStageDocumentsById = (stageId: string): StageDocument[] => {
  const stageData = getStageData(stageId);
  return stageData ? stageData.documents : [];
};

// Helper function to get metrics for a specific stage
export const getStageMetricsById = (stageId: string): StageMetrics | undefined => {
  const stageData = getStageData(stageId);
  return stageData ? stageData.metrics : undefined;
};

// Helper function to get all stage names and IDs for navigation
export const getAllStages = (): { id: string; name: string }[] => {
  return Object.values(stageSpecificData).map(stage => ({
    id: stage.id,
    name: stage.name
  }));
};