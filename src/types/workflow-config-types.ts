// Workflow Configuration API Types

// Java API Response Types
export interface WorkflowApp {
  appId: number;
  name: string;
  category: string;
  description: string;
  updatedby: string;
  updatedon: string;
  isactive: number;
  entitlementMapping: number;
  islockingenabled: number;
  lockingrole: number;
  cronexpression: string;
  startdate: number;
  expirydate: number;
  useruncalendar: number;
  rundateoffset: number;
  isrunonweekdayonly: number;
}

// .NET API Response Types
export interface WorkflowInstance {
  appId: number;
  configId: string;
  configName: string;
}

// Metadata Response Types
export interface WorkflowMetadata {
  WorkflowApplication: WorkflowApp[];
  WorkflowEmail: WorkflowEmailTemplate[];
  WorkflowSubstage: WorkflowSubstage[];
  WorkflowStage: WorkflowStage[];
  WorkflowAttest: WorkflowAttestation[];
  WorkflowParams: WorkflowParameter[];
}

export interface WorkflowEmailTemplate {
  templateId: number;
  name: string;
  emailBody: string;
  ishtml: string;
  description?: string;
  updatedby: string;
  updatedon: string;
  subject: string;
  fromEmailList: string;
}

export interface WorkflowSubstage {
  substageId: number;
  name: string;
  defaultstage: number;
  attestationMapping?: string;
  updatedby: string;
  updatedon: string;
  entitlementMapping: number;
  followUp: string;
}

export interface WorkflowStage {
  stageId: number;
  workflowApplication: number;
  name: string;
  updatedby: string;
  updatedon: string;
}

export interface WorkflowAttestation {
  attestationId: number;
  name: string;
  type: string;
  description?: string;
  updatedby: string;
  updatedon: string;
}

export interface WorkflowParameter {
  paramId: number;
  name: string;
  paramType: string;
  description?: string;
  updatedby: string;
  updatedon: string;
}

// Configuration Response Types
export interface WorkflowAppConfig {
  workflowAppConfigId: number;
  adhoc: string;
  appGroupId: number | string;
  approval: string;
  attest: string;
  auto: string;
  isactive: string;
  isalteryx: string;
  substageSeq: number;
  updatedby: string;
  updatedon: string;
  upload: string;
  workflowApplication: number;
  workflowStage: WorkflowStageRef | number;
  workflowSubstage: WorkflowSubstageRef;
  workflowAppConfigDeps?: WorkflowAppConfigDep[];
  workflowAppConfigFiles?: WorkflowAppConfigFile[];
  workflowAppConfigParams?: WorkflowAppConfigParam[];
  workflowAttests?: WorkflowAttestation[];
}

export interface WorkflowStageRef {
  stageId: number;
  name: string;
  updatedby: string;
  updatedon: string;
}

export interface WorkflowSubstageRef {
  substageId: number;
  name: string;
  defaultstage: number;
  attestationMapping?: string;
  entitlementMapping: number;
  followUp: string;
  updatedby: string;
  updatedon: string;
  expectedduration?: number;
  expectedtime?: string;
  paramMapping?: string;
  servicelink?: string;
}

export interface WorkflowAppConfigDep {
  id: {
    workflowAppConfigId: number;
    dependencySubstageId: number;
  };
}

export interface WorkflowAppConfigFile {
  id: {
    workflowAppConfigId: number;
    name: string;
    paramType: string;
  };
  name: string;
  paramType: string;
  required: string;
  value: string;
  description: string;
  emailFile: string;
  fileUpload: string;
}

export interface WorkflowAppConfigParam {
  id: {
    workflowAppConfigId: number;
    name: string;
  };
  name: string;
  value: string;
}

// Save/Update Payload Types
export interface WorkflowConfigSavePayload {
  workflowAppConfigId: number | null;
  appGroupId: number | string;
  adhoc: string;
  approval: string;
  attest: string;
  auto: string;
  isActive: boolean;
  isAdhoc?: boolean | null;
  isAlteryx: boolean;
  isApproval?: boolean | null;
  isAttest: boolean;
  isAuto?: boolean | null;
  isUpload: boolean;
  isactive: string;
  stageName: string;
  subStageName: string;
  substageSeq: number;
  substage_dependency?: any;
  updatedby: string;
  upload: string;
  workflowAppConfigDeps: WorkflowAppConfigDepPayload[];
  workflowAppConfigFiles: WorkflowAppConfigFilePayload[];
  workflowAppConfigParams: WorkflowAppConfigParamPayload[];
  workflowApplication: {
    appId: number;
    name: string;
    description: string;
    updatedby: string;
  };
  workflowStage: {
    stageId: number;
    name: string;
    updatedby: string;
  };
  workflowSubstage: {
    substageId: number;
    name: string;
    servicelink?: string | null;
    defaultstage: number;
  };
  workflowAttests: WorkflowAttestation[];
}

export interface WorkflowAppConfigDepPayload {
  id: {
    workflowAppConfigId: number | null;
    dependencySubstageId: number;
  };
}

export interface WorkflowAppConfigFilePayload {
  id: {
    workflowAppConfigId: number | null;
    name: string;
    paramType: string;
  };
  value: string;
  description: string;
  emailFile: string;
  fileUpload: string;
  isEmailFile: boolean;
  isFileUpload: boolean;
  isRequired: boolean;
  required: string;
}

export interface WorkflowAppConfigParamPayload {
  id: {
    workflowTransactionid: number | null;
    name: string;
  };
  value: string;
}

// UI State Types
export interface WorkflowConfigState {
  selectedAppId: number | null;
  selectedConfigId: string | null;
  workflowApps: WorkflowApp[];
  workflowInstances: WorkflowInstance[];
  metadata: WorkflowMetadata | null;
  currentConfig: WorkflowAppConfig[];
  isLoading: boolean;
  error: string | null;
}

// Form Types for UI
export interface WorkflowConfigFormData {
  appId: number;
  configId: string;
  configName: string;
  stages: WorkflowStageFormData[];
}

export interface WorkflowStageFormData {
  stageId: number;
  stageName: string;
  substages: WorkflowSubstageFormData[];
}

export interface WorkflowSubstageFormData {
  substageId: number;
  substageName: string;
  sequence: number;
  isActive: boolean;
  isAuto: boolean;
  isAdhoc: boolean;
  isAlteryx: boolean;
  requiresApproval: boolean;
  requiresAttestation: boolean;
  requiresUpload: boolean;
  dependencies: number[];
  parameters: WorkflowParameterFormData[];
  files: WorkflowFileFormData[];
  attestations: number[];
}

export interface WorkflowParameterFormData {
  name: string;
  value: string;
}

export interface WorkflowFileFormData {
  name: string;
  value: string;
  description: string;
  required: boolean;
  emailFile: boolean;
  fileUpload: boolean;
}