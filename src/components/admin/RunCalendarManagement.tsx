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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  Save,
  X,
  Clock,
  Building2,
  Play
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { workflowService } from '@/services/workflowService';
import { 
  WorkflowRunCalendar, 
  UniqueRunCalendar, 
  ApplicationRunCalendarMapping, 
  UniqueApplication,
  RunCalendarSaveRequest
} from '@/types/application-types';

// Helper function to convert date formats
const formatDateForAPI = (dateStr: string): string => {
  // Convert from YYYY-MM-DD to DD-MMM-YYYY format
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateFromAPI = (dateStr: string): string => {
  // Convert from DD-MMM-YYYY to YYYY-MM-DD format
  try {
    const [day, month, year] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) return dateStr;
    
    const date = new Date(parseInt(year), monthIndex, parseInt(day));
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
};

const isDateExpired = (dateStr: string): boolean => {
  try {
    const date = new Date(formatDateFromAPI(dateStr));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  } catch {
    return false;
  }
};

// Group calendars by name
interface RunCalendarGroup {
  calendarName: string;
  calendarDescription: string;
  runDates: WorkflowRunCalendar[];
}

const RunCalendarManagement: React.FC = () => {
  // State for calendar data
  const [runCalendars, setRunCalendars] = useState<WorkflowRunCalendar[]>([]);
  const [uniqueRunCalendars, setUniqueRunCalendars] = useState<UniqueRunCalendar[]>([]);
  const [applications, setApplications] = useState<UniqueApplication[]>([]);
  const [applicationMappings, setApplicationMappings] = useState<ApplicationRunCalendarMapping[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCalendarName, setSelectedCalendarName] = useState<string>('');
  
  // Dialog states
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  
  // Form states
  const [calendarForm, setCalendarForm] = useState({
    calendarName: '',
    calendarDescription: '',
    newDates: [] as string[]
  });
  const [newDateInput, setNewDateInput] = useState('');
  const [dateToDelete, setDateToDelete] = useState<{ calendarName: string; businessDate: string } | null>(null);
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [runCalendarsRes, uniqueRunCalendarsRes, applicationsRes, mappingsRes] = await Promise.all([
        workflowService.getWorkflowRunCalendars(),
        workflowService.getUniqueRunCalendars(),
        workflowService.getUniqueApplications(),
        workflowService.getApplicationRunCalendarMappings()
      ]);

      if (runCalendarsRes.success) setRunCalendars(runCalendarsRes.data);
      if (uniqueRunCalendarsRes.success) setUniqueRunCalendars(uniqueRunCalendarsRes.data);
      if (applicationsRes.success) setApplications(applicationsRes.data);
      if (mappingsRes.success) setApplicationMappings(mappingsRes.data);

      if (!runCalendarsRes.success || !uniqueRunCalendarsRes.success || !applicationsRes.success || !mappingsRes.success) {
        toast({
          title: "Warning",
          description: "Some data could not be loaded. Please refresh the page.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load run calendar data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Group calendars by name
  const groupedRunCalendars = React.useMemo(() => {
    const groups: Record<string, RunCalendarGroup> = {};
    
    runCalendars.forEach(calendar => {
      if (!groups[calendar.calendarName]) {
        groups[calendar.calendarName] = {
          calendarName: calendar.calendarName,
          calendarDescription: calendar.calendarDescription,
          runDates: []
        };
      }
      groups[calendar.calendarName].runDates.push(calendar);
    });
    
    return Object.values(groups);
  }, [runCalendars]);

  // Filter calendars based on search term
  const filteredRunCalendars = groupedRunCalendars.filter(group => 
    group.calendarName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.calendarDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form changes
  const handleCalendarFormChange = (field: string, value: any) => {
    setCalendarForm(prev => ({ ...prev, [field]: value }));
  };

  // Add new date to form
  const addNewDate = () => {
    if (!newDateInput.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a date",
        variant: "destructive"
      });
      return;
    }

    const formattedDate = formatDateForAPI(newDateInput);
    if (calendarForm.newDates.includes(formattedDate)) {
      toast({
        title: "Validation Error",
        description: "This date is already added",
        variant: "destructive"
      });
      return;
    }

    setCalendarForm(prev => ({
      ...prev,
      newDates: [...prev.newDates, formattedDate]
    }));
    setNewDateInput('');
  };

  // Remove date from form
  const removeDateFromForm = (dateToRemove: string) => {
    setCalendarForm(prev => ({
      ...prev,
      newDates: prev.newDates.filter(date => date !== dateToRemove)
    }));
  };

  // Save calendar with new dates
  const saveRunCalendar = async () => {
    if (!calendarForm.calendarName.trim()) {
      toast({
        title: "Validation Error",
        description: "Calendar name is required",
        variant: "destructive"
      });
      return;
    }

    if (!calendarForm.calendarDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Calendar description is required",
        variant: "destructive"
      });
      return;
    }

    if (calendarForm.newDates.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one run date is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const calendarEntries: WorkflowRunCalendar[] = calendarForm.newDates.map(date => ({
        calendarName: calendarForm.calendarName,
        calendarDescription: calendarForm.calendarDescription,
        businessDate: date,
        action: 1 // Add action
      }));

      const response = await workflowService.saveRunCalendars(calendarEntries);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `Run Calendar "${calendarForm.calendarName}" has been saved successfully.`
        });
        setCalendarDialogOpen(false);
        loadData(); // Reload data
      } else {
        throw new Error(response.error || 'Failed to save run calendar');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save run calendar",
        variant: "destructive"
      });
    }
  };

  // Delete a specific date from a calendar
  const deleteDate = async () => {
    if (!dateToDelete) return;

    try {
      const calendarEntry: WorkflowRunCalendar = {
        calendarName: dateToDelete.calendarName,
        calendarDescription: '', // Not needed for delete
        businessDate: dateToDelete.businessDate,
        action: 3 // Delete action
      };

      const response = await workflowService.saveRunCalendars([calendarEntry]);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Run date has been deleted successfully."
        });
        setDeleteDialogOpen(false);
        setDateToDelete(null);
        loadData(); // Reload data
      } else {
        throw new Error(response.error || 'Failed to delete date');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete date",
        variant: "destructive"
      });
    }
  };

  // Open calendar form for new calendar
  const openNewCalendarForm = () => {
    setCalendarForm({
      calendarName: '',
      calendarDescription: '',
      newDates: []
    });
    setNewDateInput('');
    setCalendarDialogOpen(true);
  };

  // Open calendar form for editing existing calendar
  const openEditCalendarForm = (group: RunCalendarGroup) => {
    setCalendarForm({
      calendarName: group.calendarName,
      calendarDescription: group.calendarDescription,
      newDates: []
    });
    setNewDateInput('');
    setCalendarDialogOpen(true);
  };

  // Get applications assigned to a calendar
  const getAssignedApplications = (calendarName: string) => {
    return applicationMappings.filter(mapping => mapping.calendarName === calendarName);
  };

  // Handle application assignment
  const handleApplicationAssignment = async (applicationId: number, calendarName: string, isAssigned: boolean) => {
    try {
      console.log('[RunCalendarManagement] Handling assignment:', { applicationId, calendarName, isAssigned });
      
      const mapping: RunCalendarSaveRequest = {
        action: isAssigned ? 1 : 3, // 1 = assign, 3 = unassign
        applicationId: applicationId,
        calendarName: calendarName
      };

      console.log('[RunCalendarManagement] Sending mapping request:', mapping);
      const response = await workflowService.saveApplicationRunCalendarMapping(mapping);
      
      console.log('[RunCalendarManagement] Response received:', response);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `Application ${isAssigned ? 'assigned to' : 'unassigned from'} run calendar successfully.`
        });
        await loadData(); // Reload data
      } else {
        throw new Error(response.error || 'Failed to update assignment');
      }
    } catch (error: any) {
      console.error('[RunCalendarManagement] Assignment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update application assignment",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading run calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search run calendars..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={openNewCalendarForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Run Calendar
        </Button>
      </div>

      <Tabs defaultValue="calendars" className="w-full">
        <TabsList>
          <TabsTrigger value="calendars">Run Calendars</TabsTrigger>
          <TabsTrigger value="assignments">Application Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="calendars" className="space-y-4">
          <div className="grid gap-4">
            {filteredRunCalendars.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No run calendars found</p>
                </CardContent>
              </Card>
            ) : (
              filteredRunCalendars.map((group) => (
                <Card key={group.calendarName}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5" />
                          {group.calendarName}
                        </CardTitle>
                        <CardDescription>{group.calendarDescription}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditCalendarForm(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Run Dates ({group.runDates.length})</h4>
                        <Badge variant="secondary">
                          {getAssignedApplications(group.calendarName).length} Applications
                        </Badge>
                      </div>
                      
                      <ScrollArea className="h-48">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {group.runDates
                            .sort((a, b) => new Date(formatDateFromAPI(a.businessDate)).getTime() - new Date(formatDateFromAPI(b.businessDate)).getTime())
                            .map((runDate, index) => {
                              const isExpired = isDateExpired(runDate.businessDate);
                              return (
                                <div key={index} className={`flex items-center justify-between p-2 rounded border ${isExpired ? 'bg-muted opacity-60' : 'bg-background'}`}>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-sm">
                                      {new Date(formatDateFromAPI(runDate.businessDate)).toLocaleDateString()}
                                    </span>
                                    {isExpired && <Badge variant="outline" className="text-xs">Expired</Badge>}
                                  </div>
                                  {!isExpired && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setDateToDelete({
                                          calendarName: runDate.calendarName,
                                          businessDate: runDate.businessDate
                                        });
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Run Calendar Assignments</CardTitle>
              <CardDescription>
                Assign run calendars to applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app) => {
                  const currentMapping = applicationMappings.find(m => m.applicationId === parseInt(app.configId));
                  return (
                    <div key={app.configId} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{app.configName}</p>
                          <p className="text-sm text-muted-foreground">{app.configType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {currentMapping && (
                          <Badge variant="secondary">
                            {currentMapping.calendarName}
                          </Badge>
                        )}
                        <Select
                          value={currentMapping?.calendarName || ''}
                          onValueChange={async (value) => {
                            try {
                              const appId = parseInt(app.configId, 10);
                              
                              if (isNaN(appId)) {
                                console.error('[RunCalendarManagement] Invalid application ID:', app.configId);
                                toast({
                                  title: "Error",
                                  description: "Invalid application ID",
                                  variant: "destructive"
                                });
                                return;
                              }

                              if (value === '') {
                                // Unassign current calendar
                                if (currentMapping) {
                                  await handleApplicationAssignment(appId, currentMapping.calendarName, false);
                                }
                              } else {
                                // First unassign current calendar if exists
                                if (currentMapping && currentMapping.calendarName !== value) {
                                  await handleApplicationAssignment(appId, currentMapping.calendarName, false);
                                }
                                // Then assign new calendar
                                await handleApplicationAssignment(appId, value, true);
                              }
                            } catch (error: any) {
                              console.error('[RunCalendarManagement] Select change error:', error);
                              toast({
                                title: "Error",
                                description: "Failed to update run calendar assignment",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select run calendar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Run Calendar</SelectItem>
                            {uniqueRunCalendars.map((calendar) => (
                              <SelectItem key={calendar.calendarName} value={calendar.calendarName}>
                                {calendar.calendarName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Calendar Dialog */}
      <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {calendarForm.calendarName ? 'Add Dates to Run Calendar' : 'Create New Run Calendar'}
            </DialogTitle>
            <DialogDescription>
              {calendarForm.calendarName ? 'Add new run dates to the existing calendar' : 'Create a new run calendar with dates'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="calendarName">Calendar Name <span className="text-red-500">*</span></Label>
              <Input 
                id="calendarName" 
                placeholder="Enter calendar name" 
                value={calendarForm.calendarName}
                onChange={(e) => handleCalendarFormChange('calendarName', e.target.value)}
                disabled={!!calendarForm.calendarName} // Disable if editing existing calendar
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calendarDescription">Description <span className="text-red-500">*</span></Label>
              <Textarea 
                id="calendarDescription" 
                placeholder="Enter calendar description" 
                value={calendarForm.calendarDescription}
                onChange={(e) => handleCalendarFormChange('calendarDescription', e.target.value)}
                required
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Add Run Dates</Label>
              <div className="flex gap-2">
                <Input 
                  type="date"
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  placeholder="Select date"
                />
                <Button onClick={addNewDate} disabled={!newDateInput}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {calendarForm.newDates.length > 0 && (
              <div className="space-y-2">
                <Label>New Dates to Add ({calendarForm.newDates.length})</Label>
                <ScrollArea className="h-32 border rounded p-2">
                  <div className="space-y-1">
                    {calendarForm.newDates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">
                          {new Date(formatDateFromAPI(date)).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDateFromForm(date)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalendarDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRunCalendar} disabled={calendarForm.newDates.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              Save Run Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Date Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Run Date</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this run date? This action cannot be undone.
              {dateToDelete && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>Calendar:</strong> {dateToDelete.calendarName}<br />
                  <strong>Date:</strong> {new Date(formatDateFromAPI(dateToDelete.businessDate)).toLocaleDateString()}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RunCalendarManagement;