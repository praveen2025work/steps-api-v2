import { v4 as uuidv4 } from 'uuid';
import { User, UserApplication } from '@/types/user-types';

// Sample applications with their applicable roles
const applications = [
  { 
    id: 'app-001', 
    name: 'Financial Reporting',
    roles: ['Viewer', 'Editor', 'Admin']
  },
  { 
    id: 'app-002', 
    name: 'Risk Management',
    roles: ['Analyst', 'Manager', 'Admin']
  },
  { 
    id: 'app-003', 
    name: 'Compliance Tracker',
    roles: ['Viewer', 'Compliance Officer', 'Admin']
  },
  { 
    id: 'app-004', 
    name: 'Audit System',
    roles: ['Auditor', 'Senior Auditor', 'Admin']
  },
  { 
    id: 'app-005', 
    name: 'Regulatory Reporting',
    roles: ['Reporter', 'Reviewer', 'Admin']
  }
];

// Generate mock user data
export const generateMockUsers = (): User[] => {
  return [
    {
      id: 'user-001',
      username: 'john.smith',
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      isActive: true,
      role: 'Admin',
      department: 'Finance',
      createdOn: new Date('2024-01-15T10:30:00'),
      createdBy: 'system',
      lastModifiedOn: new Date('2024-04-10T14:45:00'),
      lastModifiedBy: 'admin',
      applications: [
        { applicationId: 'app-001', accessLevel: 'Editor', assignedOn: new Date('2024-01-16') },
        { applicationId: 'app-003', accessLevel: 'Viewer', assignedOn: new Date('2024-02-20') }
      ]
    },
    {
      id: 'user-002',
      username: 'emily.johnson',
      fullName: 'Emily Johnson',
      email: 'emily.johnson@example.com',
      isActive: true,
      role: 'Manager',
      department: 'Risk',
      createdOn: new Date('2024-01-20T09:15:00'),
      createdBy: 'system',
      lastModifiedOn: null,
      lastModifiedBy: null,
      applications: [
        { applicationId: 'app-002', accessLevel: 'Admin', assignedOn: new Date('2024-01-21') },
        { applicationId: 'app-004', accessLevel: 'Editor', assignedOn: new Date('2024-03-05') }
      ]
    },
    {
      id: 'user-003',
      username: 'michael.brown',
      fullName: 'Michael Brown',
      email: 'michael.brown@example.com',
      isActive: true,
      role: 'Analyst',
      department: 'Finance',
      createdOn: new Date('2024-02-05T11:45:00'),
      createdBy: 'admin',
      lastModifiedOn: new Date('2024-04-15T16:30:00'),
      lastModifiedBy: 'admin',
      applications: [
        { applicationId: 'app-001', accessLevel: 'Viewer', assignedOn: new Date('2024-02-10') },
        { applicationId: 'app-005', accessLevel: 'Editor', assignedOn: new Date('2024-03-15') }
      ]
    },
    {
      id: 'user-004',
      username: 'sarah.davis',
      fullName: 'Sarah Davis',
      email: 'sarah.davis@example.com',
      isActive: false,
      role: 'Auditor',
      department: 'Compliance',
      createdOn: new Date('2024-02-15T13:20:00'),
      createdBy: 'admin',
      lastModifiedOn: new Date('2024-05-01T10:15:00'),
      lastModifiedBy: 'admin',
      applications: [
        { applicationId: 'app-003', accessLevel: 'Admin', assignedOn: new Date('2024-02-16') },
        { applicationId: 'app-004', accessLevel: 'Editor', assignedOn: new Date('2024-02-16') }
      ]
    },
    {
      id: 'user-005',
      username: 'david.wilson',
      fullName: 'David Wilson',
      email: 'david.wilson@example.com',
      isActive: true,
      role: 'Developer',
      department: 'IT',
      createdOn: new Date('2024-03-01T09:30:00'),
      createdBy: 'system',
      lastModifiedOn: null,
      lastModifiedBy: null,
      applications: [
        { applicationId: 'app-001', accessLevel: 'Admin', assignedOn: new Date('2024-03-02') },
        { applicationId: 'app-002', accessLevel: 'Admin', assignedOn: new Date('2024-03-02') },
        { applicationId: 'app-003', accessLevel: 'Admin', assignedOn: new Date('2024-03-02') },
        { applicationId: 'app-004', accessLevel: 'Admin', assignedOn: new Date('2024-03-02') },
        { applicationId: 'app-005', accessLevel: 'Admin', assignedOn: new Date('2024-03-02') }
      ]
    }
  ];
};

// Get all available applications for assignment
export const getAvailableApplications = () => {
  return applications.map(app => ({
    id: app.id,
    name: app.name
  }));
};

// Generate a new user ID
export const generateUserId = (): string => {
  return `user-${Math.floor(Math.random() * 900) + 100}`;
};

// Create a new user
export const createUser = (userData: Omit<User, 'id' | 'createdOn' | 'createdBy' | 'lastModifiedOn' | 'lastModifiedBy'>): User => {
  return {
    id: generateUserId(),
    ...userData,
    createdOn: new Date(),
    createdBy: 'current-user', // In a real app, this would be the current user's ID
    lastModifiedOn: null,
    lastModifiedBy: null,
    applications: userData.applications || []
  };
};

// Update an existing user
export const updateUser = (user: User): User => {
  return {
    ...user,
    lastModifiedOn: new Date(),
    lastModifiedBy: 'current-user' // In a real app, this would be the current user's ID
  };
};

// Get access level options - now deprecated, use getApplicationRoles instead
export const getAccessLevels = (): string[] => {
  return ['Viewer', 'Editor', 'Admin'];
};

// Get role options for the user
export const getRoles = (): string[] => {
  return ['Admin', 'Manager', 'Analyst', 'Developer', 'Auditor', 'User'];
};

// Get roles specific to an application
export const getApplicationRoles = (applicationId: string): string[] => {
  const app = applications.find(app => app.id === applicationId);
  return app?.roles || ['Viewer', 'Editor', 'Admin']; // Default if app not found
};

// Get department options - deprecated but kept for data consistency
export const getDepartments = (): string[] => {
  return ['Finance', 'Risk', 'Compliance', 'IT', 'Operations', 'Management'];
};