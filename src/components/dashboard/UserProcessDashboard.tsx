import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  FileText
} from "lucide-react";

// Mock data for processes
const mockProcesses = [
  { 
    id: "PROC-001", 
    name: "eRates Validation", 
    application: "eRates", 
    instance: "Daily Run", 
    stage: "Data Validation", 
    status: "In Progress", 
    assignedTo: "Praveen Kumar", 
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
    instance: "Daily Run", 
    stage: "Calculation", 
    status: "Pending", 
    assignedTo: "Unassigned", 
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
    instance: "Daily Run", 
    stage: "Reporting", 
    status: "Completed", 
    assignedTo: "Praveen Kumar", 
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
    instance: "Weekly Run", 
    stage: "Validation", 
    status: "Failed", 
    assignedTo: "Praveen Kumar", 
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
    instance: "Daily Run", 
    stage: "Data Import", 
    status: "In Progress", 
    assignedTo: "Praveen Kumar", 
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

function UserProcessDashboard() {
  const [selectedTab, setSelectedTab] = useState("inProgress");
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [selectedSubStage, setSelectedSubStage] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["In Progress"]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [showAllProcesses, setShowAllProcesses] = useState(true);
  
  // Filter processes based on search term and selected filters
  const filteredProcesses = mockProcesses.filter(process => {
    const matchesSearch = 
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.application.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(process.status);
    const matchesApplication = selectedApplications.length === 0 || selectedApplications.includes(process.application);
    const matchesInstance = selectedInstances.length === 0 || selectedInstances.includes(process.instance);
    
    return matchesSearch && matchesStatus && matchesApplication && matchesInstance;
  });

  // Set default tab to "inProgress" on initial load
  useEffect(() => {
    setSelectedTab("inProgress");
    setSelectedStatuses(["In Progress"]);
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

  // Handle process ID click (toggle selection)
  const handleProcessIdClick = () => {
    if (selectedSubStage) {
      setSelectedSubStage(null);
      setSelectedFile(null);
    } else {
      setSelectedSubStage(mockSubStageProcess);
    }
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

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // Handle application filter change
  const handleApplicationChange = (application: string) => {
    setSelectedApplications(prev => 
      prev.includes(application) 
        ? prev.filter(a => a !== application) 
        : [...prev, application]
    );
  };

  // Handle instance filter change
  const handleInstanceChange = (instance: string) => {
    setSelectedInstances(prev => 
      prev.includes(instance) 
        ? prev.filter(i => i !== instance) 
        : [...prev, instance]
    );
  };

  // Get unique applications for filter
  const uniqueApplications = Array.from(new Set(mockProcesses.map(p => p.application)));
  
  // Get unique instances for filter
  const uniqueInstances = Array.from(new Set(mockProcesses.map(p => p.instance)));

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Process Dashboard</CardTitle>
          <CardDescription>
            Manage and track your assigned processes across all applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
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
              <Select defaultValue="status">
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Filter</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="font-medium mb-2">Status</div>
                    <div className="space-y-2">
                      {["In Progress", "Pending", "Completed", "Failed"].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`status-${status}`} 
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => handleStatusChange(status)}
                          />
                          <label htmlFor={`status-${status}`}>{status}</label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="font-medium mb-2 mt-4">Application</div>
                    <div className="space-y-2">
                      {uniqueApplications.map((app) => (
                        <div key={app} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`app-${app}`} 
                            checked={selectedApplications.includes(app)}
                            onCheckedChange={() => handleApplicationChange(app)}
                          />
                          <label htmlFor={`app-${app}`}>{app}</label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="font-medium mb-2 mt-4">Instance</div>
                    <div className="space-y-2">
                      {uniqueInstances.map((instance) => (
                        <div key={instance} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`instance-${instance}`} 
                            checked={selectedInstances.includes(instance)}
                            onCheckedChange={() => handleInstanceChange(instance)}
                          />
                          <label htmlFor={`instance-${instance}`}>{instance}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {showAllProcesses && (
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="inProgress">In Progress</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <ProcessTable 
                    processes={filteredProcesses} 
                    onProcessClick={handleProcessClick}
                    selectedProcess={selectedProcess}
                  />
                </TabsContent>
                
                <TabsContent value="inProgress" className="mt-4">
                  <ProcessTable 
                    processes={filteredProcesses.filter(p => p.status === "In Progress")} 
                    onProcessClick={handleProcessClick}
                    selectedProcess={selectedProcess}
                  />
                </TabsContent>
                
                <TabsContent value="pending" className="mt-4">
                  <ProcessTable 
                    processes={filteredProcesses.filter(p => p.status === "Pending")} 
                    onProcessClick={handleProcessClick}
                    selectedProcess={selectedProcess}
                  />
                </TabsContent>
                
                <TabsContent value="completed" className="mt-4">
                  <ProcessTable 
                    processes={filteredProcesses.filter(p => p.status === "Completed")} 
                    onProcessClick={handleProcessClick}
                    selectedProcess={selectedProcess}
                  />
                </TabsContent>
              </Tabs>
            )}
            
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
}

const ProcessTable: React.FC<ProcessTableProps> = ({ 
  processes, 
  onProcessClick,
  selectedProcess 
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Application</TableHead>
            <TableHead>Instance</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
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
                className={selectedProcess?.id === process.id ? "bg-muted/50" : ""}
                onClick={() => onProcessClick(process)}
              >
                <TableCell className="font-medium">{process.id}</TableCell>
                <TableCell>{process.name}</TableCell>
                <TableCell>{process.application}</TableCell>
                <TableCell>{process.instance}</TableCell>
                <TableCell>{process.stage}</TableCell>
                <TableCell>
                  <Badge variant={
                    process.status === "Completed" ? "outline" : 
                    process.status === "In Progress" ? "default" : 
                    process.status === "Failed" ? "destructive" : 
                    "secondary"
                  }>
                    {process.status}
                  </Badge>
                </TableCell>
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
                  <Button variant="ghost" size="sm">
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