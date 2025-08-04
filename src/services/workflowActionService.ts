import { apiClient } from '@/lib/api-client';

export interface WorkflowActionRequest {
  updatedBy: string;
  workflowProcessId: string;
}

export interface WorkflowActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Service for handling workflow process actions (Force Start, Re-run)
 */
export class WorkflowActionService {
  /**
   * Force start a workflow process
   * @param workflowProcessId - The workflow process ID
   * @param updatedBy - Username of the person triggering the action
   * @returns Promise with the API response
   */
  static async forceStart(workflowProcessId: string, updatedBy: string = 'user'): Promise<WorkflowActionResponse> {
    try {
      const requestBody: WorkflowActionRequest = {
        updatedBy,
        workflowProcessId
      };

      const response = await apiClient.post(`/process/${workflowProcessId}?isForceStart=true`, requestBody);
      
      return {
        success: true,
        message: response.data?.message || 'Process force started successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Force start failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to force start process'
      };
    }
  }

  /**
   * Re-run a workflow process
   * @param workflowProcessId - The workflow process ID
   * @param updatedBy - Username of the person triggering the action
   * @returns Promise with the API response
   */
  static async reRun(workflowProcessId: string, updatedBy: string = 'user'): Promise<WorkflowActionResponse> {
    try {
      const requestBody: WorkflowActionRequest = {
        updatedBy,
        workflowProcessId
      };

      const response = await apiClient.post(`/process/${workflowProcessId}?isReRun=true`, requestBody);
      
      return {
        success: true,
        message: response.data?.message || 'Process re-run started successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Re-run failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to re-run process'
      };
    }
  }

  /**
   * Check if a process can be force started based on its state
   * @param status - Current process status
   * @param isLocked - Whether the process is locked
   * @returns boolean indicating if force start is allowed
   */
  static canForceStart(status: string, isLocked: boolean = false): boolean {
    if (isLocked) return false;
    
    const allowedStatuses = ['not_started', 'not started', 'in_progress', 'in progress', 'post manual', 'failed'];
    return allowedStatuses.includes(status.toLowerCase());
  }

  /**
   * Check if a process can be re-run based on its state
   * @param status - Current process status
   * @returns boolean indicating if re-run is allowed
   */
  static canReRun(status: string): boolean {
    return status.toLowerCase() === 'completed';
  }

  /**
   * Get the appropriate action button configuration for a process
   * @param status - Current process status
   * @param isLocked - Whether the process is locked
   * @returns Object with button configurations
   */
  static getActionButtons(status: string, isLocked: boolean = false) {
    const normalizedStatus = status.toLowerCase();
    
    return {
      showForceStart: this.canForceStart(status, isLocked),
      showReRun: this.canReRun(status),
      forceStartEnabled: !isLocked && this.canForceStart(status, isLocked),
      reRunEnabled: this.canReRun(status)
    };
  }
}

export default WorkflowActionService;