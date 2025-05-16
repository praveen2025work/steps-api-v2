import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function SLABreakdownTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>First Response</TableHead>
            <TableHead>Resolution Time</TableHead>
            <TableHead>Overall SLA</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slaTeamData.map((team, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{team.firstResponse.percentage}%</span>
                    <span className="text-muted-foreground">Target: {team.firstResponse.target}%</span>
                  </div>
                  <Progress 
                    value={team.firstResponse.percentage} 
                    className="h-2" 
                    indicatorClassName={getProgressColor(team.firstResponse.percentage, team.firstResponse.target)}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{team.resolutionTime.percentage}%</span>
                    <span className="text-muted-foreground">Target: {team.resolutionTime.target}%</span>
                  </div>
                  <Progress 
                    value={team.resolutionTime.percentage} 
                    className="h-2" 
                    indicatorClassName={getProgressColor(team.resolutionTime.percentage, team.resolutionTime.target)}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{team.overall.percentage}%</span>
                    <span className="text-muted-foreground">Target: {team.overall.target}%</span>
                  </div>
                  <Progress 
                    value={team.overall.percentage} 
                    className="h-2" 
                    indicatorClassName={getProgressColor(team.overall.percentage, team.overall.target)}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {team.trend.direction === "up" ? (
                    <ArrowUpRight className={`h-4 w-4 mr-1 ${team.trend.value > 0 ? "text-green-500" : "text-red-500"}`} />
                  ) : (
                    <ArrowDownRight className={`h-4 w-4 mr-1 ${team.trend.value < 0 ? "text-green-500" : "text-red-500"}`} />
                  )}
                  <span className={team.trend.value > 0 ? "text-green-500" : "text-red-500"}>
                    {team.trend.value > 0 ? "+" : ""}{team.trend.value}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <SLAStatusBadge status={getSLAStatus(team.overall.percentage, team.overall.target)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SLAStatusBadge({ status }) {
  switch (status) {
    case "exceeding":
      return (
        <Badge className="bg-green-500">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Exceeding
        </Badge>
      );
    case "meeting":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
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
          <AlertTriangle className="h-3 w-3 mr-1" />
          Failing
        </Badge>
      );
    default:
      return null;
  }
}

function getSLAStatus(percentage, target) {
  if (percentage >= target + 5) return "exceeding";
  if (percentage >= target) return "meeting";
  if (percentage >= target - 5) return "at-risk";
  return "failing";
}

function getProgressColor(percentage, target) {
  if (percentage >= target + 5) return "bg-green-500";
  if (percentage >= target) return "bg-green-400";
  if (percentage >= target - 5) return "bg-amber-500";
  return "bg-red-500";
}

const slaTeamData = [
  {
    name: "Technical Support",
    firstResponse: { percentage: 98, target: 95 },
    resolutionTime: { percentage: 96, target: 95 },
    overall: { percentage: 97, target: 95 },
    trend: { value: 2.3, direction: "up" }
  },
  {
    name: "Billing Support",
    firstResponse: { percentage: 97, target: 95 },
    resolutionTime: { percentage: 92, target: 95 },
    overall: { percentage: 94, target: 95 },
    trend: { value: -0.7, direction: "down" }
  },
  {
    name: "Account Management",
    firstResponse: { percentage: 99, target: 95 },
    resolutionTime: { percentage: 97, target: 95 },
    overall: { percentage: 98, target: 95 },
    trend: { value: 1.5, direction: "up" }
  },
  {
    name: "Product Support",
    firstResponse: { percentage: 96, target: 95 },
    resolutionTime: { percentage: 93, target: 95 },
    overall: { percentage: 94, target: 95 },
    trend: { value: 0.2, direction: "up" }
  },
  {
    name: "New Customer Onboarding",
    firstResponse: { percentage: 95, target: 95 },
    resolutionTime: { percentage: 90, target: 95 },
    overall: { percentage: 92, target: 95 },
    trend: { value: -1.8, direction: "down" }
  }
];