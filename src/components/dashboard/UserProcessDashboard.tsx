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
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Lock, 
  Unlock, 
  FileText, 
  Eye, 
  EyeOff,
  X,
  ArrowLeft,
  FileIcon,
  Settings,
  PanelLeft,
  PanelLeftClose
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

// Mock data for workflow detail sections
const mockStageOverviewData = {
  name: "Data Validation",
  description: "Validates incoming market data against reference sources",
  owner: "Market Data Team",
  sla: "T+0 12:00",
  status: "In Progress",
  startTime: "2025-05-22 08:30",
  estimatedCompletion: "2025-05-22 12:00"
};

const mockAppConfigData = {
  application: "eRates",
  version: "2.3.1",
  environment: "Production",
  dataSource: "Market Data API",
  outputDestination: "Rates Database",
  retryPolicy: "3 attempts, 5 minute intervals",
  notificationRecipients: "market-data-team@example.com"
};

const mockGlobalConfigData = {
  businessDate: "2025-05-22",
  region: "EMEA",
  dataRetentionPeriod: "90 days",
  auditLevel: "Detailed",
  emergencyContact: "operations@example.com"
};

// Mock data for process overview
const mockProcessOverviewData = {
  id: "SUB-001",
  name: "Market Data Validation",
  description: "Validates incoming market data against reference sources",
  owner: "Praveen Kumar",
  status: "In Progress",
  startTime: "2025-05-22 09:15",
  estimatedCompletion: "2025-05-22 10:30",
  priority: "High",
  progress: 65,
  dependencies: 2,
  files: 2,
  queries: 1
};

// Mock data for process config
const mockProcessConfigData = {
  validationRules: "Standard + Extended",
  toleranceLevel: "Medium",
  dataSource: "Market Data API",
  outputFormat: "Excel + Database",
  notificationThreshold: "Error",
  retryAttempts: 3,
  timeoutMinutes: 30
};

// Mock data for queries
const mockQueriesData = [
  {
    id: "Q-001",
    title: "Missing USD/EUR rate",
    status: "Open",
    createdBy: "System",
    createdAt: "2025-05-22 09:30",
    description: "USD/EUR rate is missing in the market data feed for value date 2025-05-23",
    priority: "High",
    assignedTo: "Praveen Kumar"
  }
];

export function UserProcessDashboard() {
  const [selectedTab, setSelectedTab] = useState("inProgress");
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [selectedSubStage, setSelectedSubStage] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showSubStageCards, setShowSubStageCards] = useState(true);
  const [showWorkflowDetail, setShowWorkflowDetail] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["In Progress"]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [workflowDetailTab, setWorkflowDetailTab] = useState("stageOverview");
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
    setShowFilePreview(false);
    setShowAllProcesses(false);
  };

  // Handle back to all processes
  const handleBackToAllProcesses = () => {
    setShowAllProcesses(true);
    setSelectedProcess(null);
    setSelectedSubStage(null);
    setSelectedFile(null);
    setShowFilePreview(false);
  };

  // Handle process ID click (toggle selection)
  const handleProcessIdClick = () => {
    if (selectedSubStage) {
      setSelectedSubStage(null);
      setSelectedFile(null);
      setShowFilePreview(false);
    } else {
      setSelectedSubStage(mockSubStageProcess);
    }
  };

  // Handle file click
  const handleFileClick = (file: any) => {
    if (!file || !file.id) {
      console.error("Invalid file object:", file);
      return;
    }
    setSelectedFile(file);
    setShowFilePreview(true);
    setShowWorkflowDetail(false);
  };

  // Handle dependency file click
  const handleDependencyFileClick = (file: any) => {
    if (!file || !file.id) {
      console.error("Invalid dependency file object:", file);
      return;
    }
    setSelectedFile(file);
    setShowFilePreview(true);
    setShowWorkflowDetail(false);
  };

  // Toggle sub-stage cards visibility
  const toggleSubStageCards = () => {
    setShowSubStageCards(!showSubStageCards);
  };

  // Toggle workflow detail visibility
  const toggleWorkflowDetail = () => {
    setShowWorkflowDetail(!showWorkflowDetail);
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

  // Helper function to safely render file buttons
  const renderFileButtons = (files: any[] | undefined) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return <div className="p-2 text-muted-foreground">No files available</div>;
    }

    return files.map((file: any) => {
      if (!file || !file.id) return null;
      return (
        <Button 
          key={file.id}
          variant={selectedFile?.id === file.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleFileClick(file)}
        >
          <FileText className="h-4 w-4 mr-2" />
          {file.name || 'Unnamed File'}
        </Button>
      );
    });
  };

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
              <div className="grid grid-cols-1 gap-6">
                {/* Process Detail Header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleBackToAllProcesses}
                          className="mr-2"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Back to All Processes
                        </Button>
                        <div>
                          <CardTitle>{selectedProcess.name}</CardTitle>
                          <CardDescription>
                            {selectedProcess.application} &gt; {selectedProcess.instance} &gt; {selectedProcess.stage}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Lock className="h-4 w-4 mr-2" />
                          Lock
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                
                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-6">
                  {/* File Preview Mode */}
                  {showFilePreview ? (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Toggle Controls */}
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={toggleSubStageCards}
                          className="flex items-center"
                        >
                          {showSubStageCards ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                          {showSubStageCards ? "Hide Process Card" : "Show Process Card"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={toggleWorkflowDetail}
                          className="flex items-center"
                        >
                          {showWorkflowDetail ? <PanelLeftClose className="h-4 w-4 mr-2" /> : <PanelLeft className="h-4 w-4 mr-2" />}
                          {showWorkflowDetail ? "Hide Workflow Detail" : "Show Workflow Detail"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Sub-Stage Process Cards (if visible) */}
                        {showSubStageCards && selectedSubStage && (
                          <Card className="md:col-span-3">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <CardTitle className="text-lg">{selectedSubStage.name || 'Unnamed Process'}</CardTitle>
                                  <CardDescription>
                                    ID: <span className="font-medium cursor-pointer" onClick={handleProcessIdClick}>
                                      {selectedSubStage.id || 'Unknown ID'}
                                    </span> | Status: <Badge variant={selectedSubStage.status === "In Progress" ? "default" : "outline"}>
                                      {selectedSubStage.status || 'Unknown Status'}
                                    </Badge>
                                  </CardDescription>
                                </div>
                                <div>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedSubStage(null);
                                    setSelectedFile(null);
                                    setShowFilePreview(false);
                                  }}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Assigned To</p>
                                  <p className="font-medium">{selectedSubStage.assignedTo || 'Unassigned'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Priority</p>
                                  <p className="font-medium">{selectedSubStage.priority || 'None'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Start Time</p>
                                  <p className="font-medium">{selectedSubStage.startTime || 'Not started'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Est. Completion</p>
                                  <p className="font-medium">{selectedSubStage.estimatedCompletion || 'Unknown'}</p>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-1">Progress</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${selectedSubStage.progress || 0}%` }}
                                  ></div>
                                </div>
                                <p className="text-right text-sm mt-1">{selectedSubStage.progress || 0}%</p>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-1">Description</p>
                                <p className="text-sm">{selectedSubStage.description || 'No description available'}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* File Preview */}
                        <Card className={`${showSubStageCards ? 'md:col-span-9' : 'md:col-span-12'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle>Preview Files</CardTitle>
                                <CardDescription>
                                  Viewing: {selectedFile?.name || 'No file selected'}
                                </CardDescription>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedFile(null);
                                setShowFilePreview(false);
                                setShowWorkflowDetail(true);
                              }}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <div className="flex space-x-2 mb-4">
                                {selectedSubStage && selectedSubStage.files && Array.isArray(selectedSubStage.files) ? 
                                  renderFileButtons(selectedSubStage.files) : 
                                  <div className="p-2 text-muted-foreground">No files available</div>
                                }
                              </div>
                              
                              {selectedFile && typeof selectedFile === 'object' && selectedFile.id ? (
                                <AdvancedFilePreview 
                                  fileId={selectedFile.id} 
                                  fileName={selectedFile.name || 'Unknown File'} 
                                  onClose={() => {
                                    setSelectedFile(null);
                                    setShowFilePreview(false);
                                    setShowWorkflowDetail(true);
                                  }} 
                                />
                              ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                  Select a file to preview
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Workflow Detail View (if visible) */}
                      {showWorkflowDetail && (
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle>Workflow Detail</CardTitle>
                              <Button variant="ghost" size="sm" onClick={toggleWorkflowDetail}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Tabs value={workflowDetailTab} onValueChange={setWorkflowDetailTab}>
                              <TabsList className="grid w-full grid-cols-8 mb-4">
                                <TabsTrigger value="stageOverview">Stage Overview</TabsTrigger>
                                <TabsTrigger value="appConfig">App Config</TabsTrigger>
                                <TabsTrigger value="globalConfig">Global Config</TabsTrigger>
                                <TabsTrigger value="processOverview">Process Overview</TabsTrigger>
                                <TabsTrigger value="processConfig">Process Config</TabsTrigger>
                                <TabsTrigger value="files">Files</TabsTrigger>
                                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                                <TabsTrigger value="queries">Queries</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="stageOverview">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{mockStageOverviewData.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-medium">{mockStageOverviewData.status}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Owner</p>
                                    <p className="font-medium">{mockStageOverviewData.owner}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">SLA</p>
                                    <p className="font-medium">{mockStageOverviewData.sla}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Start Time</p>
                                    <p className="font-medium">{mockStageOverviewData.startTime}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Est. Completion</p>
                                    <p className="font-medium">{mockStageOverviewData.estimatedCompletion}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="font-medium">{mockStageOverviewData.description}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="appConfig">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Application</p>
                                    <p className="font-medium">{mockAppConfigData.application}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Version</p>
                                    <p className="font-medium">{mockAppConfigData.version}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Environment</p>
                                    <p className="font-medium">{mockAppConfigData.environment}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Data Source</p>
                                    <p className="font-medium">{mockAppConfigData.dataSource}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Output Destination</p>
                                    <p className="font-medium">{mockAppConfigData.outputDestination}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Retry Policy</p>
                                    <p className="font-medium">{mockAppConfigData.retryPolicy}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Notification Recipients</p>
                                    <p className="font-medium">{mockAppConfigData.notificationRecipients}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="globalConfig">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Business Date</p>
                                    <p className="font-medium">{mockGlobalConfigData.businessDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Region</p>
                                    <p className="font-medium">{mockGlobalConfigData.region}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Data Retention Period</p>
                                    <p className="font-medium">{mockGlobalConfigData.dataRetentionPeriod}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Audit Level</p>
                                    <p className="font-medium">{mockGlobalConfigData.auditLevel}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Emergency Contact</p>
                                    <p className="font-medium">{mockGlobalConfigData.emergencyContact}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="processOverview">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">ID</p>
                                    <p className="font-medium">{mockProcessOverviewData.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{mockProcessOverviewData.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Owner</p>
                                    <p className="font-medium">{mockProcessOverviewData.owner}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-medium">{mockProcessOverviewData.status}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Start Time</p>
                                    <p className="font-medium">{mockProcessOverviewData.startTime}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Est. Completion</p>
                                    <p className="font-medium">{mockProcessOverviewData.estimatedCompletion}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Priority</p>
                                    <p className="font-medium">{mockProcessOverviewData.priority}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Progress</p>
                                    <p className="font-medium">{mockProcessOverviewData.progress}%</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="font-medium">{mockProcessOverviewData.description}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="processConfig">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Validation Rules</p>
                                    <p className="font-medium">{mockProcessConfigData.validationRules}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Tolerance Level</p>
                                    <p className="font-medium">{mockProcessConfigData.toleranceLevel}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Data Source</p>
                                    <p className="font-medium">{mockProcessConfigData.dataSource}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Output Format</p>
                                    <p className="font-medium">{mockProcessConfigData.outputFormat}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Notification Threshold</p>
                                    <p className="font-medium">{mockProcessConfigData.notificationThreshold}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Retry Attempts</p>
                                    <p className="font-medium">{mockProcessConfigData.retryAttempts}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Timeout (minutes)</p>
                                    <p className="font-medium">{mockProcessConfigData.timeoutMinutes}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="files">
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Last Modified</TableHead>
                                        <TableHead>Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedProcess.files && Array.isArray(selectedProcess.files) ? (
                                        selectedProcess.files.map((file: any) => {
                                          if (!file || !file.id) return null;
                                          return (
                                            <TableRow key={file.id}>
                                              <TableCell>{file.name || 'Unnamed File'}</TableCell>
                                              <TableCell>{file.type || 'Unknown'}</TableCell>
                                              <TableCell>{file.size || 'Unknown'}</TableCell>
                                              <TableCell>{file.lastModified || 'Unknown'}</TableCell>
                                              <TableCell>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm"
                                                  onClick={() => handleFileClick(file)}
                                                >
                                                  <Eye className="h-4 w-4" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={5} className="text-center py-4">
                                            No files available
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="dependencies">
                                <div className="space-y-6">
                                  {/* Parent Dependencies */}
                                  <div>
                                    <h3 className="text-lg font-medium mb-2">Parent Processes</h3>
                                    {selectedProcess.dependencies?.parent && 
                                     Array.isArray(selectedProcess.dependencies.parent) && 
                                     selectedProcess.dependencies.parent.length > 0 ? (
                                      <div className="space-y-4">
                                        {selectedProcess.dependencies.parent.map((parent: any) => {
                                          if (!parent || !parent.id) return null;
                                          return (
                                            <Card key={parent.id}>
                                              <CardHeader className="py-3">
                                                <div className="flex justify-between items-center">
                                                  <div>
                                                    <CardTitle className="text-base">{parent.name || 'Unnamed Process'}</CardTitle>
                                                    <CardDescription>ID: {parent.id}</CardDescription>
                                                  </div>
                                                  <Badge variant={parent.status === "Completed" ? "outline" : "default"}>
                                                    {parent.status || 'Unknown Status'}
                                                  </Badge>
                                                </div>
                                              </CardHeader>
                                              {parent.files && Array.isArray(parent.files) && parent.files.length > 0 && (
                                                <CardContent className="py-0">
                                                  <p className="text-sm font-medium mb-2">Files</p>
                                                  <div className="flex flex-wrap gap-2">
                                                    {parent.files.map((file: any) => {
                                                      if (!file || !file.id) return null;
                                                      return (
                                                        <Button 
                                                          key={file.id}
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={() => handleDependencyFileClick(file)}
                                                        >
                                                          <FileText className="h-4 w-4 mr-2" />
                                                          {file.name || 'Unnamed File'}
                                                        </Button>
                                                      );
                                                    })}
                                                  </div>
                                                </CardContent>
                                              )}
                                            </Card>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No parent dependencies</p>
                                    )}
                                  </div>
                                  
                                  <Separator />
                                  
                                  {/* Child Dependencies */}
                                  <div>
                                    <h3 className="text-lg font-medium mb-2">Child Processes</h3>
                                    {selectedProcess.dependencies?.child && 
                                     Array.isArray(selectedProcess.dependencies.child) && 
                                     selectedProcess.dependencies.child.length > 0 ? (
                                      <div className="space-y-4">
                                        {selectedProcess.dependencies.child.map((child: any) => {
                                          if (!child || !child.id) return null;
                                          return (
                                            <Card key={child.id}>
                                              <CardHeader className="py-3">
                                                <div className="flex justify-between items-center">
                                                  <div>
                                                    <CardTitle className="text-base">{child.name || 'Unnamed Process'}</CardTitle>
                                                    <CardDescription>ID: {child.id}</CardDescription>
                                                  </div>
                                                  <Badge variant={
                                                    child.status === "Completed" ? "outline" : 
                                                    child.status === "Blocked" ? "destructive" : 
                                                    "default"
                                                  }>
                                                    {child.status || 'Unknown Status'}
                                                  </Badge>
                                                </div>
                                              </CardHeader>
                                              {child.files && Array.isArray(child.files) && child.files.length > 0 && (
                                                <CardContent className="py-0">
                                                  <p className="text-sm font-medium mb-2">Files</p>
                                                  <div className="flex flex-wrap gap-2">
                                                    {child.files.map((file: any) => {
                                                      if (!file || !file.id) return null;
                                                      return (
                                                        <Button 
                                                          key={file.id}
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={() => handleDependencyFileClick(file)}
                                                        >
                                                          <FileText className="h-4 w-4 mr-2" />
                                                          {file.name || 'Unnamed File'}
                                                        </Button>
                                                      );
                                                    })}
                                                  </div>
                                                </CardContent>
                                              )}
                                            </Card>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No child dependencies</p>
                                    )}
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="queries">
                                <div className="space-y-4">
                                  {mockQueriesData.map((query) => (
                                    <Card key={query.id}>
                                      <CardHeader className="py-3">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <CardTitle className="text-base">{query.title}</CardTitle>
                                            <CardDescription>ID: {query.id} | Created: {query.createdAt}</CardDescription>
                                          </div>
                                          <Badge variant={query.status === "Open" ? "default" : "outline"}>
                                            {query.status}
                                          </Badge>
                                        </div>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-2 gap-4 mb-2">
                                          <div>
                                            <p className="text-sm text-muted-foreground">Created By</p>
                                            <p className="font-medium">{query.createdBy}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Assigned To</p>
                                            <p className="font-medium">{query.assignedTo}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Priority</p>
                                            <p className="font-medium">{query.priority}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Description</p>
                                          <p className="text-sm">{query.description}</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Sub-Stage Process Cards */}
                      <div className="md:col-span-1">
                        <Card>
                          <CardHeader>
                            <CardTitle>Sub-Stage Processes</CardTitle>
                            <CardDescription>
                              Click on a process ID to view details
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <p className="font-medium">{mockSubStageProcess.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      ID: <span className="font-medium cursor-pointer" onClick={handleProcessIdClick}>
                                        {mockSubStageProcess.id}
                                      </span>
                                    </p>
                                  </div>
                                  <Badge variant={mockSubStageProcess.status === "In Progress" ? "default" : "outline"}>
                                    {mockSubStageProcess.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                  <div>
                                    <p className="text-muted-foreground">Assigned To</p>
                                    <p>{mockSubStageProcess.assignedTo}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Priority</p>
                                    <p>{mockSubStageProcess.priority}</p>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mb-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${mockSubStageProcess.progress}%` }}
                                  ></div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {mockSubStageProcess.files && Array.isArray(mockSubStageProcess.files) ? (
                                    mockSubStageProcess.files.map((file: any) => {
                                      if (!file || !file.id) return null;
                                      return (
                                        <Button 
                                          key={file.id}
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => handleFileClick(file)}
                                        >
                                          <FileText className="h-3 w-3 mr-1" />
                                          {file.name || 'Unnamed File'}
                                        </Button>
                                      );
                                    })
                                  ) : (
                                    <div className="text-xs text-muted-foreground">No files available</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Process Detail */}
                      <div className="md:col-span-2">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle>Process Detail</CardTitle>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setWorkflowDetailTab("stageOverview")}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Workflow Detail
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Tabs defaultValue="info">
                              <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="info">Information</TabsTrigger>
                                <TabsTrigger value="files">Files</TabsTrigger>
                                <TabsTrigger value="actions">Actions</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="info">
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-lg font-medium mb-2">Process Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">ID</p>
                                        <p className="font-medium">{selectedProcess.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{selectedProcess.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Application</p>
                                        <p className="font-medium">{selectedProcess.application}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Instance</p>
                                        <p className="font-medium">{selectedProcess.instance}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Stage</p>
                                        <p className="font-medium">{selectedProcess.stage}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className="font-medium">{selectedProcess.status}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Assigned To</p>
                                        <p className="font-medium">{selectedProcess.assignedTo}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Priority</p>
                                        <p className="font-medium">{selectedProcess.priority}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Due Date</p>
                                        <p className="font-medium">{selectedProcess.dueDate}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="files">
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Last Modified</TableHead>
                                        <TableHead>Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedProcess.files && Array.isArray(selectedProcess.files) ? (
                                        selectedProcess.files.map((file: any) => {
                                          if (!file || !file.id) return null;
                                          return (
                                            <TableRow key={file.id}>
                                              <TableCell>{file.name || 'Unnamed File'}</TableCell>
                                              <TableCell>{file.type || 'Unknown'}</TableCell>
                                              <TableCell>{file.size || 'Unknown'}</TableCell>
                                              <TableCell>{file.lastModified || 'Unknown'}</TableCell>
                                              <TableCell>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm"
                                                  onClick={() => handleFileClick(file)}
                                                >
                                                  <Eye className="h-4 w-4" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={5} className="text-center py-4">
                                            No files available
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="actions">
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-lg font-medium mb-2">Actions</h3>
                                    <div className="flex space-x-2">
                                      <Button>Complete Process</Button>
                                      <Button variant="outline">Reassign</Button>
                                      <Button variant="outline">Add Comment</Button>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Process Table Component
function ProcessTable({ 
  processes, 
  onProcessClick,
  selectedProcess 
}: { 
  processes: any[]; 
  onProcessClick: (process: any) => void;
  selectedProcess: any;
}) {
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