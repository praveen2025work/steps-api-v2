import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workflowData } from "@/data/workflowData";

type Activity = {
  id: string;
  user: string;
  action: string;
  workflow: string;
  time: string;
  type: "create" | "update" | "complete" | "reject" | "assign";
};

// Convert user activity from the new data structure
const activities: Activity[] = workflowData.userActivity.map((activity, index) => {
  // Find the application name for the substage
  const substage = workflowData.subStages.find(s => s.name === activity.substage);
  const stage = substage ? workflowData.stages.find(s => s.id === substage.defaultStage) : null;
  const app = stage ? workflowData.applications.find(a => a.id === stage.appId) : null;
  
  // Determine activity type
  let type: Activity["type"] = "update";
  if (activity.action.toLowerCase().includes("completed")) {
    type = "complete";
  } else if (activity.action.toLowerCase().includes("started")) {
    type = "create";
  } else if (activity.action.toLowerCase().includes("uploaded")) {
    type = "update";
  } else if (activity.action.toLowerCase().includes("reviewed")) {
    type = "assign";
  }
  
  // Format time
  const activityTime = new Date(activity.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMins = Math.round(diffMs / 60000);
  let timeString = "";
  
  if (diffMins < 60) {
    timeString = `${diffMins} minutes ago`;
  } else if (diffMins < 1440) {
    timeString = `${Math.floor(diffMins / 60)} hours ago`;
  } else {
    timeString = `${Math.floor(diffMins / 1440)} days ago`;
  }
  
  return {
    id: `activity-${index}`,
    user: activity.user === "system" ? "System" : 
      workflowData.users.find(u => u.username === activity.user)?.displayName || activity.user,
    action: activity.action,
    workflow: app?.name || "Unknown Workflow",
    time: timeString,
    type
  };
});

const getActivityBadge = (type: Activity["type"]) => {
  switch (type) {
    case "create":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10">Created</Badge>;
    case "update":
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10">Updated</Badge>;
    case "complete":
      return <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/10">Completed</Badge>;
    case "reject":
      return <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/10">Rejected</Badge>;
    case "assign":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/10">Assigned</Badge>;
    default:
      return <Badge variant="outline">Action</Badge>;
  }
};

const RecentActivities = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user} {activity.action} <span className="font-bold">{activity.workflow}</span>
                </p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
              {getActivityBadge(activity.type)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;