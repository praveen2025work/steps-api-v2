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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Users, UserCheck } from 'lucide-react';
import { Role, Permission, Application } from '@/types/workflow-types';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample applications
const sampleApplications: Application[] = [
  {
    id: '1',
    name: 'Financial Reporting',
    category: 'Finance',
    serviceUrl: 'https://api.example.com/financial-reporting',
    description: 'End of day financial reporting application',
    superUserRole: 'Finance Admin',
    cronSchedule: '0 18 * * 1-5',
    offset: 30,
    lockingRequired: true,
    lockingRole: 'Finance Manager',
    runOnWeekdays: true,
    parameters: [],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-04-20T14:30:00Z',
    createdBy: 'System Admin',
    updatedBy: 'John Doe',
    isActive: true
  },
  {
    id: '2',
    name: 'Risk Assessment',
    category: 'Risk',
    serviceUrl: 'https://api.example.com/risk-assessment',
    description: 'Daily risk assessment and reporting',
    superUserRole: 'Risk Admin',
    cronSchedule: '0 8 * * 1-5',
    offset: 15,
    lockingRequired: true,
    lockingRole: 'Risk Manager',
    runOnWeekdays: true,
    parameters: [],
    createdAt: '2025-02-10T09:15:00Z',
    updatedAt: '2025-04-18T11:20:00Z',
    createdBy: 'System Admin',
    updatedBy: 'Jane Smith',
    isActive: true
  },
  {
    id: '3',
    name: 'Compliance Checker',
    category: 'Compliance',
    serviceUrl: 'https://api.example.com/compliance',
    description: 'Regulatory compliance verification',
    superUserRole: 'Compliance Admin',
    cronSchedule: '0 20 * * 5',
    offset: 60,
    lockingRequired: false,
    lockingRole: '',
    runOnWeekdays: false,
    parameters: [],
    createdAt: '2025-03-05T14:00:00Z',
    updatedAt: '2025-04-15T16:45:00Z',
    createdBy: 'System Admin',
    updatedBy: 'Robert Johnson',
    isActive: false
  }
];

// Sample permissions
const samplePermissions: Permission[] = [
  { id: 'perm1', name: 'View Workflows', description: 'View all workflows', code: 'VIEW_WORKFLOWS' },
  { id: 'perm2', name: 'Edit Workflows', description: 'Edit workflow details', code: 'EDIT_WORKFLOWS' },
  { id: 'perm3', name: 'Delete Workflows', description: 'Delete workflows', code: 'DELETE_WORKFLOWS' },
  { id: 'perm4', name: 'Approve Workflows', description: 'Approve workflow stages', code: 'APPROVE_WORKFLOWS' },
  { id: 'perm5', name: 'Upload Files', description: 'Upload files to workflows', code: 'UPLOAD_FILES' },
  { id: 'perm6', name: 'Download Files', description: 'Download files from workflows', code: 'DOWNLOAD_FILES' },
  { id: 'perm7', name: 'Manage Users', description: 'Manage user accounts', code: 'MANAGE_USERS' },
  { id: 'perm8', name: 'Manage Roles', description: 'Manage roles and permissions', code: 'MANAGE_ROLES' },
  { id: 'perm9', name: 'View Reports', description: 'View system reports', code: 'VIEW_REPORTS' },
  { id: 'perm10', name: 'Export Data', description: 'Export data from the system', code: 'EXPORT_DATA' }
];

// Sample roles
const sampleRoles: Role[] = [
  {
    id: 'role1',
    name: 'Administrator',
    description: 'Full system access',
    permissions: samplePermissions,
    applications: ['1', '2', '3'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'role2',
    name: 'Finance Manager',
    description: 'Manages financial workflows',
    permissions: samplePermissions.filter(p => ['perm1', 'perm2', 'perm4', 'perm5', 'perm6', 'perm9', 'perm10'].includes(p.id)),
    applications: ['1'],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'role3',
    name: 'Risk Analyst',
    description: 'Analyzes risk data',
    permissions: samplePermissions.filter(p => ['perm1', 'perm5', 'perm6', 'perm9', 'perm10'].includes(p.id)),
    applications: ['2'],
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'role4',
    name: 'Compliance Officer',
    description: 'Ensures regulatory compliance',
    permissions: samplePermissions.filter(p => ['perm1', 'perm4', 'perm5', 'perm6', 'perm9'].includes(p.id)),
    applications: ['3'],
    createdAt: '2025-01-04T00:00:00Z',
    updatedAt: '2025-01-04T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'role5',
    name: 'Read Only User',
    description: 'View-only access to all applications',
    permissions: samplePermissions.filter(p => ['perm1', 'perm9'].includes(p.id)),
    applications: ['1', '2', '3'],
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  }
];

// Form interface
interface RoleForm {
  id?: string;
  name: string;
  description: string;
  department: string;
  userType: string;
  accessLevel: 'RO' | 'RW';
  selectedPermissions: string[];
  selectedApplications: string[];
  isActive: boolean;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(sampleRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<string>('');
  
  // Form state
  const [roleForm, setRoleForm] = useState<RoleForm>({
    name: '',
    description: '',
    department: '',
    userType: 'Standard',
    accessLevel: 'RO',
    selectedPermissions: [],
    selectedApplications: [],
    isActive: true
  });
  
  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (roleDialogOpen && selectedRole) {
      setRoleForm({
        id: selectedRole.id,
        name: selectedRole.name,
        description: selectedRole.description,
        department: selectedRole.department || '',
        userType: selectedRole.userType || 'Standard',
        accessLevel: selectedRole.accessLevel || 'RO',
        selectedPermissions: selectedRole.permissions.map(p => p.id),
        selectedApplications: selectedRole.applications,
        isActive: selectedRole.isActive
      });
    } else if (roleDialogOpen) {
      setRoleForm({
        name: '',
        description: '',
        department: '',
        userType: 'Standard',
        accessLevel: 'RO',
        selectedPermissions: [],
        selectedApplications: [],
        isActive: true
      });
    }
  }, [roleDialogOpen, selectedRole]);
  
  // Form handlers
  const handleRoleFormChange = (field: keyof RoleForm, value: any) => {
    setRoleForm(prev => ({ ...prev, [field]: value }));
  };
  
  const togglePermission = (permissionId: string) => {
    setRoleForm(prev => {
      const selectedPermissions = [...prev.selectedPermissions];
      const index = selectedPermissions.indexOf(permissionId);
      
      if (index === -1) {
        selectedPermissions.push(permissionId);
      } else {
        selectedPermissions.splice(index, 1);
      }
      
      return { ...prev, selectedPermissions };
    });
  };
  
  const toggleApplication = (applicationId: string) => {
    setRoleForm(prev => {
      const selectedApplications = [...prev.selectedApplications];
      const index = selectedApplications.indexOf(applicationId);
      
      if (index === -1) {
        selectedApplications.push(applicationId);
      } else {
        selectedApplications.splice(index, 1);
      }
      
      return { ...prev, selectedApplications };
    });
  };
  
  // Save role
  const saveRole = () => {
    if (!roleForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }
    
    const selectedPermissionObjects = samplePermissions.filter(p => roleForm.selectedPermissions.includes(p.id));
    
    const newRole: Role = {
      id: roleForm.id || `role-${Date.now()}`,
      name: roleForm.name,
      description: roleForm.description,
      department: roleForm.department,
      userType: roleForm.userType,
      accessLevel: roleForm.accessLevel,
      permissions: selectedPermissionObjects,
      applications: roleForm.selectedApplications,
      createdAt: roleForm.id ? roles.find(r => r.id === roleForm.id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: roleForm.id ? roles.find(r => r.id === roleForm.id)?.createdBy || 'Current User' : 'Current User',
      updatedBy: 'Current User',
      isActive: roleForm.isActive
    };
    
    if (roleForm.id) {
      // Update existing role
      setRoles(prev => prev.map(role => role.id === roleForm.id ? newRole : role));
      toast({
        title: "Role Updated",
        description: `Role "${roleForm.name}" has been updated successfully.`
      });
    } else {
      // Add new role
      setRoles(prev => [...prev, newRole]);
      toast({
        title: "Role Added",
        description: `Role "${roleForm.name}" has been added successfully.`
      });
    }
    
    setRoleDialogOpen(false);
  };
  
  // Delete role
  const confirmDelete = () => {
    setRoles(prev => prev.filter(role => role.id !== roleToDelete));
    setDeleteDialogOpen(false);
    toast({
      title: "Role Deleted",
      description: "The role has been deleted successfully."
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedRole(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
              <DialogDescription>
                {selectedRole ? 'Update the role details and permissions' : 'Create a new role with specific permissions'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter role name" 
                    value={roleForm.name}
                    onChange={(e) => handleRoleFormChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    placeholder="Enter department" 
                    value={roleForm.department}
                    onChange={(e) => handleRoleFormChange('department', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter role description" 
                  value={roleForm.description}
                  onChange={(e) => handleRoleFormChange('description', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">User Type</Label>
                  <Select 
                    value={roleForm.userType} 
                    onValueChange={(value) => handleRoleFormChange('userType', value)}
                  >
                    <SelectTrigger id="userType">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Power User">Power User</SelectItem>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select 
                    value={roleForm.accessLevel} 
                    onValueChange={(value: 'RO' | 'RW') => handleRoleFormChange('accessLevel', value)}
                  >
                    <SelectTrigger id="accessLevel">
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RO">Read Only (RO)</SelectItem>
                      <SelectItem value="RW">Read Write (RW)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {samplePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`permission-${permission.id}`} 
                          checked={roleForm.selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Applications</Label>
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {sampleApplications.map((application) => (
                      <div key={application.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`app-${application.id}`} 
                          checked={roleForm.selectedApplications.includes(application.id)}
                          onCheckedChange={() => toggleApplication(application.id)}
                        />
                        <Label htmlFor={`app-${application.id}`}>{application.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isActive" 
                  checked={roleForm.isActive}
                  onCheckedChange={(checked) => handleRoleFormChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Role is active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveRole}>
                {selectedRole ? 'Update Role' : 'Create Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Access Level</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.department || '-'}</TableCell>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.userType || 'Standard'}</TableCell>
                  <TableCell>
                    <Badge variant={role.accessLevel === 'RW' ? 'default' : 'secondary'}>
                      {role.accessLevel === 'RW' ? 'Read Write' : 'Read Only'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.applications.slice(0, 2).map((appId) => (
                        <Badge key={appId} variant="outline" className="text-xs">
                          {sampleApplications.find(app => app.id === appId)?.name || appId}
                        </Badge>
                      ))}
                      {role.applications.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.applications.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedRole(role);
                        setViewDialogOpen(true);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedRole(role);
                        setRoleDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setRoleToDelete(role.id);
                        setDeleteDialogOpen(true);
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* View Role Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
            <DialogDescription>
              Detailed information about the role
            </DialogDescription>
          </DialogHeader>
          
          {selectedRole && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Role Name</h3>
                  <p className="text-base">{selectedRole.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                  <p className="text-base">{selectedRole.department || '-'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-base">{selectedRole.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User Type</h3>
                  <p className="text-base">{selectedRole.userType || 'Standard'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Access Level</h3>
                  <Badge variant={selectedRole.accessLevel === 'RW' ? 'default' : 'secondary'}>
                    {selectedRole.accessLevel === 'RW' ? 'Read Write' : 'Read Only'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Permissions</h3>
                <ScrollArea className="h-[200px] border rounded-md p-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRole.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <div className="h-5 w-5 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Applications</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRole.applications.map((appId) => (
                    <Badge key={appId} variant="outline">
                      {sampleApplications.find(app => app.id === appId)?.name || appId}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                  <p className="text-sm">{selectedRole.createdBy}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="text-sm">{new Date(selectedRole.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Updated By</h3>
                  <p className="text-sm">{selectedRole.updatedBy}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
                  <p className="text-sm">{new Date(selectedRole.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected role.
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

export default RoleManagement;