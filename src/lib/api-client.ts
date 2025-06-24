import { ApiEnvironment, getCurrentEnvironment, CORE_API_ENDPOINTS } from '@/config/api-environments';

// Application interface based on your API response
export interface WorkflowApplication {
  applicationId: number;
  name: string;
  category: string;
  serviceUrl: string | null;
  description: string;
  entitlementMapping: number;
  isActive: boolean;
  cronExpression: string;
  isLockingEnabled: boolean;
  lockingRole: number;
  useRunCalendar: boolean;
  createdon: string;
  runDateOffSet: number;
  isRunOnWeekDayOnly: boolean;
}

// Application Parameter interface based on your API response
export interface ApplicationParameter {
  appId: number;
  paramId: number;
  name: string;
  value: string;
  active: string; // 'Y' or 'N'
  updatedBy: string;
  ignore: string; // 'Y' or 'N'
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
  environment: string;
}

// API Client class
export class ApiClient {
  private environment: ApiEnvironment;
  private controller: AbortController | null = null;

  constructor(environment?: ApiEnvironment) {
    this.environment = environment || getCurrentEnvironment();
  }

  // Switch environment dynamically
  switchEnvironment(environment: ApiEnvironment) {
    this.environment = environment;
  }

  // Get current environment info
  getCurrentEnvironment(): ApiEnvironment {
    return this.environment;
  }

  // Cancel ongoing requests
  cancelRequests() {
    if (this.controller) {
      this.controller.abort();
    }
  }

  // Generic API call method with Windows authentication
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Cancel previous request if exists
    this.cancelRequests();
    
    // Create new abort controller
    this.controller = new AbortController();

    const url = `${this.environment.coreApiUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      method: 'GET',
      credentials: 'include', // Important for Windows authentication
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add any additional headers for Windows auth if needed
        'Cache-Control': 'no-cache',
      },
      signal: this.controller.signal,
      ...options,
    };

    let retryCount = 0;
    const maxRetries = this.environment.retryAttempts;

    while (retryCount <= maxRetries) {
      try {
        // Create a timeout promise that rejects after the specified timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Request timeout after ${this.environment.timeout}ms`));
          }, this.environment.timeout);
        });

        // Race between the fetch request and timeout
        const response = await Promise.race([
          fetch(url, defaultOptions),
          timeoutPromise
        ]);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
          data,
          success: true,
          timestamp: new Date().toISOString(),
          environment: this.environment.name,
        };

      } catch (error: any) {
        retryCount++;
        
        // Don't retry if request was aborted
        if (error.name === 'AbortError') {
          throw error;
        }

        // Don't retry if it's the last attempt
        if (retryCount > maxRetries) {
          return {
            data: null as T,
            success: false,
            error: error.message || 'Unknown error occurred',
            timestamp: new Date().toISOString(),
            environment: this.environment.name,
          };
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected error in API client');
  }

  // Get all workflow applications
  async getWorkflowApplications(includeInactive: boolean = false): Promise<ApiResponse<WorkflowApplication[]>> {
    const endpoint = `${CORE_API_ENDPOINTS.GET_WORKFLOW_APPLICATIONS}/${includeInactive}`;
    return this.makeRequest<WorkflowApplication[]>(endpoint);
  }

  // Get application parameters by application ID
  async getApplicationParameters(appId: number): Promise<ApiResponse<ApplicationParameter[]>> {
    const endpoint = `${CORE_API_ENDPOINTS.GET_APPLICATION_PARAMETERS}/${appId}`;
    return this.makeRequest<ApplicationParameter[]>(endpoint);
  }

  // Test connection to the API
  async testConnection(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await this.getWorkflowApplications(false);
      if (response.success) {
        return {
          data: {
            status: 'Connected',
            timestamp: new Date().toISOString(),
          },
          success: true,
          timestamp: new Date().toISOString(),
          environment: this.environment.name,
        };
      } else {
        return {
          data: {
            status: 'Failed',
            timestamp: new Date().toISOString(),
          },
          success: false,
          error: response.error,
          timestamp: new Date().toISOString(),
          environment: this.environment.name,
        };
      }
    } catch (error: any) {
      return {
        data: {
          status: 'Failed',
          timestamp: new Date().toISOString(),
        },
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        environment: this.environment.name,
      };
    }
  }
}

// Create a default instance
export const apiClient = new ApiClient();

// Helper function to create a new client with specific environment
export const createApiClient = (environment: ApiEnvironment): ApiClient => {
  return new ApiClient(environment);
};

// Hook for React components to use API client
export const useApiClient = (environment?: ApiEnvironment): ApiClient => {
  if (environment) {
    return createApiClient(environment);
  }
  return apiClient;
};