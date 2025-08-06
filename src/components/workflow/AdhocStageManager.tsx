import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  RotateCcw, 
  X, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useApiClient } from '@/lib/api-client';
import { getCurrentEnvironment } from '@/config/api-environments';

interface AdhocStage {
  stageId: number;
  stageName: string;
  workflowApplication?: {
    name: string;
  };
}

interface AdhocStageManagerProps {
  appGroupId: string;
  appId: number;
  date: string;
  onRefresh?: () => void;
  className?: string;
}

const AdhocStageManager: React.FC<AdhocStageManagerProps> = ({
  appGroupId,
  appId,
  date,
  onRefresh,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adhocStages, setAdhocStages] = useState<AdhocStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get API client and environment
  const apiClient = useApiClient();
  const environment = getCurrentEnvironment();

  // Format date to "27-Jun-2025" format
  const formatDateForApi = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate().toString().padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr; // fallback to original
    }
  };

  // Fetch adhoc stage configurations
  const fetchAdhocStages = async () => {
    if (!appGroupId || !appId) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${environment.javaApiUrl}/workflowconfig/${appGroupId}/${appId}/all?adhoc=Y`;
      console.log('Fetching adhoc stages from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Adhoc stages response:', data);
      
      // Extract adhoc stages from the response
      const stages: AdhocStage[] = [];
      
      if (data && Array.isArray(data)) {
        data.forEach((config: any) => {
          if (config.workflowStage) {
            let stageName = '';
            let stageId = 0;
            
            // Handle both object and lazy-loaded integer cases
            if (typeof config.workflowStage === 'object' && config.workflowStage.stageId) {
              stageId = config.workflowStage.stageId;
              // Try to get stage name from various possible locations
              stageName = config.workflowStage.stageName || 
                         config.workflowStage.name || 
                         config.workflowStage.workflowApplication?.name || 
                         config.name ||
                         `Stage ${stageId}`;
            } else if (typeof config.workflowStage === 'number') {
              // Lazy-loaded case - use the integer as stageId
              stageId = config.workflowStage;
              stageName = config.name || `Stage ${stageId}`;
            }
            
            if (stageId > 0) {
              stages.push({
                stageId: stageId,
                stageName: stageName,
                workflowApplication: config.workflowStage?.workflowApplication
              });
            }
          }
        });
      }

      // Remove duplicates based on stageId
      const uniqueStages = stages.filter((stage, index, self) => 
        index === self.findIndex(s => s.stageId === stage.stageId)
      );

      setAdhocStages(uniqueStages);
      
      // Automatically select the first stage if available
      if (uniqueStages.length > 0) {
        setSelectedStageId(uniqueStages[0].stageId.toString());
      }
      
      if (uniqueStages.length === 0) {
        setError('No adhoc stages found for this workflow configuration.');
      }
    } catch (err: any) {
      console.error('Error fetching adhoc stages:', err);
      setError(err.message || 'Failed to fetch adhoc stage configurations');
    } finally {
      setLoading(false);
    }
  };

  // Handle adhoc stage action (Add or Reset)
  const handleStageAction = async (action: 'add' | 'reset') => {
    if (!selectedStageId || !appGroupId || !appId || !date) {
      showErrorToast('Please select a stage and ensure all parameters are available');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const isAdd = action === 'add';
      const formattedDate = formatDateForApi(date);
      const url = `${environment.javaApiUrl}/process/adhoc/${appId}/${appGroupId}/${formattedDate}/${selectedStageId}/${isAdd}`;
      
      console.log(`${action} adhoc stage request to:`, url);
      console.log('Original date:', date, 'Formatted date:', formattedDate);
      
      const response = await fetch(url, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          updatedby: 'user'
        })
      });

      const responseData = await response.json();
      console.log(`${action} adhoc stage response:`, responseData);

      if (!response.ok) {
        if (response.status === 400 && responseData.message?.includes('already added')) {
          showErrorToast('Adhoc process already exists. Consider using Reset or contact admin.');
          return;
        }
        throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Success handling
      const selectedStage = adhocStages.find(s => s.stageId.toString() === selectedStageId);
      const stageName = selectedStage?.stageName || `Stage ${selectedStageId}`;
      
      if (isAdd) {
        showSuccessToast(`Successfully added adhoc stage: ${stageName}`);
      } else {
        showSuccessToast(`Successfully reset adhoc stage: ${stageName}`);
      }

      // Trigger workflow refresh if callback provided
      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 1000);
      }

      // Close the modal after successful action
      handleClose();

    } catch (err: any) {
      console.error(`Error ${action}ing adhoc stage:`, err);
      showErrorToast(`Failed to ${action} adhoc stage: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset state when closing
  const handleClose = () => {
    setIsOpen(false);
    setSelectedStageId('');
    setError(null);
    setAdhocStages([]);
  };

  // Handle opening the modal and automatically fetching stages
  const handleOpenModal = () => {
    setIsOpen(true);
    // Automatically fetch stages when opening
    fetchAdhocStages();
  };

  // Render the button when modal is closed
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenModal}
        className={`gap-2 ${className}`}
        title="Add Adhoc Stages"
      >
        <Plus className="h-4 w-4" />
        Add Adhoc Stage
      </Button>
    );
  }

  // Render the modal content
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Adhoc Stage</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            App ID: {appId} • Config ID: {appGroupId} • Date: {formatDateForApi(date)}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading adhoc stages...</p>
              </div>
            </div>
          )}

          {/* Stage Selection */}
          {!loading && adhocStages.length > 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Stage:
                </label>
                <Select
                  value={selectedStageId}
                  onValueChange={setSelectedStageId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a stage..." />
                  </SelectTrigger>
                  <SelectContent>
                    {adhocStages.map((stage) => (
                      <SelectItem key={stage.stageId} value={stage.stageId.toString()}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {stage.stageId}
                          </Badge>
                          <span>{stage.stageName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              {selectedStageId && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleStageAction('add')}
                    disabled={actionLoading}
                    className="flex-1 gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add
                  </Button>
                  <Button 
                    onClick={() => handleStageAction('reset')}
                    disabled={actionLoading}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Reset
                  </Button>
                  <Button 
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && adhocStages.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No adhoc stages available for this workflow
              </p>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdhocStageManager;