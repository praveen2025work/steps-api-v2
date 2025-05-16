import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Play,
  RotateCw,
  XCircle,
  FileText,
  Eye,
  AlertCircle,
  Pause
} from "lucide-react";
import { toast } from "@/lib/toast";

interface PnLProcessListProps {
  date: string;
  region: string;
  isRecoveryMode: boolean;
}

export function PnLProcessList({ date, region, isRecoveryMode }: PnLProcessListProps) {
  const [processes, setProcesses] = useState(generateProcesses(date, region));
  
  // Filter processes based on region
  const filteredProcesses = region === "all" 
    ? processes 
    : processes.filter(process => process.region.toLowerCase() === region.toLowerCase());
  
  const handleRecovery = (processId: string) => {
    // In a real app, this would call an API to initiate recovery
    toast({
      title: "Recovery Initiated",
      description: `Recovery has been initiated for process ${processId}`,
      variant: "default"
    });
    
    // Update the local state to show the process as recovering
    setProcesses(prevProcesses => 
      prevProcesses.map(process => 
        process.id === processId 
          ? { ...process, status: "recovering", statusText: "Recovering" } 
          : process
      )
    );
  };
  
  const handleViewDetails = (processId: string) => {
    // In a real app, this would navigate to a details page or open a modal
    toast({
      title: "View Process Details",
      description: `Viewing details for process ${processId}`,
      variant: "default"
    });
  };
  
  const handleViewParameters = (processId: string) => {
    // In a real app, this would show the process parameters
    toast({
      title: "View Process Parameters",
      description: `Viewing parameters for process ${processId}`,
      variant: "default"
    });
  };
  
  const handleViewAudit = (processId: string) => {
    // In a real app, this would show the audit log
    toast({
      title: "View Audit Log",
      description: `Viewing audit log for process ${processId}`,
      variant: "default"
    });
  };
  
  return (
    <div className="space-y-4">
      {filteredProcesses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No processes found for the selected criteria
        </div>
      ) : (
        filteredProcesses.map((process) => (
          <ProcessItem 
            key={process.id} 
            process={process} 
            isRecoveryMode={isRecoveryMode}
            onRecovery={handleRecovery}
            onViewDetails={handleViewDetails}
            onViewParameters={handleViewParameters}
            onViewAudit={handleViewAudit}
          />
        ))
      )}
    </div>
  );
}

interface ProcessItemProps {
  process: any;
  isRecoveryMode: boolean;
  onRecovery: (processId: string) => void;
  onViewDetails: (processId: string) => void;
  onViewParameters: (processId: string) => void;
  onViewAudit: (processId: string) => void;
}

function ProcessItem({ 
  process, 
  isRecoveryMode,
  onRecovery,
  onViewDetails,
  onViewParameters,
  onViewAudit
}: ProcessItemProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium flex items-center">
            {process.id} - {process.name}
            <StatusBadge status={process.status} text={process.statusText} />
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {process.region} • {process.desk} • Last Updated: {process.lastUpdated}
          </div>
          
          {/* Process Stage Progress */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Stage: {process.currentStage}</span>
              <span className="font-medium">{process.progress}%</span>
            </div>
            <Progress 
              value={process.progress} 
              className="h-2" 
              indicatorClassName={getProgressColor(process.status)} 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Action Buttons */}
          {process.status === "failed" && isRecoveryMode && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-amber-500 text-amber-700 hover:bg-amber-100"
              onClick={() => onRecovery(process.id)}
            >
              <RotateCw className="h-3 w-3 mr-1" />
              Recover
            </Button>
          )}
          
          {process.status === "running" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => toast({
                title: "Process Paused",
                description: `Process ${process.id} has been paused`,
                variant: "default"
              })}
            >
              <Pause className="h-3 w-3 mr-1" />
              Pause
            </Button>
          )}
          
          {process.status === "paused" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => toast({
                title: "Process Resumed",
                description: `Process ${process.id} has been resumed`,
                variant: "default"
              })}
            >
              <Play className="h-3 w-3 mr-1" />
              Resume
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
              <DropdownMenuItem onClick={() => onViewDetails(process.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewParameters(process.id)}>
                <FileText className="h-4 w-4 mr-2" />
                View Parameters
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewAudit(process.id)}>
                <Clock className="h-4 w-4 mr-2" />
                View Audit Log
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {process.status === "failed" && (
                <DropdownMenuItem 
                  className="text-amber-500"
                  onClick={() => onRecovery(process.id)}
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
      </div>
    </div>
  );
}

function StatusBadge({ status, text }) {
  switch (status) {
    case "running":
      return (
        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200 text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "recovering":
      return (
        <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs">
          <RotateCw className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "warning":
      return (
        <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    case "paused":
      return (
        <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-700 border-gray-200 text-xs">
          <Pause className="h-3 w-3 mr-1" />
          {text}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="ml-2 text-xs">
          {text}
        </Badge>
      );
  }
}

function getProgressColor(status) {
  switch (status) {
    case "running":
      return "bg-blue-500";
    case "completed":
      return "bg-green-500";
    case "failed":
      return "bg-red-500";
    case "recovering":
      return "bg-amber-500";
    case "warning":
      return "bg-amber-500";
    case "paused":
      return "bg-gray-400";
    default:
      return "";
  }
}

// Generate sample process data based on date and region
function generateProcesses(date, region) {
  const previousDate = "2025-05-15"; // The date with the major failure
  const currentDate = "2025-05-16";
  
  // Base process data
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
      id: "PNL-3001",
      name: "Equities Daily PnL",
      region: "India",
      desk: "Equities Trading",
      lastUpdated: date === previousDate ? "15 May, 07:32 AM" : "16 May, 07:32 AM"
    },
    {
      id: "PNL-4001",
      name: "Equities Daily PnL",
      region: "Shanghai",
      desk: "Equities Trading",
      lastUpdated: date === previousDate ? "15 May, 06:32 AM" : "16 May, 06:32 AM"
    }
  ];
  
  // For the failure date, all processes failed at the Substantiation stage
  if (date === previousDate) {
    return baseProcesses.map(process => ({
      ...process,
      status: "failed",
      statusText: "Failed",
      currentStage: "Substantiation",
      progress: 45
    }));
  }
  
  // For the current date, show a mix of statuses
  if (date === currentDate) {
    return baseProcesses.map((process, index) => {
      // Create a mix of statuses for demonstration
      const statuses = ["running", "completed", "running", "warning", "running", "paused", "running"];
      const stages = ["Data Collection", "Validation", "Substantiation", "Reconciliation", "Approval", "Reporting", "Finalization"];
      const progresses = [25, 100, 45, 70, 60, 50, 30];
      const statusTexts = ["Running", "Completed", "Running", "Warning", "Running", "Paused", "Running"];
      
      return {
        ...process,
        status: statuses[index % statuses.length],
        statusText: statusTexts[index % statusTexts.length],
        currentStage: stages[index % stages.length],
        progress: progresses[index % progresses.length]
      };
    });
  }
  
  // For other dates, show all completed
  return baseProcesses.map(process => ({
    ...process,
    status: "completed",
    statusText: "Completed",
    currentStage: "Finalization",
    progress: 100
  }));
}