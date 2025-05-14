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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Application } from '@/types/workflow-types';

// Sample application data
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
    parameters: [
      {
        id: 'param1',
        name: 'reportingDate',
        value: '${currentDate}',
        description: 'Date for which to generate reports',
        isRequired: true,
        dataType: 'date'
      },
      {
        id: 'param2',
        name: 'includeSubsidiaries',
        value: 'true',
        description: 'Whether to include subsidiary companies',
        isRequired: false,
        dataType: 'boolean'
      }
    ],
    hierarchyId: 'hierarchy1',
    holidayCalendarId: 'calendar1',
    runCalendarId: 'runcal1',
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
    parameters: [
      {
        id: 'param3',
        name: 'riskThreshold',
        value: '0.75',
        description: 'Threshold for risk alerts',
        isRequired: true,
        dataType: 'number'
      }
    ],
    hierarchyId: 'hierarchy2',
    holidayCalendarId: 'calendar1',
    runCalendarId: 'runcal2',
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
    parameters: [
      {
        id: 'param4',
        name: 'regulationSet',
        value: 'GDPR,SOX,BASEL',
        description: 'Comma-separated list of regulations to check',
        isRequired: true,
        dataType: 'string'
      }
    ],
    hierarchyId: 'hierarchy3',
    holidayCalendarId: 'calendar2',
    runCalendarId: 'runcal3',
    createdAt: '2025-03-05T14:00:00Z',
    updatedAt: '2025-04-15T16:45:00Z',
    createdBy: 'System Admin',
    updatedBy: 'Robert Johnson',
    isActive: false
  }
];

const ApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(sampleApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Filter applications based on search term
  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>
                Create a new application with its configuration details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Application Name</Label>
                  <Input id="name" placeholder="Enter application name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="Enter category" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceUrl">Service URL</Label>
                <Input id="serviceUrl" placeholder="https://api.example.com/service" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Enter description" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="superUserRole">Super User Role</Label>
                  <Input id="superUserRole" placeholder="Enter super user role" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cronSchedule">Cron Schedule</Label>
                  <Input id="cronSchedule" placeholder="0 18 * * 1-5" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offset">Offset (minutes)</Label>
                  <Input id="offset" type="number" placeholder="30" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lockingRole">Locking Role</Label>
                  <Input id="lockingRole" placeholder="Enter locking role" />
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Checkbox id="lockingRequired" />
                  <Label htmlFor="lockingRequired">Locking Required</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="runOnWeekdays" />
                  <Label htmlFor="runOnWeekdays">Run on Weekdays</Label>
                </div>
              </div>
              
              {/* Parameters section would go here - simplified for now */}
              <div className="space-y-2">
                <Label>Parameters</Label>
                <div className="border rounded-md p-3 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Parameters can be added after creating the application.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Create Application
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
            {filteredApplications.length === 0 ? (
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
                  <TableCell>{app.cronSchedule}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {app.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
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
    </div>
  );
};

export default ApplicationManagement;