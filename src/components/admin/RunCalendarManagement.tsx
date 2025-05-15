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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Plus, Edit, Trash2, Calendar as CalendarIcon, Download, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the interface for the Run Calendar
interface RunCalendar {
  id: string;
  name: string;
  description: string;
  entries: string; // Comma-separated dates
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// Interface for parsed entry data
interface ParsedEntry {
  date: string;
}

// Sample run calendars
const sampleRunCalendars: RunCalendar[] = [
  {
    id: 'runcal1',
    name: 'Daily Weekday Runs',
    description: 'Runs every weekday (Monday to Friday)',
    entries: '2025-05-01,2025-05-02,2025-05-05,2025-05-06,2025-05-07,2025-05-08,2025-05-09',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'runcal2',
    name: 'Weekly Runs',
    description: 'Runs every Monday',
    entries: '2025-05-05,2025-05-12,2025-05-19,2025-05-26',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'runcal3',
    name: 'Month-End Runs',
    description: 'Runs on the last business day of each month',
    entries: '2025-01-31,2025-02-28,2025-03-31,2025-04-30,2025-05-30,2025-06-30',
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: false
  }
];

// Form interfaces
interface CalendarForm {
  id?: string;
  name: string;
  description: string;
  entries: string;
  isActive: boolean;
}

const RunCalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<RunCalendar[]>(sampleRunCalendars);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<RunCalendar | null>(null);
  const [calendarToDelete, setCalendarToDelete] = useState<string>('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Form states
  const [calendarForm, setCalendarForm] = useState<CalendarForm>({
    name: '',
    description: '',
    entries: '',
    isActive: true
  });
  
  // Filter calendars based on search term
  const filteredCalendars = calendars.filter(calendar => 
    calendar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    calendar.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (calendarDialogOpen && selectedCalendar) {
      setCalendarForm({
        id: selectedCalendar.id,
        name: selectedCalendar.name,
        description: selectedCalendar.description,
        entries: selectedCalendar.entries,
        isActive: selectedCalendar.isActive
      });
    } else if (calendarDialogOpen) {
      setCalendarForm({
        name: '',
        description: '',
        entries: '',
        isActive: true
      });
    }
  }, [calendarDialogOpen, selectedCalendar]);
  
  // Helper function to parse entries string into an array of objects
  const parseEntries = (calendar: RunCalendar): ParsedEntry[] => {
    const dates = calendar.entries.split(',').map(date => date.trim()).filter(Boolean);
    
    return dates.map((date) => ({
      date
    }));
  };
  
  // Form handlers
  const handleCalendarFormChange = (field: keyof CalendarForm, value: any) => {
    setCalendarForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Save calendar
  const saveCalendar = () => {
    if (!calendarForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Calendar name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!calendarForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Calendar description is required",
        variant: "destructive"
      });
      return;
    }
    
    if (calendarForm.id) {
      // Update existing calendar
      setCalendars(prev => prev.map(calendar => 
        calendar.id === calendarForm.id 
          ? { 
              ...calendar, 
              name: calendarForm.name, 
              description: calendarForm.description,
              entries: calendarForm.entries,
              isActive: calendarForm.isActive,
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User'
            } 
          : calendar
      ));
      toast({
        title: "Calendar Updated",
        description: `Run calendar "${calendarForm.name}" has been updated successfully.`
      });
    } else {
      // Add new calendar
      const newCalendar: RunCalendar = {
        id: `runcal-${Date.now()}`,
        name: calendarForm.name,
        description: calendarForm.description,
        entries: calendarForm.entries,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        updatedBy: 'Current User',
        isActive: calendarForm.isActive
      };
      
      setCalendars(prev => [...prev, newCalendar]);
      toast({
        title: "Calendar Added",
        description: `Run calendar "${calendarForm.name}" has been added successfully.`
      });
    }
    
    setCalendarDialogOpen(false);
  };
  
  // Delete calendar
  const confirmDeleteCalendar = () => {
    setCalendars(prev => prev.filter(calendar => calendar.id !== calendarToDelete));
    setDeleteDialogOpen(false);
    toast({
      title: "Calendar Deleted",
      description: "The run calendar has been deleted successfully."
    });
  };
  
  // Export calendar
  const exportCalendar = (calendar: RunCalendar) => {
    const data = {
      name: calendar.name,
      description: calendar.description,
      entries: calendar.entries
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calendar.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Calendar Exported",
      description: `Run calendar "${calendar.name}" has been exported successfully.`
    });
  };
  
  // Import calendar
  const importCalendar = () => {
    try {
      const data = JSON.parse(importText);
      
      if (!data.name || !data.description || !data.entries) {
        throw new Error('Invalid format');
      }
      
      const newCalendar: RunCalendar = {
        id: `runcal-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        entries: data.entries,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        updatedBy: 'Current User',
        isActive: true
      };
      
      setCalendars(prev => [...prev, newCalendar]);
      setImportDialogOpen(false);
      setImportText('');
      
      toast({
        title: "Calendar Imported",
        description: `Run calendar "${data.name}" has been imported successfully.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import calendar. Please check the format of your JSON data.",
        variant: "destructive"
      });
    }
  };
  
  // Generate calendar entries for a month
  const generateMonthEntries = (calendar: RunCalendar, month: Date, pattern: 'weekdays' | 'mondays' | 'month-end' | 'all') => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    
    // Parse existing entries
    const existingEntries = parseEntries(calendar);
    const existingDates = existingEntries.map(entry => entry.date);
    
    // New arrays to hold the updated data
    let newDates: string[] = [];
    
    // Add existing entries that are not in the current month
    existingEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() !== month.getMonth() || entryDate.getFullYear() !== month.getFullYear()) {
        newDates.push(entry.date);
      }
    });
    
    // Generate new entries for the month
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const existingIndex = existingDates.indexOf(dateStr);
      
      if (existingIndex >= 0) {
        // Keep existing entry
        newDates.push(existingEntries[existingIndex].date);
      } else {
        // Create new entry based on pattern
        const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const isLastDayOfMonth = day.getDate() === end.getDate();
        const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
        
        let shouldAdd = false;
        
        switch (pattern) {
          case 'weekdays':
            shouldAdd = isWeekday;
            break;
          case 'mondays':
            shouldAdd = dayOfWeek === 1;
            break;
          case 'month-end':
            // For simplicity, we'll consider the last day of the month as month-end
            shouldAdd = isLastDayOfMonth;
            break;
          case 'all':
            shouldAdd = true;
            break;
        }
        
        if (shouldAdd) {
          newDates.push(dateStr);
        }
      }
    });
    
    // Sort entries by date
    newDates.sort();
    
    // Update calendar with new entries
    setCalendars(prev => prev.map(cal => 
      cal.id === calendar.id 
        ? { 
            ...cal, 
            entries: newDates.join(','),
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          } 
        : cal
    ));
    
    toast({
      title: "Calendar Generated",
      description: `Run calendar entries for ${format(month, 'MMMM yyyy')} have been generated successfully.`
    });
  };
  
  // Get entries for the selected month
  const getMonthEntries = (calendar: RunCalendar): ParsedEntry[] => {
    const allEntries = parseEntries(calendar);
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    }).sort((a, b) => a.date.localeCompare(b.date));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calendars..."
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
                Import Calendar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Import Run Calendar</DialogTitle>
                <DialogDescription>
                  Import a run calendar from JSON format
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="importJson">Paste JSON data</Label>
                  <Textarea 
                    id="importJson" 
                    placeholder='{"name": "Calendar Name", "description": "Description", "entries": "2025-01-01,2025-01-02"}' 
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
                <Button onClick={importCalendar} disabled={!importText.trim()}>
                  Import Calendar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={calendarDialogOpen} onOpenChange={setCalendarDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedCalendar(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Calendar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedCalendar ? 'Edit Calendar' : 'Add New Calendar'}</DialogTitle>
                <DialogDescription>
                  {selectedCalendar ? 'Update the calendar details' : 'Create a new run calendar'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Calendar Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="Enter calendar name" 
                    value={calendarForm.name}
                    onChange={(e) => handleCalendarFormChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter calendar description" 
                    value={calendarForm.description}
                    onChange={(e) => handleCalendarFormChange('description', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="entries">Entries (comma-separated dates)</Label>
                  <Textarea 
                    id="entries" 
                    placeholder="2025-01-01,2025-01-02,2025-01-03" 
                    value={calendarForm.entries}
                    onChange={(e) => handleCalendarFormChange('entries', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Enter dates in YYYY-MM-DD format, separated by commas</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isActive" 
                    checked={calendarForm.isActive}
                    onCheckedChange={(checked) => handleCalendarFormChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Calendar is active</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCalendarDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCalendar}>
                  {selectedCalendar ? 'Update Calendar' : 'Create Calendar'}
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
              <TableHead>Entries</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalendars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No calendars found
                </TableCell>
              </TableRow>
            ) : (
              filteredCalendars.map((calendar) => (
                <React.Fragment key={calendar.id}>
                  <TableRow>
                    <TableCell className="font-medium">{calendar.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{calendar.description}</TableCell>
                    <TableCell>{calendar.entries.split(',').filter(Boolean).length} entries</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        calendar.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {calendar.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => exportCalendar(calendar)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedCalendar(calendar);
                          setCalendarDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setCalendarToDelete(calendar.id);
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
                            <h4 className="text-sm font-medium">Run Calendar Entries</h4>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {format(selectedMonth, 'MMMM yyyy')}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={selectedMonth}
                                  onSelect={(date) => setSelectedMonth(date || new Date())}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => generateMonthEntries(calendar, selectedMonth, 'weekdays')}>
                                Weekdays
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => generateMonthEntries(calendar, selectedMonth, 'mondays')}>
                                Mondays
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => generateMonthEntries(calendar, selectedMonth, 'month-end')}>
                                Month-End
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {getMonthEntries(calendar).length === 0 ? (
                          <div className="text-center py-4 border rounded-md">
                            <p className="text-sm text-muted-foreground">
                              No entries defined for {format(selectedMonth, 'MMMM yyyy')}. Use the buttons above to generate entries.
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[300px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Day</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getMonthEntries(calendar).map((entry, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{format(new Date(entry.date), 'EEEE')}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
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
      
      {/* Delete Calendar Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected run calendar and all its entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCalendar}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RunCalendarManagement;