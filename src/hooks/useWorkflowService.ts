import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/services/workflowService';
import { Application, ApiResponse, ApplicationParameter } from '@/types/application-types';

// Hook for managing applications
export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getApplications();
      
      if (response.success) {
        setApplications(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save applications
  const saveApplications = useCallback(async (apps: Application[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.saveApplications(apps);
      
      if (response.success) {
        setApplications(response.data);
        setLastFetch(new Date());
        return true;
      } else {
        setError(response.error || 'Failed to save applications');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save a single application
  const saveApplication = useCallback(async (app: Application): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.saveApplication(app);
      
      if (response.success && response.data === 1) {
        // Update local state with the saved application
        setApplications(prevApps => {
          const existingIndex = prevApps.findIndex(a => a.applicationId === app.applicationId);
          if (existingIndex >= 0) {
            // Update existing application
            const updated = [...prevApps];
            updated[existingIndex] = app;
            return updated;
          } else {
            // Add new application
            return [...prevApps, app];
          }
        });
        setLastFetch(new Date());
        return true;
      } else {
        setError(response.error || 'Failed to save application');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new application
  const addApplication = useCallback(async (app: Omit<Application, 'applicationId'>): Promise<boolean> => {
    const newApp: Application = {
      ...app,
      applicationId: Date.now(), // Temporary ID, server should assign real ID
    };
    
    return saveApplication(newApp);
  }, [saveApplication]);

  // Update an existing application
  const updateApplication = useCallback(async (updatedApp: Application): Promise<boolean> => {
    return saveApplication(updatedApp);
  }, [saveApplication]);

  // Delete an application
  const deleteApplication = useCallback(async (applicationId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // For delete, we'll need to implement a delete endpoint later
      // For now, we'll simulate by removing from local state
      setApplications(prevApps => prevApps.filter(app => app.applicationId !== applicationId));
      setLastFetch(new Date());
      return true;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
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
    saveApplications,
    saveApplication,
    addApplication,
    updateApplication,
    deleteApplication,
    refresh,
  };
};

// Hook for testing API connection
export const useApiConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    status: string;
    timestamp: string;
  } | null>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async () => {
    setTesting(true);
    setError(null);
    
    try {
      const response = await workflowService.testConnection();
      
      if (response.success) {
        setConnectionStatus(response.data);
      } else {
        setError(response.error || 'Connection test failed');
        setConnectionStatus(null);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setConnectionStatus(null);
    } finally {
      setTesting(false);
    }
  }, []);

  return {
    connectionStatus,
    testing,
    error,
    testConnection,
  };
};

// Hook for managing application parameters
export const useApplicationParameters = (appId: number) => {
  const [parameters, setParameters] = useState<ApplicationParameter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch application parameters
  const fetchParameters = useCallback(async () => {
    if (!appId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getApplicationParameters(appId);
      
      if (response.success) {
        setParameters(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch application parameters');
        setParameters([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setParameters([]);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  // Save/update an application parameter
  const saveParameter = useCallback(async (parameter: ApplicationParameter): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.saveApplicationParameter(parameter);
      
      if (response.success && response.data.length > 0) {
        const savedParameter = response.data[0];
        
        // Update local state with the saved parameter
        setParameters(prevParams => {
          const existingIndex = prevParams.findIndex(p => p.paramId === savedParameter.paramId);
          if (existingIndex >= 0) {
            // Update existing parameter
            const updated = [...prevParams];
            updated[existingIndex] = savedParameter;
            return updated;
          } else {
            // Add new parameter
            return [...prevParams, savedParameter];
          }
        });
        setLastFetch(new Date());
        return true;
      } else {
        setError(response.error || 'Failed to save application parameter');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new application parameter
  const addParameter = useCallback(async (param: Omit<ApplicationParameter, 'paramId'>): Promise<boolean> => {
    const newParam: ApplicationParameter = {
      ...param,
      paramId: Date.now(), // Temporary ID, server should assign real ID
      appId: appId,
    };
    
    return saveParameter(newParam);
  }, [appId, saveParameter]);

  // Update an existing application parameter
  const updateParameter = useCallback(async (updatedParam: ApplicationParameter): Promise<boolean> => {
    return saveParameter(updatedParam);
  }, [saveParameter]);

  // Delete an application parameter
  const deleteParameter = useCallback(async (paramId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // For delete, we'll need to implement a delete endpoint later
      // For now, we'll simulate by removing from local state
      setParameters(prevParams => prevParams.filter(param => param.paramId !== paramId));
      setLastFetch(new Date());
      return true;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh parameters
  const refresh = useCallback(() => {
    fetchParameters();
  }, [fetchParameters]);

  // Initial fetch on mount when appId changes
  useEffect(() => {
    if (appId) {
      fetchParameters();
    }
  }, [fetchParameters, appId]);

  return {
    parameters,
    loading,
    error,
    lastFetch,
    fetchParameters,
    saveParameter,
    addParameter,
    updateParameter,
    deleteParameter,
    refresh,
  };
};

// Hook for getting environment information
export const useEnvironmentInfo = () => {
  const [envInfo] = useState(() => workflowService.getEnvironmentInfo());
  
  return envInfo;
};