import axios, { AxiosInstance } from 'axios';
import {
  WorkflowUniqueRole,
  NplAccessRequest,
  NplAccessResponse,
  TollgateProcessResponse,
  RoleAssignmentApiResponse,
  SystemEntitlements,
  UserEntitlements
} from '@/types/role-assignment-types';

// Mock data for development
const MOCK_UNIQUE_ROLES: WorkflowUniqueRole[] = [
  { configId: "6", configName: "Financial Control-Permanent Approver-SME-RW" },
  { configId: "4", configName: "Financial Control-Producer-User-RW" },
  { configId: "2", configName: "Product Control-Approver-SME-RW" },
  { configId: "3", configName: "Product Control-Permanent Approver-SME-RW" },
  { configId: "1", configName: "Product Control-Producer-User-RW" },
  { configId: "28", configName: "Product Control-Approver RNA-SME-RW" },
  { configId: "29", configName: "Product Control-Approver IR-SME-RW" },
  { configId: "30", configName: "Product Control-Approver RIS-SME-RW" }
];

const MOCK_SYSTEM_ENTITLEMENTS: SystemEntitlements = {
  "PRODUCT CONTROL-APPROVER IR-SME-RW": 29,
  "PRODUCT CONTROL-APPROVER RIS-SME-RW": 30,
  "PRODUCT CONTROL-APPROVER RNA-SME-RW": 28,
  "PRODUCT CONTROL-APPROVER-SME-RW": 2,
  "PRODUCT CONTROL-PERMANENT APPROVER-SME-RW": 3
};

const MOCK_USER_ENTITLEMENTS: UserEntitlements = {
  "PRODUCT CONTROL-PRODUCER-USER-RW": 1,
  "PRODUCT CONTROL-APPROVER-SME-RW": 2,
  "PRODUCT CONTROL-PERMANENT APPROVER-SME-RW": 3,
  "PRODUCT CONTROL-APPROVER RNA-SME-RW": 28,
  "PRODUCT CONTROL-APPROVER IR-SME-RW": 29
};

const MOCK_NPL_ACCESS_RESPONSES: NplAccessResponse[] = [
  {
    accessId: 1400006,
    appId: 1,
    appGroupId: "XXXX",
    roleId: 1,
    businessDate: "2025-04-30",
    username: "user456",
    createdBy: "user456",
    createdOn: "2025-07-31 20:24:57",
    updatedBy: "user456",
    updatedOn: "2025-07-31 20:24:57"
  },
  {
    accessId: 1156773,
    appId: 1,
    appGroupId: "XXXX",
    roleId: 28,
    businessDate: "2025-04-30",
    username: "user789",
    createdBy: "SYSTEM_PROCESS",
    createdOn: "2025-05-01 01:14:42"
  }
];

const MOCK_TOLLGATE_PROCESS: TollgateProcessResponse = {
  workflowProcessId: 24293160,
  workflowSubstage: {
    substageId: 2858,
    name: "TG3 - Publish Attestation (PL Executor)",
    defaultStage: 29,
    paramMapping: "70;71;69;64;1292;1011;1812;",
    attestationMapping: "128;3681;3682;",
    updatedBy: "user999",
    updatedOn: "2024-09-08 14:36:55",
    entitlementMapping: 1,
    sendEmailAtStart: "N",
    followUp: "N"
  },
  workflowStage: {
    stageId: 29,
    workflowApplication: { appId: 1 },
    name: "Publish",
    updatedBy: "SYSTEM",
    updatedOn: "2020-05-15 19:36:16"
  },
  workflowApplication: { appId: 1 },
  status: "COMPLETED",
  businessDate: "2025-04-30",
  workflowAppConfigId: 129526,
  appGroupId: "XXXX",
  depSubStageSeq: 82,
  auto: "N",
  attest: "Y",
  upload: "N",
  updatedBy: "SYSTEM_TOOL",
  updatedOn: "2025-08-12 19:04:31",
  approval: "Y",
  isActive: "Y",
  adhoc: "N",
  isAlteryx: "N"
};

class RoleAssignmentService {
  private dotNetAxiosInstance: AxiosInstance;
  private javaAxiosInstance: AxiosInstance;
  private dotNetBaseUrl: string;
  private javaBaseUrl: string;

  constructor() {
    this.dotNetBaseUrl = this.getDotNetBaseUrl();
    this.javaBaseUrl = this.getJavaBaseUrl();
    this.dotNetAxiosInstance = this.createDotNetAxiosInstance();
    this.javaAxiosInstance = this.createJavaAxiosInstance();
  }

  private getDotNetBaseUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_DOTNET_BASE_URL || 'http://internal-api.example.com';
    if (this.isMockMode()) {
      return 'http://localhost:3000';
    }
    return baseUrl;
  }

  private getJavaBaseUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_JAVA_BASE_URL || 'http://internal-api.example.com';
    if (this.isMockMode()) {
      return 'http://localhost:3000';
    }
    return baseUrl;
  }

  private createDotNetAxiosInstance(): AxiosInstance {
    const baseURL = `${this.dotNetBaseUrl}/api/WF`;
    
    const instance = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    instance.interceptors.request.use(
      (config) => {
        if (this.isWindowsAuthEnvironment()) {
          config.headers['X-Requested-With'] = 'XMLHttpRequest';
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );

    return instance;
  }

  private createJavaAxiosInstance(): AxiosInstance {
    const baseURL = `${this.javaBaseUrl}/api`;
    
    const instance = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    instance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );

    return instance;
  }

  private isWindowsAuthEnvironment(): boolean {
    return !this.isMockMode() && !this.dotNetBaseUrl.includes('localhost');
  }

  private isMockMode(): boolean {
    const apiMode = process.env.NEXT_PUBLIC_API_MODE;
    const forceRealApi = process.env.NEXT_PUBLIC_FORCE_REAL_API;
    const coDevEnv = process.env.NEXT_PUBLIC_CO_DEV_ENV;

    if (coDevEnv === 'true' || forceRealApi === 'true') {
      return false;
    }

    if (apiMode === 'mock' || forceRealApi === 'false') {
      return true;
    }
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname.includes('localhost') || hostname.includes('127.0.0.1');
    }
    
    return true;
  }

  private async simulateNetworkDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createApiResponse<T>(data: T, success: boolean = true, error?: string): RoleAssignmentApiResponse<T> {
    return {
      data,
      success,
      error,
      timestamp: new Date().toISOString(),
      environment: this.isMockMode() ? 'Mock Data' : `DotNet: ${this.dotNetBaseUrl}, Java: ${this.javaBaseUrl}`
    };
  }

  // Get unique workflow roles (.NET API)
  async getWorkflowUniqueRoles(): Promise<RoleAssignmentApiResponse<WorkflowUniqueRole[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Role Assignment Service] Using mock data for unique roles');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_UNIQUE_ROLES);
      }

      console.log('[Role Assignment Service] Fetching unique roles from .NET API');
      const response = await this.dotNetAxiosInstance.get<WorkflowUniqueRole[]>('/GetWorkfLowUniqueRoles');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Role Assignment Service] Error fetching unique roles:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch unique roles'
      );
    }
  }

  // Assign/update role access (Java API)
  async assignRoleAccess(request: NplAccessRequest): Promise<RoleAssignmentApiResponse<any>> {
    try {
      if (this.isMockMode()) {
        console.log('[Role Assignment Service] Using mock assignment for role access');
        await this.simulateNetworkDelay(800);
        
        // Update mock data
        const existingIndex = MOCK_NPL_ACCESS_RESPONSES.findIndex(
          r => r.appId === request.workflowNplAccess.appId && 
               r.appGroupId === request.workflowNplAccess.appGroupId &&
               r.username === request.workflowNplAccess.username &&
               r.roleId === request.workflowNplAccess.roleId
        );

        if (existingIndex >= 0) {
          // Update existing
          MOCK_NPL_ACCESS_RESPONSES[existingIndex] = {
            ...MOCK_NPL_ACCESS_RESPONSES[existingIndex],
            updatedBy: request.workflowNplAccess.updatedBy,
            updatedOn: new Date().toISOString()
          };
        } else {
          // Add new
          MOCK_NPL_ACCESS_RESPONSES.push({
            accessId: Date.now(),
            appId: request.workflowNplAccess.appId,
            appGroupId: request.workflowNplAccess.appGroupId,
            roleId: request.workflowNplAccess.roleId,
            businessDate: request.workflowNplAccess.businessDate,
            username: request.workflowNplAccess.username,
            createdBy: request.workflowNplAccess.updatedBy,
            createdOn: new Date().toISOString()
          });
        }
        
        return this.createApiResponse({ success: true });
      }

      console.log('[Role Assignment Service] Assigning role access via Java API:', request);
      const response = await this.javaAxiosInstance.post('/nplaccess', request);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Role Assignment Service] Error assigning role access:', error);
      
      return this.createApiResponse(
        null,
        false,
        error.response?.data?.message || error.message || 'Failed to assign role access'
      );
    }
  }

  // Get current role assignments (Java API)
  async getCurrentRoleAssignments(
    appId: number,
    appGroupId: string,
    username?: string,
    roleId?: number,
    businessDate?: string
  ): Promise<RoleAssignmentApiResponse<NplAccessResponse[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Role Assignment Service] Using mock data for current role assignments');
        await this.simulateNetworkDelay();
        
        // Filter mock data based on parameters
        let filteredData = MOCK_NPL_ACCESS_RESPONSES.filter(r => 
          r.appId === appId && r.appGroupId === appGroupId
        );

        if (username) {
          filteredData = filteredData.filter(r => r.username === username);
        }

        if (roleId) {
          filteredData = filteredData.filter(r => r.roleId === roleId);
        }

        if (businessDate) {
          filteredData = filteredData.filter(r => r.businessDate === businessDate);
        }
        
        return this.createApiResponse(filteredData);
      }

      console.log('[Role Assignment Service] Fetching current role assignments from Java API');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('appId', appId.toString());
      params.append('appGroupId', appGroupId);
      
      if (username) params.append('username', username);
      if (roleId) params.append('roleId', roleId.toString());
      if (businessDate) params.append('businessDate', encodeURIComponent(businessDate));

      const response = await this.javaAxiosInstance.get<NplAccessResponse[]>(`/nplaccess?${params.toString()}`);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Role Assignment Service] Error fetching current role assignments:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch current role assignments'
      );
    }
  }

  // Get tollgate process for reopening (Java API)
  async getTollgateProcess(
    appId: number,
    appGroupId: string,
    businessDate: string
  ): Promise<RoleAssignmentApiResponse<TollgateProcessResponse>> {
    try {
      if (this.isMockMode()) {
        console.log('[Role Assignment Service] Using mock data for tollgate process');
        await this.simulateNetworkDelay();
        
        // Return mock tollgate process with the requested parameters
        const mockProcess = {
          ...MOCK_TOLLGATE_PROCESS,
          workflowApplication: { appId },
          appGroupId,
          businessDate
        };
        
        return this.createApiResponse(mockProcess);
      }

      console.log('[Role Assignment Service] Fetching tollgate process from Java API');
      const encodedDate = encodeURIComponent(businessDate);
      const response = await this.javaAxiosInstance.get<TollgateProcessResponse>(
        `/process/tollgate/${appId}/${appGroupId}/${encodedDate}`
      );
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Role Assignment Service] Error fetching tollgate process:', error);
      
      return this.createApiResponse(
        {} as TollgateProcessResponse,
        false,
        error.response?.data?.message || error.message || 'Failed to fetch tollgate process'
      );
    }
  }

  // Get system and user entitlements (combined from mock data or derived from roles)
  async getEntitlements(): Promise<RoleAssignmentApiResponse<{
    systemEntitlements: SystemEntitlements;
    userEntitlements: UserEntitlements;
  }>> {
    try {
      if (this.isMockMode()) {
        console.log('[Role Assignment Service] Using mock data for entitlements');
        await this.simulateNetworkDelay();
        
        return this.createApiResponse({
          systemEntitlements: MOCK_SYSTEM_ENTITLEMENTS,
          userEntitlements: MOCK_USER_ENTITLEMENTS
        });
      }

      // In real implementation, these might come from separate endpoints
      // For now, we'll derive them from the unique roles
      const rolesResponse = await this.getWorkflowUniqueRoles();
      
      if (!rolesResponse.success) {
        throw new Error(rolesResponse.error || 'Failed to fetch roles for entitlements');
      }

      const systemEntitlements: SystemEntitlements = {};
      const userEntitlements: UserEntitlements = {};

      rolesResponse.data.forEach(role => {
        const roleId = parseInt(role.configId);
        systemEntitlements[role.configName] = roleId;
        userEntitlements[role.configName] = roleId;
      });

      return this.createApiResponse({
        systemEntitlements,
        userEntitlements
      });
    } catch (error: any) {
      console.error('[Role Assignment Service] Error fetching entitlements:', error);
      
      return this.createApiResponse(
        {
          systemEntitlements: {},
          userEntitlements: {}
        },
        false,
        error.message || 'Failed to fetch entitlements'
      );
    }
  }

  // Remove role assignment
  async removeRoleAssignment(
    appId: number,
    appGroupId: string,
    username: string,
    roleId: number,
    businessDate: string,
    updatedBy: string
  ): Promise<RoleAssignmentApiResponse<any>> {
    try {
      if (this.isMockMode()) {
        console.log('[Role Assignment Service] Using mock removal for role assignment');
        await this.simulateNetworkDelay(800);
        
        // Remove from mock data
        const index = MOCK_NPL_ACCESS_RESPONSES.findIndex(
          r => r.appId === appId && 
               r.appGroupId === appGroupId &&
               r.username === username &&
               r.roleId === roleId
        );

        if (index >= 0) {
          MOCK_NPL_ACCESS_RESPONSES.splice(index, 1);
        }
        
        return this.createApiResponse({ success: true });
      }

      // For real API, we might need to call a DELETE endpoint or POST with a delete flag
      // This depends on the actual API implementation
      console.log('[Role Assignment Service] Removing role assignment via API');
      
      // Assuming we use the same POST endpoint with a special flag or null values
      const removeRequest: NplAccessRequest = {
        workflowNplAccess: {
          accessId: null,
          appId,
          appGroupId,
          roleId,
          username,
          businessDate,
          updatedBy,
          updatedOn: null,
          createdBy: null,
          createdOn: null
        },
        systemEntitlements: {},
        userEntitlements: {}
      };

      // This might be a DELETE request in the real implementation
      const response = await this.javaAxiosInstance.delete(`/nplaccess`, { data: removeRequest });
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Role Assignment Service] Error removing role assignment:', error);
      
      return this.createApiResponse(
        null,
        false,
        error.response?.data?.message || error.message || 'Failed to remove role assignment'
      );
    }
  }

  // Get user-specific roles for application (.NET API)
  async getUserWorkflowApplicationRoles(userId: string): Promise<RoleAssignmentApiResponse<any[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Role Assignment Service] Using mock data for user workflow application roles');
        await this.simulateNetworkDelay();
        
        const mockUserRoles = [
          {
            applicationId: 1,
            roleId: 1,
            userName: "kumarp15",
            applicationName: "Daily Named PnL",
            roleName: "PRODUCT CONTROL-PRODUCER-USER-RW"
          },
          {
            applicationId: 1,
            roleId: 2,
            userName: "kumarp15",
            applicationName: "Daily Named PnL",
            roleName: "PRODUCT CONTROL-APPROVER-SME-RW"
          }
        ];
        
        return this.createApiResponse(mockUserRoles);
      }

      console.log('[Role Assignment Service] Fetching user workflow application roles from .NET API');
      const response = await this.dotNetAxiosInstance.get(`/GetWorkflowApplicationToUserRoleMap/${userId}`);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Role Assignment Service] Error fetching user workflow application roles:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch user workflow application roles'
      );
    }
  }

  // Get tollgate processes for reopening (Java API)
  async getTollgateProcesses(
    appId: number,
    appGroupId: string,
    businessDate: string
  ): Promise<RoleAssignmentApiResponse<any[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Role Assignment Service] Using mock data for tollgate processes');
        await this.simulateNetworkDelay();
        
        const mockTollgateProcesses = [
          {
            processId: "TG1_VALIDATION",
            name: "TG1 - Data Validation",
            status: "COMPLETED",
            canReopen: true,
            lastUpdated: "2025-08-12 19:04:31"
          },
          {
            processId: "TG2_APPROVAL", 
            name: "TG2 - Management Approval",
            status: "COMPLETED",
            canReopen: true,
            lastUpdated: "2025-08-12 18:30:15"
          },
          {
            processId: "TG3_PUBLISH",
            name: "TG3 - Publish Attestation",
            status: "COMPLETED", 
            canReopen: false,
            lastUpdated: "2025-08-12 19:04:31"
          }
        ];
        
        return this.createApiResponse(mockTollgateProcesses);
      }

      console.log('[Role Assignment Service] Fetching tollgate processes from Java API');
      const encodedDate = encodeURIComponent(businessDate);
      const response = await this.javaAxiosInstance.get(
        `/process/tollgate/${appId}/${appGroupId}/${encodedDate}`
      );
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Role Assignment Service] Error fetching tollgate processes:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch tollgate processes'
      );
    }
  }

  // Reopen tollgate process (Java API)
  async reopenTollgateProcess(
    appId: number,
    appGroupId: string,
    businessDate: string,
    processId: string,
    action: 'reopen' | 'close'
  ): Promise<RoleAssignmentApiResponse<any>> {
    try {
      if (this.isMockMode()) {
        console.log(`[Role Assignment Service] Using mock ${action} for tollgate process:`, processId);
        await this.simulateNetworkDelay(1000);
        
        return this.createApiResponse({ 
          success: true, 
          message: `Tollgate process ${processId} ${action}ed successfully`,
          processId,
          action,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`[Role Assignment Service] ${action}ing tollgate process via Java API:`, processId);
      const encodedDate = encodeURIComponent(businessDate);
      
      const payload = {
        processId,
        action,
        appId,
        appGroupId,
        businessDate,
        updatedBy: 'current_user' // This should come from auth context
      };

      const response = await this.javaAxiosInstance.post(
        `/process/tollgate/${appId}/${appGroupId}/${encodedDate}`,
        payload
      );
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error(`[Role Assignment Service] Error ${action}ing tollgate process:`, error);
      
      return this.createApiResponse(
        null,
        false,
        error.response?.data?.message || error.message || `Failed to ${action} tollgate process`
      );
    }
  }

  // Get environment info
  getEnvironmentInfo(): { mode: string; dotNetBaseUrl: string; javaBaseUrl: string; isMock: boolean } {
    return {
      mode: process.env.NEXT_PUBLIC_API_MODE || 'auto',
      dotNetBaseUrl: this.dotNetBaseUrl,
      javaBaseUrl: this.javaBaseUrl,
      isMock: this.isMockMode()
    };
  }
}

// Create and export a singleton instance
export const roleAssignmentService = new RoleAssignmentService();

// Export the class for testing or custom instances
export { RoleAssignmentService };