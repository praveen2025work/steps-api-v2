import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Edit, Trash2, Save, X, Database, Mail, Settings, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useApiEnvironment } from '@/contexts/ApiEnvironmentContext';

// Types
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
  templateld: number;
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
  attestationMapping: string;
  paramMapping: string;
  templateld: number;
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

interface Stage {
  stageId: number;
  name: string;
}

const ExtendedMetadataManagement: React.FC = () => {
  const { currentEnvironment } = useApiEnvironment();
  const [activeTab, setActiveTab] = useState('parameters');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Parameters state
  const [parameters, setParameters] = useState<Param[]>([]);
  const [paramDialogOpen, setParamDialogOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<Param | null>(null);
  const [paramForm, setParamForm] = useState<Param>({
    paramId: null,
    name: '',
    paramType: 'DEFAULT',
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
  const [emailForm, setEmailForm] = useState<EmailTemplate>({
    templateld: 0,
    name: '',
    emailBody: '',
    ishtml: 'Y',
    subject: '',
    fromEmailList: ''
  });

  // Substages state
  const [substages, setSubstages] = useState<Substage[]>([]);
  const [substageDialogOpen, setSubstageDialogOpen] = useState(false);
  const [editingSubstage, setEditingSubstage] = useState<Substage | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [substageForm, setSubstageForm] = useState<Substage>({
    substageId: null,
    name: '',
    componentname: '',
    defaultstage: 0,
    attestationMapping: '',
    paramMapping: '',
    templateld: 0,
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
    return currentEnvironment?.javaBaseUrl || 'http://api-workflow.com';
  };

  // API calls
  const fetchParameters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getJavaBaseUrl()}/api/param`);
      if (response.ok) {
        const data = await response.json();
        setParameters(data);
      } else {
        throw new Error('Failed to fetch parameters');
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parameters",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttestations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getJavaBaseUrl()}/api/attest?type=DEFAULT`);
      if (response.ok) {
        const data = await response.json();
        setAttestations(data);
      } else {
        throw new Error('Failed to fetch attestations');
      }
    } catch (error) {
      console.error('Error fetching attestations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attestations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getJavaBaseUrl()}/api/email`);
      if (response.ok) {
        const data = await response.json();
        setEmailTemplates(data);
      } else {
        throw new Error('Failed to fetch email templates');
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubstages = async (stageId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${getJavaBaseUrl()}/api/substage?stageId=${stageId}`);
      if (response.ok) {
        const data = await response.json();
        setSubstages(data);
      } else {
        throw new Error('Failed to fetch substages');
      }
    } catch (error) {
      console.error('Error fetching substages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch substages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (activeTab === 'parameters') {
      fetchParameters();
    } else if (activeTab === 'attestations') {
      fetchAttestations();
    } else if (activeTab === 'email-templates') {
      fetchEmailTemplates();
    } else if (activeTab === 'substages') {
      // Load sample stages for demo
      setStages([
        { stageId: 814, name: 'Initial Review' },
        { stageId: 815, name: 'Approval Process' },
        { stageId: 816, name: 'Final Validation' }
      ]);
    }
  }, [activeTab, currentEnvironment]);

  // Load substages when stage is selected
  useEffect(() => {
    if (selectedStageId) {
      fetchSubstages(selectedStageId);
    }
  }, [selectedStageId]);

  // Save functions
  const saveParameter = async () => {
    try {
      const method = editingParam ? 'PUT' : 'POST';
      const url = editingParam 
        ? `${getJavaBaseUrl()}/api/param/${editingParam.paramId}`
        : `${getJavaBaseUrl()}/api/param`;

      const response = await fetch(url, {
        method,
        headers: {
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
        throw new Error('Failed to save parameter');
      }
    } catch (error) {
      console.error('Error saving parameter:', error);
      toast({
        title: "Error",
        description: "Failed to save parameter",
        variant: "destructive"
      });
    }
  };

  const saveAttestation = async () => {
    try {
      const method = editingAttestation ? 'PUT' : 'POST';
      const url = editingAttestation 
        ? `${getJavaBaseUrl()}/api/attest/${editingAttestation.attestationId}`
        : `${getJavaBaseUrl()}/api/attest/`;

      const response = await fetch(url, {
        method,
        headers: {
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
        throw new Error('Failed to save attestation');
      }
    } catch (error) {
      console.error('Error saving attestation:', error);
      toast({
        title: "Error",
        description: "Failed to save attestation",
        variant: "destructive"
      });
    }
  };

  const saveEmailTemplate = async () => {
    try {
      const method = editingEmail ? 'PUT' : 'POST';
      const url = editingEmail 
        ? `${getJavaBaseUrl()}/api/email/${editingEmail.templateld}`
        : `${getJavaBaseUrl()}/api/email/`;

      const response = await fetch(url, {
        method,
        headers: {
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
        throw new Error('Failed to save email template');
      }
    } catch (error) {
      console.error('Error saving email template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive"
      });
    }
  };

  const saveSubstage = async () => {
    try {
      const method = editingSubstage ? 'PUT' : 'POST';
      const baseUrl = editingSubstage 
        ? `${getJavaBaseUrl()}/api/substage/${editingSubstage.substageId}`
        : `${getJavaBaseUrl()}/api/substage`;
      
      const url = `${baseUrl}?forceStartDesc=force%20start&reRunDesc=rerun`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(substageForm)
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
        throw new Error('Failed to save substage');
      }
    } catch (error) {
      console.error('Error saving substage:', error);
      toast({
        title: "Error",
        description: "Failed to save substage",
        variant: "destructive"
      });
    }
  };

  // Filter functions
  const filteredParameters = parameters.filter(param =>
    param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    param.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttestations = attestations.filter(attestation =>
    attestation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmailTemplates = emailTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubstages = substages.filter(substage =>
    substage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    substage.componentname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Edit functions
  const editParameter = (param: Param) => {
    setEditingParam(param);
    setParamForm(param);
    setParamDialogOpen(true);
  };

  const editAttestation = (attestation: Attestation) => {
    setEditingAttestation(attestation);
    setAttestationForm(attestation);
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

  // Add new functions
  const addNewParameter = () => {
    setEditingParam(null);
    setParamForm({
      paramId: null,
      name: '',
      paramType: 'DEFAULT',
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
      templateld: 0,
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
      attestationMapping: '',
      paramMapping: '',
      templateld: 0,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Extended Metadata Management</h2>
          <p className="text-muted-foreground">
            Manage parameters, attestations, email templates, and substages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
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
            <Database className="h-4 w-4" />
            Substages
          </TabsTrigger>
        </TabsList>

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
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Updated On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="font-medium">{param.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{param.paramType}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{param.description}</TableCell>
                          <TableCell>{param.updatedby}</TableCell>
                          <TableCell>{param.updatedon ? new Date(param.updatedon).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="text-right">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attestations Tab */}
        <TabsContent value="attestations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attestations Management</CardTitle>
                <CardDescription>Manage default attestations for workflow processes</CardDescription>
              </div>
              <Button onClick={addNewAttestation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Attestation
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Updated On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="font-medium">{attestation.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{attestation.type}</Badge>
                          </TableCell>
                          <TableCell>{attestation.updatedby}</TableCell>
                          <TableCell>{new Date(attestation.updatedon).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
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
              </div>
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
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>From Email</TableHead>
                      <TableHead>HTML</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableRow key={template.templateld}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell className="max-w-md truncate">{template.subject}</TableCell>
                          <TableCell>{template.fromEmailList}</TableCell>
                          <TableCell>
                            <Badge variant={template.ishtml === 'Y' ? 'default' : 'secondary'}>
                              {template.ishtml === 'Y' ? 'HTML' : 'Text'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editEmailTemplate(template)}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Substages Tab */}
        <TabsContent value="substages" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Substages Management</CardTitle>
                <CardDescription>Manage substages for workflow stages</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedStageId?.toString() || ''} onValueChange={(value) => setSelectedStageId(Number(value))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.stageId} value={stage.stageId.toString()}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addNewSubstage} disabled={!selectedStageId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Substage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedStageId ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Please select a stage to view its substages</p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Component</TableHead>
                        <TableHead>Follow Up</TableHead>
                        <TableHead>Email at Start</TableHead>
                        <TableHead>Updated By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            Loading substages...
                          </TableCell>
                        </TableRow>
                      ) : filteredSubstages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No substages found for this stage
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSubstages.map((substage) => (
                          <TableRow key={substage.substageId}>
                            <TableCell className="font-medium">{substage.name}</TableCell>
                            <TableCell>{substage.componentname}</TableCell>
                            <TableCell>
                              <Badge variant={substage.followUp === 'Y' ? 'default' : 'secondary'}>
                                {substage.followUp === 'Y' ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={substage.sendEmailAtStart === 'Y' ? 'default' : 'secondary'}>
                                {substage.sendEmailAtStart === 'Y' ? 'Yes' : substage.sendEmailAtStart === 'N' ? 'No' : 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>{substage.updatedby}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editSubstage(substage)}
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
                </div>
              )}
            </CardContent>
          </Card>
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEFAULT">DEFAULT</SelectItem>
                  <SelectItem value="CUSTOM">CUSTOM</SelectItem>
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEFAULT">DEFAULT</SelectItem>
                  <SelectItem value="CUSTOM">CUSTOM</SelectItem>
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
              <Label htmlFor="email-from">From Email</Label>
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

      {/* Substage Dialog */}
      <Dialog open={substageDialogOpen} onOpenChange={setSubstageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingSubstage ? 'Edit Substage' : 'Add New Substage'}</DialogTitle>
            <DialogDescription>
              {editingSubstage ? 'Update the substage details' : 'Create a new substage'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="substage-name">Name</Label>
                  <Input
                    id="substage-name"
                    value={substageForm.name}
                    onChange={(e) => setSubstageForm({ ...substageForm, name: e.target.value })}
                    placeholder="Substage name"
                  />
                </div>
                <div>
                  <Label htmlFor="substage-component">Component Name</Label>
                  <Input
                    id="substage-component"
                    value={substageForm.componentname}
                    onChange={(e) => setSubstageForm({ ...substageForm, componentname: e.target.value })}
                    placeholder="/component/path"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <Label htmlFor="substage-service">Service Link</Label>
                <Input
                  id="substage-service"
                  value={substageForm.servicelink || ''}
                  onChange={(e) => setSubstageForm({ ...substageForm, servicelink: e.target.value })}
                  placeholder="http://api"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="substage-template">Template ID</Label>
                  <Input
                    id="substage-template"
                    type="number"
                    value={substageForm.templateld}
                    onChange={(e) => setSubstageForm({ ...substageForm, templateld: Number(e.target.value) })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="substage-entitlement">Entitlement Mapping</Label>
                  <Input
                    id="substage-entitlement"
                    type="number"
                    value={substageForm.entitlementMapping}
                    onChange={(e) => setSubstageForm({ ...substageForm, entitlementMapping: Number(e.target.value) })}
                    placeholder="21"
                  />
                </div>
                <div>
                  <Label htmlFor="substage-stage">Default Stage</Label>
                  <Input
                    id="substage-stage"
                    type="number"
                    value={substageForm.defaultstage}
                    onChange={(e) => setSubstageForm({ ...substageForm, defaultstage: Number(e.target.value) })}
                    placeholder="814"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="substage-attestations">Attestation Mapping</Label>
                <Input
                  id="substage-attestations"
                  value={substageForm.attestationMapping}
                  onChange={(e) => setSubstageForm({ ...substageForm, attestationMapping: e.target.value })}
                  placeholder="6649;6650; (semicolon-separated IDs)"
                />
              </div>

              <div>
                <Label htmlFor="substage-params">Parameter Mapping</Label>
                <Input
                  id="substage-params"
                  value={substageForm.paramMapping}
                  onChange={(e) => setSubstageForm({ ...substageForm, paramMapping: e.target.value })}
                  placeholder="72; (semicolon-separated IDs)"
                />
              </div>

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
    </div>
  );
};

export default ExtendedMetadataManagement;