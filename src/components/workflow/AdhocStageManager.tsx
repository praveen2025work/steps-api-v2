import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  RotateCcw, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Settings,
  Users,
  RefreshCw
} from 'lucide-react';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';

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
  const [selectedStage, setSelectedStage] = useState<AdhocStage | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedStages, setAddedStages] = useState<Set<number>>(new Set());

  // Fetch adhoc stage configurations
  const fetchAdhocStages = async () => {
    if (!appGroupId || !appId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflowconfig/${appGroupId}/${appId}/all?adhoc=Y`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract adhoc stages from the response
      const stages: AdhocStage[] = [];
      
      if (data && Array.isArray(data)) {
        data.forEach((config: any) => {
          if (config.workflowStage) {
            // Handle both object and lazy-loaded integer cases
            if (typeof config.workflowStage === 'object' && config.workflowStage.stageId) {
              stages.push({
                stageId: config.workflowStage.stageId,
                stageName: config.workflowStage.workflowApplication?.name || `Stage ${config.workflowStage.stageId}`,
                workflowApplication: config.workflowStage.workflowApplication
              });
            } else if (typeof config.workflowStage === 'number') {
              // Lazy-loaded case - use the integer as stageId
              stages.push({
                stageId: config.workflowStage,
                stageName: `Stage ${config.workflowStage}`,
                workflowApplication: undefined
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
  const handleStageAction = async (action: 'add' | 'reset', stageId: number) => {
    if (!appGroupId || !appId || !date) {
      showErrorToast('Missing required parameters for adhoc stage action');
      return;
    }

    const actionKey = `${action}-${stageId}`;
    setActionLoading(actionKey);
    setError(null);

    try {
      const isAdd = action === 'add';
      const url = `/api/process/adhoc/${appId}/${appGroupId}/${date}/${stageId}/${isAdd}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updatedby: 'user' // Could be enhanced to use actual user context
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400 && responseData.message?.includes('already added')) {
          // Mark this stage as already added and suppress the Add action
          setAddedStages(prev => new Set(prev).add(stageId));
          showErrorToast('Adhoc process already exists. Consider using Reset or contact admin.');
          return;
        }
        
        throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Success handling
      if (isAdd) {
        setAddedStages(prev => new Set(prev).add(stageId));
        showSuccessToast(`Successfully added adhoc stage: ${selectedStage?.stageName || `Stage ${stageId}`}`);
      } else {
        setAddedStages(prev => {
          const newSet = new Set(prev);
          newSet.delete(stageId);
          return newSet;
        });
        showSuccessToast(`Successfully reset adhoc stage: ${selectedStage?.stageName || `Stage ${stageId}`}`);
      }

      // Trigger workflow refresh if callback provided
      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 1000); // Small delay to allow backend processing
      }

    } catch (err: any) {
      console.error(`Error ${action}ing adhoc stage:`, err);
      showErrorToast(`Failed to ${action} adhoc stage: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Load adhoc stages when component opens
  useEffect(() => {
    if (isOpen && appGroupId && appId) {
      fetchAdhocStages();
    }
  }, [isOpen, appGroupId, appId]);

  // Reset state when closing
  const handleClose = () => {
    setIsOpen(false);
    setSelectedStage(null);
    setError(null);
    setAddedStages(new Set());
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`gap-2 ${className}`}
        title="Manage Adhoc Stages"
      >
        <Plus className="h-4 w-4" />
        Add Adhoc Stages
      </Button>
    );
  }

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Adhoc Stage Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAdhocStages}
              disabled={loading}
              title="Refresh adhoc stages"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          App ID: {appId} • Config ID: {appGroupId} • Date: {date}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
                Select Adhoc Stage
              </label>
              <Select
                value={selectedStage?.stageId.toString() || ""}
                onValueChange={(value) => {
                  const stage = adhocStages.find(s => s.stageId.toString() === value);
                  setSelectedStage(stage || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an adhoc stage..." />
                </SelectTrigger>
                <SelectContent>
                  {adhocStages.map((stage) => (
                    <SelectItem key={stage.stageId} value={stage.stageId.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{stage.stageName}</span>
                        <Badge variant="outline" className="ml-2">
                          ID: {stage.stageId}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage Actions */}
            {selectedStage && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{selectedStage.stageName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Stage ID: {selectedStage.stageId}
                      </p>
                    </div>
                    {addedStages.has(selectedStage.stageId) && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Added
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add Button */}
                    <Button
                      onClick={() => handleStageAction('add', selectedStage.stageId)}
                      disabled={
                        actionLoading === `add-${selectedStage.stageId}` ||
                        addedStages.has(selectedStage.stageId)
                      }
                      className="gap-2"
                      size="sm"
                    >
                      {actionLoading === `add-${selectedStage.stageId}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {addedStages.has(selectedStage.stageId) ? 'Already Added' : 'Add'}
                    </Button>

                    {/* Reset Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleStageAction('reset', selectedStage.stageId)}
                      disabled={actionLoading === `reset-${selectedStage.stageId}`}
                      className="gap-2"
                      size="sm"
                    >
                      {actionLoading === `reset-${selectedStage.stageId}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      Reset
                    </Button>

                    {/* Close Button */}
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedStage(null)}
                      size="sm"
                    >
                      Close
                    </Button>
                  </div>

                  {/* Additional Actions Info */}
                  {addedStages.has(selectedStage.stageId) && (
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        This adhoc stage has been added to the workflow. Use Reset to remove it and allow re-adding.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <div className="text-sm text-muted-foreground">
              <p>Available adhoc stages: {adhocStages.length}</p>
              {addedStages.size > 0 && (
                <p>Added stages: {addedStages.size}</p>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && adhocStages.length === 0 && !error && (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Adhoc Stages Found</h3>
            <p className="text-muted-foreground">
              No adhoc stage configurations are available for this workflow.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdhocStageManager;