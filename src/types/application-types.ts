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

// Role interface matching the API payload structure
export interface WorkflowRole {
  roleId: number;
  department: string;
  role: string;
  userType: string;
  isReadWrite: string; // "RO" or "RW"
  isActive: boolean;
  action?: number; // For save operations
  isReadWriteChecked?: boolean; // For save operations
}

// Unique Application interface for role management
export interface UniqueApplication {
  configType: string;
  configId: string;
  configName: string;
}

// Unique Role interface for role management
export interface UniqueRole {
  configId: number;
  configName: string;
}

// Application-Role Mapping interface
export interface ApplicationRoleMapping {
  applicationId: number;
  roleId: number;
  applicationName: string;
  roleName: string;
}

// Role-Application Assignment interface for saving
export interface RoleApplicationAssignment {
  roleId: number;
  applicationIds: number[];
}

// Application-Role Assignment interface for saving
export interface ApplicationRoleAssignment {
  applicationId: number;
  roleIds: number[];
}

// Form interface for role management UI
export interface RoleForm {
  roleId?: number;
  department: string;
  role: string;
  userType: string;
  isReadWrite: 'RO' | 'RW';
  isActive: boolean;
}

// Calendar interface matching the API payload structure
export interface WorkflowCalendar {
  calendarName: string;
  calendarDescription: string;
  businessDate: string; // Format: "DD-MMM-YYYY" (e.g., "25-Dec-2020")
  action?: number; // 1 = add, 3 = delete (for save operations)
}

// Unique Calendar interface
export interface UniqueCalendar {
  calendarName: string;
}

// Application-Calendar Mapping interface
export interface ApplicationCalendarMapping {
  applicationId: number;
  applicationName: string;
  calendarName: string;
}

// Calendar save request interface
export interface CalendarSaveRequest {
  action: number; // 1 = add/update, 3 = delete
  applicationId: number;
  calendarName: string;
}

// Form interface for calendar management UI
export interface CalendarForm {
  calendarName: string;
  calendarDescription: string;
  businessDates: string[]; // Array of dates in "DD-MMM-YYYY" format
}

// Service response types
export interface GetApplicationsResponse extends ApiResponse<Application[]> {}
export interface SaveApplicationsResponse extends ApiResponse<Application[]> {}
export interface GetApplicationParametersResponse extends ApiResponse<ApplicationParameter[]> {}
export interface SaveApplicationParameterResponse extends ApiResponse<ApplicationParameter[]> {}

// Role service response types
export interface GetWorkflowRolesResponse extends ApiResponse<WorkflowRole[]> {}
export interface SaveRolesResponse extends ApiResponse<number> {}
export interface GetUniqueApplicationsResponse extends ApiResponse<UniqueApplication[]> {}
export interface GetUniqueRolesResponse extends ApiResponse<UniqueRole[]> {}
export interface GetApplicationRoleMappingResponse extends ApiResponse<ApplicationRoleMapping[]> {}

// Calendar service response types
export interface GetWorkflowCalendarsResponse extends ApiResponse<WorkflowCalendar[]> {}
export interface SaveCalendarResponse extends ApiResponse<number> {}
export interface GetUniqueCalendarsResponse extends ApiResponse<UniqueCalendar[]> {}
export interface GetApplicationCalendarMappingResponse extends ApiResponse<ApplicationCalendarMapping[]> {}
export interface SaveApplicationCalendarMappingResponse extends ApiResponse<number> {}