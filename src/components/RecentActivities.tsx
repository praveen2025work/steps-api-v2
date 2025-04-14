import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { workflowData } from "@/data/workflowData";
import { Separator } from "@/components/ui/separator";
import { FileCheck, FileText, AlertTriangle, Clock, CheckCircle2, User } from "lucide-react";

type Activity = {
  id: string;
  user: string;
  action: string;
  workflow: string;
  time: string;
  type: "create" | "update" | "complete" | "reject" | "assign" | "review";
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
    type = "review";
  } else if (activity.action.toLowerCase().includes("assigned")) {
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

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "create":
      return <div className="p-2 rounded-full bg-blue-500/10"><FileText className="h-4 w-4 text-blue-500" /></div>;
    case "update":
      return <div className="p-2 rounded-full bg-yellow-500/10"><Clock className="h-4 w-4 text-yellow-500" /></div>;
    case "complete":
      return <div className="p-2 rounded-full bg-green-500/10"><CheckCircle2 className="h-4 w-4 text-green-500" /></div>;
    case "reject":
      return <div className="p-2 rounded-full bg-red-500/10"><AlertTriangle className="h-4 w-4 text-red-500" /></div>;
    case "assign":
      return <div className="p-2 rounded-full bg-purple-500/10"><User className="h-4 w-4 text-purple-500" /></div>;
    case "review":
      return <div className="p-2 rounded-full bg-indigo-500/10"><FileCheck className="h-4 w-4 text-indigo-500" /></div>;
    default:
      return <div className="p-2 rounded-full bg-gray-500/10"><Clock className="h-4 w-4 text-gray-500" /></div>;
  }
};

// Get initials for avatar
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const RecentActivities = () => {
  return (
    <div className="space-y-4">
      {activities.slice(0, 6).map((activity, index) => (
        <div key={activity.id}>
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              {getActivityIcon(activity.type)}
              {index < activities.length - 1 && (
                <div className="w-px h-full bg-border mt-2"></div>
              )}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {activity.user === "System" ? "SY" : getInitials(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{activity.user}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
              <p className="text-sm">
                {activity.action} <span className="font-medium">{activity.workflow}</span>
              </p>
            </div>
          </div>
          {index < activities.length - 1 && <div className="h-2"></div>}
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;