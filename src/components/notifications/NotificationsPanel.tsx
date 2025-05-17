import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  MessageSquare, 
  RefreshCw,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Notification } from './NotificationsCenter';
import { generateMockNotifications } from '@/data/notificationsData';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Load notifications when panel opens
    if (isOpen) {
      const mockNotifications = generateMockNotifications();
      setNotifications(mockNotifications);
    }
  }, [isOpen]);

  const hasUnreadNotifications = notifications.some(n => !n.isRead);
  
  const markAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    ));
    
    // Navigate based on notification type
    if (notification.workflowId) {
      router.push(`/workflow/${notification.workflowId}`);
      onClose();
    } else if (notification.processId) {
      router.push(`/process/${notification.processId}`);
      onClose();
    } else if (notification.applicationId) {
      router.push(`/application/${notification.applicationId}`);
      onClose();
    }
  };

  const refreshNotifications = () => {
    const mockNotifications = generateMockNotifications();
    setNotifications(mockNotifications);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejection':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg">Notifications</h3>
            <Badge variant="outline" className="ml-2">
              {notifications.length}
            </Badge>
            {hasUnreadNotifications && (
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {notifications.filter(n => !n.isRead).length} unread
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={refreshNotifications}
              title="Refresh notifications"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b hover:bg-accent/50 cursor-pointer ${!notification.isRead ? 'bg-accent/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium flex items-center gap-2 truncate">
                          {notification.title}
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full inline-block flex-shrink-0"></span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                      
                      <div className="mt-2 flex justify-end">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={(e) => markAsRead(notification.id, e)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={refreshNotifications}
              >
                Refresh
              </Button>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="w-full text-sm h-9"
              onClick={markAllAsRead}
              disabled={!hasUnreadNotifications}
            >
              Mark all as read
            </Button>
            <Button 
              variant="default" 
              className="w-full text-sm h-9"
              onClick={() => {
                router.push("/notifications");
                onClose();
              }}
            >
              View all notifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;