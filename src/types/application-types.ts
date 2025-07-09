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

// Service response types
export interface GetApplicationsResponse extends ApiResponse<Application[]> {}
export interface SaveApplicationsResponse extends ApiResponse<Application[]> {}