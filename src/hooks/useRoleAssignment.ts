import { useState, useEffect, useCallback } from 'react';
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
  };
  computed: {
    assignedRoles: Map<string, NplAccessResponse[]>; // username -> roles
    unassignedRoles: WorkflowUniqueRole[];
    hasPendingChanges: boolean;
    isEligibleForRoleAssignment: boolean;
  };
}

export function useRoleAssignment({
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

  // Load role assignments data
  const loadRoleAssignments = useCallback(async () => {
    if (!enabled) return;

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

    } catch (error: any) {
      console.error('[useRoleAssignment] Error loading role assignments:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load role assignments'
      }));
      toast.error(error.message || 'Failed to load role assignments');
    }
  }, [enabled, appId, appGroupId, selectedDate, formatDateForApi]);

  // Load tollgate processes
  const loadTollgateProcesses = useCallback(async () => {
    if (!enabled) return;

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

    } catch (error: any) {
      console.error('[useRoleAssignment] Error loading tollgate processes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load tollgate processes'
      }));
      toast.error(error.message || 'Failed to load tollgate processes');
    }
  }, [enabled, appId, appGroupId, selectedDate, formatDateForApi]);

  // Assign role to user
  const assignRole = useCallback(async (username: string, roleId: number) => {
    if (!state.data) {
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
        systemEntitlements: state.data.systemEntitlements,
        userEntitlements: state.data.userEntitlements
      };

      const response = await roleAssignmentService.assignRoleAccess(request);

      if (!response.success) {
        throw new Error(response.error || 'Failed to assign role');
      }

      // Reload data to reflect changes - call the function directly to avoid circular dependency
      if (enabled) {
        const [rolesResponse, assignmentsResponse, entitlementsResponse] = await Promise.all([
          roleAssignmentService.getWorkflowUniqueRoles(),
          roleAssignmentService.getCurrentRoleAssignments(appId, appGroupId, undefined, undefined, businessDate),
          roleAssignmentService.getEntitlements()
        ]);

        if (rolesResponse.success && assignmentsResponse.success && entitlementsResponse.success) {
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
        }
      }
      
      toast.success(`Successfully assigned role to ${username}`);

    } catch (error: any) {
      console.error('[useRoleAssignment] Error assigning role:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to assign role'
      }));
      toast.error(error.message || 'Failed to assign role');
    }
  }, [state.data, appId, appGroupId, selectedDate, formatDateForApi, enabled]);

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

      // Reload data to reflect changes - call the function directly to avoid circular dependency
      if (enabled) {
        const [rolesResponse, assignmentsResponse, entitlementsResponse] = await Promise.all([
          roleAssignmentService.getWorkflowUniqueRoles(),
          roleAssignmentService.getCurrentRoleAssignments(appId, appGroupId, undefined, undefined, businessDate),
          roleAssignmentService.getEntitlements()
        ]);

        if (rolesResponse.success && assignmentsResponse.success && entitlementsResponse.success) {
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
        }
      }
      
      toast.success(`Successfully removed role from ${username}`);

    } catch (error: any) {
      console.error('[useRoleAssignment] Error removing role:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to remove role'
      }));
      toast.error(error.message || 'Failed to remove role');
    }
  }, [appId, appGroupId, selectedDate, formatDateForApi, enabled]);

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
      
      // Reload tollgate processes to reflect changes - call the service directly to avoid circular dependency
      if (enabled) {
        const tollgateResponse = await roleAssignmentService.getTollgateProcesses(appId, appGroupId, businessDate);
        
        if (tollgateResponse.success) {
          setState(prev => ({
            ...prev,
            loading: false,
            tollgateData: {
              availableProcesses: tollgateResponse.data,
              selectedProcess: null
            }
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }

    } catch (error: any) {
      console.error(`[useRoleAssignment] Error ${action}ing tollgate:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || `Failed to ${action} tollgate`
      }));
      toast.error(error.message || `Failed to ${action} tollgate`);
    }
  }, [appId, appGroupId, selectedDate, formatDateForApi, enabled]);

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
      console.error('[useRoleAssignment] Error saving pending changes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to save pending changes'
      }));
      toast.error(error.message || 'Failed to save pending changes');
    }
  }, [state.pendingChanges, assignRole, removeRole, clearPendingChanges]);

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

  // Load data on mount and when key dependencies change
  useEffect(() => {
    if (enabled) {
      loadRoleAssignments();
    }
  }, [enabled, appId, appGroupId, selectedDate]);

  return {
    state,
    actions: {
      loadRoleAssignments,
      assignRole,
      removeRole,
      loadTollgateProcesses,
      reopenTollgate,
      clearPendingChanges,
      savePendingChanges
    },
    computed
  };
}