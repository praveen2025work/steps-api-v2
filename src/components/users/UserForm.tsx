import { useState, useEffect } from 'react';
import { User, UserFormData, UserApplication } from '@/types/user-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash } from 'lucide-react';
import { getRoles } from '@/data/usersData';

interface UserFormProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
}

const UserForm = ({ user, isOpen, onClose, onSave }: UserFormProps) => {
  const isEditMode = !!user;
  const roles = getRoles();
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    fullName: '',
    email: '',
    isActive: true,
    role: roles[0],
    department: '', // We'll keep this in the type but not use it in the UI
    applications: []
  });

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
        role: roles[0],
        department: '', // Empty string as we're not using it
        applications: []
      });
    }
  }, [user, roles]);

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update user information and application access.' 
              : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            {formData.applications.length > 0 && (
              <div className="space-y-2">
                <Label>Assigned Applications</Label>
                <div className="rounded-md border max-h-[200px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Access Level</TableHead>
                        <TableHead>Assigned On</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.applications.map((app) => (
                        <TableRow key={app.applicationId}>
                          <TableCell>{app.applicationId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{app.accessLevel}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(app.assignedOn).toLocaleDateString()}
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
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;