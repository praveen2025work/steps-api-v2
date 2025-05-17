import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Check, Clock, Filter, Search, Trash, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import NotificationItem from './NotificationItem';
import { useNotifications } from '@/contexts/NotificationsContext';

export type NotificationType = 'approval' | 'rejection' | 'info' | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  sender: {
    name: string;
    avatar?: string;
    initials: string;
  };
  workflowId?: string;
  processId?: string;
  applicationId?: string;
}

const NotificationsCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Sync with global notifications
  useEffect(() => {
    // Keep only the last 20 notifications
    setLocalNotifications(notifications.slice(0, 20));
  }, [notifications]);
  
  const filteredNotifications = localNotifications.filter(notification => {
    // Filter by type
    if (filter !== 'all' && notification.type !== filter) {
      return false;
    }
    
    // Filter by read status
    if (showUnreadOnly && notification.isRead) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const deleteNotification = (id: string) => {
    setLocalNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setLocalNotifications([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Notification Center</CardTitle>
            <CardDescription>
              Manage your workflow notifications and alerts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex gap-1 items-center">
              <Bell className="h-3 w-3" />
              <span>{unreadCount} unread</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <Check className="h-4 w-4 mr-1" /> Mark all as read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllNotifications} disabled={localNotifications.length === 0}>
              <Trash className="h-4 w-4 mr-1" /> Clear all
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="unread-only" 
                checked={showUnreadOnly} 
                onCheckedChange={setShowUnreadOnly} 
              />
              <Label htmlFor="unread-only">Unread only</Label>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All notifications</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
                <SelectItem value="rejection">Rejections</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals
              {localNotifications.filter(n => n.type === 'approval').length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {localNotifications.filter(n => n.type === 'approval').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejections">
              Rejections
              {localNotifications.filter(n => n.type === 'rejection').length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {localNotifications.filter(n => n.type === 'rejection').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="other">
              Other
              {localNotifications.filter(n => n.type !== 'approval' && n.type !== 'rejection').length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {localNotifications.filter(n => n.type !== 'approval' && n.type !== 'rejection').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || filter !== 'all' || showUnreadOnly 
                      ? "No notifications match your current filters" 
                      : "You're all caught up!"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="approvals" className="mt-0">
            <div className="space-y-4">
              {filteredNotifications.filter(n => n.type === 'approval').length > 0 ? (
                filteredNotifications
                  .filter(n => n.type === 'approval')
                  .map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={deleteNotification}
                    />
                  ))
              ) : (
                <div className="text-center py-12">
                  <Check className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No approval notifications</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || showUnreadOnly 
                      ? "No approval notifications match your current filters" 
                      : "You have no pending approvals"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="rejections" className="mt-0">
            <div className="space-y-4">
              {filteredNotifications.filter(n => n.type === 'rejection').length > 0 ? (
                filteredNotifications
                  .filter(n => n.type === 'rejection')
                  .map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={deleteNotification}
                    />
                  ))
              ) : (
                <div className="text-center py-12">
                  <X className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No rejection notifications</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || showUnreadOnly 
                      ? "No rejection notifications match your current filters" 
                      : "You have no rejections"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="other" className="mt-0">
            <div className="space-y-4">
              {filteredNotifications.filter(n => n.type !== 'approval' && n.type !== 'rejection').length > 0 ? (
                filteredNotifications
                  .filter(n => n.type !== 'approval' && n.type !== 'rejection')
                  .map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={deleteNotification}
                    />
                  ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No other notifications</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || showUnreadOnly 
                      ? "No other notifications match your current filters" 
                      : "You have no other notifications"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationsCenter;