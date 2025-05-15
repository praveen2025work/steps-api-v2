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
import { Search, Plus, Edit, Trash2, Calendar as CalendarIcon, Download, Upload, X, CalendarDays, Check } from 'lucide-react';
import { RunCalendar, RunCalendarEntry } from '@/types/workflow-types';
import { toast } from '@/components/ui/use-toast';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sample run calendars
const sampleRunCalendars: RunCalendar[] = [
  {
    id: 'runcal1',
    name: 'Daily Weekday Runs',
    description: 'Runs every weekday (Monday to Friday)',
    entries: [
      { id: 'r1', date: '2025-05-01', isRunDay: true, description: 'Regular run day' },
      { id: 'r2', date: '2025-05-02', isRunDay: true, description: 'Regular run day' },
      { id: 'r3', date: '2025-05-03', isRunDay: false, description: 'Weekend' },
      { id: 'r4', date: '2025-05-04', isRunDay: false, description: 'Weekend' },
      { id: 'r5', date: '2025-05-05', isRunDay: true, description: 'Regular run day' },
      { id: 'r6', date: '2025-05-06', isRunDay: true, description: 'Regular run day' },
      { id: 'r7', date: '2025-05-07', isRunDay: true, description: 'Regular run day' },
      { id: 'r8', date: '2025-05-08', isRunDay: true, description: 'Regular run day' },
      { id: 'r9', date: '2025-05-09', isRunDay: true, description: 'Regular run day' }
    ],
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
    entries: [
      { id: 'r10', date: '2025-05-05', isRunDay: true, description: 'Monday run' },
      { id: 'r11', date: '2025-05-06', isRunDay: false, description: 'Non-run day' },
      { id: 'r12', date: '2025-05-07', isRunDay: false, description: 'Non-run day' },
      { id: 'r13', date: '2025-05-08', isRunDay: false, description: 'Non-run day' },
      { id: 'r14', date: '2025-05-09', isRunDay: false, description: 'Non-run day' },
      { id: 'r15', date: '2025-05-10', isRunDay: false, description: 'Weekend' },
      { id: 'r16', date: '2025-05-11', isRunDay: false, description: 'Weekend' },
      { id: 'r17', date: '2025-05-12', isRunDay: true, description: 'Monday run' }
    ],
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
    entries: [
      { id: 'r18', date: '2025-01-31', isRunDay: true, description: 'January month-end' },
      { id: 'r19', date: '2025-02-28', isRunDay: true, description: 'February month-end' },
      { id: 'r20', date: '2025-03-31', isRunDay: true, description: 'March month-end' },
      { id: 'r21', date: '2025-04-30', isRunDay: true, description: 'April month-end' },
      { id: 'r22', date: '2025-05-30', isRunDay: true, description: 'May month-end (last business day)' },
      { id: 'r23', date: '2025-06-30', isRunDay: true, description: 'June month-end' }
    ],
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
  isActive: boolean;
}

interface EntryForm {
  id?: string;
  date: Date;
  isRunDay: boolean;
  description: string;
}

const RunCalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<RunCalendar[]>(sampleRunCalendars);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEntryDialogOpen, setDeleteEntryDialogOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<RunCalendar | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<RunCalendarEntry | null>(null);
  const [calendarToDelete, setCalendarToDelete] = useState<string>('');
  const [entryToDelete, setEntryToDelete] = useState<{calendarId: string, entryId: string}>({calendarId: '', entryId: ''});
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  
  // Form states
  const [calendarForm, setCalendarForm] = useState<CalendarForm>({
    name: '',
    description: '',
    isActive: true
  });
  
  const [entryForm, setEntryForm] = useState<EntryForm>({
    date: new Date(),
    isRunDay: true,
    description: ''
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
        isActive: selectedCalendar.isActive
      });
    } else if (calendarDialogOpen) {
      setCalendarForm({
        name: '',
        description: '',
        isActive: true
      });
    }
  }, [calendarDialogOpen, selectedCalendar]);
  
  React.useEffect(() => {
    if (entryDialogOpen && selectedEntry) {
      setEntryForm({
        id: selectedEntry.id,
        date: new Date(selectedEntry.date),
        isRunDay: selectedEntry.isRunDay,
        description: selectedEntry.description || ''
      });
    } else if (entryDialogOpen) {
      setEntryForm({
        date: new Date(),
        isRunDay: true,
        description: ''
      });
    }
  }, [entryDialogOpen, selectedEntry]);
  
  // Form handlers
  const handleCalendarFormChange = (field: keyof CalendarForm, value: any) => {
    setCalendarForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleEntryFormChange = (field: keyof EntryForm, value: any) => {
    setEntryForm(prev => ({ ...prev, [field]: value }));
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
    
    if (calendarForm.id) {
      // Update existing calendar
      setCalendars(prev => prev.map(calendar => 
        calendar.id === calendarForm.id 
          ? { 
              ...calendar, 
              name: calendarForm.name, 
              description: calendarForm.description, 
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
        entries: [],
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
  
  // Save entry
  const saveEntry = () => {
    if (!selectedCalendar) {
      toast({
        title: "Validation Error",
        description: "A calendar must be selected",
        variant: "destructive"
      });
      return;
    }
    
    const newEntry: RunCalendarEntry = {
      id: entryForm.id || `entry-${Date.now()}`,
      date: format(entryForm.date, 'yyyy-MM-dd'),
      isRunDay: entryForm.isRunDay,
      description: entryForm.description
    };
    
    if (entryForm.id) {
      // Update existing entry
      setCalendars(prev => prev.map(calendar => 
        calendar.id === selectedCalendar.id 
          ? { 
              ...calendar, 
              entries: calendar.entries.map(entry => 
                entry.id === entryForm.id ? newEntry : entry
              ),
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User'
            } 
          : calendar
      ));
      toast({
        title: "Entry Updated",
        description: `Calendar entry for ${format(entryForm.date, 'PPP')} has been updated successfully.`
      });
    } else {
      // Check if entry for this date already exists
      const existingEntry = selectedCalendar.entries.find(entry => entry.date === newEntry.date);
      
      if (existingEntry) {
        toast({
          title: "Entry Already Exists",
          description: `An entry for ${format(entryForm.date, 'PPP')} already exists. Please edit the existing entry instead.`,
          variant: "destructive"
        });
        return;
      }
      
      // Add new entry
      setCalendars(prev => prev.map(calendar => 
        calendar.id === selectedCalendar.id 
          ? { 
              ...calendar, 
              entries: [...calendar.entries, newEntry].sort((a, b) => a.date.localeCompare(b.date)),
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User'
            } 
          : calendar
      ));
      toast({
        title: "Entry Added",
        description: `Calendar entry for ${format(entryForm.date, 'PPP')} has been added successfully.`
      });
    }
    
    setEntryDialogOpen(false);
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
  
  // Delete entry
  const confirmDeleteEntry = () => {
    setCalendars(prev => prev.map(calendar => 
      calendar.id === entryToDelete.calendarId 
        ? { 
            ...calendar, 
            entries: calendar.entries.filter(entry => entry.id !== entryToDelete.entryId),
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          } 
        : calendar
    ));
    setDeleteEntryDialogOpen(false);
    toast({
      title: "Entry Deleted",
      description: "The calendar entry has been deleted successfully."
    });
  };
  
  // Export calendar
  const exportCalendar = (calendar: RunCalendar) => {
    const data = {
      name: calendar.name,
      description: calendar.description,
      entries: calendar.entries.map(entry => ({
        date: entry.date,
        isRunDay: entry.isRunDay,
        description: entry.description
      }))
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
      
      if (!data.name || !Array.isArray(data.entries)) {
        throw new Error('Invalid format');
      }
      
      const newCalendar: RunCalendar = {
        id: `runcal-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        entries: data.entries.map((entry: any, index: number) => ({
          id: `imported-entry-${index}`,
          date: entry.date,
          isRunDay: entry.isRunDay,
          description: entry.description || ''
        })),
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
        description: `Run calendar "${data.name}" with ${data.entries.length} entries has been imported successfully.`
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
    
    let newEntries: RunCalendarEntry[] = [];
    
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const existingEntry = calendar.entries.find(entry => entry.date === dateStr);
      
      if (existingEntry) {
        // Keep existing entry
        newEntries.push(existingEntry);
      } else {
        // Create new entry based on pattern
        let isRunDay = false;
        let description = '';
        
        const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const isLastDayOfMonth = day.getDate() === end.getDate();
        const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
        
        switch (pattern) {
          case 'weekdays':
            isRunDay = isWeekday;
            description = isWeekday ? 'Regular weekday run' : 'Weekend - no run';
            break;
          case 'mondays':
            isRunDay = dayOfWeek === 1;
            description = dayOfWeek === 1 ? 'Monday run' : 'Non-run day';
            break;
          case 'month-end':
            // For simplicity, we'll consider the last day of the month as month-end
            // In a real application, you might want to find the last business day
            isRunDay = isLastDayOfMonth;
            description = isLastDayOfMonth ? `${format(day, 'MMMM')} month-end` : 'Non-run day';
            break;
          case 'all':
            isRunDay = true;
            description = 'Run day';
            break;
        }
        
        newEntries.push({
          id: `generated-${Date.now()}-${dateStr}`,
          date: dateStr,
          isRunDay,
          description
        });
      }
    });
    
    // Sort entries by date
    newEntries.sort((a, b) => a.date.localeCompare(b.date));
    
    // Update calendar with new entries
    setCalendars(prev => prev.map(cal => 
      cal.id === calendar.id 
        ? { 
            ...cal, 
            entries: [
              ...cal.entries.filter(entry => !newEntries.some(newEntry => newEntry.date === entry.date)),
              ...newEntries
            ].sort((a, b) => a.date.localeCompare(b.date)),
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
  
  // Toggle run day status for a specific date
  const toggleRunDay = (calendar: RunCalendar, entryId: string) => {
    setCalendars(prev => prev.map(cal => 
      cal.id === calendar.id 
        ? { 
            ...cal, 
            entries: cal.entries.map(entry => 
              entry.id === entryId 
                ? { 
                    ...entry, 
                    isRunDay: !entry.isRunDay,
                    description: entry.isRunDay 
                      ? `Non-run day (changed on ${format(new Date(), 'PPP')})` 
                      : `Run day (changed on ${format(new Date(), 'PPP')})`
                  } 
                : entry
            ),
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          } 
        : cal
    ));
  };
  
  // Get entries for the selected month
  const getMonthEntries = (calendar: RunCalendar) => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return calendar.entries.filter(entry => {
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
                    placeholder='{"name": "Calendar Name", "description": "Description", "entries": [{"date": "2025-01-01", "isRunDay": true, "description": "Run day"}]}' 
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
                  <Label htmlFor="name">Calendar Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter calendar name" 
                    value={calendarForm.name}
                    onChange={(e) => handleCalendarFormChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter calendar description" 
                    value={calendarForm.description}
                    onChange={(e) => handleCalendarFormChange('description', e.target.value)}
                  />
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
                    <TableCell>{calendar.entries.length} entries</TableCell>
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
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setBulkEditMode(!bulkEditMode)}>
                              {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
                            </Button>
                            <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedCalendar(calendar);
                                  setSelectedEntry(null);
                                }}>
                                  <Plus className="mr-2 h-4 w-4" /> Add Entry
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>{selectedEntry ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
                                  <DialogDescription>
                                    {selectedEntry ? 'Update the calendar entry details' : 'Add a new entry to the run calendar'}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="entryDate">Date</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="w-full justify-start text-left font-normal"
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {entryForm.date ? format(entryForm.date, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={entryForm.date}
                                          onSelect={(date) => handleEntryFormChange('date', date || new Date())}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Switch 
                                      id="isRunDay" 
                                      checked={entryForm.isRunDay}
                                      onCheckedChange={(checked) => handleEntryFormChange('isRunDay', checked)}
                                    />
                                    <Label htmlFor="isRunDay">{entryForm.isRunDay ? 'This is a run day' : 'This is not a run day'}</Label>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="entryDescription">Description (Optional)</Label>
                                    <Textarea 
                                      id="entryDescription" 
                                      placeholder="Enter description" 
                                      value={entryForm.description}
                                      onChange={(e) => handleEntryFormChange('description', e.target.value)}
                                    />
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEntryDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={saveEntry}>
                                    {selectedEntry ? 'Update Entry' : 'Add Entry'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        
                        {getMonthEntries(calendar).length === 0 ? (
                          <div className="text-center py-4 border rounded-md">
                            <p className="text-sm text-muted-foreground">
                              No entries defined for {format(selectedMonth, 'MMMM yyyy')}. Use the buttons above to generate entries or click "Add Entry" to create one manually.
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[300px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Day</TableHead>
                                  <TableHead>Run Status</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getMonthEntries(calendar).map((entry) => (
                                  <TableRow key={entry.id}>
                                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{format(new Date(entry.date), 'EEEE')}</TableCell>
                                    <TableCell>
                                      {bulkEditMode ? (
                                        <Button 
                                          variant={entry.isRunDay ? "default" : "outline"} 
                                          size="sm"
                                          onClick={() => toggleRunDay(calendar, entry.id)}
                                        >
                                          {entry.isRunDay ? (
                                            <Check className="mr-2 h-4 w-4" />
                                          ) : (
                                            <X className="mr-2 h-4 w-4" />
                                          )}
                                          {entry.isRunDay ? 'Run Day' : 'Non-Run Day'}
                                        </Button>
                                      ) : (
                                        <Badge variant={entry.isRunDay ? "default" : "outline"}>
                                          {entry.isRunDay ? 'Run Day' : 'Non-Run Day'}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{entry.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                          setSelectedCalendar(calendar);
                                          setSelectedEntry(entry);
                                          setEntryDialogOpen(true);
                                        }}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                          setEntryToDelete({ calendarId: calendar.id, entryId: entry.id });
                                          setDeleteEntryDialogOpen(true);
                                        }}>
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
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
      
      {/* Delete Entry Confirmation Dialog */}
      <AlertDialog open={deleteEntryDialogOpen} onOpenChange={setDeleteEntryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this calendar entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEntry}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RunCalendarManagement;