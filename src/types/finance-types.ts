export type ViewMode = 'tile' | 'split' | 'full' | 'summary' | 'grid' | 'pivot';
export type TileStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export enum ChartType {
  Bar = "bar",
  Line = "line",
  Pie = "pie",
  Grid = "grid",
  Progress = "progress",
  Status = "status",
  Text = "text",
  Area = "area",
  Scatter = "scatter"
}

export interface TileData {
  id: string;
  title: string;
  description: string;
  status: TileStatus;
  lastUpdated: string;
  alert?: boolean;
  slides: TileSlide[];
}

export interface TileSlide {
  id: string;
  title?: string;
  chartType: ChartType;
  data: any[];
  columns?: {
    key: string;
    label: string;
    format?: (value: any) => React.ReactNode;
  }[];
  series?: {
    key: string;
    name?: string;
    color?: string;
  }[];
  content?: React.ReactNode;
  source?: string;
}

export interface FinanceTileConfig {
  id: string;
  title: string;
  description: string;
  type: string;
  dataSource: string;
  refreshInterval: number;
  position: number;
}

export interface FinanceDashboardConfig {
  id: string;
  name: string;
  description: string;
  tiles: FinanceTileConfig[];
  defaultColumns: number;
  defaultViewMode: ViewMode;
}

// Tile Configuration Types
export enum TileType {
  Chart = "chart",
  Grid = "grid",
  Progress = "progress",
  Text = "text"
}

export interface AxisConfig {
  field: string;
  label: string;
}

export interface Filter {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string | number;
}

export interface TileConfig {
  id: string;
  title: string;
  type: TileType;
  chartType?: ChartType;
  dataSource: string;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  filters: Filter[];
  refreshInterval: number;
  isActive: boolean;
}

export interface DataSourceField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  refreshInterval: number;
  fields: DataSourceField[];
}