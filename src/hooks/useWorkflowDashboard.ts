import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/services/workflowService';
import { useDate } from '@/contexts/DateContext';
import {
  WorkflowApplication,
  WorkflowNode,
  WorkflowSummary,
  WorkflowDashboardApiResponse
} from '@/types/workflow-dashboard-types';

// Hook for managing workflow dashboard data with date integration
export const useWorkflowDashboard = () => {
  const { selectedDate } = useDate();
  const [applications, setApplications] = useState<WorkflowApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Format date for API calls
  const formatDateForApi = useCallback((date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  // Fetch workflow applications for the selected date
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dateString = formatDateForApi(selectedDate);
      const response = await workflowService.getAllWorkflowApplications({ date: dateString });
      
      if (response.success) {
        setApplications(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch workflow applications');
        setApplications([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, formatDateForApi]);

  // Refresh applications
  const refresh = useCallback(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Auto-fetch when selected date changes
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    lastFetch,
    selectedDate,
    dateString: formatDateForApi(selectedDate),
    fetchApplications,
    refresh,
  };
};

// Hook for managing workflow nodes with date integration
export const useWorkflowNodes = (
  appId?: number,
  configId?: string,
  currentLevel?: number,
  nextLevel?: number
) => {
  const { selectedDate } = useDate();
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Format date for API calls
  const formatDateForApi = useCallback((date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  // Fetch workflow nodes
  const fetchNodes = useCallback(async () => {
    if (!appId || !configId || currentLevel === undefined || nextLevel === undefined) {
      setNodes([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const dateString = formatDateForApi(selectedDate);
      const response = await workflowService.getWorkflowNodes({
        date: dateString,
        appId,
        configId,
        currentLevel,
        nextLevel
      });
      
      if (response.success) {
        setNodes(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch workflow nodes');
        setNodes([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setNodes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, appId, configId, currentLevel, nextLevel, formatDateForApi]);

  // Refresh nodes
  const refresh = useCallback(() => {
    fetchNodes();
  }, [fetchNodes]);

  // Auto-fetch when parameters change
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  return {
    nodes,
    loading,
    error,
    lastFetch,
    selectedDate,
    dateString: formatDateForApi(selectedDate),
    fetchNodes,
    refresh,
  };
};

// Hook for managing workflow summary with date integration
export const useWorkflowSummary = (configId?: string, appId?: number) => {
  const { selectedDate } = useDate();
  const [summary, setSummary] = useState<WorkflowSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Format date for API calls
  const formatDateForApi = useCallback((date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  // Fetch workflow summary
  const fetchSummary = useCallback(async () => {
    if (!configId || !appId) {
      setSummary(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const dateString = formatDateForApi(selectedDate);
      const response = await workflowService.getWorkflowSummary({
        date: dateString,
        configId,
        appId
      });
      
      if (response.success) {
        setSummary(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch workflow summary');
        setSummary(null);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, configId, appId, formatDateForApi]);

  // Refresh summary
  const refresh = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Auto-fetch when parameters change
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    lastFetch,
    selectedDate,
    dateString: formatDateForApi(selectedDate),
    fetchSummary,
    refresh,
  };
};

// Hook for complete workflow details with date integration
export const useCompleteWorkflowDetails = () => {
  const { selectedDate } = useDate();
  const [workflowData, setWorkflowData] = useState<{
    applications: WorkflowApplication[];
    terminalNodes: WorkflowNode[];
    workflowSummaries: WorkflowSummary[];
    errors: string[];
  }>({
    applications: [],
    terminalNodes: [],
    workflowSummaries: [],
    errors: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Format date for API calls
  const formatDateForApi = useCallback((date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  // Fetch complete workflow details
  const fetchCompleteDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dateString = formatDateForApi(selectedDate);
      const response = await workflowService.loadCompleteWorkflowDetails(dateString);
      
      if (response.success) {
        setWorkflowData(response.data);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch complete workflow details');
        setWorkflowData({
          applications: [],
          terminalNodes: [],
          workflowSummaries: [],
          errors: response.data?.errors || []
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setWorkflowData({
        applications: [],
        terminalNodes: [],
        workflowSummaries: [],
        errors: []
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, formatDateForApi]);

  // Refresh complete details
  const refresh = useCallback(() => {
    fetchCompleteDetails();
  }, [fetchCompleteDetails]);

  // Auto-fetch when selected date changes
  useEffect(() => {
    fetchCompleteDetails();
  }, [fetchCompleteDetails]);

  return {
    workflowData,
    loading,
    error,
    lastFetch,
    selectedDate,
    dateString: formatDateForApi(selectedDate),
    fetchCompleteDetails,
    refresh,
  };
};

// Hook for getting environment information
export const useWorkflowEnvironment = () => {
  const [envInfo] = useState(() => workflowService.getEnvironmentInfo());
  
  return envInfo;
};