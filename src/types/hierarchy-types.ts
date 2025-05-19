export interface HierarchyData {
  id: string;
  hierarchy_id: string;
  hierarchyLevel: string;
  colValue: string;
  colName: string;
  parentHierarchyLevel: string;
  parentColValue: string;
  startDate: Date;
  expiryDate: Date | null;
  isActive: boolean;
  applicationId: string;
  createdBy: string;
  createdOn: Date;
  updatedBy: string | null;
  updatedOn: Date | null;
}

export interface HierarchyFormData {
  hierarchy_id: string;
  hierarchyLevel: string;
  colValue: string;
  colName: string;
  parentHierarchyLevel: string;
  parentColValue: string;
  startDate: Date;
  expiryDate: Date | null;
  isActive: boolean;
  applicationId: string;
}

export interface HierarchyLevel {
  id: string;
  name: string;
  description: string;
}