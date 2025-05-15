import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  User, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertTriangle,
  Calendar,
  MessageSquare,
  UserPlus,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define notification types
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
}

const Header = () => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Generate random notifications on component mount
  useEffect(() => {
    generateRandomNotifications();
  }, []);

  // Handle clicks outside the notification panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate random notifications
  const generateRandomNotifications = () => {
    const workflowNames = [
      "Q2 Financial Review", 
      "Annual Compliance Report", 
      "Daily PnL Validation", 
      "Risk Assessment", 
      "Regulatory Filing",
      "Market Data Reconciliation",
      "Client Onboarding Process",
      "Trade Reconciliation"
    ];
    
    const userNames = [
      "John Smith", 
      "Sarah Johnson", 
      "Michael Chen", 
      "Priya Patel", 
      "David Wilson",
      "Emma Rodriguez",
      "James Taylor",
      "Olivia Martinez"
    ];
    
    const timeFrames = [
      "Just now", 
      "5 min ago", 
      "30 min ago", 
      "1 hour ago", 
      "2 hours ago", 
      "Yesterday", 
      "2 days ago",
      "Last week"
    ];
    
    const notificationTypes: NotificationType[] = ['info', 'success', 'warning', 'error', 'system'];
    
    const randomNotifications: Notification[] = [];
    
    // Generate 8-12 random notifications
    const count = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < count; i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const workflow = workflowNames[Math.floor(Math.random() * workflowNames.length)];
      const user = userNames[Math.floor(Math.random() * userNames.length)];
      const time = timeFrames[Math.floor(Math.random() * timeFrames.length)];
      const read = Math.random() > 0.3; // 30% chance of being unread
      
      let title = '';
      let message = '';
      
      switch (type) {
        case 'success':
          title = "Workflow Completed";
          message = `"${workflow}" has been successfully completed.`;
          break;
        case 'warning':
          title = "Approaching Deadline";
          message = `"${workflow}" is due in 24 hours.`;
          break;
        case 'error':
          title = "Action Required";
          message = `"${workflow}" has encountered an error and requires your attention.`;
          break;
        case 'info':
          title = "New Assignment";
          message = `You have been assigned to "${workflow}" by ${user}.`;
          break;
        case 'system':
          title = "System Notification";
          message = "STEPS system will undergo maintenance on Saturday, 10:00 PM - 2:00 AM.";
          break;
      }
      
      randomNotifications.push({
        id: `notification-${i}`,
        title,
        message,
        time,
        type,
        read,
        actionUrl: type !== 'system' ? `/workflow/${workflow.toLowerCase().replace(/\s+/g, '-')}` : undefined
      });
    }
    
    // Sort by time (this is simplified since we're using text descriptions)
    randomNotifications.sort((a, b) => {
      const timeOrder = timeFrames.indexOf(a.time) - timeFrames.indexOf(b.time);
      return timeOrder;
    });
    
    setNotifications(randomNotifications);
    
    // Set unread flag if there are any unread notifications
    setHasUnreadNotifications(randomNotifications.some(n => !n.read));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as read when opening
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setHasUnreadNotifications(false);
    }
  };

  const markAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    
    // Update unread status
    const stillHasUnread = notifications.some(n => n.id !== id && !n.read);
    setHasUnreadNotifications(stillHasUnread);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    
    // Navigate if there's an action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    
    // Close notification panel
    setShowNotifications(false);
  };

  const refreshNotifications = () => {
    generateRandomNotifications();
    setShowNotifications(true);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'system':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full border-b">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <Logo />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleNotifications}
              className={showNotifications ? "bg-accent" : ""}
            >
              <Bell className="h-5 w-5" />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
            
            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-96 bg-background rounded-md shadow-lg border z-[100]"
                style={{ 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Notifications</h3>
                    <Badge variant="outline" className="ml-2">
                      {notifications.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={refreshNotifications}
                      title="Refresh notifications"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => setShowNotifications(false)}
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b hover:bg-accent/50 cursor-pointer ${!notification.read ? 'bg-accent/20' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium flex items-center gap-2">
                                  {notification.title}
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                                  )}
                                </p>
                                <span className="text-xs text-muted-foreground">{notification.time}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              
                              {notification.actionUrl && (
                                <div className="mt-2 flex justify-end">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(notification.actionUrl!);
                                      setShowNotifications(false);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                  {!notification.read && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-xs"
                                      onClick={(e) => markAsRead(notification.id, e)}
                                    >
                                      Mark as Read
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          className="w-full text-sm h-9"
                          onClick={() => {
                            // Mark all as read
                            setNotifications(notifications.map(n => ({ ...n, read: true })));
                            setHasUnreadNotifications(false);
                          }}
                        >
                          Mark all as read
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full text-sm h-9"
                          onClick={() => {
                            router.push("/notifications");
                            setShowNotifications(false);
                          }}
                        >
                          View all
                        </Button>
                      </div>
                    </>
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
                </div>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;