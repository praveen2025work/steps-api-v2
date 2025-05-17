import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Users, 
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Plus,
  Search,
  Edit,
  Eye,
  Calendar,
  Briefcase,
  RefreshCw,
  Loader2
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Sample applications data
const applications = [
  { id: "APP-001", name: "eRates" },
  { id: "APP-002", name: "PnL System" },
  { id: "APP-003", name: "Risk Analytics" },
  { id: "APP-004", name: "Trade Capture" },
  { id: "APP-005", name: "Settlements" }
];

// Sample process issues data with added fields
const initialProcessIssues = [
  {
    id: 1,
    processId: 1001,
    title: "PnL calculation failure for APAC region",
    team: "PnL Team",
    reportedBy: "Sarah Chen",
    assignedTo: "Michael Johnson",
    estimatedFixTime: "2h 30m",
    businessDate: "2025-05-16",
    status: "In Progress",
    priority: "Critical",
    createdAt: "Today, 09:15 AM",
    application: "PnL System",
    createdOn: "2025-05-16T09:15:00Z",
    updatedOn: "2025-05-16T10:30:00Z",
    description: "PnL calculation process failed during the aggregation step for APAC region. Error logs show timeout when connecting to market data service."
  },
  {
    id: 2,
    processId: 1042,
    title: "Rate feed interruption from external provider",
    team: "Rates Team",
    reportedBy: "James Wilson",
    assignedTo: "Emily Davis",
    estimatedFixTime: "4h 00m",
    businessDate: "2025-05-16",
    status: "Pending",
    priority: "High",
    createdAt: "Today, 10:22 AM",
    application: "eRates",
    createdOn: "2025-05-16T10:22:00Z",
    updatedOn: "2025-05-16T11:15:00Z",
    description: "External rate provider feed is experiencing interruptions. Affecting all downstream systems that depend on real-time rates."
  },
  {
    id: 3,
    processId: 985,
    title: "FX position reconciliation mismatch",
    team: "FX Team",
    reportedBy: "Alex Wong",
    assignedTo: null,
    estimatedFixTime: null,
    businessDate: "2025-05-16",
    status: "Pending",
    priority: "High",
    createdAt: "Today, 11:05 AM",
    application: "Trade Capture",
    createdOn: "2025-05-16T11:05:00Z",
    updatedOn: "2025-05-16T11:05:00Z",
    description: "FX position reconciliation showing mismatches between front office and back office systems. Discrepancies found in Asian currency pairs."
  },
  {
    id: 4,
    processId: 1078,
    title: "EOD batch process timeout",
    team: "Operations",
    reportedBy: "Olivia Martinez",
    assignedTo: "David Kim",
    estimatedFixTime: "1h 15m",
    businessDate: "2025-05-15",
    status: "Resolved",
    priority: "Medium",
    createdAt: "Yesterday, 16:48 PM",
    application: "Settlements",
    createdOn: "2025-05-15T16:48:00Z",
    updatedOn: "2025-05-15T18:30:00Z",
    description: "End of day batch process timed out during the settlement confirmation step. Affected approximately 120 trades."
  },
  {
    id: 5,
    processId: 1103,
    title: "Data validation error in risk calculations",
    team: "Risk Team",
    reportedBy: "Thomas Lee",
    assignedTo: "Sophia Wang",
    estimatedFixTime: "3h 45m",
    businessDate: "2025-05-15",
    status: "In Progress",
    priority: "Medium",
    createdAt: "Yesterday, 14:30 PM",
    application: "Risk Analytics",
    createdOn: "2025-05-15T14:30:00Z",
    updatedOn: "2025-05-16T09:45:00Z",
    description: "Risk calculation engine reporting validation errors for structured products. Input data format appears to be inconsistent."
  },
  {
    id: 6,
    processId: 972,
    title: "API connection failure to market data service",
    team: "Technical Support",
    reportedBy: "Ryan Garcia",
    assignedTo: "Aisha Patel",
    estimatedFixTime: "0h 45m",
    businessDate: "2025-05-15",
    status: "Resolved",
    priority: "High",
    createdAt: "Yesterday, 09:12 AM",
    application: "Risk Analytics",
    createdOn: "2025-05-15T09:12:00Z",
    updatedOn: "2025-05-15T10:05:00Z",
    description: "API connection to market data service failing with timeout errors. Affecting risk calculations and pricing models."
  },
  {
    id: 7,
    processId: 1056,
    title: "Compliance check failure for new trades",
    team: "Compliance",
    reportedBy: "Emma Thompson",
    assignedTo: null,
    estimatedFixTime: null,
    businessDate: "2025-05-14",
    status: "Failed",
    priority: "Critical",
    createdAt: "2 days ago, 15:20 PM",
    application: "Trade Capture",
    createdOn: "2025-05-14T15:20:00Z",
    updatedOn: "2025-05-14T17:45:00Z",
    description: "Automated compliance checks failing for newly entered trades. Regulatory reporting at risk of being delayed."
  },
  {
    id: 8,
    processId: 1089,
    title: "Database performance degradation",
    team: "Technical Support",
    reportedBy: "Daniel Brown",
    assignedTo: "Lisa Chen",
    estimatedFixTime: "5h 00m",
    businessDate: "2025-05-14",
    status: "In Progress",
    priority: "Critical",
    createdAt: "2 days ago, 11:35 AM",
    application: "PnL System",
    createdOn: "2025-05-14T11:35:00Z",
    updatedOn: "2025-05-16T08:20:00Z",
    description: "Database performance has degraded significantly. Queries taking 3x longer than normal. Affecting all downstream processes."
  }
];

// Team workload data
const teamWorkload = [
  {
    name: "PnL Team",
    issueCount: 5,
    capacity: 85,
    criticalCount: 2,
    resolvedToday: 1
  },
  {
    name: "Rates Team",
    issueCount: 3,
    capacity: 65,
    criticalCount: 0,
    resolvedToday: 2
  },
  {
    name: "FX Team",
    issueCount: 4,
    capacity: 70,
    criticalCount: 1,
    resolvedToday: 0
  },
  {
    name: "Technical Support",
    issueCount: 8,
    capacity: 95,
    criticalCount: 3,
    resolvedToday: 2
  },
  {
    name: "Operations",
    issueCount: 6,
    capacity: 75,
    criticalCount: 1,
    resolvedToday: 3
  }
];

export function SupportDashboard() {
  const [issueFilter, setIssueFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [processIssues, setProcessIssues] = useState(initialProcessIssues);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New issue template
  const [newIssue, setNewIssue] = useState({
    processId: "",
    title: "",
    team: "",
    priority: "",
    application: "",
    businessDate: new Date().toISOString().split('T')[0],
    estimatedFixTime: "",
    description: ""
  });
  
  // Additional filters
  const [filters, setFilters] = useState({
    application: "",
    businessDate: "",
    team: "",
    status: ""
  });
  
  // Filter issues based on the selected filter, search query, and additional filters
  const filteredIssues = processIssues.filter(issue => {
    // Basic filter (priority/status)
    const matchesBasicFilter = 
      issueFilter === "all" || 
      (issueFilter === "critical" && issue.priority === "Critical") ||
      (issueFilter === "high" && issue.priority === "High") ||
      (issueFilter === "pending" && issue.status === "Pending");
    
    // Search query
    const matchesSearch = 
      searchQuery === "" ||
      issue.processId.toString().includes(searchQuery) ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.assignedTo && issue.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Additional filters
    const matchesApplication = !filters.application || issue.application === filters.application;
    const matchesBusinessDate = !filters.businessDate || issue.businessDate === filters.businessDate;
    const matchesTeam = !filters.team || issue.team === filters.team;
    const matchesStatus = !filters.status || issue.status === filters.status;
    
    return matchesBasicFilter && matchesSearch && matchesApplication && matchesBusinessDate && matchesTeam && matchesStatus;
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Handle creating a new issue
  const handleCreateIssue = () => {
    setIsSubmitting(true);
    
    // Validate required fields
    if (!newIssue.processId || !newIssue.title || !newIssue.team || !newIssue.priority || !newIssue.application) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
    
    setTimeout(() => {
      const now = new Date().toISOString();
      const newId = processIssues.length + 9;
      
      const createdIssue = {
        id: newId,
        processId: parseInt(newIssue.processId),
        title: newIssue.title,
        team: newIssue.team,
        reportedBy: "Current User", // In a real app, this would be the logged-in user
        assignedTo: null,
        estimatedFixTime: newIssue.estimatedFixTime || null,
        businessDate: newIssue.businessDate,
        status: "Open",
        priority: newIssue.priority,
        createdAt: "Just now",
        application: newIssue.application,
        createdOn: now,
        updatedOn: now,
        description: newIssue.description
      };
      
      setProcessIssues([createdIssue, ...processIssues]);
      
      // Reset form
      setNewIssue({
        processId: "",
        title: "",
        team: "",
        priority: "",
        application: "",
        businessDate: new Date().toISOString().split('T')[0],
        estimatedFixTime: "",
        description: ""
      });
      
      setIsCreateDialogOpen(false);
      setIsSubmitting(false);
      toast.success("Issue created successfully");
    }, 800); // Simulate network delay
  };
  
  // Handle updating an issue
  const handleUpdateIssue = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const now = new Date().toISOString();
      
      const updatedIssues = processIssues.map(issue => 
        issue.id === selectedIssue.id 
          ? { ...selectedIssue, updatedOn: now } 
          : issue
      );
      
      setProcessIssues(updatedIssues);
      setIsEditDialogOpen(false);
      setIsSubmitting(false);
      toast.success("Issue updated successfully");
    }, 800); // Simulate network delay
  };
  
  // Handle closing an issue
  const handleCloseIssue = (id) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const now = new Date().toISOString();
      
      const updatedIssues = processIssues.map(issue => 
        issue.id === id 
          ? { ...issue, status: "Resolved", updatedOn: now } 
          : issue
      );
      
      setProcessIssues(updatedIssues);
      setIsSubmitting(false);
      toast.success("Issue marked as resolved");
      
      // Close the view dialog if it's open
      if (isViewDialogOpen && selectedIssue && selectedIssue.id === id) {
        setIsViewDialogOpen(false);
      }
    }, 600); // Simulate network delay
  };
  
  // Handle assigning an issue to self
  const handleAssignToSelf = (id) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const now = new Date().toISOString();
      
      const updatedIssues = processIssues.map(issue => 
        issue.id === id 
          ? { ...issue, assignedTo: "Current User", status: "In Progress", updatedOn: now } 
          : issue
      );
      
      setProcessIssues(updatedIssues);
      setIsSubmitting(false);
      toast.success("Issue assigned to you");
      
      // Update the selected issue if it's currently being viewed
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue({ ...selectedIssue, assignedTo: "Current User", status: "In Progress", updatedOn: now });
      }
    }, 600); // Simulate network delay
  };
  
  // Get counts for metrics
  const openIssuesCount = processIssues.filter(i => i.status === "Open").length;
  const inProgressCount = processIssues.filter(i => i.status === "In Progress").length;
  const resolvedTodayCount = processIssues.filter(i => {
    const today = new Date().toISOString().split('T')[0];
    return i.status === "Resolved" && i.updatedOn.includes(today);
  }).length;
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Open Issues" 
          value={openIssuesCount.toString()} 
          description={`${processIssues.filter(i => i.status === "Open" && i.priority === "Critical").length} critical`} 
          trend="+3% from yesterday"
          trendDirection="up"
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <MetricCard 
          title="In Progress" 
          value={inProgressCount.toString()} 
          description="Being worked on" 
          trend="+1 from yesterday"
          trendDirection="up"
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard 
          title="Resolved Today" 
          value={resolvedTodayCount.toString()} 
          description="Fixed issues" 
          trend="+2 from yesterday"
          trendDirection="up"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard 
          title="Avg. Resolution Time" 
          value="3h 45m" 
          description="Target: 4h" 
          trend="-15m from last week"
          trendDirection="down"
          icon={<RefreshCw className="h-5 w-5" />}
        />
      </div>

      {/* Issues Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Process Issues</CardTitle>
              <CardDescription>Application processing issues at process level</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search issues..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Basic filter dropdown */}
              <Select value={issueFilter} onValueChange={setIssueFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter issues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Advanced filters popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 relative">
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Advanced Filters</h4>
                      <p className="text-sm text-muted-foreground">
                        Filter issues by specific criteria
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="application" className="text-right text-sm">
                          Application
                        </label>
                        <Select 
                          value={filters.application} 
                          onValueChange={(value) => setFilters({...filters, application: value})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="All Applications" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Applications</SelectItem>
                            {applications.map(app => (
                              <SelectItem key={app.id} value={app.name}>{app.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="business-date" className="text-right text-sm">
                          Business Date
                        </label>
                        <Input
                          id="business-date"
                          type="date"
                          className="col-span-3"
                          value={filters.businessDate}
                          onChange={(e) => setFilters({...filters, businessDate: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="team" className="text-right text-sm">
                          Team
                        </label>
                        <Select 
                          value={filters.team} 
                          onValueChange={(value) => setFilters({...filters, team: value})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="All Teams" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Teams</SelectItem>
                            {teamWorkload.map(team => (
                              <SelectItem key={team.name} value={team.name}>{team.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right text-sm">
                          Status
                        </label>
                        <Select 
                          value={filters.status} 
                          onValueChange={(value) => setFilters({...filters, status: value})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Statuses</SelectItem>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setFilters({
                        application: "",
                        businessDate: "",
                        team: "",
                        status: ""
                      })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Create new issue button */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    New Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Report New Process Issue</DialogTitle>
                    <DialogDescription>
                      Create a new issue for application processing problems.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="processId" className="text-right text-sm">
                        Process ID *
                      </label>
                      <Input 
                        id="processId" 
                        className="col-span-3" 
                        placeholder="Enter process ID" 
                        value={newIssue.processId}
                        onChange={(e) => setNewIssue({...newIssue, processId: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="title" className="text-right text-sm">
                        Issue Title *
                      </label>
                      <Input 
                        id="title" 
                        className="col-span-3" 
                        placeholder="Brief description of the issue" 
                        value={newIssue.title}
                        onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="application" className="text-right text-sm">
                        Application *
                      </label>
                      <Select
                        value={newIssue.application}
                        onValueChange={(value) => setNewIssue({...newIssue, application: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select application" />
                        </SelectTrigger>
                        <SelectContent>
                          {applications.map(app => (
                            <SelectItem key={app.id} value={app.name}>{app.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="team" className="text-right text-sm">
                        Team *
                      </label>
                      <Select
                        value={newIssue.team}
                        onValueChange={(value) => setNewIssue({...newIssue, team: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamWorkload.map(team => (
                            <SelectItem key={team.name} value={team.name}>{team.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="priority" className="text-right text-sm">
                        Priority *
                      </label>
                      <Select
                        value={newIssue.priority}
                        onValueChange={(value) => setNewIssue({...newIssue, priority: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="businessDate" className="text-right text-sm">
                        Business Date *
                      </label>
                      <Input 
                        id="businessDate" 
                        className="col-span-3" 
                        type="date" 
                        value={newIssue.businessDate}
                        onChange={(e) => setNewIssue({...newIssue, businessDate: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="estimatedFixTime" className="text-right text-sm">
                        Est. Fix Time
                      </label>
                      <Input 
                        id="estimatedFixTime" 
                        className="col-span-3" 
                        placeholder="e.g. 2h 30m" 
                        value={newIssue.estimatedFixTime}
                        onChange={(e) => setNewIssue({...newIssue, estimatedFixTime: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="description" className="text-right text-sm">
                        Description
                      </label>
                      <Textarea 
                        id="description" 
                        className="col-span-3 min-h-[100px]"
                        placeholder="Detailed description of the issue"
                        value={newIssue.description}
                        onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleCreateIssue} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Submit Issue"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[100px]">Process ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Working On</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Business Date</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Updated On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center">
                      No issues found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">#{issue.id}</TableCell>
                      <TableCell>{issue.processId}</TableCell>
                      <TableCell>
                        <div className="font-medium max-w-[200px] truncate" title={issue.title}>{issue.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {issue.createdAt}
                        </div>
                      </TableCell>
                      <TableCell>{issue.application}</TableCell>
                      <TableCell>{issue.team}</TableCell>
                      <TableCell>
                        {issue.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{issue.assignedTo.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{issue.assignedTo}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          issue.priority === "Critical" ? "destructive" : 
                          issue.priority === "High" ? "default" : 
                          "secondary"
                        }>
                          {issue.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={issue.status} priority={issue.priority} />
                      </TableCell>
                      <TableCell>{issue.businessDate}</TableCell>
                      <TableCell className="text-xs">{formatDate(issue.createdOn)}</TableCell>
                      <TableCell className="text-xs">{formatDate(issue.updatedOn)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => {
                              setSelectedIssue(issue);
                              setIsViewDialogOpen(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => {
                              setSelectedIssue(issue);
                              setIsEditDialogOpen(true);
                            }}
                            title="Edit Issue"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {issue.status !== "Resolved" && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-500" 
                              onClick={() => handleCloseIssue(issue.id)}
                              disabled={isSubmitting}
                              title="Resolve Issue"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {(issue.status === "Open" || issue.assignedTo === null) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-500" 
                              onClick={() => handleAssignToSelf(issue.id)}
                              disabled={isSubmitting}
                              title="Assign to Me"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredIssues.length} of {processIssues.length} issues
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" onClick={() => setFilters({
                application: "",
                businessDate: "",
                team: "",
                status: ""
              })}>
                Clear Filters
              </Button>
            )}
            <Button variant="outline">Export Issues</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Team Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Workload</CardTitle>
            <CardDescription>Current issue distribution by team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {teamWorkload.map((team) => (
                <div key={team.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{team.name}</span>
                      <Badge variant="outline">{team.issueCount} issues</Badge>
                    </div>
                    <span className="text-sm">{team.capacity}% capacity</span>
                  </div>
                  <Progress value={team.capacity} className={`h-2 ${team.capacity > 90 ? 'bg-red-100' : ''}`} indicatorClassName={team.capacity > 90 ? 'bg-red-500' : undefined} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{team.criticalCount} critical</span>
                    <span>{team.resolvedToday} resolved today</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Issues by application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {applications.map((app) => {
                const appIssues = processIssues.filter(issue => issue.application === app.name);
                const openCount = appIssues.filter(i => i.status === "Open").length;
                const inProgressCount = appIssues.filter(i => i.status === "In Progress").length;
                const pendingCount = appIssues.filter(i => i.status === "Pending").length;
                const resolvedCount = appIssues.filter(i => i.status === "Resolved").length;
                const totalActive = openCount + inProgressCount + pendingCount;
                const totalIssues = totalActive + resolvedCount;
                
                return (
                  <div key={app.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{app.name}</span>
                        <Badge variant="outline">{totalIssues} total</Badge>
                      </div>
                      <span className="text-sm">{totalActive} active</span>
                    </div>
                    <Progress 
                      value={totalIssues > 0 ? (resolvedCount / totalIssues) * 100 : 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span>{openCount} open</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        <span>{inProgressCount} in progress</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span>{resolvedCount} resolved</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Issue Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Issue #{selectedIssue?.id}</DialogTitle>
            <DialogDescription>
              Update the details for this process issue.
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-title" className="text-right text-sm">
                  Issue Title
                </label>
                <Input 
                  id="edit-title" 
                  className="col-span-3" 
                  value={selectedIssue.title}
                  onChange={(e) => setSelectedIssue({...selectedIssue, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-application" className="text-right text-sm">
                  Application
                </label>
                <Select
                  value={selectedIssue.application}
                  onValueChange={(value) => setSelectedIssue({...selectedIssue, application: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map(app => (
                      <SelectItem key={app.id} value={app.name}>{app.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-team" className="text-right text-sm">
                  Team
                </label>
                <Select
                  value={selectedIssue.team}
                  onValueChange={(value) => setSelectedIssue({...selectedIssue, team: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamWorkload.map(team => (
                      <SelectItem key={team.name} value={team.name}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-priority" className="text-right text-sm">
                  Priority
                </label>
                <Select
                  value={selectedIssue.priority}
                  onValueChange={(value) => setSelectedIssue({...selectedIssue, priority: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-status" className="text-right text-sm">
                  Status
                </label>
                <Select
                  value={selectedIssue.status}
                  onValueChange={(value) => setSelectedIssue({...selectedIssue, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-assigned" className="text-right text-sm">
                  Assigned To
                </label>
                <Input 
                  id="edit-assigned" 
                  className="col-span-3" 
                  value={selectedIssue.assignedTo || ""}
                  onChange={(e) => setSelectedIssue({...selectedIssue, assignedTo: e.target.value || null})}
                  placeholder="Unassigned"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-business-date" className="text-right text-sm">
                  Business Date
                </label>
                <Input 
                  id="edit-business-date" 
                  type="date" 
                  className="col-span-3" 
                  value={selectedIssue.businessDate}
                  onChange={(e) => setSelectedIssue({...selectedIssue, businessDate: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-fix-time" className="text-right text-sm">
                  Est. Fix Time
                </label>
                <Input 
                  id="edit-fix-time" 
                  className="col-span-3" 
                  value={selectedIssue.estimatedFixTime || ""}
                  onChange={(e) => setSelectedIssue({...selectedIssue, estimatedFixTime: e.target.value || null})}
                  placeholder="e.g. 2h 30m"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-description" className="text-right text-sm">
                  Description
                </label>
                <Textarea 
                  id="edit-description" 
                  className="col-span-3 min-h-[100px]" 
                  value={selectedIssue.description || ""}
                  onChange={(e) => setSelectedIssue({...selectedIssue, description: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleUpdateIssue} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Issue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Issue Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Issue #{selectedIssue?.id}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-1">
                {selectedIssue && (
                  <>
                    <Badge variant={
                      selectedIssue.priority === "Critical" ? "destructive" : 
                      selectedIssue.priority === "High" ? "default" : 
                      "secondary"
                    }>
                      {selectedIssue.priority}
                    </Badge>
                    <StatusBadge status={selectedIssue.status} priority={selectedIssue.priority} />
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedIssue.title}</h3>
                <p className="text-sm text-muted-foreground">Process ID: {selectedIssue.processId}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Application</p>
                  <p>{selectedIssue.application}</p>
                </div>
                <div>
                  <p className="font-medium">Team</p>
                  <p>{selectedIssue.team}</p>
                </div>
                <div>
                  <p className="font-medium">Business Date</p>
                  <p>{selectedIssue.businessDate}</p>
                </div>
                <div>
                  <p className="font-medium">Est. Fix Time</p>
                  <p>{selectedIssue.estimatedFixTime || "Not estimated"}</p>
                </div>
                <div>
                  <p className="font-medium">Reported By</p>
                  <p>{selectedIssue.reportedBy}</p>
                </div>
                <div>
                  <p className="font-medium">Assigned To</p>
                  <p>{selectedIssue.assignedTo || "Unassigned"}</p>
                </div>
                <div>
                  <p className="font-medium">Created On</p>
                  <p>{formatDate(selectedIssue.createdOn)}</p>
                </div>
                <div>
                  <p className="font-medium">Updated On</p>
                  <p>{formatDate(selectedIssue.updatedOn)}</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium">Description</p>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedIssue.description || "No description provided."}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {selectedIssue.status !== "Resolved" && (
                  <Button 
                    variant="outline" 
                    className="text-green-600" 
                    onClick={() => handleCloseIssue(selectedIssue.id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Resolve
                  </Button>
                )}
                {(selectedIssue.status === "Open" || selectedIssue.assignedTo === null) && (
                  <Button 
                    onClick={() => handleAssignToSelf(selectedIssue.id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4 mr-2" />
                    )}
                    Assign to Me
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ title, value, description, trend, trendDirection, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="flex items-center mt-2 text-xs">
          {trendDirection === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
          )}
          <span className={trendDirection === "up" ? "text-red-500" : "text-green-500"}>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, priority }) {
  switch (status) {
    case "In Progress":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "Resolved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant={priority === "Critical" ? "destructive" : "outline"} className={priority !== "Critical" ? "bg-red-50 text-red-700 border-red-200" : ""}>
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Open
        </Badge>
      );
  }
}