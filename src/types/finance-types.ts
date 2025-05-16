export type ViewMode = 'tile' | 'split' | 'full';
export type TileStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type ChartType = 'bar' | 'line' | 'pie' | 'grid' | 'progress' | 'status' | 'text';

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