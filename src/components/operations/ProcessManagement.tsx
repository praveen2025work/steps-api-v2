import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Search, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, XCircle, Clock, FileText, Settings } from 'lucide-react';
import type { Process } from '@/types/operations-types';

// Sample process data
const sampleProcesses: Process[] = [
  {
    id: 'proc-001',
    name: 'PnL Calculation - APAC',
    applicationId: 'app-001',
    description: 'Daily PnL calculation for APAC region',
    status: 'running',
    currentStage: 'Data Validation',
    progress: 45,
    startTime: new Date('2025-05-16T08:30:00'),
    sla: {
      deadline: new Date('2025-05-16T10:30:00'),
      status: 'on-track'
    },
    metadata: {
      region: 'APAC',
      priority: 'high',
      owner: 'Finance Team'
    }
  },
  {
    id: 'proc-002',
    name: 'PnL Calculation - EMEA',
    applicationId: 'app-001',
    description: 'Daily PnL calculation for EMEA region',
    status: 'failed',
    currentStage: 'Data Aggregation',
    progress: 68,
    startTime: new Date('2025-05-16T07:00:00'),
    endTime: new Date('2025-05-16T08:15:00'),
    sla: {
      deadline: new Date('2025-05-16T09:00:00'),
      status: 'breached'
    },
    metadata: {
      region: 'EMEA',
      priority: 'high',
      owner: 'Finance Team',
      errorCode: 'ERR-4023',
      errorMessage: 'Failed to connect to data source'
    }
  },
  {
    id: 'proc-003',
    name: 'PnL Calculation - Americas',
    applicationId: 'app-001',
    description: 'Daily PnL calculation for Americas region',
    status: 'completed',
    progress: 100,
    startTime: new Date('2025-05-16T05:00:00'),
    endTime: new Date('2025-05-16T06:45:00'),
    sla: {
      deadline: new Date('2025-05-16T07:30:00'),
      status: 'on-track'
    },
    metadata: {
      region: 'Americas',
      priority: 'high',
      owner: 'Finance Team'
    }
  },
  {
    id: 'proc-004',
    name: 'Regulatory Report Generation',
    applicationId: 'app-002',
    description: 'Monthly regulatory report generation',
    status: 'paused',
    currentStage: 'Data Collection',
    progress: 25,
    startTime: new Date('2025-05-16T09:00:00'),
    sla: {
      deadline: new Date('2025-05-17T17:00:00'),
      status: 'at-risk'
    },
    metadata: {
      reportType: 'FINREP',
      priority: 'medium',
      owner: 'Regulatory Team'
    }
  },
  {
    id: 'proc-005',
    name: 'Trade Reconciliation',
    applicationId: 'app-003',
    description: 'Daily trade reconciliation process',
    status: 'idle',
    progress: 0,
    sla: {
      deadline: new Date('2025-05-16T16:00:00'),
      status: 'on-track'
    },
    metadata: {
      tradingDay: '2025-05-15',
      priority: 'high',
      owner: 'Operations Team'
    }
  }
];

export default function ProcessManagement() {
  const [processes, setProcesses] = useState<Process[]>(sampleProcesses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          process.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    const matchesApplication = applicationFilter === 'all' || process.applicationId === applicationFilter;
    
    return matchesSearch && matchesStatus && matchesApplication;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-800">Paused</Badge>;
      case 'idle':
        return <Badge className="bg-gray-100 text-gray-800">Idle</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSlaStatusBadge = (status: string) => {
    switch (status) {
      case 'on-track':
        return <Badge variant="outline" className="bg-green-100 text-green-800">On Track</Badge>;
      case 'at-risk':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">At Risk</Badge>;
      case 'breached':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Breached</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const handleViewDetails = (process: Process) => {
    setSelectedProcess(process);
    setIsDetailsDialogOpen(true);
  };

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = () => {
      // Refresh process data here
      console.log("Refreshing process data");
      // In a real app, you would fetch updated process data here
    };
    
    window.addEventListener('app:refresh', handleGlobalRefresh);
    return () => {
      window.removeEventListener('app:refresh', handleGlobalRefresh);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Start Process
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search processes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={applicationFilter} onValueChange={setApplicationFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Application" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="app-001">PnL System</SelectItem>
            <SelectItem value="app-002">Regulatory Reporting</SelectItem>
            <SelectItem value="app-003">Trade Operations</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Process List</CardTitle>
          <CardDescription>
            Showing {filteredProcesses.length} processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map(process => (
                <TableRow key={process.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{process.name}</div>
                      <div className="text-sm text-muted-foreground">{process.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(process.status)}
                    {process.currentStage && (
                      <div className="text-xs text-muted-foreground mt-1">{process.currentStage}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-[100px]">
                      <Progress value={process.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">{process.progress}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDateTime(process.startTime)}</div>
                    {process.endTime && (
                      <div className="text-xs text-muted-foreground">
                        End: {formatDateTime(process.endTime)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {process.sla && (
                      <div>
                        {getSlaStatusBadge(process.sla.status)}
                        <div className="text-xs text-muted-foreground mt-1">
                          Due: {formatDateTime(process.sla.deadline)}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {process.status === 'running' && (
                        <Button variant="outline" size="icon" title="Pause">
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {(process.status === 'paused' || process.status === 'idle') && (
                        <Button variant="outline" size="icon" title="Start">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {process.status === 'failed' && (
                        <Button variant="outline" size="icon" title="Retry">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="icon" title="Parameters">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        title="View Details"
                        onClick={() => handleViewDetails(process)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Process Details Dialog */}
      {selectedProcess && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Process Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected process
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stages">Stages</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Process ID</h3>
                    <p>{selectedProcess.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p>{getStatusBadge(selectedProcess.status)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Application</h3>
                    <p>{selectedProcess.applicationId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Current Stage</h3>
                    <p>{selectedProcess.currentStage || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Start Time</h3>
                    <p>{formatDateTime(selectedProcess.startTime)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">End Time</h3>
                    <p>{formatDateTime(selectedProcess.endTime)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">SLA Deadline</h3>
                    <p>{formatDateTime(selectedProcess.sla?.deadline)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">SLA Status</h3>
                    <p>{selectedProcess.sla ? getSlaStatusBadge(selectedProcess.sla.status) : 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Progress</h3>
                  <Progress value={selectedProcess.progress} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">{selectedProcess.progress}%</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h3>
                  <div className="bg-muted p-2 rounded-md">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(selectedProcess.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stages" className="py-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-800 rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Data Collection</span>
                        <span className="text-sm text-muted-foreground">Completed</span>
                      </div>
                      <Progress value={100} className="h-1 mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-800 rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Data Validation</span>
                        <span className="text-sm text-muted-foreground">Completed</span>
                      </div>
                      <Progress value={100} className="h-1 mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-1">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Data Aggregation</span>
                        <span className="text-sm text-muted-foreground">In Progress</span>
                      </div>
                      <Progress value={68} className="h-1 mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 text-gray-800 rounded-full p-1">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Calculation</span>
                        <span className="text-sm text-muted-foreground">Pending</span>
                      </div>
                      <Progress value={0} className="h-1 mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 text-gray-800 rounded-full p-1">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Report Generation</span>
                        <span className="text-sm text-muted-foreground">Pending</span>
                      </div>
                      <Progress value={0} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="logs" className="py-4">
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:30:00]</span> Process started
                  </div>
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:30:05]</span> Initializing data collection
                  </div>
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:31:20]</span> Connected to data source
                  </div>
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:32:45]</span> Retrieved 1,245 records
                  </div>
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:33:10]</span> Data collection completed
                  </div>
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:33:15]</span> Starting data validation
                  </div>
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:35:30]</span> Validation completed: 1,240 valid records, 5 invalid records
                  </div>
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:35:45]</span> Starting data aggregation
                  </div>
                  <div className="text-xs border-b pb-1 text-amber-600">
                    <span className="text-muted-foreground">[2025-05-16 08:40:12]</span> Warning: Slow performance detected in aggregation step
                  </div>
                  <div className="text-xs border-b pb-1">
                    <span className="text-muted-foreground">[2025-05-16 08:45:00]</span> Data aggregation in progress (68%)
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
              {selectedProcess.status === 'failed' && (
                <Button>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry Process
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}