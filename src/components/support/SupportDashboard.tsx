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
  Search
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export function SupportDashboard() {
  const [issueFilter, setIssueFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Filter issues based on the selected filter and search query
  const filteredIssues = processIssues.filter(issue => {
    const matchesFilter = 
      issueFilter === "all" || 
      (issueFilter === "critical" && issue.priority === "Critical") ||
      (issueFilter === "high" && issue.priority === "High") ||
      (issueFilter === "pending" && issue.status === "Pending");
    
    const matchesSearch = 
      searchQuery === "" ||
      issue.processId.toString().includes(searchQuery) ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Open Issues" 
          value="28" 
          description="6 critical" 
          trend="+3% from yesterday"
          trendDirection="up"
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <MetricCard 
          title="Avg. Resolution Time" 
          value="4h 12m" 
          description="Target: 6h" 
          trend="-8% from last week"
          trendDirection="down"
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard 
          title="Fix Rate" 
          value="92%" 
          description="Target: 95%" 
          trend="+1% from last week"
          trendDirection="up"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard 
          title="Team Capacity" 
          value="78%" 
          description="9/12 teams available" 
          trend="-3% from yesterday"
          trendDirection="down"
          icon={<Users className="h-5 w-5" />}
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
                        Process ID
                      </label>
                      <Input id="processId" className="col-span-3" placeholder="Enter process ID" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="title" className="text-right text-sm">
                        Issue Title
                      </label>
                      <Input id="title" className="col-span-3" placeholder="Brief description of the issue" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="team" className="text-right text-sm">
                        Team
                      </label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pnl">PnL Team</SelectItem>
                          <SelectItem value="rates">Rates Team</SelectItem>
                          <SelectItem value="fx">FX Team</SelectItem>
                          <SelectItem value="tech">Technical Support</SelectItem>
                          <SelectItem value="ops">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="priority" className="text-right text-sm">
                        Priority
                      </label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="businessDate" className="text-right text-sm">
                        Business Date
                      </label>
                      <Input id="businessDate" className="col-span-3" type="date" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="description" className="text-right text-sm">
                        Description
                      </label>
                      <textarea 
                        id="description" 
                        className="col-span-3 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Detailed description of the issue"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsCreateDialogOpen(false)}>Submit Issue</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Process ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Working On</TableHead>
                  <TableHead>Fix Time</TableHead>
                  <TableHead>Business Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No issues found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.processId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{issue.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {issue.createdAt}
                        </div>
                      </TableCell>
                      <TableCell>{issue.team}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{issue.reportedBy.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{issue.reportedBy}</span>
                        </div>
                      </TableCell>
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
                        {issue.estimatedFixTime ? (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{issue.estimatedFixTime}</span>
                          </div>
                        ) : (
                          "TBD"
                        )}
                      </TableCell>
                      <TableCell>{issue.businessDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={issue.status} priority={issue.priority} />
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
          <Button variant="outline">View All Issues</Button>
        </CardFooter>
      </Card>

      {/* Team Workload */}
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
                <Progress value={team.capacity} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{team.criticalCount} critical</span>
                  <span>{team.resolvedToday} resolved today</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
      return <Badge variant="outline">{status}</Badge>;
  }
}

// Sample process issues data
const processIssues = [
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
    createdAt: "Today, 09:15 AM"
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
    createdAt: "Today, 10:22 AM"
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
    createdAt: "Today, 11:05 AM"
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
    createdAt: "Yesterday, 16:48 PM"
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
    createdAt: "Yesterday, 14:30 PM"
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
    createdAt: "Yesterday, 09:12 AM"
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
    createdAt: "2 days ago, 15:20 PM"
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
    createdAt: "2 days ago, 11:35 AM"
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