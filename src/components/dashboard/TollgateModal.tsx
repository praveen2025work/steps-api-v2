import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useRoleAssignmentOptimized } from '@/hooks/useRoleAssignmentOptimized';
import { 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  XCircle,
  Settings,
  CheckCircle
} from 'lucide-react';

interface TollgateModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: number;
  appGroupId: string;
  applicationName: string;
}

interface TollgateProcess {
  processId: string;
  name: string;
  status: string;
  canReopen: boolean;
  lastUpdated: string;
}

const TollgateModal: React.FC<TollgateModalProps> = ({
  isOpen,
  onClose,
  appId,
  appGroupId,
  applicationName
}) => {
  const { state, actions } = useRoleAssignmentOptimized({
    appId,
    appGroupId,
    enabled: isOpen
  });
  
  const [selectedTollgate, setSelectedTollgate] = useState<string>('');
  const [tollgateProcesses, setTollgateProcesses] = useState<TollgateProcess[]>([]);

  // Load tollgate processes when modal opens
  useEffect(() => {
    if (isOpen) {
      actions.loadTollgateProcesses();
    }
  }, [isOpen]); // Remove actions.loadTollgateProcesses from dependencies to prevent loops

  // Update local tollgate processes when hook data changes
  useEffect(() => {
    if (state.tollgateData?.availableProcesses) {
      setTollgateProcesses(state.tollgateData.availableProcesses);
    }
  }, [state.tollgateData]);

  const handleTollgateAction = async (action: 'reopen' | 'close') => {
    if (!selectedTollgate) return;
    
    try {
      await actions.reopenTollgate(selectedTollgate, action);
      setSelectedTollgate(''); // Clear selection after action
      // Keep modal open to show results
    } catch (error) {
      console.error('Error performing tollgate action:', error);
    }
  };

  const handleClose = () => {
    setSelectedTollgate('');
    onClose();
  };

  const selectedProcess = tollgateProcesses.find(p => p.processId === selectedTollgate);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tollgate Management - {applicationName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Display */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {state.loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span>Loading tollgate processes...</span>
            </div>
          )}

          {/* Available Tollgate Processes */}
          {!state.loading && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Available Tollgate Processes</h3>
                
                {tollgateProcesses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tollgate processes found for this application and date.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={actions.loadTollgateProcesses}
                      className="mt-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tollgateProcesses.map((process, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{process.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Process ID: {process.processId}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={process.status === 'COMPLETED' ? 'default' : 'secondary'}>
                              {process.status}
                            </Badge>
                            {process.canReopen && (
                              <Badge variant="outline" className="text-green-600">
                                Can Reopen
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Last updated: {new Date(process.lastUpdated).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tollgate Actions */}
              {tollgateProcesses.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Tollgate Actions</h3>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Tollgate Process</label>
                      <Select value={selectedTollgate} onValueChange={setSelectedTollgate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tollgate process to manage" />
                        </SelectTrigger>
                        <SelectContent>
                          {tollgateProcesses.map((process, index) => (
                            <SelectItem key={index} value={process.processId}>
                              <div className="flex items-center justify-between w-full">
                                <span>{process.name}</span>
                                <Badge 
                                  variant={process.status === 'COMPLETED' ? 'default' : 'secondary'}
                                  className="ml-2"
                                >
                                  {process.status}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedProcess && (
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{selectedProcess.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Status: {selectedProcess.status} | 
                                Last updated: {new Date(selectedProcess.lastUpdated).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedProcess.status === 'COMPLETED' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {!selectedProcess.canReopen && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              This tollgate process cannot be reopened. Please check the process status and permissions.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={actions.loadTollgateProcesses}
              disabled={state.loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <div className="flex gap-2">
              {selectedTollgate && (
                <>
                  <Button
                    onClick={() => handleTollgateAction('reopen')}
                    disabled={state.loading || !selectedProcess?.canReopen}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {state.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Reopen Tollgate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTollgateAction('close')}
                    disabled={state.loading}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {state.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Close Tollgate
                  </Button>
                </>
              )}
              
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TollgateModal;