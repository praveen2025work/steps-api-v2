import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';

type ActivityLogItem = {
  user: string;
  action: string;
  timestamp: string;
  role: string;
  substage: string;
  status: string;
};

type ActivityLogProps = {
  activities: ActivityLogItem[];
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500 text-white';
    case 'in_progress':
      return 'bg-blue-500 text-white';
    case 'not_started':
      return 'bg-gray-500 text-white';
    case 'failed':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'producer':
      return 'bg-blue-500';
    case 'approver':
      return 'bg-green-500';
    case 'system':
      return 'bg-purple-500';
    case 'viewer':
      return 'bg-gray-500';
    default:
      return 'bg-primary';
  }
};

const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="relative pl-6 pb-4 border-l border-border"
              >
                <div className="absolute left-[-5px] top-0">
                  <Avatar className="h-[24px] w-[24px]">
                    <AvatarFallback className={getRoleColor(activity.role)}>
                      {getInitials(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col space-y-1 ml-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{activity.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.role}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{activity.action}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {activity.substage}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.timestamp), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;