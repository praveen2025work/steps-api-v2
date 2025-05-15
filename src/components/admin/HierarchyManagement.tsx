import React, { useState } from 'react';
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
import { Search, Plus, Edit, Trash2, MoveUp, MoveDown, Download, Upload, X, Check, AlertCircle } from 'lucide-react';
import { Hierarchy, HierarchyLevel } from '@/types/workflow-types';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample hierarchies
const sampleHierarchies: Hierarchy[] = [
  {
    id: 'hierarchy1',
    name: 'Financial Reporting Hierarchy',
    description: 'Hierarchy for financial reporting workflows',
    levels: [
      {
        id: 'level1',
        name: 'Region',
        columnName: 'region_code',
        parentHierarchyLevelId: undefined,
        parentColumnName: undefined,
        startFrom: true,
        lastNode: false,
        order: 1
      },
      {
        id: 'level2',
        name: 'Country',
        columnName: 'country_code',
        parentHierarchyLevelId: 'level1',
        parentColumnName: 'region_code',
        startFrom: false,
        lastNode: false,
        order: 2
      },
      {
        id: 'level3',
        name: 'Legal Entity',
        columnName: 'entity_id',
        parentHierarchyLevelId: 'level2',
        parentColumnName: 'country_code',
        startFrom: false,
        lastNode: true,
        order: 3
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'hierarchy2',
    name: 'Risk Assessment Hierarchy',
    description: 'Hierarchy for risk assessment workflows',
    levels: [
      {
        id: 'level4',
        name: 'Business Line',
        columnName: 'business_line',
        parentHierarchyLevelId: undefined,
        parentColumnName: undefined,
        startFrom: true,
        lastNode: false,
        order: 1
      },
      {
        id: 'level5',
        name: 'Risk Category',
        columnName: 'risk_category',
        parentHierarchyLevelId: 'level4',
        parentColumnName: 'business_line',
        startFrom: false,
        lastNode: false,
        order: 2
      },
      {
        id: 'level6',
        name: 'Risk Assessment',
        columnName: 'assessment_id',
        parentHierarchyLevelId: 'level5',
        parentColumnName: 'risk_category',
        startFrom: false,
        lastNode: true,
        order: 3
      }
    ],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'hierarchy3',
    name: 'Compliance Hierarchy',
    description: 'Hierarchy for compliance workflows',
    levels: [
      {
        id: 'level7',
        name: 'Regulation',
        columnName: 'regulation_code',
        parentHierarchyLevelId: undefined,
        parentColumnName: undefined,
        startFrom: true,
        lastNode: false,
        order: 1
      },
      {
        id: 'level8',
        name: 'Requirement',
        columnName: 'requirement_id',
        parentHierarchyLevelId: 'level7',
        parentColumnName: 'regulation_code',
        startFrom: false,
        lastNode: true,
        order: 2
      }
    ],
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: false
  }
];

// Form interfaces
interface HierarchyForm {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface LevelForm {
  id?: string;
  name: string;
  columnName: string;
  parentHierarchyLevelId?: string;
  parentColumnName?: string;
  startFrom: boolean;
  lastNode: boolean;
  order: number;
}

const HierarchyManagement: React.FC = () => {
  const [hierarchies, setHierarchies] = useState<Hierarchy[]>(sampleHierarchies);
  const [searchTerm, setSearchTerm] = useState('');
  const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false);
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLevelDialogOpen, setDeleteLevelDialogOpen] = useState(false);
  const [selectedHierarchy, setSelectedHierarchy] = useState<Hierarchy | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<HierarchyLevel | null>(null);
  const [hierarchyToDelete, setHierarchyToDelete] = useState<string>('');
  const [levelToDelete, setLevelToDelete] = useState<{hierarchyId: string, levelId: string}>({hierarchyId: '', levelId: ''});
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  
  // Form states
  const [hierarchyForm, setHierarchyForm] = useState<HierarchyForm>({
    name: '',
    description: '',
    isActive: true
  });
  
  const [levelForm, setLevelForm] = useState<LevelForm>({
    name: '',
    columnName: '',
    parentHierarchyLevelId: undefined,
    parentColumnName: undefined,
    startFrom: false,
    lastNode: false,
    order: 1
  });
  
  // Filter hierarchies based on search term
  const filteredHierarchies = hierarchies.filter(hierarchy => 
    hierarchy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hierarchy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (hierarchyDialogOpen && selectedHierarchy) {
      setHierarchyForm({
        id: selectedHierarchy.id,
        name: selectedHierarchy.name,
        description: selectedHierarchy.description,
        isActive: selectedHierarchy.isActive
      });
    } else if (hierarchyDialogOpen) {
      setHierarchyForm({
        name: '',
        description: '',
        isActive: true
      });
    }
  }, [hierarchyDialogOpen, selectedHierarchy]);
  
  React.useEffect(() => {
    if (levelDialogOpen && selectedLevel && selectedHierarchy) {
      setLevelForm({
        id: selectedLevel.id,
        name: selectedLevel.name,
        columnName: selectedLevel.columnName,
        parentHierarchyLevelId: selectedLevel.parentHierarchyLevelId,
        parentColumnName: selectedLevel.parentColumnName,
        startFrom: selectedLevel.startFrom,
        lastNode: selectedLevel.lastNode,
        order: selectedLevel.order
      });
    } else if (levelDialogOpen && selectedHierarchy) {
      // For a new level, set default values
      const newOrder = selectedHierarchy.levels.length > 0 
        ? Math.max(...selectedHierarchy.levels.map(level => level.order)) + 1 
        : 1;
      
      setLevelForm({
        name: '',
        columnName: '',
        parentHierarchyLevelId: selectedHierarchy.levels.length > 0 ? selectedHierarchy.levels[selectedHierarchy.levels.length - 1].id : undefined,
        parentColumnName: selectedHierarchy.levels.length > 0 ? selectedHierarchy.levels[selectedHierarchy.levels.length - 1].columnName : undefined,
        startFrom: selectedHierarchy.levels.length === 0, // First level is startFrom by default
        lastNode: false,
        order: newOrder
      });
    }
  }, [levelDialogOpen, selectedLevel, selectedHierarchy]);
  
  // Form handlers
  const handleHierarchyFormChange = (field: keyof HierarchyForm, value: any) => {
    setHierarchyForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLevelFormChange = (field: keyof LevelForm, value: any) => {
    setLevelForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Save hierarchy
  const saveHierarchy = () => {
    if (!hierarchyForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Hierarchy name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (hierarchyForm.id) {
      // Update existing hierarchy
      setHierarchies(prev => prev.map(hierarchy => 
        hierarchy.id === hierarchyForm.id 
          ? { 
              ...hierarchy, 
              name: hierarchyForm.name, 
              description: hierarchyForm.description, 
              isActive: hierarchyForm.isActive,
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User'
            } 
          : hierarchy
      ));
      toast({
        title: "Hierarchy Updated",
        description: `Hierarchy "${hierarchyForm.name}" has been updated successfully.`
      });
    } else {
      // Add new hierarchy
      const newHierarchy: Hierarchy = {
        id: `hierarchy-${Date.now()}`,
        name: hierarchyForm.name,
        description: hierarchyForm.description,
        levels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        updatedBy: 'Current User',
        isActive: hierarchyForm.isActive
      };
      
      setHierarchies(prev => [...prev, newHierarchy]);
      toast({
        title: "Hierarchy Added",
        description: `Hierarchy "${hierarchyForm.name}" has been added successfully.`
      });
    }
    
    setHierarchyDialogOpen(false);
  };
  
  // Save level
  const saveLevel = () => {
    if (!levelForm.name.trim() || !levelForm.columnName.trim() || !selectedHierarchy) {
      toast({
        title: "Validation Error",
        description: "Level name and column name are required, and a hierarchy must be selected",
        variant: "destructive"
      });
      return;
    }
    
    // Validate parent level if not the first level
    if (selectedHierarchy.levels.length > 0 && !levelForm.id && !levelForm.parentHierarchyLevelId) {
      toast({
        title: "Validation Error",
        description: "Parent hierarchy level is required for non-first levels",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this is the first level (no existing levels or updating the first level)
    const isFirstLevel = selectedHierarchy.levels.length === 0 || 
      (levelForm.id && selectedHierarchy.levels.findIndex(l => l.id === levelForm.id) === 0);
    
    // If this is the first level, it should not have a parent
    if (isFirstLevel) {
      levelForm.parentHierarchyLevelId = undefined;
      levelForm.parentColumnName = undefined;
    }
    
    // If startFrom is true, make sure no other level has startFrom
    if (levelForm.startFrom) {
      // If updating an existing level that already has startFrom, no need to check
      const needToCheck = !levelForm.id || (levelForm.id && !selectedHierarchy.levels.find(l => l.id === levelForm.id)?.startFrom);
      
      if (needToCheck && selectedHierarchy.levels.some(l => l.startFrom && l.id !== levelForm.id)) {
        toast({
          title: "Validation Error",
          description: "Only one level can be marked as 'Start From'",
          variant: "destructive"
        });
        return;
      }
    }
    
    // If lastNode is true, make sure no other level has lastNode
    if (levelForm.lastNode) {
      // If updating an existing level that already has lastNode, no need to check
      const needToCheck = !levelForm.id || (levelForm.id && !selectedHierarchy.levels.find(l => l.id === levelForm.id)?.lastNode);
      
      if (needToCheck && selectedHierarchy.levels.some(l => l.lastNode && l.id !== levelForm.id)) {
        toast({
          title: "Validation Error",
          description: "Only one level can be marked as 'Last Node'",
          variant: "destructive"
        });
        return;
      }
    }
    
    const newLevel: HierarchyLevel = {
      id: levelForm.id || `level-${Date.now()}`,
      name: levelForm.name,
      columnName: levelForm.columnName,
      parentHierarchyLevelId: levelForm.parentHierarchyLevelId,
      parentColumnName: levelForm.parentColumnName,
      startFrom: levelForm.startFrom,
      lastNode: levelForm.lastNode,
      order: levelForm.order
    };
    
    if (levelForm.id) {
      // Update existing level
      setHierarchies(prev => prev.map(hierarchy => 
        hierarchy.id === selectedHierarchy.id 
          ? { 
              ...hierarchy, 
              levels: hierarchy.levels.map(level => 
                level.id === levelForm.id ? newLevel : level
              ),
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User'
            } 
          : hierarchy
      ));
      toast({
        title: "Level Updated",
        description: `Hierarchy level "${levelForm.name}" has been updated successfully.`
      });
    } else {
      // Add new level
      setHierarchies(prev => prev.map(hierarchy => 
        hierarchy.id === selectedHierarchy.id 
          ? { 
              ...hierarchy, 
              levels: [...hierarchy.levels, newLevel].sort((a, b) => a.order - b.order),
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User'
            } 
          : hierarchy
      ));
      toast({
        title: "Level Added",
        description: `Hierarchy level "${levelForm.name}" has been added successfully.`
      });
    }
    
    setLevelDialogOpen(false);
  };
  
  // Delete hierarchy
  const confirmDeleteHierarchy = () => {
    setHierarchies(prev => prev.filter(hierarchy => hierarchy.id !== hierarchyToDelete));
    setDeleteDialogOpen(false);
    toast({
      title: "Hierarchy Deleted",
      description: "The hierarchy has been deleted successfully."
    });
  };
  
  // Delete level
  const confirmDeleteLevel = () => {
    setHierarchies(prev => prev.map(hierarchy => 
      hierarchy.id === levelToDelete.hierarchyId 
        ? { 
            ...hierarchy, 
            levels: hierarchy.levels.filter(level => level.id !== levelToDelete.levelId),
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          } 
        : hierarchy
    ));
    setDeleteLevelDialogOpen(false);
    toast({
      title: "Level Deleted",
      description: "The hierarchy level has been deleted successfully."
    });
  };
  
  // Move level up or down
  const moveLevel = (hierarchyId: string, levelId: string, direction: 'up' | 'down') => {
    const hierarchy = hierarchies.find(h => h.id === hierarchyId);
    if (!hierarchy) return;
    
    const levelIndex = hierarchy.levels.findIndex(level => level.id === levelId);
    if (levelIndex === -1) return;
    
    if ((direction === 'up' && levelIndex === 0) || 
        (direction === 'down' && levelIndex === hierarchy.levels.length - 1)) {
      return;
    }
    
    const newLevels = [...hierarchy.levels];
    const targetIndex = direction === 'up' ? levelIndex - 1 : levelIndex + 1;
    
    // Swap the levels
    [newLevels[levelIndex], newLevels[targetIndex]] = [newLevels[targetIndex], newLevels[levelIndex]];
    
    // Update the order property
    newLevels.forEach((level, index) => {
      level.order = index + 1;
    });
    
    // Update parent references if needed
    if (direction === 'up' && levelIndex > 1) {
      // If moving up and not the second level, update parent reference
      newLevels[levelIndex].parentHierarchyLevelId = newLevels[levelIndex - 2].id;
      newLevels[levelIndex].parentColumnName = newLevels[levelIndex - 2].columnName;
    } else if (direction === 'down' && targetIndex < newLevels.length - 1) {
      // If moving down and not becoming the last level, update the next level's parent reference
      newLevels[targetIndex + 1].parentHierarchyLevelId = newLevels[targetIndex].id;
      newLevels[targetIndex + 1].parentColumnName = newLevels[targetIndex].columnName;
    }
    
    // Update the hierarchy
    setHierarchies(prev => prev.map(h => 
      h.id === hierarchyId 
        ? { 
            ...h, 
            levels: newLevels,
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          } 
        : h
    ));
  };
  
  // Export hierarchy
  const exportHierarchy = (hierarchy: Hierarchy) => {
    const data = {
      name: hierarchy.name,
      description: hierarchy.description,
      levels: hierarchy.levels.map(level => ({
        name: level.name,
        columnName: level.columnName,
        parentHierarchyLevelId: level.parentHierarchyLevelId,
        parentColumnName: level.parentColumnName,
        startFrom: level.startFrom,
        lastNode: level.lastNode,
        order: level.order
      }))
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hierarchy.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Hierarchy Exported",
      description: `Hierarchy "${hierarchy.name}" has been exported successfully.`
    });
  };
  
  // Import hierarchy
  const importHierarchy = () => {
    try {
      const data = JSON.parse(importText);
      
      if (!data.name || !Array.isArray(data.levels)) {
        throw new Error('Invalid format');
      }
      
      const newHierarchy: Hierarchy = {
        id: `hierarchy-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        levels: data.levels.map((level: any, index: number) => ({
          id: `imported-level-${index}`,
          name: level.name,
          columnName: level.columnName,
          parentHierarchyLevelId: level.parentHierarchyLevelId,
          parentColumnName: level.parentColumnName,
          startFrom: level.startFrom,
          lastNode: level.lastNode,
          order: level.order || index + 1
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        updatedBy: 'Current User',
        isActive: true
      };
      
      setHierarchies(prev => [...prev, newHierarchy]);
      setImportDialogOpen(false);
      setImportText('');
      
      toast({
        title: "Hierarchy Imported",
        description: `Hierarchy "${data.name}" with ${data.levels.length} levels has been imported successfully.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import hierarchy. Please check the format of your JSON data.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
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
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Hierarchy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Import Hierarchy</DialogTitle>
                <DialogDescription>
                  Import a hierarchy from JSON format
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="importJson">Paste JSON data</Label>
                  <Textarea 
                    id="importJson" 
                    placeholder='{"name": "Hierarchy Name", "description": "Description", "levels": [{"name": "Level Name", "columnName": "column_name", "startFrom": true, "lastNode": false, "order": 1}]}' 
                    rows={10} 
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={importHierarchy} disabled={!importText.trim()}>
                  Import Hierarchy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={hierarchyDialogOpen} onOpenChange={setHierarchyDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedHierarchy(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Hierarchy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedHierarchy ? 'Edit Hierarchy' : 'Add New Hierarchy'}</DialogTitle>
                <DialogDescription>
                  {selectedHierarchy ? 'Update the hierarchy details' : 'Create a new hierarchy'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hierarchy Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter hierarchy name" 
                    value={hierarchyForm.name}
                    onChange={(e) => handleHierarchyFormChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter hierarchy description" 
                    value={hierarchyForm.description}
                    onChange={(e) => handleHierarchyFormChange('description', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isActive" 
                    checked={hierarchyForm.isActive}
                    onCheckedChange={(checked) => handleHierarchyFormChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Hierarchy is active</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setHierarchyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveHierarchy}>
                  {selectedHierarchy ? 'Update Hierarchy' : 'Create Hierarchy'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Levels</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHierarchies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No hierarchies found
                </TableCell>
              </TableRow>
            ) : (
              filteredHierarchies.map((hierarchy) => (
                <React.Fragment key={hierarchy.id}>
                  <TableRow>
                    <TableCell className="font-medium">{hierarchy.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{hierarchy.description}</TableCell>
                    <TableCell>{hierarchy.levels.length} levels</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        hierarchy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hierarchy.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => exportHierarchy(hierarchy)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedHierarchy(hierarchy);
                          setHierarchyDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setHierarchyToDelete(hierarchy.id);
                          setDeleteDialogOpen(true);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="p-0 border-t-0">
                      <div className="px-4 py-2 bg-muted/30">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-4">
                            <h4 className="text-sm font-medium">Hierarchy Levels</h4>
                          </div>
                          <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedHierarchy(hierarchy);
                                setSelectedLevel(null);
                              }}>
                                <Plus className="mr-2 h-4 w-4" /> Add Level
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>{selectedLevel ? 'Edit Level' : 'Add New Level'}</DialogTitle>
                                <DialogDescription>
                                  {selectedLevel ? 'Update the hierarchy level details' : 'Add a new level to the hierarchy'}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="levelName">Level Name</Label>
                                    <Input 
                                      id="levelName" 
                                      placeholder="Enter level name" 
                                      value={levelForm.name}
                                      onChange={(e) => handleLevelFormChange('name', e.target.value)}
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
                                
                                {hierarchy.levels.length > 0 && !selectedLevel && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="parentLevel">Parent Level</Label>
                                      <Select 
                                        value={levelForm.parentHierarchyLevelId} 
                                        onValueChange={(value) => {
                                          const parentLevel = hierarchy.levels.find(l => l.id === value);
                                          handleLevelFormChange('parentHierarchyLevelId', value);
                                          if (parentLevel) {
                                            handleLevelFormChange('parentColumnName', parentLevel.columnName);
                                          }
                                        }}
                                      >
                                        <SelectTrigger id="parentLevel">
                                          <SelectValue placeholder="Select parent level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {hierarchy.levels.map((level) => (
                                            <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="parentColumnName">Parent Column Name</Label>
                                      <Input 
                                        id="parentColumnName" 
                                        placeholder="Parent column name" 
                                        value={levelForm.parentColumnName || ''}
                                        onChange={(e) => handleLevelFormChange('parentColumnName', e.target.value)}
                                        disabled={true}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="levelOrder">Level Order</Label>
                                    <Input 
                                      id="levelOrder" 
                                      type="number" 
                                      placeholder="Enter level order" 
                                      value={levelForm.order}
                                      onChange={(e) => handleLevelFormChange('order', parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch 
                                      id="startFrom" 
                                      checked={levelForm.startFrom}
                                      onCheckedChange={(checked) => handleLevelFormChange('startFrom', checked)}
                                    />
                                    <Label htmlFor="startFrom">Start From</Label>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Switch 
                                      id="lastNode" 
                                      checked={levelForm.lastNode}
                                      onCheckedChange={(checked) => handleLevelFormChange('lastNode', checked)}
                                    />
                                    <Label htmlFor="lastNode">Last Node</Label>
                                  </div>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setLevelDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={saveLevel}>
                                  {selectedLevel ? 'Update Level' : 'Add Level'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        {hierarchy.levels.length === 0 ? (
                          <div className="text-center py-4 border rounded-md">
                            <p className="text-sm text-muted-foreground">
                              No levels defined for this hierarchy. Click "Add Level" to create one.
                            </p>
                          </div>
                        ) : (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Hierarchy Structure</CardTitle>
                              <CardDescription>
                                Define the levels of your hierarchy and their relationships
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Hierarchy Level</TableHead>
                                    <TableHead>Column Name</TableHead>
                                    <TableHead>Parent Level</TableHead>
                                    <TableHead>Parent Column</TableHead>
                                    <TableHead>Start From</TableHead>
                                    <TableHead>Last Node</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {hierarchy.levels.sort((a, b) => a.order - b.order).map((level) => (
                                    <TableRow key={level.id}>
                                      <TableCell className="font-medium">{level.order}. {level.name}</TableCell>
                                      <TableCell>{level.columnName}</TableCell>
                                      <TableCell>
                                        {level.parentHierarchyLevelId 
                                          ? hierarchy.levels.find(l => l.id === level.parentHierarchyLevelId)?.name || '-' 
                                          : '-'}
                                      </TableCell>
                                      <TableCell>{level.parentColumnName || '-'}</TableCell>
                                      <TableCell>
                                        {level.startFrom ? (
                                          <Badge variant="default" className="bg-blue-500">Yes</Badge>
                                        ) : (
                                          <Badge variant="outline">No</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {level.lastNode ? (
                                          <Badge variant="default" className="bg-green-500">Yes</Badge>
                                        ) : (
                                          <Badge variant="outline">No</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                          <Button variant="ghost" size="sm" onClick={() => {
                                            setSelectedHierarchy(hierarchy);
                                            setSelectedLevel(level);
                                            setLevelDialogOpen(true);
                                          }}>
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => {
                                            setLevelToDelete({ hierarchyId: hierarchy.id, levelId: level.id });
                                            setDeleteLevelDialogOpen(true);
                                          }}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => moveLevel(hierarchy.id, level.id, 'up')}>
                                            <MoveUp className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => moveLevel(hierarchy.id, level.id, 'down')}>
                                            <MoveDown className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              
                              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                                <h5 className="text-sm font-medium mb-2">Hierarchy Requirements</h5>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                  <li className="flex items-start space-x-2">
                                    <Check className="h-4 w-4 mt-0.5 text-green-500" />
                                    <span>Minimum of two hierarchy levels are required</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <Check className="h-4 w-4 mt-0.5 text-green-500" />
                                    <span>One level must be marked as "Start From" (defines dashboard start level)</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <Check className="h-4 w-4 mt-0.5 text-green-500" />
                                    <span>One level must be marked as "Last Node" (defines workflow instance)</span>
                                  </li>
                                  <li className="flex items-start space-x-2">
                                    <Check className="h-4 w-4 mt-0.5 text-green-500" />
                                    <span>Each level (except the first) must have a parent level</span>
                                  </li>
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Hierarchy Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected hierarchy and all its levels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHierarchy}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Level Confirmation Dialog */}
      <AlertDialog open={deleteLevelDialogOpen} onOpenChange={setDeleteLevelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Level</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hierarchy level? This action cannot be undone.
              
              {levelToDelete.hierarchyId && levelToDelete.levelId && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700">Warning</p>
                      <p className="text-sm text-amber-700">
                        Deleting this level may break parent-child relationships in the hierarchy.
                        Make sure to update any dependent levels after deletion.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLevel}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HierarchyManagement;