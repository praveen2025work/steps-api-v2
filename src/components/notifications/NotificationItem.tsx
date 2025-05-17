import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Check, 
  X, 
  Info, 
  AlertTriangle, 
  MoreVertical, 
  Eye, 
  Trash, 
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Notification } from './NotificationsCenter';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete }: NotificationItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'approval':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejection':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBadge = () => {
    switch (notification.type) {
      case 'approval':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approval</Badge>;
      case 'rejection':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejection</Badge>;
      case 'info':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Information</Badge>;
      case 'alert':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Alert</Badge>;
      default:
        return <Badge variant="outline">Notification</Badge>;
    }
  };

  const getActionLink = () => {
    if (notification.workflowId) {
      return `/workflow/${notification.workflowId}`;
    }
    if (notification.processId) {
      return `/process/${notification.processId}`;
    }
    if (notification.applicationId) {
      return `/application/${notification.applicationId}`;
    }
    return '#';
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card className={`w-full transition-all ${notification.isRead ? 'bg-card' : 'bg-muted/20 border-l-4 border-l-primary'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-base font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h4>
                  {getTypeBadge()}
                  {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={notification.sender.avatar} alt={notification.sender.name} />
                    <AvatarFallback className="text-xs">{notification.sender.initials}</AvatarFallback>
                  </Avatar>
                  <span>{notification.sender.name}</span>
                  <span>•</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(notification.timestamp, 'PPpp')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={toggleExpand}>
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!notification.isRead && (
                      <DropdownMenuItem onClick={handleMarkAsRead}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark as read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleDelete}>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className={`text-sm ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'} ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.message}
            </div>
            
            {isExpanded && (
              <div className="mt-4 flex justify-end">
                <Link href={getActionLink()}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    View details
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;