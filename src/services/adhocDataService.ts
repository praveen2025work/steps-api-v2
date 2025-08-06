import { 
  AdhocDashboardConfig, 
  AdhocDataSource, 
  AdhocTileConfig, 
  AdhocDataPreview,
  AdhocFilter
} from '@/types/adhoc-types';
import { apiClient } from '@/lib/api-client';

class AdhocDataService {
  private readonly STORAGE_KEY = 'adhoc_dashboards';

  // Dashboard Management
  async getSavedDashboards(): Promise<AdhocDashboardConfig[]> {
    try {
      // In development, use localStorage
      if (this.isDevelopmentMode()) {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : this.getDefaultDashboards();
      }
      
      // In production, fetch from API
      const response = await apiClient.get('/api/adhoc/dashboards');
      return response.data || [];
    } catch (error) {
      console.error('Failed to load saved dashboards:', error);
      return this.getDefaultDashboards();
    }
  }

  async saveDashboard(config: AdhocDashboardConfig): Promise<void> {
    try {
      if (this.isDevelopmentMode()) {
        // Save to localStorage in development
        const dashboards = await this.getSavedDashboards();
        const existingIndex = dashboards.findIndex(d => d.id === config.id);
        
        if (existingIndex >= 0) {
          dashboards[existingIndex] = config;
        } else {
          dashboards.push(config);
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dashboards));
      } else {
        // Save to API in production
        await apiClient.post('/api/adhoc/dashboards', config);
      }
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      throw error;
    }
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    try {
      if (this.isDevelopmentMode()) {
        const dashboards = await this.getSavedDashboards();
        const filtered = dashboards.filter(d => d.id !== dashboardId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      } else {
        await apiClient.delete(`/api/adhoc/dashboards/${dashboardId}`);
      }
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
      throw error;
    }
  }

  // Data Source Management
  async testDataSource(dataSource: AdhocDataSource): Promise<AdhocDataPreview> {
    try {
      const response = await this.fetchFromDataSource(dataSource);
      
      // Extract sample data (first 10 rows)
      const sampleData = Array.isArray(response) ? response.slice(0, 10) : [response];
      
      // Infer fields from sample data
      const fields = this.inferFieldsFromData(sampleData);
      
      return {
        fields,
        sampleData,
        totalRows: Array.isArray(response) ? response.length : 1
      };
    } catch (error) {
      return {
        fields: [],
        sampleData: [],
        totalRows: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async fetchFromDataSource(dataSource: AdhocDataSource, filters?: AdhocFilter[]): Promise<any> {
    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...dataSource.headers
      };

      // Add authentication headers
      if (dataSource.authentication) {
        switch (dataSource.authentication.type) {
          case 'bearer':
            if (dataSource.authentication.token) {
              headers['Authorization'] = `Bearer ${dataSource.authentication.token}`;
            }
            break;
          case 'basic':
            if (dataSource.authentication.username && dataSource.authentication.password) {
              const credentials = btoa(`${dataSource.authentication.username}:${dataSource.authentication.password}`);
              headers['Authorization'] = `Basic ${credentials}`;
            }
            break;
          case 'apikey':
            if (dataSource.authentication.apiKey && dataSource.authentication.apiKeyHeader) {
              headers[dataSource.authentication.apiKeyHeader] = dataSource.authentication.apiKey;
            }
            break;
        }
      }

      // Prepare request options
      const options: RequestInit = {
        method: dataSource.method,
        headers
      };

      // Add body for POST requests
      if (dataSource.method === 'POST' && dataSource.body) {
        options.body = dataSource.body;
      }

      // Make the request
      const response = await fetch(dataSource.url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let data = await response.json();

      // Extract data using JSONPath if specified
      if (dataSource.dataPath) {
        data = this.extractDataByPath(data, dataSource.dataPath);
      }

      // Apply filters if provided
      if (filters && filters.length > 0) {
        data = this.applyFilters(data, filters);
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch from data source:', error);
      throw error;
    }
  }

  // Tile Data Management
  async fetchTileData(tileConfig: AdhocTileConfig, selectedDate?: Date): Promise<any[]> {
    try {
      // In development mode, return mock data
      if (this.isDevelopmentMode()) {
        return this.generateMockDataForTile(tileConfig);
      }

      // Find the data source
      const dashboards = await this.getSavedDashboards();
      const dashboard = dashboards.find(d => d.tiles.some(t => t.id === tileConfig.id));
      const dataSource = dashboard?.dataSources.find(ds => ds.id === tileConfig.dataSourceId);

      if (!dataSource) {
        throw new Error('Data source not found');
      }

      // Fetch data from the source
      const data = await this.fetchFromDataSource(dataSource, tileConfig.filters);
      
      // Apply tile-specific transformations
      return this.transformDataForTile(data, tileConfig);
    } catch (error) {
      console.error('Failed to fetch tile data:', error);
      throw error;
    }
  }

  // Helper Methods
  private isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           process.env.NEXT_PUBLIC_CO_DEV_ENV === 'true';
  }

  private getDefaultDashboards(): AdhocDashboardConfig[] {
    return [
      {
        id: 'sample-dashboard',
        name: 'Sample Dashboard',
        description: 'A sample dashboard with mock data',
        dataSources: [
          {
            id: 'sample-api',
            name: 'Sample API',
            description: 'Sample REST API endpoint',
            url: 'https://jsonplaceholder.typicode.com/posts',
            method: 'GET',
            refreshInterval: 300,
            fields: [
              { name: 'id', label: 'ID', type: 'number' },
              { name: 'title', label: 'Title', type: 'string' },
              { name: 'body', label: 'Body', type: 'string' },
              { name: 'userId', label: 'User ID', type: 'number' }
            ]
          }
        ],
        tiles: [
          {
            id: 'sample-tile-1',
            title: 'Posts by User',
            description: 'Number of posts per user',
            type: 'bar' as any,
            dataSourceId: 'sample-api',
            xAxis: { field: 'userId', label: 'User ID' },
            yAxis: { field: 'count', label: 'Post Count', aggregation: 'count' },
            filters: [],
            refreshInterval: 300,
            isActive: true,
            position: 0,
            size: 'medium'
          }
        ],
        defaultColumns: 3,
        defaultViewMode: 'tile',
        globalFilters: [],
        refreshInterval: 300,
        isPublic: false,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private inferFieldsFromData(data: any[]) {
    if (!data || data.length === 0) return [];

    const firstItem = data[0];
    const fields = [];

    for (const [key, value] of Object.entries(firstItem)) {
      let type: 'string' | 'number' | 'date' | 'boolean' | 'json' = 'string';

      if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        type = 'date';
      } else if (typeof value === 'object') {
        type = 'json';
      }

      fields.push({
        name: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type,
        isFilterable: true,
        isSortable: true
      });
    }

    return fields;
  }

  private extractDataByPath(data: any, path: string): any {
    // Simple JSONPath implementation
    const parts = path.split('.');
    let current = data;

    for (const part of parts) {
      if (part === '$') continue; // Root indicator
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return null;
      }
    }

    return current;
  }

  private applyFilters(data: any[], filters: AdhocFilter[]): any[] {
    if (!Array.isArray(data)) return data;

    return data.filter(item => {
      return filters.every(filter => {
        const value = item[filter.field];
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          case 'between':
            return filter.values && 
                   Number(value) >= Number(filter.values[0]) && 
                   Number(value) <= Number(filter.values[1]);
          case 'in':
            return filter.values && filter.values.includes(value);
          default:
            return true;
        }
      });
    });
  }

  private transformDataForTile(data: any[], tileConfig: AdhocTileConfig): any[] {
    if (!Array.isArray(data)) return [];

    // Apply grouping and aggregation if needed
    if (tileConfig.groupBy || tileConfig.yAxis?.aggregation) {
      return this.aggregateData(data, tileConfig);
    }

    return data;
  }

  private aggregateData(data: any[], tileConfig: AdhocTileConfig): any[] {
    const groupBy = tileConfig.groupBy || tileConfig.xAxis?.field;
    const aggregateField = tileConfig.yAxis?.field;
    const aggregationType = tileConfig.yAxis?.aggregation || 'count';

    if (!groupBy) return data;

    const groups: Record<string, any[]> = {};
    
    // Group data
    data.forEach(item => {
      const key = item[groupBy];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    // Aggregate groups
    return Object.entries(groups).map(([key, items]) => {
      const result: any = { [groupBy]: key };

      if (aggregateField && aggregationType !== 'count') {
        const values = items.map(item => Number(item[aggregateField])).filter(v => !isNaN(v));
        
        switch (aggregationType) {
          case 'sum':
            result[aggregateField] = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'avg':
            result[aggregateField] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            break;
          case 'min':
            result[aggregateField] = values.length > 0 ? Math.min(...values) : 0;
            break;
          case 'max':
            result[aggregateField] = values.length > 0 ? Math.max(...values) : 0;
            break;
          default:
            result[aggregateField] = values.length;
        }
      } else {
        result[aggregateField || 'count'] = items.length;
      }

      return result;
    });
  }

  private generateMockDataForTile(tileConfig: AdhocTileConfig): any[] {
    // Generate mock data based on tile configuration
    const mockData = [];
    const recordCount = Math.floor(Math.random() * 20) + 10;

    for (let i = 0; i < recordCount; i++) {
      const record: any = {};
      
      if (tileConfig.xAxis?.field) {
        record[tileConfig.xAxis.field] = `Item ${i + 1}`;
      }
      
      if (tileConfig.yAxis?.field) {
        record[tileConfig.yAxis.field] = Math.floor(Math.random() * 100) + 1;
      }

      // Add some additional fields
      record.id = i + 1;
      record.category = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
      record.value = Math.floor(Math.random() * 1000) + 100;
      record.percentage = Math.floor(Math.random() * 100);
      record.status = ['success', 'warning', 'error'][Math.floor(Math.random() * 3)];
      record.date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

      mockData.push(record);
    }

    return mockData;
  }
}

export const adhocDataService = new AdhocDataService();