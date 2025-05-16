import { useState } from "react";
import { useRouter } from "next/router";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  RotateCw,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Calendar
} from "lucide-react";
import { PnLProcessList } from "./PnLProcessList";
import { PnLRegionStatus } from "./PnLRegionStatus";
import { PnLStageBreakdown } from "./PnLStageBreakdown";
import { toast } from "@/lib/toast";

export function PnLDashboard() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("2025-05-16");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  
  // This would be the current date in a real application
  const currentDate = "2025-05-16";
  const previousDate = "2025-05-15"; // The date with the major failure
  
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    // In a real app, this would fetch data for the selected date
  };
  
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    // In a real app, this would filter data by region
  };
  
  const toggleRecoveryMode = () => {
    setIsRecoveryMode(!isRecoveryMode);
    if (!isRecoveryMode) {
      toast({
        title: "Recovery Mode Activated",
        description: "You can now perform recovery actions on failed processes.",
        variant: "default"
      });
    } else {
      toast({
        title: "Recovery Mode Deactivated",
        description: "Recovery mode has been turned off.",
        variant: "default"
      });
    }
  };
  
  const handleBulkRecovery = () => {
    toast({
      title: "Bulk Recovery Initiated",
      description: "Recovery has been initiated for all failed processes in the Substantiation stage.",
      variant: "default"
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Critical Alert for May 15 Failure */}
      {selectedDate === previousDate && (
        <Alert variant="destructive" className="border-red-600 bg-red-50 text-red-600 dark:bg-red-950/30">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-red-600">Critical System Failure Detected</AlertTitle>
          <AlertDescription className="text-red-600">
            All 265 PnL processes failed on May 15, 2025, primarily in the Substantiation stage, affecting all regions. 
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 border-red-600 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50"
              onClick={() => router.push("/pnl-operations?tab=process-management")}
            >
              View Details
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Dashboard Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedDate} onValueChange={handleDateChange}>
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
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
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
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button 
            variant={isRecoveryMode ? "default" : "outline"} 
            size="sm" 
            className={`gap-1 ${isRecoveryMode ? "bg-amber-500 hover:bg-amber-600" : ""}`}
            onClick={toggleRecoveryMode}
          >
            <RotateCw className="h-4 w-4" />
            {isRecoveryMode ? "Recovery Mode: ON" : "Recovery Mode"}
          </Button>
        </div>
      </div>
      
      {/* Recovery Mode Alert */}
      {isRecoveryMode && (
        <Alert className="border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Recovery Mode Activated</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>You can now perform recovery actions on failed processes.</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-950/50"
              onClick={handleBulkRecovery}
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Bulk Recovery: Substantiation Stage
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="Total PnL Processes" 
          value={selectedDate === previousDate ? "265/265 Failed" : "265/265 Running"} 
          status={selectedDate === previousDate ? "critical" : "success"}
          description={selectedDate === previousDate ? "100% Failure Rate" : "0% Failure Rate"}
          icon={selectedDate === previousDate ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          trend={selectedDate === previousDate ? "+100% from yesterday" : "-100% from yesterday"}
          trendDirection={selectedDate === previousDate ? "up" : "down"}
        />
        
        <StatusCard 
          title="Average Processing Time" 
          value={selectedDate === previousDate ? "N/A" : "42 min"} 
          status={selectedDate === previousDate ? "neutral" : "success"}
          description={selectedDate === previousDate ? "Processes Failed" : "Target: 60 min"}
          icon={<Clock className="h-5 w-5" />}
          trend={selectedDate === previousDate ? "N/A" : "-5% from yesterday"}
          trendDirection="down"
        />
        
        <StatusCard 
          title="SLA Compliance" 
          value={selectedDate === previousDate ? "0%" : "98%"} 
          status={selectedDate === previousDate ? "critical" : "success"}
          description={selectedDate === previousDate ? "Target: 95%" : "Target: 95%"}
          icon={selectedDate === previousDate ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          trend={selectedDate === previousDate ? "-95% from yesterday" : "+98% from yesterday"}
          trendDirection={selectedDate === previousDate ? "down" : "up"}
        />
        
        <StatusCard 
          title="Time to Deadline" 
          value={selectedDate === previousDate ? "Missed" : "1h 13m"} 
          status={selectedDate === previousDate ? "critical" : "warning"}
          description={selectedDate === previousDate ? "EOD Deadline: 19:00 EST" : "EOD Deadline: 19:00 EST"}
          icon={<Clock className="h-5 w-5" />}
          trend=""
          trendDirection="neutral"
        />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>PnL Processes</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="gap-1">
                  <Filter className="h-3 w-3" />
                  {selectedRegion === "all" ? "All Regions" : selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedDate === currentDate ? "Today" : "May 15, 2025"}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              {selectedDate === previousDate 
                ? "All processes failed in the Substantiation stage" 
                : "Monitor and manage daily PnL processes across regions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PnLProcessList 
              date={selectedDate} 
              region={selectedRegion} 
              isRecoveryMode={isRecoveryMode} 
            />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/pnl-operations?tab=process-management")}>
              View All Processes
            </Button>
          </CardFooter>
        </Card>

        {/* Region Status */}
        <Card>
          <CardHeader>
            <CardTitle>Region Status</CardTitle>
            <CardDescription>Process completion by region</CardDescription>
          </CardHeader>
          <CardContent>
            <PnLRegionStatus date={selectedDate} />
          </CardContent>
        </Card>
      </div>
      
      {/* Stage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Process Stage Breakdown</CardTitle>
          <CardDescription>Status of processes across different stages</CardDescription>
        </CardHeader>
        <CardContent>
          <PnLStageBreakdown date={selectedDate} region={selectedRegion} />
        </CardContent>
      </Card>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: string;
  status: "success" | "warning" | "critical" | "neutral";
  description: string;
  icon: React.ReactNode;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
}

function StatusCard({ title, value, status, description, icon, trend, trendDirection }: StatusCardProps) {
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={getStatusColor()}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getStatusColor()}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            {trendDirection === "up" ? (
              <ArrowUpRight className={`h-3 w-3 mr-1 ${trendDirection === "up" ? "text-red-500" : "text-green-500"}`} />
            ) : trendDirection === "down" ? (
              <ArrowDownRight className={`h-3 w-3 mr-1 ${trendDirection === "down" ? "text-green-500" : "text-red-500"}`} />
            ) : null}
            <span className={
              trendDirection === "up" 
                ? value.includes("Failed") ? "text-red-500" : "text-green-500" 
                : trendDirection === "down" 
                  ? value.includes("Failed") ? "text-green-500" : "text-red-500"
                  : "text-muted-foreground"
            }>
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}