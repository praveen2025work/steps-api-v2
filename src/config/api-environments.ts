// Safe API Environment Configuration with validation
export interface ApiEnvironment {
  name: string;
  displayName: string;
  baseUrl: string;
  coreApiUrl: string;
  javaBaseUrl: string;
  javaApiUrl: string;
  authType: 'windows' | 'bearer' | 'basic';
  timeout: number;
  retryAttempts: number;
  description: string;
}

// URL validation function
const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Safe environment creation function
const createEnvironment = (config: Partial<ApiEnvironment> & { name: string }): ApiEnvironment => {
  const defaults = {
    displayName: config.name.charAt(0).toUpperCase() + config.name.slice(1),
    baseUrl: 'http://localhost:3000',
    coreApiUrl: 'http://localhost:3000/api/WF',
    javaBaseUrl: 'http://localhost:3000',
    javaApiUrl: 'http://localhost:3000/api',
    authType: 'windows' as const,
    timeout: 30000,
    retryAttempts: 3,
    description: `${config.name} environment`
  };

  const environment = { ...defaults, ...config } as ApiEnvironment;

  // Validate URLs
  if (!validateUrl(environment.baseUrl)) {
    console.warn(`Invalid baseUrl for ${environment.name}: ${environment.baseUrl}`);
    environment.baseUrl = defaults.baseUrl;
  }

  if (!validateUrl(environment.coreApiUrl)) {
    console.warn(`Invalid coreApiUrl for ${environment.name}: ${environment.coreApiUrl}`);
    environment.coreApiUrl = defaults.coreApiUrl;
  }

  if (!validateUrl(environment.javaBaseUrl)) {
    console.warn(`Invalid javaBaseUrl for ${environment.name}: ${environment.javaBaseUrl}`);
    environment.javaBaseUrl = defaults.javaBaseUrl;
  }

  if (!validateUrl(environment.javaApiUrl)) {
    console.warn(`Invalid javaApiUrl for ${environment.name}: ${environment.javaApiUrl}`);
    environment.javaApiUrl = defaults.javaApiUrl;
  }

  return environment;
};

export const API_ENVIRONMENTS: Record<string, ApiEnvironment> = {
  local: createEnvironment({
    name: 'local',
    displayName: 'Local Development',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080',
    coreApiUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}/api/WF`,
    javaBaseUrl: process.env.NEXT_PUBLIC_JAVA_BASE_URL || 'http://localhost:8081',
    javaApiUrl: `${process.env.NEXT_PUBLIC_JAVA_BASE_URL || 'http://localhost:8081'}/api`,
    description: 'Local development environment with custom URL'
  }),
  dev: createEnvironment({
    name: 'dev',
    displayName: 'Development',
    baseUrl: 'http://dev-api.com',
    coreApiUrl: 'http://dev-api.com/api/WF',
    javaBaseUrl: 'http://dev-api-workflow.com',
    javaApiUrl: 'http://dev-api-workflow.com/api',
    description: 'Development environment for testing new features'
  }),
  uat: createEnvironment({
    name: 'uat',
    displayName: 'User Acceptance Testing',
    baseUrl: 'http://uat-api.com',
    coreApiUrl: 'http://uat-api.com/api/WF',
    javaBaseUrl: 'http://uat-api-workflow.com',
    javaApiUrl: 'http://uat-api-workflow.com/api',
    description: 'UAT environment for user acceptance testing'
  }),
  demo: createEnvironment({
    name: 'demo',
    displayName: 'Demo',
    baseUrl: 'http://demo-api.com',
    coreApiUrl: 'http://demo-api.com/api/WF',
    javaBaseUrl: 'http://demo-api-workflow.com',
    javaApiUrl: 'http://demo-api-workflow.com/api',
    retryAttempts: 2,
    description: 'Demo environment for client presentations'
  }),
  prod: createEnvironment({
    name: 'prod',
    displayName: 'Production',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-production-api-server.com',
    coreApiUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-production-api-server.com'}/api/WF`,
    javaBaseUrl: process.env.NEXT_PUBLIC_JAVA_BASE_URL || 'https://your-production-java-api-server.com',
    javaApiUrl: `${process.env.NEXT_PUBLIC_JAVA_BASE_URL || 'https://your-production-java-api-server.com'}/api`,
    timeout: 45000,
    retryAttempts: 5,
    description: 'Production environment - live data'
  })
};

// Core API Endpoints (.NET Service)
export const CORE_API_ENDPOINTS = {
  GET_WORKFLOW_APPLICATIONS: '/GetWorkflowApplicationDetails',
  SET_APPLICATION: '/SetApplication', // For saving/updating applications
  GET_APPLICATION_PARAMETERS: '/appparam', // For /appparam/{appId}
  SET_APPLICATION_PARAMETER: '/WorkflowAppParam', // For saving/updating application parameters
  
  // Role Management Endpoints
  GET_WORKFLOW_ROLES: '/GetWorkflowRoleDetails', // For /GetWorkflowRoleDetails/false
  SET_ROLES: '/SetRoles', // For saving/updating roles
  GET_UNIQUE_APPLICATIONS: '/GetWorkflowUniqueApplications', // For unique applications
  GET_UNIQUE_ROLES: '/GetWorkflowUniqueRoles', // For unique roles
  GET_APPLICATION_ROLE_MAP: '/GetWorkflowApplicationToRoleMap', // For application-role mappings
  SET_APPLICATION_ROLE_MAP: '/SetApplicationToRoleMap', // For saving application-role mappings
  
  // Calendar Management Endpoints
  GET_WORKFLOW_CALENDARS: '/GetWorkflowCalendarDetails', // For getting calendar details
  SET_CALENDAR: '/SetCalendar', // For saving/updating calendars
  GET_UNIQUE_CALENDARS: '/GetWorkflowUniqueCalendars', // For unique calendars
  GET_APPLICATION_CALENDAR_MAP: '/GetWorkflowApplicationToCalendarMap', // For application-calendar mappings
  SET_APPLICATION_CALENDAR_MAP: '/SetApplicationToCalendarMap', // For saving application-calendar mappings
  
  // Run Calendar Management Endpoints
  GET_WORKFLOW_RUN_CALENDARS: '/GetWorkflowRunCalendarDetails', // For getting run calendar details
  SET_RUN_CALENDAR: '/SetRunCalendar', // For saving/updating run calendars
  GET_UNIQUE_RUN_CALENDARS: '/GetWorkflowUniqueRunCalendars', // For unique run calendars
  GET_APPLICATION_RUN_CALENDAR_MAP: '/GetWorkflowApplicationToRunCalendarMap', // For application-run calendar mappings
  SET_APPLICATION_RUN_CALENDAR_MAP: '/SetApplicationToRunCalendarMap', // For saving application-run calendar mappings
  
  // Hierarchy Management Endpoints
  GET_UNIQUE_HIERARCHIES: '/GetWorkflowUniqueHierarchy', // For getting unique hierarchies
  GET_HIERARCHY_DETAILS: '/GetWorkflowHierarchyDetails', // For getting hierarchy details
  SET_HIERARCHY: '/setHierarchy', // For saving/updating hierarchies
  GET_APPLICATION_HIERARCHY_MAP: '/GetWorkflowApplicationToHierarchyMap', // For application-hierarchy mappings
  SET_APPLICATION_HIERARCHY_MAP: '/SetApplicationHierarchyMap', // For saving application-hierarchy mappings
} as const;

// Java API Endpoints (Java Service)
export const JAVA_API_ENDPOINTS = {
  // Metadata Management Endpoints
  GET_METADATA_APPLICATIONS: '/workflowapp', // For getting metadata applications
  GET_STAGES_BY_APP: '/stage', // For /stage?appId={appId}
  CREATE_STAGE: '/stage', // POST for creating new stage
  UPDATE_STAGE: '/stage', // PUT for updating stage
  CHECK_APP_IN_PROGRESS: '/workflowapp', // For /workflowapp/{appId}/inProgress
  
  // Parameter Management Endpoints
  GET_PARAMS: '/param', // For getting all parameters
  CREATE_PARAM: '/param', // POST for creating new parameter
  UPDATE_PARAM: '/param', // PUT for updating parameter
  
  // Attestation Management Endpoints
  GET_ATTESTATIONS: '/attest', // For /attest?type=DEFAULT
  CREATE_ATTESTATION: '/attest/', // POST for creating new attestation
  UPDATE_ATTESTATION: '/attest', // PUT for updating attestation
  
  // Email Template Management Endpoints
  GET_EMAIL_TEMPLATES: '/email', // For getting all email templates
  CREATE_EMAIL_TEMPLATE: '/email/', // POST for creating new email template
  UPDATE_EMAIL_TEMPLATE: '/email', // PUT for updating email template
  
  // Substage Management Endpoints
  GET_SUBSTAGES: '/substage', // For /substage?stageId={stageId}
  CREATE_SUBSTAGE: '/substage', // POST for creating new substage
  UPDATE_SUBSTAGE: '/substage', // PUT for updating substage
} as const;

// Default environment (can be overridden by environment variable)
export const DEFAULT_ENVIRONMENT = process.env.NEXT_PUBLIC_DEFAULT_API_ENV || 'prod';

// Get current environment configuration with fallback
export const getCurrentEnvironment = (): ApiEnvironment => {
  try {
    // Check if we're in local development mode and should use local environment
    const isLocalDev = process.env.NODE_ENV === 'local' || 
                      process.env.NEXT_PUBLIC_API_MODE === 'live' ||
                      process.env.NEXT_PUBLIC_FORCE_REAL_API === 'true';
    
    let envName: string;
    
    if (isLocalDev && process.env.NEXT_PUBLIC_BASE_URL) {
      envName = 'local';
    } else {
      envName = process.env.NEXT_PUBLIC_API_ENVIRONMENT || DEFAULT_ENVIRONMENT;
    }
    
    const environment = API_ENVIRONMENTS[envName];
    
    if (!environment) {
      console.warn(`Environment ${envName} not found, falling back to dev`);
      return API_ENVIRONMENTS.dev;
    }
    
    return environment;
  } catch (error) {
    console.error('Error getting current environment:', error);
    return API_ENVIRONMENTS.dev;
  }
};

// Get all available environments
export const getAvailableEnvironments = (): ApiEnvironment[] => {
  try {
    return Object.values(API_ENVIRONMENTS);
  } catch (error) {
    console.error('Error getting available environments:', error);
    return [API_ENVIRONMENTS.dev];
  }
};