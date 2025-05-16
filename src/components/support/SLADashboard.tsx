import { useState } from "react";
import Image from "next/image";
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
  ArrowDownRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SLABreakdownTable } from "./SLABreakdownTable";

export function SLADashboard() {
  const [timeRange, setTimeRange] = useState("week");
  
  return (
    <div className="space-y-6">
      {/* SLA Dashboard Header with Reference Image */}
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
            <Image 
              src="https://assets.co.dev/19129c8d-1c91-4384-9bc0-e0d1fdc82154/img_7407-e604730.heic"
              alt="SLA Dashboard Overview"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">SLA Management Dashboard</h2>
                <p className="max-w-md">Track and analyze service level agreement performance metrics</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[400px]">
          <TabsList className="grid grid-cols-4">
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
          title="Overall SLA" 
          value="94.2%" 
          target="95%" 
          status="warning"
          trend="+1.5% from last period"
          trendDirection="up"
        />
        <SLAMetricCard 
          title="First Response" 
          value="97.8%" 
          target="95%" 
          status="success"
          trend="+2.3% from last period"
          trendDirection="up"
        />
        <SLAMetricCard 
          title="Resolution Time" 
          value="92.1%" 
          target="95%" 
          status="warning"
          trend="-0.7% from last period"
          trendDirection="down"
        />
        <SLAMetricCard 
          title="Customer Satisfaction" 
          value="4.7/5" 
          target="4.5/5" 
          status="success"
          trend="+0.2 from last period"
          trendDirection="up"
        />
      </div>

      {/* SLA Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average response times by priority</CardDescription>
            </div>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <div className="text-center p-6">
                <LineChart className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Response time chart visualization would appear here</p>
                <p className="text-xs text-muted-foreground mt-2">Showing declining response times across all priorities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>SLA Compliance by Category</CardTitle>
              <CardDescription>Performance across different ticket types</CardDescription>
            </div>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <div className="text-center p-6">
                <PieChart className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">SLA compliance by category chart would appear here</p>
                <p className="text-xs text-muted-foreground mt-2">Technical issues at 97%, Billing at 92%, Account at 95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Breakdown by Team</CardTitle>
          <CardDescription>Detailed performance metrics for each support team</CardDescription>
        </CardHeader>
        <CardContent>
          <SLABreakdownTable />
        </CardContent>
      </Card>

      {/* SLA At Risk */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 mr-2" />
            SLA Violations & At-Risk Tickets
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            Tickets requiring immediate attention to prevent or address SLA breaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slaAtRiskData.map((item, index) => (
              <SLAAtRiskItem key={index} {...item} />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50">
            View All At-Risk Tickets
          </Button>
        </CardFooter>
      </Card>
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

function SLAAtRiskItem({ id, customer, priority, timeRemaining, progress }) {
  return (
    <div className="border border-red-200 rounded-md p-4 dark:border-red-800/50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium flex items-center">
            #{id} - {customer}
            <Badge variant="outline" className="ml-2 border-red-500 text-red-500 text-xs">
              {priority}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-red-600 dark:text-red-400 mt-1">
            <Clock className="h-3 w-3 mr-1" />
            {timeRemaining} remaining
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

const slaAtRiskData = [
  {
    id: "T-4291",
    customer: "Acme Corporation",
    priority: "Critical",
    timeRemaining: "1h 23m",
    progress: 85
  },
  {
    id: "T-4285",
    customer: "Global Industries",
    priority: "High",
    timeRemaining: "2h 05m",
    progress: 70
  },
  {
    id: "T-4278",
    customer: "Tech Solutions Inc",
    priority: "Medium",
    timeRemaining: "4h 30m",
    progress: 60
  }
];