import React, { useState, useEffect, useCallback } from 'react';
import { Role } from '@/types/workflow-types';
import { Application } from '@/types/application-types';
import { useApplications, useEnvironmentInfo } from '@/hooks/useWorkflowService';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Eye, Calendar, Link, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form interface
interface ApplicationForm {
  applicationId?: number;
  name: string;
  category: string;
  serviceUrl: string;
  description: string;
  cronExpression: string;
  runDateOffSet: number;
  isLockingEnabled: boolean;
  lockingRole: number;
  isRunOnWeekDayOnly: boolean;
  useRunCalendar: boolean;
  isActive: boolean;
  entitlementMapping: number;
}

// Sample roles data
const sampleRoles: Role[] = [
  {
    id: 'role1',
    name: 'Administrator',
    description: 'Full system access',
    permissions: [],
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
    permissions: [],
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
    permissions: [],
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
    permissions: [],
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
    permissions: [],
    applications: ['1', '2', '3'],
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  }
];

const ApplicationManagement: React.FC = () => {
  // Use the new service hooks
  const {
    applications,
    loading,
    error,
    updateApplication,
    deleteApplication,
    addApplication,
    refresh
  } = useApplications();
  
  const envInfo = useEnvironmentInfo();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>(sampleRoles);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  // Form state
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({
    name: '',
    category: '',
    serviceUrl: '',
    description: '',
    cronExpression: '',
    runDateOffSet: 0,
    isLockingEnabled: false,
    lockingRole: 0,
    isRunOnWeekDayOnly: false,
    useRunCalendar: false,
    isActive: true,
    entitlementMapping: 12
  });
  
  // Filter applications based on search term
  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  

  
  // Fetch roles from API
  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      // This would be a real API call in production
      // const response = await fetch('http://portal-workflowcore-api-uat.com/api/WF/GetRoles');
      // const data: Role[] = await response.json();
      
      // For now, we'll simulate the API response with our sample data
      setTimeout(() => {
        setRoles(sampleRoles);
        setIsLoadingRoles(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch roles. Please try again later.',
        variant: 'destructive'
      });
      setIsLoadingRoles(false);
    }
  }, []);

  // Load roles on component mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (applicationDialogOpen && selectedApplication) {
      setApplicationForm({
        applicationId: selectedApplication.applicationId,
        name: selectedApplication.name,
        category: selectedApplication.category,
        serviceUrl: selectedApplication.serviceUrl || '',
        description: selectedApplication.description,
        cronExpression: selectedApplication.cronExpression,
        runDateOffSet: selectedApplication.runDateOffSet,
        isLockingEnabled: selectedApplication.isLockingEnabled,
        lockingRole: selectedApplication.lockingRole || 0,
        isRunOnWeekDayOnly: selectedApplication.isRunOnWeekDayOnly,
        useRunCalendar: selectedApplication.useRunCalendar,
        isActive: selectedApplication.isActive,
        entitlementMapping: selectedApplication.entitlementMapping
      });
    } else if (applicationDialogOpen) {
      setApplicationForm({
        name: '',
        category: '',
        serviceUrl: '',
        description: '',
        cronExpression: '',
        runDateOffSet: 0,
        isLockingEnabled: false,
        lockingRole: 0,
        isRunOnWeekDayOnly: true,
        useRunCalendar: false,
        isActive: true,
        entitlementMapping: 12
      });
    }
  }, [applicationDialogOpen, selectedApplication]);
  
  // Form handlers
  const handleApplicationFormChange = (field: keyof ApplicationForm, value: any) => {
    setApplicationForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Save application
  const handleSaveApplication = async () => {
    if (!applicationForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Application name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const applicationData: Application = {
        applicationId: applicationForm.applicationId || 0,
        name: applicationForm.name,
        category: applicationForm.category,
        serviceUrl: applicationForm.serviceUrl || null,
        description: applicationForm.description,
        entitlementMapping: applicationForm.entitlementMapping,
        isActive: applicationForm.isActive,
        cronExpression: applicationForm.cronExpression,
        isLockingEnabled: applicationForm.isLockingEnabled,
        lockingRole: applicationForm.lockingRole,
        useRunCalendar: applicationForm.useRunCalendar,
        createdon: new Date().toISOString(),
        runDateOffSet: applicationForm.runDateOffSet,
        isRunOnWeekDayOnly: applicationForm.isRunOnWeekDayOnly
      };

      let success = false;
      
      if (selectedApplication) {
        // Update existing application
        success = await updateApplication(applicationData);
        if (success) {
          toast({
            title: "Application Updated",
            description: `Application "${applicationForm.name}" has been updated successfully.`
          });
        }
      } else {
        // Add new application
        success = await addApplication(applicationData);
        if (success) {
          toast({
            title: "Application Added",
            description: `Application "${applicationForm.name}" has been added successfully.`
          });
        }
      }
      
      if (success) {
        setApplicationDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving application:', error);
      toast({
        title: 'Error',
        description: 'Failed to save application. Please try again later.',
        variant: 'destructive'
      });
    }
  };
  
  // Delete application
  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;
    
    try {
      const success = await deleteApplication(applicationToDelete);
      
      if (success) {
        toast({
          title: "Application Deleted",
          description: "The application has been deleted successfully."
        });
        setDeleteDialogOpen(false);
        setApplicationToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete application. Please try again later.',
        variant: 'destructive'
      });
    }
  };
  
  // Format cron expression for display
  const formatCronSchedule = (cronExpression: string): string => {
    if (!cronExpression) return 'Not scheduled';
    
    // Simple formatting for common patterns
    if (cronExpression.includes('MON-FRI')) {
      return 'Weekdays';
    } else if (cronExpression.includes('* * *')) {
      return 'Daily';
    } else {
      return cronExpression;
    }
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
            placeholder="Search applications..."
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
          
          <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedApplication(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedApplication ? 'Edit Application' : 'Add New Application'}</DialogTitle>
              <DialogDescription>
                {selectedApplication ? 'Update the application details' : 'Create a new application with its configuration details'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Application Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="Enter application name" 
                    value={applicationForm.name}
                    onChange={(e) => handleApplicationFormChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    placeholder="Enter category" 
                    value={applicationForm.category}
                    onChange={(e) => handleApplicationFormChange('category', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceUrl">Service URL</Label>
                <Input 
                  id="serviceUrl" 
                  placeholder="https://api.example.com/service" 
                  value={applicationForm.serviceUrl}
                  onChange={(e) => handleApplicationFormChange('serviceUrl', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter description" 
                  value={applicationForm.description}
                  onChange={(e) => handleApplicationFormChange('description', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cronExpression">Cron Schedule</Label>
                <Input 
                  id="cronExpression" 
                  placeholder="0 18 * * 1-5" 
                  value={applicationForm.cronExpression}
                  onChange={(e) => handleApplicationFormChange('cronExpression', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Format: second minute hour day month weekday</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="runDateOffSet">Run Date Offset (days)</Label>
                  <Input 
                    id="runDateOffSet" 
                    type="number" 
                    placeholder="0" 
                    value={applicationForm.runDateOffSet}
                    onChange={(e) => handleApplicationFormChange('runDateOffSet', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lockingRole">Locking Role</Label>
                  <Select
                    value={applicationForm.lockingRole}
                    onValueChange={(value) => handleApplicationFormChange('lockingRole', value)}
                  >
                    <SelectTrigger id="lockingRole" className="w-full">
                      <SelectValue placeholder="Select a locking role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rtbRole">RTB Role</Label>
                <Select
                  value={applicationForm.rtbRole}
                  onValueChange={(value) => handleApplicationFormChange('rtbRole', value)}
                >
                  <SelectTrigger id="rtbRole" className="w-full">
                    <SelectValue placeholder="Select an RTB role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isLockingEnabled" 
                    checked={applicationForm.isLockingEnabled}
                    onCheckedChange={(checked) => handleApplicationFormChange('isLockingEnabled', checked)}
                  />
                  <Label htmlFor="isLockingEnabled">Locking Enabled</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isRunOnWeekDayOnly" 
                    checked={applicationForm.isRunOnWeekDayOnly}
                    onCheckedChange={(checked) => handleApplicationFormChange('isRunOnWeekDayOnly', checked)}
                  />
                  <Label htmlFor="isRunOnWeekDayOnly">Run on Weekdays Only</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="useRunCalendar" 
                    checked={applicationForm.useRunCalendar}
                    onCheckedChange={(checked) => handleApplicationFormChange('useRunCalendar', checked)}
                  />
                  <Label htmlFor="useRunCalendar">Use Run Calendar</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isActive" 
                    checked={applicationForm.isActive}
                    onCheckedChange={(checked) => handleApplicationFormChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Application is active</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setApplicationDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveApplication} disabled={loading}>
                {loading ? 'Saving...' : selectedApplication ? 'Update Application' : 'Create Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
                <TableRow key={app.applicationId}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.category}</TableCell>
                  <TableCell className="max-w-xs truncate">{app.description}</TableCell>
                  <TableCell>{formatCronSchedule(app.cronExpression)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {app.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedApplication(app);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedApplication(app);
                          setApplicationDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setApplicationToDelete(app.applicationId);
                          setDeleteDialogOpen(true);
                        }}
                      >
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
      
      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Detailed information about the application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p>{selectedApplication.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p>{selectedApplication.category || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{selectedApplication.description || 'No description provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Service URL</h3>
                <div className="flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  <p>{selectedApplication.serviceUrl || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created On</h3>
                  <p>{selectedApplication.createdOn}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedApplication.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedApplication.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cron Schedule</h3>
                  <p>{selectedApplication.cronExpression || 'Not scheduled'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Run Date Offset</h3>
                  <p>{selectedApplication.runDateOffSet} days</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Locking</h3>
                  <p>{selectedApplication.isLockingEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Locking Role</h3>
                  <p>{selectedApplication.lockingRole || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">RTB Role</h3>
                  <p>{selectedApplication.rtbRole || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Run on Weekdays Only</h3>
                  <p>{selectedApplication.isRunOnWeekDayOnly ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Use Run Calendar</h3>
                <p>{selectedApplication.useRunCalendar ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Application Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteApplication} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApplicationManagement;