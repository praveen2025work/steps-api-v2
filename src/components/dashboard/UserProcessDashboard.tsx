import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AdvancedFilePreview from "@/components/files/AdvancedFilePreview";
import ProcessDetailsView from "@/components/workflow/ProcessDetailsView";
import StageOverview from "@/components/workflow/StageOverview";
import AppParameters from "@/components/workflow/AppParameters";
import GlobalParameters from "@/components/workflow/GlobalParameters";
import ProcessOverview from "@/components/workflow/ProcessOverview";
import ProcessParameters from "@/components/workflow/ProcessParameters";
import ProcessDependencies from "@/components/workflow/ProcessDependencies";
import ProcessQueries from "@/components/workflow/ProcessQueries";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  FileText,
  MoreHorizontal,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users
} from "lucide-react";

// Mock data for processes
const mockProcesses = [
  { 
    id: "PROC-001", 
    name: "eRates Validation", 
    application: "eRates", 
    group: "APAC",
    instance: "Daily Run", 
    stage: "Data Validation", 
    status: "In Progress", 
    assignedTo: "Praveen Kumar", 
    role: "Validator",
    priority: "High",
    dueDate: "2025-05-22",
    files: [
      { id: "FILE-001", name: "rates_validation.xlsx", type: "Excel", size: "1.2 MB", lastModified: "2025-05-21" },
      { id: "FILE-002", name: "market_data.csv", type: "CSV", size: "0.8 MB", lastModified: "2025-05-21" }
    ],
    dependencies: {
      parent: [
        { id: "PROC-P001", name: "Market Data Collection", status: "Completed", files: [
          { id: "FILE-P001", name: "market_data_raw.csv", type: "CSV", size: "1.5 MB", lastModified: "2025-05-21" }
        ]},
        { id: "PROC-P002", name: "Reference Data Import", status: "Completed", files: [
          { id: "FILE-P002", name: "reference_rates.xlsx", type: "Excel", size: "0.9 MB", lastModified: "2025-05-21" }
        ]}
      ],
      child: [
        { id: "PROC-C001", name: "Rate Calculation", status: "Pending", files: [
          { id: "FILE-C001", name: "calculated_rates.xlsx", type: "Excel", size: "0.7 MB", lastModified: "2025-05-21" }
        ]},
        { id: "PROC-C002", name: "Rate Publication", status: "Pending", files: [] }
      ]
    }
  },
  { 
    id: "PROC-002", 
    name: "PnL Calculation", 
    application: "PnL", 
    group: "EMEA",
    instance: "Daily Run", 
    stage: "Calculation", 
    status: "Pending", 
    assignedTo: "Unassigned", 
    role: "Approver",
    priority: "Medium",
    dueDate: "2025-05-23",
    files: [
      { id: "FILE-003", name: "pnl_data.xlsx", type: "Excel", size: "2.1 MB", lastModified: "2025-05-21" }
    ],
    dependencies: {
      parent: [
        { id: "PROC-P003", name: "Position Data Import", status: "Completed", files: [
          { id: "FILE-P003", name: "positions.csv", type: "CSV", size: "3.2 MB", lastModified: "2025-05-21" }
        ]}
      ],
      child: [
        { id: "PROC-C003", name: "PnL Reporting", status: "Pending", files: [] }
      ]
    }
  },
  { 
    id: "PROC-003", 
    name: "Risk Reporting", 
    application: "Risk", 
    group: "Global",
    instance: "Daily Run", 
    stage: "Reporting", 
    status: "Completed", 
    assignedTo: "Praveen Kumar", 
    role: "Reviewer",
    priority: "Low",
    dueDate: "2025-05-21",
    files: [
      { id: "FILE-004", name: "risk_report.pdf", type: "PDF", size: "3.5 MB", lastModified: "2025-05-21" },
      { id: "FILE-005", name: "risk_data.xlsx", type: "Excel", size: "1.8 MB", lastModified: "2025-05-21" }
    ],
    dependencies: {
      parent: [
        { id: "PROC-P004", name: "Risk Calculation", status: "Completed", files: [
          { id: "FILE-P004", name: "risk_metrics.xlsx", type: "Excel", size: "1.2 MB", lastModified: "2025-05-21" }
        ]}
      ],
      child: []
    }
  },
  { 
    id: "PROC-004", 
    name: "Compliance Check", 
    application: "Compliance", 
    group: "Americas",
    instance: "Weekly Run", 
    stage: "Validation", 
    status: "Failed", 
    assignedTo: "Praveen Kumar", 
    role: "Validator",
    priority: "Critical",
    dueDate: "2025-05-22",
    files: [
      { id: "FILE-006", name: "compliance_report.docx", type: "Word", size: "0.9 MB", lastModified: "2025-05-21" }
    ],
    dependencies: {
      parent: [
        { id: "PROC-P005", name: "Regulatory Data Collection", status: "Completed", files: [
          { id: "FILE-P005", name: "regulatory_data.xlsx", type: "Excel", size: "2.5 MB", lastModified: "2025-05-21" }
        ]}
      ],
      child: [
        { id: "PROC-C004", name: "Compliance Reporting", status: "Blocked", files: [] }
      ]
    }
  },
  { 
    id: "PROC-005", 
    name: "Market Data Import", 
    application: "Market Data", 
    group: "APAC",
    instance: "Daily Run", 
    stage: "Data Import", 
    status: "In Progress", 
    assignedTo: "Praveen Kumar", 
    role: "Operator",
    priority: "High",
    dueDate: "2025-05-22",
    files: [
      { id: "FILE-007", name: "market_feed.csv", type: "CSV", size: "5.2 MB", lastModified: "2025-05-22" },
      { id: "FILE-008", name: "vendor_data.xlsx", type: "Excel", size: "2.3 MB", lastModified: "2025-05-22" }
    ],
    dependencies: {
      parent: [],
      child: [
        { id: "PROC-C005", name: "Market Data Validation", status: "Pending", files: [] },
        { id: "PROC-C006", name: "Market Data Distribution", status: "Pending", files: [] }
      ]
    }
  },
  { 
    id: "PROC-006", 
    name: "Rates Submission", 
    application: "eRates", 
    group: "EMEA",
    instance: "Daily Run", 
    stage: "Submission", 
    status: "Not Started", 
    assignedTo: "Unassigned", 
    role: "Submitter",
    priority: "Medium",
    dueDate: "2025-05-23",
    files: [
      { id: "FILE-009", name: "rates_submission.xlsx", type: "Excel", size: "1.5 MB", lastModified: "2025-05-22" }
    ],
    dependencies: {
      parent: [
        { id: "PROC-P006", name: "Rates Validation", status: "In Progress", files: [
          { id: "FILE-P006", name: "validated_rates.xlsx", type: "Excel", size: "1.3 MB", lastModified: "2025-05-22" }
        ]}
      ],
      child: []
    }
  },
  { 
    id: "PROC-007", 
    name: "Regulatory Reporting", 
    application: "Compliance", 
    group: "Global",
    instance: "Monthly Run", 
    stage: "Reporting", 
    status: "Not Started", 
    assignedTo: "Unassigned", 
    role: "Reporter",
    priority: "Low",
    dueDate: "2025-05-30",
    files: [
      { id: "FILE-010", name: "regulatory_report.xlsx", type: "Excel", size: "2.8 MB", lastModified: "2025-05-22" }
    ],
    dependencies: {
      parent: [
        { id: "PROC-P007", name: "Compliance Check", status: "Failed", files: [
          { id: "FILE-P007", name: "compliance_data.xlsx", type: "Excel", size: "2.2 MB", lastModified: "2025-05-22" }
        ]}
      ],
      child: []
    }
  }
];

// Mock data for sub-stage process card
const mockSubStageProcess = {
  id: "SUB-001",
  name: "Market Data Validation",
  status: "In Progress",
  startTime: "2025-05-22 09:15",
  estimatedCompletion: "2025-05-22 10:30",
  assignedTo: "Praveen Kumar",
  priority: "High",
  description: "Validate market data against reference sources and identify anomalies",
  progress: 65,
  files: [
    { id: "FILE-001", name: "rates_validation.xlsx", type: "Excel", size: "1.2 MB", lastModified: "2025-05-21" },
    { id: "FILE-002", name: "market_data.csv", type: "CSV", size: "0.8 MB", lastModified: "2025-05-21" }
  ]
};

// Mock data for roles
const mockRoles = [
  "Validator",
  "Approver",
  "Reviewer",
  "Operator",
  "Submitter",
  "Reporter"
];

// Mock data for groups
const mockGroups = [
  "APAC",
  "EMEA",
  "Americas",
  "Global"
];

function UserProcessDashboard() {
  const [selectedTab, setSelectedTab] = useState("userTrigger");
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [selectedSubStage, setSelectedSubStage] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showAllProcesses, setShowAllProcesses] = useState(true);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter processes based on search term and selected filters
  const filteredProcesses = mockProcesses.filter(process => {
    const matchesSearch = 
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.application.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(process.status);
    const matchesApplication = selectedApplications.length === 0 || selectedApplications.includes(process.application);
    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(process.group);
    const matchesInstance = selectedInstances.length === 0 || selectedInstances.includes(process.instance);
    const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(process.role);
    
    return matchesSearch && matchesStatus && matchesApplication && matchesGroup && matchesInstance && matchesRole;
  });

  // Get processes based on tab selection
  const getProcessesByTab = (tab: string) => {
    switch (tab) {
      case "userTrigger":
        return filteredProcesses.filter(p => p.status === "In Progress" || p.status === "Pending");
      case "completed":
        return filteredProcesses.filter(p => p.status === "Completed");
      case "notStarted":
        return filteredProcesses.filter(p => p.status === "Not Started");
      default:
        return filteredProcesses;
    }
  };

  const tabProcesses = getProcessesByTab(selectedTab);

  // Set default tab on initial load
  useEffect(() => {
    setSelectedTab("userTrigger");
  }, []);

  // Handle process selection
  const handleProcessClick = (process: any) => {
    setSelectedProcess(process);
    setSelectedSubStage(mockSubStageProcess);
    setSelectedFile(null);
    setShowAllProcesses(false);
  };

  // Handle back to all processes
  const handleBackToAllProcesses = () => {
    setShowAllProcesses(true);
    setSelectedProcess(null);
    setSelectedSubStage(null);
    setSelectedFile(null);
  };

  // Handle file click
  const handleFileClick = (file: any) => {
    try {
      if (!file || !file.id) {
        console.error("Invalid file object:", file);
        return;
      }
      setSelectedFile(file);
    } catch (error) {
      console.error("Error in handleFileClick:", error);
    }
  };

  // Handle checkbox selection
  const handleProcessSelection = (processId: string) => {
    setSelectedProcesses(prev => 
      prev.includes(processId)
        ? prev.filter(id => id !== processId)
        : [...prev, processId]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(tabProcesses.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll state when individual selections change
  useEffect(() => {
    if (tabProcesses.length > 0 && selectedProcesses.length === tabProcesses.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedProcesses, tabProcesses]);

  // Handle filter changes
  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const handleApplicationChange = (application: string) => {
    setSelectedApplications(prev => 
      prev.includes(application) 
        ? prev.filter(a => a !== application) 
        : [...prev, application]
    );
  };

  const handleGroupChange = (group: string) => {
    setSelectedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group) 
        : [...prev, group]
    );
  };

  const handleInstanceChange = (instance: string) => {
    setSelectedInstances(prev => 
      prev.includes(instance) 
        ? prev.filter(i => i !== instance) 
        : [...prev, instance]
    );
  };

  const handleRoleChange = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };

  // Get unique values for filters
  const uniqueApplications = Array.from(new Set(mockProcesses.map(p => p.application)));
  const uniqueGroups = Array.from(new Set(mockProcesses.map(p => p.group)));
  const uniqueInstances = Array.from(new Set(mockProcesses.map(p => p.instance)));
  const uniqueRoles = Array.from(new Set(mockProcesses.map(p => p.role)));

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 w-full">
        <CardHeader className="pb-3">
          <CardTitle>Process Management Dashboard</CardTitle>
          <CardDescription>
            Manage and track processes across all applications, groups, and instances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <Select value={selectedApplications.length > 0 ? selectedApplications[0] : ""} onValueChange={(value) => {
                if (value) handleApplicationChange(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Application ▼" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueApplications.map((app) => (
                    <SelectItem key={app} value={app}>{app}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedGroups.length > 0 ? selectedGroups[0] : ""} onValueChange={(value) => {
                if (value) handleGroupChange(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Group ▼" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedInstances.length > 0 ? selectedInstances[0] : ""} onValueChange={(value) => {
                if (value) handleInstanceChange(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Instance ▼" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueInstances.map((instance) => (
                    <SelectItem key={instance} value={instance}>{instance}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatuses.length > 0 ? selectedStatuses[0] : ""} onValueChange={(value) => {
                if (value) handleStatusChange(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Status ▼" />
                </SelectTrigger>
                <SelectContent>
                  {["In Progress", "Pending", "Completed", "Failed", "Not Started"].map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedRoles.length > 0 ? selectedRoles[0] : ""} onValueChange={(value) => {
                if (value) handleRoleChange(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Role ▼" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search processes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {showAllProcesses && (
              <>
                {/* Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="userTrigger" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      <span>User Trigger/Approval</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed</span>
                    </TabsTrigger>
                    <TabsTrigger value="notStarted" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Not Started</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Tab Content */}
                  <TabsContent value="userTrigger" className="mt-4">
                    <ProcessTable 
                      processes={getProcessesByTab("userTrigger")}
                      onProcessClick={handleProcessClick}
                      selectedProcess={selectedProcess}
                      selectedProcesses={selectedProcesses}
                      onProcessSelection={handleProcessSelection}
                      selectAll={selectAll}
                      onSelectAll={handleSelectAll}
                    />
                  </TabsContent>
                  
                  <TabsContent value="completed" className="mt-4">
                    <ProcessTable 
                      processes={getProcessesByTab("completed")}
                      onProcessClick={handleProcessClick}
                      selectedProcess={selectedProcess}
                      selectedProcesses={selectedProcesses}
                      onProcessSelection={handleProcessSelection}
                      selectAll={selectAll}
                      onSelectAll={handleSelectAll}
                    />
                  </TabsContent>
                  
                  <TabsContent value="notStarted" className="mt-4">
                    <ProcessTable 
                      processes={getProcessesByTab("notStarted")}
                      onProcessClick={handleProcessClick}
                      selectedProcess={selectedProcess}
                      selectedProcesses={selectedProcesses}
                      onProcessSelection={handleProcessSelection}
                      selectAll={selectAll}
                      onSelectAll={handleSelectAll}
                    />
                  </TabsContent>
                </Tabs>
                
                {/* Bulk Actions */}
                {selectedProcesses.length > 0 && (
                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                    <span className="text-sm font-medium">{selectedProcesses.length} processes selected</span>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="default" size="sm">
                            Bulk Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>Assign to Team</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            <span>Mark as Priority</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            <span>Mark as Complete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="outline" size="sm" onClick={() => setSelectedProcesses([])}>
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Process Details View */}
            {selectedProcess && !showAllProcesses && (
              <ProcessDetailsView 
                process={selectedProcess}
                subStage={selectedSubStage}
                onBack={handleBackToAllProcesses}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Process Table Component
interface ProcessTableProps {
  processes: any[];
  onProcessClick: (process: any) => void;
  selectedProcess: any;
  selectedProcesses: string[];
  onProcessSelection: (processId: string) => void;
  selectAll: boolean;
  onSelectAll: () => void;
}

const ProcessTable: React.FC<ProcessTableProps> = ({ 
  processes, 
  onProcessClick,
  selectedProcess,
  selectedProcesses,
  onProcessSelection,
  selectAll,
  onSelectAll
}) => {
  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return "bg-green-500";
      case 'In Progress':
        return "bg-blue-500";
      case 'Pending':
        return "bg-amber-500";
      case 'Failed':
        return "bg-red-500";
      case 'Not Started':
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={selectAll} 
                onCheckedChange={onSelectAll}
                aria-label="Select all processes"
              />
            </TableHead>
            <TableHead>Process</TableHead>
            <TableHead>Application</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Instance</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                No processes found matching your filters
              </TableCell>
            </TableRow>
          ) : (
            processes.map((process) => (
              <TableRow 
                key={process.id} 
                className={`relative ${selectedProcess?.id === process.id ? "bg-muted/50" : ""}`}
              >
                <TableCell className="relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(process.status)}`}></div>
                  <Checkbox 
                    checked={selectedProcesses.includes(process.id)}
                    onCheckedChange={() => onProcessSelection(process.id)}
                    aria-label={`Select ${process.name}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell onClick={() => onProcessClick(process)} className="cursor-pointer">
                  <div>
                    <div className="font-medium">{process.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {process.id}</div>
                  </div>
                </TableCell>
                <TableCell>{process.application}</TableCell>
                <TableCell>{process.group}</TableCell>
                <TableCell>{process.instance}</TableCell>
                <TableCell>
                  <Badge variant={
                    process.priority === "Critical" ? "destructive" : 
                    process.priority === "High" ? "default" : 
                    process.priority === "Medium" ? "secondary" : 
                    "outline"
                  }>
                    {process.priority}
                  </Badge>
                </TableCell>
                <TableCell>{process.dueDate}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-muted/30">
                    <Users className="h-3 w-3 mr-1" />
                    {process.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => onProcessClick(process)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default UserProcessDashboard;