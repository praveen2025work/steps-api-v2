import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { StageConfig, SubStageConfig, Parameter, Attestation, EmailTemplate } from '@/types/workflow-types';

// Sample data
const sampleStages: StageConfig[] = [
  {
    id: '1',
    name: 'Data Collection',
    description: 'Collect all required data for the workflow',
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
        order: 1
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
        order: 2
      }
    ],
    order: 1
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
        order: 1
      }
    ],
    order: 2
  }
];

const sampleParameters: Parameter[] = [
  { id: 'p1', name: 'requesterName', value: '', dataType: 'string' },
  { id: 'p2', name: 'requestDate', value: '', dataType: 'date' },
  { id: 'p3', name: 'documentType', value: '', dataType: 'string' },
  { id: 'p4', name: 'reviewerName', value: '', dataType: 'string' },
  { id: 'p5', name: 'approved', value: '', dataType: 'boolean' }
];

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
    ]
  },
  {
    id: 'e2',
    name: 'Approval Notification',
    subject: 'Your workflow has been approved',
    body: 'Dear {{requesterName}},\n\nYour workflow has been approved by {{approverName}}.',
    parameters: [
      { id: 'ep3', name: 'requesterName', value: '', dataType: 'string' },
      { id: 'ep4', name: 'approverName', value: '', dataType: 'string' }
    ]
  }
];

const MetadataManagement: React.FC = () => {
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
  
  // Form states
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  const [selectedSubStage, setSelectedSubStage] = useState<SubStageConfig | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);
  const [selectedAttestation, setSelectedAttestation] = useState<Attestation | null>(null);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<EmailTemplate | null>(null);
  
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
                      <Input id="stageName" className="col-span-3" placeholder="Stage name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stageDescription" className="text-right">Description</Label>
                      <Textarea id="stageDescription" className="col-span-3" placeholder="Stage description" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stageOrder" className="text-right">Order</Label>
                      <Input id="stageOrder" type="number" className="col-span-3" placeholder="Order" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStageDialogOpen(false)}>Cancel</Button>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {stages.map((stage) => (
                <Card key={stage.id} className="mb-4">
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <div>
                      <CardTitle className="text-lg">{stage.name}</CardTitle>
                      <CardDescription>{stage.description}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedStage(stage);
                        setStageDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoveDown className="h-4 w-4" />
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
                              <Input id="subStageName" className="col-span-3" placeholder="Sub-stage name" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="subStageDescription" className="text-right">Description</Label>
                              <Textarea id="subStageDescription" className="col-span-3" placeholder="Sub-stage description" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="subStageType" className="text-right">Type</Label>
                              <Select>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="auto">Automatic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="expectedDuration" className="text-right">Expected Duration (hours)</Label>
                              <Input id="expectedDuration" type="number" className="col-span-3" placeholder="Duration in hours" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="subStageOrder" className="text-right">Order</Label>
                              <Input id="subStageOrder" type="number" className="col-span-3" placeholder="Order" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSubStageDialogOpen(false)}>Cancel</Button>
                            <Button>Save</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Expected Duration</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stage.subStages.map((subStage) => (
                          <TableRow key={subStage.id}>
                            <TableCell className="font-medium">{subStage.name}</TableCell>
                            <TableCell>{subStage.type === 'manual' ? 'Manual' : 'Automatic'}</TableCell>
                            <TableCell>{subStage.expectedDuration} hours</TableCell>
                            <TableCell>{subStage.order}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedSubStage(subStage);
                                  setSelectedStage(stage);
                                  setSubStageDialogOpen(true);
                                }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
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
                      <Input id="parameterName" className="col-span-3" placeholder="Parameter name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parameterDescription" className="text-right">Description</Label>
                      <Textarea id="parameterDescription" className="col-span-3" placeholder="Parameter description" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dataType" className="text-right">Data Type</Label>
                      <Select>
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setParameterDialogOpen(false)}>Cancel</Button>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.map((parameter) => (
                    <TableRow key={parameter.id}>
                      <TableCell className="font-medium">{parameter.name}</TableCell>
                      <TableCell>{parameter.dataType}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedParameter(parameter);
                            setParameterDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      <Input id="attestationName" className="col-span-3" placeholder="Attestation name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="attestationDescription" className="text-right">Description</Label>
                      <Textarea id="attestationDescription" className="col-span-3" placeholder="Attestation description" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="attestationText" className="text-right">Text</Label>
                      <Textarea id="attestationText" className="col-span-3" placeholder="Attestation text" rows={4} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAttestationDialogOpen(false)}>Cancel</Button>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attestations.map((attestation) => (
                    <TableRow key={attestation.id}>
                      <TableCell className="font-medium">{attestation.name}</TableCell>
                      <TableCell>{attestation.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedAttestation(attestation);
                            setAttestationDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      <Input id="templateName" className="col-span-3" placeholder="Template name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="templateSubject" className="text-right">Subject</Label>
                      <Input id="templateSubject" className="col-span-3" placeholder="Email subject" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="templateBody" className="text-right pt-2">Body</Label>
                      <Textarea id="templateBody" className="col-span-3" placeholder="Email body" rows={8} />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Parameters</Label>
                      <div className="col-span-3">
                        <p className="text-sm text-muted-foreground mb-2">
                          Select parameters to use in this template. Use {{parameterName}} syntax in the body.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {parameters.map((param) => (
                            <Button key={param.id} variant="outline" size="sm" className="h-8">
                              {param.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailTemplateDialogOpen(false)}>Cancel</Button>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedEmailTemplate(template);
                            setEmailTemplateDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <div className="flex space-x-2">
                  <Button>Export All</Button>
                  <Button variant="outline">Export Stages</Button>
                  <Button variant="outline">Export Parameters</Button>
                  <Button variant="outline">Export Attestations</Button>
                  <Button variant="outline">Export Email Templates</Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Import Metadata</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import metadata configuration from a JSON file. This will overwrite existing configurations.
                </p>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="importFile">Upload JSON file</Label>
                  <Input id="importFile" type="file" />
                </div>
                <Button className="mt-4">Import</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetadataManagement;