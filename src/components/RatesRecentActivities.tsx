import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

// Mock activities for rates
const activities: Activity[] = [
  {
    id: "activity-1",
    user: "System",
    action: "SOD Roll completed",
    workflow: "Daily Named PNL",
    time: "1 days ago",
    type: "complete"
  },
  {
    id: "activity-2",
    user: "John Doe",
    action: "Started Books Open For Correction",
    workflow: "Daily Named PNL",
    time: "1 days ago",
    type: "create"
  },
  {
    id: "activity-3",
    user: "Jane Smith",
    action: "Uploaded corrections file",
    workflow: "Daily Named PNL",
    time: "1 days ago",
    type: "update"
  },
  {
    id: "activity-4",
    user: "Mike Johnson",
    action: "Reviewed corrections",
    workflow: "Daily Named PNL",
    time: "1 days ago",
    type: "review"
  }
];

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
  if (name === "System") return "SY";
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const RatesRecentActivities = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
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
                      {getInitials(activity.user)}
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

export default RatesRecentActivities;