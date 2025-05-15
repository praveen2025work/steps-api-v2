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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Plus, Edit, Trash2, Calendar as CalendarIcon, Download, Upload, X, CalendarDays } from 'lucide-react';
import { HolidayCalendar, Holiday } from '@/types/workflow-types';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sample holiday calendars
const sampleHolidayCalendars: HolidayCalendar[] = [
  {
    id: 'cal1',
    name: 'US Holidays 2025',
    description: 'Standard US holidays for 2025',
    holidays: [
      { id: 'h1', name: 'New Year\'s Day', date: '2025-01-01', isRecurring: false },
      { id: 'h2', name: 'Martin Luther King Jr. Day', date: '2025-01-20', isRecurring: false },
      { id: 'h3', name: 'Presidents\' Day', date: '2025-02-17', isRecurring: false },
      { id: 'h4', name: 'Memorial Day', date: '2025-05-26', isRecurring: false },
      { id: 'h5', name: 'Independence Day', date: '2025-07-04', isRecurring: true },
      { id: 'h6', name: 'Labor Day', date: '2025-09-01', isRecurring: false },
      { id: 'h7', name: 'Columbus Day', date: '2025-10-13', isRecurring: false },
      { id: 'h8', name: 'Veterans Day', date: '2025-11-11', isRecurring: true },
      { id: 'h9', name: 'Thanksgiving Day', date: '2025-11-27', isRecurring: false },
      { id: 'h10', name: 'Christmas Day', date: '2025-12-25', isRecurring: true }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'cal2',
    name: 'UK Holidays 2025',
    description: 'Standard UK bank holidays for 2025',
    holidays: [
      { id: 'h11', name: 'New Year\'s Day', date: '2025-01-01', isRecurring: false },
      { id: 'h12', name: 'Good Friday', date: '2025-04-18', isRecurring: false },
      { id: 'h13', name: 'Easter Monday', date: '2025-04-21', isRecurring: false },
      { id: 'h14', name: 'Early May Bank Holiday', date: '2025-05-05', isRecurring: false },
      { id: 'h15', name: 'Spring Bank Holiday', date: '2025-05-26', isRecurring: false },
      { id: 'h16', name: 'Summer Bank Holiday', date: '2025-08-25', isRecurring: false },
      { id: 'h17', name: 'Christmas Day', date: '2025-12-25', isRecurring: true },
      { id: 'h18', name: 'Boxing Day', date: '2025-12-26', isRecurring: true }
    ],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    createdBy: 'System',
    updatedBy: 'System',
    isActive: true
  },
  {
    id: 'cal3',
    name: 'EU Holidays 2025',
    description: 'Common European holidays for 2025',
    holidays: [
      { id: 'h19', name: 'New Year\'s Day', date: '2025-01-01', isRecurring: false },
      { id: 'h20', name: 'Good Friday', date: '2025-04-18', isRecurring: false },
      { id: 'h21', name: 'Easter Monday', date: '2025-04-21', isRecurring: false },
      { id: 'h22', name: 'Labor Day', date: '2025-05-01', isRecurring: true },
      { id: 'h23', name: 'Europe Day', date: '2025-05-09', isRecurring: true },
      { id: 'h24', name: 'Christmas Day', date: '2025-12-25', isRecurring: true },
      { id: 'h25', name: 'St. Stephen\'s Day', date: '2025-12-26', isRecurring: true }
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

interface HolidayForm {
  id?: string;
  name: string;
  date: Date;
  description: string;
  isRecurring: boolean;
}

const HolidayCalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<HolidayCalendar[]>(sampleHolidayCalendars);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteHolidayDialogOpen, setDeleteHolidayDialogOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<HolidayCalendar | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [calendarToDelete, setCalendarToDelete] = useState<string>('');
  const [holidayToDelete, setHolidayToDelete] = useState<{calendarId: string, holidayId: string}>({calendarId: '', holidayId: ''});
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  
  // Form states
  const [calendarForm, setCalendarForm] = useState<CalendarForm>({
    name: '',
    description: '',
    isActive: true
  });
  
  const [holidayForm, setHolidayForm] = useState<HolidayForm>({
    name: '',
    date: new Date(),
    description: '',
    isRecurring: false
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
    if (holidayDialogOpen && selectedHoliday) {
      setHolidayForm({
        id: selectedHoliday.id,
        name: selectedHoliday.name,
        date: new Date(selectedHoliday.date),
        description: selectedHoliday.description || '',
        isRecurring: selectedHoliday.isRecurring
      });
    } else if (holidayDialogOpen) {
      setHolidayForm({
        name: '',
        date: new Date(),
        description: '',
        isRecurring: false
      });
    }
  }, [holidayDialogOpen, selectedHoliday]);
  
  // Form handlers
  const handleCalendarFormChange = (field: keyof CalendarForm, value: any) => {
    setCalendarForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleHolidayFormChange = (field: keyof HolidayForm, value: any) => {
    setHolidayForm(prev => ({ ...prev, [field]: value }));
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
        description: `Calendar "${calendarForm.name}" has been updated successfully.`
      });
    } else {
      // Add new calendar
      const newCalendar: HolidayCalendar = {
        id: `cal-${Date.now()}`,
        name: calendarForm.name,
        description: calendarForm.description,
        holidays: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        updatedBy: 'Current User',
        isActive: calendarForm.isActive
      };
      
      setCalendars(prev => [...prev, newCalendar]);
      toast({
        title: "Calendar Added",
        description: `Calendar "${calendarForm.name}" has been added successfully.`
      });
    }
    
    setCalendarDialogOpen(false);
  };
  
  // Save holiday
  const saveHoliday = () => {
    if (!holidayForm.name.trim() || !selectedCalendar) {
      toast({
        title: "Validation Error",
        description: "Holiday name is required and a calendar must be selected",
        variant: "destructive"
      });
      return;
    }
    
    const newHoliday: Holiday = {
      id: holidayForm.id || `holiday-${Date.now()}`,
      name: holidayForm.name,
      date: format(holidayForm.date, 'yyyy-MM-dd'),
      description: holidayForm.description,
      isRecurring: holidayForm.isRecurring
    };
    
    if (holidayForm.id) {
      // Update existing holiday
      setCalendars(prev => prev.map(calendar => 
        calendar.id === selectedCalendar.id 
          ? { 
              ...calendar, 
              holidays: calendar.holidays.map(holiday => 
                holiday.id === holidayForm.id ? newHoliday : holiday
              ),
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User'
            } 
          : calendar
      ));
      toast({
        title: "Holiday Updated",
        description: `Holiday "${holidayForm.name}" has been updated successfully.`
      });
    } else {
      // Add new holiday
      setCalendars(prev => prev.map(calendar => 
        calendar.id === selectedCalendar.id 
          ? { 
              ...calendar, 
              holidays: [...calendar.holidays, newHoliday],
              updatedAt: new Date().toISOString(),
              updatedBy: 'Current User'
            } 
          : calendar
      ));
      toast({
        title: "Holiday Added",
        description: `Holiday "${holidayForm.name}" has been added successfully.`
      });
    }
    
    setHolidayDialogOpen(false);
  };
  
  // Delete calendar
  const confirmDeleteCalendar = () => {
    setCalendars(prev => prev.filter(calendar => calendar.id !== calendarToDelete));
    setDeleteDialogOpen(false);
    toast({
      title: "Calendar Deleted",
      description: "The holiday calendar has been deleted successfully."
    });
  };
  
  // Delete holiday
  const confirmDeleteHoliday = () => {
    setCalendars(prev => prev.map(calendar => 
      calendar.id === holidayToDelete.calendarId 
        ? { 
            ...calendar, 
            holidays: calendar.holidays.filter(holiday => holiday.id !== holidayToDelete.holidayId),
            updatedAt: new Date().toISOString(),
            updatedBy: 'Current User'
          } 
        : calendar
    ));
    setDeleteHolidayDialogOpen(false);
    toast({
      title: "Holiday Deleted",
      description: "The holiday has been deleted successfully."
    });
  };
  
  // Export calendar
  const exportCalendar = (calendar: HolidayCalendar) => {
    const data = {
      name: calendar.name,
      description: calendar.description,
      holidays: calendar.holidays.map(holiday => ({
        name: holiday.name,
        date: holiday.date,
        description: holiday.description,
        isRecurring: holiday.isRecurring
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
      description: `Calendar "${calendar.name}" has been exported successfully.`
    });
  };
  
  // Import calendar
  const importCalendar = () => {
    try {
      const data = JSON.parse(importText);
      
      if (!data.name || !Array.isArray(data.holidays)) {
        throw new Error('Invalid format');
      }
      
      const newCalendar: HolidayCalendar = {
        id: `cal-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        holidays: data.holidays.map((holiday: any, index: number) => ({
          id: `imported-holiday-${index}`,
          name: holiday.name,
          date: holiday.date,
          description: holiday.description || '',
          isRecurring: holiday.isRecurring || false
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
        description: `Calendar "${data.name}" with ${data.holidays.length} holidays has been imported successfully.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import calendar. Please check the format of your JSON data.",
        variant: "destructive"
      });
    }
  };
  
  // Import from CSV
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        
        // Skip header row
        const holidays = lines.slice(1).filter(line => line.trim()).map((line, index) => {
          const [name, date, description, isRecurringStr] = line.split(',').map(item => item.trim());
          return {
            id: `csv-holiday-${index}`,
            name,
            date,
            description: description || '',
            isRecurring: isRecurringStr?.toLowerCase() === 'true'
          };
        });
        
        if (holidays.length === 0) {
          throw new Error('No holidays found in CSV');
        }
        
        setImportText(JSON.stringify({
          name: file.name.replace('.csv', ''),
          description: `Imported from ${file.name}`,
          holidays
        }, null, 2));
        
      } catch (error) {
        toast({
          title: "CSV Parse Failed",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
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
                <DialogTitle>Import Holiday Calendar</DialogTitle>
                <DialogDescription>
                  Import a holiday calendar from JSON or CSV format
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="importFile">Upload CSV File (Name, Date, Description, IsRecurring)</Label>
                  <Input id="importFile" type="file" accept=".csv" onChange={handleFileUpload} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="importJson">Or paste JSON data</Label>
                  <Textarea 
                    id="importJson" 
                    placeholder='{"name": "Calendar Name", "description": "Description", "holidays": [{"name": "Holiday Name", "date": "2025-01-01", "isRecurring": false}]}' 
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
                  {selectedCalendar ? 'Update the calendar details' : 'Create a new holiday calendar'}
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
              <TableHead>Holidays</TableHead>
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
                    <TableCell>{calendar.holidays.length} holidays</TableCell>
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
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Holidays</h4>
                          <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedCalendar(calendar);
                                setSelectedHoliday(null);
                              }}>
                                <Plus className="mr-2 h-4 w-4" /> Add Holiday
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>{selectedHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
                                <DialogDescription>
                                  {selectedHoliday ? 'Update the holiday details' : 'Add a new holiday to the calendar'}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="holidayName">Holiday Name</Label>
                                  <Input 
                                    id="holidayName" 
                                    placeholder="Enter holiday name" 
                                    value={holidayForm.name}
                                    onChange={(e) => handleHolidayFormChange('name', e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="holidayDate">Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {holidayForm.date ? format(holidayForm.date, 'PPP') : <span>Pick a date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={holidayForm.date}
                                        onSelect={(date) => handleHolidayFormChange('date', date || new Date())}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="holidayDescription">Description (Optional)</Label>
                                  <Textarea 
                                    id="holidayDescription" 
                                    placeholder="Enter holiday description" 
                                    value={holidayForm.description}
                                    onChange={(e) => handleHolidayFormChange('description', e.target.value)}
                                  />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="isRecurring" 
                                    checked={holidayForm.isRecurring}
                                    onCheckedChange={(checked) => handleHolidayFormChange('isRecurring', checked === true)}
                                  />
                                  <Label htmlFor="isRecurring">This is a recurring holiday (same date every year)</Label>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setHolidayDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={saveHoliday}>
                                  {selectedHoliday ? 'Update Holiday' : 'Add Holiday'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        {calendar.holidays.length === 0 ? (
                          <div className="text-center py-4 border rounded-md">
                            <p className="text-sm text-muted-foreground">
                              No holidays defined for this calendar. Click "Add Holiday" to create one.
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[200px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Recurring</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {calendar.holidays.map((holiday) => (
                                  <TableRow key={holiday.id}>
                                    <TableCell className="font-medium">{holiday.name}</TableCell>
                                    <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      {holiday.isRecurring ? (
                                        <Badge variant="outline" className="bg-blue-50">Yearly</Badge>
                                      ) : (
                                        <Badge variant="outline">One-time</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{holiday.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                          setSelectedCalendar(calendar);
                                          setSelectedHoliday(holiday);
                                          setHolidayDialogOpen(true);
                                        }}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                          setHolidayToDelete({ calendarId: calendar.id, holidayId: holiday.id });
                                          setDeleteHolidayDialogOpen(true);
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
              This action cannot be undone. This will permanently delete the selected holiday calendar and all its holidays.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCalendar}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Holiday Confirmation Dialog */}
      <AlertDialog open={deleteHolidayDialogOpen} onOpenChange={setDeleteHolidayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this holiday? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHoliday}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HolidayCalendarManagement;