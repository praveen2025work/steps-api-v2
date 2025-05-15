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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Eye, Calendar, Link } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the interface for the API response
interface ApplicationResponse {
  applicationId: number;
  name: string;
  category: string | null;
  serviceUrl: string | null;
  description?: string;
  createdOn?: string;
  cronExpression?: string;
  isActive?: boolean;
  isLockingEnabled?: boolean;
  isRunOnWeekDayOnly?: boolean;
  lockingRole?: string;
  rtbRole?: string;
  runDateOffSet?: number;
  useRunCalendar?: boolean;
}

// Define the interface for our application model
interface Application {
  id: string;
  name: string;
  category: string;
  serviceUrl: string;
  description: string;
  cronExpression: string;
  runDateOffSet: number;
  isLockingEnabled: boolean;
  lockingRole: string;
  rtbRole: string;
  isRunOnWeekDayOnly: boolean;
  useRunCalendar: boolean;
  isActive: boolean;
  createdOn: string;
}

// Form interface
interface ApplicationForm {
  id?: string;
  name: string;
  category: string;
  serviceUrl: string;
  description: string;
  cronExpression: string;
  runDateOffSet: number;
  isLockingEnabled: boolean;
  lockingRole: string;
  rtbRole: string;
  isRunOnWeekDayOnly: boolean;
  useRunCalendar: boolean;
  isActive: boolean;
}

// Sample data based on the API response format
const sampleApplications: Application[] = [
  {
    id: '17',
    name: 'Basel',
    category: 'Basel',
    serviceUrl: 'http://localhost:4200',
    description: 'Basel app',
    cronExpression: '0 55 18 ? * MON-FRI *',
    runDateOffSet: 0,
    isLockingEnabled: false,
    lockingRole: 'Finance Manager',
    rtbRole: 'Risk Analyst',
    isRunOnWeekDayOnly: true,
    useRunCalendar: false,
    isActive: true,
    createdOn: '03/07/2023 04:30:46'
  },
  {
    id: '1',
    name: 'Daily Named Pnl',
    category: 'NPL ID',
    serviceUrl: '',
    description: '',
    cronExpression: '',
    runDateOffSet: 0,
    isLockingEnabled: false,
    lockingRole: 'Finance Manager',
    rtbRole: '',
    isRunOnWeekDayOnly: false,
    useRunCalendar: false,
    isActive: true,
    createdOn: '01/01/2023 00:00:00'
  },
  {
    id: '5',
    name: 'Demoapp',
    category: 'PCV',
    serviceUrl: '',
    description: 'test',
    cronExpression: '',
    runDateOffSet: 0,
    isLockingEnabled: false,
    lockingRole: '',
    rtbRole: 'Compliance Officer',
    isRunOnWeekDayOnly: false,
    useRunCalendar: false,
    isActive: true,
    createdOn: '01/01/2023 00:00:00'
  }
];

const ApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(sampleApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Form state
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({
    name: '',
    category: '',
    serviceUrl: '',
    description: '',
    cronExpression: '',
    runDateOffSet: 0,
    isLockingEnabled: false,
    lockingRole: '',
    rtbRole: '',
    isRunOnWeekDayOnly: false,
    useRunCalendar: false,
    isActive: true
  });
  
  // Filter applications based on search term
  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Fetch applications from API
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // This is a mock API call - in a real implementation, this would be a fetch call
      // const response = await fetch('http://portal-workflowcore-api-uat.com/api/WF/GetWorkflowApplicationDetails/false');
      // const data: ApplicationResponse[] = await response.json();
      
      // For now, we'll simulate the API response with our sample data
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch applications. Please try again later.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };
  
  // Load applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (applicationDialogOpen && selectedApplication) {
      setApplicationForm({
        id: selectedApplication.id,
        name: selectedApplication.name,
        category: selectedApplication.category,
        serviceUrl: selectedApplication.serviceUrl,
        description: selectedApplication.description,
        cronExpression: selectedApplication.cronExpression,
        runDateOffSet: selectedApplication.runDateOffSet,
        isLockingEnabled: selectedApplication.isLockingEnabled,
        lockingRole: selectedApplication.lockingRole,
        rtbRole: selectedApplication.rtbRole || '',
        isRunOnWeekDayOnly: selectedApplication.isRunOnWeekDayOnly,
        useRunCalendar: selectedApplication.useRunCalendar,
        isActive: selectedApplication.isActive
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
        lockingRole: '',
        rtbRole: '',
        isRunOnWeekDayOnly: true,
        useRunCalendar: false,
        isActive: true
      });
    }
  }, [applicationDialogOpen, selectedApplication]);
  
  // Form handlers
  const handleApplicationFormChange = (field: keyof ApplicationForm, value: any) => {
    setApplicationForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Save application
  const saveApplication = async () => {
    if (!applicationForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Application name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API response
      setTimeout(() => {
        if (applicationForm.id) {
          // Update existing application
          setApplications(prev => prev.map(app => 
            app.id === applicationForm.id 
              ? { 
                  ...app, 
                  name: applicationForm.name,
                  category: applicationForm.category,
                  serviceUrl: applicationForm.serviceUrl,
                  description: applicationForm.description,
                  cronExpression: applicationForm.cronExpression,
                  runDateOffSet: applicationForm.runDateOffSet,
                  isLockingEnabled: applicationForm.isLockingEnabled,
                  lockingRole: applicationForm.lockingRole,
                  rtbRole: applicationForm.rtbRole,
                  isRunOnWeekDayOnly: applicationForm.isRunOnWeekDayOnly,
                  useRunCalendar: applicationForm.useRunCalendar,
                  isActive: applicationForm.isActive
                } 
              : app
          ));
          
          toast({
            title: "Application Updated",
            description: `Application "${applicationForm.name}" has been updated successfully.`
          });
        } else {
          // Add new application
          const newApplication: Application = {
            id: `app-${Date.now()}`,
            name: applicationForm.name,
            category: applicationForm.category,
            serviceUrl: applicationForm.serviceUrl,
            description: applicationForm.description,
            cronExpression: applicationForm.cronExpression,
            runDateOffSet: applicationForm.runDateOffSet,
            isLockingEnabled: applicationForm.isLockingEnabled,
            lockingRole: applicationForm.lockingRole,
            rtbRole: applicationForm.rtbRole,
            isRunOnWeekDayOnly: applicationForm.isRunOnWeekDayOnly,
            useRunCalendar: applicationForm.useRunCalendar,
            isActive: applicationForm.isActive,
            createdOn: new Date().toLocaleDateString()
          };
          
          setApplications(prev => [...prev, newApplication]);
          
          toast({
            title: "Application Added",
            description: `Application "${applicationForm.name}" has been added successfully.`
          });
        }
        
        setApplicationDialogOpen(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error saving application:', error);
      toast({
        title: 'Error',
        description: 'Failed to save application. Please try again later.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };
  
  // Delete application
  const confirmDeleteApplication = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API response
      setTimeout(() => {
        setApplications(prev => prev.filter(app => app.id !== applicationToDelete));
        setDeleteDialogOpen(false);
        
        toast({
          title: "Application Deleted",
          description: "The application has been deleted successfully."
        });
        
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete application. Please try again later.',
        variant: 'destructive'
      });
      setIsLoading(false);
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
                  <Input 
                    id="lockingRole" 
                    placeholder="Enter locking role" 
                    value={applicationForm.lockingRole}
                    onChange={(e) => handleApplicationFormChange('lockingRole', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rtbRole">RTB Role</Label>
                <Input 
                  id="rtbRole" 
                  placeholder="Enter RTB role" 
                  value={applicationForm.rtbRole}
                  onChange={(e) => handleApplicationFormChange('rtbRole', e.target.value)}
                />
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
              <Button variant="outline" onClick={() => setApplicationDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={saveApplication} disabled={isLoading}>
                {isLoading ? 'Saving...' : selectedApplication ? 'Update Application' : 'Create Application'}
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
            {isLoading ? (
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
                <TableRow key={app.id}>
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
                          setApplicationToDelete(app.id);
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
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteApplication} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApplicationManagement;