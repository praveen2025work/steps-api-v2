import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  PieChart,
  LineChart,
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
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

export function SLADashboard() {
  const [timeRange, setTimeRange] = useState("week");
  const [processFilter, setProcessFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter SLA data based on the selected filter and search query
  const filteredSLAData = processSLAData.filter(process => {
    const matchesFilter = 
      processFilter === "all" || 
      (processFilter === "breached" && process.status === "breached") ||
      (processFilter === "at-risk" && process.status === "at-risk") ||
      (processFilter === "compliant" && process.status === "compliant");
    
    const matchesSearch = 
      searchQuery === "" ||
      process.processId.toString().includes(searchQuery) ||
      process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      process.team.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">SLA Management</h2>
          <p className="text-muted-foreground">Track process SLAs and performance metrics</p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full sm:w-auto">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-4">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* SLA Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SLAMetricCard 
          title="Overall SLA Compliance" 
          value="92.5%" 
          target="95%" 
          status="warning"
          trend="+1.2% from last period"
          trendDirection="up"
        />
        <SLAMetricCard 
          title="Process Completion" 
          value="96.3%" 
          target="98%" 
          status="warning"
          trend="-0.8% from last period"
          trendDirection="down"
        />
        <SLAMetricCard 
          title="Avg. Process Time" 
          value="3h 45m" 
          target="4h" 
          status="success"
          trend="-15m from last period"
          trendDirection="down"
        />
        <SLAMetricCard 
          title="Critical Process SLA" 
          value="89.7%" 
          target="99%" 
          status="danger"
          trend="-2.3% from last period"
          trendDirection="down"
        />
      </div>

      {/* Process SLA Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Process SLA Status</CardTitle>
              <CardDescription>SLA compliance for business processes</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search processes..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={processFilter} onValueChange={setProcessFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Processes</SelectItem>
                  <SelectItem value="breached">SLA Breached</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Process ID</TableHead>
                  <TableHead>Process Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Business Date</TableHead>
                  <TableHead>Target Time</TableHead>
                  <TableHead>Actual Time</TableHead>
                  <TableHead>SLA Status</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSLAData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No processes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSLAData.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{process.processId}</TableCell>
                      <TableCell>{process.name}</TableCell>
                      <TableCell>{process.team}</TableCell>
                      <TableCell>{process.businessDate}</TableCell>
                      <TableCell>{process.targetTime}</TableCell>
                      <TableCell>{process.actualTime || "In Progress"}</TableCell>
                      <TableCell>
                        <SLAStatusBadge status={process.status} timeRemaining={process.timeRemaining} />
                      </TableCell>
                      <TableCell>
                        <div className="w-[100px]">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{process.progress}%</span>
                          </div>
                          <Progress 
                            value={process.progress} 
                            className="h-2" 
                            indicatorClassName={getProgressColor(process.status)}
                          />
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
            Showing {filteredSLAData.length} of {processSLAData.length} processes
          </div>
          <Button variant="outline">Export SLA Report</Button>
        </CardFooter>
      </Card>

      {/* SLA Performance by Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SLA Performance by Team</CardTitle>
            <CardDescription>Team compliance with process SLAs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {teamSLAPerformance.map((team) => (
                <div key={team.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{team.name}</span>
                      <Badge variant={team.slaCompliance >= 95 ? "default" : "outline"} className={
                        team.slaCompliance >= 95 
                          ? "bg-green-500 hover:bg-green-500" 
                          : team.slaCompliance >= 90 
                            ? "border-amber-500 text-amber-500" 
                            : "border-red-500 text-red-500"
                      }>
                        {team.slaCompliance}%
                      </Badge>
                    </div>
                    <span className="text-sm">{team.processCount} processes</span>
                  </div>
                  <Progress 
                    value={team.slaCompliance} 
                    className="h-2" 
                    indicatorClassName={
                      team.slaCompliance >= 95 
                        ? "bg-green-500" 
                        : team.slaCompliance >= 90 
                          ? "bg-amber-500" 
                          : "bg-red-500"
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{team.breachedCount} breached</span>
                    <span>{team.atRiskCount} at risk</span>
                    <span>{team.compliantCount} compliant</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SLA At Risk */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 mr-2" />
              SLA Violations & At-Risk Processes
            </CardTitle>
            <CardDescription className="text-red-600/80 dark:text-red-400/80">
              Processes requiring immediate attention to prevent or address SLA breaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {slaAtRiskData.map((item) => (
                <SLAAtRiskItem key={item.processId} {...item} />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50">
              View All At-Risk Processes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function SLAMetricCard({ title, value, target, status, trend, trendDirection }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">Target: {target}</p>
          </div>
          <Badge variant={status === "success" ? "default" : "outline"} className={
            status === "success" 
              ? "bg-green-500 hover:bg-green-500" 
              : status === "warning" 
                ? "border-amber-500 text-amber-500" 
                : "border-red-500 text-red-500"
          }>
            {status === "success" ? "Meeting SLA" : status === "warning" ? "At Risk" : "Breached"}
          </Badge>
        </div>
        <div className="flex items-center mt-2 text-xs">
          {trendDirection === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={trendDirection === "up" ? "text-green-500" : "text-red-500"}>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SLAStatusBadge({ status, timeRemaining }) {
  if (status === "compliant") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Compliant
      </Badge>
    );
  } else if (status === "at-risk") {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <Clock className="h-3 w-3 mr-1" />
        {timeRemaining} left
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="h-3 w-3 mr-1" />
        SLA Breached
      </Badge>
    );
  }
}

function getProgressColor(status) {
  switch (status) {
    case "compliant": return "bg-green-500";
    case "at-risk": return "bg-amber-500";
    case "breached": return "bg-red-500";
    default: return "bg-blue-500";
  }
}

function SLAAtRiskItem({ processId, name, team, businessDate, timeRemaining, progress, status }) {
  return (
    <div className="border border-red-200 rounded-md p-4 dark:border-red-800/50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium flex items-center">
            #{processId} - {name}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {team} • {businessDate}
          </div>
          <div className="flex items-center text-sm text-red-600 dark:text-red-400 mt-1">
            <Clock className="h-3 w-3 mr-1" />
            {status === "breached" ? "SLA Breached" : `${timeRemaining} remaining`}
          </div>
        </div>
        <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50">
          Escalate
        </Button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>SLA Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-red-100 dark:bg-red-950/50" indicatorClassName="bg-red-500" />
      </div>
    </div>
  );
}

// Sample process SLA data
const processSLAData = [
  {
    id: 1,
    processId: 1001,
    name: "PnL Calculation - APAC",
    team: "PnL Team",
    businessDate: "2025-05-16",
    targetTime: "08:00 AM",
    actualTime: "08:45 AM",
    status: "breached",
    progress: 100,
    timeRemaining: "0h 00m"
  },
  {
    id: 2,
    processId: 1042,
    name: "Rate Feed Processing",
    team: "Rates Team",
    businessDate: "2025-05-16",
    targetTime: "09:30 AM",
    actualTime: null,
    status: "at-risk",
    progress: 75,
    timeRemaining: "0h 45m"
  },
  {
    id: 3,
    processId: 985,
    name: "FX Position Reconciliation",
    team: "FX Team",
    businessDate: "2025-05-16",
    targetTime: "10:00 AM",
    actualTime: null,
    status: "at-risk",
    progress: 60,
    timeRemaining: "1h 15m"
  },
  {
    id: 4,
    processId: 1078,
    name: "EOD Batch Process",
    team: "Operations",
    businessDate: "2025-05-15",
    targetTime: "18:00 PM",
    actualTime: "17:45 PM",
    status: "compliant",
    progress: 100,
    timeRemaining: "0h 00m"
  },
  {
    id: 5,
    processId: 1103,
    name: "Risk Calculations",
    team: "Risk Team",
    businessDate: "2025-05-15",
    targetTime: "14:00 PM",
    actualTime: "13:30 PM",
    status: "compliant",
    progress: 100,
    timeRemaining: "0h 00m"
  },
  {
    id: 6,
    processId: 972,
    name: "Market Data Service",
    team: "Technical Support",
    businessDate: "2025-05-15",
    targetTime: "07:30 AM",
    actualTime: "07:15 AM",
    status: "compliant",
    progress: 100,
    timeRemaining: "0h 00m"
  },
  {
    id: 7,
    processId: 1056,
    name: "Compliance Check",
    team: "Compliance",
    businessDate: "2025-05-14",
    targetTime: "11:00 AM",
    actualTime: "12:30 PM",
    status: "breached",
    progress: 100,
    timeRemaining: "0h 00m"
  },
  {
    id: 8,
    processId: 1089,
    name: "Database Performance Check",
    team: "Technical Support",
    businessDate: "2025-05-14",
    targetTime: "09:00 AM",
    actualTime: null,
    status: "at-risk",
    progress: 85,
    timeRemaining: "0h 30m"
  }
];

// Team SLA performance data
const teamSLAPerformance = [
  {
    name: "PnL Team",
    slaCompliance: 92,
    processCount: 12,
    breachedCount: 1,
    atRiskCount: 2,
    compliantCount: 9
  },
  {
    name: "Rates Team",
    slaCompliance: 95,
    processCount: 8,
    breachedCount: 0,
    atRiskCount: 1,
    compliantCount: 7
  },
  {
    name: "FX Team",
    slaCompliance: 90,
    processCount: 10,
    breachedCount: 1,
    atRiskCount: 1,
    compliantCount: 8
  },
  {
    name: "Technical Support",
    slaCompliance: 88,
    processCount: 15,
    breachedCount: 2,
    atRiskCount: 3,
    compliantCount: 10
  },
  {
    name: "Operations",
    slaCompliance: 97,
    processCount: 20,
    breachedCount: 0,
    atRiskCount: 1,
    compliantCount: 19
  }
];

// SLA at risk data
const slaAtRiskData = [
  {
    processId: 1001,
    name: "PnL Calculation - APAC",
    team: "PnL Team",
    businessDate: "2025-05-16",
    timeRemaining: "0h 00m",
    progress: 100,
    status: "breached"
  },
  {
    processId: 1042,
    name: "Rate Feed Processing",
    team: "Rates Team",
    businessDate: "2025-05-16",
    timeRemaining: "0h 45m",
    progress: 75,
    status: "at-risk"
  },
  {
    processId: 985,
    name: "FX Position Reconciliation",
    team: "FX Team",
    businessDate: "2025-05-16",
    timeRemaining: "1h 15m",
    progress: 60,
    status: "at-risk"
  }
];