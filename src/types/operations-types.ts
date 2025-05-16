// Application Registry Types
export interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'maintenance';
  category: string;
  processes: Process[];
  dashboardConfig: DashboardConfig;
}

// Process Management Types
export interface Process {
  id: string;
  name: string;
  applicationId: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  currentStage?: string;
  progress: number;
  startTime?: Date;
  endTime?: Date;
  sla?: {
    deadline: Date;
    status: 'on-track' | 'at-risk' | 'breached';
  };
  metadata: Record<string, any>;
}

export interface ProcessStage {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  metadata: Record<string, any>;
}

// Tile System Types
export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  layout: TileLayout[];
}

export interface TileLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tileConfig: TileConfig;
}

export interface TileConfig {
  id: string;
  type: TileType;
  title: string;
  description?: string;
  dataSource: DataSourceConfig;
  visualization: VisualizationConfig;
  refreshInterval?: number; // in seconds
  actions?: TileAction[];
}

export type TileType = 
  | 'status' 
  | 'metric' 
  | 'chart' 
  | 'list' 
  | 'table' 
  | 'timeline' 
  | 'map' 
  | 'custom';

export interface DataSourceConfig {
  type: 'api' | 'static' | 'function';
  source: string; // API endpoint, function name, or static data reference
  parameters?: Record<string, any>;
  transformation?: string; // Optional transformation function name
}

export interface VisualizationConfig {
  type: string; // The specific visualization type
  options: Record<string, any>; // Visualization-specific options
}

export interface TileAction {
  id: string;
  label: string;
  icon?: string;
  action: 'link' | 'function' | 'api';
  target: string; // URL, function name, or API endpoint
  parameters?: Record<string, any>;
}

// Data Provider Interface
export interface DataProvider {
  fetchData(config: DataSourceConfig): Promise<any>;
}