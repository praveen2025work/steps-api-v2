import { apiClient } from '@/lib/api-client';
import { getCurrentEnvironment } from '@/config/api-environments';

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

// Check if we're in a development/preview environment
const isDevelopmentMode = (): boolean => {
  // Allow forcing real API calls via environment variable
  if (process.env.NEXT_PUBLIC_FORCE_REAL_API === 'true') {
    return false;
  }
  
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname.includes('localhost') || 
         hostname.includes('preview.co.dev') || 
         hostname.includes('vercel.app') ||
         hostname.includes('127.0.0.1');
};

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

      // Use mock response in development/preview environments
      if (isDevelopmentMode()) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate success response
        return {
          success: true,
          message: `Process ${workflowProcessId} has been force started successfully (Mock)`,
          data: { processId: workflowProcessId, status: 'started' }
        };
      }

      // Use Java API endpoint instead of .NET endpoint
      const environment = getCurrentEnvironment();
      const javaApiUrl = environment.javaApiUrl;
      
      const response = await fetch(`${javaApiUrl}/process/${workflowProcessId}?isForceStart=true`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        message: data?.message || 'Process force started successfully',
        data: data
      };
    } catch (error: any) {
      console.error('Force start failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to force start process'
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

      // Use mock response in development/preview environments
      if (isDevelopmentMode()) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate success response
        return {
          success: true,
          message: `Process ${workflowProcessId} has been re-run successfully (Mock)`,
          data: { processId: workflowProcessId, status: 're-run' }
        };
      }

      // Use Java API endpoint instead of .NET endpoint
      const environment = getCurrentEnvironment();
      const javaApiUrl = environment.javaApiUrl;
      
      const response = await fetch(`${javaApiUrl}/process/${workflowProcessId}?isReRun=true`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        message: data?.message || 'Process re-run started successfully',
        data: data
      };
    } catch (error: any) {
      console.error('Re-run failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to re-run process'
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