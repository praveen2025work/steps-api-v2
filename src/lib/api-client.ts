import { ApiEnvironment, getCurrentEnvironment, CORE_API_ENDPOINTS } from '@/config/api-environments';
import { 
  UniqueHierarchy, 
  HierarchyDetail, 
  SetHierarchyRequest, 
  ApplicationToHierarchyMap, 
  SetApplicationHierarchyMapRequest 
} from '@/types/hierarchy-api-types';

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

// Mock data for development/preview environments
const MOCK_APPLICATIONS: WorkflowApplication[] = [
  {
    applicationId: 1,
    name: "eRates Processing",
    category: "Finance",
    serviceUrl: "http://internal-service/erates",
    description: "Electronic rates processing and validation system",
    entitlementMapping: 101,
    isActive: true,
    cronExpression: "0 6 * * 1-5",
    isLockingEnabled: true,
    lockingRole: 1,
    useRunCalendar: true,
    createdon: "2024-01-15T08:00:00Z",
    runDateOffSet: 0,
    isRunOnWeekDayOnly: true
  },
  {
    applicationId: 17,
    name: "Risk Analytics",
    category: "Risk Management",
    serviceUrl: "http://internal-service/risk",
    description: "Risk calculation and reporting system",
    entitlementMapping: 102,
    isActive: true,
    cronExpression: "0 7 * * 1-5",
    isLockingEnabled: true,
    lockingRole: 2,
    useRunCalendar: false,
    createdon: "2024-02-01T09:00:00Z",
    runDateOffSet: 1,
    isRunOnWeekDayOnly: true
  },
  {
    applicationId: 25,
    name: "Compliance Reporting",
    category: "Compliance",
    serviceUrl: null,
    description: "Automated compliance report generation",
    entitlementMapping: 103,
    isActive: false,
    cronExpression: "0 22 * * *",
    isLockingEnabled: false,
    lockingRole: 3,
    useRunCalendar: true,
    createdon: "2024-01-20T10:00:00Z",
    runDateOffSet: 0,
    isRunOnWeekDayOnly: false
  }
];

const MOCK_PARAMETERS: ApplicationParameter[] = [
  {
    appId: 17,
    paramId: 1,
    name: "MAX_RETRY_ATTEMPTS",
    value: "3",
    active: "Y",
    updatedBy: "system.admin",
    ignore: "N"
  },
  {
    appId: 17,
    paramId: 2,
    name: "TIMEOUT_SECONDS",
    value: "300",
    active: "Y",
    updatedBy: "john.doe",
    ignore: "N"
  },
  {
    appId: 17,
    paramId: 3,
    name: "DEBUG_MODE",
    value: "false",
    active: "N",
    updatedBy: "system.admin",
    ignore: "Y"
  },
  {
    appId: 17,
    paramId: 4,
    name: "EMAIL_NOTIFICATIONS",
    value: "admin@company.com,ops@company.com",
    active: "Y",
    updatedBy: "jane.smith",
    ignore: "N"
  }
];

// Mock hierarchy data for development/preview environments
const MOCK_UNIQUE_HIERARCHIES: UniqueHierarchy[] = [
  { hierarchyId: 12, hierarchyName: "Basel Hierarchy" },
  { hierarchyId: 9, hierarchyName: "Basel4" },
  { hierarchyId: 1, hierarchyName: "Daily Named Pnl Hierarchy" },
  { hierarchyId: 2, hierarchyName: "Daily Workspace Pnl Hierarchy" },
  { hierarchyId: 14, hierarchyName: "FO Explains processing" },
  { hierarchyId: 15, hierarchyName: "FOBO processing" },
  { hierarchyId: 11, hierarchyName: "GAAUTOMATION" },
  { hierarchyId: 4, hierarchyName: "IPV-3rdLineHierarchy" },
  { hierarchyId: 10, hierarchyName: "MonthEnd Workspace Pnl Hierarchy" }
];

const MOCK_HIERARCHY_DETAILS: HierarchyDetail[] = [
  {
    hierarchyId: 12,
    hierarchyName: "Basel Hierarchy",
    hierarchyDescription: "basel",
    hierarchyLevel: 1,
    columnName: "Risk Area",
    parentHierarchyLevel: 0,
    parentColumnName: "NA",
    isUsedForEntitlements: true,
    isUsedForWorkflowInstance: false
  },
  {
    hierarchyId: 12,
    hierarchyLevel: 2,
    columnName: "Milestone",
    parentHierarchyLevel: 1,
    parentColumnName: "Risk Area",
    isUsedForEntitlements: false,
    isUsedForWorkflowInstance: false
  },
  {
    hierarchyId: 12,
    hierarchyLevel: 3,
    columnName: "Taxonomy LO",
    parentHierarchyLevel: 2,
    parentColumnName: "Milestone",
    isUsedForEntitlements: false,
    isUsedForWorkflowInstance: false
  },
  {
    hierarchyId: 9,
    hierarchyName: "Basel4",
    hierarchyDescription: "RegCap",
    hierarchyLevel: 1,
    columnName: "Group",
    parentHierarchyLevel: 0,
    parentColumnName: "NA",
    isUsedForEntitlements: true,
    isUsedForWorkflowInstance: false
  }
];

const MOCK_APPLICATION_HIERARCHY_MAP: ApplicationToHierarchyMap[] = [
  {
    applicationId: 2,
    hierarchyId: 2,
    hierarchyName: "Daily Workspace Pnl Hierarchy",
    applicationName: "Daily Workspace Pnl"
  },
  {
    applicationId: 16,
    hierarchyId: 11,
    hierarchyName: "GAAUTOMATION",
    applicationName: "G4 Automation"
  },
  {
    applicationId: 15,
    hierarchyId: 10,
    hierarchyName: "MonthEnd Workspace Pnl Hierarchy",
    applicationName: "Month End Workflow"
  },
  {
    applicationId: 1,
    hierarchyId: 1,
    hierarchyName: "Daily Named Pnl Hierarchy",
    applicationName: "Daily Named Pnl"
  },
  {
    applicationId: 14,
    hierarchyId: 9,
    hierarchyName: "Basel4",
    applicationName: "Reg Reporting"
  }
];

// Mock unique applications for development/preview environments
const MOCK_UNIQUE_APPLICATIONS: UniqueApplication[] = [
  {
    configType: "Basel",
    configId: "17",
    configName: "Basel"
  },
  {
    configType: "Finance",
    configId: "13",
    configName: "Finance Hiring Workflow"
  },
  {
    configType: "G4",
    configId: "16",
    configName: "G4 Automation"
  },
  {
    configType: "NPL ID",
    configId: "1",
    configName: "Daily Named Pnl"
  }
];

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

// Unique Application interface based on your API response
export interface UniqueApplication {
  configType: string;
  configId: string;
  configName: string;
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
    // Use mock data in development/preview environments
    if (isDevelopmentMode()) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredApps = includeInactive 
        ? MOCK_APPLICATIONS 
        : MOCK_APPLICATIONS.filter(app => app.isActive);
      
      return {
        data: filteredApps,
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

    const endpoint = `${CORE_API_ENDPOINTS.GET_WORKFLOW_APPLICATIONS}/${includeInactive}`;
    return this.makeRequest<WorkflowApplication[]>(endpoint);
  }

  // Get application parameters by application ID
  async getApplicationParameters(appId: number): Promise<ApiResponse<ApplicationParameter[]>> {
    // Use mock data in development/preview environments
    if (isDevelopmentMode()) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filteredParams = MOCK_PARAMETERS.filter(param => param.appId === appId);
      
      return {
        data: filteredParams,
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

    const endpoint = `${CORE_API_ENDPOINTS.GET_APPLICATION_PARAMETERS}/${appId}`;
    return this.makeRequest<ApplicationParameter[]>(endpoint);
  }

  // Test connection to the API
  async testConnection(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    // Use mock connection in development/preview environments
    if (isDevelopmentMode()) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        data: {
          status: 'Connected (Mock)',
          timestamp: new Date().toISOString(),
        },
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

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

  // ===== HIERARCHY API METHODS =====

  // Get unique hierarchies
  async getUniqueHierarchies(): Promise<ApiResponse<UniqueHierarchy[]>> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        data: MOCK_UNIQUE_HIERARCHIES,
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

    const endpoint = '/GetWorkflowUniqueHierarchy';
    return this.makeRequest<UniqueHierarchy[]>(endpoint);
  }

  // Get hierarchy details
  async getHierarchyDetails(): Promise<ApiResponse<HierarchyDetail[]>> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: MOCK_HIERARCHY_DETAILS,
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

    const endpoint = '/GetWorkflowHierarchyDetails';
    return this.makeRequest<HierarchyDetail[]>(endpoint);
  }

  // Set/Update hierarchy
  async setHierarchy(hierarchyData: SetHierarchyRequest[]): Promise<ApiResponse<number>> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simulate success response (API returns 1 for success)
      return {
        data: 1,
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

    const endpoint = '/setHierarchy';
    return this.makeRequest<number>(endpoint, {
      method: 'POST',
      body: JSON.stringify(hierarchyData),
    });
  }

  // Get application to hierarchy map
  async getApplicationToHierarchyMap(): Promise<ApiResponse<ApplicationToHierarchyMap[]>> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        data: MOCK_APPLICATION_HIERARCHY_MAP,
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

    const endpoint = '/GetWorkflowApplicationToHierarchyMap';
    return this.makeRequest<ApplicationToHierarchyMap[]>(endpoint);
  }

  // Set application to hierarchy map
  async setApplicationHierarchyMap(mappingData: SetApplicationHierarchyMapRequest): Promise<ApiResponse<number>> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate success response (API returns 1 for success)
      return {
        data: 1,
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

    const endpoint = '/SetApplicationHierarchyMap';
    return this.makeRequest<number>(endpoint, {
      method: 'POST',
      body: JSON.stringify(mappingData),
    });
  }

  // Get unique applications
  async getUniqueApplications(): Promise<ApiResponse<UniqueApplication[]>> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        data: MOCK_UNIQUE_APPLICATIONS,
        success: true,
        timestamp: new Date().toISOString(),
        environment: `${this.environment.name} (Mock Data)`,
      };
    }

    const endpoint = CORE_API_ENDPOINTS.GET_UNIQUE_APPLICATIONS;
    return this.makeRequest<UniqueApplication[]>(endpoint);
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