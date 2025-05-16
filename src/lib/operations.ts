import type { Application, Process, DashboardConfig, DataSourceConfig, TileConfig } from '@/types/operations-types';

// Sample applications data
const sampleApplications: Application[] = [
  {
    id: 'app-001',
    name: 'PnL System',
    description: 'Daily profit and loss calculation system',
    icon: 'chart',
    status: 'active',
    category: 'finance',
    processes: [],
    dashboardConfig: {
      id: 'dash-001',
      name: 'PnL Dashboard',
      description: 'PnL system operational dashboard',
      layout: []
    }
  },
  {
    id: 'app-002',
    name: 'Regulatory Reporting',
    description: 'Regulatory reporting system for compliance',
    icon: 'file-text',
    status: 'active',
    category: 'compliance',
    processes: [],
    dashboardConfig: {
      id: 'dash-002',
      name: 'Regulatory Dashboard',
      description: 'Regulatory reporting operational dashboard',
      layout: []
    }
  },
  {
    id: 'app-003',
    name: 'Trade Operations',
    description: 'Trade processing and reconciliation system',
    icon: 'repeat',
    status: 'maintenance',
    category: 'operations',
    processes: [],
    dashboardConfig: {
      id: 'dash-003',
      name: 'Trade Ops Dashboard',
      description: 'Trade operations dashboard',
      layout: []
    }
  },
  {
    id: 'app-004',
    name: 'Risk Management',
    description: 'Risk calculation and monitoring system',
    icon: 'alert-triangle',
    status: 'active',
    category: 'risk',
    processes: [],
    dashboardConfig: {
      id: 'dash-004',
      name: 'Risk Dashboard',
      description: 'Risk management operational dashboard',
      layout: []
    }
  },
  {
    id: 'app-005',
    name: 'Client Onboarding',
    description: 'Client onboarding and KYC workflow system',
    icon: 'users',
    status: 'inactive',
    category: 'client',
    processes: [],
    dashboardConfig: {
      id: 'dash-005',
      name: 'Onboarding Dashboard',
      description: 'Client onboarding operational dashboard',
      layout: []
    }
  }
];

// Sample dashboard configuration
const sampleDashboardConfig: DashboardConfig = {
  id: 'default-dashboard',
  name: 'Operations Center Dashboard',
  description: 'Default operations center dashboard',
  layout: [
    {
      id: 'tile-001',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      tileConfig: {
        id: 'status-tile',
        type: 'status',
        title: 'PnL System Status',
        dataSource: {
          type: 'static',
          source: 'status-data'
        },
        visualization: {
          type: 'status',
          options: {
            showIcon: true
          }
        }
      }
    },
    {
      id: 'tile-002',
      x: 1,
      y: 0,
      width: 1,
      height: 1,
      tileConfig: {
        id: 'metric-tile',
        type: 'metric',
        title: 'Active Processes',
        dataSource: {
          type: 'static',
          source: 'metric-data'
        },
        visualization: {
          type: 'metric',
          options: {
            format: 'number'
          }
        }
      }
    },
    {
      id: 'tile-003',
      x: 2,
      y: 0,
      width: 1,
      height: 1,
      tileConfig: {
        id: 'metric-tile-2',
        type: 'metric',
        title: 'SLA Compliance',
        dataSource: {
          type: 'static',
          source: 'sla-data'
        },
        visualization: {
          type: 'metric',
          options: {
            format: 'percentage'
          }
        }
      }
    },
    {
      id: 'tile-004',
      x: 0,
      y: 1,
      width: 2,
      height: 1,
      tileConfig: {
        id: 'list-tile',
        type: 'list',
        title: 'Recent Processes',
        dataSource: {
          type: 'static',
          source: 'list-data'
        },
        visualization: {
          type: 'list',
          options: {
            maxItems: 5
          }
        },
        actions: [
          {
            id: 'view-all',
            label: 'View All',
            action: 'link',
            target: '/operations?tab=processes'
          }
        ]
      }
    },
    {
      id: 'tile-005',
      x: 2,
      y: 1,
      width: 1,
      height: 1,
      tileConfig: {
        id: 'chart-tile',
        type: 'chart',
        title: 'Process Duration',
        dataSource: {
          type: 'static',
          source: 'chart-data'
        },
        visualization: {
          type: 'bar-chart',
          options: {
            showLegend: true
          }
        }
      }
    },
    {
      id: 'tile-006',
      x: 0,
      y: 2,
      width: 3,
      height: 1,
      tileConfig: {
        id: 'table-tile',
        type: 'table',
        title: 'Failed Processes',
        dataSource: {
          type: 'static',
          source: 'table-data'
        },
        visualization: {
          type: 'table',
          options: {
            columns: [
              { key: 'name', label: 'Process' },
              { key: 'application', label: 'Application' },
              { key: 'error', label: 'Error' },
              { key: 'time', label: 'Time' }
            ]
          }
        },
        actions: [
          {
            id: 'view-all-failed',
            label: 'View All',
            action: 'link',
            target: '/operations?tab=processes&status=failed'
          }
        ]
      }
    }
  ]
};

// Sample tile data
const sampleTileData = {
  'status-data': {
    status: 'healthy',
    message: 'All systems operational'
  },
  'metric-data': {
    value: '42',
    change: 5,
    label: 'Currently running'
  },
  'sla-data': {
    value: '86%',
    change: -2,
    label: 'On-time completion'
  },
  'list-data': {
    items: [
      { label: 'PnL Calculation - APAC', value: 'Running' },
      { label: 'PnL Calculation - EMEA', value: 'Failed' },
      { label: 'PnL Calculation - Americas', value: 'Completed' },
      { label: 'Regulatory Report Generation', value: 'Paused' },
      { label: 'Trade Reconciliation', value: 'Idle' }
    ]
  },
  'table-data': {
    columns: [
      { key: 'name', label: 'Process' },
      { key: 'application', label: 'Application' },
      { key: 'error', label: 'Error' },
      { key: 'time', label: 'Time' }
    ],
    rows: [
      { 
        name: 'PnL Calculation - EMEA', 
        application: 'PnL System', 
        error: 'Failed to connect to data source', 
        time: '08:15 AM' 
      },
      { 
        name: 'Regulatory Filing', 
        application: 'Regulatory Reporting', 
        error: 'Validation error in form data', 
        time: '09:30 AM' 
      },
      { 
        name: 'Client Risk Assessment', 
        application: 'Risk Management', 
        error: 'Timeout during calculation', 
        time: '10:45 AM' 
      }
    ]
  }
};

// Mock API functions
export async function getApplications(): Promise<Application[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleApplications);
    }, 500);
  });
}

export async function getApplication(id: string): Promise<Application | null> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const app = sampleApplications.find(a => a.id === id) || null;
      resolve(app);
    }, 500);
  });
}

export async function getDashboardConfig(id: string): Promise<DashboardConfig> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would fetch the specific dashboard config
      resolve(sampleDashboardConfig);
    }, 500);
  });
}

export async function getProcesses(applicationId?: string): Promise<Process[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would filter by applicationId if provided
      resolve([]);
    }, 500);
  });
}

export async function fetchTileData(config: DataSourceConfig): Promise<any> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (config.type === 'static') {
        // For static data sources, return from our sample data
        const data = sampleTileData[config.source as keyof typeof sampleTileData];
        if (data) {
          resolve(data);
        } else {
          reject(new Error(`Static data source '${config.source}' not found`));
        }
      } else if (config.type === 'api') {
        // For API data sources, we would make an actual API call in a real implementation
        // For now, just return mock data
        resolve({ message: 'API data would be fetched here' });
      } else {
        // For function data sources, we would call a function in a real implementation
        resolve({ message: 'Function data would be generated here' });
      }
    }, 500);
  });
}