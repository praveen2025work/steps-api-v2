import React, { useState, useEffect, useRef } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Edit, Info, Plus, Save, Trash2, X, FileText, ArrowRight } from 'lucide-react';
import { StatusIcon, StatusLegend, DependencyBadge, StatusType } from './WorkflowStatusIcons';
import { FileConfigCard, FileConfigGrid } from './FileConfigCard';
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
    parameters: [
      { id: 'gp1', name: 'riskThreshold', value: '0.75', dataType: 'number', isRequired: true, isActive: true },
      { id: 'gp2', name: 'reportingCurrency', value: 'USD', dataType: 'string', isRequired: true, isActive: true },
      { id: 'gp3', name: 'includeHistoricalData', value: 'true', dataType: 'boolean', isRequired: false, isActive: true }
    ],
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
    parameters: [
      { id: 'gp4', name: 'maxLoanAmount', value: '500000', dataType: 'number', isRequired: true, isActive: true },
      { id: 'gp5', name: 'interestRateModel', value: 'standard', dataType: 'string', isRequired: true, isActive: true }
    ],
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
    parameters: [
      { id: 'gp6', name: 'regulatoryFramework', value: 'Basel III', dataType: 'string', isRequired: true, isActive: true },
      { id: 'gp7', name: 'reportingPeriod', value: 'quarterly', dataType: 'string', isRequired: true, isActive: true }
    ],
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

// Sample attestations
const sampleAttestations: Attestation[] = [
  {
    id: 'a1',
    name: 'Review Attestation',
    description: 'Attestation for completing the review',
    text: 'I confirm that I have reviewed all the documents and the information provided is accurate.'
  },
  {
    id: 'a2',
    name: 'Approval Attestation',
    description: 'Attestation for approving the workflow',
    text: 'I confirm that I approve this workflow and take responsibility for this decision.'
  },
  {
    id: 'a3',
    name: 'Compliance Attestation',
    description: 'Attestation for compliance verification',
    text: 'I confirm that this workflow complies with all regulatory requirements and internal policies.'
  },
  {
    id: 'a4',
    name: 'Data Quality Attestation',
    description: 'Attestation for data quality',
    text: 'I confirm that the data used in this workflow is accurate, complete, and reliable.'
  }
];

// Interface for workflow configuration
interface WorkflowConfig {
  applicationId: string;
  workflowInstanceId: string;
  stages: ConfigStage[];
  globalParameters: ConfigParameter[];
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
  sequence?: number; // Global sequence number across all stages
  parameters: ConfigParameter[];
  dependencies: ConfigDependency[];
  isActive: boolean;
  isAuto: boolean;
  isAdhoc: boolean;
  isAlteryx: boolean;
  requiresAttestation: boolean;
  requiresApproval: boolean;
  requiresUpload: boolean;
  requiresDownload?: boolean;
  attestations?: ConfigAttestation[];
  uploadConfig?: FileConfig;
  downloadConfig?: FileConfig;
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

interface ConfigAttestation {
  id: string;
  name: string;
  text: string;
  isRequired: boolean;
}

interface FileConfig {
  validationSettings?: {
    allowedExtensions: string[];
    maxFileSize: number;
    requireValidation: boolean;
  };
  emailNotifications?: boolean;
  parameters: ConfigParameter[];
  fileNamingConvention?: string;
  description?: string;
  allowMultiple: boolean;
  fileType: string;
}

const WorkflowInstanceConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [selectedWorkflowInstance, setSelectedWorkflowInstance] = useState<string>('');
  const [availableWorkflowInstances, setAvailableWorkflowInstances] = useState<any[]>([]);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>({
    applicationId: '',
    workflowInstanceId: '',
    stages: [],
    globalParameters: []
  });
  const [availableStages, setAvailableStages] = useState<StageConfig[]>([]);
  const [selectedStages, setSelectedStages] = useState<ConfigStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedSubStages, setSelectedSubStages] = useState<ConfigSubStage[]>([]);
  const [allSubStages, setAllSubStages] = useState<SubStageConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // New state for the split view and unified editing interface
  const [selectedSubStage, setSelectedSubStage] = useState<{
    stageId: string;
    subStageId: string;
    subStage: ConfigSubStage | null;
  } | null>(null);
  const [subStageConfigTab, setSubStageConfigTab] = useState('general');
  const [availableAttestations, setAvailableAttestations] = useState<Attestation[]>([]);
  const [selectedAttestationId, setSelectedAttestationId] = useState<string>('');
  const [selectedParameterId, setSelectedParameterId] = useState<string>('');
  const [globalParameterValues, setGlobalParameterValues] = useState<ConfigParameter[]>([]);
  
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
        stages: [],
        globalParameters: []
      });
      setSelectedStages([]);
      setSelectedStageId('');
      setSelectedSubStages([]);
      setSelectedSubStage(null);
      
      // Load global parameters for the selected application
      const app = sampleApplications.find(app => app.id === selectedApplication);
      if (app && app.parameters) {
        setGlobalParameterValues(app.parameters.map(param => ({
          id: param.id,
          name: param.name,
          value: param.value,
          dataType: param.dataType,
          isRequired: param.isRequired || false
        })));
      } else {
        setGlobalParameterValues([]);
      }
    } else {
      setAvailableWorkflowInstances([]);
      setGlobalParameterValues([]);
    }
  }, [selectedApplication]);
  
  // Effect to load available stages when application is selected
  useEffect(() => {
    if (selectedApplication) {
      // In a real application, you would fetch stages from the backend
      // For now, we'll use the sample stages
      setAvailableStages(sampleStages);
      
      // Also load available attestations
      setAvailableAttestations(sampleAttestations);
    } else {
      setAvailableStages([]);
      setAvailableAttestations([]);
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
  
  // Function to update sequence numbers for all sub-stages across all stages
  const updateSequenceNumbers = (stages: ConfigStage[]) => {
    let sequenceCounter = 1;
    
    const updatedStages = stages.map(stage => {
      const updatedSubStages = stage.subStages.map(subStage => {
        return {
          ...subStage,
          sequence: sequenceCounter++
        };
      });
      
      return {
        ...stage,
        subStages: updatedSubStages
      };
    });
    
    return updatedStages;
  };
  
  // Effect to load workflow configuration when workflow instance is selected
  useEffect(() => {
    if (selectedWorkflowInstance) {
      setIsLoading(true);
      // In a real application, you would fetch the workflow configuration from the backend
      // For now, we'll simulate loading with a timeout
      setTimeout(() => {
        // For demo purposes, we'll create a sample configuration with empty stages
        const sampleConfig: WorkflowConfig = {
          applicationId: selectedApplication,
          workflowInstanceId: selectedWorkflowInstance,
          stages: [], // Start with empty stages as per requirement
          globalParameters: globalParameterValues
        };
        
        setWorkflowConfig(sampleConfig);
        setSelectedStages([]);
        setIsLoading(false);
      }, 1000);
    } else {
      setWorkflowConfig({
        applicationId: selectedApplication,
        workflowInstanceId: '',
        stages: [],
        globalParameters: globalParameterValues
      });
      setSelectedStages([]);
    }
  }, [selectedWorkflowInstance, selectedApplication, globalParameterValues]);
  
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
    
    // Create a new stage with empty sub-stages (user will select them)
    const newStage: ConfigStage = {
      id: stageToAdd.id,
      name: stageToAdd.name,
      description: stageToAdd.description,
      order: selectedStages.length > 0 
        ? Math.max(...selectedStages.map(s => s.order)) + 1 
        : 1,
      isActive: stageToAdd.isActive,
      subStages: [] // Start with empty sub-stages as per requirement
    };
    
    const updatedStages = [...selectedStages, newStage];
    setSelectedStages(updatedStages);
    setSelectedStageId('');
    
    toast({
      title: "Stage Added",
      description: `${stageToAdd.name} has been added to the workflow`
    });
  };
  
  // Handler for adding a sub-stage to a stage
  const handleAddSubStage = (stageId: string, subStageId: string) => {
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    if (stageIndex === -1) return;
    
    const stageToAddTo = availableStages.find(stage => stage.id === stageId);
    if (!stageToAddTo) return;
    
    const subStageToAdd = stageToAddTo.subStages.find(subStage => subStage.id === subStageId);
    if (!subStageToAdd) return;
    
    // Check if sub-stage is already added
    if (selectedStages[stageIndex].subStages.some(subStage => subStage.id === subStageId)) {
      toast({
        title: "Error",
        description: "This sub-stage is already added to the stage",
        variant: "destructive"
      });
      return;
    }
    
    const newSubStage: ConfigSubStage = {
      id: subStageToAdd.id,
      name: subStageToAdd.name,
      description: subStageToAdd.description,
      type: subStageToAdd.type,
      order: selectedStages[stageIndex].subStages.length > 0 
        ? Math.max(...selectedStages[stageIndex].subStages.map(s => s.order)) + 1 
        : 1,
      parameters: subStageToAdd.parameters.map(param => ({
        id: param.id,
        name: param.name,
        value: param.value,
        dataType: param.dataType,
        isRequired: param.isRequired || false
      })),
      dependencies: [],
      isActive: true,
      isAuto: subStageToAdd.isAuto || false,
      isAdhoc: subStageToAdd.isAdhoc || false,
      isAlteryx: subStageToAdd.isAlteryx || false,
      requiresAttestation: subStageToAdd.requiresAttestation || false,
      requiresApproval: subStageToAdd.requiresApproval || false,
      requiresUpload: subStageToAdd.requiresUpload || false,
      requiresDownload: false,
      attestations: subStageToAdd.attestations?.map(att => ({
        id: att.id,
        name: att.name,
        text: att.text,
        isRequired: true
      })) || [],
      uploadConfig: subStageToAdd.requiresUpload ? {
        validationSettings: {
          allowedExtensions: ['.xlsx', '.csv', '.pdf'],
          maxFileSize: 10, // MB
          requireValidation: true
        },
        emailNotifications: false,
        parameters: [],
        fileNamingConvention: '',
        description: '',
        allowMultiple: false,
        fileType: 'upload'
      } : undefined,
      downloadConfig: undefined
    };
    
    const newStages = [...selectedStages];
    newStages[stageIndex].subStages.push(newSubStage);
    
    // Update sequence numbers
    const updatedStages = updateSequenceNumbers(newStages);
    
    setSelectedStages(updatedStages);
    
    toast({
      title: "Sub-Stage Added",
      description: `${subStageToAdd.name} has been added to ${stageToAddTo.name}`
    });
  };
  
  // Handler for removing a stage from the workflow
  const handleRemoveStage = (stageId: string) => {
    // If the selected sub-stage is from this stage, clear it
    if (selectedSubStage && selectedSubStage.stageId === stageId) {
      setSelectedSubStage(null);
    }
    
    setSelectedStages(selectedStages.filter(stage => stage.id !== stageId));
    
    toast({
      title: "Stage Removed",
      description: "The stage has been removed from the workflow"
    });
  };
  
  // Handler for removing a sub-stage from a stage
  const handleRemoveSubStage = (stageId: string, subStageId: string) => {
    // If this is the currently selected sub-stage, clear it
    if (selectedSubStage && selectedSubStage.stageId === stageId && selectedSubStage.subStageId === subStageId) {
      setSelectedSubStage(null);
    }
    
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    if (stageIndex === -1) return;
    
    const newStages = [...selectedStages];
    newStages[stageIndex].subStages = newStages[stageIndex].subStages.filter(
      subStage => subStage.id !== subStageId
    );
    
    // Update sequence numbers
    const updatedStages = updateSequenceNumbers(newStages);
    
    setSelectedStages(updatedStages);
    
    toast({
      title: "Sub-Stage Removed",
      description: "The sub-stage has been removed from the stage"
    });
  };
  
  // Handler for selecting a sub-stage to edit (for the split view)
  const handleSelectSubStage = (stageId: string, subStageId: string) => {
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    if (stageIndex === -1) return;
    
    const subStage = selectedStages[stageIndex].subStages.find(
      subStage => subStage.id === subStageId
    );
    
    if (!subStage) return;
    
    setSelectedSubStage({
      stageId,
      subStageId,
      subStage: {
        ...subStage,
        uploadConfig: subStage.uploadConfig || {
          validationSettings: {
            allowedExtensions: ['.xlsx', '.csv', '.pdf'],
            maxFileSize: 10,
            requireValidation: true
          },
          emailNotifications: false,
          parameters: [],
          fileNamingConvention: '',
          description: '',
          allowMultiple: false,
          fileType: 'upload'
        },
        downloadConfig: subStage.downloadConfig || {
          validationSettings: {
            allowedExtensions: ['.xlsx', '.csv', '.pdf'],
            maxFileSize: 10,
            requireValidation: true
          },
          emailNotifications: false,
          parameters: [],
          fileNamingConvention: '',
          description: '',
          allowMultiple: false,
          fileType: 'download'
        },
        attestations: subStage.attestations || []
      }
    });
    
    setSubStageConfigTab('general');
  };
  
  // Handler for updating the selected sub-stage
  const handleUpdateSubStage = (updatedSubStage: ConfigSubStage) => {
    if (!selectedSubStage) return;
    
    const { stageId, subStageId } = selectedSubStage;
    
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    if (stageIndex === -1) return;
    
    const subStageIndex = selectedStages[stageIndex].subStages.findIndex(
      subStage => subStage.id === subStageId
    );
    
    if (subStageIndex === -1) return;
    
    // Process parameters - only validate non-empty values
    const processedParameters = updatedSubStage.parameters.map(param => {
      // If value is empty and parameter is not required, don't validate
      if (param.value === '' && !param.isRequired) {
        return param;
      }
      return param;
    });
    
    // If upload is not required, remove the upload config
    const finalSubStage = {
      ...updatedSubStage,
      parameters: processedParameters,
      uploadConfig: updatedSubStage.requiresUpload ? updatedSubStage.uploadConfig : undefined,
      downloadConfig: updatedSubStage.requiresDownload ? updatedSubStage.downloadConfig : undefined
    };
    
    const newStages = [...selectedStages];
    newStages[stageIndex].subStages[subStageIndex] = finalSubStage;
    
    setSelectedStages(newStages);
    setSelectedSubStage({
      ...selectedSubStage,
      subStage: finalSubStage
    });
    
    toast({
      title: "Sub-Stage Updated",
      description: "The sub-stage configuration has been updated"
    });
  };
  
  // Handler for toggling boolean properties in the selected sub-stage
  const handleToggleSubStageProperty = (property: keyof ConfigSubStage) => {
    if (!selectedSubStage || !selectedSubStage.subStage) return;
    
    const updatedSubStage = {
      ...selectedSubStage.subStage,
      [property]: !selectedSubStage.subStage[property as keyof ConfigSubStage]
    };
    
    handleUpdateSubStage(updatedSubStage);
  };
  
  // Handler for adding an attestation to the selected sub-stage
  const handleAddAttestation = () => {
    if (!selectedSubStage || !selectedSubStage.subStage || !selectedAttestationId) return;
    
    const attestationToAdd = availableAttestations.find(att => att.id === selectedAttestationId);
    if (!attestationToAdd) return;
    
    // Check if attestation is already added
    if (selectedSubStage.subStage.attestations?.some(att => att.id === attestationToAdd.id)) {
      toast({
        title: "Error",
        description: "This attestation is already added",
        variant: "destructive"
      });
      return;
    }
    
    const newAttestation: ConfigAttestation = {
      id: attestationToAdd.id,
      name: attestationToAdd.name,
      text: attestationToAdd.text,
      isRequired: true
    };
    
    const updatedSubStage = {
      ...selectedSubStage.subStage,
      attestations: [...(selectedSubStage.subStage.attestations || []), newAttestation]
    };
    
    handleUpdateSubStage(updatedSubStage);
    setSelectedAttestationId('');
  };
  
  // Handler for removing an attestation from the selected sub-stage
  const handleRemoveAttestation = (attestationId: string) => {
    if (!selectedSubStage || !selectedSubStage.subStage || !selectedSubStage.subStage.attestations) return;
    
    const updatedSubStage = {
      ...selectedSubStage.subStage,
      attestations: selectedSubStage.subStage.attestations.filter(att => att.id !== attestationId)
    };
    
    handleUpdateSubStage(updatedSubStage);
  };
  
  // Handler for adding a parameter to file config in the selected sub-stage
  const handleAddFileParameter = (fileType: 'upload' | 'download') => {
    if (!selectedSubStage || !selectedSubStage.subStage || !selectedParameterId) return;
    
    const parameterToAdd = sampleParameters.find(param => param.id === selectedParameterId);
    if (!parameterToAdd) return;
    
    const configKey = fileType === 'upload' ? 'uploadConfig' : 'downloadConfig';
    const fileConfig = selectedSubStage.subStage[configKey as keyof ConfigSubStage] as FileConfig;
    
    if (!fileConfig) return;
    
    // Check if parameter is already added
    if (fileConfig.parameters.some(param => param.id === parameterToAdd.id)) {
      toast({
        title: "Error",
        description: "This parameter is already added",
        variant: "destructive"
      });
      return;
    }
    
    const newParameter: ConfigParameter = {
      id: parameterToAdd.id,
      name: parameterToAdd.name,
      value: '',
      dataType: parameterToAdd.dataType,
      isRequired: parameterToAdd.isRequired || false
    };
    
    const updatedSubStage = {
      ...selectedSubStage.subStage,
      [configKey]: {
        ...fileConfig,
        parameters: [...fileConfig.parameters, newParameter]
      }
    };
    
    handleUpdateSubStage(updatedSubStage);
    setSelectedParameterId('');
  };
  
  // Handler for removing a parameter from file config in the selected sub-stage
  const handleRemoveFileParameter = (fileType: 'upload' | 'download', parameterId: string) => {
    if (!selectedSubStage || !selectedSubStage.subStage) return;
    
    const configKey = fileType === 'upload' ? 'uploadConfig' : 'downloadConfig';
    const fileConfig = selectedSubStage.subStage[configKey as keyof ConfigSubStage] as FileConfig;
    
    if (!fileConfig) return;
    
    const updatedSubStage = {
      ...selectedSubStage.subStage,
      [configKey]: {
        ...fileConfig,
        parameters: fileConfig.parameters.filter(param => param.id !== parameterId)
      }
    };
    
    handleUpdateSubStage(updatedSubStage);
  };
  
  // Handler for updating file config properties in the selected sub-stage
  const handleUpdateFileConfig = (
    fileType: 'upload' | 'download',
    property: keyof FileConfig | keyof FileConfig['validationSettings'],
    value: any,
    isValidationSetting: boolean = false
  ) => {
    if (!selectedSubStage || !selectedSubStage.subStage) return;
    
    const configKey = fileType === 'upload' ? 'uploadConfig' : 'downloadConfig';
    const fileConfig = selectedSubStage.subStage[configKey as keyof ConfigSubStage] as FileConfig;
    
    if (!fileConfig) return;
    
    let updatedFileConfig;
    
    if (isValidationSetting && fileConfig.validationSettings) {
      updatedFileConfig = {
        ...fileConfig,
        validationSettings: {
          ...fileConfig.validationSettings,
          [property]: value
        }
      };
    } else {
      updatedFileConfig = {
        ...fileConfig,
        [property]: value
      };
    }
    
    const updatedSubStage = {
      ...selectedSubStage.subStage,
      [configKey]: updatedFileConfig
    };
    
    handleUpdateSubStage(updatedSubStage);
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
    
    // Update sequence numbers
    const updatedStages = updateSequenceNumbers(newStages);
    
    setSelectedStages(updatedStages);
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
    
    // Update sequence numbers
    const updatedStages = updateSequenceNumbers(newStages);
    
    setSelectedStages(updatedStages);
  };
  
  // Handler for moving a sub-stage up in the order
  const handleMoveSubStageUp = (stageId: string, subStageId: string) => {
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    const subStageIndex = selectedStages[stageIndex].subStages.findIndex(subStage => subStage.id === subStageId);
    
    if (subStageIndex <= 0) return;
    
    const newStages = [...selectedStages];
    const subStages = [...newStages[stageIndex].subStages];
    
    // Swap sub-stages
    const temp = subStages[subStageIndex];
    subStages[subStageIndex] = subStages[subStageIndex - 1];
    subStages[subStageIndex - 1] = temp;
    
    // Update order property
    subStages.forEach((subStage, index) => {
      subStage.order = index + 1;
    });
    
    newStages[stageIndex].subStages = subStages;
    
    // Update sequence numbers
    const updatedStages = updateSequenceNumbers(newStages);
    
    setSelectedStages(updatedStages);
    
    // If this is the selected sub-stage, update the selection
    if (selectedSubStage && selectedSubStage.stageId === stageId && selectedSubStage.subStageId === subStageId) {
      const updatedSubStage = updatedStages[stageIndex].subStages.find(ss => ss.id === subStageId);
      if (updatedSubStage) {
        setSelectedSubStage({
          ...selectedSubStage,
          subStage: updatedSubStage
        });
      }
    }
    
    toast({
      title: "Sub-Stage Moved",
      description: "The sub-stage has been moved up in the sequence"
    });
  };
  
  // Handler for moving a sub-stage down in the order
  const handleMoveSubStageDown = (stageId: string, subStageId: string) => {
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    const subStages = selectedStages[stageIndex].subStages;
    const subStageIndex = subStages.findIndex(subStage => subStage.id === subStageId);
    
    if (subStageIndex >= subStages.length - 1) return;
    
    const newStages = [...selectedStages];
    const newSubStages = [...newStages[stageIndex].subStages];
    
    // Swap sub-stages
    const temp = newSubStages[subStageIndex];
    newSubStages[subStageIndex] = newSubStages[subStageIndex + 1];
    newSubStages[subStageIndex + 1] = temp;
    
    // Update order property
    newSubStages.forEach((subStage, index) => {
      subStage.order = index + 1;
    });
    
    newStages[stageIndex].subStages = newSubStages;
    
    // Update sequence numbers
    const updatedStages = updateSequenceNumbers(newStages);
    
    setSelectedStages(updatedStages);
    
    // If this is the selected sub-stage, update the selection
    if (selectedSubStage && selectedSubStage.stageId === stageId && selectedSubStage.subStageId === subStageId) {
      const updatedSubStage = updatedStages[stageIndex].subStages.find(ss => ss.id === subStageId);
      if (updatedSubStage) {
        setSelectedSubStage({
          ...selectedSubStage,
          subStage: updatedSubStage
        });
      }
    }
    
    toast({
      title: "Sub-Stage Moved",
      description: "The sub-stage has been moved down in the sequence"
    });
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
    
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    if (stageIndex === -1) return;
    
    const subStageIndex = selectedStages[stageIndex].subStages.findIndex(
      subStage => subStage.id === subStageId
    );
    
    if (subStageIndex === -1) return;
    
    const subStage = selectedStages[stageIndex].subStages[subStageIndex];
    
    // Check if dependency already exists
    if (subStage.dependencies.some(
      dep => dep.stageId === dependencyStageId && dep.subStageId === dependencySubStageId
    )) {
      toast({
        title: "Error",
        description: "This dependency already exists",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSubStage = {
      ...subStage,
      dependencies: [
        ...subStage.dependencies,
        {
          stageId: dependencyStageId,
          subStageId: dependencySubStageId,
          name: `${dependencyStage.name} - ${dependencySubStage.name}`
        }
      ]
    };
    
    const newStages = [...selectedStages];
    newStages[stageIndex].subStages[subStageIndex] = updatedSubStage;
    
    setSelectedStages(newStages);
    
    // If this is the selected sub-stage, update the selection
    if (selectedSubStage && selectedSubStage.stageId === stageId && selectedSubStage.subStageId === subStageId) {
      setSelectedSubStage({
        ...selectedSubStage,
        subStage: updatedSubStage
      });
    }
    
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
    const stageIndex = selectedStages.findIndex(stage => stage.id === stageId);
    if (stageIndex === -1) return;
    
    const subStageIndex = selectedStages[stageIndex].subStages.findIndex(
      subStage => subStage.id === subStageId
    );
    
    if (subStageIndex === -1) return;
    
    const subStage = selectedStages[stageIndex].subStages[subStageIndex];
    
    const updatedSubStage = {
      ...subStage,
      dependencies: [
        ...subStage.dependencies.slice(0, dependencyIndex),
        ...subStage.dependencies.slice(dependencyIndex + 1)
      ]
    };
    
    const newStages = [...selectedStages];
    newStages[stageIndex].subStages[subStageIndex] = updatedSubStage;
    
    setSelectedStages(newStages);
    
    // If this is the selected sub-stage, update the selection
    if (selectedSubStage && selectedSubStage.stageId === stageId && selectedSubStage.subStageId === subStageId) {
      setSelectedSubStage({
        ...selectedSubStage,
        subStage: updatedSubStage
      });
    }
    
    toast({
      title: "Dependency Removed",
      description: "The dependency has been removed from the substage"
    });
  };
  
  // Handler for updating global parameter values
  const handleUpdateGlobalParameter = (parameterId: string, value: string) => {
    const updatedParams = globalParameterValues.map(param => {
      if (param.id === parameterId) {
        return { ...param, value };
      }
      return param;
    });
    
    setGlobalParameterValues(updatedParams);
    
    // Also update in the workflow config
    setWorkflowConfig({
      ...workflowConfig,
      globalParameters: updatedParams
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
      stages: selectedStages,
      globalParameters: globalParameterValues
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
  
  // Render the sub-stage configuration panel
  const renderSubStageConfig = () => {
    if (!selectedSubStage || !selectedSubStage.subStage) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Sub-Stage Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a sub-stage from the list on the left to configure it.
          </p>
        </div>
      );
    }
    
    const subStage = selectedSubStage.subStage;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Configuring: {subStage.name}
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedSubStage(null)}
          >
            Close
          </Button>
        </div>
        
        <Tabs value={subStageConfigTab} onValueChange={setSubStageConfigTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Options</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="download">Download</TabsTrigger>
          </TabsList>
          
          {/* General/Options Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Sub-Stage Options</CardTitle>
                <CardDescription>Configure the basic options for this sub-stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={subStage.isActive}
                        onCheckedChange={() => handleToggleSubStageProperty('isActive')}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAuto"
                        checked={subStage.isAuto}
                        onCheckedChange={() => handleToggleSubStageProperty('isAuto')}
                      />
                      <Label htmlFor="isAuto">Auto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAdhoc"
                        checked={subStage.isAdhoc}
                        onCheckedChange={() => handleToggleSubStageProperty('isAdhoc')}
                      />
                      <Label htmlFor="isAdhoc">Adhoc</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAlteryx"
                        checked={subStage.isAlteryx}
                        onCheckedChange={() => handleToggleSubStageProperty('isAlteryx')}
                      />
                      <Label htmlFor="isAlteryx">Alteryx</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresAttestation"
                        checked={subStage.requiresAttestation}
                        onCheckedChange={() => handleToggleSubStageProperty('requiresAttestation')}
                      />
                      <Label htmlFor="requiresAttestation">Requires Attestation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresApproval"
                        checked={subStage.requiresApproval}
                        onCheckedChange={() => handleToggleSubStageProperty('requiresApproval')}
                      />
                      <Label htmlFor="requiresApproval">Requires Approval</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresUpload"
                        checked={subStage.requiresUpload}
                        onCheckedChange={() => handleToggleSubStageProperty('requiresUpload')}
                      />
                      <Label htmlFor="requiresUpload">Requires Upload</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresDownload"
                        checked={subStage.requiresDownload || false}
                        onCheckedChange={() => handleToggleSubStageProperty('requiresDownload')}
                      />
                      <Label htmlFor="requiresDownload">Requires Download</Label>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Attestations Section */}
                  {subStage.requiresAttestation && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Required Attestations</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="attestationSelect">Available Attestations</Label>
                          <Select
                            value={selectedAttestationId}
                            onValueChange={setSelectedAttestationId}
                          >
                            <SelectTrigger id="attestationSelect">
                              <SelectValue placeholder="Select an attestation to add" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAttestations
                                .filter(att => !subStage.attestations?.some(a => a.id === att.id))
                                .map(att => (
                                  <SelectItem key={att.id} value={att.id}>{att.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={handleAddAttestation}
                            disabled={!selectedAttestationId}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add
                          </Button>
                        </div>
                      </div>
                      
                      {!subStage.attestations || subStage.attestations.length === 0 ? (
                        <div className="text-center py-4 border rounded-md">
                          <p className="text-sm text-muted-foreground">
                            No attestations selected. Use the dropdown above to add attestations.
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Text</TableHead>
                              <TableHead className="w-[100px]">Required</TableHead>
                              <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subStage.attestations.map(att => (
                              <TableRow key={att.id}>
                                <TableCell className="font-medium">{att.name}</TableCell>
                                <TableCell className="text-sm">{att.text}</TableCell>
                                <TableCell>
                                  <Checkbox
                                    checked={att.isRequired}
                                    onCheckedChange={(checked) => {
                                      if (!subStage.attestations) return;
                                      const updatedAttestations = subStage.attestations.map(a => {
                                        if (a.id === att.id) {
                                          return { ...a, isRequired: !!checked };
                                        }
                                        return a;
                                      });
                                      
                                      const updatedSubStage = {
                                        ...subStage,
                                        attestations: updatedAttestations
                                      };
                                      
                                      handleUpdateSubStage(updatedSubStage);
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveAttestation(att.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Dependencies Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Dependencies</h4>
                      {subStage.dependencies.length > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          {subStage.dependencies.length} {subStage.dependencies.length === 1 ? 'dependency' : 'dependencies'}
                        </Badge>
                      )}
                    </div>
                    
                    {subStage.dependencies.length === 0 ? (
                      <div className="text-center py-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">
                          No dependencies configured. Use the dropdown in the stages list to add dependencies.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-gray-50 p-2 border-b">
                          <div className="text-xs font-medium text-muted-foreground">This sub-stage depends on:</div>
                        </div>
                        <div className="divide-y">
                          {subStage.dependencies.map((dep, index) => (
                            <div key={index} className="p-2 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium text-sm">{dep.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Stage: {selectedStages.find(s => s.id === dep.stageId)?.name}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDependency(selectedSubStage.stageId, selectedSubStage.subStageId, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Parameters Tab */}
          <TabsContent value="parameters">
            <Card>
              <CardHeader className="py-3">
                <CardTitle>Sub-Stage Parameters</CardTitle>
                <CardDescription>Configure parameters specific to this sub-stage</CardDescription>
              </CardHeader>
              <CardContent>
                {subStage.parameters.length === 0 ? (
                  <div className="text-center py-4 border rounded-md">
                    <p className="text-sm text-muted-foreground">
                      No parameters for this sub-stage.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Data Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Default Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subStage.parameters.map(param => (
                        <TableRow key={param.id} className={param.isRequired ? "" : "text-muted-foreground"}>
                          <TableCell className="font-medium">
                            {param.name}
                            {!param.isRequired && <span className="ml-1 text-xs">(Optional)</span>}
                          </TableCell>
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
                              placeholder={param.isRequired ? "Required" : "Optional"}
                              value={param.value}
                              onChange={(e) => {
                                const updatedParams = subStage.parameters.map(p => {
                                  if (p.id === param.id) {
                                    return { ...p, value: e.target.value };
                                  }
                                  return p;
                                });
                                
                                const updatedSubStage = {
                                  ...subStage,
                                  parameters: updatedParams
                                };
                                
                                handleUpdateSubStage(updatedSubStage);
                              }}
                              className={`w-full ${!param.isRequired ? "border-dashed" : ""}`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Upload Config Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <StatusIcon type="upload" className="mr-2" /> Upload Configuration
                    </CardTitle>
                    <CardDescription>Configure file upload settings for this sub-stage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresUpload"
                      checked={subStage.requiresUpload}
                      onCheckedChange={() => handleToggleSubStageProperty('requiresUpload')}
                    />
                    <Label htmlFor="requiresUpload">This sub-stage requires file upload</Label>
                  </div>
                  
                  {subStage.requiresUpload && subStage.uploadConfig && (
                    <>
                      {/* Sample file cards */}
                      <div className="border rounded-md p-3 bg-sky-50/30">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-sm">Configured Files</h4>
                          <Button variant="outline" size="sm" className="h-7">
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add File
                          </Button>
                        </div>
                        
                        <FileConfigGrid 
                          files={[
                            {
                              type: 'upload',
                              fileName: 'Monthly Report',
                              fileType: '.xlsx',
                              isValid: true,
                              description: 'Monthly financial report with all transactions',
                              onEdit: () => {},
                              onRemove: () => {}
                            },
                            {
                              type: 'upload',
                              fileName: 'Supporting Documentation',
                              fileType: '.pdf',
                              isValid: true,
                              description: 'Any supporting documentation for the report',
                              onEdit: () => {},
                              onRemove: () => {}
                            }
                          ]}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="uploadDescription">Description</Label>
                          <Input
                            id="uploadDescription"
                            value={subStage.uploadConfig.description || ''}
                            onChange={(e) => handleUpdateFileConfig('upload', 'description', e.target.value)}
                            placeholder="Enter a description for the upload"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="uploadFileNamingConvention">File Naming Convention</Label>
                          <Input
                            id="uploadFileNamingConvention"
                            value={subStage.uploadConfig.fileNamingConvention || ''}
                            onChange={(e) => handleUpdateFileConfig('upload', 'fileNamingConvention', e.target.value)}
                            placeholder="e.g., {date}_{name}_{id}"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Validation Settings</h4>
                        <div className="space-y-2">
                          <Label htmlFor="uploadAllowedExtensions">Allowed Extensions</Label>
                          <Input
                            id="uploadAllowedExtensions"
                            value={subStage.uploadConfig.validationSettings?.allowedExtensions.join(', ') || ''}
                            onChange={(e) => {
                              const extensions = e.target.value.split(',').map(ext => ext.trim());
                              handleUpdateFileConfig('upload', 'allowedExtensions', extensions, true);
                            }}
                            placeholder=".xlsx, .csv, .pdf"
                          />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="uploadRequireValidation"
                            checked={subStage.uploadConfig.validationSettings?.requireValidation || false}
                            onCheckedChange={(checked) => handleUpdateFileConfig('upload', 'requireValidation', !!checked, true)}
                          />
                          <Label htmlFor="uploadRequireValidation">Require validation</Label>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="uploadAllowMultiple"
                          checked={subStage.uploadConfig.allowMultiple}
                          onCheckedChange={(checked) => handleUpdateFileConfig('upload', 'allowMultiple', !!checked)}
                        />
                        <Label htmlFor="uploadAllowMultiple">Allow multiple file uploads</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="uploadEmailNotifications"
                          checked={subStage.uploadConfig.emailNotifications || false}
                          onCheckedChange={(checked) => handleUpdateFileConfig('upload', 'emailNotifications', !!checked)}
                        />
                        <Label htmlFor="uploadEmailNotifications">Send email notifications</Label>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Download Config Tab */}
          <TabsContent value="download">
            <Card>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <StatusIcon type="download" className="mr-2" /> Download Configuration
                    </CardTitle>
                    <CardDescription>Configure file download settings for this sub-stage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresDownload"
                      checked={subStage.requiresDownload || false}
                      onCheckedChange={() => handleToggleSubStageProperty('requiresDownload')}
                    />
                    <Label htmlFor="requiresDownload">This sub-stage requires file download</Label>
                  </div>
                  
                  {subStage.requiresDownload && subStage.downloadConfig && (
                    <>
                      {/* Sample file cards */}
                      <div className="border rounded-md p-3 bg-emerald-50/30">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-sm">Available Downloads</h4>
                          <Button variant="outline" size="sm" className="h-7">
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add File
                          </Button>
                        </div>
                        
                        <FileConfigGrid 
                          files={[
                            {
                              type: 'download',
                              fileName: 'Generated Report',
                              fileType: '.xlsx',
                              description: 'System generated financial report',
                              onEdit: () => {},
                              onRemove: () => {}
                            },
                            {
                              type: 'download',
                              fileName: 'Compliance Certificate',
                              fileType: '.pdf',
                              description: 'Certificate of compliance with regulations',
                              onEdit: () => {},
                              onRemove: () => {}
                            }
                          ]}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="downloadDescription">Description</Label>
                          <Input
                            id="downloadDescription"
                            value={subStage.downloadConfig.description || ''}
                            onChange={(e) => handleUpdateFileConfig('download', 'description', e.target.value)}
                            placeholder="Enter a description for the download"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="downloadFileNamingConvention">File Naming Convention</Label>
                          <Input
                            id="downloadFileNamingConvention"
                            value={subStage.downloadConfig.fileNamingConvention || ''}
                            onChange={(e) => handleUpdateFileConfig('download', 'fileNamingConvention', e.target.value)}
                            placeholder="e.g., {date}_{name}_{id}"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">File Settings</h4>
                        <div className="space-y-2">
                          <Label htmlFor="downloadAllowedExtensions">File Extensions</Label>
                          <Input
                            id="downloadAllowedExtensions"
                            value={subStage.downloadConfig.validationSettings?.allowedExtensions.join(', ') || ''}
                            onChange={(e) => {
                              const extensions = e.target.value.split(',').map(ext => ext.trim());
                              handleUpdateFileConfig('download', 'allowedExtensions', extensions, true);
                            }}
                            placeholder=".xlsx, .csv, .pdf"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="downloadAllowMultiple"
                          checked={subStage.downloadConfig.allowMultiple}
                          onCheckedChange={(checked) => handleUpdateFileConfig('download', 'allowMultiple', !!checked)}
                        />
                        <Label htmlFor="downloadAllowMultiple">Allow multiple file downloads</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="downloadEmailNotifications"
                          checked={subStage.downloadConfig.emailNotifications || false}
                          onCheckedChange={(checked) => handleUpdateFileConfig('download', 'emailNotifications', !!checked)}
                        />
                        <Label htmlFor="downloadEmailNotifications">Send email notifications</Label>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  return (
    <div>
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Workflow Instance Configuration</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={handleSaveWorkflowConfig}
            disabled={!selectedApplication || !selectedWorkflowInstance || selectedStages.length === 0}
          >
            <Save className="mr-2 h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Workflow Configuration</TabsTrigger>
          <TabsTrigger value="parameters">Parameter Values</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        {/* Workflow Configuration Tab */}
        <TabsContent value="workflow">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Application and Workflow Instance Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {/* Split View Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Panel: Stage Selection and List */}
                      <div className="space-y-3">
                        <div className="border rounded-md p-3">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-md font-medium">Stage Selection</h3>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 px-2">
                                    <Info className="h-4 w-4" />
                                    <span className="ml-1 text-xs">Legend</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="end" className="p-3 w-auto">
                                  <StatusLegend />
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
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
                                  <Card key={stage.id} className={`overflow-hidden ${selectedSubStage && selectedSubStage.stageId === stage.id ? 'border-primary' : ''}`}>
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
                                      <div className="flex justify-between items-center mb-4">
                                        <h5 className="font-medium text-sm">Sub-Stages</h5>
                                        <Select
                                          onValueChange={(value) => handleAddSubStage(stage.id, value)}
                                        >
                                          <SelectTrigger className="w-[200px]">
                                            <span className="text-xs">Add Sub-Stage</span>
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableStages
                                              .find(s => s.id === stage.id)?.subStages
                                              .filter(subStage => !stage.subStages.some(ss => ss.id === subStage.id))
                                              .map(subStage => (
                                                <SelectItem key={subStage.id} value={subStage.id}>
                                                  {subStage.name}
                                                </SelectItem>
                                              ))
                                            }
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      {stage.subStages.length === 0 ? (
                                        <div className="text-center py-4 border rounded-md">
                                          <p className="text-sm text-muted-foreground">
                                            No sub-stages selected. Use the dropdown above to add sub-stages to this stage.
                                          </p>
                                        </div>
                                      ) : (
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="w-[60px]">Seq #</TableHead>
                                              <TableHead>Name</TableHead>
                                              <TableHead>Type</TableHead>
                                              <TableHead className="w-[180px]">Actions</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {stage.subStages.map((subStage, subStageIndex) => (
                                              <TableRow 
                                                key={subStage.id}
                                                className={selectedSubStage && selectedSubStage.stageId === stage.id && selectedSubStage.subStageId === subStage.id ? 'bg-muted' : ''}
                                              >
                                                <TableCell className="font-medium text-center">
                                                  {subStage.sequence}
                                                </TableCell>
                                                <TableCell className="font-medium">{subStage.name}</TableCell>
                                                <TableCell>
                                                  <div className="flex flex-wrap gap-1.5">
                                                    <StatusIcon 
                                                      type={subStage.isAuto ? 'auto' : 'manual'} 
                                                      size="sm" 
                                                    />
                                                    
                                                    {subStage.requiresApproval && (
                                                      <StatusIcon type="approval" size="sm" />
                                                    )}
                                                    
                                                    {subStage.requiresAttestation && (
                                                      <StatusIcon type="attest" size="sm" />
                                                    )}
                                                    
                                                    {subStage.isAlteryx && (
                                                      <StatusIcon type="alteryx" size="sm" />
                                                    )}
                                                    
                                                    {subStage.isAdhoc && (
                                                      <StatusIcon type="adhoc" size="sm" />
                                                    )}
                                                    
                                                    {subStage.requiresUpload && (
                                                      <StatusIcon type="upload" size="sm" />
                                                    )}
                                                    
                                                    {subStage.requiresDownload && (
                                                      <StatusIcon type="download" size="sm" />
                                                    )}
                                                    
                                                    {subStage.dependencies.length > 0 && (
                                                      <TooltipProvider>
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <div className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-800 w-5 h-5 text-xs font-medium">
                                                              {subStage.dependencies.length}
                                                            </div>
                                                          </TooltipTrigger>
                                                          <TooltipContent side="right" className="p-2 w-auto">
                                                            <div className="text-xs font-medium mb-1">Dependencies:</div>
                                                            <div className="space-y-1">
                                                              {subStage.dependencies.map((dep, idx) => (
                                                                <div key={idx} className="flex items-center gap-1 text-xs">
                                                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                                  <span>{dep.name}</span>
                                                                </div>
                                                              ))}
                                                            </div>
                                                          </TooltipContent>
                                                        </Tooltip>
                                                      </TooltipProvider>
                                                    )}
                                                  </div>
                                                </TableCell>
                                                <TableCell>
                                                  <div className="flex items-center space-x-1">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm" 
                                                      onClick={() => handleMoveSubStageUp(stage.id, subStage.id)}
                                                      disabled={subStageIndex === 0}
                                                    >
                                                      <ChevronUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm" 
                                                      onClick={() => handleMoveSubStageDown(stage.id, subStage.id)}
                                                      disabled={subStageIndex === stage.subStages.length - 1}
                                                    >
                                                      <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm"
                                                      onClick={() => handleSelectSubStage(stage.id, subStage.id)}
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm"
                                                      onClick={() => handleRemoveSubStage(stage.id, subStage.id)}
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Select
                                                      onValueChange={(value) => {
                                                        const [depStageId, depSubStageId] = value.split('|');
                                                        handleAddDependency(stage.id, subStage.id, depStageId, depSubStageId);
                                                      }}
                                                    >
                                                      <SelectTrigger className="w-[80px]">
                                                        <span className="text-xs">Deps</span>
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
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Panel: Sub-Stage Configuration */}
                      <div className="border rounded-md p-3 relative">
                        <h3 className="text-md font-medium mb-3">Sub-Stage Configuration</h3>
                        <ScrollArea className="h-[calc(100vh-300px)]">
                          {renderSubStageConfig()}
                        </ScrollArea>
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
            {/* No footer needed since save button is at the top */}
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
              ) : (
                <div className="space-y-6">
                  {/* Global Parameters Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Configure global parameter values for the workflow instance. These values can be accessed by all processes.
                      </p>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Global Parameters</CardTitle>
                        <CardDescription>Parameters defined at the application level</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {globalParameterValues.length === 0 ? (
                          <div className="text-center py-4 border rounded-md">
                            <p className="text-sm text-muted-foreground">
                              No global parameters defined for this application.
                            </p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Parameter</TableHead>
                                <TableHead>Data Type</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {globalParameterValues.map(param => (
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
                                      placeholder="Enter value"
                                      value={param.value}
                                      onChange={(e) => handleUpdateGlobalParameter(param.id, e.target.value)}
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
                  </div>
                  
                  <Separator />
                  
                  {/* Sub-Stage Parameters Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Configure default parameter values for all sub-stages in the workflow. These values can be overridden at runtime.
                      </p>
                    </div>
                    
                    {selectedStages.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-lg font-semibold">No Stages Configured</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Please configure stages in the Workflow Configuration tab first.
                        </p>
                      </div>
                    ) : (
                      selectedStages.map(stage => (
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
                                              value={param.value}
                                              onChange={(e) => {
                                                const stageIndex = selectedStages.findIndex(s => s.id === stage.id);
                                                const subStageIndex = selectedStages[stageIndex].subStages.findIndex(ss => ss.id === subStage.id);
                                                const paramIndex = selectedStages[stageIndex].subStages[subStageIndex].parameters.findIndex(p => p.id === param.id);
                                                
                                                const newStages = [...selectedStages];
                                                newStages[stageIndex].subStages[subStageIndex].parameters[paramIndex].value = e.target.value;
                                                
                                                setSelectedStages(newStages);
                                              }}
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
                      ))
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveWorkflowConfig}>
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