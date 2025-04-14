import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Activity = {
  id: string;
  user: string;
  action: string;
  workflow: string;
  time: string;
  type: "create" | "update" | "complete" | "reject" | "assign";
};

const activities: Activity[] = [
  {
    id: "1",
    user: "John Doe",
    action: "completed stage",
    workflow: "Invoice Approval",
    time: "10 minutes ago",
    type: "complete"
  },
  {
    id: "2",
    user: "Jane Smith",
    action: "created new workflow",
    workflow: "Contract Review",
    time: "1 hour ago",
    type: "create"
  },
  {
    id: "3",
    user: "Mike Johnson",
    action: "updated",
    workflow: "Employee Onboarding",
    time: "2 hours ago",
    type: "update"
  },
  {
    id: "4",
    user: "Sarah Williams",
    action: "assigned to",
    workflow: "Budget Approval",
    time: "3 hours ago",
    type: "assign"
  },
  {
    id: "5",
    user: "Robert Brown",
    action: "rejected",
    workflow: "Vendor Registration",
    time: "5 hours ago",
    type: "reject"
  }
];

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