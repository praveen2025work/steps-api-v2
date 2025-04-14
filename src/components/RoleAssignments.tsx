import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

type UserActivity = {
  name: string;
  lastActivity: string;
  timestamp: string;
};

type RoleAssignmentsProps = {
  roleAssignments: {
    [key: string]: UserActivity[];
  };
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getTimeAgo = (timestamp: string) => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    return 'Unknown time';
  }
};

const RoleAssignments: React.FC<RoleAssignmentsProps> = ({ roleAssignments }) => {
  const roleLabels = {
    producer: 'Producer',
    approver: 'Approver',
    viewer: 'Viewer',
  };

  const roleColors = {
    producer: 'bg-blue-500',
    approver: 'bg-green-500',
    viewer: 'bg-gray-500',
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Role Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="producer" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            {Object.keys(roleAssignments).map((role) => (
              <TabsTrigger key={role} value={role}>
                {roleLabels[role as keyof typeof roleLabels] || role}{' '}
                <Badge variant="secondary" className="ml-2">
                  {roleAssignments[role].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(roleAssignments).map(([role, users]) => (
            <TabsContent key={role} value={role} className="mt-0">
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-4">
                  {users.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-3 rounded-md bg-secondary/30"
                    >
                      <Avatar>
                        <AvatarFallback className={roleColors[role as keyof typeof roleColors] || 'bg-primary'}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{user.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(user.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.lastActivity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RoleAssignments;