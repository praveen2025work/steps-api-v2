import { useState, useEffect } from 'react';
import { User, UserFormData, UserApplication } from '@/types/user-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash, Plus, Save, X } from 'lucide-react';
import { getAvailableApplications, getApplicationRoles } from '@/data/usersData';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface UserFormProps {
  user?: User;
  isOpen?: boolean;
  onClose?: () => void;
  onSave: (userData: UserFormData) => void;
  embedded?: boolean;
}

const UserForm = ({ user, isOpen, onClose, onSave, embedded = false }: UserFormProps) => {
  const { toast } = useToast();
  const isEditMode = !!user;
  const applications = getAvailableApplications();
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    fullName: '',
    email: '',
    isActive: true,
    role: '',
    department: '', // We'll keep this in the type but not use it in the UI
    applications: []
  });
  
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [applicableRoles, setApplicableRoles] = useState<string[]>([]);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        department: user.department, // Keep this for data consistency
        applications: [...user.applications]
      });
    } else {
      // Reset form for new user
      setFormData({
        username: '',
        fullName: '',
        email: '',
        isActive: true,
        role: '',
        department: '', // Empty string as we're not using it
        applications: []
      });
    }
    
    // Reset application selection
    setSelectedAppId(applications.length > 0 ? applications[0].id : '');
    setSelectedRoles([]);
  }, [user, applications]);
  
  // Update applicable roles when application changes
  useEffect(() => {
    if (selectedAppId) {
      const roles = getApplicationRoles(selectedAppId);
      setApplicableRoles(roles);
      
      // Check if we're editing an existing application
      const existingApp = formData.applications.find(app => app.applicationId === selectedAppId);
      if (existingApp) {
        // If editing existing app, pre-select its roles
        setSelectedRoles(existingApp.accessLevel.split(', '));
      } else {
        // If adding new app, clear selection
        setSelectedRoles([]);
      }
    }
  }, [selectedAppId, formData.applications]);

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addApplication = () => {
    if (!selectedAppId || selectedRoles.length === 0) return;
    
    // Check if application is already assigned
    const isAlreadyAssigned = formData.applications.some(
      app => app.applicationId === selectedAppId
    );
    
    if (isAlreadyAssigned) {
      // Update existing application roles
      setFormData(prev => ({
        ...prev,
        applications: prev.applications.map(app => 
          app.applicationId === selectedAppId
            ? { ...app, accessLevel: selectedRoles.join(', ') }
            : app
        )
      }));
    } else {
      // Add new application
      const newApplication: UserApplication = {
        applicationId: selectedAppId,
        accessLevel: selectedRoles.join(', '),
        assignedOn: new Date()
      };
      
      setFormData(prev => ({
        ...prev,
        applications: [...prev.applications, newApplication]
      }));
    }
    
    // Reset selection
    setSelectedRoles([]);
    
    // Find the application name for the toast
    const appName = applications.find(app => app.id === selectedAppId)?.name || selectedAppId;
    
    // Show toast notification
    toast({
      title: isAlreadyAssigned ? "Application Updated" : "Application Added",
      description: `${appName} with roles: ${selectedRoles.join(', ')}`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const removeApplication = (applicationId: string) => {
    setFormData(prev => ({
      ...prev,
      applications: prev.applications.filter(app => app.applicationId !== applicationId)
    }));
  };

  const renderFormContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - User details */}
        <div className="w-full md:w-1/2 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">User Information</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="username"
                required
                disabled={isEditMode} // Username cannot be changed in edit mode
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                required
              />
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
        </div>
        
        {/* Right side - Application assignments */}
        <div className="w-full md:w-1/2 space-y-4">
          <div>
            <h3 className="text-lg font-medium">Application Assignment</h3>
            <p className="text-sm text-muted-foreground">Assign applications and roles to this user</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="application">Select Application</Label>
              <Select 
                value={selectedAppId} 
                onValueChange={setSelectedAppId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map(app => (
                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedAppId && applicableRoles.length > 0 && (
              <div className="space-y-2">
                <Label>Select Roles</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-[150px] overflow-y-auto">
                  {applicableRoles.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`role-${role}`} 
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            setSelectedRoles(prev => [...prev, role]);
                          } else {
                            setSelectedRoles(prev => prev.filter(r => r !== role));
                          }
                        }}
                      />
                      <Label htmlFor={`role-${role}`} className="cursor-pointer text-sm">{role}</Label>
                    </div>
                  ))}
                </div>
                {selectedRoles.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Selected roles: {selectedRoles.join(', ')}
                  </div>
                )}
              </div>
            )}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={addApplication}
              disabled={!selectedAppId || selectedRoles.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" /> 
              {formData.applications.some(app => app.applicationId === selectedAppId)
                ? 'Update Application Roles'
                : 'Add Application'}
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          {formData.applications.length > 0 ? (
            <div className="space-y-2">
              <Label>Assigned Applications</Label>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.applications.map((app) => (
                      <TableRow key={app.applicationId}>
                        <TableCell>
                          {applications.find(a => a.id === app.applicationId)?.name || app.applicationId}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {app.accessLevel.split(', ').map((role, index) => (
                              <Badge 
                                key={index} 
                                variant="outline"
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => {
                                  // Set the selected application and load its roles for editing
                                  setSelectedAppId(app.applicationId);
                                  const currentRoles = app.accessLevel.split(', ');
                                  setSelectedRoles(currentRoles);
                                  
                                  // Show toast notification
                                  toast({
                                    title: "Edit Application Roles",
                                    description: `Click on roles to select/deselect, then click 'Update Application Roles' to save changes`,
                                  });
                                }}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeApplication(app.applicationId)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground border rounded-md">
              No applications assigned yet.
            </div>
          )}
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" form="userForm" className="gap-1">
          <Save className="h-4 w-4" /> {isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </div>
  );

  // If embedded, render just the form content
  if (embedded) {
    return (
      <form id="userForm" onSubmit={handleSubmit}>
        {renderFormContent()}
      </form>
    );
  }

  // Otherwise, render in a dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose!} className="max-w-4xl">
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update user information and application access.' 
              : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        
        <form id="userForm" onSubmit={handleSubmit}>
          <div className="p-6">
            {renderFormContent()}
          </div>
        </form>
        
        <DialogFooter className="px-6 py-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" form="userForm" className="gap-1">
            <Save className="h-4 w-4" /> {isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;