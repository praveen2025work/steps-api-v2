import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  Lock,
  User,
  FileText,
  ArrowRightLeft,
  Settings,
  Zap,
  Play,
  RotateCw,
  FastForward,
  SkipForward,
  Mail,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileIcon } from './DocumentsList';
import SubStageTaskItem, { Task } from './SubStageTaskItem';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentsList from './DocumentsList';
import { Drawer } from '@/components/ui/drawer';
import { SubStage, StageStatus } from '@/types/workflow';

interface SubStagesListProps {
  subStages: SubStage[];
  onSubStageClick?: (subStage: SubStage) => void;
  selectedSubStage?: SubStage | null;
}

const MENU_ITEMS = [
  { key: 'locked', label: 'Locked', group: 'Workflow Controls' },
  { key: 'adhoc', label: 'Adhoc Stage', group: 'Workflow Controls' },
  { key: 'reset', label: 'Reset Adhoc', group: 'Workflow Controls' },
  { key: 'reopen', label: 'Reopen Toll Gate', group: 'Workflow Controls' },
  { key: 'refresh', label: 'Refresh', group: 'Workflow Controls' },
  { key: 'activity', label: 'Activity', group: 'Information' },
  { key: 'roles', label: 'Roles', group: 'Information' },
  { key: 'appParams', label: 'App Parameters', group: 'Information' },
  { key: 'globalParams', label: 'Global Parameters', group: 'Information' },
  { key: 'dependency', label: 'Dependency', group: 'Information' },
  { key: 'overview', label: 'Overview', group: 'Views' },
  { key: 'documents', label: 'Documents', group: 'Views' },
];

// Sample documents for demonstration
const sampleDocuments = [
  {
    id: 'doc-1',
    name: 'input_data.xlsx',
    type: 'excel',
    size: '2.4 MB',
    updatedAt: '2025-04-14 02:30',
    updatedBy: 'John Doe',
    category: 'download' as 'download',
    subStage: 'Data Collection',
  },
  {
    id: 'doc-2',
    name: 'validation_report.pdf',
    type: 'pdf',
    size: '1.2 MB',
    updatedAt: '2025-04-14 02:45',
    updatedBy: 'System',
    category: 'download' as 'download',
    subStage: 'Validation',
  },
];

const getStatusVariant = (status: StageStatus) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'in-progress':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'skipped':
      return 'outline';
    default:
      return 'default';
  }
};

const SubStagesList: React.FC<SubStagesListProps> = ({ 
  subStages, 
  onSubStageClick,
  selectedSubStage 
}) => {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedStages(newExpanded);
  };

  return (
    <div className="space-y-4">
      {subStages.map((stage) => {
        const isExpanded = expandedStages.has(stage.id);
        const isSelected = selectedSubStage?.id === stage.id;
        const isInProgress = stage.status === 'in-progress';

        return (
          <Card 
            key={stage.id}
            className={`p-4 cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSubStageClick?.(stage)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{stage.name}</h3>
                  <Badge variant={getStatusVariant(stage.status)}>
                    {stage.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Progress 
                      value={stage.progress} 
                      className={isInProgress ? 'animate-pulse' : ''}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                    {isInProgress ? '...' : `${stage.progress}%`}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  {stage.timing?.start && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(stage.timing.start).toLocaleString()}
                    </span>
                  )}
                  {stage.duration && (
                    <span className="flex items-center gap-1 ml-4">
                      <Clock className="h-3 w-3" />
                      {stage.duration}s
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(stage.id);
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                {stage.message && (
                  <div className="text-sm text-gray-600">{stage.message}</div>
                )}
                {stage.config && (
                  <div className="flex gap-2">
                    {stage.config.canTrigger && (
                      <Button size="sm">Trigger</Button>
                    )}
                    {stage.config.canRerun && (
                      <Button size="sm" variant="outline">Rerun</Button>
                    )}
                    {stage.config.canSkip && (
                      <Button size="sm" variant="outline">Skip</Button>
                    )}
                  </div>
                )}
                {stage.dependencies && stage.dependencies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Dependencies</h4>
                    <div className="space-y-2">
                      {stage.dependencies.map((dep, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{dep.name}</span>
                          <Badge variant={getStatusVariant(dep.status as StageStatus)}>
                            {dep.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default SubStagesList;