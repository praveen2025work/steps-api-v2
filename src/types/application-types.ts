// Application interface matching the API payload structure
export interface Application {
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

// Form interface for UI components
export interface ApplicationForm {
  applicationId?: number;
  name: string;
  category: string;
  serviceUrl: string;
  description: string;
  entitlementMapping: number;
  isActive: boolean;
  cronExpression: string;
  isLockingEnabled: boolean;
  lockingRole: number;
  useRunCalendar: boolean;
  runDateOffSet: number;
  isRunOnWeekDayOnly: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
  environment: string;
}

// Application Parameter interface matching the API payload structure
export interface ApplicationParameter {
  appId: number;
  paramId: number;
  name: string;
  value: string;
  active: string; // "Y" or "N"
  updatedBy: string;
  ignore: string; // "Y" or "N"
}

// Form interface for application parameters
export interface ApplicationParameterForm {
  paramId?: number;
  name: string;
  value: string;
  active: boolean; // Convert to/from "Y"/"N"
  ignore: boolean; // Convert to/from "Y"/"N"
}

// Service response types
export interface GetApplicationsResponse extends ApiResponse<Application[]> {}
export interface SaveApplicationsResponse extends ApiResponse<Application[]> {}
export interface GetApplicationParametersResponse extends ApiResponse<ApplicationParameter[]> {}
export interface SaveApplicationParameterResponse extends ApiResponse<ApplicationParameter[]> {}