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

interface UseMetadataManagementReturn {
  // Data
  applications: MetadataApplication[];
  stages: Record<number, MetadataStage[]>;
  inProgressStatus: Record<number, boolean>;
  
  // Loading states
  loading: boolean;
  applicationsLoading: boolean;
  stagesLoading: Record<number, boolean>;
  inProgressLoading: Record<number, boolean>;
  
  // Error states
  error: string | null;
  applicationsError: string | null;
  stagesError: Record<number, string | null>;
  inProgressError: Record<number, string | null>;
  
  // Actions
  refreshApplications: () => Promise<void>;
  refreshStages: (appId: number) => Promise<void>;
  checkInProgress: (appId: number) => Promise<void>;
  createStage: (stageData: CreateStageRequest) => Promise<boolean>;
  updateStage: (stageId: number, stageData: UpdateStageRequest) => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

export const useMetadataManagement = (): UseMetadataManagementReturn => {
  // Data states
  const [applications, setApplications] = useState<MetadataApplication[]>([]);
  const [stages, setStages] = useState<Record<number, MetadataStage[]>>({});
  const [inProgressStatus, setInProgressStatus] = useState<Record<number, boolean>>({});
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [stagesLoading, setStagesLoading] = useState<Record<number, boolean>>({});
  const [inProgressLoading, setInProgressLoading] = useState<Record<number, boolean>>({});
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [stagesError, setStagesError] = useState<Record<number, string | null>>({});
  const [inProgressError, setInProgressError] = useState<Record<number, string | null>>({});

  // Refresh applications
  const refreshApplications = useCallback(async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    
    try {
      const response = await workflowService.getMetadataApplications();
      
      if (response.success) {
        setApplications(response.data);
        console.log('[useMetadataManagement] Applications loaded:', response.data.length);
      } else {
        const errorMsg = response.error || 'Failed to fetch applications';
        setApplicationsError(errorMsg);
        console.error('[useMetadataManagement] Error loading applications:', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch applications';
      setApplicationsError(errorMsg);
      console.error('[useMetadataManagement] Exception loading applications:', error);
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
        console.log('[useMetadataManagement] Stages loaded for app', appId, ':', response.data.length);
      } else {
        const errorMsg = response.error || `Failed to fetch stages for application ${appId}`;
        setStagesError(prev => ({ ...prev, [appId]: errorMsg }));
        console.error('[useMetadataManagement] Error loading stages for app', appId, ':', errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || `Failed to fetch stages for application ${appId}`;
      setStagesError(prev => ({ ...prev, [appId]: errorMsg }));
      console.error('[useMetadataManagement] Exception loading stages for app', appId, ':', error);
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
        console.log('[useMetadataManagement] In progress status for app', appId, ':', response.data);
      } else {
        const errorMsg = response.error || `Failed to check in progress status for application ${appId}`;
        setInProgressError(prev => ({ ...prev, [appId]: errorMsg }));
        console.error('[useMetadataManagement] Error checking in progress for app', appId, ':', errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || `Failed to check in progress status for application ${appId}`;
      setInProgressError(prev => ({ ...prev, [appId]: errorMsg }));
      console.error('[useMetadataManagement] Exception checking in progress for app', appId, ':', error);
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
        console.log('[useMetadataManagement] Stage created with ID:', response.data);
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
        console.error('[useMetadataManagement] Error creating stage:', errorMsg);
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
      console.error('[useMetadataManagement] Exception creating stage:', error);
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
        console.log('[useMetadataManagement] Stage updated with ID:', response.data);
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
        console.error('[useMetadataManagement] Error updating stage:', errorMsg);
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
      console.error('[useMetadataManagement] Exception updating stage:', error);
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

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First load applications
      await refreshApplications();
      
      // Then load stages and in-progress status for each application
      // Note: We'll load these on-demand when user selects an application
      console.log('[useMetadataManagement] All data refreshed');
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to refresh data';
      setError(errorMsg);
      console.error('[useMetadataManagement] Exception refreshing all data:', error);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [refreshApplications]);

  // Load initial data
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // Data
    applications,
    stages,
    inProgressStatus,
    
    // Loading states
    loading,
    applicationsLoading,
    stagesLoading,
    inProgressLoading,
    
    // Error states
    error,
    applicationsError,
    stagesError,
    inProgressError,
    
    // Actions
    refreshApplications,
    refreshStages,
    checkInProgress,
    createStage,
    updateStage,
    refreshAll
  };
};