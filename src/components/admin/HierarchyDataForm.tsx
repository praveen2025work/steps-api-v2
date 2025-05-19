import { useState, useEffect } from 'react';
import { HierarchyData, HierarchyFormData } from '@/types/hierarchy-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save, X } from 'lucide-react';
import { getAvailableApplications } from '@/data/usersData';
import { getHierarchyLevels, generateHierarchyId, getParentHierarchyValues } from '@/data/hierarchyData';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface HierarchyDataFormProps {
  hierarchyData?: HierarchyData;
  isOpen?: boolean;
  onClose?: () => void;
  onSave: (data: HierarchyFormData) => void;
  embedded?: boolean;
}

const HierarchyDataForm = ({ hierarchyData, isOpen, onClose, onSave, embedded = false }: HierarchyDataFormProps) => {
  const { toast } = useToast();
  const isEditMode = !!hierarchyData;
  const applications = getAvailableApplications();
  const hierarchyLevels = getHierarchyLevels();
  
  const [formData, setFormData] = useState<HierarchyFormData>({
    hierarchy_id: '',
    hierarchyLevel: '',
    colValue: '',
    colName: '',
    parentHierarchyLevel: '',
    parentColValue: '',
    startDate: new Date(),
    expiryDate: null,
    isActive: true,
    applicationId: ''
  });
  
  const [parentValues, setParentValues] = useState<{ value: string, name: string }[]>([]);

  // Initialize form data when hierarchyData changes
  useEffect(() => {
    if (hierarchyData) {
      setFormData({
        hierarchy_id: hierarchyData.hierarchy_id,
        hierarchyLevel: hierarchyData.hierarchyLevel,
        colValue: hierarchyData.colValue,
        colName: hierarchyData.colName,
        parentHierarchyLevel: hierarchyData.parentHierarchyLevel,
        parentColValue: hierarchyData.parentColValue,
        startDate: hierarchyData.startDate,
        expiryDate: hierarchyData.expiryDate,
        isActive: hierarchyData.isActive,
        applicationId: hierarchyData.applicationId
      });
    } else {
      // Reset form for new entry
      setFormData({
        hierarchy_id: generateHierarchyId(),
        hierarchyLevel: '',
        colValue: '',
        colName: '',
        parentHierarchyLevel: '',
        parentColValue: '',
        startDate: new Date(),
        expiryDate: null,
        isActive: true,
        applicationId: applications.length > 0 ? applications[0].id : ''
      });
    }
  }, [hierarchyData, applications]);

  // Update parent values when hierarchy level or application changes
  useEffect(() => {
    if (formData.hierarchyLevel && formData.applicationId) {
      const values = getParentHierarchyValues(formData.hierarchyLevel, formData.applicationId);
      setParentValues(values);
      
      // Set parent hierarchy level based on the selected level
      const levelIndex = hierarchyLevels.findIndex(l => l.name === formData.hierarchyLevel);
      if (levelIndex > 0) {
        const parentLevel = hierarchyLevels[levelIndex - 1].name;
        setFormData(prev => ({
          ...prev,
          parentHierarchyLevel: parentLevel
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          parentHierarchyLevel: '',
          parentColValue: ''
        }));
      }
    }
  }, [formData.hierarchyLevel, formData.applicationId, hierarchyLevels]);

  const handleChange = (field: keyof HierarchyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset parent value when changing level
    if (field === 'hierarchyLevel') {
      setFormData(prev => ({
        ...prev,
        parentColValue: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderFormContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="applicationId">Application</Label>
          <Select 
            value={formData.applicationId} 
            onValueChange={(value) => handleChange('applicationId', value)}
            disabled={isEditMode} // Cannot change application in edit mode
          >
            <SelectTrigger>
              <SelectValue placeholder="Select application" />
            </SelectTrigger>
            <SelectContent>
              {applications.map((app, index) => (
                <SelectItem key={app.id} value={app.id || `app-id-${index}`}>{app.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hierarchy_id">Hierarchy ID</Label>
          <Input
            id="hierarchy_id"
            value={formData.hierarchy_id}
            onChange={(e) => handleChange('hierarchy_id', e.target.value)}
            placeholder="HIER001"
            disabled={isEditMode} // Cannot change hierarchy ID in edit mode
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hierarchyLevel">Hierarchy Level</Label>
          <Select 
            value={formData.hierarchyLevel} 
            onValueChange={(value) => handleChange('hierarchyLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {hierarchyLevels.map((level, index) => (
                <SelectItem key={level.id} value={level.name || `level-name-${index}`}>{level.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="colValue">Column Value</Label>
          <Input
            id="colValue"
            value={formData.colValue}
            onChange={(e) => handleChange('colValue', e.target.value)}
            placeholder="Value code (e.g., EMEA, UK)"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="colName">Column Name</Label>
          <Input
            id="colName"
            value={formData.colName}
            onChange={(e) => handleChange('colName', e.target.value)}
            placeholder="Display name (e.g., Europe, United Kingdom)"
            required
          />
        </div>
        
        {formData.parentHierarchyLevel && (
          <div className="space-y-2">
            <Label htmlFor="parentColValue">Parent Value ({formData.parentHierarchyLevel})</Label>
            <Select 
              value={formData.parentColValue} 
              onValueChange={(value) => handleChange('parentColValue', value)}
              disabled={parentValues.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${formData.parentHierarchyLevel}`} />
              </SelectTrigger>
              <SelectContent>
                {parentValues.length > 0 ? (
                  parentValues.map((parent, index) => (
                    <SelectItem key={parent.value} value={parent.value || `parent-value-${index}`}>{parent.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-parent-available" disabled>No parent values available</SelectItem>
                )}
              </SelectContent>
            </Select>
            {parentValues.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                No parent values available. Please create a {formData.parentHierarchyLevel} entry first.
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => handleChange('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.expiryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expiryDate ? format(formData.expiryDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expiryDate || undefined}
                onSelect={(date) => handleChange('expiryDate', date)}
                initialFocus
                disabled={(date) => date < (formData.startDate || new Date())}
              />
            </PopoverContent>
          </Popover>
          {formData.expiryDate && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-1" 
              onClick={() => handleChange('expiryDate', null)}
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" form="hierarchyForm" className="gap-1">
          <Save className="h-4 w-4" /> {isEditMode ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );

  // If embedded, render just the form content
  if (embedded) {
    return (
      <form id="hierarchyForm" onSubmit={handleSubmit}>
        {renderFormContent()}
      </form>
    );
  }

  // Otherwise, render in a dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose!}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Hierarchy Data' : 'Create New Hierarchy Data'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update hierarchy data information.' 
              : 'Fill in the details to create a new hierarchy data entry.'}
          </DialogDescription>
        </DialogHeader>
        
        <form id="hierarchyForm" onSubmit={handleSubmit}>
          {renderFormContent()}
        </form>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" form="hierarchyForm" className="gap-1">
            <Save className="h-4 w-4" /> {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HierarchyDataForm;