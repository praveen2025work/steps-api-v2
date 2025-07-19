import { useState, useEffect, useCallback } from 'react';
import { WorkflowInboxItemData } from '@/components/workflow-inbox/WorkflowInboxDashboard';

// Mock data for demonstration
const generateMockWorkflowItems = (): WorkflowInboxItemData[] => {
  const statuses = ['pending', 'in_progress', 'completed', 'requires_attention', 'blocked'] as const;
  const priorities = ['high', 'medium', 'low'] as const;
  const applications = ['Daily Named PNL', 'Daily Workspace PNL', 'Monthend PNL', 'Risk Reporting', 'Regulatory Reporting'];
  const stages = ['Pre WF', 'Substantiation', 'Review', 'Publish', 'Sign Off'];
  const substages = ['SOD Roll', 'Books Open For Correction', 'Trial Balance Review', 'Final Approval', 'Distribution'];
  const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'current_user'];

  const items: WorkflowInboxItemData[] = [];

  for (let i = 1; i <= 25; i++) {
    const businessDate = new Date();
    businessDate.setDate(businessDate.getDate() - Math.floor(Math.random() * 7));
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 5) - 2);

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const application = applications[Math.floor(Math.random() * applications.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const substage = substages[Math.floor(Math.random() * substages.length)];
    
    const assignedTo = Math.random() > 0.3 ? users[Math.floor(Math.random() * users.length)] : undefined;

    const item: WorkflowInboxItemData = {
      id: `wf-item-${i}`,
      title: `${application} - ${substage}`,
      description: `Process ${substage} for ${application} on ${businessDate.toISOString().split('T')[0]}`,
      processName: `${application} Process`,
      businessDate: businessDate.toISOString().split('T')[0],
      status,
      priority,
      assignedTo: assignedTo === 'current_user' ? 'You' : assignedTo,
      suggestedAction: getSuggestedAction(status, priority),
      dueDate: dueDate.toISOString(),
      estimatedDuration: Math.floor(Math.random() * 120) + 15, // 15-135 minutes
      dependencies: Math.random() > 0.7 ? [`Dependency ${Math.floor(Math.random() * 3) + 1}`] : [],
      tags: generateTags(application, stage),
      files: generateFiles(i),
      comments: generateComments(i),
      history: generateHistory(i),
      metadata: {
        application,
        stage,
        substage,
        hierarchyPath: `Root > ${application} > ${stage} > ${substage}`
      }
    };

    items.push(item);
  }

  return items.sort((a, b) => {
    // Sort by priority first, then by due date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

const getSuggestedAction = (status: string, priority: string): string => {
  if (status === 'requires_attention') {
    return 'Review and resolve blocking issues';
  }
  if (status === 'blocked') {
    return 'Contact dependencies to unblock';
  }
  if (status === 'pending' && priority === 'high') {
    return 'Assign to yourself and start immediately';
  }
  if (status === 'pending') {
    return 'Assign to team member or start processing';
  }
  if (status === 'in_progress') {
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
                status: item.status === 'pending' ? 'in_progress' : item.status,
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