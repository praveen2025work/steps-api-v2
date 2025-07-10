import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/services/workflowService';
import { toast } from '@/components/ui/use-toast';

// Types for metadata management
interface MetadataApplication {
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

interface MetadataStage {
  stageId: number;
  workflowApplication: { appId: number };
  name: string;
  updatedby: string;
  updatedon: string;
  description?: string;
}

interface CreateStageRequest {
  stageId: null;
  name: string;
  updatedby: string;
  updatedon: null;
  workflowApplication: { appId: number };
  description: string;
}

interface UpdateStageRequest {
  stageId: number;
  name: string;
  updatedby: string;
  updatedon: null;
  workflowApplication: { appId: number };
  description: string;
}

// Parameter types
interface MetadataParam {
  paramId: number;
  name: string;
  paramType: string;
  description: string;
  updatedby: string;
  updatedon: string;
  value?: string;
}

interface CreateParamRequest {
  paramId: null;
  name: string;
  description: string;
  paramType: string;
  updatedby: string;
  updatedon: null;
  value: null;
}

interface UpdateParamRequest {
  paramId: number;
  name: string;
  description: string;
  paramType: string;
  updatedby: string;
  updatedon: null;
  value?: string;
}

// Attestation types
interface MetadataAttestation {
  attestationId: number;
  name: string;
  type: string;
  updatedby: string;
  updatedon: string;
}

interface CreateAttestationRequest {
  attestationId: null;
  name: string;
  type: string;
  updatedby: string;
  updatedon: null;
}

interface UpdateAttestationRequest {
  attestationId: number;
  name: string;
  type: string;
  updatedby: string;
  updatedon: null;
}

// Email Template types
interface MetadataEmailTemplate {
  templateld: number;
  name: string;
  emailBody: string;
  ishtml: string;
  subject: string;
  fromEmailList: string;
}

interface CreateEmailTemplateRequest {
  templateld: null;
  name: string;
  emailBody: string;
  ishtml: string;
  subject: string;
  fromEmailList: string;
}

interface UpdateEmailTemplateRequest {
  templateld: number;
  name: string;
  emailBody: string;
  ishtml: string;
  subject: string;
  fromEmailList: string;
}

// Substage types
interface MetadataSubstage {
  substageId: number;
  name: string;
  componentname: string;
  defaultstage: number;
  attestationMapping: string;
  paramMapping: string;
  templateld: number;
  entitlementMapping: number;
  followUp: string;
  updatedby: string;
  updatedon: string;
  expectedduration?: string;
  expectedtime?: string;
  sendEmailAtStart?: string;
  servicelink?: string;
  substageAttestations?: any[];
}

interface CreateSubstageRequest {
  substageId: null;
  name: string;
  componentname: string;
  defaultstage: number;
  attestationMapping: string;
  paramMapping: string;
  templateld: number;
  entitlementMapping: number;
  expectedduration: string;
  expectedtime: string;
  followUp: string;
  sendEmailAtStart: string;
  servicelink: string;
  substageAttestations: any[];
  updatedby: string;
  updatedon: string;
}

interface UpdateSubstageRequest {
  substageId: number;
  name: string;
  componentname: string;
  defaultstage: number;
  attestationMapping: string;
  paramMapping: string;
  templateld: number;
  entitlementMapping: number;
  expectedduration: string;
  expectedtime: string;
  followUp: string;
  sendEmailAtStart: string;
  servicelink: string;
  substageAttestations: any[];
  updatedby: string;
  updatedon: string;
}

interface UseExtendedMetadataManagementReturn {
  // Data
  applications: MetadataApplication[];
  stages: Record<number, MetadataStage[]>;
  inProgressStatus: Record<number, boolean>;
  params: MetadataParam[];
  attestations: MetadataAttestation[];
  emailTemplates: MetadataEmailTemplate[];
  substages: Record<number, MetadataSubstage[]>;
  
  // Loading states
  loading: boolean;
  applicationsLoading: boolean;
  stagesLoading: Record<number, boolean>;
  inProgressLoading: Record<number, boolean>;
  paramsLoading: boolean;
  attestationsLoading: boolean;
  emailTemplatesLoading: boolean;
  substagesLoading: Record<number, boolean>;
  
  // Error states
  error: string | null;
  applicationsError: string | null;
  stagesError: Record<number, string | null>;
  inProgressError: Record<number, string | null>;
  paramsError: string | null;
  attestationsError: string | null;
  emailTemplatesError: string | null;
  substagesError: Record<number, string | null>;
  
  // Actions
  refreshApplications: () => Promise<void>;
  refreshStages: (appId: number) => Promise<void>;
  checkInProgress: (appId: number) => Promise<void>;
  createStage: (stageData: CreateStageRequest) => Promise<boolean>;
  updateStage: (stageId: number, stageData: UpdateStageRequest) => Promise<boolean>;
  
  // Parameter actions
  refreshParams: () => Promise<void>;
  createParam: (paramData: CreateParamRequest) => Promise<boolean>;
  updateParam: (paramId: number, paramData: UpdateParamRequest) => Promise<boolean>;
  
  // Attestation actions
  refreshAttestations: () => Promise<void>;
  createAttestation: (attestationData: CreateAttestationRequest) => Promise<boolean>;
  updateAttestation: (attestationId: number, attestationData: UpdateAttestationRequest) => Promise<boolean>;
  
  // Email template actions
  refreshEmailTemplates: () => Promise<void>;
  createEmailTemplate: (templateData: CreateEmailTemplateRequest) => Promise<boolean>;
  updateEmailTemplate: (templateId: number, templateData: UpdateEmailTemplateRequest) => Promise<boolean>;
  
  // Substage actions
  refreshSubstages: (stageId: number) => Promise<void>;
  createSubstage: (substageData: CreateSubstageRequest, forceStartDesc?: string, reRunDesc?: string) => Promise<boolean>;
  updateSubstage: (substageId: number, substageData: UpdateSubstageRequest, forceStartDesc?: string, reRunDesc?: string) => Promise<boolean>;
  
  refreshAll: () => Promise<void>;
}

export const useExtendedMetadataManagement = (): UseExtendedMetadataManagementReturn => {
  // Data states
  const [applications, setApplications] = useState<MetadataApplication[]>([]);
  const [stages, setStages] = useState<Record<number, MetadataStage[]>>({});
  const [inProgressStatus, setInProgressStatus] = useState<Record<number, boolean>>({});
  const [params, setParams] = useState<MetadataParam[]>([]);
  const [attestations, setAttestations] = useState<MetadataAttestation[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<MetadataEmailTemplate[]>([]);
  const [substages, setSubstages] = useState<Record<number, MetadataSubstage[]>>({});
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [stagesLoading, setStagesLoading] = useState<Record<number, boolean>>({});
  const [inProgressLoading, setInProgressLoading] = useState<Record<number, boolean>>({});
  const [paramsLoading, setParamsLoading] = useState(false);
  const [attestationsLoading, setAttestationsLoading] = useState(false);
  const [emailTemplatesLoading, setEmailTemplatesLoading] = useState(false);
  const [substagesLoading, setSubstagesLoading] = useState<Record<number, boolean>>({});
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [stagesError, setStagesError] = useState<Record<number, string | null>>({});
  const [inProgressError, setInProgressError] = useState<Record<number, string | null>>({});
  const [paramsError, setParamsError] = useState<string | null>(null);
  const [attestationsError, setAttestationsError] = useState<string | null>(null);
  const [emailTemplatesError, setEmailTemplatesError] = useState<string | null>(null);
  const [substagesError, setSubstagesError] = useState<Record<number, string | null>>({});

  // Refresh applications
  const refreshApplications = useCallback(async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    
    try {
      const response = await workflowService.getMetadataApplications();
      
      if (response.success) {
        setApplications(response.data);
        console.log('[useExtendedMetadataManagement] Applications loaded:', response.data.length);
      } else {
        const errorMsg = response.error || 'Failed to fetch applications';
        setApplicationsError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error loading applications:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch applications';
      setApplicationsError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception loading applications:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  // Refresh stages for a specific application
  const refreshStages = useCallback(async (appId: number) => {
    setStagesLoading(prev => ({ ...prev, [appId]: true }));
    setStagesError(prev => ({ ...prev, [appId]: null }));
    
    try {
      const response = await workflowService.getStagesByApplicationId(appId);
      
      if (response.success) {
        setStages(prev => ({ ...prev, [appId]: response.data }));
        console.log('[useExtendedMetadataManagement] Stages loaded for app', appId, ':', response.data.length);
      } else {
        const errorMsg = response.error || `Failed to fetch stages for application ${appId}`;
        setStagesError(prev => ({ ...prev, [appId]: errorMsg }));
        console.error('[useExtendedMetadataManagement] Error loading stages for app', appId, ':', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || `Failed to fetch stages for application ${appId}`;
      setStagesError(prev => ({ ...prev, [appId]: errorMsg }));
      console.error('[useExtendedMetadataManagement] Exception loading stages for app', appId, ':', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setStagesLoading(prev => ({ ...prev, [appId]: false }));
    }
  }, []);

  // Check if application is in progress
  const checkInProgress = useCallback(async (appId: number) => {
    setInProgressLoading(prev => ({ ...prev, [appId]: true }));
    setInProgressError(prev => ({ ...prev, [appId]: null }));
    
    try {
      const response = await workflowService.checkApplicationInProgress(appId);
      
      if (response.success) {
        setInProgressStatus(prev => ({ ...prev, [appId]: response.data }));
        console.log('[useExtendedMetadataManagement] In progress status for app', appId, ':', response.data);
      } else {
        const errorMsg = response.error || `Failed to check in progress status for application ${appId}`;
        setInProgressError(prev => ({ ...prev, [appId]: errorMsg }));
        console.error('[useExtendedMetadataManagement] Error checking in progress for app', appId, ':', errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || `Failed to check in progress status for application ${appId}`;
      setInProgressError(prev => ({ ...prev, [appId]: errorMsg }));
      console.error('[useExtendedMetadataManagement] Exception checking in progress for app', appId, ':', error);
    } finally {
      setInProgressLoading(prev => ({ ...prev, [appId]: false }));
    }
  }, []);

  // Create new stage
  const createStage = useCallback(async (stageData: CreateStageRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.createStage(stageData);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Stage created with ID:', response.data);
        toast({
          title: "Success",
          description: `Stage "${stageData.name}" has been created successfully.`
        });
        
        // Refresh stages for the application
        await refreshStages(stageData.workflowApplication.appId);
        return true;
      } else {
        const errorMsg = response.error || 'Failed to create stage';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error creating stage:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to create stage';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception creating stage:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshStages]);

  // Update existing stage
  const updateStage = useCallback(async (stageId: number, stageData: UpdateStageRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.updateStage(stageId, stageData);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Stage updated with ID:', response.data);
        toast({
          title: "Success",
          description: `Stage "${stageData.name}" has been updated successfully.`
        });
        
        // Refresh stages for the application
        await refreshStages(stageData.workflowApplication.appId);
        return true;
      } else {
        const errorMsg = response.error || 'Failed to update stage';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error updating stage:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update stage';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception updating stage:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshStages]);

  // ===== PARAMETER METHODS =====

  // Refresh parameters
  const refreshParams = useCallback(async () => {
    setParamsLoading(true);
    setParamsError(null);
    
    try {
      const response = await workflowService.getMetadataParams();
      
      if (response.success) {
        setParams(response.data);
        console.log('[useExtendedMetadataManagement] Parameters loaded:', response.data.length);
      } else {
        const errorMsg = response.error || 'Failed to fetch parameters';
        setParamsError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error loading parameters:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch parameters';
      setParamsError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception loading parameters:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setParamsLoading(false);
    }
  }, []);

  // Create new parameter
  const createParam = useCallback(async (paramData: CreateParamRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.createParam(paramData);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Parameter created with ID:', response.data);
        toast({
          title: "Success",
          description: `Parameter "${paramData.name}" has been created successfully.`
        });
        
        // Refresh parameters
        await refreshParams();
        return true;
      } else {
        const errorMsg = response.error || 'Failed to create parameter';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error creating parameter:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to create parameter';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception creating parameter:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshParams]);

  // Update existing parameter
  const updateParam = useCallback(async (paramId: number, paramData: UpdateParamRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.updateParam(paramId, paramData);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Parameter updated with ID:', response.data);
        toast({
          title: "Success",
          description: `Parameter "${paramData.name}" has been updated successfully.`
        });
        
        // Refresh parameters
        await refreshParams();
        return true;
      } else {
        const errorMsg = response.error || 'Failed to update parameter';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error updating parameter:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update parameter';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception updating parameter:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshParams]);

  // ===== ATTESTATION METHODS =====

  // Refresh attestations
  const refreshAttestations = useCallback(async () => {
    setAttestationsLoading(true);
    setAttestationsError(null);
    
    try {
      const response = await workflowService.getMetadataAttestations();
      
      if (response.success) {
        setAttestations(response.data);
        console.log('[useExtendedMetadataManagement] Attestations loaded:', response.data.length);
      } else {
        const errorMsg = response.error || 'Failed to fetch attestations';
        setAttestationsError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error loading attestations:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch attestations';
      setAttestationsError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception loading attestations:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setAttestationsLoading(false);
    }
  }, []);

  // Create new attestation
  const createAttestation = useCallback(async (attestationData: CreateAttestationRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.createAttestation(attestationData);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Attestation created with ID:', response.data);
        toast({
          title: "Success",
          description: `Attestation "${attestationData.name}" has been created successfully.`
        });
        
        // Refresh attestations
        await refreshAttestations();
        return true;
      } else {
        const errorMsg = response.error || 'Failed to create attestation';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error creating attestation:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to create attestation';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception creating attestation:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshAttestations]);

  // Update existing attestation
  const updateAttestation = useCallback(async (attestationId: number, attestationData: UpdateAttestationRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.updateAttestation(attestationId, attestationData);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Attestation updated with ID:', response.data);
        toast({
          title: "Success",
          description: `Attestation "${attestationData.name}" has been updated successfully.`
        });
        
        // Refresh attestations
        await refreshAttestations();
        return true;
      } else {
        const errorMsg = response.error || 'Failed to update attestation';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error updating attestation:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update attestation';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception updating attestation:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshAttestations]);

  // ===== EMAIL TEMPLATE METHODS =====

  // Refresh email templates
  const refreshEmailTemplates = useCallback(async () => {
    setEmailTemplatesLoading(true);
    setEmailTemplatesError(null);
    
    try {
      const response = await workflowService.getMetadataEmailTemplates();
      
      if (response.success) {
        setEmailTemplates(response.data);
        console.log('[useExtendedMetadataManagement] Email templates loaded:', response.data.length);
      } else {
        const errorMsg = response.error || 'Failed to fetch email templates';
        setEmailTemplatesError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error loading email templates:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch email templates';
      setEmailTemplatesError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception loading email templates:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setEmailTemplatesLoading(false);
    }
  }, []);

  // Create new email template
  const createEmailTemplate = useCallback(async (templateData: CreateEmailTemplateRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.createEmailTemplate(templateData);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Email template created with ID:', response.data);
        toast({
          title: "Success",
          description: `Email template "${templateData.name}" has been created successfully.`
        });
        
        // Refresh email templates
        await refreshEmailTemplates();
        return true;
      } else {
        const errorMsg = response.error || 'Failed to create email template';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error creating email template:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to create email template';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception creating email template:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshEmailTemplates]);

  // Update existing email template
  const updateEmailTemplate = useCallback(async (templateId: number, templateData: UpdateEmailTemplateRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.updateEmailTemplate(templateId, templateData);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Email template updated with ID:', response.data);
        toast({
          title: "Success",
          description: `Email template "${templateData.name}" has been updated successfully.`
        });
        
        // Refresh email templates
        await refreshEmailTemplates();
        return true;
      } else {
        const errorMsg = response.error || 'Failed to update email template';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error updating email template:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update email template';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception updating email template:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshEmailTemplates]);

  // ===== SUBSTAGE METHODS =====

  // Refresh substages for a specific stage
  const refreshSubstages = useCallback(async (stageId: number) => {
    setSubstagesLoading(prev => ({ ...prev, [stageId]: true }));
    setSubstagesError(prev => ({ ...prev, [stageId]: null }));
    
    try {
      const response = await workflowService.getSubstagesByStageId(stageId);
      
      if (response.success) {
        setSubstages(prev => ({ ...prev, [stageId]: response.data }));
        console.log('[useExtendedMetadataManagement] Substages loaded for stage', stageId, ':', response.data.length);
      } else {
        const errorMsg = response.error || `Failed to fetch substages for stage ${stageId}`;
        setSubstagesError(prev => ({ ...prev, [stageId]: errorMsg }));
        console.error('[useExtendedMetadataManagement] Error loading substages for stage', stageId, ':', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || `Failed to fetch substages for stage ${stageId}`;
      setSubstagesError(prev => ({ ...prev, [stageId]: errorMsg }));
      console.error('[useExtendedMetadataManagement] Exception loading substages for stage', stageId, ':', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setSubstagesLoading(prev => ({ ...prev, [stageId]: false }));
    }
  }, []);

  // Create new substage
  const createSubstage = useCallback(async (substageData: CreateSubstageRequest, forceStartDesc: string = 'force start', reRunDesc: string = 'rerun'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.createSubstage(substageData, forceStartDesc, reRunDesc);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Substage created with ID:', response.data);
        toast({
          title: "Success",
          description: `Substage "${substageData.name}" has been created successfully.`
        });
        
        // Refresh substages for the stage
        await refreshSubstages(substageData.defaultstage);
        return true;
      } else {
        const errorMsg = response.error || 'Failed to create substage';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error creating substage:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to create substage';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception creating substage:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshSubstages]);

  // Update existing substage
  const updateSubstage = useCallback(async (substageId: number, substageData: UpdateSubstageRequest, forceStartDesc: string = 'force start', reRunDesc: string = 'rerun'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.updateSubstage(substageId, substageData, forceStartDesc, reRunDesc);
      
      if (response.success) {
        console.log('[useExtendedMetadataManagement] Substage updated with ID:', response.data);
        toast({
          title: "Success",
          description: `Substage "${substageData.name}" has been updated successfully.`
        });
        
        // Refresh substages for the stage
        await refreshSubstages(substageData.defaultstage);
        return true;
      } else {
        const errorMsg = response.error || 'Failed to update substage';
        setError(errorMsg);
        console.error('[useExtendedMetadataManagement] Error updating substage:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update substage';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception updating substage:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshSubstages]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all base data
      await Promise.all([
        refreshApplications(),
        refreshParams(),
        refreshAttestations(),
        refreshEmailTemplates()
      ]);
      
      console.log('[useExtendedMetadataManagement] All data refreshed');
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to refresh data';
      setError(errorMsg);
      console.error('[useExtendedMetadataManagement] Exception refreshing all data:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [refreshApplications, refreshParams, refreshAttestations, refreshEmailTemplates]);

  // Load initial data
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // Data
    applications,
    stages,
    inProgressStatus,
    params,
    attestations,
    emailTemplates,
    substages,
    
    // Loading states
    loading,
    applicationsLoading,
    stagesLoading,
    inProgressLoading,
    paramsLoading,
    attestationsLoading,
    emailTemplatesLoading,
    substagesLoading,
    
    // Error states
    error,
    applicationsError,
    stagesError,
    inProgressError,
    paramsError,
    attestationsError,
    emailTemplatesError,
    substagesError,
    
    // Actions
    refreshApplications,
    refreshStages,
    checkInProgress,
    createStage,
    updateStage,
    
    // Parameter actions
    refreshParams,
    createParam,
    updateParam,
    
    // Attestation actions
    refreshAttestations,
    createAttestation,
    updateAttestation,
    
    // Email template actions
    refreshEmailTemplates,
    createEmailTemplate,
    updateEmailTemplate,
    
    // Substage actions
    refreshSubstages,
    createSubstage,
    updateSubstage,
    
    refreshAll
  };
};