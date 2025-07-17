// Workflow Dashboard API Types
// Based on the comprehensive API endpoints provided

// ===== WORKFLOW APPLICATION TYPES =====

export interface WorkflowApplication {
  appId: number;
  previousLevel: number;
  currentLevel: number;
  nextLevel: number;
  isUsedForWorkflowInstance: boolean;
  percentageCompleted: number;
  isConfigured: boolean;
  isWeekly: string | null;
  configType: string; // "APPLICATION"
  configId: string;
  configName: string;
}

// ===== WORKFLOW NODE TYPES =====

export interface WorkflowNode {
  appId: number;
  previousLevel: number;
  currentLevel: number;
  nextLevel: number;
  isUsedForWorkflowInstance: boolean;
  percentageCompleted: number;
  isConfigured: boolean;
  isWeekly: string; // "Y" | "N"
  configType: string; // "Asset Class", etc.
  configId: string;
  configName: string;
}

// ===== WORKFLOW SUMMARY TYPES =====

export interface WorkflowProcessData {
  app_Id: number;
  app_Group_Id: number;
  stage_Id: number;
  subStage_Id: number;
  subStage_Seq: number;
  stage_Name: string;
  subStage_Name: string;
  serviceLink: string;
  auto: string; // "y" | "n"
  adhoc: string; // "Y" | "N"
  isAlteryx: string; // "Y" | "N"
  upload: string; // "Y" | "N"
  attest: string; // "Y" | "N"
  workflow_Process_Id: number;
  workflow_App_Config_Id: number;
  businessdate: string;
  status: string; // "FAILED", "COMPLETED", "NOT STARTED", etc.
  updatedBy: string;
  updatedon: string;
  attestedBy: string | null;
  attestedon: string | null;
  completedBy: string | null;
  completedon: string | null;
  duration: number;
  dependency_Substage_Id: number | null;
  upload_Allowed: string; // "Y" | "N"
  download_Allowed: string; // "Y" | "N"
  attest_Reqd: string; // "Y" | "N"
  dep_Sub_Stage_Seq: number | null;
  userCommentary: string | null;
  skipCommentary: string | null;
  hasDependencies: string; // "y" | "n"
  componentName: string | null;
  message: string | null;
  producer: number;
  approver: number;
  entitlementMapping: number;
  isRTB: boolean;
  isLocked: string | null;
  lockedBy: string | null;
  lockedOn: string | null;
  approval: string; // "Y" | "N"
  isActive: string; // "y" | "n"
  percentage: number;
  resolvedComponentName: string | null;
  partialComplete: string; // "NA", etc.
}

export interface WorkflowFileData {
  workflow_Process_Id: number;
  workflow_App_Config_Id: number;
  businessdate: string;
  name: string | null;
  param_Type: string | null;
  value: string | null;
  required: string | null;
  expectedValue: string | null;
  file_Upload: string | null;
  email_File: string | null;
}

export interface WorkflowDependencyData {
  workflow_Process_Id: number;
  workflow_App_Config_Id: number;
  businessdate: string;
  dependency_Substage_Id: number;
  dep_Status: string | null; // "NOT STARTED", etc.
  dep_UpdatedBy: string | null;
  dep_Updatedon: string | null;
}

export interface WorkflowAttestationData {
  workflow_Process_Id: number;
  workflow_App_Config_Id: number;
  businessdate: string;
  attestation_Id: number;
  attest_Status: string | null;
  attest_AttestedOn: string | null;
  attest_Name: string | null;
  attest_Description: string | null;
}

export interface WorkflowDailyParam {
  param_Id: number;
  businessDate: string;
  app_Group_Id: number;
  app_Id: number;
  name: string;
  value: string;
  comments: string | null;
  isEditable: string; // "Y" | "N"
  updatedBy: string;
  updatedOn: string;
}

export interface WorkflowApplicationInfo {
  appId: number;
  name: string;
  category: string;
  service_URL: string | null;
  description: string;
  isActive: string; // "*" for active, "" for inactive
  updatedBy: string;
  updatedOn: string;
  entitlementMapping: number;
  isLockingEnabled: boolean;
  lockingRole: number;
  allowLock: boolean;
  cronExpression: string;
  startDate: string;
  expiryDate: string;
}

export interface WorkflowAppParam {
  param_Id: number;
  app_Id: number;
  name: string;
  value: string;
  updatedBy: string;
  updatedOn: string;
}

export interface WorkflowProcessParam {
  workflow_Process_Id: number;
  substage_Name: string;
  parameterName: string;
  parameterValue: string;
  resolvedParameterName: string;
  resolvedParameterValue: string;
}

export interface WorkflowSummary {
  processData: WorkflowProcessData[];
  fileData: WorkflowFileData[];
  dependencyData: WorkflowDependencyData[];
  attestationData: WorkflowAttestationData[];
  dailyParams: WorkflowDailyParam[];
  applications: WorkflowApplicationInfo[];
  appParams: WorkflowAppParam[];
  processParams: WorkflowProcessParam[];
}

// ===== API RESPONSE TYPES =====

export interface WorkflowDashboardApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
  environment?: string;
}

// ===== REQUEST PARAMETER TYPES =====

export interface GetWorkflowApplicationsParams {
  date: string; // Format: "14 Jul 2025"
}

export interface GetWorkflowNodesParams {
  date: string;
  appId: number;
  configId: string;
  currentLevel: number;
  nextLevel: number;
}

export interface GetWorkflowSummaryParams {
  date: string;
  configId: string;
  appId: number;
}

// ===== UTILITY TYPES =====

export type WorkflowStatus = 
  | 'NOT STARTED'
  | 'IN PROGRESS' 
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'PENDING APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export type WorkflowAutoFlag = 'y' | 'n' | 'Y' | 'N';

export type WorkflowActiveFlag = 'y' | 'n' | 'Y' | 'N' | '*' | '';

// ===== DASHBOARD DISPLAY TYPES =====

export interface WorkflowApplicationSummary {
  appId: number;
  appName: string;
  category: string;
  totalProcesses: number;
  completedProcesses: number;
  failedProcesses: number;
  inProgressProcesses: number;
  percentageCompleted: number;
  lastUpdated: string;
  status: WorkflowStatus;
  isActive: boolean;
}

export interface WorkflowNodeSummary {
  configId: string;
  configName: string;
  configType: string;
  appId: number;
  currentLevel: number;
  nextLevel: number;
  percentageCompleted: number;
  isConfigured: boolean;
  isWeekly: boolean;
}

export interface WorkflowProcessSummary {
  processId: number;
  stageName: string;
  subStageName: string;
  status: WorkflowStatus;
  businessDate: string;
  duration: number;
  isAuto: boolean;
  hasUpload: boolean;
  hasAttestation: boolean;
  hasDependencies: boolean;
  updatedBy: string;
  updatedOn: string;
  message?: string;
  percentage: number;
}

// ===== FILTER AND SEARCH TYPES =====

export interface WorkflowDashboardFilters {
  applicationIds?: number[];
  statuses?: WorkflowStatus[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  categories?: string[];
  isAutoOnly?: boolean;
  hasFailuresOnly?: boolean;
}

export interface WorkflowSearchCriteria {
  searchTerm?: string;
  searchFields?: ('appName' | 'stageName' | 'subStageName' | 'status')[];
  filters?: WorkflowDashboardFilters;
  sortBy?: 'appName' | 'status' | 'updatedOn' | 'percentage';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  pageNumber?: number;
}

// ===== DASHBOARD CONFIGURATION TYPES =====

export interface WorkflowDashboardConfig {
  refreshInterval: number; // in seconds
  defaultDateRange: number; // in days
  showCompletedProcesses: boolean;
  showAutoProcessesOnly: boolean;
  enableRealTimeUpdates: boolean;
  defaultView: 'applications' | 'processes' | 'hierarchy';
  columnsToShow: string[];
  alertThresholds: {
    failureRate: number; // percentage
    processingTime: number; // in minutes
  };
}

// ===== MOCK DATA TYPES =====

export interface MockWorkflowData {
  applications: WorkflowApplication[];
  nodes: Record<string, WorkflowNode[]>; // keyed by "appId-configId-currentLevel-nextLevel"
  summaries: Record<string, WorkflowSummary>; // keyed by "date-configId-appId"
}