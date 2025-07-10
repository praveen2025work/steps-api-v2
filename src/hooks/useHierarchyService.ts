import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/services/workflowService';
import { 
  UniqueHierarchy, 
  HierarchyDetail, 
  SetHierarchyRequest, 
  ApplicationToHierarchyMap, 
  SetApplicationHierarchyMapRequest 
} from '@/types/hierarchy-api-types';
import { ApiResponse, UniqueApplication } from '@/types/application-types';

// Hook for managing unique hierarchies
export const useUniqueHierarchies = () => {
  const [hierarchies, setHierarchies] = useState<UniqueHierarchy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch unique hierarchies
  const fetchHierarchies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getUniqueHierarchies();
      
      if (response.success) {
        setHierarchies(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch unique hierarchies');
        setHierarchies([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setHierarchies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh hierarchies
  const refresh = useCallback(() => {
    fetchHierarchies();
  }, [fetchHierarchies]);

  // Initial fetch on mount
  useEffect(() => {
    fetchHierarchies();
  }, [fetchHierarchies]);

  return {
    hierarchies,
    loading,
    error,
    lastFetch,
    fetchHierarchies,
    refresh,
  };
};

// Hook for managing hierarchy details
export const useHierarchyDetails = () => {
  const [details, setDetails] = useState<HierarchyDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch hierarchy details
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getHierarchyDetails();
      
      if (response.success) {
        setDetails(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch hierarchy details');
        setDetails([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setDetails([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save hierarchy
  const saveHierarchy = useCallback(async (hierarchyData: SetHierarchyRequest[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.setHierarchy(hierarchyData);
      
      if (response.success && response.data === 1) {
        // Refresh data after successful save
        await fetchDetails();
        return true;
      } else {
        setError(response.error || 'Failed to save hierarchy');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDetails]);

  // Refresh details
  const refresh = useCallback(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Initial fetch on mount
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    details,
    loading,
    error,
    lastFetch,
    fetchDetails,
    saveHierarchy,
    refresh,
  };
};

// Hook for managing application-hierarchy mappings
export const useApplicationHierarchyMappings = () => {
  const [mappings, setMappings] = useState<ApplicationToHierarchyMap[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch application-hierarchy mappings
  const fetchMappings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getApplicationToHierarchyMap();
      
      if (response.success) {
        setMappings(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch application-hierarchy mappings');
        setMappings([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setMappings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save application-hierarchy mapping
  const saveMapping = useCallback(async (mappingData: SetApplicationHierarchyMapRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.setApplicationHierarchyMap(mappingData);
      
      if (response.success && response.data === 1) {
        // Refresh data after successful save
        await fetchMappings();
        return true;
      } else {
        setError(response.error || 'Failed to save application-hierarchy mapping');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMappings]);

  // Refresh mappings
  const refresh = useCallback(() => {
    fetchMappings();
  }, [fetchMappings]);

  // Initial fetch on mount
  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  return {
    mappings,
    loading,
    error,
    lastFetch,
    fetchMappings,
    saveMapping,
    refresh,
  };
};

// Hook for managing unique applications (reuse from existing service)
export const useUniqueApplicationsForHierarchy = () => {
  const [applications, setApplications] = useState<UniqueApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch unique applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getUniqueApplications();
      
      if (response.success) {
        setApplications(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch unique applications');
        setApplications([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh applications
  const refresh = useCallback(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Initial fetch on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    lastFetch,
    fetchApplications,
    refresh,
  };
};

// Combined hook for all hierarchy data (similar to how role management works)
export const useHierarchyManagement = () => {
  const uniqueHierarchies = useUniqueHierarchies();
  const hierarchyDetails = useHierarchyDetails();
  const applicationMappings = useApplicationHierarchyMappings();
  const uniqueApplications = useUniqueApplicationsForHierarchy();

  // Combined loading state
  const loading = uniqueHierarchies.loading || hierarchyDetails.loading || 
                  applicationMappings.loading || uniqueApplications.loading;

  // Combined error state
  const error = uniqueHierarchies.error || hierarchyDetails.error || 
                applicationMappings.error || uniqueApplications.error;

  // Refresh all data
  const refreshAll = useCallback(() => {
    uniqueHierarchies.refresh();
    hierarchyDetails.refresh();
    applicationMappings.refresh();
    uniqueApplications.refresh();
  }, [uniqueHierarchies.refresh, hierarchyDetails.refresh, applicationMappings.refresh, uniqueApplications.refresh]);

  return {
    // Data
    uniqueHierarchies: uniqueHierarchies.hierarchies,
    hierarchyDetails: hierarchyDetails.details,
    applicationMappings: applicationMappings.mappings,
    uniqueApplications: uniqueApplications.applications,
    
    // States
    loading,
    error,
    
    // Actions
    saveHierarchy: hierarchyDetails.saveHierarchy,
    saveMapping: applicationMappings.saveMapping,
    refreshAll,
    
    // Individual refresh functions
    refreshHierarchies: uniqueHierarchies.refresh,
    refreshDetails: hierarchyDetails.refresh,
    refreshMappings: applicationMappings.refresh,
    refreshApplications: uniqueApplications.refresh,
  };
};