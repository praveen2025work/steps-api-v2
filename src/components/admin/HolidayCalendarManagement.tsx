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
import { Search, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the interface for the Holiday Calendar
interface HolidayCalendar {
  id: string;
  name: string;
  description: string;
  holidays: string; // Comma-separated dates
  additionalInfo?: string; // Comma-separated additional information
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// Interface for parsed holiday data
interface ParsedHoliday {
  date: string;
  info?: string;
}

// Sample holiday calendars
const sampleHolidayCalendars: HolidayCalendar[] = [
  {
    id: 'cal1',
    name: 'US Holidays 2025',
    description: 'Standard US holidays for 2025',
    holidays: '2025-01-01,2025-01-20,2025-02-17,2025-05-26,2025-07-04,2025-09-01,2025-10-13,2025-11-11,2025-11-27,2025-12-25',
    additionalInfo: 'New Year\'s Day,Martin Luther King Jr. Day,Presidents\' Day,Memorial Day,Independence Day,Labor Day,Columbus Day,Veterans Day,Thanksgiving Day,Christmas Day',
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
    holidays: '2025-01-01,2025-04-18,2025-04-21,2025-05-05,2025-05-26,2025-08-25,2025-12-25,2025-12-26',
    additionalInfo: 'New Year\'s Day,Good Friday,Easter Monday,Early May Bank Holiday,Spring Bank Holiday,Summer Bank Holiday,Christmas Day,Boxing Day',
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
    holidays: '2025-01-01,2025-04-18,2025-04-21,2025-05-01,2025-05-09,2025-12-25,2025-12-26',
    additionalInfo: 'New Year\'s Day,Good Friday,Easter Monday,Labor Day,Europe Day,Christmas Day,St. Stephen\'s Day',
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
  holidays: string;
  additionalInfo: string;
  isActive: boolean;
}

const HolidayCalendarManagement: React.FC = () => {
  const [calendars, setCalendars] = useState<HolidayCalendar[]>(sampleHolidayCalendars);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<HolidayCalendar | null>(null);
  const [calendarToDelete, setCalendarToDelete] = useState<string>('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  
  // Form states
  const [calendarForm, setCalendarForm] = useState<CalendarForm>({
    name: '',
    description: '',
    holidays: '',
    additionalInfo: '',
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
        holidays: selectedCalendar.holidays,
        additionalInfo: selectedCalendar.additionalInfo || '',
        isActive: selectedCalendar.isActive
      });
    } else if (calendarDialogOpen) {
      setCalendarForm({
        name: '',
        description: '',
        holidays: '',
        additionalInfo: '',
        isActive: true
      });
    }
  }, [calendarDialogOpen, selectedCalendar]);
  
  // Helper function to parse holidays string into an array of objects
  const parseHolidays = (calendar: HolidayCalendar): ParsedHoliday[] => {
    const dates = calendar.holidays.split(',').map(date => date.trim()).filter(Boolean);
    const infos = calendar.additionalInfo ? calendar.additionalInfo.split(',').map(info => info.trim()) : [];
    
    return dates.map((date, index) => ({
      date,
      info: infos[index] || undefined
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
              holidays: calendarForm.holidays,
              additionalInfo: calendarForm.additionalInfo,
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
        holidays: calendarForm.holidays,
        additionalInfo: calendarForm.additionalInfo,
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
  
  // Delete calendar
  const confirmDeleteCalendar = () => {
    setCalendars(prev => prev.filter(calendar => calendar.id !== calendarToDelete));
    setDeleteDialogOpen(false);
    toast({
      title: "Calendar Deleted",
      description: "The holiday calendar has been deleted successfully."
    });
  };
  
  // Export calendar
  const exportCalendar = (calendar: HolidayCalendar) => {
    const data = {
      name: calendar.name,
      description: calendar.description,
      holidays: calendar.holidays,
      additionalInfo: calendar.additionalInfo
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
      
      if (!data.name || !data.holidays) {
        throw new Error('Invalid format');
      }
      
      const newCalendar: HolidayCalendar = {
        id: `cal-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        holidays: data.holidays,
        additionalInfo: data.additionalInfo || '',
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
        description: `Calendar "${data.name}" has been imported successfully.`
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
        const dates: string[] = [];
        const infos: string[] = [];
        
        lines.slice(1).filter(line => line.trim()).forEach(line => {
          const [date, info] = line.split(',').map(item => item.trim());
          if (date) {
            dates.push(date);
            if (info) infos.push(info);
          }
        });
        
        if (dates.length === 0) {
          throw new Error('No holidays found in CSV');
        }
        
        setImportText(JSON.stringify({
          name: file.name.replace('.csv', ''),
          description: `Imported from ${file.name}`,
          holidays: dates.join(','),
          additionalInfo: infos.join(',')
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
                  <Label htmlFor="importFile">Upload CSV File (Date, AdditionalInfo)</Label>
                  <Input id="importFile" type="file" accept=".csv" onChange={handleFileUpload} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="importJson">Or paste JSON data</Label>
                  <Textarea 
                    id="importJson" 
                    placeholder='{"name": "Calendar Name", "description": "Description", "holidays": "2025-01-01,2025-12-25", "additionalInfo": "New Year,Christmas"}' 
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
                  <Label htmlFor="holidays">Holidays (comma-separated dates) <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="holidays" 
                    placeholder="2025-01-01,2025-12-25,2025-12-26" 
                    value={calendarForm.holidays}
                    onChange={(e) => handleCalendarFormChange('holidays', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter dates in YYYY-MM-DD format, separated by commas</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Info (comma-separated)</Label>
                  <Textarea 
                    id="additionalInfo" 
                    placeholder="New Year's Day,Christmas Day,Boxing Day" 
                    value={calendarForm.additionalInfo}
                    onChange={(e) => handleCalendarFormChange('additionalInfo', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Optional: Enter additional information for each date, in the same order</p>
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
                    <TableCell>{calendar.holidays.split(',').filter(Boolean).length} holidays</TableCell>
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
                        <div className="mb-2">
                          <h4 className="text-sm font-medium">Holidays</h4>
                        </div>
                        
                        {!calendar.holidays ? (
                          <div className="text-center py-4 border rounded-md">
                            <p className="text-sm text-muted-foreground">
                              No holidays defined for this calendar.
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[200px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Additional Info</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {parseHolidays(calendar).map((holiday, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{holiday.info || '-'}</TableCell>
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
    </div>
  );
};

export default HolidayCalendarManagement;