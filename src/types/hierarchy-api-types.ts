// Hierarchy API Types based on the provided API specifications

export interface UniqueHierarchy {
  hierarchyId: number;
  hierarchyName: string;
}

export interface HierarchyDetail {
  hierarchyId: number;
  hierarchyName?: string;
  hierarchyDescription?: string;
  hierarchyLevel: number;
  columnName: string;
  parentHierarchyLevel: number;
  parentColumnName: string;
  isUsedForEntitlements: boolean;
  isUsedForWorkflowInstance: boolean;
}

export interface SetHierarchyRequest {
  action: number; // 1 = Add, 2 = Update, 3 = Delete
  hierarchyId: number;
  hierarchyName?: string;
  hierarchyDescription?: string;
  hierarchyLevel: number;
  columnName: string;
  parentHierarchyLevel: number;
  parentcolumnName: string; // Note: API uses lowercase 'c'
  isUsedForEntitlements: boolean;
  isUsedForworkflowInstance: boolean; // Note: API uses lowercase 'w'
}

export interface ApplicationToHierarchyMap {
  applicationId: number;
  hierarchyId: number;
  hierarchyName: string;
  applicationName: string;
}

export interface SetApplicationHierarchyMapRequest {
  action: number; // 1 = Add, 2 = Update, 3 = Delete
  applicationId: number;
  hierarchyId: number;
}

// Combined hierarchy structure for UI display
export interface HierarchyStructure {
  hierarchyId: number;
  hierarchyName: string;
  hierarchyDescription: string;
  levels: HierarchyLevelStructure[];
  applicationMappings: ApplicationToHierarchyMap[];
}

export interface HierarchyLevelStructure {
  hierarchyLevel: number;
  columnName: string;
  parentHierarchyLevel: number;
  parentColumnName: string;
  isUsedForEntitlements: boolean;
  isUsedForWorkflowInstance: boolean;
}

// Form interfaces for the UI
export interface HierarchyForm {
  hierarchyId?: number;
  hierarchyName: string;
  hierarchyDescription: string;
}

export interface HierarchyLevelForm {
  hierarchyLevel: number;
  columnName: string;
  parentHierarchyLevel: number;
  parentColumnName: string;
  isUsedForEntitlements: boolean;
  isUsedForWorkflowInstance: boolean;
}

export interface ApplicationMappingForm {
  applicationId: number;
  hierarchyId: number;
}