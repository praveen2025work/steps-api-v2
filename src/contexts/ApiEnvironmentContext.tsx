import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiEnvironment, getAvailableEnvironments, getCurrentEnvironment } from '@/config/api-environments';
import { ApiClient, createApiClient } from '@/lib/api-client';

interface ApiEnvironmentContextType {
  currentEnvironment: ApiEnvironment;
  availableEnvironments: ApiEnvironment[];
  apiClient: ApiClient;
  switchEnvironment: (environment: ApiEnvironment) => void;
  isLoading: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'testing' | 'unknown';
  testConnection: () => Promise<void>;
  lastConnectionTest: string | null;
}

const ApiEnvironmentContext = createContext<ApiEnvironmentContextType | undefined>(undefined);

interface ApiEnvironmentProviderProps {
  children: ReactNode;
}

export const ApiEnvironmentProvider: React.FC<ApiEnvironmentProviderProps> = ({ children }) => {
  const [currentEnvironment, setCurrentEnvironment] = useState<ApiEnvironment>(getCurrentEnvironment());
  const [apiClient, setApiClient] = useState<ApiClient>(createApiClient(getCurrentEnvironment()));
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing' | 'unknown'>('unknown');
  const [lastConnectionTest, setLastConnectionTest] = useState<string | null>(null);
  
  const availableEnvironments = getAvailableEnvironments();

  // Switch environment
  const switchEnvironment = (environment: ApiEnvironment) => {
    setCurrentEnvironment(environment);
    const newClient = createApiClient(environment);
    setApiClient(newClient);
    setConnectionStatus('unknown');
    
    // Store the selected environment in localStorage for persistence
    localStorage.setItem('selectedApiEnvironment', environment.name);
  };

  // Test connection to current environment
  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');
    
    try {
      const result = await apiClient.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      setLastConnectionTest(new Date().toISOString());
    } catch (error) {
      setConnectionStatus('disconnected');
      setLastConnectionTest(new Date().toISOString());
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved environment on mount
  useEffect(() => {
    const savedEnvironment = localStorage.getItem('selectedApiEnvironment');
    if (savedEnvironment) {
      const environment = availableEnvironments.find(env => env.name === savedEnvironment);
      if (environment) {
        switchEnvironment(environment);
      }
    }
  }, []);

  // Auto-test connection when environment changes
  useEffect(() => {
    const timer = setTimeout(() => {
      testConnection();
    }, 1000); // Delay to avoid immediate API calls

    return () => clearTimeout(timer);
  }, [currentEnvironment]);

  const value: ApiEnvironmentContextType = {
    currentEnvironment,
    availableEnvironments,
    apiClient,
    switchEnvironment,
    isLoading,
    connectionStatus,
    testConnection,
    lastConnectionTest,
  };

  return (
    <ApiEnvironmentContext.Provider value={value}>
      {children}
    </ApiEnvironmentContext.Provider>
  );
};

// Custom hook to use the API environment context
export const useApiEnvironment = (): ApiEnvironmentContextType => {
  const context = useContext(ApiEnvironmentContext);
  if (context === undefined) {
    throw new Error('useApiEnvironment must be used within an ApiEnvironmentProvider');
  }
  return context;
};

// Hook to get applications data
export const useApplicationsData = () => {
  const { apiClient, isLoading: envLoading, connectionStatus } = useApiEnvironment();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  const fetchApplications = async (includeInactive: boolean = false) => {
    if (connectionStatus !== 'connected') {
      setError('API not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getWorkflowApplications(includeInactive);
      if (response.success) {
        setApplications(response.data);
        setLastFetch(response.timestamp);
      } else {
        setError(response.error || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applications,
    isLoading: isLoading || envLoading,
    error,
    lastFetch,
    fetchApplications,
    refetch: () => fetchApplications(),
  };
};