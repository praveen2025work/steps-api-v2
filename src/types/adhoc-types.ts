export type AdhocViewMode = 'tile' | 'split' | 'full' | 'table' | 'grid';
export type AdhocTileStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type DataType = 'string' | 'number' | 'date' | 'boolean' | 'json';
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';

export enum AdhocChartType {
  Bar = "bar",
  Line = "line",
  Pie = "pie",
  Area = "area",
  Scatter = "scatter",
  Grid = "grid",
  Progress = "progress",
  Status = "status",
  Text = "text",
  Metric = "metric"
}

export interface AdhocDataSource {
  id: string;
  name: string;
  description: string;
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  refreshInterval: number;
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'apikey';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  dataPath?: string; // JSONPath to extract data from response
  fields: AdhocDataField[];
}

export interface AdhocDataField {
  name: string;
  label: string;
  type: DataType;
  format?: string; // For dates and numbers
  aggregation?: AggregationType;
  isFilterable?: boolean;
  isSortable?: boolean;
}

export interface AdhocFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  values?: any[]; // For 'in' and 'between' operators
}

export interface AdhocAxisConfig {
  field: string;
  label: string;
  aggregation?: AggregationType;
  format?: string;
}

export interface AdhocTileConfig {
  id: string;
  title: string;
  description?: string;
  type: AdhocChartType;
  dataSourceId: string;
  xAxis?: AdhocAxisConfig;
  yAxis?: AdhocAxisConfig;
  groupBy?: string;
  filters: AdhocFilter[];
  refreshInterval: number;
  isActive: boolean;
  position: number;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  customSql?: string; // For advanced users
  customTransform?: string; // JavaScript code to transform data
}

export interface AdhocDashboardConfig {
  id: string;
  name: string;
  description: string;
  dataSources: AdhocDataSource[];
  tiles: AdhocTileConfig[];
  defaultColumns: number;
  defaultViewMode: AdhocViewMode;
  globalFilters: AdhocFilter[];
  refreshInterval: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdhocTileData {
  id: string;
  title: string;
  description?: string;
  status: AdhocTileStatus;
  lastUpdated: string;
  data: any[];
  error?: string;
  isLoading: boolean;
  config: AdhocTileConfig;
}

export interface AdhocDataPreview {
  fields: AdhocDataField[];
  sampleData: any[];
  totalRows: number;
  error?: string;
}