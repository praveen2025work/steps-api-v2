// Database-aligned types based on the provided schema

// Workflow Process Tables
export interface WorkflowProcess {
  workflowProcessId: number;
  workflowId: number;
  substageId: number;
  status: string;
  startDate?: Date;
  endDate?: Date;
  updatedBy?: string;
  updatedOn?: Date;
  expectedEndDate?: Date;
  comments?: string;
}

export interface WorkflowProcessAttest {
  workflowProcessId: number;
  attestationId: number;
  status: string;
  attestedBy?: string;
  attestedOn?: Date;
}

export interface WorkflowProcessDep {
  workflowProcessId: number;
  dependencySubstageId: number;
  status: string;
  updatedBy?: string;
  updatedOn?: Date;
}

export interface WorkflowProcessFile {
  workflowProcessId: number;
  name: string;
  paramType: string;
  value?: string;
  required?: string; // 'Y' or 'N'
  status: string;
  description?: string;
  expectedValue?: string;
  createdOn?: Date;
}

export interface WorkflowProcessParam {
  workflowProcessId: number;
  name: string;
  value?: string;
}

// Stage Management Tables
export interface WorkflowStage {
  stageId: number;
  name: string;
  appId: number;
  description?: string;
  updatedBy?: string;
  updatedOn?: Date;
}

export interface WorkflowSubstage {
  substageId: number;
  componentName?: string;
  serviceLine?: string;
  name: string;
  defaultStage: number;
  paramMapping?: string;
  attestationMapping?: string;
  updatedBy?: string;
  updatedOn?: Date;
  entitlementMapping?: number;
  templateId?: number;
  sendEmailAtStart?: string; // 'Y' or 'N'
  followUp?: string; // 'Y' or 'N'
  expectedTime?: string;
  expectedDuration?: number;
}

// Parameter Management Tables
export interface WorkflowParam {
  paramId: number;
  name: string;
  paramType?: string;
  description?: string;
  updatedBy?: string;
  updatedOn?: Date;
}

export interface WorkflowDailyParam {
  paramId: number;
  businessDate: Date;
  appGroupId?: number;
  appId: number;
  name: string;
  value: string;
  updatedBy?: string;
  updatedOn?: Date;
  isEditable?: string; // 'Y' or 'N'
  comments?: string;
}

export interface WorkflowGlobalParam {
  paramId: number;
  name: string;
  appGroupId: number;
  appId: number;
  value: string;
  updatedBy?: string;
  updatedOn?: Date;
  isEditable?: string; // 'Y' or 'N'
}

// Notification and Communication Tables
export interface WorkflowNotification {
  notificationId: number;
  appGroupId: number;
  appId: number;
  substageId: number;
  userId: string;
  updatedBy?: string;
  updatedOn?: Date;
}

export interface WorkflowEmail {
  templateId: number;
  name: string;
  emailBody?: string;
  isHtml?: string; // 'Y' or 'N'
  description?: string;
  updatedBy?: string;
  updatedOn?: Date;
  subject?: string;
  fromEmailList?: string;
}

// Utility and Status Tables
export interface WorkflowUtilityStatus {
  utilityId: number;
  appId: number;
  appGroupId?: number;
  type: string;
  calendarDate: Date;
  updatedOn: Date;
  updatedBy: string;
  status: string;
  filename: string;
  message: string;
  versionInfo: string;
  duration: number;
  createdBy?: string;
  isActive?: string; // 'Y' or 'N'
  approvedBy?: string;
  issue?: string;
}

// Attestation Management Table
export interface WorkflowAttest {
  attestationId: number;
  name: string;
  type: string;
  description?: string;
  updatedBy?: string;
  updatedOn?: Date;
}

// Revision Control Tables
export interface Revision {
  revId: number;
  revisionDate: Date;
}

export interface RevisionChange {
  revId: number;
  entityXml: string;
}

// Application Grouping Table
export interface WorkflowAppGrouping {
  appGroupId: number;
  groupName: string;
  description?: string;
  isActive: string; // 'Y' or 'N'
  createdBy?: string;
  createdOn: Date;
  updatedBy?: string;
  updatedOn?: Date;
}

// Application Table (inferred from foreign keys)
export interface WorkflowApplication {
  appId: number;
  name: string;
  // Other fields would be here
}