// Types for role assignment functionality based on the provided API specifications

// Response from GET /api/WF/GetWorkfLowUniqueRoles
export interface WorkflowUniqueRole {
  configId: string;
  configName: string;
}

// Request/Response for POST /api/nplaccess
export interface WorkflowNplAccess {
  accessId: number | null;
  appId: number;
  appGroupId: string;
  roleId: number;
  username: string;
  businessDate: string;
  updatedBy: string;
  updatedOn: string | null;
  createdBy: string | null;
  createdOn: string | null;
}

export interface SystemEntitlements {
  [roleName: string]: number;
}

export interface UserEntitlements {
  [roleName: string]: number;
}

export interface NplAccessRequest {
  workflowNplAccess: WorkflowNplAccess;
  systemEntitlements: SystemEntitlements;
  userEntitlements: UserEntitlements;
}

// Response from GET /api/nplaccess
export interface NplAccessResponse {
  accessId: number;
  appId: number;
  appGroupId: string;
  roleId: number;
  businessDate: string;
  username: string;
  createdBy: string;
  createdOn: string;
  updatedBy?: string;
  updatedOn?: string;
}

// Response from GET /api/process/tollgate/{appId}/{appGroupId}/{businessDate}
export interface WorkflowSubstage {
  substageId: number;
  name: string;
  defaultStage: number;
  paramMapping: string;
  attestationMapping: string;
  updatedBy: string;
  updatedOn: string;
  entitlementMapping: number;
  sendEmailAtStart: string;
  followUp: string;
}

export interface WorkflowStage {
  stageId: number;
  workflowApplication: { appId: number };
  name: string;
  updatedBy: string;
  updatedOn: string;
}

export interface WorkflowApplication {
  appId: number;
}

export interface TollgateProcessResponse {
  workflowProcessId: number;
  workflowSubstage: WorkflowSubstage;
  workflowStage: WorkflowStage;
  workflowApplication: WorkflowApplication;
  status: string;
  businessDate: string;
  workflowAppConfigId: number;
  appGroupId: string;
  depSubStageSeq: number;
  auto: string;
  attest: string;
  upload: string;
  updatedBy: string;
  updatedOn: string;
  approval: string;
  isActive: string;
  adhoc: string;
  isAlteryx: string;
}

// Combined types for role assignment management
export interface RoleAssignmentData {
  availableRoles: WorkflowUniqueRole[];
  currentAssignments: NplAccessResponse[];
  systemEntitlements: SystemEntitlements;
  userEntitlements: UserEntitlements;
}

export interface TollgateReopenData {
  availableProcesses: TollgateProcessResponse[];
  selectedProcess?: TollgateProcessResponse;
}

// UI state types
export interface RoleAssignmentState {
  loading: boolean;
  error: string | null;
  data: RoleAssignmentData | null;
  tollgateData: TollgateReopenData | null;
  pendingChanges: Map<string, { action: 'assign' | 'unassign'; roleId: number; username: string }>;
}

// API response wrapper
export interface RoleAssignmentApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
  environment: string;
}