import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Building,
  Layers
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useApiClient, UniqueApplication } from '@/lib/api-client';
import { 
  UniqueHierarchy, 
  HierarchyDetail, 
  SetHierarchyRequest, 
  ApplicationToHierarchyMap, 
  SetApplicationHierarchyMapRequest,
  HierarchyStructure,
  HierarchyForm,
  HierarchyLevelForm,
  ApplicationMappingForm
} from '@/types/hierarchy-api-types';

const HierarchyManagement: React.FC = () => {
  const apiClient = useApiClient();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('hierarchies');
  
  // Data state
  const [uniqueHierarchies, setUniqueHierarchies] = useState<UniqueHierarchy[]>([]);
  const [hierarchyDetails, setHierarchyDetails] = useState<HierarchyDetail[]>([]);
  const [applicationMappings, setApplicationMappings] = useState<ApplicationToHierarchyMap[]>([]);
  const [hierarchyStructures, setHierarchyStructures] = useState<HierarchyStructure[]>([]);
  const [uniqueApplications, setUniqueApplications] = useState<UniqueApplication[]>([]);
  
  // Dialog states
  const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false);
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Selected items
  const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchyStructure | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<HierarchyDetail | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'hierarchy' | 'level'; id: number; levelId?: number }>({ type: 'hierarchy', id: 0 });
  
  // Form states
  const [hierarchyForm, setHierarchyForm] = useState<HierarchyForm>({
    hierarchyName: '',
    hierarchyDescription: ''
  });
  
  const [levelForm, setLevelForm] = useState<HierarchyLevelForm>({
    hierarchyLevel: 1,
    columnName: '',
    parentHierarchyLevel: 0,
    parentColumnName: 'NA',
    isUsedForEntitlements: false,
    isUsedForWorkflowInstance: false
  });
  
  const [mappingForm, setMappingForm] = useState<ApplicationMappingForm>({
    applicationId: 0,
    hierarchyId: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Combine data into hierarchy structures
  useEffect(() => {
    combineHierarchyData();
  }, [uniqueHierarchies, hierarchyDetails, applicationMappings]);

  // Load all hierarchy data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [hierarchiesResponse, detailsResponse, mappingsResponse, applicationsResponse] = await Promise.all([
        apiClient.getUniqueHierarchies(),
        apiClient.getHierarchyDetails(),
        apiClient.getApplicationToHierarchyMap(),
        apiClient.getUniqueApplications()
      ]);

      if (hierarchiesResponse.success) {
        setUniqueHierarchies(hierarchiesResponse.data);
      } else {
        toast({
          title: "Error Loading Hierarchies",
          description: hierarchiesResponse.error || "Failed to load unique hierarchies",
          variant: "destructive"
        });
      }

      if (detailsResponse.success) {
        setHierarchyDetails(detailsResponse.data);
      } else {
        toast({
          title: "Error Loading Hierarchy Details",
          description: detailsResponse.error || "Failed to load hierarchy details",
          variant: "destructive"
        });
      }

      if (mappingsResponse.success) {
        setApplicationMappings(mappingsResponse.data);
      } else {
        toast({
          title: "Error Loading Application Mappings",
          description: mappingsResponse.error || "Failed to load application mappings",
          variant: "destructive"
        });
      }

      if (applicationsResponse.success) {
        setUniqueApplications(applicationsResponse.data);
      } else {
        toast({
          title: "Error Loading Applications",
          description: applicationsResponse.error || "Failed to load unique applications",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Loading Data",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Combine data into structured format
  const combineHierarchyData = () => {
    const structures: HierarchyStructure[] = uniqueHierarchies.map(hierarchy => {
      const levels = hierarchyDetails
        .filter(detail => detail.hierarchyId === hierarchy.hierarchyId)
        .sort((a, b) => a.hierarchyLevel - b.hierarchyLevel)
        .map(detail => ({
          hierarchyLevel: detail.hierarchyLevel,
          columnName: detail.columnName,
          parentHierarchyLevel: detail.parentHierarchyLevel,
          parentColumnName: detail.parentColumnName,
          isUsedForEntitlements: detail.isUsedForEntitlements,
          isUsedForWorkflowInstance: detail.isUsedForWorkflowInstance
        }));

      const mappings = applicationMappings.filter(mapping => mapping.hierarchyId === hierarchy.hierarchyId);
      
      // Get description from the first level detail (if available)
      const firstLevel = hierarchyDetails.find(detail => 
        detail.hierarchyId === hierarchy.hierarchyId && detail.hierarchyLevel === 1
      );

      return {
        hierarchyId: hierarchy.hierarchyId,
        hierarchyName: hierarchy.hierarchyName,
        hierarchyDescription: firstLevel?.hierarchyDescription || '',
        levels,
        applicationMappings: mappings
      };
    });

    setHierarchyStructures(structures);
  };

  // Filter hierarchies based on search term
  const filteredHierarchies = hierarchyStructures.filter(hierarchy =>
    hierarchy.hierarchyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hierarchy.hierarchyDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form handlers
  const handleHierarchyFormChange = (field: keyof HierarchyForm, value: any) => {
    setHierarchyForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLevelFormChange = (field: keyof HierarchyLevelForm, value: any) => {
    setLevelForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMappingFormChange = (field: keyof ApplicationMappingForm, value: any) => {
    setMappingForm(prev => ({ ...prev, [field]: value }));
  };

  // Reset forms
  const resetHierarchyForm = () => {
    setHierarchyForm({
      hierarchyName: '',
      hierarchyDescription: ''
    });
  };

  const resetLevelForm = () => {
    setLevelForm({
      hierarchyLevel: 1,
      columnName: '',
      parentHierarchyLevel: 0,
      parentColumnName: 'NA',
      isUsedForEntitlements: false,
      isUsedForWorkflowInstance: false
    });
  };

  const resetMappingForm = () => {
    setMappingForm({
      applicationId: 0,
      hierarchyId: 0
    });
  };

  // Save hierarchy
  const saveHierarchy = async () => {
    if (!hierarchyForm.hierarchyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Hierarchy name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const hierarchyData: SetHierarchyRequest[] = [{
        action: selectedHierarchy ? 2 : 1, // 2 = Update, 1 = Add
        hierarchyId: selectedHierarchy?.hierarchyId || 0,
        hierarchyName: hierarchyForm.hierarchyName,
        hierarchyDescription: hierarchyForm.hierarchyDescription,
        hierarchyLevel: 1,
        columnName: 'Root',
        parentHierarchyLevel: 0,
        parentcolumnName: 'NA',
        isUsedForEntitlements: false,
        isUsedForworkflowInstance: false
      }];

      const response = await apiClient.setHierarchy(hierarchyData);
      
      if (response.success) {
        toast({
          title: selectedHierarchy ? "Hierarchy Updated" : "Hierarchy Created",
          description: `Hierarchy "${hierarchyForm.hierarchyName}" has been ${selectedHierarchy ? 'updated' : 'created'} successfully.`
        });
        
        setHierarchyDialogOpen(false);
        resetHierarchyForm();
        setSelectedHierarchy(null);
        await loadAllData();
      } else {
        toast({
          title: "Error Saving Hierarchy",
          description: response.error || "Failed to save hierarchy",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Saving Hierarchy",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save hierarchy level
  const saveLevel = async () => {
    if (!levelForm.columnName.trim() || !selectedHierarchy) {
      toast({
        title: "Validation Error",
        description: "Column name is required and a hierarchy must be selected",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const levelData: SetHierarchyRequest[] = [{
        action: selectedLevel ? 2 : 1, // 2 = Update, 1 = Add
        hierarchyId: selectedHierarchy.hierarchyId,
        hierarchyName: selectedHierarchy.hierarchyName,
        hierarchyDescription: selectedHierarchy.hierarchyDescription,
        hierarchyLevel: levelForm.hierarchyLevel,
        columnName: levelForm.columnName,
        parentHierarchyLevel: levelForm.parentHierarchyLevel,
        parentcolumnName: levelForm.parentColumnName,
        isUsedForEntitlements: levelForm.isUsedForEntitlements,
        isUsedForworkflowInstance: levelForm.isUsedForWorkflowInstance
      }];

      const response = await apiClient.setHierarchy(levelData);
      
      if (response.success) {
        toast({
          title: selectedLevel ? "Level Updated" : "Level Added",
          description: `Hierarchy level "${levelForm.columnName}" has been ${selectedLevel ? 'updated' : 'added'} successfully.`
        });
        
        setLevelDialogOpen(false);
        resetLevelForm();
        setSelectedLevel(null);
        await loadAllData();
      } else {
        toast({
          title: "Error Saving Level",
          description: response.error || "Failed to save hierarchy level",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Saving Level",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save application mapping
  const saveMapping = async () => {
    if (mappingForm.applicationId === 0 || mappingForm.hierarchyId === 0) {
      toast({
        title: "Validation Error",
        description: "Both application and hierarchy must be selected",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const mappingData: SetApplicationHierarchyMapRequest = {
        action: 1, // 1 = Add
        applicationId: mappingForm.applicationId,
        hierarchyId: mappingForm.hierarchyId
      };

      const response = await apiClient.setApplicationHierarchyMap(mappingData);
      
      if (response.success) {
        toast({
          title: "Mapping Created",
          description: "Application to hierarchy mapping has been created successfully."
        });
        
        setMappingDialogOpen(false);
        resetMappingForm();
        await loadAllData();
      } else {
        toast({
          title: "Error Saving Mapping",
          description: response.error || "Failed to save application mapping",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Saving Mapping",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const confirmDelete = async () => {
    setLoading(true);
    try {
      if (itemToDelete.type === 'hierarchy') {
        // Delete hierarchy - this would require implementing delete functionality
        toast({
          title: "Delete Not Implemented",
          description: "Hierarchy deletion is not yet implemented in the API",
          variant: "destructive"
        });
      } else if (itemToDelete.type === 'level') {
        // Delete level - this would require implementing delete functionality
        toast({
          title: "Delete Not Implemented",
          description: "Level deletion is not yet implemented in the API",
          variant: "destructive"
        });
      }
      
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error Deleting Item",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Open hierarchy dialog for editing
  const openHierarchyDialog = (hierarchy?: HierarchyStructure) => {
    if (hierarchy) {
      setSelectedHierarchy(hierarchy);
      setHierarchyForm({
        hierarchyId: hierarchy.hierarchyId,
        hierarchyName: hierarchy.hierarchyName,
        hierarchyDescription: hierarchy.hierarchyDescription
      });
    } else {
      setSelectedHierarchy(null);
      resetHierarchyForm();
    }
    setHierarchyDialogOpen(true);
  };

  // Open level dialog for editing
  const openLevelDialog = (hierarchy: HierarchyStructure, level?: HierarchyDetail) => {
    setSelectedHierarchy(hierarchy);
    
    if (level) {
      setSelectedLevel(level);
      setLevelForm({
        hierarchyLevel: level.hierarchyLevel,
        columnName: level.columnName,
        parentHierarchyLevel: level.parentHierarchyLevel,
        parentColumnName: level.parentColumnName,
        isUsedForEntitlements: level.isUsedForEntitlements,
        isUsedForWorkflowInstance: level.isUsedForWorkflowInstance
      });
    } else {
      setSelectedLevel(null);
      const nextLevel = Math.max(...hierarchy.levels.map(l => l.hierarchyLevel), 0) + 1;
      setLevelForm({
        hierarchyLevel: nextLevel,
        columnName: '',
        parentHierarchyLevel: nextLevel > 1 ? nextLevel - 1 : 0,
        parentColumnName: nextLevel > 1 ? hierarchy.levels[hierarchy.levels.length - 1]?.columnName || 'NA' : 'NA',
        isUsedForEntitlements: false,
        isUsedForWorkflowInstance: false
      });
    }
    setLevelDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hierarchies..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={() => openHierarchyDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hierarchy
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hierarchies" className="flex items-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>Hierarchies</span>
          </TabsTrigger>
          <TabsTrigger value="mappings" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Application Mappings</span>
          </TabsTrigger>
        </TabsList>

        {/* Hierarchies Tab */}
        <TabsContent value="hierarchies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hierarchy Management</CardTitle>
              <CardDescription>
                Manage organizational hierarchies and their level structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredHierarchies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hierarchies found
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredHierarchies.map((hierarchy) => (
                    <Card key={hierarchy.hierarchyId} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{hierarchy.hierarchyName}</CardTitle>
                            <CardDescription>{hierarchy.hierarchyDescription}</CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openLevelDialog(hierarchy)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Level
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openHierarchyDialog(hierarchy)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {hierarchy.levels.length === 0 ? (
                          <div className="text-center py-4 border rounded-md bg-muted/30">
                            <p className="text-sm text-muted-foreground">
                              No levels defined. Click "Add Level" to create one.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              {hierarchy.levels.map((level, index) => (
                                <div key={`${hierarchy.hierarchyId}-${level.hierarchyLevel}`} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                                  <div className="flex items-center space-x-4">
                                    <Badge variant="outline" className="font-mono">
                                      L{level.hierarchyLevel}
                                    </Badge>
                                    <div>
                                      <p className="font-medium">{level.columnName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Parent: {level.parentColumnName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {level.isUsedForEntitlements && (
                                      <Badge variant="secondary">Entitlements</Badge>
                                    )}
                                    {level.isUsedForWorkflowInstance && (
                                      <Badge variant="secondary">Workflow</Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const levelDetail = hierarchyDetails.find(d => 
                                          d.hierarchyId === hierarchy.hierarchyId && 
                                          d.hierarchyLevel === level.hierarchyLevel
                                        );
                                        if (levelDetail) {
                                          openLevelDialog(hierarchy, levelDetail);
                                        }
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Application Mappings Tab */}
        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Application to Hierarchy Mappings</CardTitle>
                  <CardDescription>
                    Manage which applications are mapped to which hierarchies
                  </CardDescription>
                </div>
                <Button onClick={() => setMappingDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : applicationMappings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No application mappings found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Hierarchy</TableHead>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Hierarchy ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicationMappings.map((mapping, index) => (
                      <TableRow key={`${mapping.applicationId}-${mapping.hierarchyId}`}>
                        <TableCell className="font-medium">{mapping.applicationName}</TableCell>
                        <TableCell>{mapping.hierarchyName}</TableCell>
                        <TableCell>{mapping.applicationId}</TableCell>
                        <TableCell>{mapping.hierarchyId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hierarchy Dialog */}
      <Dialog open={hierarchyDialogOpen} onOpenChange={setHierarchyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedHierarchy ? 'Edit Hierarchy' : 'Add New Hierarchy'}
            </DialogTitle>
            <DialogDescription>
              {selectedHierarchy ? 'Update the hierarchy details' : 'Create a new hierarchy'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hierarchyName">Hierarchy Name</Label>
              <Input 
                id="hierarchyName" 
                placeholder="Enter hierarchy name" 
                value={hierarchyForm.hierarchyName}
                onChange={(e) => handleHierarchyFormChange('hierarchyName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hierarchyDescription">Description</Label>
              <Textarea 
                id="hierarchyDescription" 
                placeholder="Enter hierarchy description" 
                value={hierarchyForm.hierarchyDescription}
                onChange={(e) => handleHierarchyFormChange('hierarchyDescription', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setHierarchyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveHierarchy} disabled={loading}>
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {selectedHierarchy ? 'Update Hierarchy' : 'Create Hierarchy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Level Dialog */}
      <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedLevel ? 'Edit Level' : 'Add New Level'}
            </DialogTitle>
            <DialogDescription>
              {selectedLevel ? 'Update the hierarchy level details' : 'Add a new level to the hierarchy'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hierarchyLevel">Level Number</Label>
                <Input 
                  id="hierarchyLevel" 
                  type="number"
                  placeholder="Enter level number" 
                  value={levelForm.hierarchyLevel}
                  onChange={(e) => handleLevelFormChange('hierarchyLevel', parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="columnName">Column Name</Label>
                <Input 
                  id="columnName" 
                  placeholder="Enter column name" 
                  value={levelForm.columnName}
                  onChange={(e) => handleLevelFormChange('columnName', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentHierarchyLevel">Parent Level</Label>
                <Input 
                  id="parentHierarchyLevel" 
                  type="number"
                  placeholder="Enter parent level" 
                  value={levelForm.parentHierarchyLevel}
                  onChange={(e) => handleLevelFormChange('parentHierarchyLevel', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentColumnName">Parent Column Name</Label>
                <Input 
                  id="parentColumnName" 
                  placeholder="Enter parent column name" 
                  value={levelForm.parentColumnName}
                  onChange={(e) => handleLevelFormChange('parentColumnName', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isUsedForEntitlements" 
                  checked={levelForm.isUsedForEntitlements}
                  onCheckedChange={(checked) => handleLevelFormChange('isUsedForEntitlements', checked)}
                />
                <Label htmlFor="isUsedForEntitlements">Used for Entitlements</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isUsedForWorkflowInstance" 
                  checked={levelForm.isUsedForWorkflowInstance}
                  onCheckedChange={(checked) => handleLevelFormChange('isUsedForWorkflowInstance', checked)}
                />
                <Label htmlFor="isUsedForWorkflowInstance">Used for Workflow Instance</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLevelDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveLevel} disabled={loading}>
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {selectedLevel ? 'Update Level' : 'Add Level'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mapping Dialog */}
      <Dialog open={mappingDialogOpen} onOpenChange={setMappingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Application Mapping</DialogTitle>
            <DialogDescription>
              Map an application to a hierarchy
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="applicationId">Application</Label>
              <Select 
                value={mappingForm.applicationId.toString()} 
                onValueChange={(value) => handleMappingFormChange('applicationId', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Select an application</SelectItem>
                  {uniqueApplications.map((application) => (
                    <SelectItem key={application.configId} value={application.configId}>
                      {application.configName} ({application.configType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hierarchyId">Hierarchy</Label>
              <Select 
                value={mappingForm.hierarchyId.toString()} 
                onValueChange={(value) => handleMappingFormChange('hierarchyId', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hierarchy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Select a hierarchy</SelectItem>
                  {uniqueHierarchies.map((hierarchy) => (
                    <SelectItem key={hierarchy.hierarchyId} value={hierarchy.hierarchyId.toString()}>
                      {hierarchy.hierarchyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMappingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMapping} disabled={loading}>
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Create Mapping
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
              This action cannot be undone. This will permanently delete the selected {itemToDelete.type}.
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

export default HierarchyManagement;