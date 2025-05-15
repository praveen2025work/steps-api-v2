import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Edit, Info, Plus, Save, Trash2, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from '@/components/ui/use-toast';
import type { Application, StageConfig, SubStageConfig, Parameter, Attestation, EmailTemplate, WorkflowNodeConfig } from '@/types/workflow-types';

// Sample applications
const sampleApplications: Application[] = [
  { 
    id: 'app1', 
    name: 'Credit Risk Assessment',
    category: 'Risk',
    serviceUrl: 'https://api.example.com/risk',
    description: 'Application for assessing credit risk',
    superUserRole: 'Risk Admin',
    cronSchedule: '0 0 * * 1-5',
    offset: 0,
    lockingRequired: true,
    lockingRole: 'Risk Manager',
    runOnWeekdays: true,
    parameters: [],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  { 
    id: 'app2', 
    name: 'Loan Approval',
    category: 'Lending',
    serviceUrl: 'https://api.example.com/loans',
    description: 'Application for loan approval process',
    superUserRole: 'Loan Admin',
    cronSchedule: '0 0 * * 1-5',
    offset: 0,
    lockingRequired: true,
    lockingRole: 'Loan Manager',
    runOnWeekdays: true,
    parameters: [],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  { 
    id: 'app3', 
    name: 'Regulatory Reporting',
    category: 'Compliance',
    serviceUrl: 'https://api.example.com/compliance',
    description: 'Application for regulatory reporting',
    superUserRole: 'Compliance Admin',
    cronSchedule: '0 0 * * 1-5',
    offset: 0,
    lockingRequired: true,
    lockingRole: 'Compliance Manager',
    runOnWeekdays: true,
    parameters: [],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  }
];

// Sample workflow instances
const sampleWorkflowInstances = [
  { id: 'wf1', name: 'Monthly Credit Risk Assessment', applicationId: 'app1' },
  { id: 'wf2', name: 'Quarterly Credit Risk Assessment', applicationId: 'app1' },
  { id: 'wf3', name: 'Daily Loan Approval', applicationId: 'app2' },
  { id: 'wf4', name: 'Weekly Regulatory Reporting', applicationId: 'app3' }
];

// Sample stages and substages from metadata
const sampleStages: StageConfig[] = [
  {
    id: '1',
    name: 'Data Collection',
    description: 'Collect all required data for the workflow',
    order: 1,
    isActive: true,
    subStages: [
      {
        id: '1-1',
        name: 'Initial Data Entry',
        description: 'Enter basic information',
        type: 'manual',
        parameters: [
          { id: 'p1', name: 'requesterName', value: '', dataType: 'string', isRequired: true },
          { id: 'p2', name: 'requestDate', value: '', dataType: 'date', isRequired: true }
        ],
        emailTemplates: [],
        attestations: [],
        expectedDuration: 24,
        order: 1,
        isAuto: false,
        requiresAttestation: false,
        requiresUpload: true,
        requiresApproval: false,
        isActive: true,
        isAdhoc: false,
        isAlteryx: false
      },
      {
        id: '1-2',
        name: 'Document Upload',
        description: 'Upload supporting documents',
        type: 'manual',
        parameters: [
          { id: 'p3', name: 'documentType', value: '', dataType: 'string', isRequired: false }
        ],
        emailTemplates: [],
        attestations: [],
        expectedDuration: 48,
        order: 2,
        isAuto: false,
        requiresAttestation: false,
        requiresUpload: true,
        requiresApproval: false,
        isActive: true,
        isAdhoc: false,
        isAlteryx: false
      }
    ]
  },
  {
    id: '2',
    name: 'Review',
    description: 'Review the collected data',
    order: 2,
    isActive: true,
    subStages: [
      {
        id: '2-1',
        name: 'Manager Review',
        description: 'Review by department manager',
        type: 'manual',
        parameters: [
          { id: 'p4', name: 'reviewerName', value: '', dataType: 'string', isRequired: true },
          { id: 'p5', name: 'approved', value: '', dataType: 'boolean', isRequired: true }
        ],
        emailTemplates: [
          {
            id: 'e1',
            name: 'Review Request',
            subject: 'Please review the workflow',
            body: 'Dear {{reviewerName}},\n\nPlease review the workflow initiated by {{requesterName}}.',
            parameters: [
              { id: 'ep1', name: 'reviewerName', value: '', dataType: 'string' },
              { id: 'ep2', name: 'requesterName', value: '', dataType: 'string' }
            ]
          }
        ],
        attestations: [
          {
            id: 'a1',
            name: 'Review Attestation',
            description: 'Attestation for completing the review',
            text: 'I confirm that I have reviewed all the documents and the information provided is accurate.'
          }
        ],
        expectedDuration: 72,
        order: 1,
        isAuto: false,
        requiresAttestation: true,
        requiresUpload: false,
        requiresApproval: true,
        isActive: true,
        isAdhoc: false,
        isAlteryx: false
      }
    ]
  },
  {
    id: '3',
    name: 'Approval',
    description: 'Final approval of the workflow',
    order: 3,
    isActive: true,
    subStages: [
      {
        id: '3-1',
        name: 'Executive Approval',
        description: 'Approval by executive team',
        type: 'manual',
        parameters: [
          { id: 'p6', name: 'approverName', value: '', dataType: 'string', isRequired: true },
          { id: 'p7', name: 'approvalDate', value: '', dataType: 'date', isRequired: true },
          { id: 'p8', name: 'comments', value: '', dataType: 'string', isRequired: false }
        ],
        emailTemplates: [],
        attestations: [
          {
            id: 'a2',
            name: 'Approval Attestation',
            description: 'Attestation for approving the workflow',
            text: 'I confirm that I approve this workflow and take responsibility for this decision.'
          }
        ],
        expectedDuration: 48,
        order: 1,
        isAuto: false,
        requiresAttestation: true,
        requiresUpload: false,
        requiresApproval: true,
        isActive: true,
        isAdhoc: false,
        isAlteryx: false
      }
    ]
  },
  {
    id: '4',
    name: 'Processing',
    description: 'Process the approved workflow',
    order: 4,
    isActive: true,
    subStages: [
      {
        id: '4-1',
        name: 'Data Processing',
        description: 'Process the collected data',
        type: 'auto',
        parameters: [
          { id: 'p9', name: 'processDate', value: '', dataType: 'date', isRequired: true },
          { id: 'p10', name: 'processType', value: '', dataType: 'string', isRequired: true }
        ],
        emailTemplates: [],
        attestations: [],
        expectedDuration: 24,
        order: 1,
        isAuto: true,
        requiresAttestation: false,
        requiresUpload: false,
        requiresApproval: false,
        isActive: true,
        isAdhoc: false,
        isAlteryx: true
      },
      {
        id: '4-2',
        name: 'Result Verification',
        description: 'Verify the processing results',
        type: 'manual',
        parameters: [
          { id: 'p11', name: 'verifierName', value: '', dataType: 'string', isRequired: true },
          { id: 'p12', name: 'verificationDate', value: '', dataType: 'date', isRequired: true },
          { id: 'p13', name: 'resultsAccepted', value: '', dataType: 'boolean', isRequired: true }
        ],
        emailTemplates: [],
        attestations: [],
        expectedDuration: 48,
        order: 2,
        isAuto: false,
        requiresAttestation: false,
        requiresUpload: false,
        requiresApproval: true,
        isActive: true,
        isAdhoc: false,
        isAlteryx: false
      }
    ]
  },
  {
    id: '5',
    name: 'Notification',
    description: 'Notify stakeholders of completion',
    order: 5,
    isActive: true,
    subStages: [
      {
        id: '5-1',
        name: 'Email Notification',
        description: 'Send email notifications to stakeholders',
        type: 'auto',
        parameters: [
          { id: 'p14', name: 'recipientList', value: '', dataType: 'string', isRequired: true },
          { id: 'p15', name: 'notificationType', value: '', dataType: 'string', isRequired: true }
        ],
        emailTemplates: [
          {
            id: 'e2',
            name: 'Completion Notification',
            subject: 'Workflow Completed',
            body: 'Dear {{recipientName}},\n\nThe workflow has been completed successfully.',
            parameters: [
              { id: 'ep3', name: 'recipientName', value: '', dataType: 'string' }
            ]
          }
        ],
        attestations: [],
        expectedDuration: 1,
        order: 1,
        isAuto: true,
        requiresAttestation: false,
        requiresUpload: false,
        requiresApproval: false,
        isActive: true,
        isAdhoc: false,
        isAlteryx: false
      }
    ]
  }
];

// Sample parameters
const sampleParameters: Parameter[] = [
  { id: 'p1', name: 'requesterName', value: '', dataType: 'string', isRequired: true, isActive: true },
  { id: 'p2', name: 'requestDate', value: '', dataType: 'date', isRequired: true, isActive: true },
  { id: 'p3', name: 'documentType', value: '', dataType: 'string', isRequired: false, isActive: true },
  { id: 'p4', name: 'reviewerName', value: '', dataType: 'string', isRequired: true, isActive: true },
  { id: 'p5', name: 'approved', value: '', dataType: 'boolean', isRequired: true, isActive: true },
  { id: 'p6', name: 'approverName', value: '', dataType: 'string', isRequired: true, isActive: true },
  { id: 'p7', name: 'approvalDate', value: '', dataType: 'date', isRequired: true, isActive: true },
  { id: 'p8', name: 'comments', value: '', dataType: 'string', isRequired: false, isActive: true },
  { id: 'p9', name: 'processDate', value: '', dataType: 'date', isRequired: true, isActive: true },
  { id: 'p10', name: 'processType', value: '', dataType: 'string', isRequired: true, isActive: true },
  { id: 'p11', name: 'verifierName', value: '', dataType: 'string', isRequired: true, isActive: true },
  { id: 'p12', name: 'verificationDate', value: '', dataType: 'date', isRequired: true, isActive: true },
  { id: 'p13', name: 'resultsAccepted', value: '', dataType: 'boolean', isRequired: true, isActive: true },
  { id: 'p14', name: 'recipientList', value: '', dataType: 'string', isRequired: true, isActive: true },
  { id: 'p15', name: 'notificationType', value: '', dataType: 'string', isRequired: true, isActive: true }
];

// Interface for workflow configuration
interface WorkflowConfig {
  applicationId: string;
  workflowInstanceId: string;
  stages: ConfigStage[];
}

interface ConfigStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  subStages: ConfigSubStage[];
}

interface ConfigSubStage {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'auto';
  order: number;
  parameters: ConfigParameter[];
  dependencies: ConfigDependency[];
  isActive: boolean;
}

interface ConfigParameter {
  id: string;
  name: string;
  value: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  isRequired: boolean;
}

interface ConfigDependency {
  stageId: string;
  subStageId: string;
  name: string;
}

const WorkflowInstanceConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [selectedWorkflowInstance, setSelectedWorkflowInstance] = useState<string>('');
  const [availableWorkflowInstances, setAvailableWorkflowInstances] = useState<any[]>([]);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>({
    applicationId: '',
    workflowInstanceId: '',
    stages: []
  });
  const [availableStages, setAvailableStages] = useState<StageConfig[]>([]);
  const [selectedStages, setSelectedStages] = useState<ConfigStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedSubStages, setSelectedSubStages] = useState<ConfigSubStage[]>([]);
  const [allSubStages, setAllSubStages] = useState<SubStageConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Effect to filter workflow instances based on selected application
  useEffect(() => {
    if (selectedApplication) {
      const filteredInstances = sampleWorkflowInstances.filter(
        instance => instance.applicationId === selectedApplication
      );
      setAvailableWorkflowInstances(filteredInstances);
      setSelectedWorkflowInstance('');
      setWorkflowConfig({
        applicationId: selectedApplication,
        workflowInstanceId: '',
        stages: []
      });
      setSelectedStages([]);
      setSelectedStageId('');
      setSelectedSubStages([]);
    } else {
      setAvailableWorkflowInstances([]);
    }
  }, [selectedApplication]);
  
  // Effect to load available stages when application is selected
  useEffect(() => {
    if (selectedApplication) {
      // In a real application, you would fetch stages from the backend
      // For now, we'll use the sample stages
      setAvailableStages(sampleStages);
    } else {
      setAvailableStages([]);
    }
  }, [selectedApplication]);
  
  // Effect to collect all substages from available stages
  useEffect(() => {
    const allSubStages: SubStageConfig[] = [];
    availableStages.forEach(stage => {
      stage.subStages.forEach(subStage => {
        allSubStages.push(subStage);
      });
    });
    setAllSubStages(allSubStages);
  }, [availableStages]);
  
  // Effect to load workflow configuration when workflow instance is selected
  useEffect(() => {
    if (selectedWorkflowInstance) {
      setIsLoading(true);
      // In a real application, you would fetch the workflow configuration from the backend
      // For now, we'll simulate loading with a timeout
      setTimeout(() => {
        // For demo purposes, we'll create a sample configuration
        const sampleConfig: WorkflowConfig = {
          applicationId: selectedApplication,
          workflowInstanceId: selectedWorkflowInstance,
          stages: availableStages.slice(0, 3).map(stage => ({
            id: stage.id,
            name: stage.name,
            description: stage.description,
            order: stage.order,
            isActive: stage.isActive,
            subStages: stage.subStages.map(subStage => ({
              id: subStage.id,
              name: subStage.name,
              description: subStage.description,
              type: subStage.type,
              order: subStage.order,
              parameters: subStage.parameters.map(param => ({
                id: param.id,
                name: param.name,
                value: param.value,
                dataType: param.dataType,
                isRequired: param.isRequired || false
              })),
              dependencies: [],
              isActive: subStage.isActive || true
            }))
          }))
        };
        
        setWorkflowConfig(sampleConfig);
        setSelectedStages(sampleConfig.stages);
        setIsLoading(false);
      }, 1000);
    } else {
      setWorkflowConfig({
        applicationId: selectedApplication,
        workflowInstanceId: '',
        stages: []
      });
      setSelectedStages([]);
    }
  }, [selectedWorkflowInstance, selectedApplication, availableStages]);
  
  // Handler for adding a stage to the workflow
  const handleAddStage = () => {
    if (!selectedStageId) {
      toast({
        title: "Error",
        description: "Please select a stage to add",
        variant: "destructive"
      });
      return;
    }
    
    const stageToAdd = availableStages.find(stage => stage.id === selectedStageId);
    if (!stageToAdd) {
      toast({
        title: "Error",
        description: "Selected stage not found",
        variant: "destructive"
      });
      return;
    }
    
    // Check if stage is already added
    if (selectedStages.some(stage => stage.id === stageToAdd.id)) {
      toast({
        title: "Error",
        description: "This stage is already added to the workflow",
        variant: "destructive"
      });
      return;
    }
    
    const newStage: ConfigStage = {
      id: stageToAdd.id,
      name: stageToAdd.name,
      description: stageToAdd.description,
      order: selectedStages.length > 0 
        ? Math.max(...selectedStages.map(s => s.order)) + 1 
        : 1,
      isActive: stageToAdd.isActive,
      subStages: stageToAdd.subStages.map(subStage => ({
        id: subStage.id,
        name: subStage.name,
        description: subStage.description,
        type: subStage.type,
        order: subStage.order,
        parameters: subStage.parameters.map(param => ({
          id: param.id,
          name: param.name,
          value: param.value,
          dataType: param.dataType,
          isRequired: param.isRequired || false
        })),
        dependencies: [],
        isActive: subStage.isActive || true
      }))
    };
    
    setSelectedStages([...selectedStages, newStage]);
    setSelectedStageId('');
    
    toast({
      title: "Stage Added",
      description: `${stageToAdd.name} has been added to the workflow`
    });
  };
  
  // Handler for removing a stage from the workflow
  const handleRemoveStage = (stageId: string) => {
    setSelectedStages(selectedStages.filter(stage => stage.id !== stageId));
    
    toast({
      title: "Stage Removed",
      description: "The stage has been removed from the workflow"
    });
  };
  
  // Handler for moving a stage up in the order
  const handleMoveStageUp = (stageId: string) => {
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    if (stageIndex <= 0) return;
    
    const newStages = [...selectedStages];
    const temp = newStages[stageIndex];
    newStages[stageIndex] = newStages[stageIndex - 1];
    newStages[stageIndex - 1] = temp;
    
    // Update order property
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });
    
    setSelectedStages(newStages);
  };
  
  // Handler for moving a stage down in the order
  const handleMoveStageDown = (stageId: string) => {
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    if (stageIndex >= selectedStages.length - 1) return;
    
    const newStages = [...selectedStages];
    const temp = newStages[stageIndex];
    newStages[stageIndex] = newStages[stageIndex + 1];
    newStages[stageIndex + 1] = temp;
    
    // Update order property
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });
    
    setSelectedStages(newStages);
  };
  
  // Handler for adding a dependency to a substage
  const handleAddDependency = (stageId: string, subStageId: string, dependencyStageId: string, dependencySubStageId: string) => {
    const dependencyStage = selectedStages.find(stage => stage.id === dependencyStageId);
    const dependencySubStage = dependencyStage?.subStages.find(subStage => subStage.id === dependencySubStageId);
    
    if (!dependencyStage || !dependencySubStage) {
      toast({
        title: "Error",
        description: "Dependency not found",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this would create a circular dependency
    if (hasDependency(dependencyStageId, dependencySubStageId, stageId, subStageId)) {
      toast({
        title: "Error",
        description: "This would create a circular dependency",
        variant: "destructive"
      });
      return;
    }
    
    const newStages = [...selectedStages];
    const stageIndex = newStages.findIndex(stage => stage.id === stageId);
    const subStageIndex = newStages[stageIndex].subStages.findIndex(subStage => subStage.id === subStageId);
    
    // Check if dependency already exists
    if (newStages[stageIndex].subStages[subStageIndex].dependencies.some(
      dep => dep.stageId === dependencyStageId && dep.subStageId === dependencySubStageId
    )) {
      toast({
        title: "Error",
        description: "This dependency already exists",
        variant: "destructive"
      });
      return;
    }
    
    newStages[stageIndex].subStages[subStageIndex].dependencies.push({
      stageId: dependencyStageId,
      subStageId: dependencySubStageId,
      name: `${dependencyStage.name} - ${dependencySubStage.name}`
    });
    
    setSelectedStages(newStages);
    
    toast({
      title: "Dependency Added",
      description: "The dependency has been added to the substage"
    });
  };
  
  // Helper function to check if adding a dependency would create a circular dependency
  const hasDependency = (
    sourceStageId: string, 
    sourceSubStageId: string, 
    targetStageId: string, 
    targetSubStageId: string
  ): boolean => {
    // Find the source substage
    const sourceStage = selectedStages.find(stage => stage.id === sourceStageId);
    const sourceSubStage = sourceStage?.subStages.find(subStage => subStage.id === sourceSubStageId);
    
    if (!sourceStage || !sourceSubStage) return false;
    
    // Check if the source directly depends on the target
    if (sourceSubStage.dependencies.some(
      dep => dep.stageId === targetStageId && dep.subStageId === targetSubStageId
    )) {
      return true;
    }
    
    // Check if any of the source's dependencies depend on the target
    return sourceSubStage.dependencies.some(dep => 
      hasDependency(dep.stageId, dep.subStageId, targetStageId, targetSubStageId)
    );
  };
  
  // Handler for removing a dependency from a substage
  const handleRemoveDependency = (stageId: string, subStageId: string, dependencyIndex: number) => {
    const newStages = [...selectedStages];
    const stageIndex = newStages.findIndex(stage => stage.id === stageId);
    const subStageIndex = newStages[stageIndex].subStages.findIndex(subStage => subStage.id === subStageId);
    
    newStages[stageIndex].subStages[subStageIndex].dependencies.splice(dependencyIndex, 1);
    
    setSelectedStages(newStages);
    
    toast({
      title: "Dependency Removed",
      description: "The dependency has been removed from the substage"
    });
  };
  
  // Handler for saving the workflow configuration
  const handleSaveWorkflowConfig = () => {
    if (!selectedApplication || !selectedWorkflowInstance) {
      toast({
        title: "Error",
        description: "Please select an application and workflow instance",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedStages.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one stage to the workflow",
        variant: "destructive"
      });
      return;
    }
    
    // In a real application, you would save the configuration to the backend
    const configToSave: WorkflowConfig = {
      applicationId: selectedApplication,
      workflowInstanceId: selectedWorkflowInstance,
      stages: selectedStages
    };
    
    console.log('Saving workflow configuration:', configToSave);
    
    toast({
      title: "Configuration Saved",
      description: "The workflow configuration has been saved successfully"
    });
  };
  
  // Function to get all previous substages for dependency selection
  const getPreviousSubStages = (currentStageIndex: number, currentSubStageIndex: number) => {
    const result: { stageId: string; stageName: string; subStages: { id: string; name: string }[] }[] = [];
    
    selectedStages.forEach((stage, stageIndex) => {
      if (stageIndex < currentStageIndex) {
        // All substages from previous stages are available
        result.push({
          stageId: stage.id,
          stageName: stage.name,
          subStages: stage.subStages.map(subStage => ({ id: subStage.id, name: subStage.name }))
        });
      } else if (stageIndex === currentStageIndex) {
        // Only previous substages from the current stage are available
        const previousSubStages = stage.subStages
          .filter((_, index) => index < currentSubStageIndex)
          .map(subStage => ({ id: subStage.id, name: subStage.name }));
        
        if (previousSubStages.length > 0) {
          result.push({
            stageId: stage.id,
            stageName: stage.name,
            subStages: previousSubStages
          });
        }
      }
    });
    
    return result;
  };
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Workflow Configuration</TabsTrigger>
          <TabsTrigger value="parameters">Parameter Values</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        {/* Workflow Configuration Tab */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Instance Configuration</CardTitle>
              <CardDescription>Configure workflow instances for hierarchy nodes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Application and Workflow Instance Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="application">Application</Label>
                    <Select 
                      value={selectedApplication} 
                      onValueChange={setSelectedApplication}
                    >
                      <SelectTrigger id="application">
                        <SelectValue placeholder="Select an application" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleApplications.map(app => (
                          <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workflowInstance">Workflow Instance</Label>
                    <Select 
                      value={selectedWorkflowInstance} 
                      onValueChange={setSelectedWorkflowInstance}
                      disabled={!selectedApplication || availableWorkflowInstances.length === 0}
                    >
                      <SelectTrigger id="workflowInstance">
                        <SelectValue placeholder={
                          !selectedApplication 
                            ? "Select an application first" 
                            : availableWorkflowInstances.length === 0 
                              ? "No workflow instances available" 
                              : "Select a workflow instance"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableWorkflowInstances.map(instance => (
                          <SelectItem key={instance.id} value={instance.id}>{instance.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading workflow configuration...</span>
                  </div>
                ) : selectedApplication && selectedWorkflowInstance ? (
                  <>
                    {/* Stage Selection */}
                    <div className="border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-4">Stage Selection</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="stageSelect">Available Stages</Label>
                          <Select 
                            value={selectedStageId} 
                            onValueChange={setSelectedStageId}
                          >
                            <SelectTrigger id="stageSelect">
                              <SelectValue placeholder="Select a stage to add" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStages
                                .filter(stage => !selectedStages.some(s => s.id === stage.id))
                                .map(stage => (
                                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleAddStage} disabled={!selectedStageId}>
                            <Plus className="mr-2 h-4 w-4" /> Add Stage
                          </Button>
                        </div>
                      </div>
                      
                      {/* Selected Stages */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Selected Stages</h4>
                        {selectedStages.length === 0 ? (
                          <div className="text-center py-4 border rounded-md">
                            <p className="text-sm text-muted-foreground">
                              No stages selected. Use the dropdown above to add stages to the workflow.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedStages.map((stage, index) => (
                              <Card key={stage.id} className="overflow-hidden">
                                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                                  <div>
                                    <CardTitle className="text-base">{stage.name}</CardTitle>
                                    <CardDescription>{stage.description}</CardDescription>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleMoveStageUp(stage.id)}
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleMoveStageDown(stage.id)}
                                      disabled={index === selectedStages.length - 1}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleRemoveStage(stage.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-2 px-4">
                                  <h5 className="font-medium text-sm mb-2">Sub-Stages</h5>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Dependencies</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {stage.subStages.map((subStage, subStageIndex) => (
                                        <TableRow key={subStage.id}>
                                          <TableCell className="font-medium">{subStage.name}</TableCell>
                                          <TableCell>
                                            <Badge variant={subStage.type === 'manual' ? 'outline' : 'default'}>
                                              {subStage.type === 'manual' ? 'Manual' : 'Automatic'}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {subStage.dependencies.length === 0 ? (
                                              <span className="text-sm text-muted-foreground">None</span>
                                            ) : (
                                              <div className="flex flex-wrap gap-1">
                                                {subStage.dependencies.map((dep, depIndex) => (
                                                  <Badge key={depIndex} variant="secondary" className="flex items-center gap-1">
                                                    {dep.name}
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm" 
                                                      className="h-4 w-4 p-0 ml-1"
                                                      onClick={() => handleRemoveDependency(stage.id, subStage.id, depIndex)}
                                                    >
                                                      <X className="h-3 w-3" />
                                                    </Button>
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex justify-end">
                                              <Select
                                                onValueChange={(value) => {
                                                  const [depStageId, depSubStageId] = value.split('|');
                                                  handleAddDependency(stage.id, subStage.id, depStageId, depSubStageId);
                                                }}
                                              >
                                                <SelectTrigger className="w-[130px]">
                                                  <span className="text-xs">Add Dependency</span>
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {getPreviousSubStages(index, subStageIndex).map(prevStage => (
                                                    <React.Fragment key={prevStage.stageId}>
                                                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                                        {prevStage.stageName}
                                                      </div>
                                                      {prevStage.subStages.map(prevSubStage => (
                                                        <SelectItem 
                                                          key={`${prevStage.stageId}|${prevSubStage.id}`} 
                                                          value={`${prevStage.stageId}|${prevSubStage.id}`}
                                                          className="pl-6"
                                                        >
                                                          {prevSubStage.name}
                                                        </SelectItem>
                                                      ))}
                                                    </React.Fragment>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-semibold">Select Application and Workflow Instance</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please select an application and workflow instance to configure the workflow.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button 
                onClick={handleSaveWorkflowConfig}
                disabled={!selectedApplication || !selectedWorkflowInstance || selectedStages.length === 0}
              >
                <Save className="mr-2 h-4 w-4" /> Save Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Parameter Values Tab */}
        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Parameter Values</CardTitle>
              <CardDescription>Configure parameter values for the workflow instance</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedApplication || !selectedWorkflowInstance ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">Select Workflow First</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please go to the Workflow Configuration tab and select an application and workflow instance first.
                  </p>
                </div>
              ) : selectedStages.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Stages Configured</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please configure stages in the Workflow Configuration tab first.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Configure default parameter values for all processes in the workflow. These values can be overridden at runtime.
                    </p>
                  </div>
                  
                  {selectedStages.map(stage => (
                    <div key={stage.id} className="space-y-4">
                      <h3 className="text-lg font-medium">{stage.name}</h3>
                      
                      {stage.subStages.map(subStage => (
                        <Card key={subStage.id} className="overflow-hidden">
                          <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">{subStage.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2 px-4">
                            {subStage.parameters.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No parameters for this sub-stage.</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Data Type</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead>Default Value</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {subStage.parameters.map(param => (
                                    <TableRow key={param.id}>
                                      <TableCell className="font-medium">{param.name}</TableCell>
                                      <TableCell>{param.dataType}</TableCell>
                                      <TableCell>
                                        {param.isRequired ? (
                                          <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <X className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Input 
                                          type={param.dataType === 'date' ? 'date' : 'text'} 
                                          placeholder="Enter default value"
                                          className="w-full"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Separator />
                    </div>
                  ))}
                  
                  <div className="flex justify-end">
                    <Button>
                      <Save className="mr-2 h-4 w-4" /> Save Parameter Values
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>Save and load workflow templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Save your current workflow configuration as a template or load an existing template.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Save as Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
                          <Input id="templateName" placeholder="Enter template name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="templateDescription">Description</Label>
                          <Input id="templateDescription" placeholder="Enter template description" />
                        </div>
                        <Button className="w-full">
                          <Save className="mr-2 h-4 w-4" /> Save Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Load Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="templateSelect">Select Template</Label>
                          <Select>
                            <SelectTrigger id="templateSelect">
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="template1">Credit Risk Assessment Template</SelectItem>
                              <SelectItem value="template2">Loan Approval Template</SelectItem>
                              <SelectItem value="template3">Regulatory Reporting Template</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full">
                          Load Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-4">Saved Templates</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Application</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Credit Risk Assessment Template</TableCell>
                        <TableCell>Standard template for credit risk assessment</TableCell>
                        <TableCell>2025-04-01</TableCell>
                        <TableCell>Credit Risk Assessment</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Loan Approval Template</TableCell>
                        <TableCell>Standard template for loan approval process</TableCell>
                        <TableCell>2025-03-15</TableCell>
                        <TableCell>Loan Approval</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowInstanceConfig;