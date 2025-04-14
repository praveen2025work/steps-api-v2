import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, RotateCcw, TrendingUp, ShieldAlert, FileCheck, AlertTriangle } from "lucide-react";
import { workflowData } from "@/data/workflowData";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: string;
}

const StatCard = ({ title, value, icon, description, trend, color = "bg-primary/10 text-primary" }: StatCardProps) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-end">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.positive && 'rotate-180'}`} />
            {trend.value}
          </div>
        )}
      </div>
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
  
  // Calculate compliance metrics (simulated)
  const complianceRate = 94;
  const pendingApprovals = 12;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Performance Overview</h2>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="mr-2">Period:</span>
          <select className="bg-transparent border rounded px-2 py-1 text-sm">
            <option>Last 30 days</option>
            <option>Last quarter</option>
            <option>Year to date</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={totalApplications}
          icon={<RotateCcw className="h-4 w-4" />}
          description={`${workflowData.applications.filter(a => a.isActive === 1).length} active applications`}
          trend={{ value: "+5.2%", positive: true }}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="In Progress"
          value={inProgressProcesses}
          icon={<Clock className="h-4 w-4" />}
          description="Current processes"
          trend={{ value: "+2.4%", positive: true }}
          color="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          title="Completed"
          value={completedProcesses}
          icon={<CheckCircle className="h-4 w-4" />}
          description="Finished processes"
          trend={{ value: "+12.5%", positive: true }}
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          title="Compliance Rate"
          value={`${complianceRate}%`}
          icon={<ShieldAlert className="h-4 w-4" />}
          description="Regulatory adherence"
          trend={{ value: "-0.8%", positive: false }}
          color="bg-purple-500/10 text-purple-500"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Regulatory Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px] flex items-center justify-center">
              <img 
                src="https://assets.co.dev/19129c8d-1c91-4384-9bc0-e0d1fdc82154/image-6f5138f.png" 
                alt="Compliance Chart" 
                className="max-h-full object-contain"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm">High Priority</span>
                </div>
                <span className="font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm">Medium Priority</span>
                </div>
                <span className="font-medium">7</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Low Priority</span>
                </div>
                <span className="font-medium">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowStats;