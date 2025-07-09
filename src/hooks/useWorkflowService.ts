import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/services/workflowService';
import { Application, ApiResponse } from '@/types/application-types';

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
    return saveApplications([app]);
  }, [saveApplications]);

  // Add a new application
  const addApplication = useCallback(async (app: Omit<Application, 'applicationId'>): Promise<boolean> => {
    const newApp: Application = {
      ...app,
      applicationId: Date.now(), // Temporary ID, server should assign real ID
    };
    
    const updatedApps = [...applications, newApp];
    return saveApplications(updatedApps);
  }, [applications, saveApplications]);

  // Update an existing application
  const updateApplication = useCallback(async (updatedApp: Application): Promise<boolean> => {
    const updatedApps = applications.map(app => 
      app.applicationId === updatedApp.applicationId ? updatedApp : app
    );
    
    return saveApplications(updatedApps);
  }, [applications, saveApplications]);

  // Delete an application
  const deleteApplication = useCallback(async (applicationId: number): Promise<boolean> => {
    const updatedApps = applications.filter(app => app.applicationId !== applicationId);
    return saveApplications(updatedApps);
  }, [applications, saveApplications]);

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

// Hook for getting environment information
export const useEnvironmentInfo = () => {
  const [envInfo] = useState(() => workflowService.getEnvironmentInfo());
  
  return envInfo;
};