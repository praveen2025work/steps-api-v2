import { v4 as uuidv4 } from 'uuid';
import { HierarchyData, HierarchyLevel } from '@/types/hierarchy-types';

// Sample hierarchy levels
export const hierarchyLevels: HierarchyLevel[] = [
  { id: 'level-001', name: 'Region', description: 'Geographic region' },
  { id: 'level-002', name: 'Country', description: 'Country within a region' },
  { id: 'level-003', name: 'Business Unit', description: 'Business unit within a country' },
  { id: 'level-004', name: 'Department', description: 'Department within a business unit' },
  { id: 'level-005', name: 'Team', description: 'Team within a department' }
];

// Generate mock hierarchy data
export const generateMockHierarchyData = (): HierarchyData[] => {
  return [
    {
      id: 'hier-001',
      hierarchy_id: 'HIER001',
      hierarchyLevel: 'Region',
      colValue: 'EMEA',
      colName: 'Europe, Middle East, and Africa',
      parentHierarchyLevel: '',
      parentColValue: '',
      startDate: new Date('2024-01-01'),
      expiryDate: null,
      isActive: true,
      applicationId: 'app-001',
      createdBy: 'admin',
      createdOn: new Date('2024-01-01'),
      updatedBy: null,
      updatedOn: null
    },
    {
      id: 'hier-002',
      hierarchy_id: 'HIER002',
      hierarchyLevel: 'Country',
      colValue: 'UK',
      colName: 'United Kingdom',
      parentHierarchyLevel: 'Region',
      parentColValue: 'EMEA',
      startDate: new Date('2024-01-01'),
      expiryDate: null,
      isActive: true,
      applicationId: 'app-001',
      createdBy: 'admin',
      createdOn: new Date('2024-01-01'),
      updatedBy: null,
      updatedOn: null
    },
    {
      id: 'hier-003',
      hierarchy_id: 'HIER003',
      hierarchyLevel: 'Country',
      colValue: 'FR',
      colName: 'France',
      parentHierarchyLevel: 'Region',
      parentColValue: 'EMEA',
      startDate: new Date('2024-01-01'),
      expiryDate: null,
      isActive: true,
      applicationId: 'app-001',
      createdBy: 'admin',
      createdOn: new Date('2024-01-01'),
      updatedBy: null,
      updatedOn: null
    },
    {
      id: 'hier-004',
      hierarchy_id: 'HIER004',
      hierarchyLevel: 'Region',
      colValue: 'APAC',
      colName: 'Asia Pacific',
      parentHierarchyLevel: '',
      parentColValue: '',
      startDate: new Date('2024-01-01'),
      expiryDate: null,
      isActive: true,
      applicationId: 'app-002',
      createdBy: 'admin',
      createdOn: new Date('2024-01-01'),
      updatedBy: null,
      updatedOn: null
    },
    {
      id: 'hier-005',
      hierarchy_id: 'HIER005',
      hierarchyLevel: 'Country',
      colValue: 'JP',
      colName: 'Japan',
      parentHierarchyLevel: 'Region',
      parentColValue: 'APAC',
      startDate: new Date('2024-01-01'),
      expiryDate: null,
      isActive: true,
      applicationId: 'app-002',
      createdBy: 'admin',
      createdOn: new Date('2024-01-01'),
      updatedBy: null,
      updatedOn: null
    },
    {
      id: 'hier-006',
      hierarchy_id: 'HIER006',
      hierarchyLevel: 'Business Unit',
      colValue: 'RETAIL',
      colName: 'Retail Banking',
      parentHierarchyLevel: 'Country',
      parentColValue: 'UK',
      startDate: new Date('2024-01-01'),
      expiryDate: null,
      isActive: true,
      applicationId: 'app-001',
      createdBy: 'admin',
      createdOn: new Date('2024-01-01'),
      updatedBy: null,
      updatedOn: null
    }
  ];
};

// Get all hierarchy data
export const getHierarchyData = (): HierarchyData[] => {
  return generateMockHierarchyData();
};

// Get hierarchy data by application
export const getHierarchyDataByApplication = (applicationId: string): HierarchyData[] => {
  return generateMockHierarchyData().filter(data => data.applicationId === applicationId);
};

// Get hierarchy levels
export const getHierarchyLevels = (): HierarchyLevel[] => {
  return hierarchyLevels;
};

// Generate a new hierarchy ID
export const generateHierarchyId = (): string => {
  const existingIds = generateMockHierarchyData().map(data => 
    parseInt(data.hierarchy_id.replace('HIER', ''))
  );
  const maxId = Math.max(...existingIds, 0);
  const newIdNumber = maxId + 1;
  return `HIER${newIdNumber.toString().padStart(3, '0')}`;
};

// Create a new hierarchy data entry
export const createHierarchyData = (data: Omit<HierarchyData, 'id' | 'createdBy' | 'createdOn' | 'updatedBy' | 'updatedOn'>): HierarchyData => {
  return {
    id: `hier-${uuidv4().substring(0, 8)}`,
    ...data,
    createdBy: 'current-user', // In a real app, this would be the current user's ID
    createdOn: new Date(),
    updatedBy: null,
    updatedOn: null
  };
};

// Update an existing hierarchy data entry
export const updateHierarchyData = (data: HierarchyData): HierarchyData => {
  return {
    ...data,
    updatedBy: 'current-user', // In a real app, this would be the current user's ID
    updatedOn: new Date()
  };
};

// Get parent hierarchy values for a given level
export const getParentHierarchyValues = (level: string, applicationId: string): { value: string, name: string }[] => {
  const allData = generateMockHierarchyData();
  const levelIndex = hierarchyLevels.findIndex(l => l.name === level);
  
  if (levelIndex <= 0) return []; // No parent for the top level
  
  const parentLevel = hierarchyLevels[levelIndex - 1].name;
  
  return allData
    .filter(data => data.hierarchyLevel === parentLevel && data.applicationId === applicationId)
    .map(data => ({
      value: data.colValue,
      name: data.colName
    }));
};