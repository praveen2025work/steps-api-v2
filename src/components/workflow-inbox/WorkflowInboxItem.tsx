import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  PlayCircle, 
  Calendar,
  FileText,
  MessageSquare,
  ArrowRight,
  UserPlus,
  Zap,
  Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowInboxItemData } from './WorkflowInboxDashboard';

interface WorkflowInboxItemProps {
  item: WorkflowInboxItemData;
  isSelected: boolean;
  onClick: () => void;
  onAssignToMe: () => void;
  onTriggerAction: () => void;
}

export const WorkflowInboxItem: React.FC<WorkflowInboxItemProps> = ({
  item,
  isSelected,
  onClick,
  onAssignToMe,
  onTriggerAction
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="h-3 w-3 text-blue-500" />;
      case 'requires_attention':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'blocked':
        return <AlertCircle className="h-3 w-3 text-orange-500" />;
      default:
        return <Clock className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = new Date(item.dueDate) < new Date();

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-sm border-l-4",
        isSelected && "ring-1 ring-primary shadow-sm bg-primary/5",
        isOverdue && "border-l-red-500",
        !isOverdue && item.priority === 'high' && "border-l-red-500",
        !isOverdue && item.priority === 'medium' && "border-l-yellow-500",
        !isOverdue && item.priority === 'low' && "border-l-green-500"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(item.status)}
                <h3 className="font-medium text-sm truncate">{item.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <div className={cn("w-2 h-2 rounded-full", getPriorityColor(item.priority))}></div>
              {item.assignedTo && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {item.assignedTo === 'You' ? 'Me' : item.assignedTo.split(' ')[0]}
                </Badge>
              )}
            </div>
          </div>

          {/* Stage Info */}
          <div className="text-xs text-muted-foreground">
            <span>{item.metadata.stage}</span>
            <span className="mx-1">•</span>
            <span>{item.metadata.substage}</span>
          </div>

          {/* Due Date and Actions */}
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue && "text-red-600 font-medium"
            )}>
              <Clock className="h-3 w-3" />
              <span>{formatDate(item.dueDate)}</span>
            </div>
            
            <div className="flex gap-1">
              {!item.assignedTo && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignToMe();
                  }}
                  className="text-xs h-6 px-2"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Assign
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerAction();
                }}
                className="text-xs h-6 px-2"
                disabled={item.status === 'blocked'}
              >
                <Zap className="h-3 w-3 mr-1" />
                Action
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};