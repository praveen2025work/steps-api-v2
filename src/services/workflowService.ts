import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Application, ApiResponse, ApplicationParameter } from '@/types/application-types';

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
    // Use proxy in development to avoid CORS issues
    const isDevelopment = process.env.NODE_ENV === 'development';
    const useProxy = isDevelopment && process.env.NEXT_PUBLIC_FORCE_REAL_API === 'true';
    
    const baseURL = useProxy ? '/api/proxy/WF' : `${this.baseUrl}/api/WF`;
    
    const instance = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: !useProxy, // Don't use credentials with proxy
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