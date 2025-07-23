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
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification } from '@/types/workflow-types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const router = useRouter();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications 
  } = useNotifications();

  const hasUnreadNotifications = notifications.some(n => !n.isRead);
  
  const handleMarkAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    
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

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return &lt;CheckCircle className="h-4 w-4 text-green-500" /&gt;;
      case 'rejection':
        return &lt;AlertCircle className="h-4 w-4 text-red-500" /&gt;;
      case 'info':
        return &lt;MessageSquare className="h-4 w-4 text-blue-500" /&gt;;
      case 'alert':
        return &lt;AlertTriangle className="h-4 w-4 text-amber-500" /&gt;;
      default:
        return &lt;Bell className="h-4 w-4" /&gt;;
    }
  };

  return (
    &lt;div 
      className={`fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    &gt;
      &lt;div className="flex flex-col h-full"&gt;
        &lt;div className="flex justify-between items-center p-4 border-b"&gt;
          &lt;div className="flex items-center gap-2"&gt;
            &lt;h3 className="font-medium text-lg"&gt;Notifications&lt;/h3&gt;
            &lt;Badge variant="outline" className="ml-2"&gt;
              {notifications.length}
            &lt;/Badge&gt;
            {hasUnreadNotifications && (
              &lt;Badge variant="secondary" className="bg-primary/20 text-primary"&gt;
                {notifications.filter(n => !n.isRead).length} unread
              &lt;/Badge&gt;
            )}
          &lt;/div&gt;
          &lt;div className="flex items-center gap-1"&gt;
            &lt;Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={refreshNotifications}
              title="Refresh notifications"
            &gt;
              &lt;RefreshCw className="h-4 w-4" /&gt;
            &lt;/Button&gt;
            &lt;Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onClose}
              title="Close"
            &gt;
              &lt;X className="h-4 w-4" /&gt;
            &lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;ScrollArea className="flex-1"&gt;
          {notifications.length > 0 ? (
            &lt;div&gt;
              {notifications.map((notification) => (
                &lt;div 
                  key={notification.id}
                  className={`p-4 border-b hover:bg-accent/50 cursor-pointer ${!notification.isRead ? 'bg-accent/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                &gt;
                  &lt;div className="flex items-start gap-3"&gt;
                    &lt;div className="mt-0.5 flex-shrink-0"&gt;
                      {getNotificationIcon(notification.type)}
                    &lt;/div&gt;
                    &lt;div className="flex-1 min-w-0"&gt;
                      &lt;div className="flex justify-between items-start"&gt;
                        &lt;p className="text-sm font-medium flex items-center gap-2 truncate"&gt;
                          {notification.title}
                          {!notification.isRead && (
                            &lt;span className="w-2 h-2 bg-primary rounded-full inline-block flex-shrink-0" aria-label="Unread"&gt;&lt;/span&gt;
                          )}
                        &lt;/p&gt;
                        &lt;span className="text-xs text-muted-foreground ml-2 flex-shrink-0"&gt;
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        &lt;/span&gt;
                      &lt;/div&gt;
                      &lt;p className="text-sm text-muted-foreground mt-1 line-clamp-2"&gt;{notification.message}&lt;/p&gt;
                      
                      &lt;div className="mt-2 flex justify-end"&gt;
                        {!notification.isRead && (
                          &lt;Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                          &gt;
                            &lt;Check className="h-3 w-3 mr-1" /&gt;
                            Mark as Read
                          &lt;/Button&gt;
                        )}
                      &lt;/div&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              ))}
            &lt;/div&gt;
          ) : (
            &lt;div className="p-8 text-center"&gt;
              &lt;Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" /&gt;
              &lt;p className="text-muted-foreground"&gt;No notifications&lt;/p&gt;
              &lt;Button 
                variant="outline" 
                className="mt-4"
                onClick={refreshNotifications}
              &gt;
                Refresh
              &lt;/Button&gt;
            &lt;/div&gt;
          )}
        &lt;/ScrollArea&gt;
        
        &lt;div className="p-4 border-t"&gt;
          &lt;div className="flex gap-2"&gt;
            &lt;Button 
              variant="outline" 
              className="w-full text-sm h-9"
              onClick={markAllAsRead}
              disabled={!hasUnreadNotifications}
            &gt;
              Mark all as read
            &lt;/Button&gt;
            &lt;Button 
              variant="default" 
              className="w-full text-sm h-9"
              onClick={() => {
                router.push("/notifications");
                onClose();
              }}
            &gt;
              View all notifications
            &lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default NotificationsPanel;