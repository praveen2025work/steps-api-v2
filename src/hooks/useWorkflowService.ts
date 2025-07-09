import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/services/workflowService';
import { 
  Application, 
  ApiResponse, 
  ApplicationParameter,
  WorkflowRole,
  UniqueApplication,
  UniqueRole,
  ApplicationRoleMapping
} from '@/types/application-types';

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

// Hook for managing workflow roles
export const useWorkflowRoles = () => {
  const [roles, setRoles] = useState<WorkflowRole[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch workflow roles
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getWorkflowRoles();
      
      if (response.success) {
        setRoles(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch workflow roles');
        setRoles([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save roles
  const saveRoles = useCallback(async (rolesToSave: WorkflowRole[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.saveRoles(rolesToSave);
      
      if (response.success && response.data === 1) {
        // Update local state with the saved roles
        setRoles(prevRoles => {
          const updatedRoles = [...prevRoles];
          rolesToSave.forEach(role => {
            const existingIndex = updatedRoles.findIndex(r => r.roleId === role.roleId);
            if (existingIndex >= 0) {
              updatedRoles[existingIndex] = role;
            } else {
              updatedRoles.push(role);
            }
          });
          return updatedRoles;
        });
        setLastFetch(new Date());
        return true;
      } else {
        setError(response.error || 'Failed to save roles');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new role
  const addRole = useCallback(async (role: Omit<WorkflowRole, 'roleId'>): Promise<boolean> => {
    const newRole: WorkflowRole = {
      ...role,
      roleId: Date.now(), // Temporary ID, server should assign real ID
      action: 1, // Action for new role
      isReadWriteChecked: role.isReadWrite === 'RW'
    };
    
    return saveRoles([newRole]);
  }, [saveRoles]);

  // Update an existing role
  const updateRole = useCallback(async (updatedRole: WorkflowRole): Promise<boolean> => {
    const roleWithAction: WorkflowRole = {
      ...updatedRole,
      action: 2, // Action for update
      isReadWriteChecked: updatedRole.isReadWrite === 'RW'
    };
    
    return saveRoles([roleWithAction]);
  }, [saveRoles]);

  // Delete a role
  const deleteRole = useCallback(async (roleId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // For delete, we'll need to implement a delete endpoint later
      // For now, we'll simulate by removing from local state
      setRoles(prevRoles => prevRoles.filter(role => role.roleId !== roleId));
      setLastFetch(new Date());
      return true;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh roles
  const refresh = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Initial fetch on mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    lastFetch,
    fetchRoles,
    saveRoles,
    addRole,
    updateRole,
    deleteRole,
    refresh,
  };
};

// Hook for managing unique applications
export const useUniqueApplications = () => {
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

// Hook for managing unique roles
export const useUniqueRoles = () => {
  const [roles, setRoles] = useState<UniqueRole[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch unique roles
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getUniqueRoles();
      
      if (response.success) {
        setRoles(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch unique roles');
        setRoles([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh roles
  const refresh = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Initial fetch on mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    lastFetch,
    fetchRoles,
    refresh,
  };
};

// Hook for managing application-role mappings
export const useApplicationRoleMappings = () => {
  const [mappings, setMappings] = useState<ApplicationRoleMapping[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch application-role mappings
  const fetchMappings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.getApplicationRoleMappings();
      
      if (response.success) {
        setMappings(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch application-role mappings');
        setMappings([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setMappings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save application-role mappings
  const saveMappings = useCallback(async (mappingsToSave: ApplicationRoleMapping[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowService.saveApplicationRoleMappings(mappingsToSave);
      
      if (response.success && response.data === 1) {
        setMappings(mappingsToSave);
        setLastFetch(new Date());
        return true;
      } else {
        setError(response.error || 'Failed to save application-role mappings');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save application-role mappings with delta changes (additions and removals)
  const saveMappingsDelta = useCallback(async (
    additions: ApplicationRoleMapping[], 
    removals: ApplicationRoleMapping[]
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate the final state
      let updatedMappings = [...mappings];
      
      // Remove mappings
      removals.forEach(removal => {
        updatedMappings = updatedMappings.filter(mapping => 
          !(mapping.roleId === removal.roleId && mapping.applicationId === removal.applicationId)
        );
      });
      
      // Add new mappings
      additions.forEach(addition => {
        const exists = updatedMappings.some(mapping => 
          mapping.roleId === addition.roleId && mapping.applicationId === addition.applicationId
        );
        if (!exists) {
          updatedMappings.push(addition);
        }
      });

      // Get all unique application IDs that were affected by changes
      const editedApplicationIds = new Set<number>();
      
      // Add application IDs from additions
      additions.forEach(addition => {
        editedApplicationIds.add(addition.applicationId);
      });
      
      // Add application IDs from removals
      removals.forEach(removal => {
        editedApplicationIds.add(removal.applicationId);
      });

      const editedApplicationIdsArray = Array.from(editedApplicationIds);

      console.log('[useWorkflowService] Delta save - edited applications:', editedApplicationIdsArray);
      console.log('[useWorkflowService] Delta save - additions:', additions.length);
      console.log('[useWorkflowService] Delta save - removals:', removals.length);

      // Use optimized save method that sends only mappings for edited applications
      const response = await workflowService.saveApplicationRoleMappingsForApplications(
        editedApplicationIdsArray,
        updatedMappings
      );
      
      if (response.success && response.data === 1) {
        setMappings(updatedMappings);
        setLastFetch(new Date());
        return true;
      } else {
        setError(response.error || 'Failed to save application-role mappings');
        return false;
      }
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [mappings]);

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
    saveMappings,
    saveMappingsDelta,
    refresh,
  };
};

// Hook for getting environment information
export const useEnvironmentInfo = () => {
  const [envInfo] = useState(() => workflowService.getEnvironmentInfo());
  
  return envInfo;
};