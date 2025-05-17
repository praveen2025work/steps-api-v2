import { Notification } from '@/components/notifications/NotificationsCenter';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate a random date within the last 7 days
const getRandomRecentDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // 0-7 days ago
  const hoursAgo = Math.floor(Math.random() * 24); // 0-24 hours ago
  const minutesAgo = Math.floor(Math.random() * 60); // 0-60 minutes ago
  
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  
  return now;
};

// Sample users for notifications
const users = [
  { name: 'John Smith', initials: 'JS', avatar: '' },
  { name: 'Emily Johnson', initials: 'EJ', avatar: '' },
  { name: 'Michael Brown', initials: 'MB', avatar: '' },
  { name: 'Sarah Davis', initials: 'SD', avatar: '' },
  { name: 'David Wilson', initials: 'DW', avatar: '' },
  { name: 'System', initials: 'SY', avatar: '' }
];

// Sample workflows
const workflows = [
  { id: 'wf-level-001', name: 'Q1 Financial Review' },
  { id: 'wf-level-002', name: 'Monthly Compliance Check' },
  { id: 'wf-level-003', name: 'Annual Audit Process' },
  { id: 'wf-level-004', name: 'Risk Assessment' },
  { id: 'wf-level-005', name: 'Regulatory Reporting' }
];

// Sample processes
const processes = [
  { id: 'proc-001', name: 'Data Validation' },
  { id: 'proc-002', name: 'Reconciliation' },
  { id: 'proc-003', name: 'Approval Workflow' },
  { id: 'proc-004', name: 'Report Generation' },
  { id: 'proc-005', name: 'Compliance Check' }
];

// Sample applications
const applications = [
  { id: 'app-001', name: 'Financial Reporting' },
  { id: 'app-002', name: 'Risk Management' },
  { id: 'app-003', name: 'Compliance Tracker' },
  { id: 'app-004', name: 'Audit System' },
  { id: 'app-005', name: 'Regulatory Reporting' }
];

// Generate approval notifications
const generateApprovalNotifications = (): Notification[] => {
  return [
    {
      id: uuidv4(),
      type: 'approval',
      title: 'Workflow Approved',
      message: `${workflows[0].name} has been approved by ${users[0].name}. The workflow has moved to the next stage.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[0],
      workflowId: workflows[0].id
    },
    {
      id: uuidv4(),
      type: 'approval',
      title: 'Process Step Approved',
      message: `${processes[1].name} process has been approved and is ready for the next step. Please review the attached documentation.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[1],
      processId: processes[1].id
    },
    {
      id: uuidv4(),
      type: 'approval',
      title: 'Document Approved',
      message: `The financial statement for Q1 has been approved by the finance team. You can now proceed with the distribution.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[2],
      workflowId: workflows[2].id
    },
    {
      id: uuidv4(),
      type: 'approval',
      title: 'Application Access Approved',
      message: `Your request for access to ${applications[0].name} has been approved. You now have editor permissions.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[3],
      applicationId: applications[0].id
    }
  ];
};

// Generate rejection notifications
const generateRejectionNotifications = (): Notification[] => {
  return [
    {
      id: uuidv4(),
      type: 'rejection',
      title: 'Workflow Rejected',
      message: `${workflows[3].name} has been rejected by ${users[4].name}. Please review the comments and resubmit.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[4],
      workflowId: workflows[3].id
    },
    {
      id: uuidv4(),
      type: 'rejection',
      title: 'Process Step Rejected',
      message: `${processes[3].name} process has been rejected due to data inconsistencies. Please correct the issues and resubmit.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[0],
      processId: processes[3].id
    },
    {
      id: uuidv4(),
      type: 'rejection',
      title: 'Document Rejected',
      message: `The compliance report has been rejected. Please address the following issues: missing signatures, incomplete data in section 3.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[1],
      workflowId: workflows[4].id
    }
  ];
};

// Generate info notifications
const generateInfoNotifications = (): Notification[] => {
  return [
    {
      id: uuidv4(),
      type: 'info',
      title: 'System Maintenance',
      message: `Scheduled system maintenance will occur on Saturday at 10:00 PM EST. The system will be unavailable for approximately 2 hours.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[5],
    },
    {
      id: uuidv4(),
      type: 'info',
      title: 'New Feature Available',
      message: `A new dashboard feature has been added to the application. Check out the Help section for more information.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[5],
    }
  ];
};

// Generate alert notifications
const generateAlertNotifications = (): Notification[] => {
  return [
    {
      id: uuidv4(),
      type: 'alert',
      title: 'Approaching Deadline',
      message: `${workflows[1].name} is due in 2 days. Please ensure all tasks are completed on time.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[5],
      workflowId: workflows[1].id
    },
    {
      id: uuidv4(),
      type: 'alert',
      title: 'Data Validation Error',
      message: `Multiple validation errors detected in ${processes[0].name}. Please review and correct the data.`,
      timestamp: getRandomRecentDate(),
      isRead: Math.random() > 0.7,
      sender: users[5],
      processId: processes[0].id
    }
  ];
};

// Generate all notifications
export const generateMockNotifications = (): Notification[] => {
  const approvals = generateApprovalNotifications();
  const rejections = generateRejectionNotifications();
  const infos = generateInfoNotifications();
  const alerts = generateAlertNotifications();
  
  // Combine all notifications and sort by timestamp (newest first)
  const allNotifications = [...approvals, ...rejections, ...infos, ...alerts]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Generate additional notifications if needed to demonstrate version limiting
  // This is just for demonstration purposes
  const extraNotifications: Notification[] = [];
  if (allNotifications.length < 25) {
    for (let i = 0; i < 10; i++) {
      extraNotifications.push({
        id: uuidv4(),
        type: Math.random() > 0.5 ? 'info' : 'alert',
        title: `Additional Notification ${i+1}`,
        message: `This is an additional notification to demonstrate version limiting. Notification ${i+1} of 10.`,
        timestamp: getRandomRecentDate(),
        isRead: Math.random() > 0.7,
        sender: users[Math.floor(Math.random() * users.length)],
      });
    }
  }
  
  return [...allNotifications, ...extraNotifications]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};