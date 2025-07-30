import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, RefreshCw, Save, Plus, Edit, Trash2, Check, X, Info } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { workflowConfigService } from '@/services/workflowConfigService';
import type {
  WorkflowApp,
  WorkflowInstance,
  WorkflowMetadata,
  WorkflowAppConfig,
  WorkflowConfigState,
  WorkflowStage,
  WorkflowSubstage,
  WorkflowAttestation,
  WorkflowParameter,
  WorkflowConfigSavePayload
} from '@/types/workflow-config-types';

const WorkflowInstanceConfig: React.FC = () => {
  // State management
  const [state, setState] = useState<WorkflowConfigState>({
    selectedAppId: null,
    selectedConfigId: null,
    workflowApps: [],
    workflowInstances: [],
    metadata: null,
    currentConfig: [],
    isLoading: false,
    error: null
  });

  const [activeTab, setActiveTab] = useState('workflow');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load workflow applications on component mount
  useEffect(() => {
    loadWorkflowApps();
  }, []);

  // Load workflow instances when app is selected
  useEffect(() => {
    if (state.selectedAppId) {
      loadWorkflowInstances(state.selectedAppId);
      loadWorkflowMetadata(state.selectedAppId);
    }
  }, [state.selectedAppId]);

  // Load workflow configuration when instance is selected
  useEffect(() => {
    if (state.selectedAppId && state.selectedConfigId) {
      loadWorkflowConfig(state.selectedConfigId, state.selectedAppId);
    }
  }, [state.selectedAppId, state.selectedConfigId]);

  // API Methods
  const loadWorkflowApps = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const apps = await workflowConfigService.getWorkflowApps();
      setState(prev => ({
        ...prev,
        workflowApps: apps,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load workflow applications',
        isLoading: false
      }));
      
      toast({
        title: "Error",
        description: "Failed to load workflow applications",
        variant: "destructive"
      });
    }
  };

  const loadWorkflowInstances = async (appId: number) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const instances = await workflowConfigService.getWorkflowInstances(appId);
      setState(prev => ({
        ...prev,
        workflowInstances: instances,
        selectedConfigId: null,
        currentConfig: [],
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load workflow instances',
        isLoading: false
      }));
      
      toast({
        title: "Error",
        description: "Failed to load workflow instances",
        variant: "destructive"
      });
    }
  };

  const loadWorkflowMetadata = async (appId: number) => {
    try {
      const metadata = await workflowConfigService.getWorkflowMetadata(appId);
      setState(prev => ({
        ...prev,
        metadata
      }));
    } catch (error: any) {
      toast({
        title: "Warning",
        description: "Failed to load workflow metadata",
        variant: "destructive"
      });
    }
  };

  const loadWorkflowConfig = async (configId: string, appId: number) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const config = await workflowConfigService.getWorkflowConfig(configId, appId);
      setState(prev => ({
        ...prev,
        currentConfig: config,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load workflow configuration',
        currentConfig: [],
        isLoading: false
      }));
      
      toast({
        title: "Info",
        description: "No existing configuration found. You can create a new one.",
      });
    }
  };

  const saveWorkflowConfig = async () => {
    if (!state.selectedAppId || !state.selectedConfigId) {
      toast({
        title: "Error",
        description: "Please select an application and workflow instance",
        variant: "destructive"
      });
      return;
    }

    if (state.currentConfig.length === 0) {
      toast({
        title: "Error",
        description: "Please configure at least one workflow step",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Convert current config to save payload format
      const savePayload: WorkflowConfigSavePayload[] = state.currentConfig.map(config => ({
        workflowAppConfigId: config.workflowAppConfigId || null,
        appGroupId: config.appGroupId,
        adhoc: config.adhoc,
        approval: config.approval,
        attest: config.attest,
        auto: config.auto,
        isActive: config.isactive === 'Y',
        isAdhoc: config.adhoc === 'Y',
        isAlteryx: config.isalteryx === 'Y',
        isApproval: config.approval === 'Y',
        isAttest: config.attest === 'Y',
        isAuto: config.auto === 'Y',
        isUpload: config.upload === 'Y',
        isactive: config.isactive,
        stageName: typeof config.workflowStage === 'object' ? config.workflowStage.name : 'Unknown Stage',
        subStageName: config.workflowSubstage.name,
        substageSeq: config.substageSeq,
        substage_dependency: null,
        updatedby: 'system', // You might want to get this from user context
        upload: config.upload,
        workflowAppConfigDeps: config.workflowAppConfigDeps?.map(dep => ({
          id: {
            workflowAppConfigId: null,
            dependencySubstageId: dep.id.dependencySubstageId
          }
        })) || [],
        workflowAppConfigFiles: config.workflowAppConfigFiles?.map(file => ({
          id: {
            workflowAppConfigId: null,
            name: file.name,
            paramType: file.paramType
          },
          value: file.value,
          description: file.description,
          emailFile: file.emailFile,
          fileUpload: file.fileUpload,
          isEmailFile: file.emailFile === 'Y',
          isFileUpload: file.fileUpload === 'Y',
          isRequired: file.required === 'Y',
          required: file.required
        })) || [],
        workflowAppConfigParams: config.workflowAppConfigParams?.map(param => ({
          id: {
            workflowTransactionid: null,
            name: param.name
          },
          value: param.value
        })) || [],
        workflowApplication: {
          appId: state.selectedAppId!,
          name: state.workflowApps.find(app => app.appId === state.selectedAppId)?.name || 'Unknown',
          description: state.workflowApps.find(app => app.appId === state.selectedAppId)?.description || '',
          updatedby: 'system'
        },
        workflowStage: {
          stageId: typeof config.workflowStage === 'object' ? config.workflowStage.stageId : config.workflowStage,
          name: typeof config.workflowStage === 'object' ? config.workflowStage.name : 'Unknown Stage',
          updatedby: 'system'
        },
        workflowSubstage: {
          substageId: config.workflowSubstage.substageId,
          name: config.workflowSubstage.name,
          servicelink: config.workflowSubstage.servicelink || null,
          defaultstage: config.workflowSubstage.defaultstage
        },
        workflowAttests: config.workflowAttests || []
      }));

      // Determine if this is a new configuration or update
      const hasExistingConfig = state.currentConfig.some(config => config.workflowAppConfigId);
      
      let result;
      if (hasExistingConfig) {
        result = await workflowConfigService.updateWorkflowConfig(
          state.selectedConfigId,
          state.selectedAppId,
          savePayload
        );
      } else {
        result = await workflowConfigService.saveWorkflowConfig(
          state.selectedConfigId,
          state.selectedAppId,
          savePayload
        );
      }

      setState(prev => ({
        ...prev,
        currentConfig: result,
        isLoading: false
      }));

      toast({
        title: "Success",
        description: `Workflow configuration ${hasExistingConfig ? 'updated' : 'saved'} successfully`
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to save workflow configuration',
        isLoading: false
      }));
      
      toast({
        title: "Error",
        description: "Failed to save workflow configuration",
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      await loadWorkflowApps();
      
      if (state.selectedAppId) {
        await loadWorkflowInstances(state.selectedAppId);
        await loadWorkflowMetadata(state.selectedAppId);
        
        if (state.selectedConfigId) {
          await loadWorkflowConfig(state.selectedConfigId, state.selectedAppId);
        }
      }
      
      toast({
        title: "Success",
        description: "Data refreshed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Event Handlers
  const handleAppChange = (appId: string) => {
    const numericAppId = parseInt(appId);
    setState(prev => ({
      ...prev,
      selectedAppId: numericAppId,
      selectedConfigId: null,
      workflowInstances: [],
      metadata: null,
      currentConfig: []
    }));
  };

  const handleInstanceChange = (configId: string) => {
    setState(prev => ({
      ...prev,
      selectedConfigId: configId,
      currentConfig: []
    }));
  };

  const addNewConfigStep = () => {
    if (!state.metadata) {
      toast({
        title: "Error",
        description: "Metadata not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    // Create a new configuration step with default values
    const newStep: WorkflowAppConfig = {
      workflowAppConfigId: 0, // Will be assigned by backend
      adhoc: "N",
      appGroupId: state.selectedConfigId!,
      approval: "N",
      attest: "N",
      auto: "N",
      isactive: "Y",
      isalteryx: "N",
      substageSeq: state.currentConfig.length + 1,
      updatedby: "system",
      updatedon: new Date().toISOString(),
      upload: "N",
      workflowApplication: state.selectedAppId!,
      workflowStage: state.metadata.WorkflowStage[0]?.stageId || 0,
      workflowSubstage: {
        substageId: state.metadata.WorkflowSubstage[0]?.substageId || 0,
        name: state.metadata.WorkflowSubstage[0]?.name || 'New Substage',
        defaultstage: state.metadata.WorkflowSubstage[0]?.defaultstage || 0,
        entitlementMapping: state.metadata.WorkflowSubstage[0]?.entitlementMapping || 0,
        followUp: "N",
        updatedby: "system",
        updatedon: new Date().toISOString()
      }
    };

    setState(prev => ({
      ...prev,
      currentConfig: [...prev.currentConfig, newStep]
    }));

    toast({
      title: "Success",
      description: "New configuration step added"
    });
  };

  const removeConfigStep = (index: number) => {
    setState(prev => ({
      ...prev,
      currentConfig: prev.currentConfig.filter((_, i) => i !== index)
    }));

    toast({
      title: "Success",
      description: "Configuration step removed"
    });
  };

  const updateConfigStep = (index: number, field: keyof WorkflowAppConfig, value: any) => {
    setState(prev => ({
      ...prev,
      currentConfig: prev.currentConfig.map((config, i) => 
        i === index ? { ...config, [field]: value } : config
      )
    }));
  };

  // Render Methods
  const renderApplicationSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="application">Application</Label>
        <Select 
          value={state.selectedAppId?.toString() || ''} 
          onValueChange={handleAppChange}
        >
          <SelectTrigger id="application">
            <SelectValue placeholder="Select an application" />
          </SelectTrigger>
          <SelectContent>
            {state.workflowApps.map(app => (
              <SelectItem key={app.appId} value={app.appId.toString()}>
                {app.name} ({app.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="workflowInstance">Workflow Instance</Label>
        <Select 
          value={state.selectedConfigId || ''} 
          onValueChange={handleInstanceChange}
          disabled={!state.selectedAppId || state.workflowInstances.length === 0}
        >
          <SelectTrigger id="workflowInstance">
            <SelectValue placeholder={
              !state.selectedAppId 
                ? "Select an application first" 
                : state.workflowInstances.length === 0 
                  ? "No workflow instances available" 
                  : "Select a workflow instance"
            } />
          </SelectTrigger>
          <SelectContent>
            {state.workflowInstances.map(instance => (
              <SelectItem key={instance.configId} value={instance.configId}>
                {instance.configName} (ID: {instance.configId})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderConfigurationSteps = () => {
    if (!state.selectedAppId || !state.selectedConfigId) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">Select Application and Workflow Instance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please select an application and workflow instance to configure the workflow.
          </p>
        </div>
      );
    }

    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="animate-spin h-8 w-8 mr-2" />
          <span>Loading workflow configuration...</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Configuration Steps</h3>
          <Button onClick={addNewConfigStep} disabled={!state.metadata}>
            <Plus className="mr-2 h-4 w-4" /> Add Step
          </Button>
        </div>

        {state.currentConfig.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-sm text-muted-foreground">
              No configuration steps found. Click "Add Step" to create your first workflow step.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.currentConfig.map((config, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base">
                        Step {config.substageSeq}: {config.workflowSubstage.name}
                      </CardTitle>
                      <CardDescription>
                        Stage: {typeof config.workflowStage === 'object' ? config.workflowStage.name : 'Unknown'}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeConfigStep(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`active-${index}`}
                        checked={config.isactive === 'Y'}
                        onCheckedChange={(checked) => 
                          updateConfigStep(index, 'isactive', checked ? 'Y' : 'N')
                        }
                      />
                      <Label htmlFor={`active-${index}`}>Active</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`auto-${index}`}
                        checked={config.auto === 'Y'}
                        onCheckedChange={(checked) => 
                          updateConfigStep(index, 'auto', checked ? 'Y' : 'N')
                        }
                      />
                      <Label htmlFor={`auto-${index}`}>Auto</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`approval-${index}`}
                        checked={config.approval === 'Y'}
                        onCheckedChange={(checked) => 
                          updateConfigStep(index, 'approval', checked ? 'Y' : 'N')
                        }
                      />
                      <Label htmlFor={`approval-${index}`}>Approval</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`attest-${index}`}
                        checked={config.attest === 'Y'}
                        onCheckedChange={(checked) => 
                          updateConfigStep(index, 'attest', checked ? 'Y' : 'N')
                        }
                      />
                      <Label htmlFor={`attest-${index}`}>Attestation</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`upload-${index}`}
                        checked={config.upload === 'Y'}
                        onCheckedChange={(checked) => 
                          updateConfigStep(index, 'upload', checked ? 'Y' : 'N')
                        }
                      />
                      <Label htmlFor={`upload-${index}`}>Upload</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`adhoc-${index}`}
                        checked={config.adhoc === 'Y'}
                        onCheckedChange={(checked) => 
                          updateConfigStep(index, 'adhoc', checked ? 'Y' : 'N')
                        }
                      />
                      <Label htmlFor={`adhoc-${index}`}>Adhoc</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`alteryx-${index}`}
                        checked={config.isalteryx === 'Y'}
                        onCheckedChange={(checked) => 
                          updateConfigStep(index, 'isalteryx', checked ? 'Y' : 'N')
                        }
                      />
                      <Label htmlFor={`alteryx-${index}`}>Alteryx</Label>
                    </div>
                  </div>

                  {/* Stage and Substage Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Stage</Label>
                      <Select
                        value={typeof config.workflowStage === 'object' ? config.workflowStage.stageId.toString() : config.workflowStage.toString()}
                        onValueChange={(value) => {
                          const stageId = parseInt(value);
                          const stage = state.metadata?.WorkflowStage.find(s => s.stageId === stageId);
                          if (stage) {
                            updateConfigStep(index, 'workflowStage', stage);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {state.metadata?.WorkflowStage.map(stage => (
                            <SelectItem key={stage.stageId} value={stage.stageId.toString()}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Substage</Label>
                      <Select
                        value={config.workflowSubstage.substageId.toString()}
                        onValueChange={(value) => {
                          const substageId = parseInt(value);
                          const substage = state.metadata?.WorkflowSubstage.find(s => s.substageId === substageId);
                          if (substage) {
                            updateConfigStep(index, 'workflowSubstage', {
                              ...substage,
                              updatedby: config.workflowSubstage.updatedby,
                              updatedon: config.workflowSubstage.updatedon
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select substage" />
                        </SelectTrigger>
                        <SelectContent>
                          {state.metadata?.WorkflowSubstage.map(substage => (
                            <SelectItem key={substage.substageId} value={substage.substageId.toString()}>
                              {substage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dependencies */}
                  {config.workflowAppConfigDeps && config.workflowAppConfigDeps.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Dependencies</Label>
                      <div className="mt-2 space-y-1">
                        {config.workflowAppConfigDeps.map((dep, depIndex) => (
                          <Badge key={depIndex} variant="outline">
                            Depends on Step {dep.id.dependencySubstageId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parameters */}
                  {config.workflowAppConfigParams && config.workflowAppConfigParams.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Parameters</Label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {config.workflowAppConfigParams.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-center space-x-2">
                            <Label className="text-xs">{param.name}:</Label>
                            <Input
                              value={param.value}
                              onChange={(e) => {
                                const updatedParams = [...config.workflowAppConfigParams!];
                                updatedParams[paramIndex].value = e.target.value;
                                updateConfigStep(index, 'workflowAppConfigParams', updatedParams);
                              }}
                              className="text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMetadataInfo = () => {
    if (!state.metadata) {
      return (
        <div className="text-center py-8">
          <Info className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No Metadata Available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select an application to load available stages, substages, and other metadata.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stages */}
        <Card>
          <CardHeader>
            <CardTitle>Available Stages</CardTitle>
            <CardDescription>Stages available for this application</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead>Updated On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.metadata.WorkflowStage.map(stage => (
                  <TableRow key={stage.stageId}>
                    <TableCell>{stage.stageId}</TableCell>
                    <TableCell className="font-medium">{stage.name}</TableCell>
                    <TableCell>{stage.updatedby}</TableCell>
                    <TableCell>{new Date(stage.updatedon).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Substages */}
        <Card>
          <CardHeader>
            <CardTitle>Available Substages</CardTitle>
            <CardDescription>Substages available for this application</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Default Stage</TableHead>
                  <TableHead>Updated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.metadata.WorkflowSubstage.map(substage => (
                  <TableRow key={substage.substageId}>
                    <TableCell>{substage.substageId}</TableCell>
                    <TableCell className="font-medium">{substage.name}</TableCell>
                    <TableCell>{substage.defaultstage}</TableCell>
                    <TableCell>{substage.updatedby}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attestations */}
        <Card>
          <CardHeader>
            <CardTitle>Available Attestations</CardTitle>
            <CardDescription>Attestations available for this application</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.metadata.WorkflowAttest.map(attest => (
                  <TableRow key={attest.attestationId}>
                    <TableCell>{attest.attestationId}</TableCell>
                    <TableCell className="font-medium">{attest.name}</TableCell>
                    <TableCell>{attest.type}</TableCell>
                    <TableCell>{attest.description || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Available Parameters</CardTitle>
            <CardDescription>Parameters available for this application</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.metadata.WorkflowParams.map(param => (
                  <TableRow key={param.paramId}>
                    <TableCell>{param.paramId}</TableCell>
                    <TableCell className="font-medium">{param.name}</TableCell>
                    <TableCell>{param.paramType}</TableCell>
                    <TableCell>{param.description || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Workflow Instance Configuration</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={saveWorkflowConfig}
            disabled={!state.selectedAppId || !state.selectedConfigId || state.currentConfig.length === 0 || state.isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700">{state.error}</span>
          </div>
        </div>
      )}

      {/* Application Selection */}
      {renderApplicationSelection()}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflow">Workflow Configuration</TabsTrigger>
          <TabsTrigger value="metadata">Metadata & Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          <Card>
            <CardContent className="p-6">
              {renderConfigurationSteps()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata">
          <div className="space-y-4">
            {renderMetadataInfo()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowInstanceConfig;