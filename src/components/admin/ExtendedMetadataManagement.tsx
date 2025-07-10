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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, Loader2, Lock, Unlock, Settings, Database, Mail, FileText, Layers } from 'lucide-react';
import { useExtendedMetadataManagement } from '@/hooks/useExtendedMetadataManagement';
import { toast } from '@/components/ui/use-toast';

// Form interfaces
interface StageForm {
  stageId?: number;
  name: string;
  description: string;
  updatedby: string;
}

interface ParamForm {
  paramId?: number;
  name: string;
  description: string;
  paramType: string;
  updatedby: string;
  value?: string;
}

interface AttestationForm {
  attestationId?: number;
  name: string;
  type: string;
  updatedby: string;
}

interface EmailTemplateForm {
  templateld?: number;
  name: string;
  emailBody: string;
  ishtml: string;
  subject: string;
  fromEmailList: string;
}

interface SubstageForm {
  substageId?: number;
  name: string;
  componentname: string;
  defaultstage: number;
  attestationMapping: string;
  paramMapping: string;
  templateld: number;
  entitlementMapping: number;
  expectedduration: string;
  expectedtime: string;
  followUp: string;
  sendEmailAtStart: string;
  servicelink: string;
  updatedby: string;
}

const ExtendedMetadataManagement: React.FC = () => {
  // Use the extended hook for data management
  const {
    applications,
    stages,
    inProgressStatus,
    params,
    attestations,
    emailTemplates,
    substages,
    loading,
    applicationsLoading,
    stagesLoading,
    inProgressLoading,
    paramsLoading,
    attestationsLoading,
    emailTemplatesLoading,
    substagesLoading,
    error,
    applicationsError,
    stagesError,
    inProgressError,
    paramsError,
    attestationsError,
    emailTemplatesError,
    substagesError,
    refreshApplications,
    refreshStages,
    checkInProgress,
    createStage,
    updateStage,
    refreshParams,
    createParam,
    updateParam,
    refreshAttestations,
    createAttestation,
    updateAttestation,
    refreshEmailTemplates,
    createEmailTemplate,
    updateEmailTemplate,
    refreshSubstages,
    createSubstage,
    updateSubstage,
    refreshAll
  } = useExtendedMetadataManagement();

  // Local state for UI
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('stages');
  
  // Dialog states
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [paramDialogOpen, setParamDialogOpen] = useState(false);
  const [attestationDialogOpen, setAttestationDialogOpen] = useState(false);
  const [emailTemplateDialogOpen, setEmailTemplateDialogOpen] = useState(false);
  const [substageDialogOpen, setSubstageDialogOpen] = useState(false);
  
  // Selected items for editing
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [selectedParam, setSelectedParam] = useState<any>(null);
  const [selectedAttestation, setSelectedAttestation] = useState<any>(null);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<any>(null);
  const [selectedSubstage, setSelectedSubstage] = useState<any>(null);

  // Form states
  const [stageForm, setStageForm] = useState<StageForm>({
    name: '',
    description: '',
    updatedby: 'system'
  });

  const [paramForm, setParamForm] = useState<ParamForm>({
    name: '',
    description: '',
    paramType: 'DEFAULT',
    updatedby: 'system'
  });

  const [attestationForm, setAttestationForm] = useState<AttestationForm>({
    name: '',
    type: 'DEFAULT',
    updatedby: 'system'
  });

  const [emailTemplateForm, setEmailTemplateForm] = useState<EmailTemplateForm>({
    name: '',
    emailBody: '',
    ishtml: 'Y',
    subject: '',
    fromEmailList: ''
  });

  const [substageForm, setSubstageForm] = useState<SubstageForm>({
    name: '',
    componentname: '',
    defaultstage: 0,
    attestationMapping: '',
    paramMapping: '',
    templateld: 0,
    entitlementMapping: 0,
    expectedduration: '',
    expectedtime: '',
    followUp: 'N',
    sendEmailAtStart: 'N',
    servicelink: '',
    updatedby: 'system'
  });

  // Load stages and in-progress status when application is selected
  useEffect(() => {
    if (selectedApplicationId) {
      refreshStages(selectedApplicationId);
      checkInProgress(selectedApplicationId);
    }
  }, [selectedApplicationId, refreshStages, checkInProgress]);

  // Load substages when stage is selected
  useEffect(() => {
    if (selectedStageId) {
      refreshSubstages(selectedStageId);
    }
  }, [selectedStageId, refreshSubstages]);

  // Reset forms when dialogs open/close
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

  useEffect(() => {
    if (paramDialogOpen && selectedParam) {
      setParamForm({
        paramId: selectedParam.paramId,
        name: selectedParam.name,
        description: selectedParam.description,
        paramType: selectedParam.paramType,
        updatedby: selectedParam.updatedby || 'system',
        value: selectedParam.value
      });
    } else if (paramDialogOpen) {
      setParamForm({
        name: '',
        description: '',
        paramType: 'DEFAULT',
        updatedby: 'system'
      });
    }
  }, [paramDialogOpen, selectedParam]);

  useEffect(() => {
    if (attestationDialogOpen && selectedAttestation) {
      setAttestationForm({
        attestationId: selectedAttestation.attestationId,
        name: selectedAttestation.name,
        type: selectedAttestation.type,
        updatedby: selectedAttestation.updatedby || 'system'
      });
    } else if (attestationDialogOpen) {
      setAttestationForm({
        name: '',
        type: 'DEFAULT',
        updatedby: 'system'
      });
    }
  }, [attestationDialogOpen, selectedAttestation]);

  useEffect(() => {
    if (emailTemplateDialogOpen && selectedEmailTemplate) {
      setEmailTemplateForm({
        templateld: selectedEmailTemplate.templateld,
        name: selectedEmailTemplate.name,
        emailBody: selectedEmailTemplate.emailBody,
        ishtml: selectedEmailTemplate.ishtml,
        subject: selectedEmailTemplate.subject,
        fromEmailList: selectedEmailTemplate.fromEmailList
      });
    } else if (emailTemplateDialogOpen) {
      setEmailTemplateForm({
        name: '',
        emailBody: '',
        ishtml: 'Y',
        subject: '',
        fromEmailList: ''
      });
    }
  }, [emailTemplateDialogOpen, selectedEmailTemplate]);

  useEffect(() => {
    if (substageDialogOpen && selectedSubstage) {
      setSubstageForm({
        substageId: selectedSubstage.substageId,
        name: selectedSubstage.name,
        componentname: selectedSubstage.componentname,
        defaultstage: selectedSubstage.defaultstage,
        attestationMapping: selectedSubstage.attestationMapping,
        paramMapping: selectedSubstage.paramMapping,
        templateld: selectedSubstage.templateld,
        entitlementMapping: selectedSubstage.entitlementMapping,
        expectedduration: selectedSubstage.expectedduration || '',
        expectedtime: selectedSubstage.expectedtime || '',
        followUp: selectedSubstage.followUp,
        sendEmailAtStart: selectedSubstage.sendEmailAtStart || 'N',
        servicelink: selectedSubstage.servicelink || '',
        updatedby: selectedSubstage.updatedby || 'system'
      });
    } else if (substageDialogOpen) {
      setSubstageForm({
        name: '',
        componentname: '',
        defaultstage: selectedStageId || 0,
        attestationMapping: '',
        paramMapping: '',
        templateld: 0,
        entitlementMapping: 0,
        expectedduration: '',
        expectedtime: '',
        followUp: 'N',
        sendEmailAtStart: 'N',
        servicelink: '',
        updatedby: 'system'
      });
    }
  }, [substageDialogOpen, selectedSubstage, selectedStageId]);

  // Form handlers
  const handleStageFormChange = (field: keyof StageForm, value: any) => {
    setStageForm(prev => ({ ...prev, [field]: value }));
  };

  const handleParamFormChange = (field: keyof ParamForm, value: any) => {
    setParamForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAttestationFormChange = (field: keyof AttestationForm, value: any) => {
    setAttestationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailTemplateFormChange = (field: keyof EmailTemplateForm, value: any) => {
    setEmailTemplateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubstageFormChange = (field: keyof SubstageForm, value: any) => {
    setSubstageForm(prev => ({ ...prev, [field]: value }));
  };

  // Save handlers
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

  const handleSaveParam = async () => {
    if (!paramForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Parameter name is required",
        variant: "destructive"
      });
      return;
    }

    let success = false;

    if (paramForm.paramId) {
      // Update existing parameter
      success = await updateParam(paramForm.paramId, {
        paramId: paramForm.paramId,
        name: paramForm.name,
        description: paramForm.description,
        paramType: paramForm.paramType,
        updatedby: paramForm.updatedby,
        updatedon: null,
        value: paramForm.value
      });
    } else {
      // Create new parameter
      success = await createParam({
        paramId: null,
        name: paramForm.name,
        description: paramForm.description,
        paramType: paramForm.paramType,
        updatedby: paramForm.updatedby,
        updatedon: null,
        value: null
      });
    }

    if (success) {
      setParamDialogOpen(false);
      setSelectedParam(null);
    }
  };

  const handleSaveAttestation = async () => {
    if (!attestationForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Attestation name is required",
        variant: "destructive"
      });
      return;
    }

    let success = false;

    if (attestationForm.attestationId) {
      // Update existing attestation
      success = await updateAttestation(attestationForm.attestationId, {
        attestationId: attestationForm.attestationId,
        name: attestationForm.name,
        type: attestationForm.type,
        updatedby: attestationForm.updatedby,
        updatedon: null
      });
    } else {
      // Create new attestation
      success = await createAttestation({
        attestationId: null,
        name: attestationForm.name,
        type: attestationForm.type,
        updatedby: attestationForm.updatedby,
        updatedon: null
      });
    }

    if (success) {
      setAttestationDialogOpen(false);
      setSelectedAttestation(null);
    }
  };

  const handleSaveEmailTemplate = async () => {
    if (!emailTemplateForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    let success = false;

    if (emailTemplateForm.templateld) {
      // Update existing template
      success = await updateEmailTemplate(emailTemplateForm.templateld, {
        templateld: emailTemplateForm.templateld,
        name: emailTemplateForm.name,
        emailBody: emailTemplateForm.emailBody,
        ishtml: emailTemplateForm.ishtml,
        subject: emailTemplateForm.subject,
        fromEmailList: emailTemplateForm.fromEmailList
      });
    } else {
      // Create new template
      success = await createEmailTemplate({
        templateld: null,
        name: emailTemplateForm.name,
        emailBody: emailTemplateForm.emailBody,
        ishtml: emailTemplateForm.ishtml,
        subject: emailTemplateForm.subject,
        fromEmailList: emailTemplateForm.fromEmailList
      });
    }

    if (success) {
      setEmailTemplateDialogOpen(false);
      setSelectedEmailTemplate(null);
    }
  };

  const handleSaveSubstage = async () => {
    if (!substageForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Substage name is required",
        variant: "destructive"
      });
      return;
    }

    if (!selectedStageId) {
      toast({
        title: "Validation Error",
        description: "Please select a stage first",
        variant: "destructive"
      });
      return;
    }

    let success = false;

    if (substageForm.substageId) {
      // Update existing substage
      success = await updateSubstage(substageForm.substageId, {
        substageId: substageForm.substageId,
        name: substageForm.name,
        componentname: substageForm.componentname,
        defaultstage: substageForm.defaultstage,
        attestationMapping: substageForm.attestationMapping,
        paramMapping: substageForm.paramMapping,
        templateld: substageForm.templateld,
        entitlementMapping: substageForm.entitlementMapping,
        expectedduration: substageForm.expectedduration,
        expectedtime: substageForm.expectedtime,
        followUp: substageForm.followUp,
        sendEmailAtStart: substageForm.sendEmailAtStart,
        servicelink: substageForm.servicelink,
        substageAttestations: [],
        updatedby: substageForm.updatedby,
        updatedon: new Date().toISOString()
      });
    } else {
      // Create new substage
      success = await createSubstage({
        substageId: null,
        name: substageForm.name,
        componentname: substageForm.componentname,
        defaultstage: substageForm.defaultstage,
        attestationMapping: substageForm.attestationMapping,
        paramMapping: substageForm.paramMapping,
        templateld: substageForm.templateld,
        entitlementMapping: substageForm.entitlementMapping,
        expectedduration: substageForm.expectedduration,
        expectedtime: substageForm.expectedtime,
        followUp: substageForm.followUp,
        sendEmailAtStart: substageForm.sendEmailAtStart,
        servicelink: substageForm.servicelink,
        substageAttestations: [],
        updatedby: substageForm.updatedby,
        updatedon: new Date().toISOString()
      });
    }

    if (success) {
      setSubstageDialogOpen(false);
      setSelectedSubstage(null);
    }
  };

  // Get current application data
  const currentApplication = selectedApplicationId 
    ? applications.find(app => app.appId === selectedApplicationId)
    : null;

  const currentStages = selectedApplicationId ? stages[selectedApplicationId] || [] : [];
  const currentSubstages = selectedStageId ? substages[selectedStageId] || [] : [];
  const isApplicationInProgress = selectedApplicationId ? inProgressStatus[selectedApplicationId] || false : false;
  const isStagesLoading = selectedApplicationId ? stagesLoading[selectedApplicationId] || false : false;
  const isSubstagesLoading = selectedStageId ? substagesLoading[selectedStageId] || false : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Extended Metadata Management</h2>
          <p className="text-muted-foreground">
            Manage workflow applications, stages, parameters, attestations, email templates, and substages
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
          <CardDescription>Choose an application to manage its metadata</CardDescription>
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

      {/* Tabs for different metadata types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stages" className="flex items-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>Stages</span>
          </TabsTrigger>
          <TabsTrigger value="parameters" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Parameters</span>
          </TabsTrigger>
          <TabsTrigger value="attestations" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Attestations</span>
          </TabsTrigger>
          <TabsTrigger value="email-templates" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email Templates</span>
          </TabsTrigger>
          <TabsTrigger value="substages" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Substages</span>
          </TabsTrigger>
        </TabsList>

        {/* Stages Tab */}
        <TabsContent value="stages" className="space-y-4">
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
                        <TableRow 
                          key={stage.stageId}
                          className={selectedStageId === stage.stageId ? "bg-muted" : ""}
                        >
                          <TableCell className="font-medium">{stage.stageId}</TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              className="p-0 h-auto font-normal"
                              onClick={() => setSelectedStageId(stage.stageId)}
                            >
                              {stage.name}
                            </Button>
                          </TableCell>
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
                <CardTitle>Parameters</CardTitle>
                <CardDescription>Manage global workflow parameters</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={refreshParams} 
                  disabled={paramsLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 ${paramsLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Dialog open={paramDialogOpen} onOpenChange={setParamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedParam(null)}>
                      <Plus className="mr-2 h-4 w-4" /> 
                      Add Parameter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{selectedParam ? 'Edit Parameter' : 'Add New Parameter'}</DialogTitle>
                      <DialogDescription>
                        {selectedParam ? 'Update the parameter details' : 'Enter the details for the new parameter'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paramName" className="text-right">Name</Label>
                        <Input 
                          id="paramName" 
                          className="col-span-3" 
                          placeholder="Parameter name" 
                          value={paramForm.name}
                          onChange={(e) => handleParamFormChange('name', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paramDescription" className="text-right">Description</Label>
                        <Textarea 
                          id="paramDescription" 
                          className="col-span-3" 
                          placeholder="Parameter description" 
                          value={paramForm.description}
                          onChange={(e) => handleParamFormChange('description', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paramType" className="text-right">Type</Label>
                        <Select
                          value={paramForm.paramType}
                          onValueChange={(value) => handleParamFormChange('paramType', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DEFAULT">DEFAULT</SelectItem>
                            <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                            <SelectItem value="USER">USER</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paramValue" className="text-right">Value</Label>
                        <Input 
                          id="paramValue" 
                          className="col-span-3" 
                          placeholder="Parameter value (optional)" 
                          value={paramForm.value || ''}
                          onChange={(e) => handleParamFormChange('value', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paramUpdatedBy" className="text-right">Updated By</Label>
                        <Input 
                          id="paramUpdatedBy" 
                          className="col-span-3" 
                          placeholder="Username" 
                          value={paramForm.updatedby}
                          onChange={(e) => handleParamFormChange('updatedby', e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setParamDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveParam} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {paramsError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{paramsError}</span>
                  </div>
                </div>
              )}

              {paramsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading parameters...</span>
                </div>
              ) : params.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Parameters Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the 'Add Parameter' button to create your first parameter.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Updated On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {params.map((param) => (
                      <TableRow key={param.paramId}>
                        <TableCell className="font-medium">{param.paramId}</TableCell>
                        <TableCell>{param.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{param.paramType}</Badge>
                        </TableCell>
                        <TableCell>{param.description}</TableCell>
                        <TableCell>{param.value || '-'}</TableCell>
                        <TableCell>{param.updatedby}</TableCell>
                        <TableCell>{param.updatedon}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedParam(param);
                                setParamDialogOpen(true);
                              }}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
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
        <TabsContent value="attestations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attestations</CardTitle>
                <CardDescription>Manage workflow attestations</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={refreshAttestations} 
                  disabled={attestationsLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 ${attestationsLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Dialog open={attestationDialogOpen} onOpenChange={setAttestationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedAttestation(null)}>
                      <Plus className="mr-2 h-4 w-4" /> 
                      Add Attestation
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
                        <Label htmlFor="attestationType" className="text-right">Type</Label>
                        <Select
                          value={attestationForm.type}
                          onValueChange={(value) => handleAttestationFormChange('type', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DEFAULT">DEFAULT</SelectItem>
                            <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="attestationUpdatedBy" className="text-right">Updated By</Label>
                        <Input 
                          id="attestationUpdatedBy" 
                          className="col-span-3" 
                          placeholder="Username" 
                          value={attestationForm.updatedby}
                          onChange={(e) => handleAttestationFormChange('updatedby', e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAttestationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveAttestation} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {attestationsError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{attestationsError}</span>
                  </div>
                </div>
              )}

              {attestationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading attestations...</span>
                </div>
              ) : attestations.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Attestations Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the 'Add Attestation' button to create your first attestation.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attestation ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Updated On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attestations.map((attestation) => (
                      <TableRow key={attestation.attestationId}>
                        <TableCell className="font-medium">{attestation.attestationId}</TableCell>
                        <TableCell>{attestation.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{attestation.type}</Badge>
                        </TableCell>
                        <TableCell>{attestation.updatedby}</TableCell>
                        <TableCell>{attestation.updatedon}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedAttestation(attestation);
                                setAttestationDialogOpen(true);
                              }}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
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
        <TabsContent value="email-templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage workflow email templates</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={refreshEmailTemplates} 
                  disabled={emailTemplatesLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 ${emailTemplatesLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Dialog open={emailTemplateDialogOpen} onOpenChange={setEmailTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedEmailTemplate(null)}>
                      <Plus className="mr-2 h-4 w-4" /> 
                      Add Email Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
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
                        <Label htmlFor="templateSubject" className="text-right">Subject</Label>
                        <Input 
                          id="templateSubject" 
                          className="col-span-3" 
                          placeholder="Email subject" 
                          value={emailTemplateForm.subject}
                          onChange={(e) => handleEmailTemplateFormChange('subject', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="templateFrom" className="text-right">From Email</Label>
                        <Input 
                          id="templateFrom" 
                          className="col-span-3" 
                          placeholder="from@example.com" 
                          value={emailTemplateForm.fromEmailList}
                          onChange={(e) => handleEmailTemplateFormChange('fromEmailList', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="templateIsHtml" className="text-right">Is HTML</Label>
                        <Select
                          value={emailTemplateForm.ishtml}
                          onValueChange={(value) => handleEmailTemplateFormChange('ishtml', value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Yes</SelectItem>
                            <SelectItem value="N">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="templateBody" className="text-right mt-2">Email Body</Label>
                        <Textarea 
                          id="templateBody" 
                          className="col-span-3 min-h-[200px]" 
                          placeholder="Email body content" 
                          value={emailTemplateForm.emailBody}
                          onChange={(e) => handleEmailTemplateFormChange('emailBody', e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEmailTemplateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEmailTemplate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {emailTemplatesError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{emailTemplatesError}</span>
                  </div>
                </div>
              )}

              {emailTemplatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading email templates...</span>
                </div>
              ) : emailTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No Email Templates Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the 'Add Email Template' button to create your first email template.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>From Email</TableHead>
                      <TableHead>Is HTML</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailTemplates.map((template) => (
                      <TableRow key={template.templateld}>
                        <TableCell className="font-medium">{template.templateld}</TableCell>
                        <TableCell>{template.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                        <TableCell>{template.fromEmailList}</TableCell>
                        <TableCell>
                          <Badge variant={template.ishtml === 'Y' ? 'default' : 'secondary'}>
                            {template.ishtml === 'Y' ? 'HTML' : 'Text'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedEmailTemplate(template);
                                setEmailTemplateDialogOpen(true);
                              }}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
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

        {/* Substages Tab */}
        <TabsContent value="substages" className="space-y-4">
          {selectedStageId && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Substages for Stage {selectedStageId}</CardTitle>
                  <CardDescription>
                    Manage substages for the selected stage
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => refreshSubstages(selectedStageId)} 
                    disabled={isSubstagesLoading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSubstagesLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Dialog open={substageDialogOpen} onOpenChange={setSubstageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedSubstage(null)}>
                        <Plus className="mr-2 h-4 w-4" /> 
                        Add Substage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{selectedSubstage ? 'Edit Substage' : 'Add New Substage'}</DialogTitle>
                        <DialogDescription>
                          {selectedSubstage ? 'Update the substage details' : 'Enter the details for the new substage'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageName" className="text-right">Name</Label>
                          <Input 
                            id="substageName" 
                            className="col-span-3" 
                            placeholder="Substage name" 
                            value={substageForm.name}
                            onChange={(e) => handleSubstageFormChange('name', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageComponent" className="text-right">Component</Label>
                          <Input 
                            id="substageComponent" 
                            className="col-span-3" 
                            placeholder="Component name" 
                            value={substageForm.componentname}
                            onChange={(e) => handleSubstageFormChange('componentname', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageAttestations" className="text-right">Attestations</Label>
                          <Input 
                            id="substageAttestations" 
                            className="col-span-3" 
                            placeholder="Attestation IDs (semicolon separated)" 
                            value={substageForm.attestationMapping}
                            onChange={(e) => handleSubstageFormChange('attestationMapping', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageParams" className="text-right">Parameters</Label>
                          <Input 
                            id="substageParams" 
                            className="col-span-3" 
                            placeholder="Parameter IDs (semicolon separated)" 
                            value={substageForm.paramMapping}
                            onChange={(e) => handleSubstageFormChange('paramMapping', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageTemplate" className="text-right">Email Template ID</Label>
                          <Input 
                            id="substageTemplate" 
                            className="col-span-3" 
                            placeholder="Email template ID" 
                            type="number"
                            value={substageForm.templateld}
                            onChange={(e) => handleSubstageFormChange('templateld', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageEntitlement" className="text-right">Entitlement ID</Label>
                          <Input 
                            id="substageEntitlement" 
                            className="col-span-3" 
                            placeholder="Entitlement mapping ID" 
                            type="number"
                            value={substageForm.entitlementMapping}
                            onChange={(e) => handleSubstageFormChange('entitlementMapping', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageDuration" className="text-right">Expected Duration</Label>
                          <Input 
                            id="substageDuration" 
                            className="col-span-3" 
                            placeholder="Duration in minutes" 
                            value={substageForm.expectedduration}
                            onChange={(e) => handleSubstageFormChange('expectedduration', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageTime" className="text-right">Expected Time</Label>
                          <Input 
                            id="substageTime" 
                            className="col-span-3" 
                            placeholder="Expected time (e.g., 12:00 PM)" 
                            value={substageForm.expectedtime}
                            onChange={(e) => handleSubstageFormChange('expectedtime', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageFollowUp" className="text-right">Follow Up</Label>
                          <Select
                            value={substageForm.followUp}
                            onValueChange={(value) => handleSubstageFormChange('followUp', value)}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Y">Yes</SelectItem>
                              <SelectItem value="N">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageEmailStart" className="text-right">Send Email at Start</Label>
                          <Select
                            value={substageForm.sendEmailAtStart}
                            onValueChange={(value) => handleSubstageFormChange('sendEmailAtStart', value)}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Y">Yes</SelectItem>
                              <SelectItem value="N">No</SelectItem>
                              <SelectItem value="NA">Not Applicable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageServiceLink" className="text-right">Service Link</Label>
                          <Input 
                            id="substageServiceLink" 
                            className="col-span-3" 
                            placeholder="Service URL" 
                            value={substageForm.servicelink}
                            onChange={(e) => handleSubstageFormChange('servicelink', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="substageUpdatedBy" className="text-right">Updated By</Label>
                          <Input 
                            id="substageUpdatedBy" 
                            className="col-span-3" 
                            placeholder="Username" 
                            value={substageForm.updatedby}
                            onChange={(e) => handleSubstageFormChange('updatedby', e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSubstageDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSubstage} disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {substagesError[selectedStageId] && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">{substagesError[selectedStageId]}</span>
                    </div>
                  </div>
                )}

                {isSubstagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading substages...</span>
                  </div>
                ) : currentSubstages.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-semibold">No Substages Found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the 'Add Substage' button to create your first substage for this stage.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Substage ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Component</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Follow Up</TableHead>
                        <TableHead>Updated By</TableHead>
                        <TableHead>Updated On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSubstages.map((substage) => (
                        <TableRow key={substage.substageId}>
                          <TableCell className="font-medium">{substage.substageId}</TableCell>
                          <TableCell>{substage.name}</TableCell>
                          <TableCell>{substage.componentname}</TableCell>
                          <TableCell>{substage.expectedduration || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={substage.followUp === 'Y' ? 'default' : 'secondary'}>
                              {substage.followUp === 'Y' ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>{substage.updatedby}</TableCell>
                          <TableCell>{substage.updatedon}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedSubstage(substage);
                                  setSubstageDialogOpen(true);
                                }}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4" />
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

          {!selectedStageId && (
            <Card>
              <CardContent className="text-center py-8">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">Select a Stage</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please select a stage from the Stages tab to manage its substages.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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

export default ExtendedMetadataManagement;