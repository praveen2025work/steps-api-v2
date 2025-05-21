import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  ArrowDownRight,
  ArrowUpRight,
  BarChart,
  CheckCircle,
  Clock,
  Calendar,
  LineChart,
  PieChart,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { ProcessingTimeTrends } from "./ProcessingTimeTrends";
import { SEAComplianceByRegion } from "./SEAComplianceByRegion";
import { HistoricalSEAPerformance } from "./HistoricalSEAPerformance";

export function PnLSLADashboard() {
  const [timeRange, setTimeRange] = useState("week");
  const [selectedRegion, setSelectedRegion] = useState("all");
  
  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <BarChart className="h-4 w-4 text-muted-foreground" />
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
      </div>
      
      {/* SLA Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SLAMetricCard 
          title="Overall SLA Compliance" 
          value="94.2%" 
          target="95%" 
          status="warning"
          trend="+1.5% from last period"
          trendDirection="up"
        />
        <SLAMetricCard 
          title="Avg. Processing Time" 
          value="42 min" 
          target="60 min" 
          status="success"
          trend="-3 min from last period"
          trendDirection="down"
        />
        <SLAMetricCard 
          title="On-Time Completion" 
          value="92.1%" 
          target="95%" 
          status="warning"
          trend="-0.7% from last period"
          trendDirection="down"
        />
        <SLAMetricCard 
          title="Recovery Success Rate" 
          value="98.5%" 
          target="95%" 
          status="success"
          trend="+1.2% from last period"
          trendDirection="up"
        />
      </div>
      
      {/* SLA Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessingTimeTrends />
        <SEAComplianceByRegion />
      </div>
      
      {/* SLA Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Performance by Process Stage</CardTitle>
          <CardDescription>Detailed metrics for each stage of the PnL process</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Target Time</TableHead>
                <TableHead>Actual Time (Avg)</TableHead>
                <TableHead>SLA Compliance</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slaStageData.map((stage, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{stage.name}</TableCell>
                  <TableCell>{stage.targetTime}</TableCell>
                  <TableCell>{stage.actualTime}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{stage.compliance}%</span>
                      </div>
                      <Progress 
                        value={stage.compliance} 
                        className="h-2" 
                        indicatorClassName={getSLAProgressColor(stage.compliance, stage.target)} 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {stage.trendDirection === "up" ? (
                        <ArrowUpRight className={`h-4 w-4 mr-1 ${stage.trendValue > 0 ? "text-green-500" : "text-red-500"}`} />
                      ) : (
                        <ArrowDownRight className={`h-4 w-4 mr-1 ${stage.trendValue < 0 ? "text-green-500" : "text-red-500"}`} />
                      )}
                      <span className={stage.trendValue > 0 ? "text-green-500" : "text-red-500"}>
                        {stage.trendValue > 0 ? "+" : ""}{stage.trendValue}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SLAStatusBadge status={getSLAStatus(stage.compliance, stage.target)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Historical SEA Performance */}
      <HistoricalSEAPerformance />
    </div>
  );
}

interface SLAMetricCardProps {
  title: string;
  value: string;
  target: string;
  status: "success" | "warning" | "critical";
  trend: string;
  trendDirection: "up" | "down";
}

function SLAMetricCard({ title, value, target, status, trend, trendDirection }: SLAMetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-amber-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>{value}</div>
            <p className="text-xs text-muted-foreground">Target: {target}</p>
          </div>
          <SLAStatusBadge status={status} />
        </div>
        <div className="flex items-center mt-2 text-xs">
          {trendDirection === "up" ? (
            <ArrowUpRight className={`h-3 w-3 mr-1 ${
              (title.includes("Time") && trendDirection === "up") || 
              (!title.includes("Time") && trendDirection === "down") 
                ? "text-red-500" : "text-green-500"
            }`} />
          ) : (
            <ArrowDownRight className={`h-3 w-3 mr-1 ${
              (title.includes("Time") && trendDirection === "down") || 
              (!title.includes("Time") && trendDirection === "up") 
                ? "text-green-500" : "text-red-500"
            }`} />
          )}
          <span className={
            (title.includes("Time") && trendDirection === "down") || 
            (!title.includes("Time") && trendDirection === "up") 
              ? "text-green-500" : "text-red-500"
          }>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SLAStatusBadge({ status }) {
  if (typeof status === "string") {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Meeting SLA
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            At Risk
          </Badge>
        );
      case "critical":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            SLA Breach
          </Badge>
        );
      default:
        return null;
    }
  } else {
    switch (status) {
      case "exceeding":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Exceeding
          </Badge>
        );
      case "meeting":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Meeting
          </Badge>
        );
      case "at-risk":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            At Risk
          </Badge>
        );
      case "failing":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failing
          </Badge>
        );
      default:
        return null;
    }
  }
}

function getSLAStatus(percentage, target) {
  if (percentage >= target + 5) return "exceeding";
  if (percentage >= target) return "meeting";
  if (percentage >= target - 5) return "at-risk";
  return "failing";
}

function getSLAProgressColor(percentage, target) {
  if (percentage >= target + 5) return "bg-green-500";
  if (percentage >= target) return "bg-green-400";
  if (percentage >= target - 5) return "bg-amber-500";
  return "bg-red-500";
}

const slaStageData = [
  {
    name: "Data Collection",
    targetTime: "15 min",
    actualTime: "10 min",
    compliance: 98,
    target: 95,
    trendValue: 2.3,
    trendDirection: "up"
  },
  {
    name: "Validation",
    targetTime: "10 min",
    actualTime: "8 min",
    compliance: 97,
    target: 95,
    trendValue: 1.5,
    trendDirection: "up"
  },
  {
    name: "Substantiation",
    targetTime: "20 min",
    actualTime: "15 min",
    compliance: 96,
    target: 95,
    trendValue: -0.7,
    trendDirection: "down"
  },
  {
    name: "Reconciliation",
    targetTime: "15 min",
    actualTime: "12 min",
    compliance: 95,
    target: 95,
    trendValue: 0.2,
    trendDirection: "up"
  },
  {
    name: "Approval",
    targetTime: "10 min",
    actualTime: "5 min",
    compliance: 99,
    target: 95,
    trendValue: 1.5,
    trendDirection: "up"
  },
  {
    name: "Reporting",
    targetTime: "10 min",
    actualTime: "7 min",
    compliance: 98,
    target: 95,
    trendValue: 0.5,
    trendDirection: "up"
  },
  {
    name: "Finalization",
    targetTime: "5 min",
    actualTime: "3 min",
    compliance: 100,
    target: 95,
    trendValue: 0,
    trendDirection: "up"
  }
];