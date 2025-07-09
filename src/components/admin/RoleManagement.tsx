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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Plus, Edit, Trash2, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  useWorkflowRoles, 
  useUniqueApplications, 
  useApplicationRoleMappings,
  useEnvironmentInfo 
} from '@/hooks/useWorkflowService';
import { WorkflowRole, RoleForm } from '@/types/application-types';

const RoleManagement: React.FC = () => {
  // Use the new service hooks
  const {
    roles,
    loading,
    error,
    addRole,
    updateRole,
    deleteRole,
    refresh
  } = useWorkflowRoles();
  
  const {
    applications: uniqueApplications,
    loading: applicationsLoading
  } = useUniqueApplications();
  
  const {
    mappings: applicationRoleMappings,
    loading: mappingsLoading
  } = useApplicationRoleMappings();
  
  const envInfo = useEnvironmentInfo();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<WorkflowRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  
  // Form state
  const [roleForm, setRoleForm] = useState<RoleForm>({
    department: '',
    role: '',
    userType: 'User',
    isReadWrite: 'RO',
    isActive: true
  });
  
  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    role.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.userType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (roleDialogOpen && selectedRole) {
      setRoleForm({
        roleId: selectedRole.roleId,
        department: selectedRole.department,
        role: selectedRole.role,
        userType: selectedRole.userType,
        isReadWrite: selectedRole.isReadWrite as 'RO' | 'RW',
        isActive: selectedRole.isActive
      });
    } else if (roleDialogOpen) {
      setRoleForm({
        department: '',
        role: '',
        userType: 'User',
        isReadWrite: 'RO',
        isActive: true
      });
    }
  }, [roleDialogOpen, selectedRole]);
  
  // Form handlers
  const handleRoleFormChange = (field: keyof RoleForm, value: any) => {
    setRoleForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Save role
  const handleSaveRole = async () => {
    if (!roleForm.role.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!roleForm.department.trim()) {
      toast({
        title: "Validation Error",
        description: "Department is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let success = false;
      
      if (selectedRole) {
        // Update existing role
        const updatedRole: WorkflowRole = {
          roleId: selectedRole.roleId,
          department: roleForm.department,
          role: roleForm.role,
          userType: roleForm.userType,
          isReadWrite: roleForm.isReadWrite,
          isActive: roleForm.isActive
        };
        
        success = await updateRole(updatedRole);
        if (success) {
          toast({
            title: "Role Updated",
            description: `Role "${roleForm.role}" has been updated successfully.`
          });
        }
      } else {
        // Add new role
        const newRole = {
          department: roleForm.department,
          role: roleForm.role,
          userType: roleForm.userType,
          isReadWrite: roleForm.isReadWrite,
          isActive: roleForm.isActive
        };
        
        success = await addRole(newRole);
        if (success) {
          toast({
            title: "Role Added",
            description: `Role "${roleForm.role}" has been added successfully.`
          });
        }
      }
      
      if (success) {
        setRoleDialogOpen(false);
        setSelectedRole(null);
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: 'Error',
        description: 'Failed to save role. Please try again later.',
        variant: 'destructive'
      });
    }
  };
  
  // Delete role
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    try {
      const success = await deleteRole(roleToDelete);
      
      if (success) {
        toast({
          title: "Role Deleted",
          description: "The role has been deleted successfully."
        });
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role. Please try again later.',
        variant: 'destructive'
      });
    }
  };
  
  // Get applications for a role from mappings
  const getApplicationsForRole = (roleId: number): string[] => {
    return applicationRoleMappings
      .filter(mapping => mapping.roleId === roleId)
      .map(mapping => mapping.applicationName);
  };
  
  return (
    <div className="space-y-6">
      {/* Environment Status Banner */}
      {envInfo.isMock ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Running in <strong>Mock Data Mode</strong> - Environment: {envInfo.mode} | Base URL: {envInfo.baseUrl}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <RefreshCw className="h-4 w-4" />
          <AlertDescription>
            Connected to <strong>Live API</strong> - Environment: {envInfo.mode} | Base URL: {envInfo.baseUrl}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

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
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedRole(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                <DialogDescription>
                  {selectedRole ? 'Update the role details' : 'Create a new role with its configuration details'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                    <Input 
                      id="department" 
                      placeholder="Enter department" 
                      value={roleForm.department}
                      onChange={(e) => handleRoleFormChange('department', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="role" 
                      placeholder="Enter role name" 
                      value={roleForm.role}
                      onChange={(e) => handleRoleFormChange('role', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userType">User Type</Label>
                    <Input 
                      id="userType" 
                      placeholder="User or SME" 
                      value={roleForm.userType}
                      onChange={(e) => handleRoleFormChange('userType', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="isReadWrite">Access Level</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch 
                        id="isReadWrite" 
                        checked={roleForm.isReadWrite === 'RW'}
                        onCheckedChange={(checked) => handleRoleFormChange('isReadWrite', checked ? 'RW' : 'RO')}
                      />
                      <Label htmlFor="isReadWrite" className="cursor-pointer">
                        {roleForm.isReadWrite === 'RW' ? 'Read Write' : 'Read Only'}
                      </Label>
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
                <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRole} disabled={loading}>
                  {loading ? 'Saving...' : selectedRole ? 'Update Role' : 'Create Role'}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => {
                const applications = getApplicationsForRole(role.roleId);
                return (
                  <TableRow key={role.roleId}>
                    <TableCell>{role.department}</TableCell>
                    <TableCell className="font-medium">{role.role}</TableCell>
                    <TableCell>{role.userType}</TableCell>
                    <TableCell>
                      <Badge variant={role.isReadWrite === 'RW' ? 'default' : 'secondary'}>
                        {role.isReadWrite === 'RW' ? 'Read Write' : 'Read Only'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {applications.slice(0, 2).map((appName, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {appName}
                          </Badge>
                        ))}
                        {applications.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{applications.length - 2} more
                          </Badge>
                        )}
                        {applications.length === 0 && (
                          <span className="text-muted-foreground text-sm">No applications</span>
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedRole(role);
                            setViewDialogOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedRole(role);
                            setRoleDialogOpen(true);
                          }}
                          title="Edit Role"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setRoleToDelete(role.roleId);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Role"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* View Role Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                  <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                  <p className="text-base">{selectedRole.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Role Name</h3>
                  <p className="text-base">{selectedRole.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User Type</h3>
                  <p className="text-base">{selectedRole.userType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Access Level</h3>
                  <Badge variant={selectedRole.isReadWrite === 'RW' ? 'default' : 'secondary'}>
                    {selectedRole.isReadWrite === 'RW' ? 'Read Write' : 'Read Only'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Applications</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getApplicationsForRole(selectedRole.roleId).map((appName, index) => (
                    <Badge key={index} variant="outline">
                      {appName}
                    </Badge>
                  ))}
                  {getApplicationsForRole(selectedRole.roleId).length === 0 && (
                    <span className="text-muted-foreground text-sm">No applications assigned</span>
                  )}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedRole.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedRole.isActive ? 'Active' : 'Inactive'}
                  </span>
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
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManagement;