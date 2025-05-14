// Application Management Types
export interface ApplicationParameter {
  id: string;
  name: string;
  value: string;
  description?: string;
  isRequired: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date';
}

export interface Application {
  id: string;
  name: string;
  category: string;
  serviceUrl: string;
  description: string;
  superUserRole: string;
  cronSchedule: string;
  offset: number;
  lockingRequired: boolean;
  lockingRole: string;
  runOnWeekdays: boolean;
  parameters: ApplicationParameter[];
  hierarchyId?: string;
  holidayCalendarId?: string;
  runCalendarId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// Role Management Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  applications: string[]; // Application IDs
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// Holiday Calendar Types
export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
  isRecurring: boolean;
}

export interface HolidayCalendar {
  id: string;
  name: string;
  description: string;
  holidays: Holiday[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// Run Calendar Types
export interface RunCalendarEntry {
  id: string;
  date: string;
  isRunDay: boolean;
  description?: string;
}

export interface RunCalendar {
  id: string;
  name: string;
  description: string;
  entries: RunCalendarEntry[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// Hierarchy Management Types
export interface HierarchyLevel {
  id: string;
  name: string;
  columnName: string;
  parentHierarchyLevelId?: string;
  parentColumnName?: string;
  startFrom: boolean;
  lastNode: boolean;
  order: number;
}

export interface Hierarchy {
  id: string;
  name: string;
  description: string;
  levels: HierarchyLevel[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// Metadata Management Types
export interface Parameter {
  id: string;
  name: string;
  value: string;
  description?: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  parameters: Parameter[];
}

export interface Attestation {
  id: string;
  name: string;
  description: string;
  text: string;
}

export interface SubStageConfig {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'auto';
  parameters: Parameter[];
  emailTemplates: EmailTemplate[];
  attestations: Attestation[];
  expectedDuration: number;
  order: number;
}

export interface StageConfig {
  id: string;
  name: string;
  description?: string;
  subStages: SubStageConfig[];
  order: number;
}

// Workflow Instance Config Types
export interface WorkflowNodeConfig {
  id: string;
  nodeId: string; // ID of the hierarchy node
  nodeName: string;
  applicationId: string;
  stages: StageConfig[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// Admin Types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}

export interface WorkflowRun {
  id: string;
  applicationId: string;
  nodeId: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  errorMessage?: string;
  runBy: string;
}