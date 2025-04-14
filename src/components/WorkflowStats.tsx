import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, RotateCcw } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const WorkflowStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Workflows"
        value="24"
        icon={<RotateCcw className="h-4 w-4 text-muted-foreground" />}
        description="+2 from last week"
      />
      <StatCard
        title="In Progress"
        value="8"
        icon={<Clock className="h-4 w-4 text-blue-500" />}
        description="3 due this week"
      />
      <StatCard
        title="Completed"
        value="14"
        icon={<CheckCircle className="h-4 w-4 text-green-500" />}
        description="5 completed today"
      />
      <StatCard
        title="Pending Approval"
        value="2"
        icon={<AlertCircle className="h-4 w-4 text-yellow-500" />}
        description="Awaiting review"
      />
    </div>
  );
};

export default WorkflowStats;