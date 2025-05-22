import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  SkipForward,
  Play,
  RotateCw,
  ChevronDown,
  ChevronUp,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SubStage, StageStatus } from '@/types/workflow';
import SubStagesList from '@/components/SubStagesList';
import { useToast } from '@/components/ui/use-toast';
import { workflowData } from '@/data/workflowData';

// Define the structure for our process item
interface ProcessItem extends SubStage {
  applicationName: string;
  applicationId: string;
  groupName: string;
  groupId: string;
  instanceName: string;
  instanceId: string;
  roleName?: string;
}

// Mock data for applications
const applications = [
  { id: 'app-1001', name: 'Daily Named PNL', category: 'Finance' },
  { id: 'app-1002', name: 'Workspace PNL', category: 'Finance' },
  { id: 'app-1003', name: 'Monthend PNL', category: 'Finance' },
  { id: 'app-1004', name: 'Risk Analytics', category: 'Risk' },
  { id: 'app-1005', name: 'Regulatory Reporting', category: 'Compliance' }
];

// Mock data for groups
const groups = [
  { id: 'group-101', name: 'FICC', applicationId: 'app-1001' },
  { id: 'group-102', name: 'Equities', applicationId: 'app-1001' },
  { id: 'group-103', name: 'Investment Banking', applicationId: 'app-1001' },
  { id: 'group-104', name: 'Rates', applicationId: 'app-1001', parentId: 'group-101' },
  { id: 'group-105', name: 'FX', applicationId: 'app-1001', parentId: 'group-101' },
  { id: 'group-106', name: 'Credit', applicationId: 'app-1001', parentId: 'group-101' },
  { id: 'group-107', name: 'Commodities', applicationId: 'app-1001', parentId: 'group-101' },
  { id: 'group-108', name: 'Cash Equities', applicationId: 'app-1001', parentId: 'group-102' },
  { id: 'group-109', name: 'Equity Derivatives', applicationId: 'app-1001', parentId: 'group-102' },
  { id: 'group-110', name: 'Americas', applicationId: 'app-1002' },
  { id: 'group-111', name: 'EMEA', applicationId: 'app-1002' },
  { id: 'group-112', name: 'APAC', applicationId: 'app-1002' }
];

// Mock data for instances
const instances = [
  { id: 'instance-201', name: 'eRates', groupId: 'group-104' },
  { id: 'instance-202', name: 'Government Bonds', groupId: 'group-104' },
  { id: 'instance-203', name: 'Inflation', groupId: 'group-104' },
  { id: 'instance-204', name: 'Spot FX', groupId: 'group-105' },
  { id: 'instance-205', name: 'FX Options', groupId: 'group-105' },
  { id: 'instance-206', name: 'US Equities', groupId: 'group-108' },
  { id: 'instance-207', name: 'European Equities', groupId: 'group-108' },
  { id: 'instance-208', name: 'Equity Options', groupId: 'group-109' },
  { id: 'instance-209', name: 'Equity Swaps', groupId: 'group-109' },
  { id: 'instance-210', name: 'North America', groupId: 'group-110' },
  { id: 'instance-211', name: 'Latin America', groupId: 'group-110' },
  { id: 'instance-212', name: 'UK', groupId: 'group-111' },
  { id: 'instance-213', name: 'Europe', groupId: 'group-111' },
  { id: 'instance-214', name: 'Japan', groupId: 'group-112' },
  { id: 'instance-215', name: 'Australia', groupId: 'group-112' }
];

// Mock data for roles
const roles = [
  { id: 'role-301', name: 'Producer' },
  { id: 'role-302', name: 'Approver' },
  { id: 'role-303', name: 'Viewer' }
];

// Generate mock process data
const generateMockProcesses = (): ProcessItem[] => {
  const statuses: StageStatus[] = ['completed', 'in-progress', 'not-started', 'failed', 'skipped'];
  const processes: ProcessItem[] = [];
  
  // Generate processes for each instance
  instances.forEach(instance => {
    const group = groups.find(g => g.id === instance.groupId);
    if (!group) return;
    
    const application = applications.find(a => a.id === group.applicationId);
    if (!application) return;
    
    // Generate 3-5 processes per instance
    const processCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < processCount; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const progress = status === 'completed' ? 100 : 
                      status === 'not-started' ? 0 : 
                      Math.floor(Math.random() * 90) + 10;
      
      processes.push({
        id: `process-${instance.id}-${i}`,
        name: `Process ${i + 1}`,
        type: Math.random() > 0.5 ? 'manual' : 'auto',
        status,
        progress,
        processId: `PROC-${Math.floor(Math.random() * 1000)}`,
        applicationName: application.name,
        applicationId: application.id,
        groupName: group.name,
        groupId: group.id,
        instanceName: instance.name,
        instanceId: instance.id,
        roleName: roles[Math.floor(Math.random() * roles.length)].name,
        timing: {
          start: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        },
        duration: Math.floor(Math.random() * 120),
        message: status === 'failed' ? 'Error occurred during processing' : 
                status === 'in-progress' ? 'Processing data...' : undefined,
        config: {
          canRerun: status === 'failed' || status === 'completed',
          canSkip: status === 'not-started' || status === 'failed',
          canTrigger: status === 'not-started',
        },
        files: status !== 'not-started' ? [
          {
            name: `${instance.name.toLowerCase().replace(/\s+/g, '_')}_data.xlsx`,
            type: 'excel',
            size: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 9) + 1} MB`
          },
          {
            name: `${instance.name.toLowerCase().replace(/\s+/g, '_')}_report.pdf`,
            type: 'pdf',
            size: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9) + 1} MB`
          }
        ] : undefined
      });
    }
  });
  
  return processes;
};

const UserProcessDashboard: React.FC = () => {
  const { toast } = useToast();
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<ProcessItem[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedApplication, setSelectedApplication] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedInstance, setSelectedInstance] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Filtered options based on selections
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [filteredInstances, setFilteredInstances] = useState(instances);
  
  // Selected process for detailed view
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  
  // Load mock data
  useEffect(() => {
    const mockProcesses = generateMockProcesses();
    setProcesses(mockProcesses);
    setFilteredProcesses(mockProcesses);
  }, []);
  
  // Update filtered groups when application changes
  useEffect(() => {
    if (selectedApplication !== 'all') {
      const filtered = groups.filter(group => group.applicationId === selectedApplication);
      setFilteredGroups(filtered);
      
      // Reset group selection if current selection is not valid
      if (selectedGroup !== 'all' && !filtered.some(g => g.id === selectedGroup)) {
        setSelectedGroup('all');
      }
    } else {
      setFilteredGroups(groups);
    }
  }, [selectedApplication, selectedGroup]);
  
  // Update filtered instances when group changes
  useEffect(() => {
    if (selectedGroup !== 'all') {
      const filtered = instances.filter(instance => instance.groupId === selectedGroup);
      setFilteredInstances(filtered);
      
      // Reset instance selection if current selection is not valid
      if (selectedInstance !== 'all' && !filtered.some(i => i.id === selectedInstance)) {
        setSelectedInstance('all');
      }
    } else {
      setFilteredInstances(instances);
    }
  }, [selectedGroup, selectedInstance]);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...processes];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(process => 
        process.name.toLowerCase().includes(query) ||
        process.processId.toLowerCase().includes(query) ||
        process.applicationName.toLowerCase().includes(query) ||
        process.groupName.toLowerCase().includes(query) ||
        process.instanceName.toLowerCase().includes(query)
      );
    }
    
    // Apply application filter
    if (selectedApplication !== 'all') {
      filtered = filtered.filter(process => process.applicationId === selectedApplication);
    }
    
    // Apply group filter
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(process => process.groupId === selectedGroup);
    }
    
    // Apply instance filter
    if (selectedInstance !== 'all') {
      filtered = filtered.filter(process => process.instanceId === selectedInstance);
    }
    
    // Apply role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(process => process.roleName === selectedRole);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(process => process.status === selectedStatus);
    }
    
    setFilteredProcesses(filtered);
  }, [processes, searchQuery, selectedApplication, selectedGroup, selectedInstance, selectedRole, selectedStatus]);
  
  // Handle process selection
  const toggleProcessSelection = (processId: string) => {
    const newSelection = new Set(selectedProcesses);
    if (newSelection.has(processId)) {
      newSelection.delete(processId);
    } else {
      newSelection.add(processId);
    }
    setSelectedProcesses(newSelection);
  };
  
  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedProcesses.size === 0) {
      toast({
        title: "No processes selected",
        description: "Please select at least one process to perform this action.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate action on selected processes
    const updatedProcesses = processes.map(process => {
      if (selectedProcesses.has(process.id)) {
        switch (action) {
          case 'trigger':
            if (process.status === 'not-started') {
              return { ...process, status: 'in-progress', progress: 10 };
            }
            break;
          case 'rerun':
            if (process.status === 'failed' || process.status === 'completed') {
              return { ...process, status: 'in-progress', progress: 10 };
            }
            break;
          case 'skip':
            if (process.status === 'not-started' || process.status === 'failed') {
              return { ...process, status: 'skipped', progress: 0 };
            }
            break;
          case 'complete':
            if (process.status === 'in-progress') {
              return { ...process, status: 'completed', progress: 100 };
            }
            break;
        }
      }
      return process;
    });
    
    setProcesses(updatedProcesses);
    
    toast({
      title: "Action performed",
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} action performed on ${selectedProcesses.size} processes.`
    });
  };
  
  // Handle process click
  const handleProcessClick = (process: ProcessItem) => {
    setSelectedProcess(process);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedApplication('all');
    setSelectedGroup('all');
    setSelectedInstance('all');
    setSelectedRole('all');
    setSelectedStatus('all');
  };
  
  // Refresh data
  const refreshData = () => {
    const mockProcesses = generateMockProcesses();
    setProcesses(mockProcesses);
    toast({
      title: "Data refreshed",
      description: "Process data has been refreshed."
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">User Process Dashboard</CardTitle>
                <CardDescription>
                  Manage and monitor processes across all applications, groups, and instances
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={resetFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
                <Button variant="outline" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search processes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Application filter */}
              <div>
                <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                  <SelectTrigger>
                    <SelectValue placeholder="Application" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    {applications.map(app => (
                      <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Group filter */}
              <div>
                <Select 
                  value={selectedGroup} 
                  onValueChange={setSelectedGroup}
                  disabled={filteredGroups.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {filteredGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Instance filter */}
              <div>
                <Select 
                  value={selectedInstance} 
                  onValueChange={setSelectedInstance}
                  disabled={filteredInstances.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Instance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Instances</SelectItem>
                    {filteredInstances.map(instance => (
                      <SelectItem key={instance.id} value={instance.id}>{instance.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Role filter */}
              <div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status filter */}
              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Bulk actions */}
              <div className="lg:col-span-3 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction('trigger')}
                  disabled={selectedProcesses.size === 0}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Trigger
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction('rerun')}
                  disabled={selectedProcesses.size === 0}
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Rerun
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction('skip')}
                  disabled={selectedProcesses.size === 0}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction('complete')}
                  disabled={selectedProcesses.size === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredProcesses.length} of {processes.length} processes
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedProcesses.size} selected</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Process list */}
              <div className={selectedProcess ? "hidden lg:block" : ""}>
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-4">
                    {filteredProcesses.length > 0 ? (
                      filteredProcesses.map(process => (
                        <Card 
                          key={process.id}
                          className={`p-4 cursor-pointer transition-all duration-200 ${
                            selectedProcess?.id === process.id ? 'ring-2 ring-blue-500' : ''
                          } ${
                            process.status === 'in-progress' ? 'relative overflow-hidden border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => handleProcessClick(process)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={selectedProcesses.has(process.id)}
                              onCheckedChange={() => toggleProcessSelection(process.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold">{process.name}</h3>
                                  <p className="text-sm text-muted-foreground">{process.processId}</p>
                                </div>
                                <Badge variant={
                                  process.status === 'completed' ? 'default' :
                                  process.status === 'in-progress' ? 'secondary' :
                                  process.status === 'failed' ? 'destructive' :
                                  process.status === 'skipped' ? 'outline' : 'default'
                                }>
                                  {process.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Application:</span>
                                  <span>{process.applicationName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Group:</span>
                                  <span>{process.groupName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Instance:</span>
                                  <span>{process.instanceName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Role:</span>
                                  <span>{process.roleName}</span>
                                </div>
                              </div>
                              
                              {process.files && process.files.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {process.files.length} file{process.files.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-medium">No processes found</h3>
                        <p className="text-muted-foreground mt-2">
                          Try adjusting your filters or search query
                        </p>
                        <Button variant="outline" className="mt-4" onClick={resetFilters}>
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Process detail */}
              <div className={!selectedProcess ? "hidden lg:block" : ""}>
                {selectedProcess ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{selectedProcess.name}</CardTitle>
                          <CardDescription>{selectedProcess.processId}</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedProcess(null)}
                          className="lg:hidden"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Status</h4>
                            <Badge variant={
                              selectedProcess.status === 'completed' ? 'default' :
                              selectedProcess.status === 'in-progress' ? 'secondary' :
                              selectedProcess.status === 'failed' ? 'destructive' :
                              selectedProcess.status === 'skipped' ? 'outline' : 'default'
                            }>
                              {selectedProcess.status}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Progress</h4>
                            <span>{selectedProcess.progress}%</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Application</h4>
                            <span>{selectedProcess.applicationName}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Group</h4>
                            <span>{selectedProcess.groupName}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Instance</h4>
                            <span>{selectedProcess.instanceName}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Role</h4>
                            <span>{selectedProcess.roleName}</span>
                          </div>
                          {selectedProcess.timing?.start && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Start Time</h4>
                              <span>{new Date(selectedProcess.timing.start).toLocaleString()}</span>
                            </div>
                          )}
                          {selectedProcess.duration && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Duration</h4>
                              <span>{selectedProcess.duration}s</span>
                            </div>
                          )}
                        </div>
                        
                        {selectedProcess.message && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Message</h4>
                            <p className="text-sm">{selectedProcess.message}</p>
                          </div>
                        )}
                        
                        {selectedProcess.files && selectedProcess.files.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Files</h4>
                            <div className="space-y-2">
                              {selectedProcess.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{file.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm">Preview</Button>
                                    <Button variant="ghost" size="sm">Download</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {selectedProcess.config?.canTrigger && (
                            <Button size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              Trigger
                            </Button>
                          )}
                          {selectedProcess.config?.canRerun && (
                            <Button size="sm" variant="outline">
                              <RotateCw className="h-4 w-4 mr-1" />
                              Rerun
                            </Button>
                          )}
                          {selectedProcess.config?.canSkip && (
                            <Button size="sm" variant="outline">
                              <SkipForward className="h-4 w-4 mr-1" />
                              Skip
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                      <h3 className="mt-4 text-lg font-medium">No process selected</h3>
                      <p className="text-muted-foreground mt-2">
                        Select a process from the list to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProcessDashboard;