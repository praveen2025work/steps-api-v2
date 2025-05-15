import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, RefreshCw, AlertCircle, CheckCircle, Clock, Play, FileText, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { WorkflowRun, AuditLog } from '@/types/workflow-types';

// Sample workflow runs
const sampleWorkflowRuns: WorkflowRun[] = [
  {
    id: 'run1',
    applicationId: 'app1',
    nodeId: 'node1',
    startTime: '2025-05-15T08:00:00Z',
    endTime: '2025-05-15T08:15:00Z',
    status: 'completed',
    runBy: 'System'
  },
  {
    id: 'run2',
    applicationId: 'app2',
    nodeId: 'node2',
    startTime: '2025-05-15T09:00:00Z',
    status: 'running',
    runBy: 'System'
  },
  {
    id: 'run3',
    applicationId: 'app1',
    nodeId: 'node3',
    startTime: '2025-05-15T07:00:00Z',
    endTime: '2025-05-15T07:05:00Z',
    status: 'failed',
    errorMessage: 'Connection timeout',
    runBy: 'System'
  },
  {
    id: 'run4',
    applicationId: 'app3',
    nodeId: 'node1',
    startTime: '2025-05-15T10:00:00Z',
    status: 'scheduled',
    runBy: 'User'
  }
];

// Sample audit logs
const sampleAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    action: 'CREATE',
    entityType: 'Application',
    entityId: 'app1',
    userId: 'user1',
    userName: 'John Doe',
    timestamp: '2025-05-14T14:30:00Z',
    details: 'Created new application "Financial Reporting"'
  },
  {
    id: 'log2',
    action: 'UPDATE',
    entityType: 'Workflow',
    entityId: 'wf1',
    userId: 'user2',
    userName: 'Jane Smith',
    timestamp: '2025-05-14T15:45:00Z',
    details: 'Updated workflow configuration for "Monthly Close"'
  },
  {
    id: 'log3',
    action: 'DELETE',
    entityType: 'Parameter',
    entityId: 'param1',
    userId: 'user1',
    userName: 'John Doe',
    timestamp: '2025-05-14T16:20:00Z',
    details: 'Deleted parameter "Legacy System ID"'
  }
];

// Sample applications
const sampleApplications = [
  { id: 'app1', name: 'Financial Reporting' },
  { id: 'app2', name: 'Regulatory Compliance' },
  { id: 'app3', name: 'Tax Calculation' }
];

const AdminDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedApplication, setSelectedApplication] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>(sampleWorkflowRuns);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(sampleAuditLogs);
  const [activeTab, setActiveTab] = useState('workflow-runs');
  
  // Filter workflow runs based on date, application, and search term
  const filteredRuns = workflowRuns.filter(run => {
    const runDate = new Date(run.startTime);
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
    const runDateString = format(runDate, 'yyyy-MM-dd');
    
    const matchesDate = runDateString === selectedDateString;
    const matchesApp = selectedApplication === 'all' || run.applicationId === selectedApplication;
    const matchesSearch = searchTerm === '' || 
      run.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      run.nodeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesApp && matchesSearch;
  });
  
  // Filter audit logs based on search term
  const filteredLogs = auditLogs.filter(log => 
    searchTerm === '' || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get application name by ID
  const getApplicationName = (appId: string) => {
    const app = sampleApplications.find(app => app.id === appId);
    return app ? app.name : 'Unknown Application';
  };
  
  // Format duration
  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'In progress';
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Rerun workflow
  const rerunWorkflow = () => {
    if (!selectedRun) return;
    
    // Clone the run with new ID and status
    const newRun: WorkflowRun = {
      id: `rerun-${Date.now()}`,
      applicationId: selectedRun.applicationId,
      nodeId: selectedRun.nodeId,
      startTime: new Date().toISOString(),
      status: 'running',
      runBy: 'User (Rerun)'
    };
    
    setWorkflowRuns(prev => [newRun, ...prev]);
    setRerunDialogOpen(false);
    
    toast({
      title: "Workflow Rerun Initiated",
      description: `Rerun of workflow for ${getApplicationName(selectedRun.applicationId)} has been started.`
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: WorkflowRun['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Play className="w-3 h-3 mr-1" /> Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Scheduled</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <Tabs defaultValue="workflow-runs" className="space-y-4" onValueChange={setActiveTab}>
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="workflow-runs" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>Workflow Runs</span>
          </TabsTrigger>
          <TabsTrigger value="audit-logs" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Audit Logs</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2">
          {activeTab === 'workflow-runs' && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Application" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  {sampleApplications.map(app => (
                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'workflow-runs' ? "Search workflows..." : "Search logs..."}
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <TabsContent value="workflow-runs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Instance Process Management</CardTitle>
            <CardDescription>
              Manage workflow runs for different applications by business date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Node</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Run By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No workflow runs found for the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>{getApplicationName(run.applicationId)}</TableCell>
                        <TableCell>{run.nodeId}</TableCell>
                        <TableCell>{format(new Date(run.startTime), 'PPp')}</TableCell>
                        <TableCell>{formatDuration(run.startTime, run.endTime)}</TableCell>
                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                        <TableCell>{run.runBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={run.status === 'running' || run.status === 'scheduled'}
                              onClick={() => {
                                setSelectedRun(run);
                                setRerunDialogOpen(true);
                              }}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Rerun
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              Logs
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="audit-logs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Audit Logs</CardTitle>
            <CardDescription>
              Track all system activities and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{format(new Date(log.timestamp), 'PPp')}</TableCell>
                        <TableCell>{log.userName}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                              log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                              log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.entityType}</TableCell>
                        <TableCell className="max-w-md truncate">{log.details}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="performance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>
              Monitor system performance and resource usage
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Performance monitoring dashboard coming soon</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Rerun Workflow Dialog */}
      <AlertDialog open={rerunDialogOpen} onOpenChange={setRerunDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rerun Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRun && (
                <>
                  Are you sure you want to rerun the workflow for {getApplicationName(selectedRun.applicationId)}?
                  {selectedRun.status === 'failed' && selectedRun.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-red-800 text-sm">
                      <p className="font-semibold">Previous error:</p>
                      <p>{selectedRun.errorMessage}</p>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={rerunWorkflow}>Rerun Workflow</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
};

export default AdminDashboard;