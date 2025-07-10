import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  Application, 
  ApiResponse, 
  ApplicationParameter,
  WorkflowRole,
  UniqueApplication,
  UniqueRole,
  ApplicationRoleMapping,
  WorkflowCalendar,
  UniqueCalendar,
  ApplicationCalendarMapping,
  CalendarSaveRequest,
  WorkflowRunCalendar,
  UniqueRunCalendar,
  ApplicationRunCalendarMapping,
  RunCalendarSaveRequest
} from '@/types/application-types';
import { 
  UniqueHierarchy, 
  HierarchyDetail, 
  SetHierarchyRequest, 
  ApplicationToHierarchyMap, 
  SetApplicationHierarchyMapRequest 
} from '@/types/hierarchy-api-types';

// Metadata types
interface MetadataApplication {
  appId: number;
  name: string;
  category: string;
  description: string;
  updatedby: string;
  updatedon: string;
  isactive: number;
  entitlementMapping: number;
  islockingenabled: number;
  lockingrole: number;
  cronexpression: string;
  startdate: number;
  expirydate: number;
  useruncalendar: number;
  rundateoffset: number;
  isrunonweekdayonly: number;
}

interface MetadataStage {
  stageId: number;
  workflowApplication: { appId: number };
  name: string;
  updatedby: string;
  updatedon: string;
  description?: string;
}

interface CreateStageRequest {
  stageId: null;
  name: string;
  updatedby: string;
  updatedon: null;
  workflowApplication: { appId: number };
  description: string;
}

interface UpdateStageRequest {
  stageId: number;
  name: string;
  updatedby: string;
  updatedon: null;
  workflowApplication: { appId: number };
  description: string;
}

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

// Mock data for workflow calendars - matching your API specification
const MOCK_WORKFLOW_CALENDARS: WorkflowCalendar[] = [
  {
    calendarName: "Netting POC Calendar",
    calendarDescription: "Netting POC Calendar",
    businessDate: "25-Dec-2020"
  },
  {
    calendarName: "Netting POC Calendar",
    calendarDescription: "Netting POC Calendar",
    businessDate: "01-Jan-2021"
  },
  {
    calendarName: "Daily Named Pnl Holiday Calendar",
    calendarDescription: "Daily Named Pnl Holiday Calendar",
    businessDate: "01-Jan-2020"
  },
  {
    calendarName: "Daily Named Pnl Holiday Calendar",
    calendarDescription: "Daily Named Pnl Holiday Calendar",
    businessDate: "25-Dec-2020"
  },
  {
    calendarName: "Daily Workspace Pnl Holiday Calendar",
    calendarDescription: "Daily Workspace Pnl Holiday Calendar",
    businessDate: "01-Jan-2020"
  },
  {
    calendarName: "Daily Workspace Pnl Holiday Calendar",
    calendarDescription: "Daily Workspace Pnl Holiday Calendar",
    businessDate: "04-Jul-2020"
  },
  {
    calendarName: "Daily Workspace Pnl Holiday Calendar",
    calendarDescription: "Daily Workspace Pnl Holiday Calendar",
    businessDate: "25-Dec-2020"
  }
];

// Mock data for unique calendars - matching your API specification
const MOCK_UNIQUE_CALENDARS: UniqueCalendar[] = [
  { calendarName: "Daily Named Pnl Holiday Calendar" },
  { calendarName: "Daily Workspace Pnl Holiday Calendar" },
  { calendarName: "Netting POC Calendar" }
];

// Mock data for application-calendar mappings - matching your API specification
const MOCK_APPLICATION_CALENDAR_MAPPINGS: ApplicationCalendarMapping[] = [
  {
    applicationId: 1,
    applicationName: "Daily Named Pnl",
    calendarName: "Daily Named Pnl Holiday Calendar"
  },
  {
    applicationId: 2,
    applicationName: "Daily Workspace Pnl",
    calendarName: "Daily Workspace Pnl Holiday Calendar"
  },
  {
    applicationId: 8,
    applicationName: "Netting",
    calendarName: "Netting POC Calendar"
  },
  {
    applicationId: 11,
    applicationName: "Netting Dev",
    calendarName: "Netting POC Calendar"
  }
];

// Mock data for workflow run calendars - matching your API specification
const MOCK_WORKFLOW_RUN_CALENDARS: WorkflowRunCalendar[] = [
  {
    calendarName: "Netting POC Calendar",
    calendarDescription: "Netting POC Calendar",
    businessDate: "25-Dec-2020"
  },
  {
    calendarName: "Netting POC Calendar",
    calendarDescription: "Netting POC Calendar",
    businessDate: "01-Jan-2021"
  },
  {
    calendarName: "Daily Named Pnl Holiday Calendar",
    calendarDescription: "Daily Named Pnl Holiday Calendar",
    businessDate: "01-Jan-2020"
  },
  {
    calendarName: "Daily Named Pnl Holiday Calendar",
    calendarDescription: "Daily Named Pnl Holiday Calendar",
    businessDate: "25-Dec-2020"
  },
  {
    calendarName: "Daily Workspace Pnl Holiday Calendar",
    calendarDescription: "Daily Workspace Pnl Holiday Calendar",
    businessDate: "01-Jan-2020"
  },
  {
    calendarName: "Daily Workspace Pnl Holiday Calendar",
    calendarDescription: "Daily Workspace Pnl Holiday Calendar",
    businessDate: "04-Jul-2020"
  },
  {
    calendarName: "Daily Workspace Pnl Holiday Calendar",
    calendarDescription: "Daily Workspace Pnl Holiday Calendar",
    businessDate: "25-Dec-2020"
  }
];

// Mock data for unique run calendars - matching your API specification
const MOCK_UNIQUE_RUN_CALENDARS: UniqueRunCalendar[] = [
  { calendarName: "Daily Named Pnl Holiday Calendar" },
  { calendarName: "Daily Workspace Pnl Holiday Calendar" },
  { calendarName: "Netting POC Calendar" }
];

// Mock data for application-run calendar mappings - matching your API specification
const MOCK_APPLICATION_RUN_CALENDAR_MAPPINGS: ApplicationRunCalendarMapping[] = [
  {
    applicationId: 1,
    applicationName: "Daily Named Pnl",
    calendarName: "Daily Named Pnl Holiday Calendar"
  },
  {
    applicationId: 2,
    applicationName: "Daily Workspace Pnl",
    calendarName: "Daily Workspace Pnl Holiday Calendar"
  },
  {
    applicationId: 8,
    applicationName: "Netting",
    calendarName: "Netting POC Calendar"
  },
  {
    applicationId: 11,
    applicationName: "Netting Dev",
    calendarName: "Netting POC Calendar"
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

// Mock data for metadata management
const MOCK_METADATA_APPLICATIONS: MetadataApplication[] = [
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
    expirydate: 253402214406008,
    useruncalendar: 0,
    rundateoffset: 1,
    isrunonweekdayonly: 1
  },
  {
    appId: 17,
    name: "Basel",
    category: "Basel",
    description: "Basel regulatory reporting",
    updatedby: "kumarp15",
    updatedon: "2023-09-28 01:27:39",
    isactive: 1,
    entitlementMapping: 12,
    islockingenabled: 0,
    lockingrole: 0,
    cronexpression: "0 55 18 ? * MON-FRI *",
    startdate: 1695859659000,
    expirydate: 253402214400000,
    useruncalendar: 0,
    rundateoffset: 0,
    isrunonweekdayonly: 1
  }
];

const MOCK_METADATA_STAGES: Record<number, MetadataStage[]> = {
  17: [
    {
      stageId: 1056,
      workflowApplication: { appId: 17 },
      name: "Director Sign off/Attestation Complete",
      updatedby: "kumarp15",
      updatedon: "2023-09-28 01:27:39"
    },
    {
      stageId: 1055,
      workflowApplication: { appId: 17 },
      name: "Director Review and Challenge",
      updatedby: "kumarp15",
      updatedon: "2023-09-28 01:27:31"
    },
    {
      stageId: 1054,
      workflowApplication: { appId: 17 },
      name: "Review BOP (Status of Build, System vs topline, compliance to rules, impact of)",
      updatedby: "kumarp15",
      updatedon: "2023-09-28 01:25:16"
    },
    {
      stageId: 1053,
      workflowApplication: { appId: 17 },
      name: "Generate Dashboard & Review",
      updatedby: "kumarp15",
      updatedon: "2023-09-28 01:24:54"
    }
  ],
  1: [
    {
      stageId: 1001,
      workflowApplication: { appId: 1 },
      name: "Data Collection",
      updatedby: "system",
      updatedon: "2024-01-15 09:30:00"
    },
    {
      stageId: 1002,
      workflowApplication: { appId: 1 },
      name: "Data Validation",
      updatedby: "system",
      updatedon: "2024-01-15 09:35:00"
    }
  ],
  2: [
    {
      stageId: 2001,
      workflowApplication: { appId: 2 },
      name: "Workspace Setup",
      updatedby: "admin",
      updatedon: "2024-02-01 10:00:00"
    }
  ]
};

// Mock in-progress status for applications
const MOCK_IN_PROGRESS_STATUS: Record<number, boolean> = {
  17: false,
  1: false,
  2: true // This application is currently importing
};

class WorkflowService {
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
    // .NET service for roles, calendar - http://api.com/
    const baseUrl = process.env.NEXT_PUBLIC_DOTNET_BASE_URL || 'http://api.com';
    if (this.isMockMode()) {
      return 'http://localhost:3000';
    }
    return baseUrl;
  }

  private getJavaBaseUrl(): string {
    // Java service for metadata - http://api-workflow.com
    const baseUrl = process.env.NEXT_PUBLIC_JAVA_BASE_URL || 'http://api-workflow.com';
    if (this.isMockMode()) {
      return 'http://localhost:3000';
    }
    return baseUrl;
  }

  private createDotNetAxiosInstance(): AxiosInstance {
    // .NET service uses /api/WF base path
    const baseURL = `${this.dotNetBaseUrl}/api/WF`;
    
    const instance = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true, // Use credentials for Windows authentication
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for authentication and logging
    instance.interceptors.request.use(
      (config) => {
        console.log(`[.NET API Request] ${config.method?.toUpperCase()} ${config.url}`);
        
        // Add any additional headers for Windows auth if needed
        if (this.isWindowsAuthEnvironment()) {
          config.headers['X-Requested-With'] = 'XMLHttpRequest';
        }
        
        return config;
      },
      (error) => {
        console.error('[.NET API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and logging
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[.NET API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[.NET API Response Error]', {
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

  private createJavaAxiosInstance(): AxiosInstance {
    // Java service uses /api base path
    const baseURL = `${this.javaBaseUrl}/api`;
    
    const instance = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: false, // Java service does NOT use Windows authentication
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for logging (no Windows auth for Java service)
    instance.interceptors.request.use(
      (config) => {
        console.log(`[Java API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[Java API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and logging
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[Java API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[Java API Response Error]', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });

        // Handle specific error cases for Java service
        if (error.response?.status === 401) {
          console.error('Authentication failed - Java service authentication issue');
        } else if (error.response?.status === 403) {
          console.error('Access forbidden - insufficient permissions');
        } else if (error.response?.status >= 500) {
          console.error('Server error - check Java API availability');
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }

  private isWindowsAuthEnvironment(): boolean {
    // Check if we're in an environment that uses Windows authentication
    // Only .NET service uses Windows auth, Java service does not
    return !this.isMockMode() && 
           !this.dotNetBaseUrl.includes('localhost');
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
      environment: this.isMockMode() ? 'Mock Data' : `DotNet: ${this.dotNetBaseUrl}, Java: ${this.javaBaseUrl}`
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
      const response = await this.dotNetAxiosInstance.get<Application[]>('/GetWorkflowApplicationDetails/false');
      
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
      const response = await this.dotNetAxiosInstance.post<number>('/SetApplication', application);
      
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
      const response = await this.dotNetAxiosInstance.get<ApplicationParameter[]>(`/appparam/${appId}`);
      
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
      const response = await this.dotNetAxiosInstance.post<ApplicationParameter[]>('/WorkflowAppParam', parameter);
      
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
      const response = await this.dotNetAxiosInstance.get<WorkflowRole[]>('/GetWorkflowRoleDetails/false');
      
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
      const response = await this.dotNetAxiosInstance.post<number>('/SetRoles', roles);
      
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
      const response = await this.dotNetAxiosInstance.get<UniqueApplication[]>('/GetWorkflowUniqueApplications');
      
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
      const response = await this.dotNetAxiosInstance.get<UniqueRole[]>('/GetWorkflowUniqueRoles');
      
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
      const response = await this.dotNetAxiosInstance.get<ApplicationRoleMapping[]>('/GetWorkflowApplicationToRoleMap');
      
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
      // API expects: [{ "applicationId": "17", "roleId": "38" }, { "applicationId": "17", "roleId": "21" }]
      const apiPayload = mappings.map(mapping => ({
        applicationId: mapping.applicationId.toString(),
        roleId: mapping.roleId.toString()
      }));

      console.log('[Workflow Service] Saving application-role mappings to API:', apiPayload);
      const response = await this.dotNetAxiosInstance.post<number>('/SetApplicationToRoleMap', apiPayload);
      
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
        applicationId: mapping.applicationId.toString(),
        roleId: mapping.roleId.toString()
      }));

      console.log('[Workflow Service] Saving optimized application-role mappings to API:');
      console.log('[Workflow Service] Edited applications:', editedApplicationIds);
      console.log('[Workflow Service] Mappings to send:', apiPayload);
      console.log('[Workflow Service] Total mappings sent:', apiPayload.length, 'instead of', allCurrentMappings.length);

      const response = await this.dotNetAxiosInstance.post<number>('/SetApplicationToRoleMap', apiPayload);
      
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

  // ===== CALENDAR MANAGEMENT METHODS =====

  // Get all workflow calendars
  async getWorkflowCalendars(): Promise<ApiResponse<WorkflowCalendar[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for workflow calendars');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_WORKFLOW_CALENDARS);
      }

      console.log('[Workflow Service] Fetching workflow calendars from API');
      const response = await this.dotNetAxiosInstance.get<WorkflowCalendar[]>('/GetWorkflowCalendarDetails');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching workflow calendars:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch workflow calendars'
      );
    }
  }

  // Save/update calendars
  async saveCalendars(calendars: WorkflowCalendar[]): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for calendars');
        await this.simulateNetworkDelay(800);
        
        // Update mock data based on action
        calendars.forEach(calendar => {
          if (calendar.action === 3) {
            // Delete action - remove from mock data
            const index = MOCK_WORKFLOW_CALENDARS.findIndex(c => 
              c.calendarName === calendar.calendarName && 
              c.businessDate === calendar.businessDate
            );
            if (index >= 0) {
              MOCK_WORKFLOW_CALENDARS.splice(index, 1);
            }
          } else {
            // Add/update action - add to mock data if not exists
            const exists = MOCK_WORKFLOW_CALENDARS.some(c => 
              c.calendarName === calendar.calendarName && 
              c.businessDate === calendar.businessDate
            );
            if (!exists) {
              MOCK_WORKFLOW_CALENDARS.push({
                calendarName: calendar.calendarName,
                calendarDescription: calendar.calendarDescription,
                businessDate: calendar.businessDate
              });
            }
          }
        });
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      console.log('[Workflow Service] Saving calendars to API:', calendars);
      const response = await this.dotNetAxiosInstance.post<number>('/SetCalendar', calendars);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving calendars:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save calendars'
      );
    }
  }

  // Get unique calendars
  async getUniqueCalendars(): Promise<ApiResponse<UniqueCalendar[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for unique calendars');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_UNIQUE_CALENDARS);
      }

      console.log('[Workflow Service] Fetching unique calendars from API');
      const response = await this.dotNetAxiosInstance.get<UniqueCalendar[]>('/GetWorkflowUniqueCalendars');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching unique calendars:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch unique calendars'
      );
    }
  }

  // Get application-calendar mappings
  async getApplicationCalendarMappings(): Promise<ApiResponse<ApplicationCalendarMapping[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for application-calendar mappings');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_APPLICATION_CALENDAR_MAPPINGS);
      }

      console.log('[Workflow Service] Fetching application-calendar mappings from API');
      const response = await this.dotNetAxiosInstance.get<ApplicationCalendarMapping[]>('/GetWorkflowApplicationToCalendarMap');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching application-calendar mappings:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch application-calendar mappings'
      );
    }
  }

  // Save application-calendar mapping
  async saveApplicationCalendarMapping(mapping: CalendarSaveRequest): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for application-calendar mapping');
        await this.simulateNetworkDelay(800);
        
        // Update mock data based on action
        if (mapping.action === 3) {
          // Delete action - remove from mock data
          const index = MOCK_APPLICATION_CALENDAR_MAPPINGS.findIndex(m => 
            m.applicationId === mapping.applicationId
          );
          if (index >= 0) {
            MOCK_APPLICATION_CALENDAR_MAPPINGS.splice(index, 1);
          }
        } else {
          // Add/update action
          const existingIndex = MOCK_APPLICATION_CALENDAR_MAPPINGS.findIndex(m => 
            m.applicationId === mapping.applicationId
          );
          
          // Find application name from mock applications
          const application = MOCK_APPLICATIONS.find(app => app.applicationId === mapping.applicationId);
          const applicationName = application ? application.name : `Application ${mapping.applicationId}`;
          
          const newMapping: ApplicationCalendarMapping = {
            applicationId: mapping.applicationId,
            applicationName: applicationName,
            calendarName: mapping.calendarName
          };
          
          if (existingIndex >= 0) {
            MOCK_APPLICATION_CALENDAR_MAPPINGS[existingIndex] = newMapping;
          } else {
            MOCK_APPLICATION_CALENDAR_MAPPINGS.push(newMapping);
          }
        }
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      console.log('[Workflow Service] Saving application-calendar mapping to API:', mapping);
      const response = await this.dotNetAxiosInstance.post<number>('/SetApplicationToCalendarMap', mapping);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving application-calendar mapping:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save application-calendar mapping'
      );
    }
  }

  // ===== RUN CALENDAR MANAGEMENT METHODS =====

  // Get all workflow run calendars
  async getWorkflowRunCalendars(): Promise<ApiResponse<WorkflowRunCalendar[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for workflow run calendars');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_WORKFLOW_RUN_CALENDARS);
      }

      console.log('[Workflow Service] Fetching workflow run calendars from API');
      const response = await this.dotNetAxiosInstance.get<WorkflowRunCalendar[]>('/GetWorkflowRunCalendarDetails');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching workflow run calendars:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch workflow run calendars'
      );
    }
  }

  // Save/update run calendars
  async saveRunCalendars(calendars: WorkflowRunCalendar[]): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for run calendars');
        await this.simulateNetworkDelay(800);
        
        // Update mock data based on action
        calendars.forEach(calendar => {
          if (calendar.action === 3) {
            // Delete action - remove from mock data
            const index = MOCK_WORKFLOW_RUN_CALENDARS.findIndex(c => 
              c.calendarName === calendar.calendarName && 
              c.businessDate === calendar.businessDate
            );
            if (index >= 0) {
              MOCK_WORKFLOW_RUN_CALENDARS.splice(index, 1);
            }
          } else {
            // Add/update action - add to mock data if not exists
            const exists = MOCK_WORKFLOW_RUN_CALENDARS.some(c => 
              c.calendarName === calendar.calendarName && 
              c.businessDate === calendar.businessDate
            );
            if (!exists) {
              MOCK_WORKFLOW_RUN_CALENDARS.push({
                calendarName: calendar.calendarName,
                calendarDescription: calendar.calendarDescription,
                businessDate: calendar.businessDate
              });
            }
          }
        });
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      console.log('[Workflow Service] Saving run calendars to API:', calendars);
      const response = await this.dotNetAxiosInstance.post<number>('/SetRunCalendar', calendars);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving run calendars:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save run calendars'
      );
    }
  }

  // Get unique run calendars
  async getUniqueRunCalendars(): Promise<ApiResponse<UniqueRunCalendar[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for unique run calendars');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_UNIQUE_RUN_CALENDARS);
      }

      console.log('[Workflow Service] Fetching unique run calendars from API');
      const response = await this.dotNetAxiosInstance.get<UniqueRunCalendar[]>('/GetWorkflowUniqueRunCalendars');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching unique run calendars:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch unique run calendars'
      );
    }
  }

  // Get application-run calendar mappings
  async getApplicationRunCalendarMappings(): Promise<ApiResponse<ApplicationRunCalendarMapping[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for application-run calendar mappings');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_APPLICATION_RUN_CALENDAR_MAPPINGS);
      }

      console.log('[Workflow Service] Fetching application-run calendar mappings from API');
      const response = await this.dotNetAxiosInstance.get<ApplicationRunCalendarMapping[]>('/GetWorkflowApplicationToRunCalendarMap');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching application-run calendar mappings:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch application-run calendar mappings'
      );
    }
  }

  // Save application-run calendar mapping
  async saveApplicationRunCalendarMapping(mapping: RunCalendarSaveRequest): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for application-run calendar mapping');
        await this.simulateNetworkDelay(800);
        
        // Update mock data based on action
        if (mapping.action === 3) {
          // Delete action - remove from mock data
          const index = MOCK_APPLICATION_RUN_CALENDAR_MAPPINGS.findIndex(m => 
            m.applicationId === mapping.applicationId
          );
          if (index >= 0) {
            MOCK_APPLICATION_RUN_CALENDAR_MAPPINGS.splice(index, 1);
          }
        } else {
          // Add/update action
          const existingIndex = MOCK_APPLICATION_RUN_CALENDAR_MAPPINGS.findIndex(m => 
            m.applicationId === mapping.applicationId
          );
          
          // Find application name from mock applications
          const application = MOCK_APPLICATIONS.find(app => app.applicationId === mapping.applicationId);
          const applicationName = application ? application.name : `Application ${mapping.applicationId}`;
          
          const newMapping: ApplicationRunCalendarMapping = {
            applicationId: mapping.applicationId,
            applicationName: applicationName,
            calendarName: mapping.calendarName
          };
          
          if (existingIndex >= 0) {
            MOCK_APPLICATION_RUN_CALENDAR_MAPPINGS[existingIndex] = newMapping;
          } else {
            MOCK_APPLICATION_RUN_CALENDAR_MAPPINGS.push(newMapping);
          }
        }
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      console.log('[Workflow Service] Saving application-run calendar mapping to API:', mapping);
      const response = await this.dotNetAxiosInstance.post<number>('/SetApplicationToRunCalendarMap', mapping);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving application-run calendar mapping:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save application-run calendar mapping'
      );
    }
  }

  // ===== HIERARCHY MANAGEMENT METHODS =====

  // Get unique hierarchies
  async getUniqueHierarchies(): Promise<ApiResponse<UniqueHierarchy[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for unique hierarchies');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_UNIQUE_HIERARCHIES);
      }

      console.log('[Workflow Service] Fetching unique hierarchies from API');
      const response = await this.dotNetAxiosInstance.get<UniqueHierarchy[]>('/GetWorkflowUniqueHierarchy');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching unique hierarchies:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch unique hierarchies'
      );
    }
  }

  // Get hierarchy details
  async getHierarchyDetails(): Promise<ApiResponse<HierarchyDetail[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for hierarchy details');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_HIERARCHY_DETAILS);
      }

      console.log('[Workflow Service] Fetching hierarchy details from API');
      const response = await this.dotNetAxiosInstance.get<HierarchyDetail[]>('/GetWorkflowHierarchyDetails');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching hierarchy details:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch hierarchy details'
      );
    }
  }

  // Set/Update hierarchy
  async setHierarchy(hierarchyData: SetHierarchyRequest[]): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for hierarchy');
        await this.simulateNetworkDelay(800);
        
        // Update mock data based on action
        hierarchyData.forEach(hierarchy => {
          if (hierarchy.action === 3) {
            // Delete action - remove from mock data
            const hierarchyIndex = MOCK_UNIQUE_HIERARCHIES.findIndex(h => h.hierarchyId === hierarchy.hierarchyId);
            if (hierarchyIndex >= 0) {
              MOCK_UNIQUE_HIERARCHIES.splice(hierarchyIndex, 1);
            }
            
            // Remove from details
            const detailsToRemove = MOCK_HIERARCHY_DETAILS.filter(d => d.hierarchyId === hierarchy.hierarchyId);
            detailsToRemove.forEach(detail => {
              const detailIndex = MOCK_HIERARCHY_DETAILS.indexOf(detail);
              if (detailIndex >= 0) {
                MOCK_HIERARCHY_DETAILS.splice(detailIndex, 1);
              }
            });
          } else {
            // Add/update action
            const existingHierarchyIndex = MOCK_UNIQUE_HIERARCHIES.findIndex(h => h.hierarchyId === hierarchy.hierarchyId);
            if (existingHierarchyIndex >= 0) {
              MOCK_UNIQUE_HIERARCHIES[existingHierarchyIndex].hierarchyName = hierarchy.hierarchyName;
            } else if (hierarchy.action === 1) {
              // Add new hierarchy
              const newHierarchyId = Math.max(...MOCK_UNIQUE_HIERARCHIES.map(h => h.hierarchyId), 0) + 1;
              MOCK_UNIQUE_HIERARCHIES.push({
                hierarchyId: newHierarchyId,
                hierarchyName: hierarchy.hierarchyName
              });
              hierarchy.hierarchyId = newHierarchyId;
            }
            
            // Update hierarchy details
            const existingDetailIndex = MOCK_HIERARCHY_DETAILS.findIndex(d => 
              d.hierarchyId === hierarchy.hierarchyId && d.hierarchyLevel === hierarchy.hierarchyLevel
            );
            
            const detailData: HierarchyDetail = {
              hierarchyId: hierarchy.hierarchyId,
              hierarchyName: hierarchy.hierarchyName,
              hierarchyDescription: hierarchy.hierarchyDescription,
              hierarchyLevel: hierarchy.hierarchyLevel,
              columnName: hierarchy.columnName,
              parentHierarchyLevel: hierarchy.parentHierarchyLevel,
              parentColumnName: hierarchy.parentcolumnName,
              isUsedForEntitlements: hierarchy.isUsedForEntitlements,
              isUsedForWorkflowInstance: hierarchy.isUsedForworkflowInstance
            };
            
            if (existingDetailIndex >= 0) {
              MOCK_HIERARCHY_DETAILS[existingDetailIndex] = detailData;
            } else {
              MOCK_HIERARCHY_DETAILS.push(detailData);
            }
          }
        });
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      console.log('[Workflow Service] Saving hierarchy to API:', hierarchyData);
      const response = await this.dotNetAxiosInstance.post<number>('/setHierarchy', hierarchyData);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving hierarchy:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save hierarchy'
      );
    }
  }

  // Get application to hierarchy map
  async getApplicationToHierarchyMap(): Promise<ApiResponse<ApplicationToHierarchyMap[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for application-hierarchy mappings');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_APPLICATION_HIERARCHY_MAP);
      }

      console.log('[Workflow Service] Fetching application-hierarchy mappings from API');
      const response = await this.dotNetAxiosInstance.get<ApplicationToHierarchyMap[]>('/GetWorkflowApplicationToHierarchyMap');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching application-hierarchy mappings:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch application-hierarchy mappings'
      );
    }
  }

  // Set application to hierarchy map
  async setApplicationHierarchyMap(mappingData: SetApplicationHierarchyMapRequest): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock save for application-hierarchy mapping');
        await this.simulateNetworkDelay(800);
        
        // Update mock data based on action
        if (mappingData.action === 3) {
          // Delete action - remove from mock data
          const index = MOCK_APPLICATION_HIERARCHY_MAP.findIndex(m => 
            m.applicationId === mappingData.applicationId && m.hierarchyId === mappingData.hierarchyId
          );
          if (index >= 0) {
            MOCK_APPLICATION_HIERARCHY_MAP.splice(index, 1);
          }
        } else {
          // Add/update action
          const existingIndex = MOCK_APPLICATION_HIERARCHY_MAP.findIndex(m => 
            m.applicationId === mappingData.applicationId
          );
          
          // Find application name from mock applications
          const application = MOCK_APPLICATIONS.find(app => app.applicationId === mappingData.applicationId);
          const applicationName = application ? application.name : `Application ${mappingData.applicationId}`;
          
          // Find hierarchy name from mock hierarchies
          const hierarchy = MOCK_UNIQUE_HIERARCHIES.find(h => h.hierarchyId === mappingData.hierarchyId);
          const hierarchyName = hierarchy ? hierarchy.hierarchyName : `Hierarchy ${mappingData.hierarchyId}`;
          
          const newMapping: ApplicationToHierarchyMap = {
            applicationId: mappingData.applicationId,
            hierarchyId: mappingData.hierarchyId,
            applicationName: applicationName,
            hierarchyName: hierarchyName
          };
          
          if (existingIndex >= 0) {
            MOCK_APPLICATION_HIERARCHY_MAP[existingIndex] = newMapping;
          } else {
            MOCK_APPLICATION_HIERARCHY_MAP.push(newMapping);
          }
        }
        
        // Simulate successful save by returning 1
        return this.createApiResponse(1);
      }

      console.log('[Workflow Service] Saving application-hierarchy mapping to API:', mappingData);
      const response = await this.dotNetAxiosInstance.post<number>('/SetApplicationHierarchyMap', mappingData);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error saving application-hierarchy mapping:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to save application-hierarchy mapping'
      );
    }
  }

  // ===== METADATA MANAGEMENT METHODS =====

  // Get all metadata applications
  async getMetadataApplications(): Promise<ApiResponse<MetadataApplication[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for metadata applications');
        await this.simulateNetworkDelay();
        return this.createApiResponse(MOCK_METADATA_APPLICATIONS);
      }

      console.log('[Workflow Service] Fetching metadata applications from Java API');
      const response = await this.javaAxiosInstance.get<MetadataApplication[]>('/workflowapp');
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching metadata applications:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch metadata applications'
      );
    }
  }

  // Get stages by application ID
  async getStagesByApplicationId(appId: number): Promise<ApiResponse<MetadataStage[]>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for stages by application ID:', appId);
        await this.simulateNetworkDelay();
        
        const stages = MOCK_METADATA_STAGES[appId] || [];
        return this.createApiResponse(stages);
      }

      console.log('[Workflow Service] Fetching stages from Java API for appId:', appId);
      const response = await this.javaAxiosInstance.get<MetadataStage[]>(`/stage?appId=${appId}`);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error fetching stages:', error);
      
      return this.createApiResponse(
        [],
        false,
        error.response?.data?.message || error.message || 'Failed to fetch stages'
      );
    }
  }

  // Check if application is in progress (importing)
  async checkApplicationInProgress(appId: number): Promise<ApiResponse<boolean>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock data for application in progress check:', appId);
        await this.simulateNetworkDelay();
        
        const inProgress = MOCK_IN_PROGRESS_STATUS[appId] || false;
        return this.createApiResponse(inProgress);
      }

      console.log('[Workflow Service] Checking application in progress from Java API for appId:', appId);
      const response = await this.javaAxiosInstance.get<boolean>(`/workflowapp/${appId}/inProgress`);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error checking application in progress:', error);
      
      return this.createApiResponse(
        false,
        false,
        error.response?.data?.message || error.message || 'Failed to check application in progress status'
      );
    }
  }

  // Create new stage
  async createStage(stageData: CreateStageRequest): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock create for stage');
        await this.simulateNetworkDelay(800);
        
        // Generate new stage ID
        const newStageId = Date.now();
        
        // Add to mock data
        const appId = stageData.workflowApplication.appId;
        if (!MOCK_METADATA_STAGES[appId]) {
          MOCK_METADATA_STAGES[appId] = [];
        }
        
        const newStage: MetadataStage = {
          stageId: newStageId,
          workflowApplication: { appId },
          name: stageData.name,
          updatedby: stageData.updatedby,
          updatedon: new Date().toISOString(),
          description: stageData.description
        };
        
        MOCK_METADATA_STAGES[appId].push(newStage);
        
        // Return the newly created stage ID
        return this.createApiResponse(newStageId);
      }

      console.log('[Workflow Service] Creating stage via Java API:', stageData);
      const response = await this.javaAxiosInstance.post<number>('/stage', stageData);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error creating stage:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to create stage'
      );
    }
  }

  // Update existing stage
  async updateStage(stageId: number, stageData: UpdateStageRequest): Promise<ApiResponse<number>> {
    try {
      if (this.isMockMode()) {
        console.log('[Workflow Service] Using mock update for stage:', stageId);
        await this.simulateNetworkDelay(800);
        
        // Update mock data
        const appId = stageData.workflowApplication.appId;
        if (MOCK_METADATA_STAGES[appId]) {
          const stageIndex = MOCK_METADATA_STAGES[appId].findIndex(s => s.stageId === stageId);
          if (stageIndex >= 0) {
            MOCK_METADATA_STAGES[appId][stageIndex] = {
              stageId,
              workflowApplication: { appId },
              name: stageData.name,
              updatedby: stageData.updatedby,
              updatedon: new Date().toISOString(),
              description: stageData.description
            };
          }
        }
        
        // Return the updated stage ID
        return this.createApiResponse(stageId);
      }

      console.log('[Workflow Service] Updating stage via Java API:', stageId, stageData);
      const response = await this.javaAxiosInstance.put<number>(`/stage/${stageId}`, stageData);
      
      return this.createApiResponse(response.data);
    } catch (error: any) {
      console.error('[Workflow Service] Error updating stage:', error);
      
      return this.createApiResponse(
        0,
        false,
        error.response?.data?.message || error.message || 'Failed to update stage'
      );
    }
  }

  // Get current environment info
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
export const workflowService = new WorkflowService();

// Export the class for testing or custom instances
export { WorkflowService };