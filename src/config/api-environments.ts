// API Environment Configuration
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

export const API_ENVIRONMENTS: Record<string, ApiEnvironment> = {
  dev: {
    name: 'dev',
    displayName: 'Development',
    baseUrl: 'http://dev-api.com',
    coreApiUrl: 'http://dev-api.com/api/WF',
    authType: 'windows',
    timeout: 30000,
    retryAttempts: 3,
    description: 'Development environment for testing new features'
  },
  uat: {
    name: 'uat',
    displayName: 'User Acceptance Testing',
    baseUrl: 'http://uat-api.com',
    coreApiUrl: 'http://uat-api.com/api/WF',
    authType: 'windows',
    timeout: 30000,
    retryAttempts: 3,
    description: 'UAT environment for user acceptance testing'
  },
  demo: {
    name: 'demo',
    displayName: 'Demo',
    baseUrl: 'http://demo-api.com',
    coreApiUrl: 'http://demo-api.com/api/WF',
    authType: 'windows',
    timeout: 30000,
    retryAttempts: 2,
    description: 'Demo environment for client presentations'
  },
  prod: {
    name: 'prod',
    displayName: 'Production',
    baseUrl: 'http://api.com',
    coreApiUrl: 'http://api.com/api/WF',
    authType: 'windows',
    timeout: 45000,
    retryAttempts: 5,
    description: 'Production environment - live data'
  }
};

// Core API Endpoints
export const CORE_API_ENDPOINTS = {
  GET_WORKFLOW_APPLICATIONS: '/GetWorkflowApplicationDetails',
  GET_APPLICATION_PARAMETERS: '/appparam', // For /appparam/{appId}
  // Add more endpoints as you provide them
} as const;

// Default environment (can be overridden by environment variable)
export const DEFAULT_ENVIRONMENT = process.env.NEXT_PUBLIC_DEFAULT_API_ENV || 'dev';

// Get current environment configuration
export const getCurrentEnvironment = (): ApiEnvironment => {
  const envName = process.env.NEXT_PUBLIC_API_ENVIRONMENT || DEFAULT_ENVIRONMENT;
  return API_ENVIRONMENTS[envName] || API_ENVIRONMENTS.dev;
};

// Get all available environments
export const getAvailableEnvironments = (): ApiEnvironment[] => {
  return Object.values(API_ENVIRONMENTS);
};