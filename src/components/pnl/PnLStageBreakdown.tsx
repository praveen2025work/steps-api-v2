import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Layers
} from "lucide-react";

interface PnLStageBreakdownProps {
  date: string;
  region: string;
}

export function PnLStageBreakdown({ date, region }: PnLStageBreakdownProps) {
  const previousDate = "2025-05-15"; // The date with the major failure
  const currentDate = "2025-05-16";
  
  // Generate stage data based on the selected date and region
  const stages = generateStageData(date, region);
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processes</TableHead>
            <TableHead>Avg. Time</TableHead>
            <TableHead>Completion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stages.map((stage, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{stage.name}</TableCell>
              <TableCell>
                <StageStatusBadge status={stage.status} />
              </TableCell>
              <TableCell>{stage.completedCount}/{stage.totalCount}</TableCell>
              <TableCell>{stage.averageTime}</TableCell>
              <TableCell>
                <div className="w-[100px] space-y-1">
                  <Progress 
                    value={stage.completionPercentage} 
                    className="h-2" 
                    indicatorClassName={getProgressColor(stage.status)} 
                  />
                  <div className="text-xs text-right">{stage.completionPercentage}%</div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StageStatusBadge({ status }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case "in-progress":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case "at-risk":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          At Risk
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
          Pending
        </Badge>
      );
    default:
      return null;
  }
}

function getProgressColor(status) {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-blue-500";
    case "at-risk":
      return "bg-amber-500";
    case "failed":
      return "bg-red-500";
    case "pending":
      return "bg-gray-300";
    default:
      return "";
  }
}

function generateStageData(date, region) {
  const previousDate = "2025-05-15"; // The date with the major failure
  const currentDate = "2025-05-16";
  
  // Base stage data
  const stages = [
    {
      name: "Data Collection",
      totalCount: 265,
      averageTime: "10 min"
    },
    {
      name: "Validation",
      totalCount: 265,
      averageTime: "8 min"
    },
    {
      name: "Substantiation",
      totalCount: 265,
      averageTime: "15 min"
    },
    {
      name: "Reconciliation",
      totalCount: 265,
      averageTime: "12 min"
    },
    {
      name: "Approval",
      totalCount: 265,
      averageTime: "5 min"
    },
    {
      name: "Reporting",
      totalCount: 265,
      averageTime: "7 min"
    },
    {
      name: "Finalization",
      totalCount: 265,
      averageTime: "3 min"
    }
  ];
  
  // For the failure date, all processes failed at Substantiation
  if (date === previousDate) {
    return stages.map((stage, index) => {
      if (index < 2) {
        return {
          ...stage,
          status: "completed",
          completedCount: stage.totalCount,
          completionPercentage: 100
        };
      } else if (index === 2) {
        return {
          ...stage,
          status: "failed",
          completedCount: 0,
          completionPercentage: 0
        };
      } else {
        return {
          ...stage,
          status: "pending",
          completedCount: 0,
          completionPercentage: 0
        };
      }
    });
  }
  
  // For the current date, show a mix of statuses
  if (date === currentDate) {
    return [
      {
        ...stages[0],
        status: "completed",
        completedCount: 265,
        completionPercentage: 100
      },
      {
        ...stages[1],
        status: "completed",
        completedCount: 265,
        completionPercentage: 100
      },
      {
        ...stages[2],
        status: "in-progress",
        completedCount: 180,
        completionPercentage: 68
      },
      {
        ...stages[3],
        status: "in-progress",
        completedCount: 95,
        completionPercentage: 36
      },
      {
        ...stages[4],
        status: "pending",
        completedCount: 0,
        completionPercentage: 0
      },
      {
        ...stages[5],
        status: "pending",
        completedCount: 0,
        completionPercentage: 0
      },
      {
        ...stages[6],
        status: "pending",
        completedCount: 0,
        completionPercentage: 0
      }
    ];
  }
  
  // For other dates, show all completed
  return stages.map(stage => ({
    ...stage,
    status: "completed",
    completedCount: stage.totalCount,
    completionPercentage: 100
  }));
}