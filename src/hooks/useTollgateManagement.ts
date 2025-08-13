import { useState, useCallback, useRef } from 'react';
import { roleAssignmentService } from '@/services/roleAssignmentService';
import { TollgateProcess } from '@/types/tollgate-types';
import { useDate } from '@/contexts/DateContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/lib/toast';

interface UseTollgateManagementProps {
  appId: number;
  appGroupId: string;
  enabled?: boolean;
  onSuccess?: () => void;
}

interface TollgateManagementState {
  loading: boolean;
  error: string | null;
  processes: TollgateProcess[];
}

export function useTollgateManagement({
  appId,
  appGroupId,
  enabled = true,
  onSuccess,
}: UseTollgateManagementProps) {
  const { selectedDate } = useDate();
  const { userInfo, loading: userLoading, error: userError } = useUser();
  const [state, setState] = useState<TollgateManagementState>({
    loading: false,
    error: null,
    processes: [],
  });

  const loadingTollgateProcesses = useRef(false);
  const lastLoadedTollgateParams = useRef<string>('');

  const formatDateForApi = useCallback((date: Date): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const loadTollgateProcesses = useCallback(async (forceReload = false) => {
    if (!enabled || loadingTollgateProcesses.current) return;

    const businessDate = formatDateForApi(selectedDate);
    const currentParams = `${appId}-${appGroupId}-${businessDate}`;
    if (!forceReload && lastLoadedTollgateParams.current === currentParams) {
      return;
    }

    loadingTollgateProcesses.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await roleAssignmentService.getTollgateProcesses(appId, appGroupId, businessDate);

      if (!response.success) {
        throw new Error(response.error || 'Failed to load tollgate processes');
      }

      setState(prev => ({
        ...prev,
        loading: false,
        processes: response.data,
      }));

      lastLoadedTollgateParams.current = currentParams;
    } catch (error: any) {
      console.error('[useTollgateManagement] Error loading tollgate processes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load tollgate processes',
        processes: [],
      }));
      toast.error(error.message || 'Failed to load tollgate processes');
    } finally {
      loadingTollgateProcesses.current = false;
    }
  }, [enabled, appId, appGroupId, selectedDate, formatDateForApi]);

  const reopenTollgate = useCallback(async (workflowProcessId: number) => {
    if (!userInfo) {
      toast.error('User information not available. Cannot reopen tollgate.');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const businessDate = formatDateForApi(selectedDate);
      const userId = userInfo.userName || userInfo.samAccountName;
      const response = await roleAssignmentService.reopenTollgateProcess(
        appId,
        appGroupId,
        businessDate,
        [workflowProcessId], // Send as an array as per new requirement
        userId
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to reopen tollgate process');
      }

      toast.success(`Tollgate process ${workflowProcessId} reopened successfully`);
      setState(prev => ({ ...prev, loading: false }));

      // Check if refresh should wait (greater than 5 seconds)
      const refreshDelay = 5000; // 5 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, refreshDelay);

    } catch (error: any) {
      console.error('[useTollgateManagement] Error reopening tollgate:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to reopen tollgate',
      }));
      toast.error(error.message || 'Failed to reopen tollgate');
    }
  }, [appId, appGroupId, selectedDate, formatDateForApi, onSuccess, userInfo]);

  return {
    state,
    actions: {
      loadTollgateProcesses,
      reopenTollgate,
    },
  };
}