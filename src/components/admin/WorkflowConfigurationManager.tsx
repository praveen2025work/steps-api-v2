import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3,
  ChevronRight,
  ChevronDown,
  Settings,
  FileText,
  Users,
  Upload,
  CheckSquare,
  Square,
  MoreHorizontal
} from 'lucide-react';
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

interface TreeNode {
  id: string;
  type: 'stage' | 'substage';
  name: string;
  sequence?: number;
  stageId?: number;
  substageId?: number;
  config?: WorkflowAppConfig;
  children?: TreeNode[];
  expanded?: boolean;
  flags?: {
    isActive: boolean;
    isAuto: boolean;
    isAdhoc: boolean;
    requiresApproval: boolean;
    requiresAttestation: boolean;
    requiresUpload: boolean;
  };
}

interface SelectedSubstage {
  substageId: number;
  configIndex: number;
  config: WorkflowAppConfig;
}

const WorkflowConfigurationManager: React.FC = () => {
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

  const [workflowTree, setWorkflowTree] = useState<TreeNode[]>([]);
  const [selectedSubstage, setSelectedSubstage] = useState<SelectedSubstage | null>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
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

  // Build workflow tree when config or metadata changes
  useEffect(() => {
    if (state.metadata && state.currentConfig.length > 0) {
      buildWorkflowTree();
    } else if (state.metadata) {
      // Show empty tree structure from metadata
      buildEmptyWorkflowTree();
    }
  }, [state.metadata, state.currentConfig]);

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
        error: null, // Don't show error for missing config
        currentConfig: [],
        isLoading: false
      }));
      
      toast({
        title: "Info",
        description: "No existing configuration found. You can create a new one.",
      });
    }
  };

  // Tree building methods
  const buildWorkflowTree = () => {
    if (!state.metadata) return;

    const stageMap = new Map<number, TreeNode>();
    
    // Create stage nodes
    state.metadata.WorkflowStage.forEach(stage => {
      stageMap.set(stage.stageId, {
        id: `stage-${stage.stageId}`,
        type: 'stage',
        name: stage.name,
        stageId: stage.stageId,
        children: [],
        expanded: true
      });
    });

    // Add configured substages to their stages
    state.currentConfig.forEach((config, index) => {
      const stageId = typeof config.workflowStage === 'object' 
        ? config.workflowStage.stageId 
        : config.workflowStage;
      
      const stageNode = stageMap.get(stageId);
      if (stageNode) {
        const substageNode: TreeNode = {
          id: `substage-${config.workflowSubstage.substageId}-${index}`,
          type: 'substage',
          name: config.workflowSubstage.name,
          sequence: config.substageSeq,
          substageId: config.workflowSubstage.substageId,
          config,
          flags: {
            isActive: config.isactive === 'Y',
            isAuto: config.auto === 'Y',
            isAdhoc: config.adhoc === 'Y',
            requiresApproval: config.approval === 'Y',
            requiresAttestation: config.attest === 'Y',
            requiresUpload: config.upload === 'Y'
          }
        };
        
        stageNode.children!.push(substageNode);
      }
    });

    // Sort substages by sequence
    stageMap.forEach(stage => {
      if (stage.children) {
        stage.children.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      }
    });

    setWorkflowTree(Array.from(stageMap.values()).filter(stage => stage.children!.length > 0));
  };

  const buildEmptyWorkflowTree = () => {
    if (!state.metadata) return;

    const stageNodes: TreeNode[] = state.metadata.WorkflowStage.map(stage => ({
      id: `stage-${stage.stageId}`,
      type: 'stage',
      name: stage.name,
      stageId: stage.stageId,
      children: [],
      expanded: false
    }));

    setWorkflowTree(stageNodes);
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
    setWorkflowTree([]);
    setSelectedSubstage(null);
  };

  const handleInstanceChange = (configId: string) => {
    setState(prev => ({
      ...prev,
      selectedConfigId: configId,
      currentConfig: []
    }));
    setSelectedSubstage(null);
  };

  const handleTreeNodeClick = (node: TreeNode) => {
    if (node.type === 'stage') {
      // Toggle stage expansion
      setWorkflowTree(prev => prev.map(stage => 
        stage.id === node.id 
          ? { ...stage, expanded: !stage.expanded }
          : stage
      ));
    } else if (node.type === 'substage' && node.config) {
      // Select substage for configuration
      const configIndex = state.currentConfig.findIndex(config => 
        config.workflowSubstage.substageId === node.substageId
      );
      
      if (configIndex !== -1) {
        setSelectedSubstage({
          substageId: node.substageId!,
          configIndex,
          config: node.config
        });
      }
    }
  };

  const handleSubstageUpdate = (field: keyof WorkflowAppConfig, value: any) => {
    if (!selectedSubstage) return;

    setState(prev => ({
      ...prev,
      currentConfig: prev.currentConfig.map((config, index) => 
        index === selectedSubstage.configIndex 
          ? { ...config, [field]: value }
          : config
      )
    }));

    // Update selected substage
    setSelectedSubstage(prev => prev ? {
      ...prev,
      config: { ...prev.config, [field]: value }
    } : null);
  };

  const addNewSubstage = (stageId: number) => {
    if (!state.metadata) {
      toast({
        title: "Error",
        description: "Metadata not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    const availableSubstages = state.metadata.WorkflowSubstage.filter(substage => 
      substage.defaultstage === stageId
    );

    if (availableSubstages.length === 0) {
      toast({
        title: "Warning",
        description: "No available substages for this stage.",
        variant: "destructive"
      });
      return;
    }

    // Use first available substage
    const substage = availableSubstages[0];
    const stage = state.metadata.WorkflowStage.find(s => s.stageId === stageId);

    const newConfig: WorkflowAppConfig = {
      workflowAppConfigId: 0,
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
      workflowStage: stage || stageId,
      workflowSubstage: {
        substageId: substage.substageId,
        name: substage.name,
        defaultstage: substage.defaultstage,
        entitlementMapping: substage.entitlementMapping,
        followUp: substage.followUp,
        updatedby: "system",
        updatedon: new Date().toISOString()
      }
    };

    setState(prev => ({
      ...prev,
      currentConfig: [...prev.currentConfig, newConfig]
    }));

    toast({
      title: "Success",
      description: "New substage added to workflow"
    });
  };

  const removeSubstage = (configIndex: number) => {
    setState(prev => ({
      ...prev,
      currentConfig: prev.currentConfig.filter((_, index) => index !== configIndex)
    }));

    if (selectedSubstage && selectedSubstage.configIndex === configIndex) {
      setSelectedSubstage(null);
    }

    toast({
      title: "Success",
      description: "Substage removed from workflow"
    });
  };

  const duplicateSubstage = (configIndex: number) => {
    const originalConfig = state.currentConfig[configIndex];
    const duplicatedConfig: WorkflowAppConfig = {
      ...originalConfig,
      workflowAppConfigId: 0, // New config will get new ID
      substageSeq: state.currentConfig.length + 1,
      updatedon: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      currentConfig: [...prev.currentConfig, duplicatedConfig]
    }));

    toast({
      title: "Success",
      description: "Substage duplicated successfully"
    });
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
        updatedby: 'system',
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

  const createNewInstance = () => {
    setState(prev => ({
      ...prev,
      currentConfig: [],
      selectedConfigId: 'new'
    }));
    setSelectedSubstage(null);
    setWorkflowTree([]);
    
    toast({
      title: "Info",
      description: "Ready to create new workflow instance. Add stages and substages to begin."
    });
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      await loadWorkflowApps();
      
      if (state.selectedAppId) {
        await loadWorkflowInstances(state.selectedAppId);
        await loadWorkflowMetadata(state.selectedAppId);
        
        if (state.selectedConfigId && state.selectedConfigId !== 'new') {
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

  // Render Methods
  const renderTopSection = () => (
    <div className="border-b bg-background p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workflow Configuration</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={createNewInstance}
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Instance
          </Button>
          <Button 
            onClick={saveWorkflowConfig}
            disabled={!state.selectedAppId || !state.selectedConfigId || state.currentConfig.length === 0 || state.isLoading}
            size="sm"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );

  const renderWorkflowTree = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">Workflow Tree</h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBulkEditMode(!bulkEditMode)}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Bulk Edit
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {workflowTree.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No Workflow Configuration</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select an application and workflow instance to view the configuration tree.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {workflowTree.map(stage => (
              <div key={stage.id} className="border rounded-lg">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => handleTreeNodeClick(stage)}
                >
                  <div className="flex items-center space-x-2">
                    {stage.expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewSubstage(stage.stageId!);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {stage.expanded && stage.children && (
                  <div className="border-t bg-muted/20">
                    {stage.children.map((substage, index) => (
                      <div 
                        key={substage.id}
                        className={`flex items-center justify-between p-3 ml-6 border-l-2 cursor-pointer hover:bg-background ${
                          selectedSubstage?.substageId === substage.substageId 
                            ? 'bg-primary/10 border-l-primary' 
                            : 'border-l-muted-foreground/20'
                        }`}
                        onClick={() => handleTreeNodeClick(substage)}
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          {bulkEditMode && (
                            <Checkbox
                              checked={selectedItems.has(substage.id)}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedItems);
                                if (checked) {
                                  newSelected.add(substage.id);
                                } else {
                                  newSelected.delete(substage.id);
                                }
                                setSelectedItems(newSelected);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {substage.sequence}
                          </span>
                          <span className="font-medium">{substage.name}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {substage.flags && (
                            <>
                              {substage.flags.isActive && (
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              )}
                              {substage.flags.isAuto && (
                                <Badge variant="outline" className="text-xs">Auto</Badge>
                              )}
                              {substage.flags.requiresApproval && (
                                <Badge variant="destructive" className="text-xs">Approval</Badge>
                              )}
                              {substage.flags.requiresAttestation && (
                                <Badge variant="default" className="text-xs">Attest</Badge>
                              )}
                              {substage.flags.requiresUpload && (
                                <Upload className="h-3 w-3 text-muted-foreground" />
                              )}
                            </>
                          )}
                          
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSubstage(substage.config ? 
                                  state.currentConfig.findIndex(c => c === substage.config) : 
                                  index
                                );
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubstage(substage.config ? 
                                  state.currentConfig.findIndex(c => c === substage.config) : 
                                  index
                                );
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderConfigurationDetails = () => {
    if (!selectedSubstage) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">Select a Substage</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a substage from the workflow tree to configure its settings.
            </p>
          </div>
        </div>
      );
    }

    const config = selectedSubstage.config;
    const availableDependencies = state.currentConfig.filter((c, index) => 
      c.substageSeq < config.substageSeq
    );

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">{config.workflowSubstage.name}</h3>
          <p className="text-sm text-muted-foreground">
            Sequence: {config.substageSeq} | Stage: {
              typeof config.workflowStage === 'object' 
                ? config.workflowStage.name 
                : 'Unknown'
            }
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.isactive === 'Y'}
                      onCheckedChange={(checked) => 
                        handleSubstageUpdate('isactive', checked ? 'Y' : 'N')
                      }
                    />
                    <Label>Active</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.auto === 'Y'}
                      onCheckedChange={(checked) => 
                        handleSubstageUpdate('auto', checked ? 'Y' : 'N')
                      }
                    />
                    <Label>Auto</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.adhoc === 'Y'}
                      onCheckedChange={(checked) => 
                        handleSubstageUpdate('adhoc', checked ? 'Y' : 'N')
                      }
                    />
                    <Label>Adhoc</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.approval === 'Y'}
                      onCheckedChange={(checked) => 
                        handleSubstageUpdate('approval', checked ? 'Y' : 'N')
                      }
                    />
                    <Label>Approval</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.attest === 'Y'}
                      onCheckedChange={(checked) => 
                        handleSubstageUpdate('attest', checked ? 'Y' : 'N')
                      }
                    />
                    <Label>Attestation</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.upload === 'Y'}
                      onCheckedChange={(checked) => 
                        handleSubstageUpdate('upload', checked ? 'Y' : 'N')
                      }
                    />
                    <Label>Upload</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dependencies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dependencies</CardTitle>
                <CardDescription>
                  Select substages that must complete before this one can start
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableDependencies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No available dependencies (no prior substages)
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableDependencies.map((dep, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          checked={config.workflowAppConfigDeps?.some(d => 
                            d.id.dependencySubstageId === dep.workflowSubstage.substageId
                          ) || false}
                          onCheckedChange={(checked) => {
                            const currentDeps = config.workflowAppConfigDeps || [];
                            let newDeps;
                            
                            if (checked) {
                              newDeps = [...currentDeps, {
                                id: {
                                  workflowAppConfigId: config.workflowAppConfigId,
                                  dependencySubstageId: dep.workflowSubstage.substageId
                                }
                              }];
                            } else {
                              newDeps = currentDeps.filter(d => 
                                d.id.dependencySubstageId !== dep.workflowSubstage.substageId
                              );
                            }
                            
                            handleSubstageUpdate('workflowAppConfigDeps', newDeps);
                          }}
                        />
                        <Label className="text-sm">
                          {dep.substageSeq}. {dep.workflowSubstage.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parameters</CardTitle>
                <CardDescription>
                  Configure parameters for this substage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!state.metadata?.WorkflowParams || state.metadata.WorkflowParams.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No parameters available for this application
                  </p>
                ) : (
                  <div className="space-y-3">
                    {state.metadata.WorkflowParams
                      .filter(param => param.paramType === 'DEFAULT')
                      .map(param => {
                        const currentParam = config.workflowAppConfigParams?.find(p => 
                          p.name === param.name
                        );
                        
                        return (
                          <div key={param.paramId} className="space-y-2">
                            <Label className="text-sm font-medium">{param.name}</Label>
                            {param.description && (
                              <p className="text-xs text-muted-foreground">{param.description}</p>
                            )}
                            <Input
                              value={currentParam?.value || ''}
                              onChange={(e) => {
                                const currentParams = config.workflowAppConfigParams || [];
                                const paramIndex = currentParams.findIndex(p => p.name === param.name);
                                
                                let newParams;
                                if (paramIndex >= 0) {
                                  newParams = [...currentParams];
                                  newParams[paramIndex].value = e.target.value;
                                } else {
                                  newParams = [...currentParams, {
                                    id: {
                                      workflowAppConfigId: config.workflowAppConfigId,
                                      name: param.name
                                    },
                                    name: param.name,
                                    value: e.target.value
                                  }];
                                }
                                
                                handleSubstageUpdate('workflowAppConfigParams', newParams);
                              }}
                              placeholder={`Enter ${param.name}`}
                            />
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attestations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attestations</CardTitle>
                <CardDescription>
                  Select required attestations for this substage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!state.metadata?.WorkflowAttest || state.metadata.WorkflowAttest.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No attestations available for this application
                  </p>
                ) : (
                  <div className="space-y-2">
                    {state.metadata.WorkflowAttest
                      .filter(attest => attest.type === 'DEFAULT')
                      .map(attest => (
                        <div key={attest.attestationId} className="flex items-start space-x-2">
                          <Checkbox
                            checked={config.workflowAttests?.some(a => 
                              a.attestationId === attest.attestationId
                            ) || false}
                            onCheckedChange={(checked) => {
                              const currentAttests = config.workflowAttests || [];
                              let newAttests;
                              
                              if (checked) {
                                newAttests = [...currentAttests, attest];
                              } else {
                                newAttests = currentAttests.filter(a => 
                                  a.attestationId !== attest.attestationId
                                );
                              }
                              
                              handleSubstageUpdate('workflowAttests', newAttests);
                            }}
                          />
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">{attest.name}</Label>
                            {attest.description && (
                              <p className="text-xs text-muted-foreground">{attest.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Upload Configuration */}
            {config.upload === 'Y' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">File Upload Configuration</CardTitle>
                  <CardDescription>
                    Configure file upload settings for this substage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>File Pattern</Label>
                    <Input
                      placeholder="e.g., *.xlsx, *.csv"
                      value={config.workflowAppConfigFiles?.[0]?.value || ''}
                      onChange={(e) => {
                        const currentFiles = config.workflowAppConfigFiles || [];
                        const newFiles = currentFiles.length > 0 
                          ? currentFiles.map(file => ({ ...file, value: e.target.value }))
                          : [{
                              id: {
                                workflowAppConfigId: config.workflowAppConfigId,
                                name: 'filePattern',
                                paramType: 'FILE'
                              },
                              name: 'filePattern',
                              paramType: 'FILE',
                              value: e.target.value,
                              description: 'File pattern for uploads',
                              required: 'Y',
                              emailFile: 'N',
                              fileUpload: 'Y'
                            }];
                        
                        handleSubstageUpdate('workflowAppConfigFiles', newFiles);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.workflowAppConfigFiles?.[0]?.required === 'Y'}
                        onCheckedChange={(checked) => {
                          const currentFiles = config.workflowAppConfigFiles || [];
                          const newFiles = currentFiles.map(file => ({
                            ...file,
                            required: checked ? 'Y' : 'N'
                          }));
                          handleSubstageUpdate('workflowAppConfigFiles', newFiles);
                        }}
                      />
                      <Label>Required</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.workflowAppConfigFiles?.[0]?.emailFile === 'Y'}
                        onCheckedChange={(checked) => {
                          const currentFiles = config.workflowAppConfigFiles || [];
                          const newFiles = currentFiles.map(file => ({
                            ...file,
                            emailFile: checked ? 'Y' : 'N'
                          }));
                          handleSubstageUpdate('workflowAppConfigFiles', newFiles);
                        }}
                      />
                      <Label>Email File</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the file upload requirements"
                      value={config.workflowAppConfigFiles?.[0]?.description || ''}
                      onChange={(e) => {
                        const currentFiles = config.workflowAppConfigFiles || [];
                        const newFiles = currentFiles.map(file => ({
                          ...file,
                          description: e.target.value
                        }));
                        handleSubstageUpdate('workflowAppConfigFiles', newFiles);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Section */}
      {renderTopSection()}

      {/* Error Display */}
      {state.error && (
        <div className="mx-4 mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700">{state.error}</span>
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Workflow Tree */}
        <div className="w-1/2 border-r bg-background">
          {renderWorkflowTree()}
        </div>

        {/* Right Panel - Configuration Details */}
        <div className="w-1/2 bg-background">
          {renderConfigurationDetails()}
        </div>
      </div>
    </div>
  );
};

export default WorkflowConfigurationManager;