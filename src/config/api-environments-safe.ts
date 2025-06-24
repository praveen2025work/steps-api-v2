// Safe API Environment Configuration with validation
export interface ApiEnvironment {
  name: string;
  displayName: string;
  baseUrl: string;
  coreApiUrl: string;
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

  return environment;
};

export const API_ENVIRONMENTS: Record<string, ApiEnvironment> = {
  dev: createEnvironment({
    name: 'dev',
    displayName: 'Development',
    baseUrl: 'http://dev-api.com',
    coreApiUrl: 'http://dev-api.com/api/WF',
    description: 'Development environment for testing new features'
  }),
  uat: createEnvironment({
    name: 'uat',
    displayName: 'User Acceptance Testing',
    baseUrl: 'http://uat-api.com',
    coreApiUrl: 'http://uat-api.com/api/WF',
    description: 'UAT environment for user acceptance testing'
  }),
  demo: createEnvironment({
    name: 'demo',
    displayName: 'Demo',
    baseUrl: 'http://demo-api.com',
    coreApiUrl: 'http://demo-api.com/api/WF',
    retryAttempts: 2,
    description: 'Demo environment for client presentations'
  }),
  prod: createEnvironment({
    name: 'prod',
    displayName: 'Production',
    baseUrl: 'http://api.com',
    coreApiUrl: 'http://api.com/api/WF',
    timeout: 45000,
    retryAttempts: 5,
    description: 'Production environment - live data'
  })
};

// Core API Endpoints
export const CORE_API_ENDPOINTS = {
  GET_WORKFLOW_APPLICATIONS: '/GetWorkflowApplicationDetails',
  GET_APPLICATION_PARAMETERS: '/appparam', // For /appparam/{appId}
  // Add more endpoints as you provide them
} as const;

// Default environment (can be overridden by environment variable)
export const DEFAULT_ENVIRONMENT = process.env.NEXT_PUBLIC_DEFAULT_API_ENV || 'prod';

// Get current environment configuration with fallback
export const getCurrentEnvironment = (): ApiEnvironment => {
  try {
    const envName = process.env.NEXT_PUBLIC_API_ENVIRONMENT || DEFAULT_ENVIRONMENT;
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