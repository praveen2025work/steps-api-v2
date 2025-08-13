import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTollgateManagement } from '@/hooks/useTollgateManagement';
import { 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Settings,
} from 'lucide-react';

interface TollgateModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: number;
  appGroupId: string;
  applicationName: string;
  workflowRefreshCallback: () => void;
}

const TollgateModal: React.FC<TollgateModalProps> = ({
  isOpen,
  onClose,
  appId,
  appGroupId,
  applicationName,
  workflowRefreshCallback,
}) => {
  const handleSuccess = () => {
    workflowRefreshCallback();
    onClose();
  };

  const { state, actions } = useTollgateManagement({
    appId,
    appGroupId,
    enabled: isOpen,
    onSuccess: handleSuccess,
  });
  
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Reset selection when modal opens
      setSelectedProcessId('');
      actions.loadTollgateProcesses(true); // Force reload on open
    }
  }, [isOpen, actions.loadTollgateProcesses]);

  const handleReopen = async () => {
    if (!selectedProcessId) return;
    
    await actions.reopenTollgate(parseInt(selectedProcessId, 10));
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Reopen Tollgate - {applicationName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Display */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {state.loading && !state.processes.length ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span>Loading tollgate processes...</span>
            </div>
          ) : (
            <>
              {state.processes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No completed tollgate processes found that can be reopened.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Tollgate Process to Reopen</label>
                    <Select value={selectedProcessId} onValueChange={setSelectedProcessId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a process..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[500px] overflow-y-auto">
                        {state.processes.map((process) => (
                          <SelectItem
                            key={process.workflowProcessId}
                            value={process.workflowProcessId.toString()}
                            className="p-2"
                          >
                            <div className="flex flex-col gap-1.5">
                              <div className="font-semibold text-sm">
                                {process.workflowStage.name} - {process.workflowSubstage.name}
                              </div>
                              <div className="text-xs text-muted-foreground grid grid-cols-3 gap-x-4">
                                <span>ID: {process.workflowProcessId}</span>
                                <span>Status: <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{process.status}</Badge></span>
                                <span>By: {process.updatedBy}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Updated: {formatDateTime(process.updatedOn)}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => actions.loadTollgateProcesses(true)}
              disabled={state.loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleReopen}
                disabled={state.loading || !selectedProcessId}
                className="bg-green-600 hover:bg-green-700"
              >
                {state.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Reopen Selected Tollgate
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TollgateModal;