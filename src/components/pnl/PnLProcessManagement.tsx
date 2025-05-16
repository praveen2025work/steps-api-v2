import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  MoreHorizontal,
  Play,
  RotateCw,
  Search,
  Settings,
  XCircle,
  Calendar,
  Globe,
  Eye,
  Pause,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/toast";

export function PnLProcessManagement() {
  const [selectedDate, setSelectedDate] = useState("2025-05-16");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showParametersDialog, setShowParametersDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  
  // This would be the current date in a real application
  const currentDate = "2025-05-16";
  const previousDate = "2025-05-15"; // The date with the major failure
  
  // Generate process data based on the selected date and region
  const processes = generateProcesses(selectedDate, selectedRegion);
  
  // Filter processes based on search query
  const filteredProcesses = processes.filter(process => 
    process.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    process.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    process.desk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    process.currentStage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    process.statusText.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewParameters = (process) => {
    setSelectedProcess(process);
    setShowParametersDialog(true);
  };
  
  const handleViewAudit = (process) => {
    setSelectedProcess(process);
    setShowAuditDialog(true);
  };
  
  const handleRecovery = (processId) => {
    toast({
      title: "Recovery Initiated",
      description: `Recovery has been initiated for process ${processId}`,
      variant: "default"
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Critical Alert for May 15 Failure */}
      {selectedDate === previousDate && (
        <Card className="border-red-600 bg-red-50 text-red-600 dark:bg-red-950/30">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Critical System Failure Details
            </CardTitle>
            <CardDescription className="text-red-600/80">
              All 265 PnL processes failed on May 15, 2025, primarily in the Substantiation stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-red-200 dark:border-red-800/50">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Failure Time</div>
                  <div className="text-lg font-bold">09:32 AM EST</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-red-200 dark:border-red-800/50">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Affected Regions</div>
                  <div className="text-lg font-bold">All Regions (4)</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-red-200 dark:border-red-800/50">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Affected Processes</div>
                  <div className="text-lg font-bold">265/265 (100%)</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-red-200 dark:border-red-800/50">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Failure Point</div>
                  <div className="text-lg font-bold">Substantiation Stage</div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-red-200 dark:border-red-800/50">
                <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Root Cause Analysis</div>
                <p className="text-sm">
                  Database connection failure during the Substantiation stage caused by network partition between 
                  application servers and the primary database cluster. Failover to secondary database was delayed 
                  due to replication lag.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-red-200 dark:border-red-800/50">
                <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Recovery Actions Taken</div>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Network connectivity restored at 10:15 AM EST</li>
                  <li>Database failover completed at 10:20 AM EST</li>
                  <li>Bulk recovery of all processes initiated at 10:30 AM EST</li>
                  <li>All processes restarted from Substantiation checkpoint</li>
                  <li>EOD deadline extended to 21:00 EST to accommodate recovery</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
              onClick={() => toast({
                title: "Incident Report Downloaded",
                description: "The full incident report has been downloaded",
                variant: "default"
              })}
            >
              Download Full Incident Report
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Process Management Controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-05-16">May 16, 2025 (Today)</SelectItem>
                  <SelectItem value="2025-05-15">May 15, 2025</SelectItem>
                  <SelectItem value="2025-05-14">May 14, 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="americas">Americas</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="shanghai">Shanghai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search processes..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {selectedDate === previousDate && (
          <div className="flex justify-end">
            <Button 
              variant="default" 
              className="gap-1 bg-amber-500 hover:bg-amber-600"
              onClick={() => toast({
                title: "Bulk Recovery Initiated",
                description: "Recovery has been initiated for all failed processes",
                variant: "default"
              })}
            >
              <RotateCw className="h-4 w-4" />
              Bulk Recovery: All Failed Processes
            </Button>
          </div>
        )}
      </div>
      
      {/* Process List Table */}
      <Card>
        <CardHeader>
          <CardTitle>PnL Process Management</CardTitle>
          <CardDescription>
            {selectedDate === previousDate 
              ? "View and manage failed processes from May 15, 2025" 
              : "View and manage all PnL processes across regions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No processes found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.id}</TableCell>
                    <TableCell>{process.name}</TableCell>
                    <TableCell>{process.region}</TableCell>
                    <TableCell>{process.currentStage}</TableCell>
                    <TableCell>
                      <StatusBadge status={process.status} text={process.statusText} />
                    </TableCell>
                    <TableCell>{process.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        {process.status === "failed" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs border-amber-500 text-amber-700 hover:bg-amber-100"
                            onClick={() => handleRecovery(process.id)}
                          >
                            <RotateCw className="h-3 w-3 mr-1" />
                            Recover
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewParameters(process)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Parameters
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewAudit(process)}>
                              <Clock className="h-4 w-4 mr-2" />
                              View Audit Log
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {process.status === "running" && (
                              <DropdownMenuItem onClick={() => toast({
                                title: "Process Paused",
                                description: `Process ${process.id} has been paused`,
                                variant: "default"
                              })}>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Process
                              </DropdownMenuItem>
                            )}
                            {process.status === "paused" && (
                              <DropdownMenuItem onClick={() => toast({
                                title: "Process Resumed",
                                description: `Process ${process.id} has been resumed`,
                                variant: "default"
                              })}>
                                <Play className="h-4 w-4 mr-2" />
                                Resume Process
                              </DropdownMenuItem>
                            )}
                            {process.status === "failed" && (
                              <DropdownMenuItem 
                                className="text-amber-500"
                                onClick={() => handleRecovery(process.id)}
                              >
                                <RotateCw className="h-4 w-4 mr-2" />
                                Recover Process
                              </DropdownMenuItem>
                            )}
                            {process.status !== "failed" && (
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={() => toast({
                                  title: "Process Terminated",
                                  description: `Process ${process.id} has been terminated`,
                                  variant: "destructive"
                                })}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Terminate Process
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Process Parameters Dialog */}
      {selectedProcess && (
        <Dialog open={showParametersDialog} onOpenChange={setShowParametersDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Process Parameters: {selectedProcess.id}</DialogTitle>
              <DialogDescription>
                {selectedProcess.name} - {selectedProcess.region} - {selectedProcess.desk}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Process Type</Label>
                  <div className="p-2 border rounded-md bg-muted/20">Daily PnL Calculation</div>
                </div>
                <div className="space-y-2">
                  <Label>Process Owner</Label>
                  <div className="p-2 border rounded-md bg-muted/20">Finance Operations Team</div>
                </div>
                <div className="space-y-2">
                  <Label>Execution Schedule</Label>
                  <div className="p-2 border rounded-md bg-muted/20">Daily (Business Days Only)</div>
                </div>
                <div className="space-y-2">
                  <Label>SLA Deadline</Label>
                  <div className="p-2 border rounded-md bg-muted/20">19:00 EST</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Process Description</Label>
                <div className="p-2 border rounded-md bg-muted/20">
                  Daily Profit and Loss calculation process for {selectedProcess.desk} in {selectedProcess.region} region. 
                  Includes market data collection, position validation, substantiation of P&L calculations, reconciliation 
                  with external systems, approval workflow, and final reporting.
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Configuration Parameters</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">DATA_SOURCE</TableCell>
                      <TableCell>GLOBAL_MARKET_DB</TableCell>
                      <TableCell>Primary source for market data</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">POSITION_SYSTEM</TableCell>
                      <TableCell>TRADING_CORE_V3</TableCell>
                      <TableCell>System of record for positions</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">CALCULATION_ENGINE</TableCell>
                      <TableCell>RISK_ENGINE_2.1</TableCell>
                      <TableCell>Engine used for PnL calculations</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">RECONCILIATION_THRESHOLD</TableCell>
                      <TableCell>0.01%</TableCell>
                      <TableCell>Maximum allowed difference in reconciliation</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">APPROVAL_WORKFLOW</TableCell>
                      <TableCell>STANDARD_TWO_LEVEL</TableCell>
                      <TableCell>Approval workflow configuration</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">REPORTING_FORMAT</TableCell>
                      <TableCell>REGULATORY_STANDARD_2025</TableCell>
                      <TableCell>Format for final reports</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="space-y-2">
                <Label>Dependencies</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dependency</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Market Data Feed</TableCell>
                      <TableCell>External System</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Position Data</TableCell>
                      <TableCell>Internal System</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Risk Calculation Engine</TableCell>
                      <TableCell>Internal Service</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowParametersDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast({
                  title: "Parameters Exported",
                  description: `Parameters for process ${selectedProcess.id} have been exported`,
                  variant: "default"
                });
                setShowParametersDialog(false);
              }}>
                Export Parameters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Process Audit Dialog */}
      {selectedProcess && (
        <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Audit Log: {selectedProcess.id}</DialogTitle>
              <DialogDescription>
                {selectedProcess.name} - {selectedProcess.region} - {selectedProcess.desk}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generateAuditEvents(selectedProcess).map((event, index) => (
                      <TableRow key={index}>
                        <TableCell className="whitespace-nowrap">{event.timestamp}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getEventIcon(event.event)}
                            <span className="ml-2">{event.event}</span>
                          </div>
                        </TableCell>
                        <TableCell>{event.user}</TableCell>
                        <TableCell className="max-w-xs truncate">{event.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAuditDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast({
                  title: "Audit Log Exported",
                  description: `Audit log for process ${selectedProcess.id} has been exported`,
                  variant: "default"
                });
                setShowAuditDialog(false);
              }}>
                Export Audit Log
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatusBadge({ status, text }) {
  switch (status) {
    case "running":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "recovering":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <RotateCw className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "warning":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "paused":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
          <Pause className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {text}
        </Badge>
      );
  }
}

function getEventIcon(event) {
  if (event.includes("Started")) {
    return <Play className="h-3 w-3 text-blue-500" />;
  } else if (event.includes("Completed")) {
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  } else if (event.includes("Failed")) {
    return <XCircle className="h-3 w-3 text-red-500" />;
  } else if (event.includes("Recovered") || event.includes("Restarted")) {
    return <RotateCw className="h-3 w-3 text-amber-500" />;
  } else if (event.includes("Paused")) {
    return <Pause className="h-3 w-3 text-gray-500" />;
  } else if (event.includes("Warning")) {
    return <AlertTriangle className="h-3 w-3 text-amber-500" />;
  } else if (event.includes("Modified") || event.includes("Updated")) {
    return <Settings className="h-3 w-3 text-blue-500" />;
  } else {
    return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
}

// Generate sample process data based on date and region
function generateProcesses(date, region) {
  const previousDate = "2025-05-15"; // The date with the major failure
  const currentDate = "2025-05-16";
  
  // Base process data - expanded for the process management view
  const baseProcesses = [
    {
      id: "PNL-1001",
      name: "Equities Daily PnL",
      region: "Americas",
      desk: "Equities Trading",
      lastUpdated: date === previousDate ? "15 May, 09:32 AM" : "16 May, 09:32 AM"
    },
    {
      id: "PNL-1002",
      name: "Fixed Income Daily PnL",
      region: "Americas",
      desk: "Fixed Income",
      lastUpdated: date === previousDate ? "15 May, 09:35 AM" : "16 May, 09:35 AM"
    },
    {
      id: "PNL-1003",
      name: "FX Options Daily PnL",
      region: "Americas",
      desk: "FX Trading",
      lastUpdated: date === previousDate ? "15 May, 09:40 AM" : "16 May, 09:40 AM"
    },
    {
      id: "PNL-1004",
      name: "Commodities Daily PnL",
      region: "Americas",
      desk: "Commodities",
      lastUpdated: date === previousDate ? "15 May, 09:42 AM" : "16 May, 09:42 AM"
    },
    {
      id: "PNL-1005",
      name: "Credit Trading Daily PnL",
      region: "Americas",
      desk: "Credit Trading",
      lastUpdated: date === previousDate ? "15 May, 09:45 AM" : "16 May, 09:45 AM"
    },
    {
      id: "PNL-2001",
      name: "Equities Daily PnL",
      region: "Asia",
      desk: "Equities Trading",
      lastUpdated: date === previousDate ? "15 May, 08:32 AM" : "16 May, 08:32 AM"
    },
    {
      id: "PNL-2002",
      name: "Fixed Income Daily PnL",
      region: "Asia",
      desk: "Fixed Income",
      lastUpdated: date === previousDate ? "15 May, 08:35 AM" : "16 May, 08:35 AM"
    },
    {
      id: "PNL-2003",
      name: "FX Options Daily PnL",
      region: "Asia",
      desk: "FX Trading",
      lastUpdated: date === previousDate ? "15 May, 08:40 AM" : "16 May, 08:40 AM"
    },
    {
      id: "PNL-3001",
      name: "Equities Daily PnL",
      region: "India",
      desk: "Equities Trading",
      lastUpdated: date === previousDate ? "15 May, 07:32 AM" : "16 May, 07:32 AM"
    },
    {
      id: "PNL-3002",
      name: "Fixed Income Daily PnL",
      region: "India",
      desk: "Fixed Income",
      lastUpdated: date === previousDate ? "15 May, 07:35 AM" : "16 May, 07:35 AM"
    },
    {
      id: "PNL-4001",
      name: "Equities Daily PnL",
      region: "Shanghai",
      desk: "Equities Trading",
      lastUpdated: date === previousDate ? "15 May, 06:32 AM" : "16 May, 06:32 AM"
    },
    {
      id: "PNL-4002",
      name: "Fixed Income Daily PnL",
      region: "Shanghai",
      desk: "Fixed Income",
      lastUpdated: date === previousDate ? "15 May, 06:35 AM" : "16 May, 06:35 AM"
    }
  ];
  
  // Filter by region if specified
  const regionFilteredProcesses = region === "all" 
    ? baseProcesses 
    : baseProcesses.filter(process => process.region.toLowerCase() === region.toLowerCase());
  
  // For the failure date, all processes failed at the Substantiation stage
  if (date === previousDate) {
    return regionFilteredProcesses.map(process => ({
      ...process,
      status: "failed",
      statusText: "Failed",
      currentStage: "Substantiation",
      progress: 45
    }));
  }
  
  // For the current date, show a mix of statuses
  if (date === currentDate) {
    return regionFilteredProcesses.map((process, index) => {
      // Create a mix of statuses for demonstration
      const statuses = ["running", "completed", "running", "warning", "running", "paused", "running", "completed", "warning", "running", "completed", "running"];
      const stages = ["Data Collection", "Validation", "Substantiation", "Reconciliation", "Approval", "Reporting", "Finalization", "Completed", "Substantiation", "Validation", "Completed", "Data Collection"];
      const statusTexts = ["Running", "Completed", "Running", "Warning", "Running", "Paused", "Running", "Completed", "Warning", "Running", "Completed", "Running"];
      
      return {
        ...process,
        status: statuses[index % statuses.length],
        statusText: statusTexts[index % statusTexts.length],
        currentStage: stages[index % stages.length],
        progress: stages[index % stages.length] === "Completed" ? 100 : Math.floor(Math.random() * 85) + 15
      };
    });
  }
  
  // For other dates, show all completed
  return regionFilteredProcesses.map(process => ({
    ...process,
    status: "completed",
    statusText: "Completed",
    currentStage: "Finalization",
    progress: 100
  }));
}

function generateAuditEvents(process) {
  const previousDate = "2025-05-15"; // The date with the major failure
  const currentDate = "2025-05-16";
  
  // Base events that are common for all processes
  const baseEvents = [
    {
      timestamp: "16 May, 09:00 AM",
      event: "Process Started",
      user: "System",
      details: "Daily scheduled execution initiated"
    },
    {
      timestamp: "16 May, 09:05 AM",
      event: "Stage Completed",
      user: "System",
      details: "Data Collection stage completed successfully"
    },
    {
      timestamp: "16 May, 09:15 AM",
      event: "Stage Completed",
      user: "System",
      details: "Validation stage completed successfully"
    }
  ];
  
  // For failed processes (May 15)
  if (process.status === "failed") {
    return [
      {
        timestamp: "15 May, 09:00 AM",
        event: "Process Started",
        user: "System",
        details: "Daily scheduled execution initiated"
      },
      {
        timestamp: "15 May, 09:05 AM",
        event: "Stage Completed",
        user: "System",
        details: "Data Collection stage completed successfully"
      },
      {
        timestamp: "15 May, 09:15 AM",
        event: "Stage Completed",
        user: "System",
        details: "Validation stage completed successfully"
      },
      {
        timestamp: "15 May, 09:32 AM",
        event: "Process Failed",
        user: "System",
        details: "Substantiation stage failed due to database connection error"
      },
      {
        timestamp: "15 May, 10:30 AM",
        event: "Recovery Initiated",
        user: "John Smith",
        details: "Manual recovery initiated after database connectivity restored"
      },
      {
        timestamp: "15 May, 10:35 AM",
        event: "Process Restarted",
        user: "System",
        details: "Process restarted from Substantiation stage checkpoint"
      },
      {
        timestamp: "15 May, 10:50 AM",
        event: "Stage Completed",
        user: "System",
        details: "Substantiation stage completed successfully"
      },
      {
        timestamp: "15 May, 11:05 AM",
        event: "Stage Completed",
        user: "System",
        details: "Reconciliation stage completed successfully"
      },
      {
        timestamp: "15 May, 11:15 AM",
        event: "Stage Completed",
        user: "System",
        details: "Approval stage completed successfully"
      },
      {
        timestamp: "15 May, 11:25 AM",
        event: "Stage Completed",
        user: "System",
        details: "Reporting stage completed successfully"
      },
      {
        timestamp: "15 May, 11:30 AM",
        event: "Process Completed",
        user: "System",
        details: "All stages completed successfully after recovery"
      }
    ];
  }
  
  // For completed processes
  if (process.status === "completed") {
    return [
      ...baseEvents,
      {
        timestamp: "16 May, 09:30 AM",
        event: "Stage Completed",
        user: "System",
        details: "Substantiation stage completed successfully"
      },
      {
        timestamp: "16 May, 09:45 AM",
        event: "Stage Completed",
        user: "System",
        details: "Reconciliation stage completed successfully"
      },
      {
        timestamp: "16 May, 09:55 AM",
        event: "Stage Completed",
        user: "System",
        details: "Approval stage completed successfully"
      },
      {
        timestamp: "16 May, 10:05 AM",
        event: "Stage Completed",
        user: "System",
        details: "Reporting stage completed successfully"
      },
      {
        timestamp: "16 May, 10:10 AM",
        event: "Process Completed",
        user: "System",
        details: "All stages completed successfully"
      }
    ];
  }
  
  // For running processes
  if (process.status === "running") {
    const events = [...baseEvents];
    
    if (process.currentStage === "Substantiation") {
      events.push({
        timestamp: "16 May, 09:30 AM",
        event: "Stage In Progress",
        user: "System",
        details: "Substantiation stage in progress"
      });
    } else if (process.currentStage === "Reconciliation") {
      events.push(
        {
          timestamp: "16 May, 09:30 AM",
          event: "Stage Completed",
          user: "System",
          details: "Substantiation stage completed successfully"
        },
        {
          timestamp: "16 May, 09:45 AM",
          event: "Stage In Progress",
          user: "System",
          details: "Reconciliation stage in progress"
        }
      );
    }
    
    return events;
  }
  
  // For warning processes
  if (process.status === "warning") {
    return [
      ...baseEvents,
      {
        timestamp: "16 May, 09:30 AM",
        event: "Warning Detected",
        user: "System",
        details: "Potential data anomaly detected in Substantiation stage"
      },
      {
        timestamp: "16 May, 09:35 AM",
        event: "Parameter Modified",
        user: "Sarah Johnson",
        details: "Reconciliation threshold temporarily increased to 0.02%"
      },
      {
        timestamp: "16 May, 09:40 AM",
        event: "Stage In Progress",
        user: "System",
        details: "Substantiation stage continuing with modified parameters"
      }
    ];
  }
  
  // For paused processes
  if (process.status === "paused") {
    return [
      ...baseEvents,
      {
        timestamp: "16 May, 09:30 AM",
        event: "Stage Started",
        user: "System",
        details: "Substantiation stage started"
      },
      {
        timestamp: "16 May, 09:40 AM",
        event: "Process Paused",
        user: "Michael Chen",
        details: "Process manually paused for data verification"
      }
    ];
  }
  
  // Default case
  return baseEvents;
}