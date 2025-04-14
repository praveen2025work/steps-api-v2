import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { workflowData } from "@/data/workflowData";

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
  // Calculate statistics from the workflow data
  const totalApplications = workflowData.applications.length;
  
  // Count processes by status
  const completedProcesses = workflowData.processes.filter(p => p.status === 'completed').length;
  const inProgressProcesses = workflowData.processes.filter(p => p.status === 'in_progress').length;
  const notStartedProcesses = workflowData.processes.filter(p => p.status === 'not_started').length;
  
  // Count active users
  const activeUsers = workflowData.users.filter(u => u.isActive === 1).length;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Applications"
        value={totalApplications}
        icon={<RotateCcw className="h-4 w-4 text-muted-foreground" />}
        description={`${workflowData.applications.filter(a => a.isActive === 1).length} active applications`}
      />
      <StatCard
        title="In Progress"
        value={inProgressProcesses}
        icon={<Clock className="h-4 w-4 text-blue-500" />}
        description="Current processes"
      />
      <StatCard
        title="Completed"
        value={completedProcesses}
        icon={<CheckCircle className="h-4 w-4 text-green-500" />}
        description="Finished processes"
      />
      <StatCard
        title="Not Started"
        value={notStartedProcesses}
        icon={<AlertCircle className="h-4 w-4 text-yellow-500" />}
        description="Pending processes"
      />
    </div>
  );
};

export default WorkflowStats;