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
  isRequired?: boolean;
  appId?: number;
  isActive?: boolean;
  updatedBy?: string;
  updatedOn?: string;
  ignore?: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  parameters: Parameter[];
  description?: string;
  isActive?: boolean;
  updatedBy?: string;
  updatedOn?: string;
}

export interface Attestation {
  id: string;
  name: string;
  description: string;
  text: string;
  isActive?: boolean;
  updatedBy?: string;
  updatedOn?: string;
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
  isAuto?: boolean;
  requiresAttestation?: boolean;
  requiresUpload?: boolean;
  requiresApproval?: boolean;
  isActive?: boolean;
  isAdhoc?: boolean;
  isAlteryx?: boolean;
  updatedBy?: string;
  updatedOn?: string;
  dependencies?: string[]; // IDs of dependent sub-stages
}

export interface StageConfig {
  id: string;
  name: string;
  description?: string;
  subStages: SubStageConfig[];
  order: number;
  isActive?: boolean;
  updatedBy?: string;
  updatedOn?: string;
}

import {
  WorkflowStage,
  WorkflowSubstage,
  WorkflowParam,
  WorkflowAttest,
  WorkflowEmail,
  WorkflowProcess,
  WorkflowProcessAttest,
  WorkflowProcessDep,
  WorkflowProcessFile,
  WorkflowProcessParam
} from './db-types';

// Database-aligned types for metadata management
export interface DBStage {
  stageId: number;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  updatedBy?: string;
  updatedOn?: string;
  appId?: number;
}

export interface DBSubStage {
  subStageId: number;
  stageId: number;
  name: string;
  description?: string;
  isAuto: boolean;
  requiresAttestation: boolean;
  requiresUpload: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  isAdhoc: boolean;
  isAlteryx: boolean;
  expectedDuration: number;
  order: number;
  updatedBy?: string;
  updatedOn?: string;
  componentName?: string;
  serviceLine?: string;
  defaultStage?: number;
  paramMapping?: string;
  attestationMapping?: string;
  entitlementMapping?: number;
  templateId?: number;
  sendEmailAtStart?: boolean;
  followUp?: boolean;
}

export interface DBParameter {
  paramId: number;
  appId?: number;
  name: string;
  value: string;
  description?: string;
  isRequired: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  isActive: boolean;
  updatedBy?: string;
  updatedOn?: string;
  ignore?: boolean;
  paramType?: string;
}

export interface DBAttestation {
  attestationId: number;
  name: string;
  description: string;
  text: string;
  isActive: boolean;
  updatedBy?: string;
  updatedOn?: string;
  type?: string;
}

export interface DBEmailTemplate {
  templateId: number;
  name: string;
  subject: string;
  body: string;
  description?: string;
  isActive: boolean;
  updatedBy?: string;
  updatedOn?: string;
  parameters?: DBParameter[];
  isHtml?: boolean;
  fromEmailList?: string;
}

// Process-related types
export interface DBWorkflowProcess {
  workflowProcessId: number;
  workflowId: number;
  substageId: number;
  status: string;
  startDate?: Date | string;
  endDate?: Date | string;
  updatedBy?: string;
  updatedOn?: Date | string;
  expectedEndDate?: Date | string;
  comments?: string;
  dependencies?: DBWorkflowProcessDep[];
  parameters?: DBWorkflowProcessParam[];
  attestations?: DBWorkflowProcessAttest[];
  files?: DBWorkflowProcessFile[];
}

export interface DBWorkflowProcessDep {
  workflowProcessId: number;
  dependencySubstageId: number;
  status: string;
  updatedBy?: string;
  updatedOn?: Date | string;
}

export interface DBWorkflowProcessParam {
  workflowProcessId: number;
  name: string;
  value?: string;
}

export interface DBWorkflowProcessAttest {
  workflowProcessId: number;
  attestationId: number;
  status: string;
  attestedBy?: string;
  attestedOn?: Date | string;
}

export interface DBWorkflowProcessFile {
  workflowProcessId: number;
  name: string;
  paramType: string;
  value?: string;
  required?: string;
  status: string;
  description?: string;
  expectedValue?: string;
  createdOn?: Date | string;
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