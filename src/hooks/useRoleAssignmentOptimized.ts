import { useState, useEffect, useCallback, useRef } from 'react';
import { roleAssignmentService } from '@/services/roleAssignmentService';
import {
  RoleAssignmentState,
  WorkflowUniqueRole,
  NplAccessResponse,
  NplAccessRequest,
  TollgateProcessResponse,
  SystemEntitlements,
  UserEntitlements
} from '@/types/role-assignment-types';
import { useDate } from '@/contexts/DateContext';
import { toast } from '@/lib/toast';

interface UseRoleAssignmentProps {
  appId: number;
  appGroupId: string;
  enabled?: boolean;
}

interface UseRoleAssignmentReturn {
  state: RoleAssignmentState;
  actions: {
    loadRoleAssignments: () => Promise<void>;
    assignRole: (username: string, roleId: number) => Promise<void>;
    removeRole: (username: string, roleId: number) => Promise<void>;
    loadTollgateProcesses: () => Promise<void>;
    reopenTollgate: (processId: string, action?: 'reopen' | 'close') => Promise<void>;
    clearPendingChanges: () => void;
    savePendingChanges: () => Promise<void>;
    refreshWorkflow: () => void;
  };
  computed: {
    assignedRoles: Map<string, NplAccessResponse[]>; // username -> roles
    unassignedRoles: WorkflowUniqueRole[];
    hasPendingChanges: boolean;
    isEligibleForRoleAssignment: boolean;
  };
}

export function useRoleAssignmentOptimized({
  appId,
  appGroupId,
  enabled = true
}: UseRoleAssignmentProps): UseRoleAssignmentReturn {
  const { selectedDate } = useDate();
  const [state, setState] = useState<RoleAssignmentState>({
    loading: false,
    error: null,
    data: null,
    tollgateData: null,
    pendingChanges: new Map()
  });

  // Use refs to track loading states and prevent duplicate calls
  const loadingRoleAssignments = useRef(false);
  const loadingTollgateProcesses = useRef(false);
  const lastLoadedRoleParams = useRef<string>('');
  const lastLoadedTollgateParams = useRef<string>('');
  const workflowRefreshCallback = useRef<(() => void) | null>(null);

  // Format date for API calls
  const formatDateForApi = useCallback((date: Date): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  // Internal function to reload role assignments without circular dependencies
  const internalLoadRoleAssignments = useCallback(async (forceReload = false) => {
    if (!enabled || loadingRoleAssignments.current) return;

    const currentParams = `${appId}-${appGroupId}-${selectedDate.toISOString()}`;
    if (!forceReload && lastLoadedRoleParams.current === currentParams) {
      return; // Already loaded for these parameters
    }

    loadingRoleAssignments.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessDate = formatDateForApi(selectedDate);

      // Load all required data in parallel
      const [rolesResponse, assignmentsResponse, entitlementsResponse] = await Promise.all([
        roleAssignmentService.getWorkflowUniqueRoles(),
        roleAssignmentService.getCurrentRoleAssignments(appId, appGroupId, undefined, undefined, businessDate),
        roleAssignmentService.getEntitlements()
      ]);

      if (!rolesResponse.success) {
        throw new Error(rolesResponse.error || 'Failed to load available roles');
      }

      if (!assignmentsResponse.success) {
        throw new Error(assignmentsResponse.error || 'Failed to load current assignments');
      }

      if (!entitlementsResponse.success) {
        throw new Error(entitlementsResponse.error || 'Failed to load entitlements');
      }

      setState(prev => ({
        ...prev,
        loading: false,
        data: {
          availableRoles: rolesResponse.data,
          currentAssignments: assignmentsResponse.data,
          systemEntitlements: entitlementsResponse.data.systemEntitlements,
          userEntitlements: entitlementsResponse.data.userEntitlements
        }
      }));

      lastLoadedRoleParams.current = currentParams;

    } catch (error: any) {
      console.error('[useRoleAssignmentOptimized] Error loading role assignments:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load role assignments'
      }));
      toast.error(error.message || 'Failed to load role assignments');
    } finally {
      loadingRoleAssignments.current = false;
    }
  }, [enabled, appId, appGroupId, selectedDate, formatDateForApi]);

  // Internal function to reload tollgate processes without circular dependencies
  const internalLoadTollgateProcesses = useCallback(async (forceReload = false) => {
    if (!enabled || loadingTollgateProcesses.current) return;

    const currentParams = `${appId}-${appGroupId}-${selectedDate.toISOString()}`;
    if (!forceReload && lastLoadedTollgateParams.current === currentParams) {
      return; // Already loaded for these parameters
    }

    loadingTollgateProcesses.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessDate = formatDateForApi(selectedDate);
      const response = await roleAssignmentService.getTollgateProcesses(appId, appGroupId, businessDate);

      if (!response.success) {
        throw new Error(response.error || 'Failed to load tollgate processes');
      }

      setState(prev => ({
        ...prev,
        loading: false,
        tollgateData: {
          availableProcesses: response.data,
          selectedProcess: null
        }
      }));

      lastLoadedTollgateParams.current = currentParams;

    } catch (error: any) {
      console.error('[useRoleAssignmentOptimized] Error loading tollgate processes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load tollgate processes'
      }));
      toast.error(error.message || 'Failed to load tollgate processes');
    } finally {
      loadingTollgateProcesses.current = false;
    }
  }, [enabled, appId, appGroupId, selectedDate, formatDateForApi]);

  // Public API functions with stable references
  const loadRoleAssignments = useCallback(() => internalLoadRoleAssignments(true), [internalLoadRoleAssignments]);
  const loadTollgateProcesses = useCallback(() => internalLoadTollgateProcesses(true), [internalLoadTollgateProcesses]);

  // Assign role to user
  const assignRole = useCallback(async (username: string, roleId: number) => {
    // Check if data is available
    const currentData = state.data;
    if (!currentData) {
      toast.error('Role assignment data not loaded');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessDate = formatDateForApi(selectedDate);
      
      const request: NplAccessRequest = {
        workflowNplAccess: {
          accessId: null,
          appId,
          appGroupId,
          roleId,
          username,
          businessDate,
          updatedBy: 'current_user', // This should come from auth context
          updatedOn: null,
          createdBy: null,
          createdOn: null
        },
        systemEntitlements: currentData.systemEntitlements,
        userEntitlements: currentData.userEntitlements
      };

      const response = await roleAssignmentService.assignRoleAccess(request);

      if (!response.success) {
        throw new Error(response.error || 'Failed to assign role');
      }

      // Force reload data to reflect changes
      await internalLoadRoleAssignments(true);
      
      // Trigger workflow refresh if callback is available
      if (workflowRefreshCallback.current) {
        workflowRefreshCallback.current();
      }
      
      toast.success(`Successfully assigned role to ${username}`);

    } catch (error: any) {
      console.error('[useRoleAssignmentOptimized] Error assigning role:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to assign role'
      }));
      toast.error(error.message || 'Failed to assign role');
    }
  }, [appId, appGroupId, selectedDate, formatDateForApi, internalLoadRoleAssignments, state.data]);

  // Remove role from user
  const removeRole = useCallback(async (username: string, roleId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessDate = formatDateForApi(selectedDate);
      
      const response = await roleAssignmentService.removeRoleAssignment(
        appId,
        appGroupId,
        username,
        roleId,
        businessDate,
        'current_user' // This should come from auth context
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to remove role');
      }

      // Force reload data to reflect changes
      await internalLoadRoleAssignments(true);
      
      // Trigger workflow refresh if callback is available
      if (workflowRefreshCallback.current) {
        workflowRefreshCallback.current();
      }
      
      toast.success(`Successfully removed role from ${username}`);

    } catch (error: any) {
      console.error('[useRoleAssignmentOptimized] Error removing role:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to remove role'
      }));
      toast.error(error.message || 'Failed to remove role');
    }
  }, [appId, appGroupId, selectedDate, formatDateForApi, internalLoadRoleAssignments]);

  // Reopen or close tollgate process
  const reopenTollgate = useCallback(async (processId: string, action: 'reopen' | 'close' = 'reopen') => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessDate = formatDateForApi(selectedDate);
      const response = await roleAssignmentService.reopenTollgateProcess(
        appId, 
        appGroupId, 
        businessDate, 
        processId, 
        action
      );

      if (!response.success) {
        throw new Error(response.error || `Failed to ${action} tollgate process`);
      }

      toast.success(`Tollgate process ${processId} ${action}ed successfully`);
      
      // Force reload tollgate processes to reflect changes
      await internalLoadTollgateProcesses(true);
      
      // Trigger workflow refresh if callback is available
      if (workflowRefreshCallback.current) {
        workflowRefreshCallback.current();
      }
      
      setState(prev => ({ ...prev, loading: false }));

    } catch (error: any) {
      console.error(`[useRoleAssignmentOptimized] Error ${action}ing tollgate:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || `Failed to ${action} tollgate`
      }));
      toast.error(error.message || `Failed to ${action} tollgate`);
    }
  }, [appId, appGroupId, selectedDate, formatDateForApi, internalLoadTollgateProcesses]);

  // Clear pending changes
  const clearPendingChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      pendingChanges: new Map()
    }));
  }, []);

  // Save pending changes
  const savePendingChanges = useCallback(async () => {
    if (state.pendingChanges.size === 0) {
      toast.info('No pending changes to save');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const changes = Array.from(state.pendingChanges.entries());
      
      for (const [key, change] of changes) {
        if (change.action === 'assign') {
          await assignRole(change.username, change.roleId);
        } else if (change.action === 'unassign') {
          await removeRole(change.username, change.roleId);
        }
      }

      // Clear pending changes after successful save
      clearPendingChanges();
      
      toast.success(`Successfully saved ${changes.length} role assignment changes`);

    } catch (error: any) {
      console.error('[useRoleAssignmentOptimized] Error saving pending changes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to save pending changes'
      }));
      toast.error(error.message || 'Failed to save pending changes');
    }
  }, [state.pendingChanges, assignRole, removeRole, clearPendingChanges]);

  // Workflow refresh callback
  const refreshWorkflow = useCallback(() => {
    if (workflowRefreshCallback.current) {
      workflowRefreshCallback.current();
    }
  }, []);

  // Computed values
  const computed = {
    assignedRoles: new Map<string, NplAccessResponse[]>(),
    unassignedRoles: [] as WorkflowUniqueRole[],
    hasPendingChanges: state.pendingChanges.size > 0,
    isEligibleForRoleAssignment: enabled && !!state.data
  };

  // Compute assigned roles by username
  if (state.data) {
    const assignedRolesMap = new Map<string, NplAccessResponse[]>();
    
    state.data.currentAssignments.forEach(assignment => {
      if (!assignedRolesMap.has(assignment.username)) {
        assignedRolesMap.set(assignment.username, []);
      }
      assignedRolesMap.get(assignment.username)!.push(assignment);
    });
    
    computed.assignedRoles = assignedRolesMap;

    // Compute unassigned roles (roles not assigned to any user)
    const assignedRoleIds = new Set(state.data.currentAssignments.map(a => a.roleId));
    computed.unassignedRoles = state.data.availableRoles.filter(
      role => !assignedRoleIds.has(parseInt(role.configId))
    );
  }

  // Load data on mount and when key dependencies change - with debouncing
  useEffect(() => {
    if (enabled) {
      const timeoutId = setTimeout(() => {
        internalLoadRoleAssignments(false);
      }, 100); // Small delay to prevent rapid successive calls

      return () => clearTimeout(timeoutId);
    }
  }, [enabled, appId, appGroupId, selectedDate.toDateString(), internalLoadRoleAssignments]);

  return {
    state,
    actions: {
      loadRoleAssignments,
      assignRole,
      removeRole,
      loadTollgateProcesses,
      reopenTollgate,
      clearPendingChanges,
      savePendingChanges,
      refreshWorkflow
    },
    computed
  };
}