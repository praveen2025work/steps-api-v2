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
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'requires_attention':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'requires_attention':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'blocked':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
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
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const isOverdue = new Date(item.dueDate) < new Date();
  const hasFiles = item.files.length > 0;
  const hasComments = item.comments.length > 0;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md",
        isOverdue && "border-red-200 bg-red-50/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(item.status)}
                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-2">
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(item.priority))}>
                {item.priority}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", getStatusColor(item.status))}>
                {item.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Process Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{item.processName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{item.businessDate}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{item.metadata.application}</span>
            <span className="mx-1">•</span>
            <span>{item.metadata.stage}</span>
            <span className="mx-1">•</span>
            <span>{item.metadata.substage}</span>
          </div>

          {/* Suggested Action */}
          {item.suggestedAction && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
              <p className="text-xs text-blue-800 font-medium">
                💡 {item.suggestedAction}
              </p>
            </div>
          )}

          {/* Due Date and Assignment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <div className={cn(
                "flex items-center gap-1",
                isOverdue && "text-red-600 font-medium"
              )}>
                <Clock className="h-3 w-3" />
                <span>Due: {formatDate(item.dueDate)}</span>
              </div>
              {item.assignedTo && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{item.assignedTo}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {hasFiles && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  <span>{item.files.length}</span>
                </div>
              )}
              {hasComments && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>{item.comments.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!item.assignedTo && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignToMe();
                }}
                className="flex-1 text-xs h-7"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Assign to Me
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTriggerAction();
              }}
              className="flex-1 text-xs h-7"
              disabled={item.status === 'blocked'}
            >
              <Zap className="h-3 w-3 mr-1" />
              Trigger Action
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClick}
              className="text-xs h-7 px-2"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};