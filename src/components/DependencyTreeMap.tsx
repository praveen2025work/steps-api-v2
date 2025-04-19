import React from 'react';
import { Network, CheckCircle, Clock, ArrowRightCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { SubStage } from '@/types/workflow';

interface DependencyTreeMapProps {
  dependencies: SubStage[];
  onDependencyClick?: (dependency: SubStage) => void;
}

const DependencyTreeMap: React.FC<DependencyTreeMapProps> = ({ 
  dependencies,
  onDependencyClick
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'skipped':
        return <ArrowRightCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500">In Progress</Badge>;
      case 'skipped':
        return <Badge className="bg-amber-500/10 text-amber-500">Skipped</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Not Started</Badge>;
    }
  };

  const renderDependency = (dependency: SubStage, level = 0) => {
    return (
      <div key={dependency.id} className="mb-2">
        <div 
          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/10 ${level > 0 ? 'ml-6' : ''}`}
          onClick={() => onDependencyClick?.(dependency)}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(dependency.status)}
            <div>
              <p className="font-medium">{dependency.name}</p>
              {dependency.completedAt && (
                <p className="text-sm text-muted-foreground">Completed at: {dependency.completedAt}</p>
              )}
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {getStatusBadge(dependency.status)}
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to navigate to this step</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {dependency.children && dependency.children.length > 0 && (
          <div className="border-l-2 border-dashed border-muted ml-6 pl-4 mt-2">
            {dependency.children.map(child => renderDependency(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <Network className="h-6 w-6 text-primary" />
            <span className="ml-2 font-medium">Workflow Dependencies</span>
          </div>
          <div className="space-y-2">
            {dependencies.map(dep => renderDependency(dep))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DependencyTreeMap;