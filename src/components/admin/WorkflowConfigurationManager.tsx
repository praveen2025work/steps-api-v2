import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  MoreHorizontal,
  Loader2,
  Database,
  Network,
  Target,
  Link,
  Search,
  X,
  Rows,
  LayoutGrid,
  List
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { workflowConfigService } from '@/services/workflowConfigService';
import { StageReorderView } from './dnd/StageReorderView';
import { useMetadataManagement } from '@/hooks/useMetadataManagement';
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
  WorkflowConfigSavePayload,
  WorkflowAppConfigFile
} from '@/types/workflow-config-types';

type StageWithFullSubstages = WorkflowStage & { substages: WorkflowAppConfig[] };

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
    isAlteryx: boolean;
  };
}

interface SelectedSubstage {
  substageId: number;
  configIndex: number;
  config: WorkflowAppConfig;
}

interface SubstageSelector {
  stageId: number;
  availableSubstages: WorkflowSubstage[];
  selectedSubstageId: number | null;
}

interface MultiSelectStageModal {
  isOpen: boolean;
  availableStages: WorkflowStage[];
  selectedStageIds: Set<number>;
  searchTerm: string;
}

interface MultiSelectSubstageModal {
  isOpen: boolean;
  stageId: number | null;
  stageName: string;
  availableSubstages: WorkflowSubstage[];
  selectedSubstageIds: Set<number>;
  searchTerm: string;
}

const WorkflowConfigurationManager: React.FC = () => {
  // Metadata hook for fetching applications
  const { 
    applications: workflowAppsFromHook, 
    isLoading: isAppsLoading, 
    error: appsError, 
    refreshAllMetadata 
  } = useMetadataManagement();

  // Core state management
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

  // UI state
  const [workflowTree, setWorkflowTree] = useState<TreeNode[]>([]);
  const [selectedSubstage, setSelectedSubstage] = useState<SelectedSubstage | null>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [substageSelector, setSubstageSelector] = useState<SubstageSelector | null>(null);
  const [viewMode, setViewMode] = useState<'config' | 'reorder'>('config');
  const [reorderLayout, setReorderLayout] = useState<'grid' | 'list'>('grid');
  const [configLayout, setConfigLayout] = useState<'list' | 'grid'>('list');
  const [structureChangeCounter, setStructureChangeCounter] = useState(0);

  // Search state for workflow instances
  const [instanceSearchTerm, setInstanceSearchTerm] = useState('');

  // Multi-select modal states
  const [multiSelectStageModal, setMultiSelectStageModal] = useState<MultiSelectStageModal>({
    isOpen: false,
    availableStages: [],
    selectedStageIds: new Set(),
    searchTerm: ''
  });

  const [multiSelectSubstageModal, setMultiSelectSubstageModal] = useState<MultiSelectSubstageModal>({
    isOpen: false,
    stageId: null,
    stageName: '',
    availableSubstages: [],
    selectedSubstageIds: new Set(),
    searchTerm: ''
  });

  // Filtered workflow instances based on search
  const filteredWorkflowInstances = useMemo(() => {
    if (!instanceSearchTerm) return state.workflowInstances;
    
    return state.workflowInstances.filter(instance =>
      instance.configName.toLowerCase().includes(instanceSearchTerm.toLowerCase()) ||
      instance.configId.toLowerCase().includes(instanceSearchTerm.toLowerCase())
    );
  }, [state.workflowInstances, instanceSearchTerm]);

  // Sync applications from hook to state
  useEffect(() => {
    if (workflowAppsFromHook) {
      setState(prev => ({ ...prev, workflowApps: workflowAppsFromHook }));
    }
  }, [workflowAppsFromHook]);

  // Handle errors from metadata hook
  useEffect(() => {
    if (appsError) {
      const message = appsError.message || 'Failed to load workflow applications';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    }
  }, [appsError]);

  // Load workflow instances when app is selected
  useEffect(() => {
    if (state.selectedAppId) {
      loadWorkflowInstances(state.selectedAppId);
      loadWorkflowMetadata(state.selectedAppId);
    }
  }, [state.selectedAppId]);

  // Load workflow configuration when instance is selected
  useEffect(() => {
    if (state.selectedAppId && state.selectedConfigId && state.selectedConfigId !== 'new') {
      loadWorkflowConfig(state.selectedConfigId, state.selectedAppId);
    }
  }, [state.selectedAppId, state.selectedConfigId]);

  // Build workflow tree when structure changes or metadata loads
  useEffect(() => {
    if (state.metadata) {
      if (state.currentConfig.length > 0) {
        buildWorkflowTree();
      } else {
        buildEmptyWorkflowTree();
      }
    }
  }, [state.metadata, structureChangeCounter]);

  // Drag and Drop Handlers
  const toggleAllStages = (expand: boolean) => {
    setWorkflowTree(prevTree => prevTree.map(stage => ({
        ...stage,
        expanded: expand
    })));
  };

  // Drag and Drop Handlers
  const handleOrderChange = (reorderedStages: StageWithFullSubstages[]) => {
    const flattenedConfig: WorkflowAppConfig[] = [];
    reorderedStages.forEach(stage => {
      if (stage.substages) {
        stage.substages.forEach(substageConfig => {
            const fullConfig = state.currentConfig.find(c => c.workflowAppConfigId === substageConfig.workflowAppConfigId);
            if (fullConfig) {
                const updatedConfig = {
                    ...fullConfig,
                    workflowStage: {
                        stageId: stage.stageId,
                        name: stage.stageName,
                        updatedby: 'system'
                    }
                };
                flattenedConfig.push(updatedConfig);
            }
        });
      }
    });
  
    const finalConfig = flattenedConfig.map((config, index) => ({
      ...config,
      substageSeq: index + 1,
    }));
  
    setState(prev => ({ ...prev, currentConfig: finalConfig }));
    setStructureChangeCounter(c => c + 1);
    toast({
      title: "Order Updated",
      description: "Workflow order has been updated. Save to persist changes.",
    });
  };

  // API Methods
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
      setInstanceSearchTerm(''); // Reset search when loading new instances
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
      setStructureChangeCounter(c => c + 1);
      
      if (config.length === 0) {
        toast({
          title: "Info",
          description: "No existing configuration found. You can create a new one.",
        });
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: null, // Don't show error for missing config
        currentConfig: [],
        isLoading: false
      }));
      setStructureChangeCounter(c => c + 1);
      
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
    
    // Create stage nodes from configured stages
    const configuredStageIds = new Set(state.currentConfig.map(config => {
      return typeof config.workflowStage === 'object' 
        ? config.workflowStage.stageId 
        : config.workflowStage;
    }));

    const expandedStateMap = new Map<string, boolean>();
    workflowTree.forEach(node => {
      if (node.type === 'stage') {
        expandedStateMap.set(node.id, node.expanded || false);
      }
    });

    configuredStageIds.forEach(stageId => {
      const stage = state.metadata!.WorkflowStage.find(s => s.stageId === stageId);
      if (stage) {
        const stageNodeId = `stage-${stageId}`;
        stageMap.set(stageId, {
          id: stageNodeId,
          type: 'stage',
          name: stage.name,
          stageId: stage.stageId,
          children: [],
          expanded: expandedStateMap.has(stageNodeId) ? expandedStateMap.get(stageNodeId)! : true
        });
      }
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
            requiresUpload: config.upload === 'Y',
            isAlteryx: config.isalteryx === 'Y'
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

    setWorkflowTree(Array.from(stageMap.values()));
  };

  const buildEmptyWorkflowTree = () => {
    if (!state.metadata) return;

    const stageNodes: TreeNode[] = state.metadata.WorkflowStage
      .filter(stage => stage.workflowApplication === state.selectedAppId)
      .map(stage => ({
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
    setStructureChangeCounter(c => c + 1);
    setWorkflowTree([]);
    setSelectedSubstage(null);
    setSubstageSelector(null);
    setInstanceSearchTerm('');
  };

  const handleInstanceChange = (configId: string) => {
    setState(prev => ({
      ...prev,
      selectedConfigId: configId,
      currentConfig: []
    }));
    setStructureChangeCounter(c => c + 1);
    setSelectedSubstage(null);
    setSubstageSelector(null);
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
        config.workflowSubstage.substageId === node.substageId &&
        config.substageSeq === node.sequence
      );
      
      if (configIndex !== -1) {
        setSelectedSubstage({
          substageId: node.substageId!,
          configIndex,
          config: node.config
        });
        setSubstageSelector(null);
      }
    }
  };

  const handleSubstageUpdate = useCallback((field: keyof WorkflowAppConfig, value: any) => {
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
  }, [selectedSubstage]);

  // Get available parameters based on paramMapping, excluding UPLOAD type
  const getAvailableParameters = useCallback((substage: WorkflowSubstage) => {
    if (!state.metadata?.WorkflowParams || !substage.paramMapping) {
      return [];
    }

    const paramIds = substage.paramMapping
      .split(';')
      .filter(id => id.trim())
      .map(id => parseInt(id.trim()));

    return state.metadata.WorkflowParams.filter(param => 
      paramIds.includes(param.paramId) && param.paramType?.toUpperCase() !== 'UPLOAD'
    );
  }, [state.metadata]);

  // Get all available attestations (not filtered by mapping when step is not auto)
  const getAvailableAttestations = useCallback((substage: WorkflowSubstage, isAutoType: boolean) => {
    if (!state.metadata?.WorkflowAttest) {
      return [];
    }

    // If step is auto, no attestations are available
    if (isAutoType) {
      return [];
    }

    // For non-auto steps, show all available attestations in the system
    return state.metadata.WorkflowAttest;
  }, [state.metadata]);

  const showSubstageSelector = (stageId: number) => {
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

    setSubstageSelector({
      stageId,
      availableSubstages,
      selectedSubstageId: null
    });
  };

  const addSubstageToWorkflow = () => {
    if (!substageSelector || !substageSelector.selectedSubstageId || !state.metadata) {
      return;
    }

    const substage = substageSelector.availableSubstages.find(s => 
      s.substageId === substageSelector.selectedSubstageId
    );
    const stage = state.metadata.WorkflowStage.find(s => s.stageId === substageSelector.stageId);

    if (!substage || !stage) {
      toast({
        title: "Error",
        description: "Selected substage or stage not found.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicates in the same stage
    const existingInStage = state.currentConfig.filter(config => {
      const configStageId = typeof config.workflowStage === 'object' 
        ? config.workflowStage.stageId 
        : config.workflowStage;
      return configStageId === substageSelector.stageId && 
             config.workflowSubstage.substageId === substage.substageId;
    });

    if (existingInStage.length > 0) {
      toast({
        title: "Warning",
        description: "This substage already exists in this stage.",
        variant: "destructive"
      });
      return;
    }

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
      workflowStage: stage,
      workflowSubstage: {
        substageId: substage.substageId,
        name: substage.name,
        defaultstage: substage.defaultstage,
        attestationMapping: substage.attestationMapping,
        paramMapping: substage.paramMapping,
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
    setStructureChangeCounter(c => c + 1);

    setSubstageSelector(null);

    toast({
      title: "Success",
      description: "New substage added to workflow"
    });
  };

  const removeSubstage = (configIndex: number) => {
    const removedConfig = state.currentConfig[configIndex];
    
    // Remove the substage
    setState(prev => ({
      ...prev,
      currentConfig: prev.currentConfig.filter((_, index) => index !== configIndex)
    }));
    setStructureChangeCounter(c => c + 1);

    // Clean up dependencies that reference this substage
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentConfig: prev.currentConfig.map(config => ({
          ...config,
          workflowAppConfigDeps: config.workflowAppConfigDeps?.filter(dep => 
            dep.id.dependencySubstageId !== removedConfig.workflowSubstage.substageId
          ) || []
        }))
      }));
    }, 0);

    if (selectedSubstage && selectedSubstage.configIndex === configIndex) {
      setSelectedSubstage(null);
    }

    toast({
      title: "Success",
      description: "Substage removed from workflow and dependencies cleaned up"
    });
  };

  const duplicateSubstage = (configIndex: number) => {
    const originalConfig = state.currentConfig[configIndex];
    
    const duplicatedConfig: WorkflowAppConfig = {
      ...originalConfig,
      workflowAppConfigId: 0, // New config will get new ID
      substageSeq: state.currentConfig.length + 1,
      updatedon: new Date().toISOString(),
      // Clear dependencies for duplicated substage
      workflowAppConfigDeps: []
    };

    setState(prev => ({
      ...prev,
      currentConfig: [...prev.currentConfig, duplicatedConfig]
    }));
    setStructureChangeCounter(c => c + 1);

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
        // FIXED: Include workflowAppConfigId in dependencies payload
        workflowAppConfigDeps: config.workflowAppConfigDeps?.map(dep => ({
          id: {
            workflowAppConfigId: config.workflowAppConfigId || null,
            dependencySubstageId: dep.id.dependencySubstageId
          }
        })) || [],
        // FIXED: Filter out empty file configurations, ensure uniqueness by name, and send only meaningful entries
        workflowAppConfigFiles: (() => {
          if (!config.workflowAppConfigFiles) return [];
          
          // Create a map to ensure uniqueness by parameter name
          const uniqueFiles = new Map<string, WorkflowAppConfigFile>();
          
          config.workflowAppConfigFiles.forEach(file => {
            // Only include file configs that have meaningful data
            const hasMeaningfulData = file.value?.trim() || 
                                    file.description?.trim() || 
                                    file.required === 'Y' || 
                                    file.emailFile === 'Y';
            
            if (hasMeaningfulData) {
              // Use the parameter name as key to ensure uniqueness
              uniqueFiles.set(file.name, file);
            }
          });
          
          // Convert map back to array and format for API
          return Array.from(uniqueFiles.values()).map(file => ({
            id: {
              workflowAppConfigId: null,
              name: file.name,
              paramType: file.paramType
            },
            value: file.value || '',
            description: file.description || '',
            emailFile: file.emailFile,
            fileUpload: file.fileUpload,
            isEmailFile: file.emailFile === 'Y',
            isFileUpload: file.fileUpload === 'Y',
            isRequired: file.required === 'Y',
            required: file.required
          }));
        })(),
        // FIXED: Include name field properly in parameters payload - avoid duplication
        workflowAppConfigParams: config.workflowAppConfigParams?.map(param => ({
          id: {
            workflowTransactionid: null,
            name: param.id?.name || param.name
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
      const hasExistingConfig = state.currentConfig.some(config => config.workflowAppConfigId > 0);
      
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
      setStructureChangeCounter(c => c + 1);

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
    setStructureChangeCounter(c => c + 1);
    setSelectedSubstage(null);
    setWorkflowTree([]);
    setSubstageSelector(null);
    
    toast({
      title: "Info",
      description: "Ready to create new workflow instance. Add stages and substages to begin."
    });
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      if (refreshAllMetadata) {
        await refreshAllMetadata();
      }
      
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

  const handleBulkEdit = (field: string, value: any) => {
    if (selectedItems.size === 0) {
      toast({
        title: "Warning",
        description: "Please select items to bulk edit",
        variant: "destructive"
      });
      return;
    }

    const selectedIndices = Array.from(selectedItems).map(itemId => {
      const parts = itemId.split('-');
      if (parts[0] === 'substage') {
        return state.currentConfig.findIndex(config => 
          config.workflowSubstage.substageId.toString() === parts[1]
        );
      }
      return -1;
    }).filter(index => index !== -1);

    setState(prev => ({
      ...prev,
      currentConfig: prev.currentConfig.map((config, index) => 
        selectedIndices.includes(index) 
          ? { ...config, [field]: value }
          : config
      )
    }));

    toast({
      title: "Success",
      description: `Bulk updated ${selectedIndices.length} items`
    });
  };

  // Multi-select handlers
  const showMultiSelectStageModal = () => {
    if (!state.metadata) {
      toast({
        title: "Error",
        description: "Metadata not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    const availableStages = state.metadata.WorkflowStage.filter(stage => 
      stage.workflowApplication === state.selectedAppId
    );

    setMultiSelectStageModal({
      isOpen: true,
      availableStages,
      selectedStageIds: new Set(),
      searchTerm: ''
    });
  };

  const showMultiSelectSubstageModal = (stageId: number) => {
    if (!state.metadata) {
      toast({
        title: "Error",
        description: "Metadata not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    const stage = state.metadata.WorkflowStage.find(s => s.stageId === stageId);
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

    setMultiSelectSubstageModal({
      isOpen: true,
      stageId,
      stageName: stage?.name || 'Unknown Stage',
      availableSubstages,
      selectedSubstageIds: new Set(),
      searchTerm: ''
    });
  };

  const addMultipleStages = () => {
    if (multiSelectStageModal.selectedStageIds.size === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one stage.",
        variant: "destructive"
      });
      return;
    }

    const selectedStages = multiSelectStageModal.availableStages.filter(stage =>
      multiSelectStageModal.selectedStageIds.has(stage.stageId)
    );

    let addedCount = 0;
    selectedStages.forEach(stage => {
      // Check if stage already exists in configuration
      const existingStageConfigs = state.currentConfig.filter(config => {
        const configStageId = typeof config.workflowStage === 'object' 
          ? config.workflowStage.stageId 
          : config.workflowStage;
        return configStageId === stage.stageId;
      });

      if (existingStageConfigs.length === 0) {
        // Add a default substage for this stage if available
        const defaultSubstage = state.metadata?.WorkflowSubstage.find(substage => 
          substage.defaultstage === stage.stageId
        );

        if (defaultSubstage) {
          const newConfig: WorkflowAppConfig = {
            workflowAppConfigId: 0,
            adhoc: "N",
            appGroupId: state.selectedConfigId!,
            approval: "N",
            attest: "N",
            auto: "N",
            isactive: "Y",
            isalteryx: "N",
            substageSeq: state.currentConfig.length + addedCount + 1,
            updatedby: "system",
            updatedon: new Date().toISOString(),
            upload: "N",
            workflowApplication: state.selectedAppId!,
            workflowStage: stage,
            workflowSubstage: {
              substageId: defaultSubstage.substageId,
              name: defaultSubstage.name,
              defaultstage: defaultSubstage.defaultstage,
              attestationMapping: defaultSubstage.attestationMapping,
              paramMapping: defaultSubstage.paramMapping,
              entitlementMapping: defaultSubstage.entitlementMapping,
              followUp: defaultSubstage.followUp,
              updatedby: "system",
              updatedon: new Date().toISOString()
            }
          };

          const newConfigs = [...state.currentConfig, newConfig];
          setState(prev => ({
            ...prev,
            currentConfig: newConfigs
          }));
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      setStructureChangeCounter(c => c + 1);
    }

    setMultiSelectStageModal({
      isOpen: false,
      availableStages: [],
      selectedStageIds: new Set(),
      searchTerm: ''
    });

    toast({
      title: "Success",
      description: `Added ${addedCount} new stages to workflow`
    });
  };

  const addMultipleSubstages = () => {
    if (multiSelectSubstageModal.selectedSubstageIds.size === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one substage.",
        variant: "destructive"
      });
      return;
    }

    const selectedSubstages = multiSelectSubstageModal.availableSubstages.filter(substage =>
      multiSelectSubstageModal.selectedSubstageIds.has(substage.substageId)
    );

    const stage = state.metadata?.WorkflowStage.find(s => s.stageId === multiSelectSubstageModal.stageId);
    if (!stage) {
      toast({
        title: "Error",
        description: "Stage not found.",
        variant: "destructive"
      });
      return;
    }

    let addedCount = 0;
    const newConfigs: WorkflowAppConfig[] = [];

    selectedSubstages.forEach(substage => {
      // Check for duplicates in the same stage
      const existingInStage = state.currentConfig.filter(config => {
        const configStageId = typeof config.workflowStage === 'object' 
          ? config.workflowStage.stageId 
          : config.workflowStage;
        return configStageId === multiSelectSubstageModal.stageId && 
               config.workflowSubstage.substageId === substage.substageId;
      });

      if (existingInStage.length === 0) {
        const newConfig: WorkflowAppConfig = {
          workflowAppConfigId: 0,
          adhoc: "N",
          appGroupId: state.selectedConfigId!,
          approval: "N",
          attest: "N",
          auto: "N",
          isactive: "Y",
          isalteryx: "N",
          substageSeq: state.currentConfig.length + addedCount + 1,
          updatedby: "system",
          updatedon: new Date().toISOString(),
          upload: "N",
          workflowApplication: state.selectedAppId!,
          workflowStage: stage,
          workflowSubstage: {
            substageId: substage.substageId,
            name: substage.name,
            defaultstage: substage.defaultstage,
            attestationMapping: substage.attestationMapping,
            paramMapping: substage.paramMapping,
            entitlementMapping: substage.entitlementMapping,
            followUp: substage.followUp,
            updatedby: "system",
            updatedon: new Date().toISOString()
          }
        };

        newConfigs.push(newConfig);
        addedCount++;
      }
    });

    if (newConfigs.length > 0) {
      setState(prev => ({
        ...prev,
        currentConfig: [...prev.currentConfig, ...newConfigs]
      }));
      setStructureChangeCounter(c => c + 1);
    }

    setMultiSelectSubstageModal({
      isOpen: false,
      stageId: null,
      stageName: '',
      availableSubstages: [],
      selectedSubstageIds: new Set(),
      searchTerm: ''
    });

    toast({
      title: "Success",
      description: `Added ${addedCount} new substages to workflow`
    });
  };

  const removeMultipleStages = (stageIds: number[]) => {
    const configsToRemove = state.currentConfig.filter(config => {
      const configStageId = typeof config.workflowStage === 'object' 
        ? config.workflowStage.stageId 
        : config.workflowStage;
      return stageIds.includes(configStageId);
    });

    const remainingConfigs = state.currentConfig.filter(config => {
      const configStageId = typeof config.workflowStage === 'object' 
        ? config.workflowStage.stageId 
        : config.workflowStage;
      return !stageIds.includes(configStageId);
    });

    // Update sequence numbers
    remainingConfigs.forEach((config, index) => {
      config.substageSeq = index + 1;
    });

    setState(prev => ({
      ...prev,
      currentConfig: remainingConfigs
    }));
    setStructureChangeCounter(c => c + 1);

    // Clean up dependencies
    setTimeout(() => {
      const removedSubstageIds = configsToRemove.map(config => config.workflowSubstage.substageId);
      setState(prev => ({
        ...prev,
        currentConfig: prev.currentConfig.map(config => ({
          ...config,
          workflowAppConfigDeps: config.workflowAppConfigDeps?.filter(dep => 
            !removedSubstageIds.includes(dep.id.dependencySubstageId)
          ) || []
        }))
      }));
    }, 0);

    if (selectedSubstage && configsToRemove.some(config => 
      config.workflowSubstage.substageId === selectedSubstage.substageId
    )) {
      setSelectedSubstage(null);
    }

    toast({
      title: "Success",
      description: `Removed ${configsToRemove.length} stages and their substages from workflow`
    });
  };

  // Render Methods
  const renderTopSection = () => (
    <div className="border-b bg-background p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Workflow Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Configure workflow stages, substages, and their dependencies
          </p>
        </div>
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
            {state.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4 space-y-2">
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
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>{app.name}</span>
                    <Badge variant="outline" className="text-xs">{app.category}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-4 space-y-2">
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
              {filteredWorkflowInstances.map(instance => (
                <SelectItem key={instance.configId} value={instance.configId}>
                  <div className="flex items-center space-x-2">
                    <Network className="h-4 w-4" />
                    <span>{instance.configName}</span>
                    <Badge variant="secondary" className="text-xs">ID: {instance.configId}</Badge>
                  </div>
                </SelectItem>
              ))}
              {instanceSearchTerm && filteredWorkflowInstances.length === 0 && state.workflowInstances.length > 0 && (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No instances match "{instanceSearchTerm}"
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Inline search box with collapsible design */}
        {state.selectedAppId && state.workflowInstances.length > 0 && (
          <div className="md:col-span-4 space-y-2">
            <Label htmlFor="instance-search" className="flex items-center gap-2">
              Search
              {instanceSearchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Filtered
                </Badge>
              )}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="instance-search"
                placeholder={instanceSearchTerm ? `"${instanceSearchTerm}"` : "Search instances..."}
                value={instanceSearchTerm}
                onChange={(e) => setInstanceSearchTerm(e.target.value)}
                className={`pl-10 transition-all duration-200 ${
                  instanceSearchTerm 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/20'
                }`}
              />
              {instanceSearchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive/10"
                  onClick={() => setInstanceSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Configuration Summary */}
      {state.currentConfig.length > 0 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {state.currentConfig.length} Substages Configured
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  {state.currentConfig.filter(c => c.isactive === 'Y').length} Active
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {state.currentConfig.filter(c => c.auto === 'Y').length} Automated
                </span>
              </div>
            </div>
            <Badge variant="outline">
              {new Set(state.currentConfig.map(c => 
                typeof c.workflowStage === 'object' ? c.workflowStage.stageId : c.workflowStage
              )).size} Stages
            </Badge>
          </div>
        </div>
      )}
    </div>
  );

  const renderWorkflowTree = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">Workflow Tree</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => toggleAllStages(true)}>Expand All</Button>
          <Button variant="outline" size="sm" onClick={() => toggleAllStages(false)}>Collapse All</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigLayout(prev => prev === 'list' ? 'grid' : 'list')}
          >
            {configLayout === 'list' ? <LayoutGrid className="h-4 w-4 mr-1" /> : <List className="h-4 w-4 mr-1" />}
            {configLayout === 'list' ? 'Grid View' : 'List View'}
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('reorder')}
            disabled={!state.selectedConfigId}
          >
            <Rows className="h-4 w-4 mr-1" />
            Reorder
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={showMultiSelectStageModal}
            disabled={!state.metadata}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Stages
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBulkEditMode(!bulkEditMode)}
            className={bulkEditMode ? 'bg-primary/10' : ''}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Bulk Edit
          </Button>
        </div>
      </div>

      {/* Bulk Edit Controls */}
      {bulkEditMode && selectedItems.size > 0 && (
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              {selectedItems.size} items selected
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkEdit('isactive', 'Y')}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkEdit('auto', 'Y')}
              >
                Auto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkEdit('approval', 'Y')}
              >
                Approval
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

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
          <div className={configLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-2'}>
            {workflowTree.map(stage => (
              <div key={stage.id} className="border rounded-lg bg-card">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 rounded-t-lg"
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
                    <Badge variant="secondary" className="text-xs">
                      {stage.children?.length || 0} substages
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        showSubstageSelector(stage.stageId!);
                      }}
                      title="Add single substage"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        showMultiSelectSubstageModal(stage.stageId!);
                      }}
                      title="Add multiple substages"
                    >
                      <Plus className="h-3 w-3" />
                      <Plus className="h-3 w-3 -ml-1" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMultipleStages([stage.stageId!]);
                      }}
                      title="Remove stage"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {stage.expanded && stage.children && (
                  <div className="border-t bg-muted/20">
                    {stage.children.map((substage, index) => (
                      <div 
                        key={substage.id}
                        className={`flex items-center justify-between p-3 ml-6 border-l-2 cursor-pointer hover:bg-background ${
                          selectedSubstage?.substageId === substage.substageId && 
                          selectedSubstage?.config?.substageSeq === substage.sequence
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
                              {substage.flags.isAlteryx && (
                                <Badge variant="outline" className="text-xs">Alteryx</Badge>
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

      {/* Substage Selector Modal */}
      {substageSelector && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-96 max-h-96">
            <CardHeader>
              <CardTitle className="text-lg">Add Substage</CardTitle>
              <CardDescription>
                Select a substage to add to {state.metadata?.WorkflowStage.find(s => s.stageId === substageSelector.stageId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={substageSelector.selectedSubstageId?.toString() || ''}
                  onValueChange={(value) => setSubstageSelector(prev => prev ? {
                    ...prev,
                    selectedSubstageId: parseInt(value)
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a substage" />
                  </SelectTrigger>
                  <SelectContent>
                    {substageSelector.availableSubstages.map(substage => (
                      <SelectItem key={substage.substageId} value={substage.substageId.toString()}>
                        {substage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSubstageSelector(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addSubstageToWorkflow}
                    disabled={!substageSelector.selectedSubstageId}
                  >
                    Add Substage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Multi-Select Stage Modal */}
      {multiSelectStageModal.isOpen && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-[600px] max-h-[80vh]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Add Multiple Stages</span>
              </CardTitle>
              <CardDescription>
                Select multiple stages to add to your workflow configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stages..."
                    value={multiSelectStageModal.searchTerm}
                    onChange={(e) => setMultiSelectStageModal(prev => ({
                      ...prev,
                      searchTerm: e.target.value
                    }))}
                    className="pl-10"
                  />
                </div>

                {/* Selection Summary */}
                {multiSelectStageModal.selectedStageIds.size > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      {multiSelectStageModal.selectedStageIds.size} stages selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMultiSelectStageModal(prev => ({
                        ...prev,
                        selectedStageIds: new Set()
                      }))}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Stage List */}
                <ScrollArea className="h-[300px] border rounded-lg">
                  <div className="p-4 space-y-2">
                    {multiSelectStageModal.availableStages
                      .filter(stage => 
                        stage.name.toLowerCase().includes(multiSelectStageModal.searchTerm.toLowerCase())
                      )
                      .map(stage => {
                        const isSelected = multiSelectStageModal.selectedStageIds.has(stage.stageId);
                        const isAlreadyConfigured = state.currentConfig.some(config => {
                          const configStageId = typeof config.workflowStage === 'object' 
                            ? config.workflowStage.stageId 
                            : config.workflowStage;
                          return configStageId === stage.stageId;
                        });

                        return (
                          <div
                            key={stage.stageId}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-primary/10 border-primary' 
                                : isAlreadyConfigured
                                  ? 'bg-muted/50 border-muted cursor-not-allowed'
                                  : 'hover:bg-muted/50'
                            }`}
                            onClick={() => {
                              if (isAlreadyConfigured) return;
                              
                              setMultiSelectStageModal(prev => {
                                const newSelected = new Set(prev.selectedStageIds);
                                if (isSelected) {
                                  newSelected.delete(stage.stageId);
                                } else {
                                  newSelected.add(stage.stageId);
                                }
                                return {
                                  ...prev,
                                  selectedStageIds: newSelected
                                };
                              });
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isAlreadyConfigured}
                              onChange={() => {}} // Handled by parent click
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{stage.name}</span>
                                {isAlreadyConfigured && (
                                  <Badge variant="secondary" className="text-xs">
                                    Already Added
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Stage ID: {stage.stageId}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setMultiSelectStageModal({
                      isOpen: false,
                      availableStages: [],
                      selectedStageIds: new Set(),
                      searchTerm: ''
                    })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addMultipleStages}
                    disabled={multiSelectStageModal.selectedStageIds.size === 0}
                  >
                    Add {multiSelectStageModal.selectedStageIds.size} Stages
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Multi-Select Substage Modal */}
      {multiSelectSubstageModal.isOpen && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-[600px] max-h-[80vh]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CheckSquare className="h-5 w-5" />
                <span>Add Multiple Substages</span>
              </CardTitle>
              <CardDescription>
                Select multiple substages to add to {multiSelectSubstageModal.stageName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search substages..."
                    value={multiSelectSubstageModal.searchTerm}
                    onChange={(e) => setMultiSelectSubstageModal(prev => ({
                      ...prev,
                      searchTerm: e.target.value
                    }))}
                    className="pl-10"
                  />
                </div>

                {/* Selection Summary */}
                {multiSelectSubstageModal.selectedSubstageIds.size > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      {multiSelectSubstageModal.selectedSubstageIds.size} substages selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMultiSelectSubstageModal(prev => ({
                        ...prev,
                        selectedSubstageIds: new Set()
                      }))}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Substage List */}
                <ScrollArea className="h-[300px] border rounded-lg">
                  <div className="p-4 space-y-2">
                    {multiSelectSubstageModal.availableSubstages
                      .filter(substage => 
                        substage.name.toLowerCase().includes(multiSelectSubstageModal.searchTerm.toLowerCase())
                      )
                      .map(substage => {
                        const isSelected = multiSelectSubstageModal.selectedSubstageIds.has(substage.substageId);
                        const isAlreadyConfigured = state.currentConfig.some(config => {
                          const configStageId = typeof config.workflowStage === 'object' 
                            ? config.workflowStage.stageId 
                            : config.workflowStage;
                          return configStageId === multiSelectSubstageModal.stageId && 
                                 config.workflowSubstage.substageId === substage.substageId;
                        });

                        return (
                          <div
                            key={substage.substageId}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-primary/10 border-primary' 
                                : isAlreadyConfigured
                                  ? 'bg-muted/50 border-muted cursor-not-allowed'
                                  : 'hover:bg-muted/50'
                            }`}
                            onClick={() => {
                              if (isAlreadyConfigured) return;
                              
                              setMultiSelectSubstageModal(prev => {
                                const newSelected = new Set(prev.selectedSubstageIds);
                                if (isSelected) {
                                  newSelected.delete(substage.substageId);
                                } else {
                                  newSelected.add(substage.substageId);
                                }
                                return {
                                  ...prev,
                                  selectedSubstageIds: newSelected
                                };
                              });
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isAlreadyConfigured}
                              onChange={() => {}} // Handled by parent click
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{substage.name}</span>
                                {isAlreadyConfigured && (
                                  <Badge variant="secondary" className="text-xs">
                                    Already Added
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Substage ID: {substage.substageId}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setMultiSelectSubstageModal({
                      isOpen: false,
                      stageId: null,
                      stageName: '',
                      availableSubstages: [],
                      selectedSubstageIds: new Set(),
                      searchTerm: ''
                    })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addMultipleSubstages}
                    disabled={multiSelectSubstageModal.selectedSubstageIds.size === 0}
                  >
                    Add {multiSelectSubstageModal.selectedSubstageIds.size} Substages
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const getStagesForReordering = (): StageWithFullSubstages[] => {
    if (!state.metadata || state.currentConfig.length === 0) return [];
  
    const stageMap = new Map<number, StageWithFullSubstages>();
  
    // Use currentConfig which is sorted by sequence
    state.currentConfig.forEach(config => {
        const stageId = typeof config.workflowStage === 'object' ? config.workflowStage.stageId : config.workflowStage;
        
        if (!stageMap.has(stageId)) {
            const stageDetails = state.metadata!.WorkflowStage.find(s => s.stageId === stageId);
            stageMap.set(stageId, {
                ...(stageDetails!),
                stageName: stageDetails?.name || 'Unknown Stage',
                substages: [],
            });
        }
        
        const stage = stageMap.get(stageId)!;
        stage.substages.push(config);
    });
  
    return Array.from(stageMap.values());
  };

  const renderReorderView = () => {
    const stagesForReorder = getStagesForReordering();
    
    if (stagesForReorder.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">Nothing to Reorder</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure some stages and substages first.
          </p>
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <StageReorderView
            stages={stagesForReorder}
            onOrderChange={handleOrderChange}
            layout={reorderLayout}
          />
        </div>
      </ScrollArea>
    );
  };

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

    return (
      <SubstageConfigurationPanel
        key={selectedSubstage.config.substageSeq} // Force re-mount on selection change
        selectedSubstage={selectedSubstage}
        state={state}
        handleSubstageUpdate={handleSubstageUpdate}
        getAvailableParameters={getAvailableParameters}
        getAvailableAttestations={getAvailableAttestations}
      />
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Section */}
      {renderTopSection()}

      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {(state.isLoading || isAppsLoading) && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'config' ? (
          <>
            {/* Left Panel - Workflow Tree */}
            <div className="w-1/2 border-r bg-background">
              {renderWorkflowTree()}
            </div>

            {/* Right Panel - Configuration Details */}
            <div className="w-1/2 bg-background">
              {renderConfigurationDetails()}
            </div>
          </>
        ) : (
          <div className="w-full bg-muted/20 flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b bg-background">
              <h3 className="font-semibold">Reorder Stages & Substages</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReorderLayout(reorderLayout === 'grid' ? 'list' : 'grid')}
                >
                  {reorderLayout === 'grid' ? <List className="h-4 w-4 mr-1" /> : <LayoutGrid className="h-4 w-4 mr-1" />}
                  {reorderLayout === 'grid' ? 'List View' : 'Grid View'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('config')}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Back to Configuration
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderReorderView()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowConfigurationManager;

// ##################################################################################
// # SUB-COMPONENT for Configuration Details Panel
// ##################################################################################

interface SubstageConfigurationPanelProps {
  selectedSubstage: SelectedSubstage;
  state: WorkflowConfigState;
  handleSubstageUpdate: (field: keyof WorkflowAppConfig, value: any) => void;
  getAvailableParameters: (substage: WorkflowSubstage) => WorkflowParameter[];
  getAvailableAttestations: (substage: WorkflowSubstage, isAutoType: boolean) => WorkflowAttestation[];
}

const SubstageConfigurationPanel: React.FC<SubstageConfigurationPanelProps> = ({
  selectedSubstage,
  state,
  handleSubstageUpdate,
  getAvailableParameters,
  getAvailableAttestations,
}) => {
  const { config } = selectedSubstage;

  // Fixed data binding lookups
  const existingParamsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (config.workflowAppConfigParams) {
      for (const param of config.workflowAppConfigParams) {
        // Fix: Properly handle parameter binding based on user's data structure
        if (param.id && param.id.name && param.id.workflowAppConfigId === config.workflowAppConfigId) {
          map.set(param.id.name, param.value);
        } else if (param.name) {
          // Fallback for direct name matching
          map.set(param.name, param.value);
        }
      }
    }
    return map;
  }, [config.workflowAppConfigParams, config.workflowAppConfigId]);

  const existingAttestationIds = useMemo(() => {
    // Fix: Properly bind attestations from workflowAttests array
    return new Set(config.workflowAttests?.map(a => a.attestationId) || []);
  }, [config.workflowAttests]);

  const existingDependencyIds = useMemo(() => {
    // Handle both sequence numbers (when saving) and workflowAppConfigId (when fetching)
    const dependencyIds = new Set<number>();
    
    if (config.workflowAppConfigDeps) {
      config.workflowAppConfigDeps.forEach(dep => {
        const depId = dep.id.dependencySubstageId;
        
        // Check if this is a workflowAppConfigId (from API response) or sequence number (from UI)
        // If it's a workflowAppConfigId, find the corresponding sequence number
        const matchingConfig = state.currentConfig.find(c => c.workflowAppConfigId === depId);
        if (matchingConfig) {
          // This is a workflowAppConfigId, use the sequence number for UI binding
          dependencyIds.add(matchingConfig.substageSeq);
        } else {
          // Check if it's a sequence number by finding a config with this sequence
          const sequenceMatch = state.currentConfig.find(c => c.substageSeq === depId);
          if (sequenceMatch) {
            dependencyIds.add(depId);
          } else {
            // Fallback: try to find by substageId
            const substageMatch = state.currentConfig.find(c => c.workflowSubstage.substageId === depId);
            if (substageMatch) {
              dependencyIds.add(substageMatch.substageSeq);
            }
          }
        }
      });
    }
    
    return dependencyIds;
  }, [config.workflowAppConfigDeps, state.currentConfig]);

  const existingFileConfigsMap = useMemo(() => {
    const map = new Map<string, WorkflowAppConfigFile>();
    if (config.workflowAppConfigFiles) {
      for (const file of config.workflowAppConfigFiles) {
        map.set(file.name, file);
      }
    }
    return map;
  }, [config.workflowAppConfigFiles]);

  // Derived state for UI logic
  const availableDependencies = state.currentConfig.filter(c => c.substageSeq < config.substageSeq);
  const availableParameters = getAvailableParameters(config.workflowSubstage);
  const isAutoType = config.auto === 'Y';
  const availableAttestations = getAvailableAttestations(config.workflowSubstage, isAutoType);

  // Fix: Get upload parameters (UPLOAD type only) - ensure they don't show in regular parameters
  const uploadParameters = useMemo(() => {
    if (!state.metadata?.WorkflowParams || !config.workflowSubstage.paramMapping) {
      return [];
    }
    const paramIds = new Set(config.workflowSubstage.paramMapping.split(';').filter(id => id.trim()).map(id => parseInt(id.trim())));
    return state.metadata.WorkflowParams.filter(param => 
      paramIds.has(param.paramId) && param.paramType?.toUpperCase() === 'UPLOAD'
    );
  }, [state.metadata, config.workflowSubstage.paramMapping]);

  const handleFileConfigChange = (paramName: string, field: keyof WorkflowAppConfigFile, value: any) => {
    const currentFiles = config.workflowAppConfigFiles || [];
    const fileIndex = currentFiles.findIndex(f => f.name === paramName);
    let newFiles;

    if (fileIndex >= 0) {
      // Update existing file config
      newFiles = [...currentFiles];
      newFiles[fileIndex] = { ...newFiles[fileIndex], [field]: value };
    } else {
      // Only create new entry if the value is meaningful (not empty/default)
      // This prevents creating empty entries when just toggling switches
      const shouldCreateEntry = value && (
        (field === 'value' && value.trim() !== '') ||
        (field === 'description' && value.trim() !== '') ||
        (field === 'required' && value === 'Y') ||
        (field === 'emailFile' && value === 'Y')
      );

      if (shouldCreateEntry) {
        newFiles = [...currentFiles, {
          id: { workflowAppConfigId: config.workflowAppConfigId, name: paramName, paramType: 'UPLOAD' },
          name: paramName,
          paramType: 'UPLOAD',
          value: field === 'value' ? value : '',
          description: field === 'description' ? value : '',
          required: field === 'required' ? value : 'N',
          emailFile: field === 'emailFile' ? value : 'N',
          fileUpload: 'Y',
        }];
      } else {
        // Don't create a new entry for empty/default values
        newFiles = currentFiles;
      }
    }
    handleSubstageUpdate('workflowAppConfigFiles', newFiles);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{config.workflowSubstage.name}</h3>
            <p className="text-sm text-muted-foreground">
              Sequence: {config.substageSeq} | Stage: {typeof config.workflowStage === 'object' ? config.workflowStage.name : 'Unknown'}
            </p>
          </div>
          <Badge variant={config.isactive === 'Y' ? 'default' : 'secondary'}>
            {config.isactive === 'Y' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="settings" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" />Settings</TabsTrigger>
              <TabsTrigger value="parameters" disabled={availableParameters.length === 0}><Database className="h-4 w-4 mr-1" />Parameters</TabsTrigger>
              <TabsTrigger value="attestations" disabled={config.attest !== 'Y'}><CheckSquare className="h-4 w-4 mr-1" />Attestations</TabsTrigger>
              <TabsTrigger value="files" disabled={config.upload !== 'Y'}><Upload className="h-4 w-4 mr-1" />Files</TabsTrigger>
              <TabsTrigger value="dependencies"><Link className="h-4 w-4 mr-1" />Dependencies</TabsTrigger>
            </TabsList>
          </div>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 pb-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Substage Settings</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="active" checked={config.isactive === 'Y'} onCheckedChange={c => handleSubstageUpdate('isactive', c ? 'Y' : 'N')} />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="auto" checked={isAutoType} onCheckedChange={c => handleSubstageUpdate('auto', c ? 'Y' : 'N')} />
                      <Label htmlFor="auto">Auto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="adhoc" checked={config.adhoc === 'Y'} onCheckedChange={c => handleSubstageUpdate('adhoc', c ? 'Y' : 'N')} />
                      <Label htmlFor="adhoc">Adhoc</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="alteryx" checked={config.isalteryx === 'Y'} onCheckedChange={c => handleSubstageUpdate('isalteryx', c ? 'Y' : 'N')} />
                      <Label htmlFor="alteryx">Alteryx</Label>
                    </div>
                  </div>
                  {!isAutoType && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="approval" checked={config.approval === 'Y'} onCheckedChange={c => handleSubstageUpdate('approval', c ? 'Y' : 'N')} />
                          <Label htmlFor="approval">Requires Approval</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="attest" checked={config.attest === 'Y'} onCheckedChange={c => handleSubstageUpdate('attest', c ? 'Y' : 'N')} />
                          <Label htmlFor="attest">Requires Attestation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="upload" checked={config.upload === 'Y'} onCheckedChange={c => handleSubstageUpdate('upload', c ? 'Y' : 'N')} />
                          <Label htmlFor="upload">Allows File Upload</Label>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 pb-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {availableParameters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No parameters mapped.</p>
                  ) : (
                    availableParameters.map(param => (
                      <div key={param.paramId} className="space-y-2">
                        <Label htmlFor={`param-${param.paramId}`}>{param.name}</Label>
                        <Input
                          id={`param-${param.paramId}`}
                          value={existingParamsMap.get(param.name) || ''}
                          onChange={e => {
                            const currentParams = config.workflowAppConfigParams || [];
                            const existingParamIndex = currentParams.findIndex(p => 
                              (p.id?.name === param.name) || (p.name === param.name)
                            );
                            
                            let updatedParams;
                            if (existingParamIndex >= 0) {
                              updatedParams = [...currentParams];
                              updatedParams[existingParamIndex] = {
                                ...updatedParams[existingParamIndex],
                                value: e.target.value
                              };
                            } else {
                              updatedParams = [...currentParams, {
                                id: { workflowAppConfigId: config.workflowAppConfigId, name: param.name },
                                name: param.name,
                                value: e.target.value
                              }];
                            }
                            handleSubstageUpdate('workflowAppConfigParams', updatedParams);
                          }}
                          placeholder={`Enter ${param.name}`}
                        />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Attestations Tab */}
          <TabsContent value="attestations" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 pb-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Attestations</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {availableAttestations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attestations available.</p>
                  ) : (
                    availableAttestations.map(attest => (
                      <div key={attest.attestationId} className="flex items-center space-x-3">
                        <Checkbox
                          id={`attest-${attest.attestationId}`}
                          checked={existingAttestationIds.has(attest.attestationId)}
                          onCheckedChange={checked => {
                            const currentAttests = config.workflowAttests || [];
                            let newAttests;
                            
                            if (checked) {
                              // Add attestation if not already present
                              const exists = currentAttests.some(a => a.attestationId === attest.attestationId);
                              if (!exists) {
                                newAttests = [...currentAttests, attest];
                              } else {
                                newAttests = currentAttests;
                              }
                            } else {
                              // Remove attestation
                              newAttests = currentAttests.filter(a => a.attestationId !== attest.attestationId);
                            }
                            
                            handleSubstageUpdate('workflowAttests', newAttests);
                          }}
                        />
                        <Label htmlFor={`attest-${attest.attestationId}`} className="font-normal">
                          {attest.name}
                        </Label>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* File Upload Tab - Improved Design */}
          <TabsContent value="files" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 pb-4">
              <Card>
                <CardHeader><CardTitle className="text-base">File Upload Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {uploadParameters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No 'UPLOAD' type parameters mapped.</p>
                  ) : (
                    uploadParameters.map(param => {
                      const fileConfig = existingFileConfigsMap.get(param.name);
                      return (
                        <div key={param.paramId} className="border rounded-lg p-3 bg-muted/30">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm">{param.name}</h4>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Switch 
                                  id={`validate-${param.paramId}`}
                                  checked={fileConfig?.required === 'Y'} 
                                  onCheckedChange={c => handleFileConfigChange(param.name, 'required', c ? 'Y' : 'N')}
                                  size="sm"
                                />
                                <Label htmlFor={`validate-${param.paramId}`} className="text-xs">Validate</Label>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Switch 
                                  id={`email-${param.paramId}`}
                                  checked={fileConfig?.emailFile === 'Y'} 
                                  onCheckedChange={c => handleFileConfigChange(param.name, 'emailFile', c ? 'Y' : 'N')}
                                  size="sm"
                                />
                                <Label htmlFor={`email-${param.paramId}`} className="text-xs">Email File</Label>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Filename Pattern</Label>
                              <Input
                                value={fileConfig?.value || ''}
                                onChange={e => handleFileConfigChange(param.name, 'value', e.target.value)}
                                placeholder="*.xlsx, report.csv"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Description</Label>
                              <Input
                                value={fileConfig?.description || ''}
                                onChange={e => handleFileConfigChange(param.name, 'description', e.target.value)}
                                placeholder="File description..."
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 pb-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Dependencies</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {availableDependencies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No prior substages to depend on.</p>
                  ) : (
                    availableDependencies.map(dep => (
                      <div key={dep.substageSeq} className="flex items-center space-x-3">
                        <Checkbox
                          id={`dep-${dep.substageSeq}`}
                          checked={existingDependencyIds.has(dep.substageSeq)}
                          onCheckedChange={checked => {
                            const currentDeps = config.workflowAppConfigDeps || [];
                            let newDeps;
                            
                            if (checked) {
                              // Add dependency using sequence number (not substageId)
                              const exists = currentDeps.some(d => d.id.dependencySubstageId === dep.substageSeq);
                              if (!exists) {
                                newDeps = [...currentDeps, {
                                  id: { 
                                    workflowAppConfigId: config.workflowAppConfigId, 
                                    dependencySubstageId: dep.substageSeq // Use sequence number for saving
                                  }
                                }];
                              } else {
                                newDeps = currentDeps;
                              }
                            } else {
                              // Remove dependency by sequence number
                              newDeps = currentDeps.filter(d => d.id.dependencySubstageId !== dep.substageSeq);
                            }
                            
                            handleSubstageUpdate('workflowAppConfigDeps', newDeps);
                          }}
                        />
                        <Label htmlFor={`dep-${dep.substageSeq}`} className="font-normal">
                          <span className="text-sm font-mono bg-muted px-2 py-1 rounded mr-2">
                            {dep.substageSeq}
                          </span>
                          {dep.workflowSubstage.name} <span className="text-muted-foreground">({typeof dep.workflowStage === 'object' ? dep.workflowStage.name : 'Stage'})</span>
                        </Label>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};