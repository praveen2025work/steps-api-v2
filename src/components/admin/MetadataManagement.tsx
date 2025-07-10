import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, Loader2, Lock, Unlock } from 'lucide-react';
import { useMetadataManagement } from '@/hooks/useMetadataManagement';
import { toast } from '@/components/ui/use-toast';

// Form interfaces
interface StageForm {
  stageId?: number;
  name: string;
  description: string;
  updatedby: string;
}

const MetadataManagement: React.FC = () => {
  // Use the custom hook for data management
  const {
    applications,
    stages,
    inProgressStatus,
    loading,
    applicationsLoading,
    stagesLoading,
    inProgressLoading,
    error,
    applicationsError,
    stagesError,
    inProgressError,
    refreshApplications,
    refreshStages,
    checkInProgress,
    createStage,
    updateStage,
    refreshAll
  } = useMetadataManagement();

  // Local state for UI
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [stageToDelete, setStageToDelete] = useState<any>(null);

  // Form state
  const [stageForm, setStageForm] = useState<StageForm>({
    name: '',
    description: '',
    updatedby: 'system' // Default user, could be dynamic
  });

  // Load stages and in-progress status when application is selected
  useEffect(() => {
    if (selectedApplicationId) {
      refreshStages(selectedApplicationId);
      checkInProgress(selectedApplicationId);
    }
  }, [selectedApplicationId, refreshStages, checkInProgress]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (stageDialogOpen && selectedStage) {
      setStageForm({
        stageId: selectedStage.stageId,
        name: selectedStage.name,
        description: selectedStage.description || '',
        updatedby: selectedStage.updatedby || 'system'
      });
    } else if (stageDialogOpen) {
      setStageForm({
        name: '',
        description: '',
        updatedby: 'system'
      });
    }
  }, [stageDialogOpen, selectedStage]);

  // Form handlers
  const handleStageFormChange = (field: keyof StageForm, value: any) => {
    setStageForm(prev => ({ ...prev, [field]: value }));
  };

  // Save stage handler
  const handleSaveStage = async () => {
    if (!stageForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Stage name is required",
        variant: "destructive"
      });
      return;
    }

    if (!selectedApplicationId) {
      toast({
        title: "Validation Error",
        description: "Please select an application first",
        variant: "destructive"
      });
      return;
    }

    let success = false;

    if (stageForm.stageId) {
      // Update existing stage
      success = await updateStage(stageForm.stageId, {
        stageId: stageForm.stageId,
        name: stageForm.name,
        updatedby: stageForm.updatedby,
        updatedon: null,
        workflowApplication: { appId: selectedApplicationId },
        description: stageForm.description
      });
    } else {
      // Create new stage
      success = await createStage({
        stageId: null,
        name: stageForm.name,
        updatedby: stageForm.updatedby,
        updatedon: null,
        workflowApplication: { appId: selectedApplicationId },
        description: stageForm.description
      });
    }

    if (success) {
      setStageDialogOpen(false);
      setSelectedStage(null);
    }
  };

  // Delete confirmation handler
  const confirmDelete = () => {
    // Note: Delete functionality would need to be implemented in the API
    toast({
      title: "Feature Not Available",
      description: "Stage deletion is not yet implemented in the API",
      variant: "destructive"
    });
    setDeleteDialogOpen(false);
    setStageToDelete(null);
  };

  // Get current application data
  const currentApplication = selectedApplicationId 
    ? applications.find(app => app.appId === selectedApplicationId)
    : null;

  const currentStages = selectedApplicationId ? stages[selectedApplicationId] || [] : [];
  const isApplicationInProgress = selectedApplicationId ? inProgressStatus[selectedApplicationId] || false : false;
  const isStagesLoading = selectedApplicationId ? stagesLoading[selectedApplicationId] || false : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Metadata Management</h2>
          <p className="text-muted-foreground">
            Manage workflow applications and their stages with live data integration
          </p>
        </div>
        <Button onClick={refreshAll} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Application Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Application</CardTitle>
          <CardDescription>Choose an application to manage its stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="applicationSelect">Application</Label>
              <Select
                value={selectedApplicationId?.toString() || ""}
                onValueChange={(value) => setSelectedApplicationId(value ? parseInt(value) : null)}
                disabled={applicationsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={applicationsLoading ? "Loading applications..." : "Select an application"} />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.appId} value={app.appId.toString()}>
                      <div className="flex items-center space-x-2">
                        <span>{app.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {app.category}
                        </Badge>
                        {app.isactive === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={refreshApplications} 
              disabled={applicationsLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${applicationsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {applicationsError && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{applicationsError}</span>
              </div>
            </div>
          )}

          {currentApplication && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Description:</span> {currentApplication.description}
                </div>
                <div>
                  <span className="font-medium">Updated by:</span> {currentApplication.updatedby}
                </div>
                <div>
                  <span className="font-medium">Updated on:</span> {currentApplication.updatedon}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <div className="flex items-center space-x-2">
                    {isApplicationInProgress ? (
                      <>
                        <Lock className="h-4 w-4 text-orange-500" />
                        <Badge variant="outline" className="text-orange-600">
                          Importing - Actions Disabled
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 text-green-500" />
                        <Badge variant="outline" className="text-green-600">
                          Available
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stages Management */}
      {selectedApplicationId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Stages for {currentApplication?.name}</CardTitle>
              <CardDescription>
                Manage stages for the selected application
                {isApplicationInProgress && (
                  <span className="text-orange-600 font-medium ml-2">
                    (Application is importing - stage creation disabled)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => refreshStages(selectedApplicationId)} 
                disabled={isStagesLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ${isStagesLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setSelectedStage(null)}
                    disabled={isApplicationInProgress || loading}
                  >
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Stage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedStage ? 'Edit Stage' : 'Add New Stage'}</DialogTitle>
                    <DialogDescription>
                      {selectedStage ? 'Update the stage details' : 'Enter the details for the new stage'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stageName" className="text-right">Name</Label>
                      <Input 
                        id="stageName" 
                        className="col-span-3" 
                        placeholder="Stage name" 
                        value={stageForm.name}
                        onChange={(e) => handleStageFormChange('name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stageDescription" className="text-right">Description</Label>
                      <Textarea 
                        id="stageDescription" 
                        className="col-span-3" 
                        placeholder="Stage description" 
                        value={stageForm.description}
                        onChange={(e) => handleStageFormChange('description', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="updatedBy" className="text-right">Updated By</Label>
                      <Input 
                        id="updatedBy" 
                        className="col-span-3" 
                        placeholder="Username" 
                        value={stageForm.updatedby}
                        onChange={(e) => handleStageFormChange('updatedby', e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStageDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveStage} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {stagesError[selectedApplicationId] && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{stagesError[selectedApplicationId]}</span>
                </div>
              </div>
            )}

            {isStagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading stages...</span>
              </div>
            ) : currentStages.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">No Stages Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isApplicationInProgress 
                    ? "Cannot add stages while application is importing data."
                    : "Click the 'Add Stage' button to create your first stage for this application."
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stage ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Updated On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStages.map((stage) => (
                    <TableRow key={stage.stageId}>
                      <TableCell className="font-medium">{stage.stageId}</TableCell>
                      <TableCell>{stage.name}</TableCell>
                      <TableCell>{stage.description || '-'}</TableCell>
                      <TableCell>{stage.updatedby}</TableCell>
                      <TableCell>{stage.updatedon}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedStage(stage);
                              setStageDialogOpen(true);
                            }}
                            disabled={isApplicationInProgress || loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setStageToDelete(stage);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={isApplicationInProgress || loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the stage "{stageToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md p-4 bg-destructive text-destructive-foreground rounded-md shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataManagement;