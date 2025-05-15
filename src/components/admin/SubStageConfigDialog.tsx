import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, Info, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import type { Attestation, Parameter } from '@/types/workflow-types';

// Interface for sub-stage configuration
interface ConfigSubStage {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'auto';
  order: number;
  sequence?: number;
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

interface SubStageConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subStage: ConfigSubStage | null;
  onSave: (subStage: ConfigSubStage) => void;
  availableAttestations: Attestation[];
  availableParameters: Parameter[];
}

const SubStageConfigDialog: React.FC<SubStageConfigDialogProps> = ({
  open,
  onOpenChange,
  subStage,
  onSave,
  availableAttestations,
  availableParameters
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [editedSubStage, setEditedSubStage] = useState<ConfigSubStage | null>(null);
  const [selectedAttestationId, setSelectedAttestationId] = useState<string>('');
  const [selectedParameterId, setSelectedParameterId] = useState<string>('');
  
  // Initialize the edited sub-stage when the dialog opens
  useEffect(() => {
    if (open && subStage) {
      setEditedSubStage({
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
      });
    } else {
      setEditedSubStage(null);
    }
    setActiveTab('general');
  }, [open, subStage]);
  
  // Handler for saving the sub-stage configuration
  const handleSave = () => {
    if (!editedSubStage) return;
    
    // Validate the configuration
    if (editedSubStage.requiresAttestation && (!editedSubStage.attestations || editedSubStage.attestations.length === 0)) {
      toast({
        title: "Validation Error",
        description: "Attestation is required but no attestations are selected",
        variant: "destructive"
      });
      setActiveTab('attestation');
      return;
    }
    
    if (editedSubStage.requiresUpload && (!editedSubStage.uploadConfig || !editedSubStage.uploadConfig.validationSettings)) {
      toast({
        title: "Validation Error",
        description: "Upload is required but upload configuration is incomplete",
        variant: "destructive"
      });
      setActiveTab('upload');
      return;
    }
    
    if (editedSubStage.requiresDownload && (!editedSubStage.downloadConfig || !editedSubStage.downloadConfig.validationSettings)) {
      toast({
        title: "Validation Error",
        description: "Download is required but download configuration is incomplete",
        variant: "destructive"
      });
      setActiveTab('download');
      return;
    }
    
    onSave(editedSubStage);
    onOpenChange(false);
  };
  
  // Handler for toggling a boolean property
  const handleToggleProperty = (property: keyof ConfigSubStage) => {
    if (!editedSubStage) return;
    
    setEditedSubStage({
      ...editedSubStage,
      [property]: !editedSubStage[property]
    });
    
    // Special handling for attestation
    if (property === 'requiresAttestation' && !editedSubStage.requiresAttestation) {
      setActiveTab('attestation');
    }
    
    // Special handling for upload
    if (property === 'requiresUpload' && !editedSubStage.requiresUpload) {
      setActiveTab('upload');
    }
    
    // Special handling for download
    if (property === 'requiresDownload' && !editedSubStage.requiresDownload) {
      setActiveTab('download');
    }
  };
  
  // Handler for adding an attestation
  const handleAddAttestation = () => {
    if (!editedSubStage || !selectedAttestationId) return;
    
    const attestationToAdd = availableAttestations.find(att => att.id === selectedAttestationId);
    if (!attestationToAdd) return;
    
    // Check if attestation is already added
    if (editedSubStage.attestations?.some(att => att.id === attestationToAdd.id)) {
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
    
    setEditedSubStage({
      ...editedSubStage,
      attestations: [...(editedSubStage.attestations || []), newAttestation]
    });
    
    setSelectedAttestationId('');
  };
  
  // Handler for removing an attestation
  const handleRemoveAttestation = (attestationId: string) => {
    if (!editedSubStage || !editedSubStage.attestations) return;
    
    setEditedSubStage({
      ...editedSubStage,
      attestations: editedSubStage.attestations.filter(att => att.id !== attestationId)
    });
  };
  
  // Handler for adding a parameter to upload/download config
  const handleAddParameter = (configType: 'upload' | 'download') => {
    if (!editedSubStage || !selectedParameterId) return;
    
    const parameterToAdd = availableParameters.find(param => param.id === selectedParameterId);
    if (!parameterToAdd) return;
    
    const config = configType === 'upload' ? editedSubStage.uploadConfig : editedSubStage.downloadConfig;
    if (!config) return;
    
    // Check if parameter is already added
    if (config.parameters.some(param => param.id === parameterToAdd.id)) {
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
      value: parameterToAdd.value,
      dataType: parameterToAdd.dataType,
      isRequired: parameterToAdd.isRequired || false
    };
    
    if (configType === 'upload') {
      setEditedSubStage({
        ...editedSubStage,
        uploadConfig: {
          ...editedSubStage.uploadConfig!,
          parameters: [...editedSubStage.uploadConfig!.parameters, newParameter]
        }
      });
    } else {
      setEditedSubStage({
        ...editedSubStage,
        downloadConfig: {
          ...editedSubStage.downloadConfig!,
          parameters: [...editedSubStage.downloadConfig!.parameters, newParameter]
        }
      });
    }
    
    setSelectedParameterId('');
  };
  
  // Handler for removing a parameter from upload/download config
  const handleRemoveParameter = (configType: 'upload' | 'download', parameterId: string) => {
    if (!editedSubStage) return;
    
    const config = configType === 'upload' ? editedSubStage.uploadConfig : editedSubStage.downloadConfig;
    if (!config) return;
    
    if (configType === 'upload') {
      setEditedSubStage({
        ...editedSubStage,
        uploadConfig: {
          ...editedSubStage.uploadConfig!,
          parameters: editedSubStage.uploadConfig!.parameters.filter(param => param.id !== parameterId)
        }
      });
    } else {
      setEditedSubStage({
        ...editedSubStage,
        downloadConfig: {
          ...editedSubStage.downloadConfig!,
          parameters: editedSubStage.downloadConfig!.parameters.filter(param => param.id !== parameterId)
        }
      });
    }
  };
  
  // Handler for updating upload/download config
  const handleUpdateFileConfig = (
    configType: 'upload' | 'download',
    field: keyof FileConfig | 'allowedExtensions' | 'maxFileSize' | 'requireValidation',
    value: any
  ) => {
    if (!editedSubStage) return;
    
    const config = configType === 'upload' ? editedSubStage.uploadConfig : editedSubStage.downloadConfig;
    if (!config) return;
    
    if (field === 'allowedExtensions' || field === 'maxFileSize' || field === 'requireValidation') {
      // Update validation settings
      if (configType === 'upload') {
        setEditedSubStage({
          ...editedSubStage,
          uploadConfig: {
            ...editedSubStage.uploadConfig!,
            validationSettings: {
              ...editedSubStage.uploadConfig!.validationSettings!,
              [field]: value
            }
          }
        });
      } else {
        setEditedSubStage({
          ...editedSubStage,
          downloadConfig: {
            ...editedSubStage.downloadConfig!,
            validationSettings: {
              ...editedSubStage.downloadConfig!.validationSettings!,
              [field]: value
            }
          }
        });
      }
    } else {
      // Update top-level field
      if (configType === 'upload') {
        setEditedSubStage({
          ...editedSubStage,
          uploadConfig: {
            ...editedSubStage.uploadConfig!,
            [field]: value
          }
        });
      } else {
        setEditedSubStage({
          ...editedSubStage,
          downloadConfig: {
            ...editedSubStage.downloadConfig!,
            [field]: value
          }
        });
      }
    }
  };
  
  if (!editedSubStage) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Sub-Stage: {editedSubStage.name}</DialogTitle>
          <DialogDescription>
            Configure the options and settings for this sub-stage
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="attestation" disabled={!editedSubStage.requiresAttestation}>Attestation</TabsTrigger>
            <TabsTrigger value="approval" disabled={!editedSubStage.requiresApproval}>Approval</TabsTrigger>
            <TabsTrigger value="upload" disabled={!editedSubStage.requiresUpload}>Upload</TabsTrigger>
            <TabsTrigger value="download" disabled={!editedSubStage.requiresDownload}>Download</TabsTrigger>
          </TabsList>
          
          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subStageName">Name</Label>
                <Input 
                  id="subStageName" 
                  value={editedSubStage.name} 
                  onChange={(e) => setEditedSubStage({...editedSubStage, name: e.target.value})}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subStageType">Type</Label>
                <Select 
                  value={editedSubStage.type}
                  onValueChange={(value) => setEditedSubStage({...editedSubStage, type: value as 'manual' | 'auto'})}
                >
                  <SelectTrigger id="subStageType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="auto">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subStageDescription">Description</Label>
              <Input 
                id="subStageDescription" 
                value={editedSubStage.description || ''} 
                onChange={(e) => setEditedSubStage({...editedSubStage, description: e.target.value})}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Options</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isActive" 
                    checked={editedSubStage.isActive}
                    onCheckedChange={() => handleToggleProperty('isActive')}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isAuto" 
                    checked={editedSubStage.isAuto}
                    onCheckedChange={() => handleToggleProperty('isAuto')}
                  />
                  <Label htmlFor="isAuto">Auto</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isAdhoc" 
                    checked={editedSubStage.isAdhoc}
                    onCheckedChange={() => handleToggleProperty('isAdhoc')}
                  />
                  <Label htmlFor="isAdhoc">Adhoc</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isAlteryx" 
                    checked={editedSubStage.isAlteryx}
                    onCheckedChange={() => handleToggleProperty('isAlteryx')}
                  />
                  <Label htmlFor="isAlteryx">Alteryx</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requiresAttestation" 
                    checked={editedSubStage.requiresAttestation}
                    onCheckedChange={() => handleToggleProperty('requiresAttestation')}
                  />
                  <Label htmlFor="requiresAttestation">Requires Attestation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requiresApproval" 
                    checked={editedSubStage.requiresApproval}
                    onCheckedChange={() => handleToggleProperty('requiresApproval')}
                  />
                  <Label htmlFor="requiresApproval">Requires Approval</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requiresUpload" 
                    checked={editedSubStage.requiresUpload}
                    onCheckedChange={() => handleToggleProperty('requiresUpload')}
                  />
                  <Label htmlFor="requiresUpload">Requires Upload</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requiresDownload" 
                    checked={editedSubStage.requiresDownload || false}
                    onCheckedChange={() => handleToggleProperty('requiresDownload')}
                  />
                  <Label htmlFor="requiresDownload">Requires Download</Label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Attestation Tab */}
          <TabsContent value="attestation" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Configure attestations required for this sub-stage
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
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
                      .filter(att => !editedSubStage.attestations?.some(a => a.id === att.id))
                      .map(att => (
                        <SelectItem key={att.id} value={att.id}>{att.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddAttestation} disabled={!selectedAttestationId}>
                  <Plus className="mr-2 h-4 w-4" /> Add Attestation
                </Button>
              </div>
            </div>
            
            {editedSubStage.attestations && editedSubStage.attestations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedSubStage.attestations.map(att => (
                    <TableRow key={att.id}>
                      <TableCell className="font-medium">{att.name}</TableCell>
                      <TableCell>{att.text}</TableCell>
                      <TableCell>
                        <Checkbox 
                          checked={att.isRequired}
                          onCheckedChange={(checked) => {
                            setEditedSubStage({
                              ...editedSubStage,
                              attestations: editedSubStage.attestations?.map(a => 
                                a.id === att.id ? {...a, isRequired: !!checked} : a
                              )
                            });
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
            ) : (
              <div className="text-center py-4 border rounded-md">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No attestations added. Use the dropdown above to add attestations.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Approval Tab */}
          <TabsContent value="approval" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Configure approval settings for this sub-stage
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approvalType">Approval Type</Label>
                <Select>
                  <SelectTrigger id="approvalType">
                    <SelectValue placeholder="Select approval type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Approver</SelectItem>
                    <SelectItem value="multiple">Multiple Approvers</SelectItem>
                    <SelectItem value="hierarchical">Hierarchical Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="approverRole">Approver Role</Label>
                <Select>
                  <SelectTrigger id="approverRole">
                    <SelectValue placeholder="Select approver role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="escalateOnDelay" />
                <Label htmlFor="escalateOnDelay">Escalate on Delay</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="escalationDelay">Escalation Delay (hours)</Label>
                <Input id="escalationDelay" type="number" min="1" placeholder="24" />
              </div>
            </div>
          </TabsContent>
          
          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Configure file upload settings for this sub-stage
              </p>
            </div>
            
            {editedSubStage.uploadConfig && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="uploadFileType">File Type</Label>
                    <Input 
                      id="uploadFileType" 
                      value={editedSubStage.uploadConfig.fileType} 
                      onChange={(e) => handleUpdateFileConfig('upload', 'fileType', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="uploadFileNaming">File Naming Convention</Label>
                    <Input 
                      id="uploadFileNaming" 
                      value={editedSubStage.uploadConfig.fileNamingConvention || ''} 
                      onChange={(e) => handleUpdateFileConfig('upload', 'fileNamingConvention', e.target.value)}
                      placeholder="e.g., {date}_{workflow}_{stage}"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="uploadDescription">Description</Label>
                  <Input 
                    id="uploadDescription" 
                    value={editedSubStage.uploadConfig.description || ''} 
                    onChange={(e) => handleUpdateFileConfig('upload', 'description', e.target.value)}
                    placeholder="Description of the upload requirements"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="uploadMultiple" 
                    checked={editedSubStage.uploadConfig.allowMultiple}
                    onCheckedChange={(checked) => handleUpdateFileConfig('upload', 'allowMultiple', !!checked)}
                  />
                  <Label htmlFor="uploadMultiple">Allow Multiple Files</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="uploadEmailNotifications" 
                    checked={editedSubStage.uploadConfig.emailNotifications || false}
                    onCheckedChange={(checked) => handleUpdateFileConfig('upload', 'emailNotifications', !!checked)}
                  />
                  <Label htmlFor="uploadEmailNotifications">Send Email Notifications</Label>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Validation Settings</h3>
                  
                  {editedSubStage.uploadConfig.validationSettings && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="uploadAllowedExtensions">Allowed Extensions</Label>
                        <Input 
                          id="uploadAllowedExtensions" 
                          value={editedSubStage.uploadConfig.validationSettings.allowedExtensions.join(', ')} 
                          onChange={(e) => handleUpdateFileConfig(
                            'upload', 
                            'allowedExtensions', 
                            e.target.value.split(',').map(ext => ext.trim())
                          )}
                          placeholder=".xlsx, .csv, .pdf"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="uploadMaxFileSize">Max File Size (MB)</Label>
                        <Input 
                          id="uploadMaxFileSize" 
                          type="number"
                          min="1"
                          value={editedSubStage.uploadConfig.validationSettings.maxFileSize} 
                          onChange={(e) => handleUpdateFileConfig(
                            'upload', 
                            'maxFileSize', 
                            parseInt(e.target.value) || 10
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="uploadRequireValidation" 
                          checked={editedSubStage.uploadConfig.validationSettings.requireValidation}
                          onCheckedChange={(checked) => handleUpdateFileConfig(
                            'upload', 
                            'requireValidation', 
                            !!checked
                          )}
                        />
                        <Label htmlFor="uploadRequireValidation">Require Validation</Label>
                      </div>
                    </>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Parameters</h3>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={selectedParameterId} 
                        onValueChange={setSelectedParameterId}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableParameters
                            .filter(param => !editedSubStage.uploadConfig?.parameters.some(p => p.id === param.id))
                            .map(param => (
                              <SelectItem key={param.id} value={param.id}>{param.name}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <Button onClick={() => handleAddParameter('upload')} disabled={!selectedParameterId}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editedSubStage.uploadConfig.parameters.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editedSubStage.uploadConfig.parameters.map(param => (
                          <TableRow key={param.id}>
                            <TableCell className="font-medium">{param.name}</TableCell>
                            <TableCell>{param.dataType}</TableCell>
                            <TableCell>
                              <Checkbox 
                                checked={param.isRequired}
                                onCheckedChange={(checked) => {
                                  setEditedSubStage({
                                    ...editedSubStage,
                                    uploadConfig: {
                                      ...editedSubStage.uploadConfig!,
                                      parameters: editedSubStage.uploadConfig!.parameters.map(p => 
                                        p.id === param.id ? {...p, isRequired: !!checked} : p
                                      )
                                    }
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveParameter('upload', param.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">
                        No parameters added. Use the dropdown above to add parameters.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Download Tab */}
          <TabsContent value="download" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Configure file download settings for this sub-stage
              </p>
            </div>
            
            {editedSubStage.downloadConfig && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="downloadFileType">File Type</Label>
                    <Input 
                      id="downloadFileType" 
                      value={editedSubStage.downloadConfig.fileType} 
                      onChange={(e) => handleUpdateFileConfig('download', 'fileType', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="downloadFileNaming">File Naming Convention</Label>
                    <Input 
                      id="downloadFileNaming" 
                      value={editedSubStage.downloadConfig.fileNamingConvention || ''} 
                      onChange={(e) => handleUpdateFileConfig('download', 'fileNamingConvention', e.target.value)}
                      placeholder="e.g., {date}_{workflow}_{stage}_output"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="downloadDescription">Description</Label>
                  <Input 
                    id="downloadDescription" 
                    value={editedSubStage.downloadConfig.description || ''} 
                    onChange={(e) => handleUpdateFileConfig('download', 'description', e.target.value)}
                    placeholder="Description of the download files"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="downloadMultiple" 
                    checked={editedSubStage.downloadConfig.allowMultiple}
                    onCheckedChange={(checked) => handleUpdateFileConfig('download', 'allowMultiple', !!checked)}
                  />
                  <Label htmlFor="downloadMultiple">Allow Multiple Files</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="downloadEmailNotifications" 
                    checked={editedSubStage.downloadConfig.emailNotifications || false}
                    onCheckedChange={(checked) => handleUpdateFileConfig('download', 'emailNotifications', !!checked)}
                  />
                  <Label htmlFor="downloadEmailNotifications">Send Email Notifications</Label>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Validation Settings</h3>
                  
                  {editedSubStage.downloadConfig.validationSettings && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="downloadAllowedExtensions">Allowed Extensions</Label>
                        <Input 
                          id="downloadAllowedExtensions" 
                          value={editedSubStage.downloadConfig.validationSettings.allowedExtensions.join(', ')} 
                          onChange={(e) => handleUpdateFileConfig(
                            'download', 
                            'allowedExtensions', 
                            e.target.value.split(',').map(ext => ext.trim())
                          )}
                          placeholder=".xlsx, .csv, .pdf"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="downloadMaxFileSize">Max File Size (MB)</Label>
                        <Input 
                          id="downloadMaxFileSize" 
                          type="number"
                          min="1"
                          value={editedSubStage.downloadConfig.validationSettings.maxFileSize} 
                          onChange={(e) => handleUpdateFileConfig(
                            'download', 
                            'maxFileSize', 
                            parseInt(e.target.value) || 10
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="downloadRequireValidation" 
                          checked={editedSubStage.downloadConfig.validationSettings.requireValidation}
                          onCheckedChange={(checked) => handleUpdateFileConfig(
                            'download', 
                            'requireValidation', 
                            !!checked
                          )}
                        />
                        <Label htmlFor="downloadRequireValidation">Require Validation</Label>
                      </div>
                    </>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Parameters</h3>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={selectedParameterId} 
                        onValueChange={setSelectedParameterId}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableParameters
                            .filter(param => !editedSubStage.downloadConfig?.parameters.some(p => p.id === param.id))
                            .map(param => (
                              <SelectItem key={param.id} value={param.id}>{param.name}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <Button onClick={() => handleAddParameter('download')} disabled={!selectedParameterId}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editedSubStage.downloadConfig.parameters.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editedSubStage.downloadConfig.parameters.map(param => (
                          <TableRow key={param.id}>
                            <TableCell className="font-medium">{param.name}</TableCell>
                            <TableCell>{param.dataType}</TableCell>
                            <TableCell>
                              <Checkbox 
                                checked={param.isRequired}
                                onCheckedChange={(checked) => {
                                  setEditedSubStage({
                                    ...editedSubStage,
                                    downloadConfig: {
                                      ...editedSubStage.downloadConfig!,
                                      parameters: editedSubStage.downloadConfig!.parameters.map(p => 
                                        p.id === param.id ? {...p, isRequired: !!checked} : p
                                      )
                                    }
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveParameter('download', param.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">
                        No parameters added. Use the dropdown above to add parameters.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubStageConfigDialog;