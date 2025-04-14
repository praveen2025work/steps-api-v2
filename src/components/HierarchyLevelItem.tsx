import React from 'react';
import { HierarchyLevel } from '@/data/hierarchicalWorkflowData';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface HierarchyLevelItemProps {
  level: HierarchyLevel;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  indentLevel: number;
  isLast: boolean;
}

const HierarchyLevelItem: React.FC<HierarchyLevelItemProps> = ({
  level,
  expanded,
  onToggle,
  onSelect,
  indentLevel,
  isLast
}) => {
  // Determine status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get level-specific styles
  const getLevelStyles = () => {
    switch (level.level) {
      case 0: // Application
        return 'font-bold text-lg';
      case 1: // Asset Class
        return 'font-semibold text-md';
      default: // Workflow levels
        return 'font-medium text-sm';
    }
  };

  return (
    <div 
      className={cn(
        'flex flex-col border-l-2 border-transparent',
        !isLast && 'mb-1'
      )}
    >
      <div 
        className={cn(
          'flex items-center p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors',
          'border-l-2',
          level.level === 0 ? 'border-primary' : 
          level.level === 1 ? 'border-blue-500' : 
          'border-green-500'
        )}
        style={{ paddingLeft: `${(indentLevel * 12) + 8}px` }}
        onClick={onSelect}
      >
        <button 
          className="p-1 mr-1 rounded-full hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {expanded ? 
            <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
        </button>
        
        <div className="flex-1 flex items-center">
          <span className={getLevelStyles()}>{level.name}</span>
          <Badge 
            variant="outline" 
            className={cn(
              'ml-2 text-xs',
              getStatusColor(level.status)
            )}
          >
            {level.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{level.progress}%</span>
          <div className="w-24">
            <Progress value={level.progress} className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchyLevelItem;