import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Globe
} from "lucide-react";

interface PnLRegionStatusProps {
  date: string;
}

export function PnLRegionStatus({ date }: PnLRegionStatusProps) {
  const previousDate = "2025-05-15"; // The date with the major failure
  const currentDate = "2025-05-16";
  
  // Generate region data based on the selected date
  const regions = generateRegionData(date);
  
  return (
    <div className="space-y-6">
      {regions.map((region, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{region.name}</span>
            </div>
            <RegionStatusBadge status={region.status} />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{region.completedCount}/{region.totalCount} Processes</span>
              <span className="font-medium">{region.completionPercentage}%</span>
            </div>
            <Progress 
              value={region.completionPercentage} 
              className="h-2" 
              indicatorClassName={getProgressColor(region.status)} 
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            {date === previousDate 
              ? `All processes failed at ${region.failurePoint}`
              : `Estimated completion: ${region.estimatedCompletion}`}
          </div>
        </div>
      ))}
    </div>
  );
}

function RegionStatusBadge({ status }) {
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
    default:
      return "";
  }
}

function generateRegionData(date) {
  const previousDate = "2025-05-15"; // The date with the major failure
  const currentDate = "2025-05-16";
  
  // Base region data
  const regions = [
    {
      name: "Americas",
      totalCount: 85
    },
    {
      name: "Asia",
      totalCount: 65
    },
    {
      name: "India",
      totalCount: 55
    },
    {
      name: "Shanghai",
      totalCount: 60
    }
  ];
  
  // For the failure date, all regions failed
  if (date === previousDate) {
    return regions.map(region => ({
      ...region,
      status: "failed",
      completedCount: 0,
      completionPercentage: 0,
      failurePoint: "Substantiation Stage"
    }));
  }
  
  // For the current date, show a mix of statuses
  if (date === currentDate) {
    return [
      {
        ...regions[0],
        status: "in-progress",
        completedCount: 45,
        completionPercentage: 53,
        estimatedCompletion: "17:30 EST"
      },
      {
        ...regions[1],
        status: "completed",
        completedCount: 65,
        completionPercentage: 100,
        estimatedCompletion: "Completed at 16:45 EST"
      },
      {
        ...regions[2],
        status: "at-risk",
        completedCount: 30,
        completionPercentage: 55,
        estimatedCompletion: "18:15 EST (at risk)"
      },
      {
        ...regions[3],
        status: "in-progress",
        completedCount: 42,
        completionPercentage: 70,
        estimatedCompletion: "17:45 EST"
      }
    ];
  }
  
  // For other dates, show all completed
  return regions.map(region => ({
    ...region,
    status: "completed",
    completedCount: region.totalCount,
    completionPercentage: 100,
    estimatedCompletion: "Completed on schedule"
  }));
}