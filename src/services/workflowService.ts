import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  Application, 
  ApiResponse, 
  ApplicationParameter,
  WorkflowRole,
  UniqueApplication,
  UniqueRole,
  ApplicationRoleMapping
} from '@/types/application-types';

// Mock data for development/demo environments
const MOCK_APPLICATIONS: Application[] = [
  {
    applicationId: 1,
    name: "Daily Named Pnl",
    category: "NPL ID",
    serviceUrl: null,
    description: "Daily Named Pnl",
    entitlementMapping: 12,
    isActive: true,
    cronExpression: "0 10 0 ? * MON-FRI *",
    isLockingEnabled: true,
    lockingRole: 2,
    useRunCalendar: false,
    createdon: "10/04/2020 00:00:00",
    runDateOffSet: 1,
    isRunOnWeekDayOnly: true
  },
  {
    applicationId: 17,
    name: "Basel",
    category: "Basel",
    serviceUrl: "http://localhost:4200",
    description: "Basel app",
    entitlementMapping: 12,
    isActive: true,
    cronExpression: "0 55 18 ? * MON-FRI *",
    isLockingEnabled: false,
    lockingRole: 0,
    useRunCalendar: false,
    createdon: "03/07/2023 04:30:46",
    runDateOffSet: 0,
    isRunOnWeekDayOnly: true
  },
  {
    applicationId: 25,
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
  }
];

// Mock data for application parameters
const MOCK_APPLICATION_PARAMETERS: Record<number, ApplicationParameter[]> = {
  1: [
    { appId: 1, paramId: 101, name: "APP_TIMEOUT", value: "3600", active: "Y", updatedBy: "system", ignore: "N" },
    { appId: 1, paramId: 102, name: "MAX_RETRIES", value: "3", active: "Y", updatedBy: "admin", ignore: "N" },
    { appId: 1, paramId: 103, name: "DATA_REFRESH_INTERVAL", value: "15", active: "Y", updatedBy: "system", ignore: "N" },
    { appId: 1, paramId: 104, name: "NOTIFICATION_ENABLED", value: "true", active: "Y", updatedBy: "admin", ignore: "N" },
    { appId: 1, paramId: 105, name: "ERROR_THRESHOLD", value: "5", active: "Y", updatedBy: "system", ignore: "N" }
  ],
  17: [
    { appId: 17, paramId: 623, name: "test", value: "asdsa", active: "Y", updatedBy: "system", ignore: "N" },
    { appId: 17, paramId: 624, name: "BASEL_TIMEOUT", value: "7200", active: "Y", updatedBy: "admin", ignore: "N" },
    { appId: 17, paramId: 625, name: "CALCULATION_MODE", value: "advanced", active: "Y", updatedBy: "system", ignore: "N" },
    { appId: 17, paramId: 626, name: "DEBUG_ENABLED", value: "false", active: "N", updatedBy: "admin", ignore: "Y" }
  ],
  25: [
    { appId: 25, paramId: 301, name: "RISK_THRESHOLD", value: "0.95", active: "Y", updatedBy: "risk_admin", ignore: "N" },
    { appId: 25, paramId: 302, name: "CALCULATION_FREQUENCY", value: "hourly", active: "Y", updatedBy: "system", ignore: "N" },
    { appId: 25, paramId: 303, name: "ALERT_RECIPIENTS", value: "risk-team@company.com", active: "Y", updatedBy: "admin", ignore: "N" }
  ]
};

// Mock data for workflow roles
const MOCK_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    roleId: 38,
    department: "Basel_4",
    role: "Regiap",
    userType: "User",
    isReadWrite: "RW",
    isActive: true
  },
  {
    roleId: 5,
    department: "Financial Control",
    role: "Approver",
    userType: "SME",
    isReadWrite: "RW",
    isActive: true
  },
  {
    roleId: 37,
    department: "Financial Control",
    role: "HR",
    userType: "SME",
    isReadWrite: "RW",
    isActive: true
  },
  {
    roleId: 31,
    department: "G4",
    role: "Automation User",
    userType: "User",
    isReadWrite: "RW",
    isActive: true
  },
  {
    roleId: 32,
    department: "G4",
    role: "Automation Approver",
    userType: "SME",
    isReadWrite: "RW",
    isActive: true
  }
];

// Mock data for unique applications - matching your API specification
const MOCK_UNIQUE_APPLICATIONS: UniqueApplication[] = [
  {
    configType: "Basel", // hierarchy name 
    configId: "17", // app id
    configName: "Basel" //app name 
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

// Mock data for unique roles - matching your API specification
const MOCK_UNIQUE_ROLES: UniqueRole[] = [
  {
    configId: 31, // roleId
    configName: "G4-AUTOMATION-USER-RW" // role name 
  },
  {
    configId: 32, // roleId
    configName: "G4-AUTOMATION-APPROVER-SME-RW" // role name 
  },
  {
    configId: 38, // roleId
    configName: "BASEL_4-REGCAP-USER-RW" // role name 
  },
  {
    configId: 5, // roleId
    configName: "FINANCIAL CONTROL-APPROVER-SME-RW" // role name 
  },
  {
    configId: 37, // roleId
    configName: "FINANCIAL CONTROL-HR-SME-RW" // role name 
  }
];

// Mock data for application-role mappings - matching your exact API response
const MOCK_APPLICATION_ROLE_MAPPINGS: ApplicationRoleMapping[] = [
  {
    applicationId: 17,
    roleId: 38,
    applicationName: "Basel",
    roleName: "BASEL_4-REGCAP-USER-RW"
  },
  {
    applicationId: 13,
    roleId: 5,
    applicationName: "Finance Hiring Workflow",
    roleName: "FINANCIAL CONTROL-APPROVER-SME-RW"
  },
  {
    applicationId: 16,
    roleId: 31,
    applicationName: "G4 Automation",
    roleName: "G4-AUTOMATION-USER-RW"
  },
  {
    applicationId: 16,
    roleId: 32,
    applicationName: "G4 Automation",
    roleName: "G4-AUTOMATION-APPROVER-SME-RW"
  }
];

class WorkflowService {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.axiosInstance = this.createAxiosInstance();
  }

  private getBaseUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.warn('NEXT_PUBLIC_BASE_URL not set, falling back to localhost');
      return 'http://localhost:3000';
    }
    return baseUrl;
  }

  private createAxiosInstance(): AxiosInstance {
    // Always use the configured base URL directly
    const baseURL = `${this.baseUrl}/api/WF`;
    
    const instance = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true, // Use credentials for Windows authentication
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    // Request interceptor for authentication and logging
    instance.interceptors.request.use(
      (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        
        // Add any additional headers for Windows auth if needed
        if (this.isWindowsAuthEnvironment()) {
          config.headers['X-Requested-With'] = 'XMLHttpRequest';
        }
        
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and logging
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[API Response Error]', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
          console.error('Authentication failed - check Windows credentials');
        } else if (error.response?.status === 403) {
          console.error('Access forbidden - insufficient permissions');
        } else if (error.response?.status >= 500) {
          console.error('Server error - check API availability');
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }

  private isWindowsAuthEnvironment(): boolean {
    // Check if we're in an environment that uses Windows authentication
    return !this.isMockMode() && !this.baseUrl.includes('localhost');
  }

  private isMockMode(): boolean {
    const apiMode = process.env.NEXT_PUBLIC_API_MODE;
    const forceRealApi = process.env.NEXT_PUBLIC_FORCE_REAL_API;
    
    // If explicitly set to mock mode
    if (apiMode === 'mock') {
      return true;
    }
    
    // If force real API is explicitly false
    if (forceRealApi === 'false') {
      return true;
    }
    
    // If force real API is explicitly true, use real API
    if (forceRealApi === 'true') {
      return false;
    }
    
    // Default behavior: use mock for localhost and preview environments
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname.includes('localhost') || 
             hostname.includes('preview.co.dev') || 
             hostname.includes('vercel.app') ||
             hostname.includes('127.0.0.1');
    }
    
    return false;
  }

  private async simulateNetworkDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createApiResponse<T>(data: T, success: boolean = true, error?: string): ApiResponse<T> {
    return {
      data,
      success,
      error,
      timestamp: new Date().toISOString(),
      environment: this.isMockMode() ? 'Mock Data' : this.baseUrl
    };
  }

  // Get all applications
  async getApplications(): Promise<ApiResponse<Application[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for applications');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_APPLICATIONS);
      }

      console.log('[Workflow Service] Fetching applications from API');
      const response = await this.axiosInstance.get<Application[]>('/GetWorkflowApplicationDetails/false');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching applications:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch applications'
      );
    }
  }

  // Save/update a single application
  async saveApplication(application: Application): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for application');
        await this.simulateNetworkDelay(800);
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      console.log('[Workflow Service] Saving application to API:', application);
      const response = await this.axiosInstance.post<number>('/SetApplication', application);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving application:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save application'
      );
    }
  }

  // Save/update applications (batch operation - calls saveApplication for each)
  async saveApplications(applications: Application[]): Promise<ApiResponse<Application[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for applications');
        await this.simulateNetworkDelay(800);
        
        // Simulate successful save by returning the input data
        return this.createApiResponse(applications);
      }

      console.log('[Workflow Service] Saving multiple applications to API');
      
      // Save each application individually
      const savedApplications: Application[] = [];
      for (const application of applications) {
        const response = await this.saveApplication(application);
        if (response.success && response.data === 1) {
          savedApplications.push(application);
        } else {
          throw new Error(`Failed to save application ${application.name}: ${response.error}`);
        }
      }
      
      return this.createApiResponse(savedApplications);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving applications:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.message || 'Failed to save applications'
      );
    }
  }

  // Test connection to the API
  async testConnection(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      if (this.isMockMode()) {
        await this.simulateNetworkDelay(800);
        return this.createApiResponse({
          status: 'Connected (Mock)',
          timestamp: new Date().toISOString(),
        });
      }

      // Test connection by making a simple API call
      const response = await this.getApplications();
      
      if (response.success) {
        return this.createApiResponse({
          status: 'Connected',
          timestamp: new Date().toISOString(),
        });
      } else {
        return this.createApiResponse(
          {
            status: 'Failed',
            timestamp: new Date().toISOString(),
          },
          false,
          response.error
        );
      }
    } catch (error: any) {
      return this.createApiResponse(
        {
          status: 'Failed',
          timestamp: new Date().toISOString(),
        },
        false,
        error.message || 'Connection test failed'
      );
    }
  }

  // Get application parameters for a specific application
  async getApplicationParameters(appId: number): Promise<ApiResponse<ApplicationParameter[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for application parameters');
        await this.simulateNetworkDelay();
        
        const parameters = MOCK_APPLICATION_PARAMETERS[appId] || [];
        return this.createApiResponse(parameters);
      }

      console.log('[Workflow Service] Fetching application parameters from API for appId:', appId);
      const response = await this.axiosInstance.get<ApplicationParameter[]>(`/appparam/${appId}`);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching application parameters:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch application parameters'
      );
    }
  }

  // Save/update an application parameter
  async saveApplicationParameter(parameter: ApplicationParameter): Promise<ApiResponse<ApplicationParameter[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for application parameter');
        await this.simulateNetworkDelay(800);
        
        // Update mock data
        const appId = parameter.appId;
        if (!MOCK_APPLICATION_PARAMETERS[appId]) {
          MOCK_APPLICATION_PARAMETERS[appId] = [];
        }
        
        const existingIndex = MOCK_APPLICATION_PARAMETERS[appId].findIndex(p => p.paramId === parameter.paramId);
        if (existingIndex >= 0) {
          MOCK_APPLICATION_PARAMETERS[appId][existingIndex] = parameter;
        } else {
          // Generate new paramId if not provided
          if (!parameter.paramId) {
            parameter.paramId = Date.now();
          }
          MOCK_APPLICATION_PARAMETERS[appId].push(parameter);
        }
        
        // Return the updated parameter as an array (matching API response format)
        return this.createApiResponse([parameter]);
      }

      console.log('[Workflow Service] Saving application parameter to API:', parameter);
      const response = await this.axiosInstance.post<ApplicationParameter[]>('/WorkflowAppParam', parameter);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving application parameter:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to save application parameter'
      );
    }
  }

  // ===== ROLE MANAGEMENT METHODS =====

  // Get all workflow roles
  async getWorkflowRoles(): Promise<ApiResponse<WorkflowRole[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for workflow roles');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_WORKFLOW_ROLES);
      }

      console.log('[Workflow Service] Fetching workflow roles from API');
      const response = await this.axiosInstance.get<WorkflowRole[]>('/GetWorkflowRoleDetails/false');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching workflow roles:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch workflow roles'
      );
    }
  }

  // Save/update roles
  async saveRoles(roles: WorkflowRole[]): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for roles');
        await this.simulateNetworkDelay(800);
        
        // Update mock data
        roles.forEach(role => {
          const existingIndex = MOCK_WORKFLOW_ROLES.findIndex(r => r.roleId === role.roleId);
          if (existingIndex >= 0) {
            MOCK_WORKFLOW_ROLES[existingIndex] = role;
          } else {
            // Generate new roleId if not provided
            if (!role.roleId) {
              role.roleId = Date.now();
            }
            MOCK_WORKFLOW_ROLES.push(role);
          }
        });
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      console.log('[Workflow Service] Saving roles to API:', roles);
      const response = await this.axiosInstance.post<number>('/SetRoles', roles);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving roles:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save roles'
      );
    }
  }

  // Get unique applications for role management
  async getUniqueApplications(): Promise<ApiResponse<UniqueApplication[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for unique applications');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_UNIQUE_APPLICATIONS);
      }

      console.log('[Workflow Service] Fetching unique applications from API');
      const response = await this.axiosInstance.get<UniqueApplication[]>('/GetWorkflowUniqueApplications');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching unique applications:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch unique applications'
      );
    }
  }

  // Get unique roles for role management
  async getUniqueRoles(): Promise<ApiResponse<UniqueRole[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for unique roles');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_UNIQUE_ROLES);
      }

      console.log('[Workflow Service] Fetching unique roles from API');
      const response = await this.axiosInstance.get<UniqueRole[]>('/GetWorkflowUniqueRoles');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching unique roles:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch unique roles'
      );
    }
  }

  // Get application-role mappings
  async getApplicationRoleMappings(): Promise<ApiResponse<ApplicationRoleMapping[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for application-role mappings');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_APPLICATION_ROLE_MAPPINGS);
      }

      console.log('[Workflow Service] Fetching application-role mappings from API');
      const response = await this.axiosInstance.get<ApplicationRoleMapping[]>('/GetWorkflowApplicationToRoleMap');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching application-role mappings:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch application-role mappings'
      );
    }
  }

  // Save application-role mappings (legacy method - sends all mappings)
  async saveApplicationRoleMappings(mappings: ApplicationRoleMapping[]): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for application-role mappings');
        await this.simulateNetworkDelay(800);
        
        // Update mock data
        MOCK_APPLICATION_ROLE_MAPPINGS.length = 0; // Clear existing mappings
        MOCK_APPLICATION_ROLE_MAPPINGS.push(...mappings);
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      // Transform ApplicationRoleMapping[] to the format expected by the API
      // API expects: [{ "appId": "17", "roleId": "38" }, { "appId": "17", "roleId": "21" }]
      const apiPayload = mappings.map(mapping => ({
        appId: mapping.applicationId.toString(),
        roleId: mapping.roleId.toString()
      }));

      console.log('[Workflow Service] Saving application-role mappings to API:', apiPayload);
      const response = await this.axiosInstance.post<number>('/SetApplicationToRoleMap', apiPayload);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving application-role mappings:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save application-role mappings'
      );
    }
  }

  // Save application-role mappings for specific applications only (optimized method)
  async saveApplicationRoleMappingsForApplications(
    editedApplicationIds: number[], 
    allCurrentMappings: ApplicationRoleMapping[]
  ): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for application-role mappings (optimized)');
        console.log('[Workflow Service] Edited applications:', editedApplicationIds);
        await this.simulateNetworkDelay(800);
        
        // Update mock data for edited applications only
        editedApplicationIds.forEach(appId => {
          // Remove existing mappings for this application
          const filteredMappings = MOCK_APPLICATION_ROLE_MAPPINGS.filter(m => m.applicationId !== appId);
          // Add new mappings for this application
          const newMappingsForApp = allCurrentMappings.filter(m => m.applicationId === appId);
          
          // Update mock data
          MOCK_APPLICATION_ROLE_MAPPINGS.length = 0;
          MOCK_APPLICATION_ROLE_MAPPINGS.push(...filteredMappings, ...newMappingsForApp);
        });
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      // Filter mappings to only include edited applications
      const mappingsForEditedApps = allCurrentMappings.filter(mapping => 
        editedApplicationIds.includes(mapping.applicationId)
      );

      // Transform to API format - only send mappings for edited applications
      const apiPayload = mappingsForEditedApps.map(mapping => ({
        appId: mapping.applicationId.toString(),
        roleId: mapping.roleId.toString()
      }));

      console.log('[Workflow Service] Saving optimized application-role mappings to API:');
      console.log('[Workflow Service] Edited applications:', editedApplicationIds);
      console.log('[Workflow Service] Mappings to send:', apiPayload);
      console.log('[Workflow Service] Total mappings sent:', apiPayload.length, 'instead of', allCurrentMappings.length);

      const response = await this.axiosInstance.post<number>('/SetApplicationToRoleMap', apiPayload);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving optimized application-role mappings:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save application-role mappings'
      );
    }
  }

  // Get current environment info
  getEnvironmentInfo(): { mode: string; baseUrl: string; isMock: boolean } {
    return {
      mode: process.env.NEXT_PUBLIC_API_MODE || 'auto',
      baseUrl: this.baseUrl,
      isMock: this.isMockMode()
    };
  }
}

// Create and export a singleton instance
export const workflowService = new WorkflowService();

// Export the class for testing or custom instances
export { WorkflowService };