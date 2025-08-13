export interface TollgateProcess {
  workflowProcessId: number;
  workflowSubstage: {
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
  };
  workflowStage: {
    stageId: number;
    workflowApplication: {
      appId: number;
    };
    name: string;
    updatedBy: string;
    updatedOn: string;
  };
  workflowApplication: {
    appId: number;
  };
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