import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, Info, Plus, Save, Trash2, X } from 'lucide-react';
import type { Attestation, Parameter } from '@/types/workflow-types';

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
  onSave: (updatedSubStage: ConfigSubStage) => void;
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
      setActiveTab('general');
    } else {
      setEditedSubStage(null);
    }
  }, [open, subStage]);

  // Handler for saving the edited sub-stage
  const handleSave = () => {
    if (!editedSubStage) return;

    // If upload is not required, remove the upload config
    const updatedSubStage = {
      ...editedSubStage,
      uploadConfig: editedSubStage.requiresUpload ? editedSubStage.uploadConfig : undefined,
      downloadConfig: editedSubStage.requiresDownload ? editedSubStage.downloadConfig : undefined
    };

    onSave(updatedSubStage);
    onOpenChange(false);
  };

  // Handler for toggling boolean properties
  const handleToggle = (property: keyof ConfigSubStage) => {
    if (!editedSubStage) return;

    setEditedSubStage({
      ...editedSubStage,
      [property]: !editedSubStage[property as keyof ConfigSubStage]
    });
  };

  // Handler for adding an attestation
  const handleAddAttestation = () => {
    if (!editedSubStage || !selectedAttestationId) return;

    const attestationToAdd = availableAttestations.find(att => att.id === selectedAttestationId);
    if (!attestationToAdd) return;

    // Check if attestation is already added
    if (editedSubStage.attestations?.some(att => att.id === attestationToAdd.id)) {
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

  // Handler for adding a parameter to file config
  const handleAddFileParameter = (fileType: 'upload' | 'download') => {
    if (!editedSubStage || !selectedParameterId) return;

    const parameterToAdd = availableParameters.find(param => param.id === selectedParameterId);
    if (!parameterToAdd) return;

    const configKey = fileType === 'upload' ? 'uploadConfig' : 'downloadConfig';
    const fileConfig = editedSubStage[configKey as keyof ConfigSubStage] as FileConfig;

    if (!fileConfig) return;

    // Check if parameter is already added
    if (fileConfig.parameters.some(param => param.id === parameterToAdd.id)) {
      return;
    }

    const newParameter: ConfigParameter = {
      id: parameterToAdd.id,
      name: parameterToAdd.name,
      value: '',
      dataType: parameterToAdd.dataType,
      isRequired: parameterToAdd.isRequired || false
    };

    setEditedSubStage({
      ...editedSubStage,
      [configKey]: {
        ...fileConfig,
        parameters: [...fileConfig.parameters, newParameter]
      }
    });

    setSelectedParameterId('');
  };

  // Handler for removing a parameter from file config
  const handleRemoveFileParameter = (fileType: 'upload' | 'download', parameterId: string) => {
    if (!editedSubStage) return;

    const configKey = fileType === 'upload' ? 'uploadConfig' : 'downloadConfig';
    const fileConfig = editedSubStage[configKey as keyof ConfigSubStage] as FileConfig;

    if (!fileConfig) return;

    setEditedSubStage({
      ...editedSubStage,
      [configKey]: {
        ...fileConfig,
        parameters: fileConfig.parameters.filter(param => param.id !== parameterId)
      }
    });
  };

  // Handler for updating file config properties
  const handleUpdateFileConfig = (
    fileType: 'upload' | 'download',
    property: keyof FileConfig | keyof FileConfig['validationSettings'],
    value: any,
    isValidationSetting: boolean = false
  ) => {
    if (!editedSubStage) return;

    const configKey = fileType === 'upload' ? 'uploadConfig' : 'downloadConfig';
    const fileConfig = editedSubStage[configKey as keyof ConfigSubStage] as FileConfig;

    if (!fileConfig) return;

    if (isValidationSetting && fileConfig.validationSettings) {
      setEditedSubStage({
        ...editedSubStage,
        [configKey]: {
          ...fileConfig,
          validationSettings: {
            ...fileConfig.validationSettings,
            [property]: value
          }
        }
      });
    } else {
      setEditedSubStage({
        ...editedSubStage,
        [configKey]: {
          ...fileConfig,
          [property]: value
        }
      });
    }
  };

  // If no sub-stage is being edited, don't render the dialog
  if (!editedSubStage) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Sub-Stage: {editedSubStage.name}</DialogTitle>
          <DialogDescription>
            Configure the options and settings for this sub-stage.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="attestations">Attestations</TabsTrigger>
            <TabsTrigger value="upload">Upload Config</TabsTrigger>
            <TabsTrigger value="download">Download Config</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editedSubStage.name}
                    onChange={(e) => setEditedSubStage({ ...editedSubStage, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={editedSubStage.type}
                    onValueChange={(value) => setEditedSubStage({ ...editedSubStage, type: value as 'manual' | 'auto' })}
                  >
                    <SelectTrigger id="type">
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
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editedSubStage.description || ''}
                  onChange={(e) => setEditedSubStage({ ...editedSubStage, description: e.target.value })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={editedSubStage.isActive}
                      onCheckedChange={() => handleToggle('isActive')}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAuto"
                      checked={editedSubStage.isAuto}
                      onCheckedChange={() => handleToggle('isAuto')}
                    />
                    <Label htmlFor="isAuto">Auto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAdhoc"
                      checked={editedSubStage.isAdhoc}
                      onCheckedChange={() => handleToggle('isAdhoc')}
                    />
                    <Label htmlFor="isAdhoc">Adhoc</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAlteryx"
                      checked={editedSubStage.isAlteryx}
                      onCheckedChange={() => handleToggle('isAlteryx')}
                    />
                    <Label htmlFor="isAlteryx">Alteryx</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresAttestation"
                      checked={editedSubStage.requiresAttestation}
                      onCheckedChange={() => handleToggle('requiresAttestation')}
                    />
                    <Label htmlFor="requiresAttestation">Requires Attestation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresApproval"
                      checked={editedSubStage.requiresApproval}
                      onCheckedChange={() => handleToggle('requiresApproval')}
                    />
                    <Label htmlFor="requiresApproval">Requires Approval</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresUpload"
                      checked={editedSubStage.requiresUpload}
                      onCheckedChange={() => handleToggle('requiresUpload')}
                    />
                    <Label htmlFor="requiresUpload">Requires Upload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresDownload"
                      checked={editedSubStage.requiresDownload || false}
                      onCheckedChange={() => handleToggle('requiresDownload')}
                    />
                    <Label htmlFor="requiresDownload">Requires Download</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Parameters</h3>
                {editedSubStage.parameters.length === 0 ? (
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedSubStage.parameters.map(param => (
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Attestations Tab */}
          <TabsContent value="attestations">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Configure attestations required for this sub-stage. Attestations are statements that users must agree to before completing the sub-stage.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresAttestation"
                  checked={editedSubStage.requiresAttestation}
                  onCheckedChange={() => handleToggle('requiresAttestation')}
                />
                <Label htmlFor="requiresAttestation">This sub-stage requires attestation</Label>
              </div>

              {editedSubStage.requiresAttestation && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="attestationSelect">Available Attestations</Label>
                      <Select
                        value={selectedAttestationId}
                        onValueChange={setSelectedAttestationId}
                        disabled={!editedSubStage.requiresAttestation}
                      >
                        <SelectTrigger id="attestationSelect">
                          <SelectValue placeholder="Select an attestation to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAttestations
                            .filter(att => !editedSubStage.attestations?.some(a => a.id === att.id))
                            .map(att => (
                              <SelectItem key={att.id} value={att.id}>{att.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddAttestation}
                        disabled={!selectedAttestationId || !editedSubStage.requiresAttestation}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Attestation
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Selected Attestations</h3>
                    {!editedSubStage.attestations || editedSubStage.attestations.length === 0 ? (
                      <div className="text-center py-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">
                          No attestations selected. Use the dropdown above to add attestations.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editedSubStage.attestations.map(att => (
                          <Card key={att.id}>
                            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                              <div>
                                <CardTitle className="text-base">{att.name}</CardTitle>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAttestation(att.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </CardHeader>
                            <CardContent className="py-2 px-4">
                              <p className="text-sm">{att.text}</p>
                              <div className="mt-2 flex items-center space-x-2">
                                <Checkbox
                                  id={`required-${att.id}`}
                                  checked={att.isRequired}
                                  onCheckedChange={(checked) => {
                                    if (!editedSubStage.attestations) return;
                                    const updatedAttestations = editedSubStage.attestations.map(a => {
                                      if (a.id === att.id) {
                                        return { ...a, isRequired: !!checked };
                                      }
                                      return a;
                                    });
                                    setEditedSubStage({
                                      ...editedSubStage,
                                      attestations: updatedAttestations
                                    });
                                  }}
                                />
                                <Label htmlFor={`required-${att.id}`}>Required</Label>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Upload Config Tab */}
          <TabsContent value="upload">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Configure file upload settings for this sub-stage.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresUpload"
                  checked={editedSubStage.requiresUpload}
                  onCheckedChange={() => handleToggle('requiresUpload')}
                />
                <Label htmlFor="requiresUpload">This sub-stage requires file upload</Label>
              </div>

              {editedSubStage.requiresUpload && editedSubStage.uploadConfig && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="uploadDescription">Description</Label>
                      <Input
                        id="uploadDescription"
                        value={editedSubStage.uploadConfig.description || ''}
                        onChange={(e) => handleUpdateFileConfig('upload', 'description', e.target.value)}
                        placeholder="Enter a description for the upload"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uploadFileNamingConvention">File Naming Convention</Label>
                      <Input
                        id="uploadFileNamingConvention"
                        value={editedSubStage.uploadConfig.fileNamingConvention || ''}
                        onChange={(e) => handleUpdateFileConfig('upload', 'fileNamingConvention', e.target.value)}
                        placeholder="e.g., {date}_{name}_{id}"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Validation Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="uploadAllowedExtensions">Allowed Extensions</Label>
                        <Input
                          id="uploadAllowedExtensions"
                          value={editedSubStage.uploadConfig.validationSettings?.allowedExtensions.join(', ') || ''}
                          onChange={(e) => {
                            const extensions = e.target.value.split(',').map(ext => ext.trim());
                            handleUpdateFileConfig('upload', 'allowedExtensions', extensions, true);
                          }}
                          placeholder=".xlsx, .csv, .pdf"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uploadMaxFileSize">Max File Size (MB)</Label>
                        <Input
                          id="uploadMaxFileSize"
                          type="number"
                          value={editedSubStage.uploadConfig.validationSettings?.maxFileSize || 10}
                          onChange={(e) => handleUpdateFileConfig('upload', 'maxFileSize', Number(e.target.value), true)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="uploadRequireValidation"
                        checked={editedSubStage.uploadConfig.validationSettings?.requireValidation || false}
                        onCheckedChange={(checked) => handleUpdateFileConfig('upload', 'requireValidation', !!checked, true)}
                      />
                      <Label htmlFor="uploadRequireValidation">Require validation</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uploadAllowMultiple"
                      checked={editedSubStage.uploadConfig.allowMultiple}
                      onCheckedChange={(checked) => handleUpdateFileConfig('upload', 'allowMultiple', !!checked)}
                    />
                    <Label htmlFor="uploadAllowMultiple">Allow multiple file uploads</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uploadEmailNotifications"
                      checked={editedSubStage.uploadConfig.emailNotifications || false}
                      onCheckedChange={(checked) => handleUpdateFileConfig('upload', 'emailNotifications', !!checked)}
                    />
                    <Label htmlFor="uploadEmailNotifications">Send email notifications</Label>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="uploadParameterSelect">Available Parameters</Label>
                        <Select
                          value={selectedParameterId}
                          onValueChange={setSelectedParameterId}
                        >
                          <SelectTrigger id="uploadParameterSelect">
                            <SelectValue placeholder="Select a parameter to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableParameters
                              .filter(param => !editedSubStage.uploadConfig?.parameters.some(p => p.id === param.id))
                              .map(param => (
                                <SelectItem key={param.id} value={param.id}>{param.name}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => handleAddFileParameter('upload')}
                          disabled={!selectedParameterId}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Parameter
                        </Button>
                      </div>
                    </div>

                    {editedSubStage.uploadConfig.parameters.length === 0 ? (
                      <div className="text-center py-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">
                          No parameters added. Use the dropdown above to add parameters.
                        </p>
                      </div>
                    ) : (
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
                                    const updatedParams = editedSubStage.uploadConfig?.parameters.map(p => {
                                      if (p.id === param.id) {
                                        return { ...p, isRequired: !!checked };
                                      }
                                      return p;
                                    }) || [];
                                    handleUpdateFileConfig('upload', 'parameters', updatedParams);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFileParameter('upload', param.id)}
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
                </>
              )}
            </div>
          </TabsContent>

          {/* Download Config Tab */}
          <TabsContent value="download">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Configure file download settings for this sub-stage.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresDownload"
                  checked={editedSubStage.requiresDownload || false}
                  onCheckedChange={() => handleToggle('requiresDownload')}
                />
                <Label htmlFor="requiresDownload">This sub-stage requires file download</Label>
              </div>

              {editedSubStage.requiresDownload && editedSubStage.downloadConfig && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="downloadDescription">Description</Label>
                      <Input
                        id="downloadDescription"
                        value={editedSubStage.downloadConfig.description || ''}
                        onChange={(e) => handleUpdateFileConfig('download', 'description', e.target.value)}
                        placeholder="Enter a description for the download"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="downloadFileNamingConvention">File Naming Convention</Label>
                      <Input
                        id="downloadFileNamingConvention"
                        value={editedSubStage.downloadConfig.fileNamingConvention || ''}
                        onChange={(e) => handleUpdateFileConfig('download', 'fileNamingConvention', e.target.value)}
                        placeholder="e.g., {date}_{name}_{id}"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">File Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="downloadAllowedExtensions">File Extensions</Label>
                        <Input
                          id="downloadAllowedExtensions"
                          value={editedSubStage.downloadConfig.validationSettings?.allowedExtensions.join(', ') || ''}
                          onChange={(e) => {
                            const extensions = e.target.value.split(',').map(ext => ext.trim());
                            handleUpdateFileConfig('download', 'allowedExtensions', extensions, true);
                          }}
                          placeholder=".xlsx, .csv, .pdf"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="downloadAllowMultiple"
                      checked={editedSubStage.downloadConfig.allowMultiple}
                      onCheckedChange={(checked) => handleUpdateFileConfig('download', 'allowMultiple', !!checked)}
                    />
                    <Label htmlFor="downloadAllowMultiple">Allow multiple file downloads</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="downloadEmailNotifications"
                      checked={editedSubStage.downloadConfig.emailNotifications || false}
                      onCheckedChange={(checked) => handleUpdateFileConfig('download', 'emailNotifications', !!checked)}
                    />
                    <Label htmlFor="downloadEmailNotifications">Send email notifications</Label>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Download Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="downloadParameterSelect">Available Parameters</Label>
                        <Select
                          value={selectedParameterId}
                          onValueChange={setSelectedParameterId}
                        >
                          <SelectTrigger id="downloadParameterSelect">
                            <SelectValue placeholder="Select a parameter to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableParameters
                              .filter(param => !editedSubStage.downloadConfig?.parameters.some(p => p.id === param.id))
                              .map(param => (
                                <SelectItem key={param.id} value={param.id}>{param.name}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => handleAddFileParameter('download')}
                          disabled={!selectedParameterId}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Parameter
                        </Button>
                      </div>
                    </div>

                    {editedSubStage.downloadConfig.parameters.length === 0 ? (
                      <div className="text-center py-4 border rounded-md">
                        <p className="text-sm text-muted-foreground">
                          No parameters added. Use the dropdown above to add parameters.
                        </p>
                      </div>
                    ) : (
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
                                    const updatedParams = editedSubStage.downloadConfig?.parameters.map(p => {
                                      if (p.id === param.id) {
                                        return { ...p, isRequired: !!checked };
                                      }
                                      return p;
                                    }) || [];
                                    handleUpdateFileConfig('download', 'parameters', updatedParams);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFileParameter('download', param.id)}
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
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubStageConfigDialog;