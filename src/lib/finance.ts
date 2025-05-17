import { TileData, TileStatus, ChartType, DataSource, DataSourceField } from '@/types/finance-types';
import { format } from 'date-fns';

// Helper function to generate random data
const generateRandomData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * (max - min + 1)) + min
  }));
};

// Generate random time series data
const generateTimeSeriesData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    data.push({
      name: format(date, 'MMM dd'),
      actual: Math.floor(Math.random() * 100),
      expected: 75 + Math.floor(Math.random() * 10),
      variance: Math.floor(Math.random() * 20) - 10
    });
  }
  
  return data;
};

// Generate random table data
const generateTableData = (rows: number) => {
  const statuses = ['Completed', 'In Progress', 'Pending', 'Failed'];
  const regions = ['APAC', 'EMEA', 'NA', 'LATAM'];
  
  return Array.from({ length: rows }, (_, i) => ({
    id: `TX${1000 + i}`,
    date: format(new Date(Date.now() - i * 3600000), 'yyyy-MM-dd HH:mm'),
    amount: `$${(Math.random() * 10000).toFixed(2)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    region: regions[Math.floor(Math.random() * regions.length)]
  }));
};

// Available data sources for tile configuration
export const getAvailableDataSources = (): DataSource[] => {
  return [
    {
      id: 'pnl-daily',
      name: 'Daily P&L Data',
      description: 'Daily profit and loss data for all business units',
      endpoint: '/api/finance/pnl-daily',
      refreshInterval: 60,
      fields: [
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'actual', label: 'Actual P&L', type: 'number' },
        { name: 'expected', label: 'Expected P&L', type: 'number' },
        { name: 'variance', label: 'Variance', type: 'number' }
      ]
    },
    {
      id: 'regional-performance',
      name: 'Regional Performance',
      description: 'Performance metrics by geographical region',
      endpoint: '/api/finance/regional-performance',
      refreshInterval: 300,
      fields: [
        { name: 'region', label: 'Region', type: 'string' },
        { name: 'performance', label: 'Performance', type: 'number' },
        { name: 'target', label: 'Target', type: 'number' },
        { name: 'variance', label: 'Variance', type: 'number' }
      ]
    },
    {
      id: 'market-data',
      name: 'Market Data Availability',
      description: 'Status of market data feeds and sources',
      endpoint: '/api/finance/market-data',
      refreshInterval: 30,
      fields: [
        { name: 'feed', label: 'Data Feed', type: 'string' },
        { name: 'status', label: 'Status', type: 'string' },
        { name: 'lastUpdate', label: 'Last Update', type: 'date' },
        { name: 'percentage', label: 'Completion %', type: 'number' }
      ]
    },
    {
      id: 'fx-rates',
      name: 'FX Rates',
      description: 'Foreign exchange rates and trends',
      endpoint: '/api/finance/fx-rates',
      refreshInterval: 60,
      fields: [
        { name: 'currency', label: 'Currency', type: 'string' },
        { name: 'rate', label: 'Rate', type: 'number' },
        { name: 'change', label: 'Change', type: 'number' },
        { name: 'timestamp', label: 'Timestamp', type: 'date' }
      ]
    },
    {
      id: 'risk-metrics',
      name: 'Risk Metrics',
      description: 'Key risk indicators and metrics',
      endpoint: '/api/finance/risk-metrics',
      refreshInterval: 300,
      fields: [
        { name: 'metric', label: 'Metric', type: 'string' },
        { name: 'value', label: 'Value', type: 'number' },
        { name: 'limit', label: 'Limit', type: 'number' },
        { name: 'status', label: 'Status', type: 'string' }
      ]
    },
    {
      id: 'trade-volume',
      name: 'Trade Volume',
      description: 'Trading volume by product and region',
      endpoint: '/api/finance/trade-volume',
      refreshInterval: 120,
      fields: [
        { name: 'product', label: 'Product', type: 'string' },
        { name: 'region', label: 'Region', type: 'string' },
        { name: 'volume', label: 'Volume', type: 'number' },
        { name: 'value', label: 'Value', type: 'number' },
        { name: 'date', label: 'Date', type: 'date' }
      ]
    },
    {
      id: 'liquidity-metrics',
      name: 'Liquidity Metrics',
      description: 'Liquidity coverage and funding metrics',
      endpoint: '/api/finance/liquidity',
      refreshInterval: 300,
      fields: [
        { name: 'metric', label: 'Metric', type: 'string' },
        { name: 'value', label: 'Value', type: 'number' },
        { name: 'threshold', label: 'Threshold', type: 'number' },
        { name: 'status', label: 'Status', type: 'string' }
      ]
    },
    {
      id: 'regulatory-reporting',
      name: 'Regulatory Reporting',
      description: 'Status of regulatory reporting requirements',
      endpoint: '/api/finance/regulatory',
      refreshInterval: 3600,
      fields: [
        { name: 'report', label: 'Report', type: 'string' },
        { name: 'deadline', label: 'Deadline', type: 'date' },
        { name: 'status', label: 'Status', type: 'string' },
        { name: 'completion', label: 'Completion', type: 'number' }
      ]
    }
  ];
};

// Get fields for a specific data source
export const getDataSourceFields = (dataSourceId: string): DataSourceField[] => {
  const dataSources = getAvailableDataSources();
  const dataSource = dataSources.find(ds => ds.id === dataSourceId);
  return dataSource ? dataSource.fields : [];
};

// Fetch data from a data source (mock implementation)
export const fetchDataFromSource = async (dataSourceId: string, filters: any = {}) => {
  // In a real application, this would make an API call to the endpoint
  // For now, we'll return mock data based on the data source
  
  switch (dataSourceId) {
    case 'pnl-daily':
      return generateTimeSeriesData(14);
    
    case 'regional-performance':
      return [
        { region: 'APAC', performance: 92, target: 90, variance: 2 },
        { region: 'EMEA', performance: 85, target: 88, variance: -3 },
        { region: 'NA', performance: 95, target: 92, variance: 3 },
        { region: 'LATAM', performance: 78, target: 85, variance: -7 }
      ];
    
    case 'market-data':
      return [
        { feed: 'Market Data', status: 'Available', lastUpdate: '08:15 AM', percentage: 100 },
        { feed: 'Reference Data', status: 'Available', lastUpdate: '08:30 AM', percentage: 100 },
        { feed: 'Trade Data', status: 'Available', lastUpdate: '08:45 AM', percentage: 100 },
        { feed: 'Position Data', status: 'Delayed', lastUpdate: '09:15 AM', percentage: 75 }
      ];
    
    case 'fx-rates':
      return [
        { currency: 'EUR/USD', rate: 1.0923, change: 0.0015, timestamp: new Date().toISOString() },
        { currency: 'GBP/USD', rate: 1.2654, change: -0.0032, timestamp: new Date().toISOString() },
        { currency: 'USD/JPY', rate: 110.32, change: 0.45, timestamp: new Date().toISOString() },
        { currency: 'USD/CHF', rate: 0.9123, change: -0.0018, timestamp: new Date().toISOString() }
      ];
    
    case 'risk-metrics':
      return [
        { metric: 'VaR', value: 24.5, limit: 25, status: 'warning' },
        { metric: 'Stress Test', value: 42.8, limit: 50, status: 'warning' },
        { metric: 'Credit Risk', value: 65, limit: 80, status: 'success' },
        { metric: 'Operational Risk', value: 30, limit: 60, status: 'success' }
      ];
    
    case 'trade-volume':
      return [
        { product: 'Equities', region: 'APAC', volume: 1250, value: 8500000, date: new Date().toISOString() },
        { product: 'Equities', region: 'EMEA', volume: 1850, value: 12500000, date: new Date().toISOString() },
        { product: 'Fixed Income', region: 'NA', volume: 950, value: 18750000, date: new Date().toISOString() },
        { product: 'FX', region: 'LATAM', volume: 650, value: 4250000, date: new Date().toISOString() }
      ];
    
    case 'liquidity-metrics':
      return [
        { metric: 'LCR', value: 125, threshold: 100, status: 'success' },
        { metric: 'NSFR', value: 110, threshold: 100, status: 'success' },
        { metric: 'Cash Reserves', value: 1.2, threshold: 1.0, status: 'success' },
        { metric: 'Intraday', value: 95, threshold: 90, status: 'success' }
      ];
    
    case 'regulatory-reporting':
      return [
        { report: 'FINREP', deadline: '2025-05-30', status: 'In Progress', completion: 75 },
        { report: 'COREP', deadline: '2025-05-25', status: 'In Progress', completion: 60 },
        { report: 'MiFID II', deadline: '2025-05-20', status: 'Completed', completion: 100 },
        { report: 'Dodd-Frank', deadline: '2025-06-15', status: 'Not Started', completion: 0 }
      ];
    
    default:
      return [];
  }
};

// Generate mock tiles for the finance dashboard
export const generateMockTiles = (): TileData[] => {
  return [
    // Data Availability Tile
    {
      id: 'data-availability',
      title: 'Data Availability',
      description: 'Status of critical data feeds',
      status: 'success',
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'data-availability-status',
          chartType: 'status',
          data: [
            { name: 'Market Data', value: 'Available', status: 'success' },
            { name: 'Reference Data', value: 'Available', status: 'success' },
            { name: 'Trade Data', value: 'Available', status: 'success' },
            { name: 'Position Data', value: 'Delayed', status: 'warning' }
          ]
        },
        {
          id: 'data-availability-timeline',
          chartType: 'grid',
          columns: [
            { key: 'feed', label: 'Feed' },
            { key: 'lastUpdate', label: 'Last Update' },
            { key: 'status', label: 'Status' }
          ],
          data: [
            { feed: 'Market Data', lastUpdate: '08:15 AM', status: 'Complete' },
            { feed: 'Reference Data', lastUpdate: '08:30 AM', status: 'Complete' },
            { feed: 'Trade Data', lastUpdate: '08:45 AM', status: 'Complete' },
            { feed: 'Position Data', lastUpdate: '09:15 AM', status: 'Pending' }
          ]
        }
      ]
    },
    
    // FOBO Review Tile
    {
      id: 'fobo-review',
      title: 'FOBO Review',
      description: 'Front Office / Back Office reconciliation',
      status: 'warning',
      alert: true,
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'fobo-summary',
          chartType: 'bar',
          data: generateTimeSeriesData(7),
          series: [
            { key: 'actual', name: 'Actual', color: '#0369a1' },
            { key: 'expected', name: 'Expected', color: '#0891b2' }
          ],
          source: 'FOBO Reconciliation System'
        },
        {
          id: 'fobo-breaks',
          chartType: 'grid',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'description', label: 'Description' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' }
          ],
          data: [
            { id: 'BRK001', description: 'Trade Mismatch', amount: '$45,230.00', status: 'Open' },
            { id: 'BRK002', description: 'Missing Allocation', amount: '$12,500.00', status: 'Open' },
            { id: 'BRK003', description: 'Price Variance', amount: '$8,750.00', status: 'Investigating' }
          ],
          source: 'FOBO Reconciliation System'
        }
      ]
    },
    
    // P&L Analysis Tile
    {
      id: 'pnl-analysis',
      title: 'P&L Analysis',
      description: 'Daily profit and loss breakdown',
      status: 'success',
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'pnl-daily',
          chartType: 'line',
          data: generateTimeSeriesData(14),
          series: [
            { key: 'actual', name: 'Daily P&L', color: '#059669' },
            { key: 'expected', name: 'Expected', color: '#0d9488' }
          ],
          source: 'Finance Data Warehouse'
        },
        {
          id: 'pnl-breakdown',
          chartType: 'pie',
          data: [
            { name: 'Equities', value: 45 },
            { name: 'Fixed Income', value: 30 },
            { name: 'Commodities', value: 15 },
            { name: 'FX', value: 10 }
          ],
          series: [{ key: 'value' }],
          source: 'Finance Data Warehouse'
        }
      ]
    },
    
    // FX Exposure Tile
    {
      id: 'fx-exposure',
      title: 'FX Exposure',
      description: 'Currency exposure and hedging status',
      status: 'info',
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'fx-exposure-chart',
          chartType: 'bar',
          data: [
            { name: 'USD', gross: 120, net: 20 },
            { name: 'EUR', gross: 80, net: -15 },
            { name: 'GBP', gross: 60, net: 10 },
            { name: 'JPY', gross: 40, net: -5 },
            { name: 'CHF', gross: 30, net: 8 }
          ],
          series: [
            { key: 'gross', name: 'Gross Exposure', color: '#6366f1' },
            { key: 'net', name: 'Net Exposure', color: '#8b5cf6' }
          ],
          source: 'Risk Management System'
        },
        {
          id: 'fx-hedging',
          chartType: 'progress',
          data: [
            { name: 'USD', value: 85 },
            { name: 'EUR', value: 92 },
            { name: 'GBP', value: 78 },
            { name: 'JPY', value: 95 },
            { name: 'CHF', value: 88 }
          ],
          source: 'Risk Management System'
        }
      ]
    },
    
    // Liquidity Status Tile
    {
      id: 'liquidity-status',
      title: 'Liquidity Status',
      description: 'Current liquidity metrics and thresholds',
      status: 'success',
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'liquidity-metrics',
          chartType: 'status',
          data: [
            { name: 'LCR', value: '125%', status: 'success' },
            { name: 'NSFR', value: '110%', status: 'success' },
            { name: 'Cash Reserves', value: '$1.2B', status: 'success' },
            { name: 'Intraday', value: '95%', status: 'info' }
          ]
        },
        {
          id: 'liquidity-trend',
          chartType: 'line',
          data: generateTimeSeriesData(30),
          series: [
            { key: 'actual', name: 'Actual', color: '#0ea5e9' },
            { key: 'expected', name: 'Threshold', color: '#f59e0b' }
          ],
          source: 'Treasury Management System'
        }
      ]
    },
    
    // Regulatory Reporting Tile
    {
      id: 'regulatory-reporting',
      title: 'Regulatory Reporting',
      description: 'Status of regulatory reporting requirements',
      status: 'warning',
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'regulatory-status',
          chartType: 'grid',
          columns: [
            { key: 'report', label: 'Report' },
            { key: 'deadline', label: 'Deadline' },
            { key: 'status', label: 'Status' },
            { key: 'completion', label: 'Completion' }
          ],
          data: [
            { report: 'FINREP', deadline: '2025-05-30', status: 'In Progress', completion: '75%' },
            { report: 'COREP', deadline: '2025-05-25', status: 'In Progress', completion: '60%' },
            { report: 'MiFID II', deadline: '2025-05-20', status: 'Completed', completion: '100%' },
            { report: 'Dodd-Frank', deadline: '2025-06-15', status: 'Not Started', completion: '0%' }
          ],
          source: 'Regulatory Reporting System'
        },
        {
          id: 'regulatory-timeline',
          chartType: 'progress',
          data: [
            { name: 'FINREP', value: 75 },
            { name: 'COREP', value: 60 },
            { name: 'MiFID II', value: 100 },
            { name: 'Dodd-Frank', value: 0 }
          ],
          source: 'Regulatory Reporting System'
        }
      ]
    },
    
    // Risk Metrics Tile
    {
      id: 'risk-metrics',
      title: 'Risk Metrics',
      description: 'Key risk indicators and limits',
      status: 'error',
      alert: true,
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'risk-indicators',
          chartType: 'status',
          data: [
            { name: 'VaR', value: '$24.5M', status: 'error' },
            { name: 'Stress Test', value: '$42.8M', status: 'warning' },
            { name: 'Credit Risk', value: 'Medium', status: 'warning' },
            { name: 'Operational Risk', value: 'Low', status: 'success' }
          ]
        },
        {
          id: 'risk-trend',
          chartType: 'line',
          data: generateTimeSeriesData(14),
          series: [
            { key: 'actual', name: 'VaR', color: '#ef4444' },
            { key: 'expected', name: 'Limit', color: '#f59e0b' }
          ],
          source: 'Risk Management System'
        }
      ]
    },
    
    // Settlement Status Tile
    {
      id: 'settlement-status',
      title: 'Settlement Status',
      description: 'Daily settlement activity and exceptions',
      status: 'info',
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'settlement-summary',
          chartType: 'pie',
          data: [
            { name: 'Settled', value: 85 },
            { name: 'Pending', value: 10 },
            { name: 'Failed', value: 5 }
          ],
          series: [{ key: 'value' }],
          source: 'Settlement System'
        },
        {
          id: 'settlement-exceptions',
          chartType: 'grid',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'counterparty', label: 'Counterparty' },
            { key: 'amount', label: 'Amount' },
            { key: 'reason', label: 'Reason' }
          ],
          data: [
            { id: 'STL001', counterparty: 'Bank A', amount: '$1,250,000', reason: 'SSI Mismatch' },
            { id: 'STL002', counterparty: 'Fund B', amount: '$750,000', reason: 'Missing Confirmation' },
            { id: 'STL003', counterparty: 'Bank C', amount: '$2,100,000', reason: 'Funding Delay' }
          ],
          source: 'Settlement System'
        }
      ]
    },
    
    // Collateral Management Tile
    {
      id: 'collateral-management',
      title: 'Collateral Management',
      description: 'Collateral positions and margin calls',
      status: 'warning',
      lastUpdated: format(new Date(), 'HH:mm:ss'),
      slides: [
        {
          id: 'collateral-summary',
          chartType: 'bar',
          data: [
            { name: 'Cash', posted: 150, received: 120 },
            { name: 'Govt Bonds', posted: 80, received: 95 },
            { name: 'Corporate Bonds', posted: 45, received: 30 },
            { name: 'Equities', posted: 25, received: 15 }
          ],
          series: [
            { key: 'posted', name: 'Posted', color: '#0ea5e9' },
            { key: 'received', name: 'Received', color: '#8b5cf6' }
          ],
          source: 'Collateral Management System'
        },
        {
          id: 'margin-calls',
          chartType: 'grid',
          columns: [
            { key: 'counterparty', label: 'Counterparty' },
            { key: 'callAmount', label: 'Call Amount' },
            { key: 'deadline', label: 'Deadline' },
            { key: 'status', label: 'Status' }
          ],
          data: [
            { counterparty: 'Bank X', callAmount: '$3,500,000', deadline: '10:30 AM', status: 'Pending' },
            { counterparty: 'Hedge Fund Y', callAmount: '$1,200,000', deadline: '11:00 AM', status: 'Disputed' },
            { counterparty: 'Bank Z', callAmount: '$2,800,000', deadline: '02:00 PM', status: 'Confirmed' }
          ],
          source: 'Collateral Management System'
        }
      ]
    }
  ];
};