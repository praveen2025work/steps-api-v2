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
      // Financial Operations Dashboard
      {
        id: 'financial-operations',
        name: 'Financial Operations Dashboard',
        description: 'Comprehensive view of financial operations, risk metrics, and compliance status',
        dataSources: [
          {
            id: 'financial-api',
            name: 'Financial Operations API',
            description: 'Core financial operations data including trades, positions, and risk metrics',
            url: 'https://api.example.com/financial/operations',
            method: 'GET',
            refreshInterval: 300,
            authentication: {
              type: 'bearer',
              token: 'your-api-token-here'
            },
            dataPath: '$.data.operations',
            fields: [
              { name: 'tradeId', label: 'Trade ID', type: 'string', isFilterable: true },
              { name: 'instrument', label: 'Instrument', type: 'string', isFilterable: true },
              { name: 'notional', label: 'Notional Amount', type: 'number', aggregation: 'sum', format: 'currency' },
              { name: 'pnl', label: 'P&L', type: 'number', aggregation: 'sum', format: 'currency' },
              { name: 'riskScore', label: 'Risk Score', type: 'number', aggregation: 'avg' },
              { name: 'region', label: 'Region', type: 'string', isFilterable: true },
              { name: 'trader', label: 'Trader', type: 'string', isFilterable: true },
              { name: 'status', label: 'Status', type: 'string', isFilterable: true },
              { name: 'tradeDate', label: 'Trade Date', type: 'date', format: 'YYYY-MM-DD' },
              { name: 'maturityDate', label: 'Maturity Date', type: 'date', format: 'YYYY-MM-DD' }
            ]
          },
          {
            id: 'risk-metrics-api',
            name: 'Risk Metrics API',
            description: 'Real-time risk metrics and compliance data',
            url: 'https://api.example.com/risk/metrics',
            method: 'POST',
            body: '{"timeframe": "1d", "includeStress": true}',
            refreshInterval: 180,
            authentication: {
              type: 'apikey',
              apiKey: 'your-risk-api-key',
              apiKeyHeader: 'X-Risk-API-Key'
            },
            dataPath: '$.metrics',
            fields: [
              { name: 'portfolioId', label: 'Portfolio ID', type: 'string', isFilterable: true },
              { name: 'var95', label: 'VaR 95%', type: 'number', format: 'currency' },
              { name: 'var99', label: 'VaR 99%', type: 'number', format: 'currency' },
              { name: 'expectedShortfall', label: 'Expected Shortfall', type: 'number', format: 'currency' },
              { name: 'leverageRatio', label: 'Leverage Ratio', type: 'number', format: 'percentage' },
              { name: 'liquidityRatio', label: 'Liquidity Ratio', type: 'number', format: 'percentage' },
              { name: 'complianceStatus', label: 'Compliance Status', type: 'string', isFilterable: true },
              { name: 'lastUpdated', label: 'Last Updated', type: 'date', format: 'YYYY-MM-DD HH:mm:ss' }
            ]
          },
          {
            id: 'market-data-api',
            name: 'Market Data API',
            description: 'Live market data and pricing information',
            url: 'https://api.example.com/market/data',
            method: 'GET',
            refreshInterval: 60,
            authentication: {
              type: 'basic',
              username: 'market_user',
              password: 'market_pass'
            },
            fields: [
              { name: 'symbol', label: 'Symbol', type: 'string', isFilterable: true },
              { name: 'price', label: 'Current Price', type: 'number', format: 'currency' },
              { name: 'change', label: 'Price Change', type: 'number', format: 'currency' },
              { name: 'changePercent', label: 'Change %', type: 'number', format: 'percentage' },
              { name: 'volume', label: 'Volume', type: 'number', aggregation: 'sum' },
              { name: 'marketCap', label: 'Market Cap', type: 'number', format: 'currency' },
              { name: 'sector', label: 'Sector', type: 'string', isFilterable: true },
              { name: 'timestamp', label: 'Timestamp', type: 'date', format: 'YYYY-MM-DD HH:mm:ss' }
            ]
          }
        ],
        tiles: [
          {
            id: 'total-pnl-metric',
            title: 'Total P&L',
            description: 'Aggregate profit and loss across all positions',
            type: 'metric',
            dataSourceId: 'financial-api',
            yAxis: { field: 'pnl', label: 'Total P&L', aggregation: 'sum' },
            filters: [],
            refreshInterval: 300,
            isActive: true,
            position: 0,
            size: 'small'
          },
          {
            id: 'risk-score-gauge',
            title: 'Average Risk Score',
            description: 'Portfolio-wide risk assessment',
            type: 'progress',
            dataSourceId: 'financial-api',
            yAxis: { field: 'riskScore', label: 'Risk Score', aggregation: 'avg' },
            filters: [],
            refreshInterval: 300,
            isActive: true,
            position: 1,
            size: 'small'
          },
          {
            id: 'pnl-by-region',
            title: 'P&L by Region',
            description: 'Regional profit and loss breakdown',
            type: 'bar',
            dataSourceId: 'financial-api',
            xAxis: { field: 'region', label: 'Region' },
            yAxis: { field: 'pnl', label: 'P&L', aggregation: 'sum' },
            filters: [],
            refreshInterval: 300,
            isActive: true,
            position: 2,
            size: 'medium'
          },
          {
            id: 'trade-status-pie',
            title: 'Trade Status Distribution',
            description: 'Breakdown of trade statuses',
            type: 'pie',
            dataSourceId: 'financial-api',
            xAxis: { field: 'status', label: 'Status' },
            yAxis: { field: 'count', label: 'Count', aggregation: 'count' },
            filters: [],
            refreshInterval: 300,
            isActive: true,
            position: 3,
            size: 'medium'
          },
          {
            id: 'var-metrics',
            title: 'Value at Risk Metrics',
            description: 'VaR 95% and 99% across portfolios',
            type: 'line',
            dataSourceId: 'risk-metrics-api',
            xAxis: { field: 'portfolioId', label: 'Portfolio' },
            yAxis: { field: 'var95', label: 'VaR 95%', aggregation: 'none' },
            filters: [],
            refreshInterval: 180,
            isActive: true,
            position: 4,
            size: 'large'
          },
          {
            id: 'compliance-status',
            title: 'Compliance Status',
            description: 'Real-time compliance monitoring',
            type: 'status',
            dataSourceId: 'risk-metrics-api',
            xAxis: { field: 'portfolioId', label: 'Portfolio' },
            yAxis: { field: 'complianceStatus', label: 'Status', aggregation: 'none' },
            filters: [],
            refreshInterval: 180,
            isActive: true,
            position: 5,
            size: 'medium'
          },
          {
            id: 'trades-grid',
            title: 'Recent Trades',
            description: 'Detailed view of recent trading activity',
            type: 'grid',
            dataSourceId: 'financial-api',
            filters: [
              {
                field: 'tradeDate',
                operator: 'greaterThan',
                value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }
            ],
            refreshInterval: 300,
            isActive: true,
            position: 6,
            size: 'xlarge'
          }
        ],
        defaultColumns: 3,
        defaultViewMode: 'tile',
        globalFilters: [
          {
            field: 'region',
            operator: 'in',
            values: ['APAC', 'EMEA', 'Americas']
          }
        ],
        refreshInterval: 300,
        isPublic: false,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      // Workflow Operations Dashboard
      {
        id: 'workflow-operations',
        name: 'Workflow Operations Dashboard',
        description: 'Monitor workflow execution, performance metrics, and operational health',
        dataSources: [
          {
            id: 'workflow-api',
            name: 'Workflow Management API',
            description: 'Workflow execution data and performance metrics',
            url: 'https://api.example.com/workflow/operations',
            method: 'GET',
            refreshInterval: 120,
            authentication: {
              type: 'bearer',
              token: 'workflow-api-token'
            },
            fields: [
              { name: 'workflowId', label: 'Workflow ID', type: 'string', isFilterable: true },
              { name: 'workflowName', label: 'Workflow Name', type: 'string', isFilterable: true },
              { name: 'status', label: 'Status', type: 'string', isFilterable: true },
              { name: 'executionTime', label: 'Execution Time (ms)', type: 'number', aggregation: 'avg' },
              { name: 'startTime', label: 'Start Time', type: 'date', format: 'YYYY-MM-DD HH:mm:ss' },
              { name: 'endTime', label: 'End Time', type: 'date', format: 'YYYY-MM-DD HH:mm:ss' },
              { name: 'application', label: 'Application', type: 'string', isFilterable: true },
              { name: 'environment', label: 'Environment', type: 'string', isFilterable: true },
              { name: 'errorCount', label: 'Error Count', type: 'number', aggregation: 'sum' },
              { name: 'successRate', label: 'Success Rate', type: 'number', format: 'percentage' }
            ]
          },
          {
            id: 'system-metrics-api',
            name: 'System Metrics API',
            description: 'System performance and resource utilization',
            url: 'https://api.example.com/system/metrics',
            method: 'GET',
            refreshInterval: 60,
            fields: [
              { name: 'timestamp', label: 'Timestamp', type: 'date', format: 'YYYY-MM-DD HH:mm:ss' },
              { name: 'cpuUsage', label: 'CPU Usage %', type: 'number', format: 'percentage' },
              { name: 'memoryUsage', label: 'Memory Usage %', type: 'number', format: 'percentage' },
              { name: 'diskUsage', label: 'Disk Usage %', type: 'number', format: 'percentage' },
              { name: 'networkIO', label: 'Network I/O (MB/s)', type: 'number' },
              { name: 'activeConnections', label: 'Active Connections', type: 'number' },
              { name: 'queueDepth', label: 'Queue Depth', type: 'number' },
              { name: 'responseTime', label: 'Response Time (ms)', type: 'number', aggregation: 'avg' }
            ]
          }
        ],
        tiles: [
          {
            id: 'workflow-success-rate',
            title: 'Overall Success Rate',
            description: 'Percentage of successful workflow executions',
            type: 'metric',
            dataSourceId: 'workflow-api',
            yAxis: { field: 'successRate', label: 'Success Rate', aggregation: 'avg' },
            filters: [],
            refreshInterval: 120,
            isActive: true,
            position: 0,
            size: 'small'
          },
          {
            id: 'active-workflows',
            title: 'Active Workflows',
            description: 'Number of currently running workflows',
            type: 'metric',
            dataSourceId: 'workflow-api',
            yAxis: { field: 'count', label: 'Active Count', aggregation: 'count' },
            filters: [
              { field: 'status', operator: 'equals', value: 'running' }
            ],
            refreshInterval: 120,
            isActive: true,
            position: 1,
            size: 'small'
          },
          {
            id: 'workflow-status-distribution',
            title: 'Workflow Status Distribution',
            description: 'Breakdown of workflow statuses',
            type: 'pie',
            dataSourceId: 'workflow-api',
            xAxis: { field: 'status', label: 'Status' },
            yAxis: { field: 'count', label: 'Count', aggregation: 'count' },
            filters: [],
            refreshInterval: 120,
            isActive: true,
            position: 2,
            size: 'medium'
          },
          {
            id: 'execution-time-trend',
            title: 'Execution Time Trends',
            description: 'Average execution time over time',
            type: 'line',
            dataSourceId: 'workflow-api',
            xAxis: { field: 'startTime', label: 'Time' },
            yAxis: { field: 'executionTime', label: 'Execution Time (ms)', aggregation: 'avg' },
            filters: [],
            refreshInterval: 120,
            isActive: true,
            position: 3,
            size: 'large'
          },
          {
            id: 'system-cpu-usage',
            title: 'CPU Usage',
            description: 'System CPU utilization over time',
            type: 'area',
            dataSourceId: 'system-metrics-api',
            xAxis: { field: 'timestamp', label: 'Time' },
            yAxis: { field: 'cpuUsage', label: 'CPU Usage %', aggregation: 'none' },
            filters: [],
            refreshInterval: 60,
            isActive: true,
            position: 4,
            size: 'medium'
          },
          {
            id: 'memory-usage',
            title: 'Memory Usage',
            description: 'System memory utilization',
            type: 'progress',
            dataSourceId: 'system-metrics-api',
            yAxis: { field: 'memoryUsage', label: 'Memory Usage %', aggregation: 'avg' },
            filters: [],
            refreshInterval: 60,
            isActive: true,
            position: 5,
            size: 'small'
          },
          {
            id: 'workflow-errors-by-app',
            title: 'Errors by Application',
            description: 'Error count breakdown by application',
            type: 'bar',
            dataSourceId: 'workflow-api',
            xAxis: { field: 'application', label: 'Application' },
            yAxis: { field: 'errorCount', label: 'Error Count', aggregation: 'sum' },
            filters: [
              { field: 'errorCount', operator: 'greaterThan', value: 0 }
            ],
            refreshInterval: 120,
            isActive: true,
            position: 6,
            size: 'medium'
          }
        ],
        defaultColumns: 3,
        defaultViewMode: 'tile',
        globalFilters: [],
        refreshInterval: 120,
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      // Business Intelligence Dashboard
      {
        id: 'business-intelligence',
        name: 'Business Intelligence Dashboard',
        description: 'Key business metrics, KPIs, and performance indicators',
        dataSources: [
          {
            id: 'sales-api',
            name: 'Sales Data API',
            description: 'Sales performance and revenue data',
            url: 'https://api.example.com/sales/data',
            method: 'GET',
            refreshInterval: 600,
            authentication: {
              type: 'apikey',
              apiKey: 'sales-api-key',
              apiKeyHeader: 'X-API-Key'
            },
            fields: [
              { name: 'salesId', label: 'Sales ID', type: 'string' },
              { name: 'revenue', label: 'Revenue', type: 'number', aggregation: 'sum', format: 'currency' },
              { name: 'quantity', label: 'Quantity', type: 'number', aggregation: 'sum' },
              { name: 'product', label: 'Product', type: 'string', isFilterable: true },
              { name: 'category', label: 'Category', type: 'string', isFilterable: true },
              { name: 'region', label: 'Region', type: 'string', isFilterable: true },
              { name: 'salesperson', label: 'Salesperson', type: 'string', isFilterable: true },
              { name: 'customer', label: 'Customer', type: 'string', isFilterable: true },
              { name: 'saleDate', label: 'Sale Date', type: 'date', format: 'YYYY-MM-DD' },
              { name: 'margin', label: 'Margin %', type: 'number', format: 'percentage' }
            ]
          },
          {
            id: 'customer-api',
            name: 'Customer Analytics API',
            description: 'Customer behavior and satisfaction metrics',
            url: 'https://api.example.com/customers/analytics',
            method: 'POST',
            body: '{"includeSegmentation": true, "timeframe": "30d"}',
            refreshInterval: 1800,
            fields: [
              { name: 'customerId', label: 'Customer ID', type: 'string' },
              { name: 'segment', label: 'Customer Segment', type: 'string', isFilterable: true },
              { name: 'lifetimeValue', label: 'Lifetime Value', type: 'number', format: 'currency' },
              { name: 'acquisitionCost', label: 'Acquisition Cost', type: 'number', format: 'currency' },
              { name: 'satisfactionScore', label: 'Satisfaction Score', type: 'number' },
              { name: 'churnRisk', label: 'Churn Risk', type: 'number', format: 'percentage' },
              { name: 'lastPurchase', label: 'Last Purchase', type: 'date', format: 'YYYY-MM-DD' },
              { name: 'totalOrders', label: 'Total Orders', type: 'number', aggregation: 'sum' },
              { name: 'avgOrderValue', label: 'Avg Order Value', type: 'number', format: 'currency' }
            ]
          }
        ],
        tiles: [
          {
            id: 'total-revenue',
            title: 'Total Revenue',
            description: 'Sum of all revenue across all sales',
            type: 'metric',
            dataSourceId: 'sales-api',
            yAxis: { field: 'revenue', label: 'Total Revenue', aggregation: 'sum' },
            filters: [],
            refreshInterval: 600,
            isActive: true,
            position: 0,
            size: 'small'
          },
          {
            id: 'avg-order-value',
            title: 'Average Order Value',
            description: 'Average value per sales transaction',
            type: 'metric',
            dataSourceId: 'sales-api',
            yAxis: { field: 'revenue', label: 'Avg Order Value', aggregation: 'avg' },
            filters: [],
            refreshInterval: 600,
            isActive: true,
            position: 1,
            size: 'small'
          },
          {
            id: 'revenue-by-region',
            title: 'Revenue by Region',
            description: 'Regional revenue performance comparison',
            type: 'bar',
            dataSourceId: 'sales-api',
            xAxis: { field: 'region', label: 'Region' },
            yAxis: { field: 'revenue', label: 'Revenue', aggregation: 'sum' },
            filters: [],
            refreshInterval: 600,
            isActive: true,
            position: 2,
            size: 'medium'
          },
          {
            id: 'product-category-mix',
            title: 'Product Category Mix',
            description: 'Revenue distribution by product category',
            type: 'pie',
            dataSourceId: 'sales-api',
            xAxis: { field: 'category', label: 'Category' },
            yAxis: { field: 'revenue', label: 'Revenue', aggregation: 'sum' },
            filters: [],
            refreshInterval: 600,
            isActive: true,
            position: 3,
            size: 'medium'
          },
          {
            id: 'customer-satisfaction',
            title: 'Customer Satisfaction Trend',
            description: 'Customer satisfaction scores over time',
            type: 'line',
            dataSourceId: 'customer-api',
            xAxis: { field: 'lastPurchase', label: 'Date' },
            yAxis: { field: 'satisfactionScore', label: 'Satisfaction Score', aggregation: 'avg' },
            filters: [],
            refreshInterval: 1800,
            isActive: true,
            position: 4,
            size: 'large'
          },
          {
            id: 'customer-segments',
            title: 'Customer Segments',
            description: 'Distribution of customers by segment',
            type: 'pie',
            dataSourceId: 'customer-api',
            xAxis: { field: 'segment', label: 'Segment' },
            yAxis: { field: 'count', label: 'Customer Count', aggregation: 'count' },
            filters: [],
            refreshInterval: 1800,
            isActive: true,
            position: 5,
            size: 'medium'
          },
          {
            id: 'high-value-customers',
            title: 'High-Value Customers',
            description: 'Customers with highest lifetime value',
            type: 'grid',
            dataSourceId: 'customer-api',
            filters: [
              { field: 'lifetimeValue', operator: 'greaterThan', value: 10000 }
            ],
            refreshInterval: 1800,
            isActive: true,
            position: 6,
            size: 'large'
          },
          {
            id: 'churn-risk-analysis',
            title: 'Churn Risk Analysis',
            description: 'Customers at risk of churning',
            type: 'scatter',
            dataSourceId: 'customer-api',
            xAxis: { field: 'lifetimeValue', label: 'Lifetime Value' },
            yAxis: { field: 'churnRisk', label: 'Churn Risk %', aggregation: 'none' },
            filters: [
              { field: 'churnRisk', operator: 'greaterThan', value: 50 }
            ],
            refreshInterval: 1800,
            isActive: true,
            position: 7,
            size: 'large'
          }
        ],
        defaultColumns: 3,
        defaultViewMode: 'tile',
        globalFilters: [
          {
            field: 'saleDate',
            operator: 'greaterThan',
            value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ],
        refreshInterval: 600,
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      // Sample External APIs Dashboard
      {
        id: 'external-apis-demo',
        name: 'External APIs Demo',
        description: 'Demonstration dashboard using real external APIs for testing',
        dataSources: [
          {
            id: 'jsonplaceholder-posts',
            name: 'JSONPlaceholder Posts',
            description: 'Sample posts data from JSONPlaceholder API',
            url: 'https://jsonplaceholder.typicode.com/posts',
            method: 'GET',
            refreshInterval: 300,
            fields: [
              { name: 'id', label: 'Post ID', type: 'number', isFilterable: true },
              { name: 'userId', label: 'User ID', type: 'number', isFilterable: true },
              { name: 'title', label: 'Title', type: 'string', isFilterable: true },
              { name: 'body', label: 'Body', type: 'string', isFilterable: true }
            ]
          },
          {
            id: 'jsonplaceholder-users',
            name: 'JSONPlaceholder Users',
            description: 'Sample users data from JSONPlaceholder API',
            url: 'https://jsonplaceholder.typicode.com/users',
            method: 'GET',
            refreshInterval: 600,
            fields: [
              { name: 'id', label: 'User ID', type: 'number', isFilterable: true },
              { name: 'name', label: 'Name', type: 'string', isFilterable: true },
              { name: 'username', label: 'Username', type: 'string', isFilterable: true },
              { name: 'email', label: 'Email', type: 'string', isFilterable: true },
              { name: 'phone', label: 'Phone', type: 'string' },
              { name: 'website', label: 'Website', type: 'string' }
            ]
          },
          {
            id: 'httpbin-demo',
            name: 'HTTPBin Demo API',
            description: 'Demo API for testing different HTTP methods and responses',
            url: 'https://httpbin.org/json',
            method: 'GET',
            refreshInterval: 300,
            fields: [
              { name: 'slideshow', label: 'Slideshow Data', type: 'json' }
            ]
          }
        ],
        tiles: [
          {
            id: 'posts-by-user',
            title: 'Posts by User',
            description: 'Number of posts per user from JSONPlaceholder',
            type: 'bar',
            dataSourceId: 'jsonplaceholder-posts',
            xAxis: { field: 'userId', label: 'User ID' },
            yAxis: { field: 'count', label: 'Post Count', aggregation: 'count' },
            filters: [],
            refreshInterval: 300,
            isActive: true,
            position: 0,
            size: 'medium'
          },
          {
            id: 'total-posts',
            title: 'Total Posts',
            description: 'Total number of posts available',
            type: 'metric',
            dataSourceId: 'jsonplaceholder-posts',
            yAxis: { field: 'count', label: 'Total Posts', aggregation: 'count' },
            filters: [],
            refreshInterval: 300,
            isActive: true,
            position: 1,
            size: 'small'
          },
          {
            id: 'total-users',
            title: 'Total Users',
            description: 'Total number of users in the system',
            type: 'metric',
            dataSourceId: 'jsonplaceholder-users',
            yAxis: { field: 'count', label: 'Total Users', aggregation: 'count' },
            filters: [],
            refreshInterval: 600,
            isActive: true,
            position: 2,
            size: 'small'
          },
          {
            id: 'users-grid',
            title: 'Users Directory',
            description: 'Complete list of users with contact information',
            type: 'grid',
            dataSourceId: 'jsonplaceholder-users',
            filters: [],
            refreshInterval: 600,
            isActive: true,
            position: 3,
            size: 'xlarge'
          },
          {
            id: 'posts-grid',
            title: 'Recent Posts',
            description: 'Latest posts from all users',
            type: 'grid',
            dataSourceId: 'jsonplaceholder-posts',
            filters: [
              { field: 'id', operator: 'greaterThan', value: 90 }
            ],
            refreshInterval: 300,
            isActive: true,
            position: 4,
            size: 'xlarge'
          }
        ],
        defaultColumns: 3,
        defaultViewMode: 'tile',
        globalFilters: [],
        refreshInterval: 300,
        isPublic: true,
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
    // Generate mock data based on tile configuration and data source
    const mockData = [];
    const recordCount = Math.floor(Math.random() * 50) + 20;

    // Get sample data templates based on data source
    const dataTemplates = this.getMockDataTemplates();
    const template = dataTemplates[tileConfig.dataSourceId] || dataTemplates['default'];

    for (let i = 0; i < recordCount; i++) {
      const record: any = {};
      
      // Generate data based on template
      Object.entries(template).forEach(([field, generator]) => {
        if (typeof generator === 'function') {
          record[field] = generator(i);
        } else if (Array.isArray(generator)) {
          record[field] = generator[Math.floor(Math.random() * generator.length)];
        } else {
          record[field] = generator;
        }
      });

      // Override with tile-specific axis fields if configured
      if (tileConfig.xAxis?.field && !record[tileConfig.xAxis.field]) {
        record[tileConfig.xAxis.field] = `Item ${i + 1}`;
      }
      
      if (tileConfig.yAxis?.field && !record[tileConfig.yAxis.field]) {
        record[tileConfig.yAxis.field] = Math.floor(Math.random() * 1000) + 100;
      }

      mockData.push(record);
    }

    return mockData;
  }

  private getMockDataTemplates(): Record<string, any> {
    return {
      'financial-api': {
        tradeId: (i: number) => `TRD-${String(i + 1000).padStart(6, '0')}`,
        instrument: ['USD/EUR', 'GBP/USD', 'JPY/USD', 'AUD/USD', 'CHF/USD', 'CAD/USD', 'NZD/USD', 'SEK/USD'],
        notional: () => Math.floor(Math.random() * 10000000) + 1000000,
        pnl: () => (Math.random() - 0.5) * 500000,
        riskScore: () => Math.floor(Math.random() * 100) + 1,
        region: ['APAC', 'EMEA', 'Americas', 'LATAM'],
        trader: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'David Brown', 'Lisa Garcia'],
        status: ['completed', 'pending', 'failed', 'cancelled', 'in-progress'],
        tradeDate: () => new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maturityDate: () => new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      'risk-metrics-api': {
        portfolioId: (i: number) => `PF-${String(i + 100).padStart(4, '0')}`,
        var95: () => Math.floor(Math.random() * 1000000) + 100000,
        var99: () => Math.floor(Math.random() * 1500000) + 150000,
        expectedShortfall: () => Math.floor(Math.random() * 2000000) + 200000,
        leverageRatio: () => Math.floor(Math.random() * 50) + 10,
        liquidityRatio: () => Math.floor(Math.random() * 100) + 50,
        complianceStatus: ['compliant', 'warning', 'breach', 'under-review'],
        lastUpdated: () => new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      },
      'market-data-api': {
        symbol: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'ORCL', 'CRM'],
        price: () => Math.floor(Math.random() * 500) + 50,
        change: () => (Math.random() - 0.5) * 20,
        changePercent: () => (Math.random() - 0.5) * 10,
        volume: () => Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: () => Math.floor(Math.random() * 1000000000000) + 100000000000,
        sector: ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial', 'Energy'],
        timestamp: () => new Date().toISOString()
      },
      'workflow-api': {
        workflowId: (i: number) => `WF-${String(i + 1000).padStart(6, '0')}`,
        workflowName: ['Daily PnL Process', 'Risk Calculation', 'Trade Settlement', 'Compliance Check', 'Data Validation', 'Report Generation'],
        status: ['completed', 'running', 'failed', 'queued', 'cancelled'],
        executionTime: () => Math.floor(Math.random() * 300000) + 5000,
        startTime: () => new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        endTime: () => new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
        application: ['Basel', 'FRTB', 'CCAR', 'IFRS9', 'Liquidity', 'Market Risk'],
        environment: ['Production', 'UAT', 'Development', 'Staging'],
        errorCount: () => Math.floor(Math.random() * 5),
        successRate: () => Math.floor(Math.random() * 30) + 70
      },
      'system-metrics-api': {
        timestamp: () => new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        cpuUsage: () => Math.floor(Math.random() * 80) + 10,
        memoryUsage: () => Math.floor(Math.random() * 70) + 20,
        diskUsage: () => Math.floor(Math.random() * 60) + 30,
        networkIO: () => Math.floor(Math.random() * 1000) + 100,
        activeConnections: () => Math.floor(Math.random() * 500) + 50,
        queueDepth: () => Math.floor(Math.random() * 100) + 10,
        responseTime: () => Math.floor(Math.random() * 2000) + 100
      },
      'sales-api': {
        salesId: (i: number) => `SAL-${String(i + 10000).padStart(8, '0')}`,
        revenue: () => Math.floor(Math.random() * 50000) + 1000,
        quantity: () => Math.floor(Math.random() * 100) + 1,
        product: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F'],
        category: ['Electronics', 'Software', 'Services', 'Hardware', 'Consulting'],
        region: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'],
        salesperson: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Martinez', 'Frank Chen'],
        customer: ['Acme Corp', 'Global Industries', 'Tech Solutions', 'Enterprise LLC', 'Innovation Inc', 'Future Systems'],
        saleDate: () => new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        margin: () => Math.floor(Math.random() * 40) + 10
      },
      'customer-api': {
        customerId: (i: number) => `CUST-${String(i + 1000).padStart(6, '0')}`,
        segment: ['Enterprise', 'SMB', 'Startup', 'Government', 'Non-Profit'],
        lifetimeValue: () => Math.floor(Math.random() * 100000) + 5000,
        acquisitionCost: () => Math.floor(Math.random() * 5000) + 500,
        satisfactionScore: () => Math.floor(Math.random() * 5) + 1,
        churnRisk: () => Math.floor(Math.random() * 100),
        lastPurchase: () => new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalOrders: () => Math.floor(Math.random() * 50) + 1,
        avgOrderValue: () => Math.floor(Math.random() * 10000) + 500
      },
      'jsonplaceholder-posts': {
        id: (i: number) => i + 1,
        userId: () => Math.floor(Math.random() * 10) + 1,
        title: (i: number) => `Sample Post Title ${i + 1}`,
        body: (i: number) => `This is the body content for post ${i + 1}. It contains sample text to demonstrate the data structure.`
      },
      'jsonplaceholder-users': {
        id: (i: number) => i + 1,
        name: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Davis', 'Eve Martinez', 'Frank Chen', 'Grace Lee', 'Henry Taylor'],
        username: (i: number) => `user${i + 1}`,
        email: (i: number) => `user${i + 1}@example.com`,
        phone: () => `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        website: (i: number) => `user${i + 1}.example.com`
      },
      'default': {
        id: (i: number) => i + 1,
        name: (i: number) => `Item ${i + 1}`,
        value: () => Math.floor(Math.random() * 1000) + 100,
        category: ['Category A', 'Category B', 'Category C', 'Category D'],
        status: ['active', 'inactive', 'pending', 'completed'],
        date: () => new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        percentage: () => Math.floor(Math.random() * 100),
        amount: () => Math.floor(Math.random() * 10000) + 1000
      }
    };
  }
}

export const adhocDataService = new AdhocDataService();