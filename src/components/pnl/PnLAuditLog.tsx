import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Play,
  RotateCw,
  Search,
  Settings,
  XCircle,
  Calendar,
  Download,
  Pause,
  User
} from "lucide-react";
import { toast } from "@/lib/toast";

export function PnLAuditLog() {
  const [dateRange, setDateRange] = useState("today");
  const [eventType, setEventType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Generate audit events based on the selected filters
  const auditEvents = generateAuditEvents(dateRange, eventType);
  
  // Filter events based on search query
  const filteredEvents = auditEvents.filter(event => 
    event.processId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.processName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.details.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      {/* Audit Log Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="start">Process Started</SelectItem>
                <SelectItem value="complete">Process Completed</SelectItem>
                <SelectItem value="fail">Process Failed</SelectItem>
                <SelectItem value="recover">Process Recovered</SelectItem>
                <SelectItem value="manual">Manual Actions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search audit log..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => toast({
              title: "Audit Log Exported",
              description: "The audit log has been exported to CSV",
              variant: "default"
            })}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>PnL Process Audit Log</CardTitle>
          <CardDescription>
            Complete history of all PnL process events and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Process</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No audit events found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap">{event.timestamp}</TableCell>
                    <TableCell>
                      <div className="font-medium">{event.processId}</div>
                      <div className="text-xs text-muted-foreground">{event.processName}</div>
                    </TableCell>
                    <TableCell>{event.region}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getEventIcon(event.event)}
                        <span className="ml-2">{event.event}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {event.user === "System" ? (
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        ) : (
                          <User className="h-3 w-3 mr-1 text-muted-foreground" />
                        )}
                        {event.user}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{event.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === "today" ? "Today" : 
               dateRange === "yesterday" ? "Yesterday" : 
               dateRange === "week" ? "Last 7 days" : "Last 30 days"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Process Failures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {dateRange === "yesterday" ? "265" : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange === "yesterday" ? "Critical system failure on May 15" : "No failures in selected period"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recovery Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {dateRange === "yesterday" ? "265" : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange === "yesterday" ? "Bulk recovery after system failure" : "No recovery actions needed"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Manual Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dateRange === "yesterday" ? "12" : "3"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange === "yesterday" ? "During recovery operations" : "Normal operational adjustments"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
  } else if (event.includes("Modified") || event.includes("Updated") || event.includes("Parameter")) {
    return <Settings className="h-3 w-3 text-blue-500" />;
  } else if (event.includes("Exported") || event.includes("Downloaded")) {
    return <FileText className="h-3 w-3 text-blue-500" />;
  } else {
    return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
}

// Generate sample audit events based on date range and event type
function generateAuditEvents(dateRange, eventType) {
  // Base events for today
  const todayEvents = [
    {
      timestamp: "16 May, 09:00 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Process Started",
      user: "System",
      details: "Daily scheduled execution initiated"
    },
    {
      timestamp: "16 May, 09:00 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Process Started",
      user: "System",
      details: "Daily scheduled execution initiated"
    },
    {
      timestamp: "16 May, 09:05 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Data Collection stage completed successfully"
    },
    {
      timestamp: "16 May, 09:07 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Data Collection stage completed successfully"
    },
    {
      timestamp: "16 May, 09:15 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Validation stage completed successfully"
    },
    {
      timestamp: "16 May, 09:18 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Validation stage completed successfully"
    },
    {
      timestamp: "16 May, 09:30 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Parameter Modified",
      user: "Sarah Johnson",
      details: "Reconciliation threshold temporarily adjusted for market volatility"
    },
    {
      timestamp: "16 May, 09:35 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Substantiation stage completed successfully"
    },
    {
      timestamp: "16 May, 09:40 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Substantiation stage completed successfully"
    },
    {
      timestamp: "16 May, 09:45 AM",
      processId: "PNL-2001",
      processName: "Equities Daily PnL",
      region: "Asia",
      event: "Process Completed",
      user: "System",
      details: "All stages completed successfully"
    },
    {
      timestamp: "16 May, 09:50 AM",
      processId: "PNL-2002",
      processName: "Fixed Income Daily PnL",
      region: "Asia",
      event: "Process Completed",
      user: "System",
      details: "All stages completed successfully"
    },
    {
      timestamp: "16 May, 10:00 AM",
      processId: "PNL-1003",
      processName: "FX Options Daily PnL",
      region: "Americas",
      event: "Process Paused",
      user: "Michael Chen",
      details: "Process manually paused for data verification"
    },
    {
      timestamp: "16 May, 10:15 AM",
      processId: "PNL-1003",
      processName: "FX Options Daily PnL",
      region: "Americas",
      event: "Process Resumed",
      user: "Michael Chen",
      details: "Process manually resumed after data verification"
    },
    {
      timestamp: "16 May, 10:30 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Process Completed",
      user: "System",
      details: "All stages completed successfully"
    },
    {
      timestamp: "16 May, 10:35 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Process Completed",
      user: "System",
      details: "All stages completed successfully"
    }
  ];
  
  // Events for yesterday (the failure day)
  const yesterdayEvents = [
    {
      timestamp: "15 May, 09:00 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Process Started",
      user: "System",
      details: "Daily scheduled execution initiated"
    },
    {
      timestamp: "15 May, 09:00 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Process Started",
      user: "System",
      details: "Daily scheduled execution initiated"
    },
    {
      timestamp: "15 May, 09:05 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Data Collection stage completed successfully"
    },
    {
      timestamp: "15 May, 09:07 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Data Collection stage completed successfully"
    },
    {
      timestamp: "15 May, 09:15 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Validation stage completed successfully"
    },
    {
      timestamp: "15 May, 09:18 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Stage Completed",
      user: "System",
      details: "Validation stage completed successfully"
    },
    {
      timestamp: "15 May, 09:32 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Process Failed",
      user: "System",
      details: "Substantiation stage failed due to database connection error"
    },
    {
      timestamp: "15 May, 09:32 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Process Failed",
      user: "System",
      details: "Substantiation stage failed due to database connection error"
    },
    {
      timestamp: "15 May, 09:32 AM",
      processId: "SYSTEM",
      processName: "System Alert",
      region: "Global",
      event: "Critical Failure",
      user: "System",
      details: "Database connection failure affecting all PnL processes"
    },
    {
      timestamp: "15 May, 09:35 AM",
      processId: "SYSTEM",
      processName: "System Alert",
      region: "Global",
      event: "Incident Created",
      user: "John Smith",
      details: "Critical incident created for global PnL process failure"
    },
    {
      timestamp: "15 May, 10:15 AM",
      processId: "SYSTEM",
      processName: "System Alert",
      region: "Global",
      event: "Network Restored",
      user: "Network Team",
      details: "Network connectivity restored between application servers and database"
    },
    {
      timestamp: "15 May, 10:20 AM",
      processId: "SYSTEM",
      processName: "System Alert",
      region: "Global",
      event: "Database Failover",
      user: "Database Team",
      details: "Database failover to secondary cluster completed"
    },
    {
      timestamp: "15 May, 10:30 AM",
      processId: "SYSTEM",
      processName: "System Alert",
      region: "Global",
      event: "Bulk Recovery Initiated",
      user: "John Smith",
      details: "Bulk recovery initiated for all failed PnL processes"
    },
    {
      timestamp: "15 May, 10:35 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Process Restarted",
      user: "System",
      details: "Process restarted from Substantiation stage checkpoint"
    },
    {
      timestamp: "15 May, 10:35 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Process Restarted",
      user: "System",
      details: "Process restarted from Substantiation stage checkpoint"
    },
    {
      timestamp: "15 May, 11:30 AM",
      processId: "PNL-1001",
      processName: "Equities Daily PnL",
      region: "Americas",
      event: "Process Completed",
      user: "System",
      details: "All stages completed successfully after recovery"
    },
    {
      timestamp: "15 May, 11:35 AM",
      processId: "PNL-1002",
      processName: "Fixed Income Daily PnL",
      region: "Americas",
      event: "Process Completed",
      user: "System",
      details: "All stages completed successfully after recovery"
    },
    {
      timestamp: "15 May, 12:00 PM",
      processId: "SYSTEM",
      processName: "System Alert",
      region: "Global",
      event: "SLA Extension",
      user: "Sarah Johnson",
      details: "EOD deadline extended to 21:00 EST to accommodate recovery"
    },
    {
      timestamp: "15 May, 14:30 PM",
      processId: "SYSTEM",
      processName: "System Alert",
      region: "Global",
      event: "Recovery Completed",
      user: "System",
      details: "All PnL processes recovered and completed successfully"
    }
  ];
  
  // Select events based on date range
  let events = [];
  if (dateRange === "today") {
    events = todayEvents;
  } else if (dateRange === "yesterday") {
    events = yesterdayEvents;
  } else if (dateRange === "week") {
    events = [...todayEvents, ...yesterdayEvents];
    // Add more events for the week if needed
  } else if (dateRange === "month") {
    events = [...todayEvents, ...yesterdayEvents];
    // Add more events for the month if needed
  }
  
  // Filter events based on event type
  if (eventType !== "all") {
    if (eventType === "start") {
      events = events.filter(event => event.event.includes("Started"));
    } else if (eventType === "complete") {
      events = events.filter(event => event.event.includes("Completed"));
    } else if (eventType === "fail") {
      events = events.filter(event => event.event.includes("Failed") || event.event.includes("Critical"));
    } else if (eventType === "recover") {
      events = events.filter(event => 
        event.event.includes("Recovered") || 
        event.event.includes("Restarted") || 
        event.event.includes("Recovery")
      );
    } else if (eventType === "manual") {
      events = events.filter(event => event.user !== "System");
    }
  }
  
  return events;
}