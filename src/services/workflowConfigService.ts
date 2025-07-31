import { getCurrentEnvironment } from '@/config/api-environments';
import type {
  WorkflowApp,
  WorkflowInstance,
  WorkflowMetadata,
  WorkflowAppConfig,
  WorkflowConfigSavePayload
} from '@/types/workflow-config-types';

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

// Mock data for development - Updated to match user's API response structure
const MOCK_WORKFLOW_APPS: WorkflowApp[] = [
  {
    appId: 1,
    name: "Daily Named Pnl",
    category: "NPL ID",
    description: "Daily Named Pnl",
    updatedby: "x01279711",
    updatedon: "2024-10-28 13:46:55",
    isactive: 1,
    entitlementMapping: 12,
    islockingenabled: 1,
    lockingrole: 2,
    cronexpression: "0 10 0? * MON-FRI *",
    startdate: 1730123215572,
    expirydate: 253402214400000,
    useruncalendar: 0,
    rundateoffset: 1,
    isrunonweekdayonly: 1
  },
  {
    appId: 2,
    name: "Daily Workspace Pnl",
    category: "WORKSPACE ID",
    description: "Daily Workspace Pnl",
    updatedby: "x01329873",
    updatedon: "2025-05-13 10:48:50",
    isactive: 1,
    entitlementMapping: 12,
    islockingenabled: 1,
    lockingrole: 2,
    cronexpression: "0 10 0? * MON-FRI *",
    startdate: 1747133330704,
    expirydate: 253402214400000,
    useruncalendar: 0,
    rundateoffset: 1,
    isrunonweekdayonly: 1
  },
  {
    appId: 17,
    name: "Basel",
    category: "Basel",
    description: "Basel regulatory reporting",
    updatedby: "system",
    updatedon: "2024-01-01 00:00:00",
    isactive: 1,
    entitlementMapping: 12,
    islockingenabled: 1,
    lockingrole: 2,
    cronexpression: "0 10 0? * MON-FRI *",
    startdate: 1704067200000,
    expirydate: 253402214400000,
    useruncalendar: 0,
    rundateoffset: 1,
    isrunonweekdayonly: 1
  }
];

const MOCK_WORKFLOW_INSTANCES: WorkflowInstance[] = [
  { appId: 17, configId: "1202", configName: "Automated Feed" },
  { appId: 17, configId: "2002", configName: "Calc Owner Analysis" },
  { appId: 17, configId: "2003", configName: "Data Validation" },
  { appId: 17, configId: "24000001", configName: "Internal Reporting" },
  { appId: 17, configId: "23000001", configName: "LE Owner Analysis" },
  { appId: 17, configId: "2001", configName: "Prudential Calculation" },
  { appId: 17, configId: "21000001", configName: "Prudential Calculation" },
  { appId: 1, configId: "1001", configName: "Daily PnL Process" },
  { appId: 1, configId: "1002", configName: "Monthly PnL Process" },
  { appId: 2, configId: "2001", configName: "Workspace Daily Process" },
  { appId: 2, configId: "2002", configName: "Workspace Weekly Process" }
];

// Updated mock metadata to match user's provided API response structure
const MOCK_METADATA: WorkflowMetadata = {
  WorkflowApplication: MOCK_WORKFLOW_APPS,
  WorkflowEmail: [
    {
      templateId: 1,
      name: "VP Sign off Template",
      emailBody: "<!DOCTYPE html><html><head><style>table { font-family: arial; }</style></head><body></body></html>",
      ishtml: "Y",
      description: "VP sign off email",
      updatedby: "arifinbe",
      updatedon: "2024-03-05 20:57:22",
      subject: "$ENVIRONMENT$ - VP Sign off Email Delivery",
      fromEmailList: "PCRWorkflow@barclays.com"
    },
    {
      templateId: 4,
      name: "Netting V6728 Upload Files",
      emailBody: "<h4><b>Please copy below mentioned files</b></h4>",
      ishtml: "Y",
      updatedby: "dhananjt",
      updatedon: "2021-07-29 08:45:21",
      subject: "Netting V6728 Upload Files",
      fromEmailList: "PCRWorkflow@barclays.com"
    }
  ],
  WorkflowSubstage: [
    {
      substageId: 5204,
      name: "Receive data: Source Data from CREDS",
      defaultstage: 765,
      attestationMapping: "6413;6414;",
      paramMapping: "162;",
      updatedby: "x01446259",
      updatedon: "2023-07-20 12:58:01",
      entitlementMapping: 21,
      followUp: "N"
    },
    {
      substageId: 5303,
      name: "Run Event: Metric Batch",
      defaultstage: 807,
      attestationMapping: "6591;6592;",
      updatedby: "x01446259",
      updatedon: "2023-07-20 13:06:10",
      entitlementMapping: 21,
      followUp: "N"
    }
  ],
  WorkflowStage: [
    {
      stageId: 765,
      workflowApplication: 17,
      name: "Receive data: Source Data from CREDS",
      updatedby: "x01446259",
      updatedon: "2023-07-20 12:52:34"
    },
    {
      stageId: 807,
      workflowApplication: 17,
      name: "Run Event: Metric Batch",
      updatedby: "x01446259",
      updatedon: "2023-07-20 13:06:10"
    },
    {
      stageId: 829,
      workflowApplication: 17,
      name: "Publish Status: Notification of approval",
      updatedby: "x01446259",
      updatedon: "2023-07-21 08:38:39"
    }
  ],
  WorkflowAttest: [
    {
      attestationId: 9997,
      name: "testvgjhvk",
      type: "DEFAULT",
      description: "hhkg",
      updatedby: "kumarp15",
      updatedon: "2025-07-10 15:58:39"
    },
    {
      attestationId: 7071,
      name: "Blocked",
      type: "DEFAULT",
      updatedby: "x01446259",
      updatedon: "2023-09-01 08:27:37"
    }
  ],
  WorkflowParams: [
    {
      paramId: 162,
      name: "foboPriority",
      paramType: "DEFAULT",
      updatedby: "SYSTEM",
      updatedon: "2020-08-07 23:07:18"
    },
    {
      paramId: 264,
      name: "msbkIds",
      paramType: "DEFAULT",
      description: "Master Book IDs (comma delimited)",
      updatedby: "SYSTEM",
      updatedon: "2020-10-09 17:35:37"
    }
  ]
};

const MOCK_CONFIG: WorkflowAppConfig[] = [
  {
    workflowAppConfigId: 197181,
    adhoc: "N",
    appGroupId: 1202,
    approval: "N",
    attest: "N",
    auto: "N",
    isactive: "Y",
    isalteryx: "N",
    substageSeq: 1,
    updatedby: "kumarp15",
    updatedon: "2025-07-30 00:31:50",
    upload: "N",
    workflowApplication: 17,
    workflowStage: {
      stageId: 765,
      name: "Receive data: Source Data from CREDS",
      updatedby: "kumarp15",
      updatedon: "2023-07-05 04:32:43"
    },
    workflowSubstage: {
      substageId: 5204,
      name: "Receive data: Source Data from CREDS",
      defaultstage: 765,
      attestationMapping: "6413;6414;",
      paramMapping: "162;",
      entitlementMapping: 21,
      followUp: "N",
      updatedby: "kumarp15",
      updatedon: "2023-07-05 04:36:28"
    }
  },
  {
    workflowAppConfigId: 197182,
    adhoc: "N",
    appGroupId: 1202,
    approval: "N",
    attest: "N",
    auto: "N",
    isactive: "Y",
    isalteryx: "N",
    substageSeq: 2,
    updatedby: "kumarp15",
    updatedon: "2025-07-30 00:31:50",
    upload: "N",
    workflowApplication: 17,
    workflowStage: 807,
    workflowSubstage: {
      substageId: 5303,
      name: "Run Event: Metric Batch",
      defaultstage: 807,
      attestationMapping: "6591;6592;",
      entitlementMapping: 21,
      followUp: "N",
      updatedby: "kumarp15",
      updatedon: "2023-07-05 04:37:05"
    },
    workflowAppConfigDeps: [
      {
        id: {
          workflowAppConfigId: 197182,
          dependencySubstageId: 197181
        }
      }
    ]
  }
];

class WorkflowConfigService {
  private environment = getCurrentEnvironment();

  // Generic API call method
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Determine if this is a Java API call or .NET API call based on URL
    const isJavaApi = url.includes(this.environment.javaApiUrl) || url.includes(this.environment.javaBaseUrl);
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
      credentials: isJavaApi ? 'omit' : 'include',
      ...options,
      headers,
    };

    try {
      console.log('Making API request:', { url, options: defaultOptions });
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response received:', { url, dataLength: Array.isArray(data) ? data.length : 'object' });
      return data;
    } catch (error: any) {
      console.error('API request failed:', { url, error: error.message });
      throw error;
    }
  }

  // Get workflow applications (Java API)
  async getWorkflowApps(): Promise<WorkflowApp[]> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_WORKFLOW_APPS;
    }

    const url = `${this.environment.javaApiUrl}/workflowapp`;
    console.log('Fetching workflow apps from:', url);
    
    try {
      const result = await this.makeRequest<WorkflowApp[]>(url);
      console.log('Successfully fetched workflow apps:', result?.length || 0, 'items');
      return result;
    } catch (error: any) {
      console.error('Failed to fetch workflow apps:', error);
      // If CORS fails, try the alternative endpoint structure
      try {
        const alternativeUrl = `${this.environment.javaBaseUrl}/api/workflowapp`;
        console.log('Trying alternative URL:', alternativeUrl);
        return await this.makeRequest<WorkflowApp[]>(alternativeUrl);
      } catch (altError: any) {
        console.error('Alternative URL also failed:', altError);
        throw new Error(`Failed to fetch workflow applications: ${error.message}. CORS may not be configured properly on the server.`);
      }
    }
  }

  // Get workflow instances (.NET API)
  async getWorkflowInstances(appId: number): Promise<WorkflowInstance[]> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_WORKFLOW_INSTANCES.filter(instance => instance.appId === appId);
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Fixed: coreApiUrl already includes /api/WF, so we only need to add the endpoint
    const url = `${this.environment.coreApiUrl}/GetAllWorkflowinstances/${dateStr}/${appId}`;
    return this.makeRequest<WorkflowInstance[]>(url);
  }

  // Get workflow metadata (Java API)
  async getWorkflowMetadata(appId: number): Promise<WorkflowMetadata> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_METADATA;
    }

    const url = `${this.environment.javaApiUrl}/workflowconfig/metadata/${appId}`;
    return this.makeRequest<WorkflowMetadata>(url);
  }

  // Get workflow configuration (Java API)
  // Updated logic: First try /all endpoint, if null/empty then return empty array
  async getWorkflowConfig(configId: string, appId: number): Promise<WorkflowAppConfig[]> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return MOCK_CONFIG;
    }

    // First try to get existing configuration using the /all endpoint
    try {
      const url = `${this.environment.javaApiUrl}/workflowconfig/${configId}/${appId}/all`;
      const result = await this.makeRequest<WorkflowAppConfig[]>(url);
      
      // If result is null or empty, return empty array
      if (!result || result.length === 0) {
        console.log('No existing configuration found, returning empty array');
        return [];
      }
      
      return result;
    } catch (error) {
      // If no configuration exists, return empty array
      console.log('No existing configuration found, returning empty array');
      return [];
    }
  }

  // Save workflow configuration (Java API - POST)
  async saveWorkflowConfig(
    configId: string, 
    appId: number, 
    payload: WorkflowConfigSavePayload[]
  ): Promise<WorkflowAppConfig[]> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Mock save payload:', payload);
      return MOCK_CONFIG;
    }

    const url = `${this.environment.javaApiUrl}/workflowconfig/${configId}/${appId}/setup`;
    return this.makeRequest<WorkflowAppConfig[]>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Update workflow configuration (Java API - PUT)
  async updateWorkflowConfig(
    configId: string, 
    appId: number, 
    payload: WorkflowConfigSavePayload[]
  ): Promise<WorkflowAppConfig[]> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Mock update payload:', payload);
      return MOCK_CONFIG;
    }

    const url = `${this.environment.javaApiUrl}/workflowconfig/${configId}/${appId}/setup`;
    return this.makeRequest<WorkflowAppConfig[]>(url, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Test connection
  async testConnection(): Promise<{ status: string; timestamp: string }> {
    if (isDevelopmentMode()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        status: 'Connected (Mock)',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      await this.getWorkflowApps();
      return {
        status: 'Connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Connection failed');
    }
  }
}

// Create and export service instance
export const workflowConfigService = new WorkflowConfigService();
export default workflowConfigService;