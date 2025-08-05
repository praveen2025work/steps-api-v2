import { getCurrentEnvironment } from '@/config/api-environments';

export interface WorkflowActionRequest {
  'updated by': string; // Fixed: Use 'updated by' instead of 'updatedBy'
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
 * Uses the same pattern as workflowConfigService for Java API calls
 */
export class WorkflowActionService {
  private static environment = getCurrentEnvironment();

  // Generic API call method (same pattern as workflowConfigService)
  private static async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const method = options.method || 'GET';

    const headers: HeadersInit = {
      ...(options.headers || {}),
    };

    // Only add Content-Type for methods that send a body
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }
    
    const defaultOptions: RequestInit = {
      method,
      mode: 'cors',
      cache: 'no-store', // Prevent browser from adding Cache-Control header
      credentials: 'omit', // Use 'omit' for Java API calls (same as workflowConfigService)
      ...options,
      headers,
    };

    try {
      console.log('Making workflow action API request:', { url, options: defaultOptions });
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Workflow action API response received:', { url, data });
      return data;
    } catch (error: any) {
      console.error('Workflow action API request failed:', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Force start a workflow process
   * @param workflowProcessId - The workflow process ID
   * @param updatedBy - Username of the person triggering the action
   * @returns Promise with the API response
   */
  static async forceStart(workflowProcessId: string, updatedBy: string = 'user'): Promise<WorkflowActionResponse> {
    try {
      const requestBody: WorkflowActionRequest = {
        'updated by': updatedBy, // Fixed: Use 'updated by' instead of 'updatedBy'
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

      // Use Java API endpoint (same pattern as workflowConfigService)
      const url = `${this.environment.javaApiUrl}/process/${workflowProcessId}?isForceStart=true`;
      
      const data = await this.makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
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
        'updated by': updatedBy, // Fixed: Use 'updated by' instead of 'updatedBy'
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

      // Use Java API endpoint (same pattern as workflowConfigService)
      const url = `${this.environment.javaApiUrl}/process/${workflowProcessId}?isReRun=true`;
      
      const data = await this.makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
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