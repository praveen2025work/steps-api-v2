import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Trash2, MoveUp, MoveDown, Download, Upload, FileJson, Check, X, Info, AlertCircle, ChevronDown } from 'lucide-react';
import { StageConfig, SubStageConfig, Parameter, Attestation, EmailTemplate, DBStage, DBSubStage, DBParameter, DBAttestation, DBEmailTemplate } from '@/types/workflow-types';
import { toast } from '@/components/ui/use-toast';

// Sample applications
const sampleApplications = [
  { id: 'app1', name: 'Credit Risk Assessment' },
  { id: 'app2', name: 'Loan Approval' },
  { id: 'app3', name: 'Regulatory Reporting' },
  { id: 'app4', name: 'Customer Onboarding' },
];

// Sample data based on the database schema
const sampleStages: StageConfig[] = [
  {
    id: '1',
    name: 'Data Collection',
    description: 'Collect all required data for the workflow',
    applicationId: 'app2', // Linked to Loan Approval application
    subStages: [
      {
        id: '1-1',
        name: 'Initial Data Entry',
        description: 'Enter basic information',
        type: 'manual',
        parameters: [
          { id: 'p1', name: 'requesterName', value: '', dataType: 'string' },
          { id: 'p2', name: 'requestDate', value: '', dataType: 'date' }
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
          { id: 'p3', name: 'documentType', value: '', dataType: 'string' }
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
    ],
    order: 1,
    isActive: true
  },
  {
    id: '2',
    name: 'Review',
    description: 'Review the collected data',
    subStages: [
      {
        id: '2-1',
        name: 'Manager Review',
        description: 'Review by department manager',
        type: 'manual',
        parameters: [
          { id: 'p4', name: 'reviewerName', value: '', dataType: 'string' },
          { id: 'p5', name: 'approved', value: '', dataType: 'boolean' }
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
    ],
    order: 2,
    isActive: true
  }
];

const sampleParameters: Parameter[] = [
  { id: 'p1', name: 'requesterName', value: '', dataType: 'string', isRequired: true, isActive: true },
  { id: 'p2', name: 'requestDate', value: '', dataType: 'date', isRequired: true, isActive: true },
  { id: 'p3', name: 'documentType', value: '', dataType: 'string', isRequired: false, isActive: true },
  { id: 'p4', name: 'reviewerName', value: '', dataType: 'string', isRequired: true, isActive: true },
  { id: 'p5', name: 'approved', value: '', dataType: 'boolean', isRequired: true, isActive: true }
];

const sampleAttestations: Attestation[] = [
  {
    id: 'a1',
    name: 'Review Attestation',
    description: 'Attestation for completing the review',
    text: 'I confirm that I have reviewed all the documents and the information provided is accurate.',
    isActive: true
  },
  {
    id: 'a2',
    name: 'Approval Attestation',
    description: 'Attestation for approving the workflow',
    text: 'I confirm that I approve this workflow and take responsibility for this decision.',
    isActive: true
  }
];

const sampleEmailTemplates: EmailTemplate[] = [
  {
    id: 'e1',
    name: 'Review Request',
    subject: 'Please review the workflow',
    body: 'Dear {{reviewerName}},\n\nPlease review the workflow initiated by {{requesterName}}.',
    parameters: [
      { id: 'ep1', name: 'reviewerName', value: '', dataType: 'string' },
      { id: 'ep2', name: 'requesterName', value: '', dataType: 'string' }
    ],
    isActive: true
  },
  {
    id: 'e2',
    name: 'Approval Notification',
    subject: 'Your workflow has been approved',
    body: 'Dear {{requesterName}},\n\nYour workflow has been approved by {{approverName}}.',
    parameters: [
      { id: 'ep3', name: 'requesterName', value: '', dataType: 'string' },
      { id: 'ep4', name: 'approverName', value: '', dataType: 'string' }
    ],
    isActive: true
  }
];

// Form interfaces
interface StageForm {
  id?: string;
  name: string;
  description: string;
  applicationId: string;
  isActive: boolean;
}

interface SubStageForm {
  id?: string;
  name: string;
  componentName: string;
  serviceLink: string;
  expectedDuration: number;
  expectedTime: string;
  selectedParameters: string[];
  selectedAttestations: string[];
  selectedTemplate: string;
  emailConfig: 'NA' | 'start' | 'end';
  role: string;
  isActive: boolean;
}

interface ParameterForm {
  id?: string;
  name: string;
  description: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  isRequired: boolean;
  isActive: boolean;
}

interface AttestationForm {
  id?: string;
  name: string;
  description: string;
  text: string;
  isActive: boolean;
}

interface EmailTemplateForm {
  id?: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  isActive: boolean;
  selectedParameters: string[];
}

// Function to generate incremental numeric IDs for sub-stages
const generateSubStageId = (stage: StageConfig): string => {
  // Extract the stage number from the stage ID
  const stageNumber = stage.id.replace(/\D/g, '');
  
  // Find the highest existing sub-stage number for this stage
  let maxSubStageNumber = 0;
  stage.subStages.forEach(subStage => {
    // Extract numeric part after the dash
    const match = subStage.id.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSubStageNumber) {
        maxSubStageNumber = num;
      }
    }
  });
  
  // Generate new ID with incremented number
  return `${stageNumber}-${maxSubStageNumber + 1}`;
};

const MetadataManagement: React.FC = () => {
  // State for data
  const [stages, setStages] = useState<StageConfig[]>(sampleStages);
  const [parameters, setParameters] = useState<Parameter[]>(sampleParameters);
  const [attestations, setAttestations] = useState<Attestation[]>(sampleAttestations);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(sampleEmailTemplates);
  const [activeTab, setActiveTab] = useState('stages');
  
  // Dialog states
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [subStageDialogOpen, setSubStageDialogOpen] = useState(false);
  const [parameterDialogOpen, setParameterDialogOpen] = useState(false);
  const [attestationDialogOpen, setAttestationDialogOpen] = useState(false);
  const [emailTemplateDialogOpen, setEmailTemplateDialogOpen] = useState(false);
  
  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: string, id: string, parentId?: string}>({type: '', id: ''});
  
  // Form states
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  const [selectedSubStage, setSelectedSubStage] = useState<SubStageConfig | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);
  const [selectedAttestation, setSelectedAttestation] = useState<Attestation | null>(null);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<EmailTemplate | null>(null);
  
  // Form data states
  const [stageForm, setStageForm] = useState<StageForm>({
    name: '',
    description: '',
    applicationId: '',
    isActive: true
  });
  
  // Sample roles for dropdown
  const [roles, setRoles] = useState<{id: string, name: string}[]>([
    { id: 'role1', name: 'Administrator' },
    { id: 'role2', name: 'Finance Manager' },
    { id: 'role3', name: 'Risk Analyst' },
    { id: 'role4', name: 'Compliance Officer' },
    { id: 'role5', name: 'Read Only User' }
  ]);

  // Function to fetch roles from API
  const fetchRoles = async () => {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/roles');
      // const data = await response.json();
      // setRoles(data);
      
      // For now, we'll use the sample roles
      console.log('Roles fetched successfully');
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const [subStageForm, setSubStageForm] = useState<SubStageForm>({
    name: '',
    componentName: '',
    serviceLink: '',
    expectedDuration: 24,
    expectedTime: '',
    selectedParameters: [],
    selectedAttestations: [],
    selectedTemplate: '',
    emailConfig: 'NA',
    role: '',
    isActive: true
  });
  
  const [parameterForm, setParameterForm] = useState<ParameterForm>({
    name: '',
    description: '',
    dataType: 'string',
    isRequired: false,
    isActive: true
  });
  
  const [attestationForm, setAttestationForm] = useState<AttestationForm>({
    name: '',
    description: '',
    text: '',
    isActive: true
  });
  
  const [emailTemplateForm, setEmailTemplateForm] = useState<EmailTemplateForm>({
    name: '',
    subject: '',
    body: '',
    description: '',
    isActive: true,
    selectedParameters: []
  });
  
  // Reset form states when dialogs open/close
  useEffect(() => {
    if (stageDialogOpen && selectedStage) {
      setStageForm({
        id: selectedStage.id,
        name: selectedStage.name,
        description: selectedStage.description || '',
        applicationId: selectedStage.applicationId || sampleApplications[0].id,
        isActive: selectedStage.isActive !== undefined ? selectedStage.isActive : true
      });
    } else if (stageDialogOpen) {
      setStageForm({
        name: '',
        description: '',
        applicationId: sampleApplications[0].id,
        isActive: true
      });
    }
  }, [stageDialogOpen, selectedStage, stages]);
  
  useEffect(() => {
    if (subStageDialogOpen && selectedSubStage && selectedStage) {
      setSubStageForm({
        id: selectedSubStage.id,
        name: selectedSubStage.name,
        componentName: selectedSubStage.componentName || '',
        serviceLink: selectedSubStage.serviceLink || '',
        expectedDuration: selectedSubStage.expectedDuration,
        expectedTime: selectedSubStage.expectedTime || '',
        selectedParameters: selectedSubStage.parameters ? selectedSubStage.parameters.map(p => p.id) : [],
        selectedAttestations: selectedSubStage.attestations ? selectedSubStage.attestations.map(a => a.id) : [],
        selectedTemplate: selectedSubStage.emailTemplates && selectedSubStage.emailTemplates.length > 0 ? selectedSubStage.emailTemplates[0].id : '',
        emailConfig: selectedSubStage.emailConfig || 'NA',
        role: selectedSubStage.readRole || '',
        isActive: selectedSubStage.isActive !== undefined ? selectedSubStage.isActive : true
      });
    } else if (subStageDialogOpen && selectedStage) {
      setSubStageForm({
        name: '',
        componentName: '',
        serviceLink: '',
        expectedDuration: 24,
        expectedTime: '',
        selectedParameters: [],
        selectedAttestations: [],
        selectedTemplate: '',
        emailConfig: 'NA',
        role: '',
        isActive: true
      });
    }
  }, [subStageDialogOpen, selectedSubStage, selectedStage]);
  
  useEffect(() => {
    if (parameterDialogOpen && selectedParameter) {
      setParameterForm({
        id: selectedParameter.id,
        name: selectedParameter.name,
        description: selectedParameter.description || '',
        dataType: selectedParameter.dataType,
        isRequired: selectedParameter.isRequired !== undefined ? selectedParameter.isRequired : false,
        isActive: selectedParameter.isActive !== undefined ? selectedParameter.isActive : true
      });
    } else if (parameterDialogOpen) {
      setParameterForm({
        name: '',
        description: '',
        dataType: 'string',
        isRequired: false,
        isActive: true
      });
    }
  }, [parameterDialogOpen, selectedParameter]);
  
  useEffect(() => {
    if (attestationDialogOpen && selectedAttestation) {
      setAttestationForm({
        id: selectedAttestation.id,
        name: selectedAttestation.name,
        description: selectedAttestation.description,
        text: selectedAttestation.text,
        isActive: selectedAttestation.isActive !== undefined ? selectedAttestation.isActive : true
      });
    } else if (attestationDialogOpen) {
      setAttestationForm({
        name: '',
        description: '',
        text: '',
        isActive: true
      });
    }
  }, [attestationDialogOpen, selectedAttestation]);
  
  useEffect(() => {
    if (emailTemplateDialogOpen && selectedEmailTemplate) {
      setEmailTemplateForm({
        id: selectedEmailTemplate.id,
        name: selectedEmailTemplate.name,
        subject: selectedEmailTemplate.subject,
        body: selectedEmailTemplate.body,
        description: selectedEmailTemplate.description || '',
        isActive: selectedEmailTemplate.isActive !== undefined ? selectedEmailTemplate.isActive : true,
        selectedParameters: selectedEmailTemplate.parameters.map(p => p.id)
      });
    } else if (emailTemplateDialogOpen) {
      setEmailTemplateForm({
        name: '',
        subject: '',
        body: '',
        description: '',
        isActive: true,
        selectedParameters: []
      });
    }
  }, [emailTemplateDialogOpen, selectedEmailTemplate]);
  
  // Form handlers
  const handleStageFormChange = (field: keyof StageForm, value: any) => {
    setStageForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubStageFormChange = (field: keyof SubStageForm, value: any) => {
    setSubStageForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleParameterFormChange = (field: keyof ParameterForm, value: any) => {
    setParameterForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAttestationFormChange = (field: keyof AttestationForm, value: any) => {
    setAttestationForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleEmailTemplateFormChange = (field: keyof EmailTemplateForm, value: any) => {
    setEmailTemplateForm(prev => ({ ...prev, [field]: value }));
  };
  
  const toggleParameterSelection = (parameterId: string) => {
    setEmailTemplateForm(prev => {
      const selectedParameters = [...prev.selectedParameters];
      const index = selectedParameters.indexOf(parameterId);
      
      if (index === -1) {
        selectedParameters.push(parameterId);
      } else {
        selectedParameters.splice(index, 1);
      }
      
      return { ...prev, selectedParameters };
    });
  };
  
  // Save handlers
  const saveStage = () => {
    if (!stageForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Stage name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (stageForm.id) {
      // Update existing stage
      setStages(prev => prev.map(stage => 
        stage.id === stageForm.id 
          ? { 
              ...stage, 
              name: stageForm.name, 
              description: stageForm.description, 
              applicationId: stageForm.applicationId,
              isActive: stageForm.isActive
            } 
          : stage
      ));
      toast({
        title: "Stage Updated",
        description: `Stage "${stageForm.name}" has been updated successfully.`
      });
    } else {
      // Add new stage
      const newStage: StageConfig = {
        id: `stage-${Date.now()}`,
        name: stageForm.name,
        description: stageForm.description,
        applicationId: stageForm.applicationId,
        isActive: stageForm.isActive,
        subStages: [],
        order: stages.length > 0 ? Math.max(...stages.map(s => s.order || 0)) + 1 : 1
      };
      
      setStages(prev => [...prev, newStage]);
      toast({
        title: "Stage Added",
        description: `Stage "${stageForm.name}" has been added successfully.`
      });
    }
    
    setStageDialogOpen(false);
  };
  
  const saveSubStage = () => {
    if (!subStageForm.name.trim() || !selectedStage) {
      toast({
        title: "Validation Error",
        description: "Sub-stage name is required and a parent stage must be selected",
        variant: "destructive"
      });
      return;
    }
    
    // Get selected parameters, attestations, and email template
    const selectedParams = parameters.filter(param => subStageForm.selectedParameters.includes(param.id));
    const selectedAttests = attestations.filter(attest => subStageForm.selectedAttestations.includes(attest.id));
    const selectedTemplate = subStageForm.selectedTemplate ? 
      emailTemplates.find(template => template.id === subStageForm.selectedTemplate) : null;
    
    const newSubStage: SubStageConfig = {
      id: subStageForm.id || generateSubStageId(selectedStage),
      name: subStageForm.name,
      description: '',
      type: 'manual',
      componentName: subStageForm.componentName,
      serviceLink: subStageForm.serviceLink,
      expectedDuration: subStageForm.expectedDuration,
      expectedTime: subStageForm.expectedTime,
      emailConfig: subStageForm.emailConfig,
      readRole: subStageForm.role,
      writeRole: subStageForm.role,
      order: selectedStage.subStages.length > 0 ? Math.max(...selectedStage.subStages.map(s => s.order)) + 1 : 1,
      isActive: subStageForm.isActive,
      // Set all these properties to false as they're no longer needed
      isAuto: false,
      requiresAttestation: false,
      requiresUpload: false,
      requiresApproval: false,
      isAdhoc: false,
      isAlteryx: false,
      parameters: selectedParams,
      attestations: selectedAttests,
      emailTemplates: selectedTemplate ? [selectedTemplate] : []
    };
    
    if (subStageForm.id) {
      // Update existing sub-stage
      setStages(prev => prev.map(stage => 
        stage.id === selectedStage.id 
          ? { 
              ...stage, 
              subStages: stage.subStages.map(subStage => 
                subStage.id === subStageForm.id ? newSubStage : subStage
              ) 
            } 
          : stage
      ));
      toast({
        title: "Sub-Stage Updated",
        description: `Sub-stage "${subStageForm.name}" has been updated successfully.`
      });
    } else {
      // Add new sub-stage
      setStages(prev => prev.map(stage => 
        stage.id === selectedStage.id 
          ? { 
              ...stage, 
              subStages: [...stage.subStages, newSubStage] 
            } 
          : stage
      ));
      toast({
        title: "Sub-Stage Added",
        description: `Sub-stage "${subStageForm.name}" has been added successfully.`
      });
    }
    
    setSubStageDialogOpen(false);
  };
  
  const saveParameter = () => {
    if (!parameterForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Parameter name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newParameter: Parameter = {
      id: parameterForm.id || `param-${Date.now()}`,
      name: parameterForm.name,
      description: parameterForm.description,
      dataType: parameterForm.dataType,
      value: '',
      isRequired: parameterForm.isRequired,
      isActive: parameterForm.isActive
    };
    
    if (parameterForm.id) {
      // Update existing parameter
      setParameters(prev => prev.map(param => 
        param.id === parameterForm.id ? newParameter : param
      ));
      toast({
        title: "Parameter Updated",
        description: `Parameter "${parameterForm.name}" has been updated successfully.`
      });
    } else {
      // Add new parameter
      setParameters(prev => [...prev, newParameter]);
      toast({
        title: "Parameter Added",
        description: `Parameter "${parameterForm.name}" has been added successfully.`
      });
    }
    
    setParameterDialogOpen(false);
  };
  
  const saveAttestation = () => {
    if (!attestationForm.name.trim() || !attestationForm.text.trim()) {
      toast({
        title: "Validation Error",
        description: "Attestation name and text are required",
        variant: "destructive"
      });
      return;
    }
    
    const newAttestation: Attestation = {
      id: attestationForm.id || `attest-${Date.now()}`,
      name: attestationForm.name,
      description: attestationForm.description,
      text: attestationForm.text,
      isActive: attestationForm.isActive
    };
    
    if (attestationForm.id) {
      // Update existing attestation
      setAttestations(prev => prev.map(attest => 
        attest.id === attestationForm.id ? newAttestation : attest
      ));
      toast({
        title: "Attestation Updated",
        description: `Attestation "${attestationForm.name}" has been updated successfully.`
      });
    } else {
      // Add new attestation
      setAttestations(prev => [...prev, newAttestation]);
      toast({
        title: "Attestation Added",
        description: `Attestation "${attestationForm.name}" has been added successfully.`
      });
    }
    
    setAttestationDialogOpen(false);
  };
  
  const saveEmailTemplate = () => {
    if (!emailTemplateForm.name.trim() || !emailTemplateForm.subject.trim() || !emailTemplateForm.body.trim()) {
      toast({
        title: "Validation Error",
        description: "Email template name, subject, and body are required",
        variant: "destructive"
      });
      return;
    }
    
    const selectedParams = parameters.filter(param => emailTemplateForm.selectedParameters.includes(param.id));
    
    const newEmailTemplate: EmailTemplate = {
      id: emailTemplateForm.id || `email-${Date.now()}`,
      name: emailTemplateForm.name,
      subject: emailTemplateForm.subject,
      body: emailTemplateForm.body,
      description: emailTemplateForm.description,
      parameters: selectedParams,
      isActive: emailTemplateForm.isActive
    };
    
    if (emailTemplateForm.id) {
      // Update existing email template
      setEmailTemplates(prev => prev.map(template => 
        template.id === emailTemplateForm.id ? newEmailTemplate : template
      ));
      toast({
        title: "Email Template Updated",
        description: `Email template "${emailTemplateForm.name}" has been updated successfully.`
      });
    } else {
      // Add new email template
      setEmailTemplates(prev => [...prev, newEmailTemplate]);
      toast({
        title: "Email Template Added",
        description: `Email template "${emailTemplateForm.name}" has been added successfully.`
      });
    }
    
    setEmailTemplateDialogOpen(false);
  };
  
  // Delete handlers
  const confirmDelete = () => {
    const { type, id, parentId } = itemToDelete;
    
    switch (type) {
      case 'stage':
        setStages(prev => prev.filter(stage => stage.id !== id));
        toast({
          title: "Stage Deleted",
          description: "The stage has been deleted successfully."
        });
        break;
      case 'subStage':
        if (parentId) {
          setStages(prev => prev.map(stage => 
            stage.id === parentId 
              ? { 
                  ...stage, 
                  subStages: stage.subStages.filter(subStage => subStage.id !== id) 
                } 
              : stage
          ));
          toast({
            title: "Sub-Stage Deleted",
            description: "The sub-stage has been deleted successfully."
          });
        }
        break;
      case 'parameter':
        setParameters(prev => prev.filter(param => param.id !== id));
        toast({
          title: "Parameter Deleted",
          description: "The parameter has been deleted successfully."
        });
        break;
      case 'attestation':
        setAttestations(prev => prev.filter(attest => attest.id !== id));
        toast({
          title: "Attestation Deleted",
          description: "The attestation has been deleted successfully."
        });
        break;
      case 'emailTemplate':
        setEmailTemplates(prev => prev.filter(template => template.id !== id));
        toast({
          title: "Email Template Deleted",
          description: "The email template has been deleted successfully."
        });
        break;
    }
    
    setDeleteDialogOpen(false);
  };
  
  // Reorder handlers
  const moveStage = (stageId: string, direction: 'up' | 'down') => {
    const stageIndex = stages.findIndex(stage => stage.id === stageId);
    if ((direction === 'up' && stageIndex === 0) || (direction === 'down' && stageIndex === stages.length - 1)) {
      return;
    }
    
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? stageIndex - 1 : stageIndex + 1;
    
    // Swap the stages
    [newStages[stageIndex], newStages[targetIndex]] = [newStages[targetIndex], newStages[stageIndex]];
    
    // Update the order property
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });
    
    setStages(newStages);
  };
  
  const moveSubStage = (stageId: string, subStageId: string, direction: 'up' | 'down') => {
    const stageIndex = stages.findIndex(stage => stage.id === stageId);
    const stage = stages[stageIndex];
    const subStageIndex = stage.subStages.findIndex(subStage => subStage.id === subStageId);
    
    if ((direction === 'up' && subStageIndex === 0) || (direction === 'down' && subStageIndex === stage.subStages.length - 1)) {
      return;
    }
    
    const newStages = [...stages];
    const newSubStages = [...newStages[stageIndex].subStages];
    const targetIndex = direction === 'up' ? subStageIndex - 1 : subStageIndex + 1;
    
    // Swap the sub-stages
    [newSubStages[subStageIndex], newSubStages[targetIndex]] = [newSubStages[targetIndex], newSubStages[subStageIndex]];
    
    // Update the order property
    newSubStages.forEach((subStage, index) => {
      subStage.order = index + 1;
    });
    
    newStages[stageIndex].subStages = newSubStages;
    setStages(newStages);
  };
  
  // Export/Import handlers
  const exportData = (type: 'all' | 'stages' | 'parameters' | 'attestations' | 'emailTemplates') => {
    let data;
    let filename;
    
    switch (type) {
      case 'all':
        data = { stages, parameters, attestations, emailTemplates };
        filename = 'workflow-metadata-all.json';
        break;
      case 'stages':
        data = { stages };
        filename = 'workflow-stages.json';
        break;
      case 'parameters':
        data = { parameters };
        filename = 'workflow-parameters.json';
        break;
      case 'attestations':
        data = { attestations };
        filename = 'workflow-attestations.json';
        break;
      case 'emailTemplates':
        data = { emailTemplates };
        filename = 'workflow-email-templates.json';
        break;
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: `Data has been exported to ${filename}`
    });
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.stages) setStages(data.stages);
        if (data.parameters) setParameters(data.parameters);
        if (data.attestations) setAttestations(data.attestations);
        if (data.emailTemplates) setEmailTemplates(data.emailTemplates);
        
        toast({
          title: "Import Successful",
          description: "Metadata has been imported successfully."
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to parse the imported file. Please ensure it's a valid JSON file.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stages">Stages & Sub-Stages</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="attestations">Attestations</TabsTrigger>
          <TabsTrigger value="emailTemplates">Email Templates</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>
        
        {/* Stages & Sub-Stages Tab */}
        <TabsContent value="stages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Stages & Sub-Stages</CardTitle>
                <CardDescription>Define workflow stages and their sub-stages</CardDescription>
              </div>
              <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedStage(null)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Stage
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
                      <Label htmlFor="applicationId" className="text-right">Application</Label>
                      <Select 
                        value={stageForm.applicationId} 
                        onValueChange={(value) => handleStageFormChange('applicationId', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select application" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleApplications.map(app => (
                            <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stageActive" className="text-right">Active</Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch 
                          id="stageActive" 
                          checked={stageForm.isActive}
                          onCheckedChange={(checked) => handleStageFormChange('isActive', checked)}
                        />
                        <Label htmlFor="stageActive">{stageForm.isActive ? 'Active' : 'Inactive'}</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStageDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveStage}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {stages.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Stages Defined</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the "Add Stage" button to create your first workflow stage.
                  </p>
                </div>
              ) : (
                stages.map((stage) => (
                  <Card key={stage.id} className="mb-4">
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                      <div className="flex items-center">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {stage.name}
                            {!stage.isActive && (
                              <Badge variant="outline" className="ml-2 text-xs">Inactive</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {stage.description}
                            {stage.applicationId && (
                              <div className="mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  Application: {sampleApplications.find(app => app.id === stage.applicationId)?.name || stage.applicationId}
                                </Badge>
                              </div>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedStage(stage);
                          setStageDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setItemToDelete({ type: 'stage', id: stage.id });
                          setDeleteDialogOpen(true);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Sub-Stages</h4>
                        <Dialog open={subStageDialogOpen} onOpenChange={setSubStageDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedSubStage(null);
                              setSelectedStage(stage);
                            }}>
                              <Plus className="mr-2 h-4 w-4" /> Add Sub-Stage
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{selectedSubStage ? 'Edit Sub-Stage' : 'Add New Sub-Stage'}</DialogTitle>
                              <DialogDescription>
                                {selectedSubStage ? 'Update the sub-stage details' : 'Enter the details for the new sub-stage'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="subStageName" className="text-right">Name</Label>
                                <Input 
                                  id="subStageName" 
                                  className="col-span-3" 
                                  placeholder="Sub-stage name" 
                                  value={subStageForm.name}
                                  onChange={(e) => handleSubStageFormChange('name', e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="componentName" className="text-right">Component Name</Label>
                                <Input 
                                  id="componentName" 
                                  className="col-span-3" 
                                  placeholder="Component name or external link" 
                                  value={subStageForm.componentName}
                                  onChange={(e) => handleSubStageFormChange('componentName', e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="serviceLink" className="text-right">Service Link</Label>
                                <Input 
                                  id="serviceLink" 
                                  className="col-span-3" 
                                  placeholder="Service link URL" 
                                  value={subStageForm.serviceLink}
                                  onChange={(e) => handleSubStageFormChange('serviceLink', e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="expectedDuration" className="text-right">Expected Duration</Label>
                                <Input 
                                  id="expectedDuration" 
                                  type="number" 
                                  className="col-span-3" 
                                  placeholder="Duration in hours" 
                                  value={subStageForm.expectedDuration}
                                  onChange={(e) => handleSubStageFormChange('expectedDuration', parseInt(e.target.value))}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="expectedTime" className="text-right">Expected Time</Label>
                                <Input 
                                  id="expectedTime" 
                                  className="col-span-3" 
                                  placeholder="Expected time (e.g., '2 hours')" 
                                  value={subStageForm.expectedTime}
                                  onChange={(e) => handleSubStageFormChange('expectedTime', e.target.value)}
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">Parameters</Label>
                                <div className="col-span-3">
                                  <div className="relative">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                          Select parameters
                                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-full p-0" align="start">
                                        <div className="p-2">
                                          {parameters.map((param) => (
                                            <div key={param.id} className="flex items-center space-x-2 mb-2">
                                              <Checkbox 
                                                id={`param-${param.id}`} 
                                                checked={subStageForm.selectedParameters.includes(param.id)}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    handleSubStageFormChange('selectedParameters', 
                                                      [...subStageForm.selectedParameters, param.id]
                                                    );
                                                  } else {
                                                    handleSubStageFormChange('selectedParameters', 
                                                      subStageForm.selectedParameters.filter(id => id !== param.id)
                                                    );
                                                  }
                                                }}
                                              />
                                              <Label htmlFor={`param-${param.id}`}>{param.name}</Label>
                                            </div>
                                          ))}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {subStageForm.selectedParameters.map(paramId => {
                                      const param = parameters.find(p => p.id === paramId);
                                      return param ? (
                                        <Badge key={param.id} variant="secondary" className="flex items-center gap-1">
                                          {param.name}
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-4 w-4 p-0" 
                                            onClick={() => handleSubStageFormChange('selectedParameters', 
                                              subStageForm.selectedParameters.filter(id => id !== param.id)
                                            )}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">Attestations</Label>
                                <div className="col-span-3">
                                  <div className="relative">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                          Select attestations
                                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-full p-0" align="start">
                                        <div className="p-2">
                                          {attestations.map((attest) => (
                                            <div key={attest.id} className="flex items-center space-x-2 mb-2">
                                              <Checkbox 
                                                id={`attest-${attest.id}`} 
                                                checked={subStageForm.selectedAttestations.includes(attest.id)}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    handleSubStageFormChange('selectedAttestations', 
                                                      [...subStageForm.selectedAttestations, attest.id]
                                                    );
                                                  } else {
                                                    handleSubStageFormChange('selectedAttestations', 
                                                      subStageForm.selectedAttestations.filter(id => id !== attest.id)
                                                    );
                                                  }
                                                }}
                                              />
                                              <Label htmlFor={`attest-${attest.id}`}>{attest.name}</Label>
                                            </div>
                                          ))}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {subStageForm.selectedAttestations.map(attestId => {
                                      const attest = attestations.find(a => a.id === attestId);
                                      return attest ? (
                                        <Badge key={attest.id} variant="secondary" className="flex items-center gap-1">
                                          {attest.name}
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-4 w-4 p-0" 
                                            onClick={() => handleSubStageFormChange('selectedAttestations', 
                                              subStageForm.selectedAttestations.filter(id => id !== attest.id)
                                            )}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="selectedTemplate" className="text-right">Template</Label>
                                <Select 
                                  value={subStageForm.selectedTemplate || "none"} 
                                  onValueChange={(value) => handleSubStageFormChange('selectedTemplate', value === "none" ? "" : value)}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {emailTemplates.map(template => (
                                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="emailConfig" className="text-right">Configure Email</Label>
                                <Select 
                                  value={subStageForm.emailConfig} 
                                  onValueChange={(value: 'NA' | 'start' | 'end') => handleSubStageFormChange('emailConfig', value)}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select email configuration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NA">Not Applicable</SelectItem>
                                    <SelectItem value="start">Start of Process</SelectItem>
                                    <SelectItem value="end">End of Process</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Role</Label>
                                <Select 
                                  value={subStageForm.role} 
                                  onValueChange={(value) => handleSubStageFormChange('role', value)}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map(role => (
                                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="isActive" className="text-right">Active</Label>
                                <div className="flex items-center space-x-2 col-span-3">
                                  <Switch 
                                    id="isActive" 
                                    checked={subStageForm.isActive}
                                    onCheckedChange={(checked) => handleSubStageFormChange('isActive', checked)}
                                  />
                                  <Label htmlFor="isActive">{subStageForm.isActive ? 'Active' : 'Inactive'}</Label>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSubStageDialogOpen(false)}>Cancel</Button>
                              <Button onClick={saveSubStage}>Save</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {stage.subStages.length === 0 ? (
                        <div className="text-center py-4 border rounded-md">
                          <p className="text-sm text-muted-foreground">
                            No sub-stages defined for this stage. Click "Add Sub-Stage" to create one.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Component Name</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Follow-up</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Parameters</TableHead>
                                <TableHead>Attestations</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stage.subStages.map((subStage) => {
                                // Get role name from role ID
                                const roleName = roles.find(r => r.id === subStage.readRole)?.name || subStage.readRole || '-';
                                
                                // Format email config
                                let emailConfig = '-';
                                if (subStage.emailConfig === 'start') emailConfig = 'Start';
                                if (subStage.emailConfig === 'end') emailConfig = 'End';
                                
                                return (
                                  <TableRow key={subStage.id}>
                                    <TableCell>{subStage.id}</TableCell>
                                    <TableCell className="font-medium">
                                      <div className="flex items-center">
                                        {subStage.name}
                                        {!subStage.isActive && (
                                          <Badge variant="outline" className="ml-2 text-xs">Inactive</Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>{subStage.componentName || '-'}</TableCell>
                                    <TableCell>{subStage.expectedDuration} hours</TableCell>
                                    <TableCell>{subStage.expectedTime || '-'}</TableCell>
                                    <TableCell>{roleName}</TableCell>
                                    <TableCell>{emailConfig}</TableCell>
                                    <TableCell>
                                      {subStage.parameters && subStage.parameters.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {subStage.parameters.slice(0, 2).map(param => (
                                            <Badge key={param.id} variant="secondary" className="text-xs">
                                              {param.name}
                                            </Badge>
                                          ))}
                                          {subStage.parameters.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{subStage.parameters.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                      {subStage.attestations && subStage.attestations.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {subStage.attestations.slice(0, 2).map(attest => (
                                            <Badge key={attest.id} variant="secondary" className="text-xs">
                                              {attest.name}
                                            </Badge>
                                          ))}
                                          {subStage.attestations.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{subStage.attestations.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={subStage.isActive ? "default" : "outline"}>
                                        {subStage.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                          setSelectedSubStage(subStage);
                                          setSelectedStage(stage);
                                          setSubStageDialogOpen(true);
                                        }}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                          setItemToDelete({ type: 'subStage', id: subStage.id, parentId: stage.id });
                                          setDeleteDialogOpen(true);
                                        }}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Parameters Tab */}
        <TabsContent value="parameters">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Parameters</CardTitle>
                <CardDescription>Define reusable parameters for stages and sub-stages</CardDescription>
              </div>
              <Dialog open={parameterDialogOpen} onOpenChange={setParameterDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedParameter(null)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Parameter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedParameter ? 'Edit Parameter' : 'Add New Parameter'}</DialogTitle>
                    <DialogDescription>
                      {selectedParameter ? 'Update the parameter details' : 'Enter the details for the new parameter'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parameterName" className="text-right">Name</Label>
                      <Input 
                        id="parameterName" 
                        className="col-span-3" 
                        placeholder="Parameter name" 
                        value={parameterForm.name}
                        onChange={(e) => handleParameterFormChange('name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parameterDescription" className="text-right">Description</Label>
                      <Textarea 
                        id="parameterDescription" 
                        className="col-span-3" 
                        placeholder="Parameter description" 
                        value={parameterForm.description}
                        onChange={(e) => handleParameterFormChange('description', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dataType" className="text-right">Data Type</Label>
                      <Select 
                        value={parameterForm.dataType} 
                        onValueChange={(value: 'string' | 'number' | 'boolean' | 'date') => handleParameterFormChange('dataType', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="isRequired" className="text-right">Required</Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Checkbox 
                          id="isRequired" 
                          checked={parameterForm.isRequired}
                          onCheckedChange={(checked) => handleParameterFormChange('isRequired', checked === true)}
                        />
                        <Label htmlFor="isRequired">Parameter is required</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parameterActive" className="text-right">Active</Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch 
                          id="parameterActive" 
                          checked={parameterForm.isActive}
                          onCheckedChange={(checked) => handleParameterFormChange('isActive', checked)}
                        />
                        <Label htmlFor="parameterActive">{parameterForm.isActive ? 'Active' : 'Inactive'}</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setParameterDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveParameter}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {parameters.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Parameters Defined</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the "Add Parameter" button to create your first parameter.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parameters.map((parameter) => (
                      <TableRow key={parameter.id}>
                        <TableCell className="font-medium">{parameter.name}</TableCell>
                        <TableCell>{parameter.description || '-'}</TableCell>
                        <TableCell>{parameter.dataType}</TableCell>
                        <TableCell>{parameter.isRequired ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}</TableCell>
                        <TableCell>
                          <Badge variant={parameter.isActive ? "default" : "outline"}>
                            {parameter.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedParameter(parameter);
                              setParameterDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setItemToDelete({ type: 'parameter', id: parameter.id });
                              setDeleteDialogOpen(true);
                            }}>
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
        </TabsContent>
        
        {/* Attestations Tab */}
        <TabsContent value="attestations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attestations</CardTitle>
                <CardDescription>Define attestation texts for workflow approvals</CardDescription>
              </div>
              <Dialog open={attestationDialogOpen} onOpenChange={setAttestationDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedAttestation(null)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Attestation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedAttestation ? 'Edit Attestation' : 'Add New Attestation'}</DialogTitle>
                    <DialogDescription>
                      {selectedAttestation ? 'Update the attestation details' : 'Enter the details for the new attestation'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="attestationName" className="text-right">Name</Label>
                      <Input 
                        id="attestationName" 
                        className="col-span-3" 
                        placeholder="Attestation name" 
                        value={attestationForm.name}
                        onChange={(e) => handleAttestationFormChange('name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="attestationDescription" className="text-right">Description</Label>
                      <Textarea 
                        id="attestationDescription" 
                        className="col-span-3" 
                        placeholder="Attestation description" 
                        value={attestationForm.description}
                        onChange={(e) => handleAttestationFormChange('description', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="attestationText" className="text-right">Text</Label>
                      <Textarea 
                        id="attestationText" 
                        className="col-span-3" 
                        placeholder="Attestation text" 
                        rows={4} 
                        value={attestationForm.text}
                        onChange={(e) => handleAttestationFormChange('text', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="attestationActive" className="text-right">Active</Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch 
                          id="attestationActive" 
                          checked={attestationForm.isActive}
                          onCheckedChange={(checked) => handleAttestationFormChange('isActive', checked)}
                        />
                        <Label htmlFor="attestationActive">{attestationForm.isActive ? 'Active' : 'Inactive'}</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAttestationDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveAttestation}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {attestations.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Attestations Defined</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the "Add Attestation" button to create your first attestation.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Text</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attestations.map((attestation) => (
                      <TableRow key={attestation.id}>
                        <TableCell className="font-medium">{attestation.name}</TableCell>
                        <TableCell>{attestation.description}</TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate">{attestation.text}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={attestation.isActive ? "default" : "outline"}>
                            {attestation.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedAttestation(attestation);
                              setAttestationDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setItemToDelete({ type: 'attestation', id: attestation.id });
                              setDeleteDialogOpen(true);
                            }}>
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
        </TabsContent>
        
        {/* Email Templates Tab */}
        <TabsContent value="emailTemplates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Define email templates for workflow notifications</CardDescription>
              </div>
              <Dialog open={emailTemplateDialogOpen} onOpenChange={setEmailTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedEmailTemplate(null)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Email Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{selectedEmailTemplate ? 'Edit Email Template' : 'Add New Email Template'}</DialogTitle>
                    <DialogDescription>
                      {selectedEmailTemplate ? 'Update the email template details' : 'Enter the details for the new email template'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="templateName" className="text-right">Name</Label>
                      <Input 
                        id="templateName" 
                        className="col-span-3" 
                        placeholder="Template name" 
                        value={emailTemplateForm.name}
                        onChange={(e) => handleEmailTemplateFormChange('name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="templateDescription" className="text-right">Description</Label>
                      <Textarea 
                        id="templateDescription" 
                        className="col-span-3" 
                        placeholder="Template description" 
                        value={emailTemplateForm.description}
                        onChange={(e) => handleEmailTemplateFormChange('description', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="templateSubject" className="text-right">Subject</Label>
                      <Input 
                        id="templateSubject" 
                        className="col-span-3" 
                        placeholder="Email subject" 
                        value={emailTemplateForm.subject}
                        onChange={(e) => handleEmailTemplateFormChange('subject', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="templateBody" className="text-right pt-2">Body</Label>
                      <Textarea 
                        id="templateBody" 
                        className="col-span-3" 
                        placeholder="Email body" 
                        rows={8} 
                        value={emailTemplateForm.body}
                        onChange={(e) => handleEmailTemplateFormChange('body', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Parameters</Label>
                      <div className="col-span-3">
                        <p className="text-sm text-muted-foreground mb-2">
                          Select parameters to use in this template. Use &#123;&#123;parameterName&#125;&#125; syntax in the body.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {parameters.map((param) => (
                            <Button 
                              key={param.id} 
                              variant={emailTemplateForm.selectedParameters.includes(param.id) ? "default" : "outline"} 
                              size="sm" 
                              className="h-8"
                              onClick={() => toggleParameterSelection(param.id)}
                            >
                              {param.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="templateActive" className="text-right">Active</Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch 
                          id="templateActive" 
                          checked={emailTemplateForm.isActive}
                          onCheckedChange={(checked) => handleEmailTemplateFormChange('isActive', checked)}
                        />
                        <Label htmlFor="templateActive">{emailTemplateForm.isActive ? 'Active' : 'Inactive'}</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailTemplateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveEmailTemplate}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {emailTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Email Templates Defined</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the "Add Email Template" button to create your first email template.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Parameters</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.description || '-'}</TableCell>
                        <TableCell>{template.subject}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {template.parameters.map((param) => (
                              <span key={param.id} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                {param.name}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.isActive ? "default" : "outline"}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedEmailTemplate(template);
                              setEmailTemplateDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setItemToDelete({ type: 'emailTemplate', id: template.id });
                              setDeleteDialogOpen(true);
                            }}>
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
        </TabsContent>
        
        {/* Import/Export Tab */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import/Export Metadata</CardTitle>
              <CardDescription>Import or export metadata configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Export Metadata</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your metadata configuration to a JSON file for backup or to transfer to another environment.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => exportData('all')}>
                    <Download className="mr-2 h-4 w-4" /> Export All
                  </Button>
                  <Button variant="outline" onClick={() => exportData('stages')}>
                    <Download className="mr-2 h-4 w-4" /> Export Stages
                  </Button>
                  <Button variant="outline" onClick={() => exportData('parameters')}>
                    <Download className="mr-2 h-4 w-4" /> Export Parameters
                  </Button>
                  <Button variant="outline" onClick={() => exportData('attestations')}>
                    <Download className="mr-2 h-4 w-4" /> Export Attestations
                  </Button>
                  <Button variant="outline" onClick={() => exportData('emailTemplates')}>
                    <Download className="mr-2 h-4 w-4" /> Export Email Templates
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Import Metadata</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import metadata configuration from a JSON file. This will overwrite existing configurations.
                </p>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="importFile">Upload JSON file</Label>
                  <Input id="importFile" type="file" accept=".json" onChange={handleImport} />
                </div>
                <div className="flex items-center mt-4">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Importing will merge with existing data. Duplicate IDs will be overwritten.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MetadataManagement;