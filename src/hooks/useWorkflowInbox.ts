import { useState, useEffect, useCallback } from 'react';
import { WorkflowInboxItemData } from '@/components/workflow-inbox/WorkflowInboxDashboard';

// Mock data for demonstration - comprehensive static data for each application
const generateMockWorkflowItems = (): WorkflowInboxItemData[] => {
  const statuses: ('NOTSTARTED' | 'READY' | 'INPROGRESS' | 'POSTMANUAL' | 'COMPLETED' | 'FAILED')[] = 
    ['NOTSTARTED', 'READY', 'INPROGRESS', 'POSTMANUAL']; // Only show manual processes that need attention
  const priorities = ['high', 'medium', 'low'] as const;
  
  // Comprehensive application data with realistic workflow processes
  const applicationData = [
    {
      name: 'Daily Named PNL',
      stages: ['Pre WF', 'Data Collection', 'Validation', 'Review', 'Publish'],
      substages: ['SOD Roll', 'Data Extract', 'Reconciliation', 'Variance Analysis', 'Final Review', 'Distribution'],
      processes: [
        'Trade Data Validation',
        'Position Reconciliation', 
        'PnL Attribution Analysis',
        'Risk Metrics Calculation',
        'Management Reporting'
      ]
    },
    {
      name: 'Daily Workspace PNL',
      stages: ['Initialization', 'Processing', 'Validation', 'Approval', 'Distribution'],
      substages: ['System Check', 'Data Load', 'Calculation Engine', 'Quality Control', 'Sign Off', 'Report Generation'],
      processes: [
        'Workspace Setup',
        'Market Data Integration',
        'PnL Calculation',
        'Exception Handling',
        'Final Approval'
      ]
    },
    {
      name: 'Monthend PNL',
      stages: ['Preparation', 'Calculation', 'Review', 'Adjustment', 'Finalization'],
      substages: ['Cut-off Procedures', 'Accrual Processing', 'Variance Investigation', 'Management Review', 'Books Closure'],
      processes: [
        'Month-end Accruals',
        'Fair Value Adjustments',
        'Regulatory Reporting',
        'Management Commentary',
        'Audit Trail Generation'
      ]
    },
    {
      name: 'Risk Reporting',
      stages: ['Data Gathering', 'Risk Calculation', 'Limit Monitoring', 'Escalation', 'Reporting'],
      substages: ['Market Data Feed', 'VaR Calculation', 'Stress Testing', 'Limit Breach Check', 'Committee Reporting'],
      processes: [
        'Market Risk Assessment',
        'Credit Risk Analysis',
        'Operational Risk Review',
        'Regulatory Capital Calculation',
        'Risk Dashboard Update'
      ]
    },
    {
      name: 'Regulatory Reporting',
      stages: ['Data Preparation', 'Validation', 'Submission Prep', 'Review', 'Filing'],
      substages: ['Data Extraction', 'Format Validation', 'Regulatory Mapping', 'Quality Assurance', 'Submission'],
      processes: [
        'CCAR Submission',
        'Basel III Reporting',
        'Liquidity Coverage Ratio',
        'Stress Test Results',
        'Capital Adequacy Report'
      ]
    },
    {
      name: 'Trade Settlement',
      stages: ['Trade Capture', 'Confirmation', 'Settlement', 'Reconciliation', 'Exception Handling'],
      substages: ['Trade Booking', 'Counterparty Confirm', 'Cash Movement', 'Position Update', 'Break Resolution'],
      processes: [
        'FX Settlement',
        'Securities Settlement',
        'Derivative Confirmation',
        'Cash Reconciliation',
        'Failed Trade Resolution'
      ]
    },
    {
      name: 'Collateral Management',
      stages: ['Exposure Calculation', 'Margin Call', 'Collateral Movement', 'Valuation', 'Reporting'],
      substages: ['MTM Calculation', 'Threshold Monitoring', 'Call Generation', 'Asset Transfer', 'Dispute Resolution'],
      processes: [
        'Initial Margin Calculation',
        'Variation Margin Processing',
        'Collateral Optimization',
        'Haircut Application',
        'Regulatory Reporting'
      ]
    }
  ];

  const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'current_user'];
  const items: WorkflowInboxItemData[] = [];
  let itemId = 1;

  // Generate items for each application
  applicationData.forEach(app => {
    const itemsPerApp = Math.floor(Math.random() * 8) + 5; // 5-12 items per application
    
    for (let i = 0; i < itemsPerApp; i++) {
      const businessDate = new Date();
      businessDate.setDate(businessDate.getDate() - Math.floor(Math.random() * 7));
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 5) - 2);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const stage = app.stages[Math.floor(Math.random() * app.stages.length)];
      const substage = app.substages[Math.floor(Math.random() * app.substages.length)];
      const process = app.processes[Math.floor(Math.random() * app.processes.length)];
      
      const assignedTo = Math.random() > 0.3 ? users[Math.floor(Math.random() * users.length)] : undefined;
      const isManual = Math.random() > 0.2; // 80% are manual processes

      const item: WorkflowInboxItemData = {
        id: `wf-item-${itemId}`,
        title: `${app.name} - ${process}`,
        description: `${process} for ${app.name} - ${substage} stage on ${businessDate.toISOString().split('T')[0]}`,
        processName: `${app.name} ${process}`,
        businessDate: businessDate.toISOString().split('T')[0],
        status,
        priority,
        assignedTo: assignedTo === 'current_user' ? 'You' : assignedTo,
        suggestedAction: getSuggestedAction(status, priority),
        dueDate: dueDate.toISOString(),
        estimatedDuration: Math.floor(Math.random() * 120) + 15, // 15-135 minutes
        dependencies: Math.random() > 0.7 ? [`${app.name} Data Feed`, `${stage} Completion`] : [],
        tags: generateTags(app.name, stage),
        files: generateFiles(itemId),
        comments: generateComments(itemId),
        history: generateHistory(itemId),
        metadata: {
          application: app.name,
          stage,
          substage,
          hierarchyPath: `Root > ${app.name} > ${stage} > ${substage}`,
          processControls: {
            active: Math.random() > 0.2,
            auto: Math.random() > 0.4, // Less auto processes to show more manual ones
            attest: Math.random() > 0.5,
            lock: Math.random() > 0.7,
            canTrigger: status !== 'FAILED',
            canSelect: true,
            lastRun: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
            nextRun: status === 'NOTSTARTED' || status === 'READY' ? 
              new Date(Date.now() + Math.random() * 86400000 * 2).toISOString() : null
          },
          isManual // Add the missing isManual flag
        }
      };

      items.push(item);
      itemId++;
    }
  });

  return items.sort((a, b) => {
    // Sort by priority first, then by due date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

const getSuggestedAction = (status: string, priority: string): string => {
  if (status === 'FAILED') {
    return 'Review and resolve failure issues';
  }
  if (status === 'POSTMANUAL') {
    return 'Review manual intervention results';
  }
  if (status === 'NOTSTARTED' && priority === 'high') {
    return 'Assign to yourself and start immediately';
  }
  if (status === 'NOTSTARTED' || status === 'READY') {
    return 'Assign to team member or start processing';
  }
  if (status === 'INPROGRESS') {
    return 'Continue processing and update status';
  }
  return 'Review and approve completion';
};

const generateTags = (application: string, stage: string): string[] => {
  const baseTags = [application.toLowerCase().replace(/\s+/g, '-'), stage.toLowerCase().replace(/\s+/g, '-')];
  const additionalTags = ['finance', 'daily', 'critical', 'automated', 'manual', 'review-required'];
  
  const numAdditional = Math.floor(Math.random() * 3);
  for (let i = 0; i < numAdditional; i++) {
    const tag = additionalTags[Math.floor(Math.random() * additionalTags.length)];
    if (!baseTags.includes(tag)) {
      baseTags.push(tag);
    }
  }
  
  return baseTags;
};

const generateFiles = (itemId: number) => {
  const fileTypes = ['xlsx', 'pdf', 'csv', 'log', 'txt'];
  const fileNames = ['report', 'data', 'validation', 'summary', 'output', 'input'];
  const statuses = ['pending', 'uploaded', 'approved', 'rejected'] as const;
  
  const numFiles = Math.floor(Math.random() * 4);
  const files = [];
  
  for (let i = 0; i < numFiles; i++) {
    const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    files.push({
      id: `file-${itemId}-${i}`,
      name: `${fileName}_${itemId}.${fileType}`,
      type: fileType.toUpperCase(),
      size: `${(Math.random() * 10 + 0.1).toFixed(1)} MB`,
      required: Math.random() > 0.5,
      status
    });
  }
  
  return files;
};

const generateComments = (itemId: number) => {
  const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'];
  const commentTypes = ['comment', 'query', 'approval', 'rejection'] as const;
  const messages = [
    'Please review the attached files',
    'Data validation completed successfully',
    'Found discrepancies in the report',
    'Approved for next stage',
    'Need clarification on the numbers',
    'Process completed as expected'
  ];
  
  const numComments = Math.floor(Math.random() * 5);
  const comments = [];
  
  for (let i = 0; i < numComments; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 48));
    
    comments.push({
      id: `comment-${itemId}-${i}`,
      user: users[Math.floor(Math.random() * users.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: timestamp.toISOString(),
      type: commentTypes[Math.floor(Math.random() * commentTypes.length)]
    });
  }
  
  return comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateHistory = (itemId: number) => {
  const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'System'];
  const actions = [
    'Process created',
    'Assigned to user',
    'Status updated',
    'File uploaded',
    'Comment added',
    'Approval requested',
    'Process completed'
  ];
  
  const numEntries = Math.floor(Math.random() * 8) + 2;
  const history = [];
  
  for (let i = 0; i < numEntries; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - (numEntries - i) * 2);
    
    history.push({
      id: `history-${itemId}-${i}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      user: users[Math.floor(Math.random() * users.length)],
      timestamp: timestamp.toISOString(),
      details: Math.random() > 0.7 ? 'Additional details about this action' : undefined
    });
  }
  
  return history;
};

export const useWorkflowInbox = () => {
  const [items, setItems] = useState<WorkflowInboxItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockItems = generateMockWorkflowItems();
      setItems(mockItems);
    } catch (err) {
      setError('Failed to load workflow items');
      console.error('Error loading workflow items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const assignToMe = useCallback(async (itemId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, assignedTo: 'You' }
            : item
        )
      );
    } catch (err) {
      console.error('Error assigning item:', err);
      throw err;
    }
  }, []);

  const triggerAction = useCallback(async (itemId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                status: item.status === 'NOTSTARTED' ? 'READY' : 
                        item.status === 'READY' ? 'INPROGRESS' : item.status,
                history: [
                  {
                    id: `history-${Date.now()}`,
                    action: 'Action triggered',
                    user: 'You',
                    timestamp: new Date().toISOString(),
                    details: 'Manual action triggered from workflow inbox'
                  },
                  ...item.history
                ]
              }
            : item
        )
      );
    } catch (err) {
      console.error('Error triggering action:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    items,
    loading,
    error,
    refreshData,
    assignToMe,
    triggerAction
  };
};