import React, { useState, useEffect, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, Loader2, Lock, Unlock, Search, Save, Database, Mail, Settings, FileText, CheckCircle, Eye, AlertTriangle, X } from 'lucide-react';
import { useMetadataManagement } from '@/hooks/useMetadataManagement';
import { useApiEnvironment } from '@/contexts/ApiEnvironmentContext';
import { toast } from '@/components/ui/use-toast';

// Form interfaces
interface StageForm {
  stageId?: number;
  name: string;
  description: string;
  updatedby: string;
}

// Extended metadata types
interface Param {
  paramId: number | null;
  name: string;
  paramType: string;
  description: string;
  updatedby: string;
  updatedon: string | null;
  value?: string | null;
}

interface Attestation {
  attestationId: number;
  name: string;
  type: string;
  updatedby: string;
  updatedon: string;
}

interface EmailTemplate {
  templateId: number;
  name: string;
  emailBody: string;
  ishtml: string;
  subject: string;
  fromEmailList: string;
}

interface Substage {
  substageId: number | null;
  name: string;
  componentname: string;
  defaultstage: number;
  attestationMapping: number[];
  paramMapping: number[];
  templateId: number;
  entitlementMapping: number;
  followUp: string;
  updatedby: string;
  updatedon: string;
  expectedduration?: string;
  expectedtime?: string;
  sendEmailAtStart?: string;
  servicelink?: string;
  substageAttestations?: any[];
}

interface ExtendedStage {
  stageId: number;
  name: string;
}

// Mock data for development
const mockParameters: Param[] = [
  {
    paramId: 1,
    name: "Upload Timeout",
    paramType: "upload",
    description: "Maximum time allowed for file uploads",
    updatedby: "admin",
    updatedon: "2024-01-15",
    value: "300"
  },
  {
    paramId: 2,
    name: "Default Currency",
    paramType: "default",
    description: "Default currency for calculations",
    updatedby: "system",
    updatedon: "2024-01-10",
    value: "USD"
  },
  {
    paramId: 3,
    name: "Download Path",
    paramType: "download",
    description: "Default download directory path",
    updatedby: "admin",
    updatedon: "2024-01-12",
    value: "/downloads"
  }
];

const mockAttestations: Attestation[] = [
  {
    attestationId: 1,
    name: "Manager Approval",
    type: "DEFAULT",
    updatedby: "admin",
    updatedon: "2024-01-15"
  },
  {
    attestationId: 2,
    name: "Compliance Check",
    type: "DEFAULT",
    updatedby: "system",
    updatedon: "2024-01-10"
  },
  {
    attestationId: 3,
    name: "Risk Assessment",
    type: "DEFAULT",
    updatedby: "admin",
    updatedon: "2024-01-12"
  }
];

const mockEmailTemplates: EmailTemplate[] = [
  {
    templateId: 1,
    name: "Welcome Email",
    emailBody: "<h1>Welcome!</h1><p>Thank you for joining our workflow system.</p>",
    ishtml: "Y",
    subject: "Welcome to the System",
    fromEmailList: "noreply@company.com"
  },
  {
    templateId: 2,
    name: "Approval Required",
    emailBody: "Your approval is required for the following item: {ITEM_NAME}",
    ishtml: "N",
    subject: "Action Required: Approval Needed",
    fromEmailList: "workflow@company.com"
  },
  {
    templateId: 3,
    name: "Process Complete",
    emailBody: "<h2>Process Completed</h2><p>The workflow process has been successfully completed.</p>",
    ishtml: "Y",
    subject: "Process Completion Notification",
    fromEmailList: "notifications@company.com"
  }
];

const mockSubstages: Substage[] = [
  {
    substageId: 1,
    name: "Initial Review",
    componentname: "/components/review/initial",
    defaultstage: 1,
    attestationMapping: [1, 2],
    paramMapping: [1, 3],
    templateId: 1,
    entitlementMapping: 1,
    followUp: "Y",
    updatedby: "admin",
    updatedon: "2024-01-15",
    expectedduration: "2",
    expectedtime: "09:00",
    sendEmailAtStart: "Y",
    servicelink: "http://api.company.com/review"
  },
  {
    substageId: 2,
    name: "Manager Approval",
    componentname: "/components/approval/manager",
    defaultstage: 2,
    attestationMapping: [1],
    paramMapping: [2],
    templateId: 2,
    entitlementMapping: 2,
    followUp: "N",
    updatedby: "system",
    updatedon: "2024-01-12",
    expectedduration: "1",
    expectedtime: "14:00",
    sendEmailAtStart: "Y",
    servicelink: "http://api.company.com/approval"
  }
];

const mockRoles = [
  { roleId: 1, roleName: "Producer" },
  { roleId: 2, roleName: "Approver" },
  { roleId: 3, roleName: "Reviewer" },
  { roleId: 4, roleName: "Administrator" }
];

const mockApplicationRoleMappings = [
  { applicationId: 1, roleId: 1, roleName: "Producer" },
  { applicationId: 1, roleId: 2, roleName: "Approver" },
  { applicationId: 2, roleId: 1, roleName: "Producer" },
  { applicationId: 2, roleId: 3, roleName: "Reviewer" }
];

const MetadataManagement: React.FC = () => {
  const { currentEnvironment } = useApiEnvironment();
  
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

  // Tab and search state
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Extended metadata state
  const [parameters, setParameters] = useState<Param[]>([]);
  const [paramDialogOpen, setParamDialogOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<Param | null>(null);
  const [paramForm, setParamForm] = useState<Param>({
    paramId: null,
    name: '',
    paramType: 'default',
    description: '',
    updatedby: 'system',
    updatedon: null,
    value: null
  });

  // Attestations state
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [attestationDialogOpen, setAttestationDialogOpen] = useState(false);
  const [editingAttestation, setEditingAttestation] = useState<Attestation | null>(null);
  const [attestationForm, setAttestationForm] = useState<Attestation>({
    attestationId: 0,
    name: '',
    type: 'DEFAULT',
    updatedby: 'system',
    updatedon: ''
  });

  // Email Templates state
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailTemplate | null>(null);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [emailForm, setEmailForm] = useState<EmailTemplate>({
    templateId: 0,
    name: '',
    emailBody: '',
    ishtml: 'Y',
    subject: '',
    fromEmailList: ''
  });

  // Available roles state
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [applicationRoleMappings, setApplicationRoleMappings] = useState<any[]>([]);

  // Substages state
  const [substages, setSubstages] = useState<Substage[]>([]);
  const [substageDialogOpen, setSubstageDialogOpen] = useState(false);
  const [editingSubstage, setEditingSubstage] = useState<Substage | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [selectedSubstageApplicationId, setSelectedSubstageApplicationId] = useState<number | null>(null);
  
  // Pagination state for substages
  const [substageCurrentPage, setSubstageCurrentPage] = useState(1);
  const [substageSearchTerm, setSubstageSearchTerm] = useState('');
  const substagesPerPage = 200;

  // Search state for parameters and attestations in substage dialog
  const [parameterSearchTerm, setParameterSearchTerm] = useState('');
  const [attestationSearchTerm, setAttestationSearchTerm] = useState('');

  // App import progress state
  const [appImportStatus, setAppImportStatus] = useState<Record<number, boolean>>({});
  const [checkingImportStatus, setCheckingImportStatus] = useState<Record<number, boolean>>({});
  const [substageForm, setSubstageForm] = useState<Substage>({
    substageId: null,
    name: '',
    componentname: '',
    defaultstage: 0,
    attestationMapping: [],
    paramMapping: [],
    templateId: 0,
    entitlementMapping: 0,
    followUp: 'N',
    updatedby: 'system',
    updatedon: '',
    expectedduration: '',
    expectedtime: '',
    sendEmailAtStart: 'N',
    servicelink: '',
    substageAttestations: []
  });

  // Get base URL for Java service
  const getJavaBaseUrl = () => {
    return currentEnvironment?.javaBaseUrl || process.env.NEXT_PUBLIC_JAVA_BASE_URL || 'http://api-workflow.com';
  };

  // Get base URL for .NET service
  const getDotNetBaseUrl = () => {
    const dotNetUrl = currentEnvironment?.baseUrl || process.env.NEXT_PUBLIC_DOTNET_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://api.com';
    console.log('getDotNetBaseUrl:', {
      currentEnvironment: currentEnvironment?.name,
      baseUrl: currentEnvironment?.baseUrl,
      dotNetEnvVar: process.env.NEXT_PUBLIC_DOTNET_BASE_URL,
      baseEnvVar: process.env.NEXT_PUBLIC_BASE_URL,
      finalUrl: dotNetUrl
    });
    return dotNetUrl;
  };

  // Check if we should use mock data
  const shouldUseMockData = () => {
    return process.env.NEXT_PUBLIC_FORCE_REAL_API !== 'true' && 
           (currentEnvironment?.name === 'Mock' || !currentEnvironment);
  };

  // Check if app is importing data
  const checkAppImportProgress = async (appId: number) => {
    if (shouldUseMockData()) {
      setAppImportStatus(prev => ({ ...prev, [appId]: false }));
      return false;
    }

    setCheckingImportStatus(prev => ({ ...prev, [appId]: true }));
    try {
      const response = await fetch(`${getJavaBaseUrl()}/api/workflowapp/${appId}/inProgress`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const isInProgress = await response.json();
        setAppImportStatus(prev => ({ ...prev, [appId]: isInProgress }));
        return isInProgress;
      } else {
        console.warn(`Failed to check import status for app ${appId}: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Error checking app import progress:', error);
      return false;
    } finally {
      setCheckingImportStatus(prev => ({ ...prev, [appId]: false }));
    }
  };

  // Load stages and in-progress status when application is selected
  useEffect(() => {
    if (selectedApplicationId) {
      refreshStages(selectedApplicationId);
      checkInProgress(selectedApplicationId);
      checkAppImportProgress(selectedApplicationId);
    }
  }, [selectedApplicationId, refreshStages, checkInProgress]);

  // Check import progress for substage application
  useEffect(() => {
    if (selectedSubstageApplicationId) {
      checkAppImportProgress(selectedSubstageApplicationId);
    }
  }, [selectedSubstageApplicationId]);

  // Load extended metadata based on active tab
  useEffect(() => {
    if (activeTab === 'parameters') {
      fetchParameters();
    } else if (activeTab === 'attestations') {
      fetchAttestations();
    } else if (activeTab === 'email-templates') {
      fetchEmailTemplates();
    } else if (activeTab === 'substages') {
      // Reset substage selections when switching to substages tab
      setSelectedSubstageApplicationId(null);
      setSelectedStageId(null);
      setSubstages([]);
    }
  }, [activeTab, currentEnvironment]);

  // Load stages when substage application is selected
  useEffect(() => {
    if (selectedSubstageApplicationId) {
      refreshStages(selectedSubstageApplicationId);
    }
  }, [selectedSubstageApplicationId, refreshStages]);

  // Load substages when stage is selected
  useEffect(() => {
    if (selectedStageId) {
      fetchSubstages(selectedStageId);
    }
  }, [selectedStageId]);

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

  // Load parameters, attestations, email templates, and roles when substage dialog opens
  useEffect(() => {
    if (substageDialogOpen) {
      // Reset search terms when dialog opens
      setParameterSearchTerm('');
      setAttestationSearchTerm('');
      
      if (parameters.length === 0) {
        fetchParameters();
      }
      if (attestations.length === 0) {
        fetchAttestations();
      }
      if (emailTemplates.length === 0) {
        fetchEmailTemplates();
      }
      if (availableRoles.length === 0) {
        fetchAvailableRoles();
      }
      // Fetch application-specific role mappings if we have a selected application
      if (selectedSubstageApplicationId) {
        fetchApplicationRoleMappings(selectedSubstageApplicationId);
      }
    }
  }, [substageDialogOpen, selectedSubstageApplicationId]);

  // Extended metadata API calls with proper CORS configuration
  const fetchParameters = async () => {
    if (shouldUseMockData()) {
      setParameters(mockParameters);
      return;
    }

    try {
      const response = await fetch(`${getJavaBaseUrl()}/api/param`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setParameters(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
      // Fallback to mock data on error
      setParameters(mockParameters);
      toast({
        title: "Using Mock Data",
        description: "Failed to fetch parameters from API, using mock data for development",
        variant: "default"
      });
    }
  };

  const fetchAttestations = async () => {
    if (shouldUseMockData()) {
      setAttestations(mockAttestations);
      return;
    }

    try {
      const response = await fetch(`${getJavaBaseUrl()}/api/attest?type=DEFAULT`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAttestations(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching attestations:', error);
      // Fallback to mock data on error
      setAttestations(mockAttestations);
      toast({
        title: "Using Mock Data",
        description: "Failed to fetch attestations from API, using mock data for development",
        variant: "default"
      });
    }
  };

  const fetchEmailTemplates = async () => {
    if (shouldUseMockData()) {
      setEmailTemplates(mockEmailTemplates);
      return;
    }

    try {
      const response = await fetch(`${getJavaBaseUrl()}/api/email`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEmailTemplates(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
      // Fallback to mock data on error
      setEmailTemplates(mockEmailTemplates);
      toast({
        title: "Using Mock Data",
        description: "Failed to fetch email templates from API, using mock data for development",
        variant: "default"
      });
    }
  };

  const fetchSubstages = async (stageId: number) => {
    if (shouldUseMockData()) {
      setSubstages(mockSubstages);
      return;
    }

    try {
      const response = await fetch(`${getJavaBaseUrl()}/api/substage?stageId=${stageId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubstages(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching substages:', error);
      // Fallback to mock data on error
      setSubstages(mockSubstages);
      toast({
        title: "Using Mock Data",
        description: "Failed to fetch substages from API, using mock data for development",
        variant: "default"
      });
    }
  };

  const fetchAvailableRoles = async () => {
    if (shouldUseMockData()) {
      setAvailableRoles(mockRoles);
      return;
    }

    try {
      const response = await fetch(`${getDotNetBaseUrl()}/api/WF/GetWorkflowUniqueRoles`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include', // .NET service uses Windows authentication
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching available roles:', error);
      // Fallback to mock data on error
      setAvailableRoles(mockRoles);
      toast({
        title: "Using Mock Data",
        description: "Failed to fetch roles from API, using mock data for development",
        variant: "default"
      });
    }
  };

  const fetchApplicationRoleMappings = async (applicationId: number) => {
    if (shouldUseMockData()) {
      const filteredMappings = mockApplicationRoleMappings.filter(
        mapping => mapping.applicationId === applicationId
      );
      setApplicationRoleMappings(filteredMappings);
      return;
    }

    try {
      const response = await fetch(`${getDotNetBaseUrl()}/api/WF/GetWorkflowApplicationToRoleMap`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include', // .NET service uses Windows authentication
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Filter mappings for the specific application
        const filteredMappings = data.filter((mapping: any) => 
          mapping.applicationId === applicationId.toString() || 
          mapping.applicationId === applicationId
        );
        setApplicationRoleMappings(filteredMappings);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching application role mappings:', error);
      // Fallback to mock data on error
      const filteredMappings = mockApplicationRoleMappings.filter(
        mapping => mapping.applicationId === applicationId
      );
      setApplicationRoleMappings(filteredMappings);
      toast({
        title: "Using Mock Data",
        description: "Failed to fetch application role mappings from API, using mock data for development",
        variant: "default"
      });
    }
  };

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

  // Extended metadata save functions with proper CORS configuration
  const saveParameter = async () => {
    if (shouldUseMockData()) {
      // Mock save for development
      const newParam = { ...paramForm, paramId: paramForm.paramId || Date.now() };
      if (editingParam) {
        setParameters(prev => prev.map(p => p.paramId === editingParam.paramId ? newParam : p));
      } else {
        setParameters(prev => [...prev, newParam]);
      }
      toast({
        title: "Success (Mock)",
        description: `Parameter ${editingParam ? 'updated' : 'created'} successfully in mock data`
      });
      setParamDialogOpen(false);
      setEditingParam(null);
      return;
    }

    try {
      const method = editingParam ? 'PUT' : 'POST';
      const url = editingParam 
        ? `${getJavaBaseUrl()}/api/param/${editingParam.paramId}`
        : `${getJavaBaseUrl()}/api/param`;

      const response = await fetch(url, {
        method,
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paramForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Parameter ${editingParam ? 'updated' : 'created'} successfully`
        });
        setParamDialogOpen(false);
        setEditingParam(null);
        fetchParameters();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving parameter:', error);
      toast({
        title: "Error",
        description: `Failed to save parameter: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const saveAttestation = async () => {
    if (shouldUseMockData()) {
      // Mock save for development
      const newAttestation = { ...attestationForm, attestationId: attestationForm.attestationId || Date.now() };
      if (editingAttestation) {
        setAttestations(prev => prev.map(a => a.attestationId === editingAttestation.attestationId ? newAttestation : a));
      } else {
        setAttestations(prev => [...prev, newAttestation]);
      }
      toast({
        title: "Success (Mock)",
        description: `Attestation ${editingAttestation ? 'updated' : 'created'} successfully in mock data`
      });
      setAttestationDialogOpen(false);
      setEditingAttestation(null);
      return;
    }

    try {
      const method = editingAttestation ? 'PUT' : 'POST';
      const url = editingAttestation 
        ? `${getJavaBaseUrl()}/api/attest/${editingAttestation.attestationId}`
        : `${getJavaBaseUrl()}/api/attest/`;

      const response = await fetch(url, {
        method,
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attestationForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Attestation ${editingAttestation ? 'updated' : 'created'} successfully`
        });
        setAttestationDialogOpen(false);
        setEditingAttestation(null);
        fetchAttestations();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving attestation:', error);
      toast({
        title: "Error",
        description: `Failed to save attestation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const saveEmailTemplate = async () => {
    if (shouldUseMockData()) {
      // Mock save for development
      const newTemplate = { ...emailForm, templateId: emailForm.templateId || Date.now() };
      if (editingEmail) {
        setEmailTemplates(prev => prev.map(t => t.templateId === editingEmail.templateId ? newTemplate : t));
      } else {
        setEmailTemplates(prev => [...prev, newTemplate]);
      }
      toast({
        title: "Success (Mock)",
        description: `Email template ${editingEmail ? 'updated' : 'created'} successfully in mock data`
      });
      setEmailDialogOpen(false);
      setEditingEmail(null);
      return;
    }

    try {
      const method = editingEmail ? 'PUT' : 'POST';
      const url = editingEmail 
        ? `${getJavaBaseUrl()}/api/email/${editingEmail.templateId}`
        : `${getJavaBaseUrl()}/api/email/`;

      const response = await fetch(url, {
        method,
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Email template ${editingEmail ? 'updated' : 'created'} successfully`
        });
        setEmailDialogOpen(false);
        setEditingEmail(null);
        fetchEmailTemplates();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving email template:', error);
      toast({
        title: "Error",
        description: `Failed to save email template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const saveSubstage = async () => {
    if (shouldUseMockData()) {
      // Mock save for development
      const newSubstage = { ...substageForm, substageId: substageForm.substageId || Date.now() };
      if (editingSubstage) {
        setSubstages(prev => prev.map(s => s.substageId === editingSubstage.substageId ? newSubstage : s));
      } else {
        setSubstages(prev => [...prev, newSubstage]);
      }
      toast({
        title: "Success (Mock)",
        description: `Substage ${editingSubstage ? 'updated' : 'created'} successfully in mock data`
      });
      setSubstageDialogOpen(false);
      setEditingSubstage(null);
      return;
    }

    try {
      const method = editingSubstage ? 'PUT' : 'POST';
      const baseUrl = editingSubstage 
        ? `${getJavaBaseUrl()}/api/substage/${editingSubstage.substageId}`
        : `${getJavaBaseUrl()}/api/substage`;
      
      const url = `${baseUrl}?forceStartDesc=force%20start&reRunDesc=rerun`;

      // Convert arrays to semicolon-separated strings for the API
      const payload = {
        ...substageForm,
        attestationMapping: Array.isArray(substageForm.attestationMapping)
          ? substageForm.attestationMapping.join(';') + (substageForm.attestationMapping.length > 0 ? ';' : '')
          : substageForm.attestationMapping || '',
        paramMapping: Array.isArray(substageForm.paramMapping)
          ? substageForm.paramMapping.join(';') + (substageForm.paramMapping.length > 0 ? ';' : '')
          : substageForm.paramMapping || '',
        substageId: editingSubstage ? substageForm.substageId : null,
        updatedon: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      const response = await fetch(url, {
        method,
        mode: 'cors',
        credentials: 'omit', // Java service is not Windows authenticated
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Substage ${editingSubstage ? 'updated' : 'created'} successfully`
        });
        setSubstageDialogOpen(false);
        setEditingSubstage(null);
        if (selectedStageId) {
          fetchSubstages(selectedStageId);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving substage:', error);
      toast({
        title: "Error",
        description: `Failed to save substage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
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

  // Filter functions for extended metadata
  const filteredParameters = parameters.filter(param =>
    param.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (param.description && param.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAttestations = attestations.filter(attestation =>
    attestation.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmailTemplates = emailTemplates.filter(template =>
    template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered parameters and attestations for substage dialog with search - FIXED
  const filteredParametersForSubstage = useMemo(() => {
    return parameters.filter(param =>
      param.name?.toLowerCase().includes(parameterSearchTerm.toLowerCase()) ||
      (param.description && param.description.toLowerCase().includes(parameterSearchTerm.toLowerCase())) ||
      param.paramType?.toLowerCase().includes(parameterSearchTerm.toLowerCase())
    );
  }, [parameters, parameterSearchTerm]);

  const filteredAttestationsForSubstage = useMemo(() => {
    return attestations.filter(attestation =>
      attestation.name?.toLowerCase().includes(attestationSearchTerm.toLowerCase()) ||
      attestation.type?.toLowerCase().includes(attestationSearchTerm.toLowerCase())
    );
  }, [attestations, attestationSearchTerm]);

  // Enhanced substages filtering with pagination
  const filteredSubstages = substages.filter(substage =>
    substage.name?.toLowerCase().includes(substageSearchTerm.toLowerCase()) ||
    substage.componentname?.toLowerCase().includes(substageSearchTerm.toLowerCase()) ||
    (substage.servicelink && substage.servicelink.toLowerCase().includes(substageSearchTerm.toLowerCase())) ||
    (Array.isArray(substage.attestationMapping) ? 
      substage.attestationMapping.some(id => id.toString().includes(substageSearchTerm)) :
      substage.attestationMapping.toString().toLowerCase().includes(substageSearchTerm.toLowerCase())) ||
    (Array.isArray(substage.paramMapping) ? 
      substage.paramMapping.some(id => id.toString().includes(substageSearchTerm)) :
      substage.paramMapping.toString().toLowerCase().includes(substageSearchTerm.toLowerCase()))
  );

  // Pagination calculations for substages
  const totalSubstagePages = Math.ceil(filteredSubstages.length / substagesPerPage);
  const paginatedSubstages = filteredSubstages.slice(
    (substageCurrentPage - 1) * substagesPerPage,
    substageCurrentPage * substagesPerPage
  );

  // Text truncation utility
  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Edit functions for extended metadata
  const editParameter = (param: Param) => {
    setEditingParam(param);
    setParamForm({
      ...param,
      paramType: param.paramType || 'default' // Ensure type is loaded
    });
    setParamDialogOpen(true);
  };

  const editAttestation = (attestation: Attestation) => {
    setEditingAttestation(attestation);
    setAttestationForm({
      ...attestation,
      type: attestation.type || 'DEFAULT' // Ensure type is loaded
    });
    setAttestationDialogOpen(true);
  };

  const editEmailTemplate = (template: EmailTemplate) => {
    setEditingEmail(template);
    setEmailForm(template);
    setEmailDialogOpen(true);
  };

  const editSubstage = (substage: Substage) => {
    setEditingSubstage(substage);
    setSubstageForm(substage);
    setSubstageDialogOpen(true);
  };

  // Preview email template
  const previewEmail = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setEmailPreviewOpen(true);
  };

  // Add new functions for extended metadata
  const addNewParameter = () => {
    setEditingParam(null);
    setParamForm({
      paramId: null,
      name: '',
      paramType: 'default',
      description: '',
      updatedby: 'system',
      updatedon: null,
      value: null
    });
    setParamDialogOpen(true);
  };

  const addNewAttestation = () => {
    setEditingAttestation(null);
    setAttestationForm({
      attestationId: 0,
      name: '',
      type: 'DEFAULT',
      updatedby: 'system',
      updatedon: ''
    });
    setAttestationDialogOpen(true);
  };

  const addNewEmailTemplate = () => {
    setEditingEmail(null);
    setEmailForm({
      templateId: 0,
      name: '',
      emailBody: '',
      ishtml: 'Y',
      subject: '',
      fromEmailList: ''
    });
    setEmailDialogOpen(true);
  };

  const addNewSubstage = () => {
    setEditingSubstage(null);
    setSubstageForm({
      substageId: null,
      name: '',
      componentname: '',
      defaultstage: selectedStageId || 0,
      attestationMapping: [],
      paramMapping: [],
      templateId: 0,
      entitlementMapping: 0,
      followUp: 'N',
      updatedby: 'system',
      updatedon: '',
      expectedduration: '',
      expectedtime: '',
      sendEmailAtStart: 'N',
      servicelink: '',
      substageAttestations: []
    });
    setSubstageDialogOpen(true);
  };

  // Get current application data
  const currentApplication = selectedApplicationId 
    ? applications.find(app => app.appId === selectedApplicationId)
    : null;

  const currentStages = selectedApplicationId ? stages[selectedApplicationId] || [] : [];
  const isApplicationInProgress = selectedApplicationId ? inProgressStatus[selectedApplicationId] || appImportStatus[selectedApplicationId] || false : false;
  const isStagesLoading = selectedApplicationId ? stagesLoading[selectedApplicationId] || false : false;

  // Get substage application data
  const currentSubstageApplication = selectedSubstageApplicationId 
    ? applications.find(app => app.appId === selectedSubstageApplicationId)
    : null;

  const currentSubstageStages = selectedSubstageApplicationId ? stages[selectedSubstageApplicationId] || [] : [];
  const isSubstageStagesLoading = selectedSubstageApplicationId ? stagesLoading[selectedSubstageApplicationId] || false : false;
  const isSubstageAppInProgress = selectedSubstageApplicationId ? appImportStatus[selectedSubstageApplicationId] || false : false;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Applications & Stages
          </TabsTrigger>
          <TabsTrigger value="parameters" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Parameters
          </TabsTrigger>
          <TabsTrigger value="attestations" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Attestations
          </TabsTrigger>
          <TabsTrigger value="email-templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="substages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Substages
          </TabsTrigger>
        </TabsList>

        {/* Applications & Stages Tab */}
        <TabsContent value="applications" className="space-y-4">
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
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Parameters Management</CardTitle>
                <CardDescription>Manage system parameters and their configurations</CardDescription>
              </div>
              <Button onClick={addNewParameter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Parameter
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Updated On</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Loading parameters...
                      </TableCell>
                    </TableRow>
                  ) : filteredParameters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No parameters found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParameters.map((param) => (
                      <TableRow key={param.paramId}>
                        <TableCell className="font-medium pl-6">{param.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{param.paramType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{param.description}</TableCell>
                        <TableCell>{param.updatedby}</TableCell>
                        <TableCell>{param.updatedon ? new Date(param.updatedon).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editParameter(param)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attestations Tab */}
        <TabsContent value="attestations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attestations Management</CardTitle>
                <CardDescription>Manage attestations for workflow processes</CardDescription>
              </div>
              <Button onClick={addNewAttestation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Attestation
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Updated On</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Loading attestations...
                      </TableCell>
                    </TableRow>
                  ) : filteredAttestations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No attestations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttestations.map((attestation) => (
                      <TableRow key={attestation.attestationId}>
                        <TableCell className="font-medium pl-6">{attestation.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{attestation.type}</Badge>
                        </TableCell>
                        <TableCell>{attestation.updatedby}</TableCell>
                        <TableCell>{new Date(attestation.updatedon).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editAttestation(attestation)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="email-templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Templates Management</CardTitle>
                <CardDescription>Manage email templates for workflow notifications</CardDescription>
              </div>
              <Button onClick={addNewEmailTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>From Email List</TableHead>
                    <TableHead>HTML</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Loading email templates...
                      </TableCell>
                    </TableRow>
                  ) : filteredEmailTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No email templates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmailTemplates.map((template) => (
                      <TableRow key={template.templateId}>
                        <TableCell className="font-medium pl-6">{template.name}</TableCell>
                        <TableCell className="max-w-md truncate">{template.subject}</TableCell>
                        <TableCell>{template.fromEmailList}</TableCell>
                        <TableCell>
                          <Badge variant={template.ishtml === 'Y' ? 'default' : 'secondary'}>
                            {template.ishtml === 'Y' ? 'HTML' : 'Text'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => previewEmail(template)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editEmailTemplate(template)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Substages Tab - UPDATED LAYOUT */}
        <TabsContent value="substages" className="space-y-4">
          {/* Compact Application and Stage Selection */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="substageApplicationSelect">Application</Label>
                  <Select
                    value={selectedSubstageApplicationId?.toString() || ""}
                    onValueChange={(value) => {
                      setSelectedSubstageApplicationId(value ? parseInt(value) : null);
                      setSelectedStageId(null); // Reset stage selection when application changes
                      setSubstages([]); // Clear substages
                    }}
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
                
                {selectedSubstageApplicationId && (
                  <div className="flex-1">
                    <Label htmlFor="substageStageSelect">Stage</Label>
                    <Select 
                      value={selectedStageId?.toString() || ''} 
                      onValueChange={(value) => {
                        const stageId = value ? Number(value) : null;
                        setSelectedStageId(stageId);
                        setSubstageCurrentPage(1); // Reset pagination when stage changes
                        if (stageId) {
                          fetchSubstages(stageId);
                        } else {
                          setSubstages([]);
                        }
                      }}
                      disabled={isSubstageStagesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isSubstageStagesLoading ? "Loading stages..." : "Select Stage"} />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSubstageStages.map(stage => (
                          <SelectItem key={stage.stageId} value={stage.stageId.toString()}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  <Button 
                    onClick={refreshApplications} 
                    disabled={applicationsLoading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 ${applicationsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    onClick={addNewSubstage} 
                    disabled={!selectedStageId || isSubstageAppInProgress}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Substage
                  </Button>
                </div>
              </div>
              
              {isSubstageAppInProgress && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Application is currently importing data. Substage actions are disabled.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Substages Management */}
          {selectedSubstageApplicationId && selectedStageId && (
            <Card>
              <CardContent className="space-y-4 p-0">
                {!selectedStageId ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Please select a stage to view its substages</p>
                  </div>
                ) : (
                  <>
                    {/* Search Bar for Substages */}
                    <div className="flex items-center gap-4 p-4 border-b">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search substages by name, component, service link, or mappings..."
                          className="pl-8"
                          value={substageSearchTerm}
                          onChange={(e) => {
                            setSubstageSearchTerm(e.target.value);
                            setSubstageCurrentPage(1); // Reset to first page when searching
                          }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {filteredSubstages.length} of {substages.length} substages
                      </div>
                    </div>

                    {/* Pagination at Top */}
                    {totalSubstagePages > 1 && (
                      <div className="pagination-top">
                        <div className="pagination-info">
                          Showing {((substageCurrentPage - 1) * substagesPerPage) + 1} to {Math.min(substageCurrentPage * substagesPerPage, filteredSubstages.length)} of {filteredSubstages.length} results
                        </div>
                        <div className="pagination-wrapper">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious 
                                  onClick={() => setSubstageCurrentPage(Math.max(1, substageCurrentPage - 1))}
                                  className={substageCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                              {Array.from({ length: Math.min(totalSubstagePages, 5) }, (_, i) => {
                                let page;
                                if (totalSubstagePages <= 5) {
                                  page = i + 1;
                                } else if (substageCurrentPage <= 3) {
                                  page = i + 1;
                                } else if (substageCurrentPage >= totalSubstagePages - 2) {
                                  page = totalSubstagePages - 4 + i;
                                } else {
                                  page = substageCurrentPage - 2 + i;
                                }
                                return (
                                  <PaginationItem key={page}>
                                    <PaginationLink
                                      onClick={() => setSubstageCurrentPage(page)}
                                      isActive={page === substageCurrentPage}
                                      className="cursor-pointer"
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              })}
                              <PaginationItem>
                                <PaginationNext 
                                  onClick={() => setSubstageCurrentPage(Math.min(totalSubstagePages, substageCurrentPage + 1))}
                                  className={substageCurrentPage === totalSubstagePages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      </div>
                    )}

                    {/* Substages Table */}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="pl-6">Name</TableHead>
                            <TableHead className="w-[200px]">Component</TableHead>
                            <TableHead>Default Stage</TableHead>
                            <TableHead>Email Template</TableHead>
                            <TableHead>Entitlement</TableHead>
                            <TableHead className="w-[150px]">Service Link</TableHead>
                            <TableHead>Follow Up</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-6">
                                Loading substages...
                              </TableCell>
                            </TableRow>
                          ) : paginatedSubstages.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                {substageSearchTerm ? 'No substages match your search' : 'No substages found for this stage'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedSubstages.map((substage) => {
                              const defaultStageName = currentSubstageStages.find(s => s.stageId === substage.defaultstage)?.name || substage.defaultstage.toString();
                              return (
                                <TableRow key={substage.substageId}>
                                  <TableCell className="font-medium pl-6">
                                    <div className="max-w-[150px]">
                                      <div className="truncate" title={substage.name}>
                                        {substage.name}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    <div className="max-w-[180px]">
                                      <div className="break-all text-wrap" title={substage.componentname}>
                                        {truncateText(substage.componentname, 40)}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{defaultStageName}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {emailTemplates.find(t => t.templateId === substage.templateId)?.name || substage.templateId}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {applicationRoleMappings.find(r => r.roleId === substage.entitlementMapping)?.roleName || 
                                       availableRoles.find(r => r.roleId === substage.entitlementMapping)?.roleName || 
                                       substage.entitlementMapping}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    <div className="max-w-[130px]">
                                      {substage.servicelink ? (
                                        <div className="break-all text-wrap" title={substage.servicelink}>
                                          {truncateText(substage.servicelink, 25)}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={substage.followUp === 'Y' ? 'default' : 'secondary'}>
                                      {substage.followUp === 'Y' ? 'Yes' : 'No'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right pr-6">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editSubstage(substage)}
                                      disabled={isSubstageAppInProgress}
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalSubstagePages > 1 && (
                      <div className="pagination-controls">
                        <div className="pagination-info">
                          Showing {((substageCurrentPage - 1) * substagesPerPage) + 1} to {Math.min(substageCurrentPage * substagesPerPage, filteredSubstages.length)} of {filteredSubstages.length} results
                        </div>
                        <div className="pagination-wrapper">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious 
                                  onClick={() => setSubstageCurrentPage(Math.max(1, substageCurrentPage - 1))}
                                  className={substageCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                              {Array.from({ length: Math.min(totalSubstagePages, 5) }, (_, i) => {
                                let page;
                                if (totalSubstagePages <= 5) {
                                  page = i + 1;
                                } else if (substageCurrentPage <= 3) {
                                  page = i + 1;
                                } else if (substageCurrentPage >= totalSubstagePages - 2) {
                                  page = totalSubstagePages - 4 + i;
                                } else {
                                  page = substageCurrentPage - 2 + i;
                                }
                                return (
                                  <PaginationItem key={page}>
                                    <PaginationLink
                                      onClick={() => setSubstageCurrentPage(page)}
                                      isActive={page === substageCurrentPage}
                                      className="cursor-pointer"
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              })}
                              <PaginationItem>
                                <PaginationNext 
                                  onClick={() => setSubstageCurrentPage(Math.min(totalSubstagePages, substageCurrentPage + 1))}
                                  className={substageCurrentPage === totalSubstagePages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Parameter Dialog */}
      <Dialog open={paramDialogOpen} onOpenChange={setParamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingParam ? 'Edit Parameter' : 'Add New Parameter'}</DialogTitle>
            <DialogDescription>
              {editingParam ? 'Update the parameter details' : 'Create a new system parameter'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="param-name">Name</Label>
              <Input
                id="param-name"
                value={paramForm.name}
                onChange={(e) => setParamForm({ ...paramForm, name: e.target.value })}
                placeholder="Parameter name"
              />
            </div>
            <div>
              <Label htmlFor="param-type">Type</Label>
              <Select value={paramForm.paramType} onValueChange={(value) => setParamForm({ ...paramForm, paramType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="upload">Upload</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="param-description">Description</Label>
              <Textarea
                id="param-description"
                value={paramForm.description}
                onChange={(e) => setParamForm({ ...paramForm, description: e.target.value })}
                placeholder="Parameter description"
              />
            </div>
            <div>
              <Label htmlFor="param-value">Value</Label>
              <Input
                id="param-value"
                value={paramForm.value || ''}
                onChange={(e) => setParamForm({ ...paramForm, value: e.target.value })}
                placeholder="Parameter value (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setParamDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveParameter}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attestation Dialog */}
      <Dialog open={attestationDialogOpen} onOpenChange={setAttestationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAttestation ? 'Edit Attestation' : 'Add New Attestation'}</DialogTitle>
            <DialogDescription>
              {editingAttestation ? 'Update the attestation details' : 'Create a new attestation'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="attestation-name">Name</Label>
              <Input
                id="attestation-name"
                value={attestationForm.name}
                onChange={(e) => setAttestationForm({ ...attestationForm, name: e.target.value })}
                placeholder="Attestation name"
              />
            </div>
            <div>
              <Label htmlFor="attestation-type">Type</Label>
              <Select value={attestationForm.type} onValueChange={(value) => setAttestationForm({ ...attestationForm, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEFAULT">DEFAULT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttestationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAttestation}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Template Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmail ? 'Edit Email Template' : 'Add New Email Template'}</DialogTitle>
            <DialogDescription>
              {editingEmail ? 'Update the email template details' : 'Create a new email template'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-name">Template Name</Label>
              <Input
                id="email-name"
                value={emailForm.name}
                onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                placeholder="Template name"
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="email-from">From Email List</Label>
              <Input
                id="email-from"
                value={emailForm.fromEmailList}
                onChange={(e) => setEmailForm({ ...emailForm, fromEmailList: e.target.value })}
                placeholder="sender@example.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="email-html"
                checked={emailForm.ishtml === 'Y'}
                onCheckedChange={(checked) => setEmailForm({ ...emailForm, ishtml: checked ? 'Y' : 'N' })}
              />
              <Label htmlFor="email-html">HTML Format</Label>
            </div>
            <div>
              <Label htmlFor="email-body">Email Body</Label>
              <Textarea
                id="email-body"
                value={emailForm.emailBody}
                onChange={(e) => setEmailForm({ ...emailForm, emailBody: e.target.value })}
                placeholder="Email content..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEmailTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={emailPreviewOpen} onOpenChange={setEmailPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Preview: {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Preview of the email template as it would appear to recipients
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">From:</Label>
                  <p className="text-sm">{previewTemplate.fromEmailList}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Format:</Label>
                  <Badge variant={previewTemplate.ishtml === 'Y' ? 'default' : 'secondary'}>
                    {previewTemplate.ishtml === 'Y' ? 'HTML' : 'Text'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Subject:</Label>
                  <p className="text-sm font-semibold">{previewTemplate.subject}</p>
                </div>
              </div>
              <div className="border rounded-lg">
                <div className="bg-muted px-4 py-2 border-b">
                  <Label className="text-sm font-medium">Email Body:</Label>
                </div>
                <div className="p-4">
                  {previewTemplate.ishtml === 'Y' ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewTemplate.emailBody }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {previewTemplate.emailBody}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Substage Dialog - FIXED with proper null checks */}
      <Dialog open={substageDialogOpen} onOpenChange={setSubstageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingSubstage ? 'Edit Substage' : 'Add New Substage'}</DialogTitle>
            <DialogDescription>
              {editingSubstage ? 'Update the substage details' : 'Create a new substage'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 pr-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="substage-name">Name *</Label>
                  <Input
                    id="substage-name"
                    value={substageForm.name}
                    onChange={(e) => setSubstageForm({ ...substageForm, name: e.target.value })}
                    placeholder="Substage name"
                  />
                </div>
                <div>
                  <Label htmlFor="substage-component">Component Path *</Label>
                  <Input
                    id="substage-component"
                    value={substageForm.componentname}
                    onChange={(e) => setSubstageForm({ ...substageForm, componentname: e.target.value })}
                    placeholder="/component/path"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              
              {/* Timing & Service */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="substage-duration">Expected Duration</Label>
                  <Input
                    id="substage-duration"
                    value={substageForm.expectedduration || ''}
                    onChange={(e) => setSubstageForm({ ...substageForm, expectedduration: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="substage-time">Expected Time</Label>
                  <Input
                    id="substage-time"
                    value={substageForm.expectedtime || ''}
                    onChange={(e) => setSubstageForm({ ...substageForm, expectedtime: e.target.value })}
                    placeholder="12:00 PM"
                  />
                </div>
                <div>
                  <Label htmlFor="substage-stage">Default Stage *</Label>
                  <Select 
                    value={substageForm.defaultstage.toString()} 
                    onValueChange={(value) => setSubstageForm({ ...substageForm, defaultstage: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentSubstageStages.map(stage => (
                        <SelectItem key={stage.stageId} value={stage.stageId.toString()}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="substage-service">Service Link</Label>
                <Input
                  id="substage-service"
                  value={substageForm.servicelink || ''}
                  onChange={(e) => setSubstageForm({ ...substageForm, servicelink: e.target.value })}
                  placeholder="http://api"
                  className="font-mono text-sm"
                />
              </div>

              {/* Mappings */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="substage-template">Email Template</Label>
                    <Select 
                      value={substageForm.templateId?.toString() || '0'} 
                      onValueChange={(value) => setSubstageForm({ ...substageForm, templateId: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select email template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        {emailTemplates.map(template => (
                          <SelectItem key={template.templateId} value={template.templateId.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="substage-entitlement">Entitlement</Label>
                    <Select 
                      value={substageForm.entitlementMapping?.toString() || '0'} 
                      onValueChange={(value) => setSubstageForm({ ...substageForm, entitlementMapping: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        {applicationRoleMappings.length > 0 ? (
                          // Use application-specific role mappings if available
                          applicationRoleMappings.filter(mapping => mapping.roleId != null).map(mapping => (
                            <SelectItem key={mapping.roleId} value={mapping.roleId.toString()}>
                              {mapping.roleName}
                            </SelectItem>
                          ))
                        ) : (
                          // Fallback to all available roles if no application-specific mappings
                          availableRoles.filter(role => role.roleId != null).map(role => (
                            <SelectItem key={role.roleId} value={role.roleId.toString()}>
                              {role.roleName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Multi-select for Parameters with Search */}
                <div>
                  <Label>Parameters</Label>
                  <div className="border rounded-md">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search parameters..."
                          className="pl-8"
                          value={parameterSearchTerm}
                          onChange={(e) => setParameterSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredParametersForSubstage.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {parameterSearchTerm ? 'No parameters match your search' : 'No parameters available'}
                          </p>
                        ) : (
                          filteredParametersForSubstage.map(param => (
                            <div key={param.paramId} className="flex items-center space-x-2">
                              <Checkbox
                                id={`param-${param.paramId}`}
                                checked={Array.isArray(substageForm.paramMapping) 
                                  ? substageForm.paramMapping.includes(param.paramId!)
                                  : typeof substageForm.paramMapping === 'string' && substageForm.paramMapping
                                    ? substageForm.paramMapping.split(';').includes(param.paramId!.toString())
                                    : false
                                }
                                onCheckedChange={(checked) => {
                                  const currentParams = Array.isArray(substageForm.paramMapping) 
                                    ? substageForm.paramMapping 
                                    : (substageForm.paramMapping && typeof substageForm.paramMapping === 'string')
                                      ? substageForm.paramMapping.split(';').map(id => parseInt(id)).filter(id => !isNaN(id))
                                      : [];
                                  
                                  let newParams;
                                  if (checked) {
                                    newParams = [...currentParams, param.paramId!];
                                  } else {
                                    newParams = currentParams.filter(id => id !== param.paramId);
                                  }
                                  setSubstageForm({ ...substageForm, paramMapping: newParams });
                                }}
                              />
                              <Label htmlFor={`param-${param.paramId}`} className="text-sm flex-1">
                                <span className="font-medium">{param.name}</span>
                                <span className="text-muted-foreground ml-1">({param.paramType})</span>
                                {param.description && (
                                  <div className="text-xs text-muted-foreground mt-1">{param.description}</div>
                                )}
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    {filteredParametersForSubstage.length > 0 && (
                      <div className="px-3 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
                        {Array.isArray(substageForm.paramMapping) ? substageForm.paramMapping.length : 
                         (substageForm.paramMapping ? substageForm.paramMapping.toString().split(';').filter(id => id.trim() !== '').length : 0)} selected
                      </div>
                    )}
                  </div>
                </div>

                {/* Multi-select for Attestations with Search */}
                <div>
                  <Label>Attestations</Label>
                  <div className="border rounded-md">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search attestations..."
                          className="pl-8"
                          value={attestationSearchTerm}
                          onChange={(e) => setAttestationSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredAttestationsForSubstage.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {attestationSearchTerm ? 'No attestations match your search' : 'No attestations available'}
                          </p>
                        ) : (
                          filteredAttestationsForSubstage.map(attestation => (
                            <div key={attestation.attestationId} className="flex items-center space-x-2">
                              <Checkbox
                                id={`attestation-${attestation.attestationId}`}
                                checked={Array.isArray(substageForm.attestationMapping) 
                                  ? substageForm.attestationMapping.includes(attestation.attestationId)
                                  : substageForm.attestationMapping.toString().split(';').includes(attestation.attestationId.toString())
                                }
                                onCheckedChange={(checked) => {
                                  const currentAttestations = Array.isArray(substageForm.attestationMapping) 
                                    ? substageForm.attestationMapping 
                                    : substageForm.attestationMapping.toString().split(';').map(id => parseInt(id)).filter(id => !isNaN(id));
                                  
                                  let newAttestations;
                                  if (checked) {
                                    newAttestations = [...currentAttestations, attestation.attestationId];
                                  } else {
                                    newAttestations = currentAttestations.filter(id => id !== attestation.attestationId);
                                  }
                                  setSubstageForm({ ...substageForm, attestationMapping: newAttestations });
                                }}
                              />
                              <Label htmlFor={`attestation-${attestation.attestationId}`} className="text-sm flex-1">
                                <span className="font-medium">{attestation.name}</span>
                                <span className="text-muted-foreground ml-1">({attestation.type})</span>
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    {filteredAttestationsForSubstage.length > 0 && (
                      <div className="px-3 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
                        {Array.isArray(substageForm.attestationMapping) ? substageForm.attestationMapping.length : 
                         (substageForm.attestationMapping ? substageForm.attestationMapping.toString().split(';').filter(id => id.trim() !== '').length : 0)} selected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="substage-followup"
                    checked={substageForm.followUp === 'Y'}
                    onCheckedChange={(checked) => setSubstageForm({ ...substageForm, followUp: checked ? 'Y' : 'N' })}
                  />
                  <Label htmlFor="substage-followup">Follow Up Required</Label>
                </div>
                <div>
                  <Label htmlFor="substage-email">Send Email at Start</Label>
                  <Select 
                    value={substageForm.sendEmailAtStart || 'N'} 
                    onValueChange={(value) => setSubstageForm({ ...substageForm, sendEmailAtStart: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Y">Yes</SelectItem>
                      <SelectItem value="N">No</SelectItem>
                      <SelectItem value="NA">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubstageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSubstage}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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