import React from 'react';
import { Network, CheckCircle, Clock, ArrowRightCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubStage } from '@/types/workflow';

interface ProcessDependenciesProps {
  processId: string;
  processName: string;
  dependencies?: SubStage[];
  onDependencyClick?: (dependency: SubStage) => void;
}

const ProcessDependencies: React.FC<ProcessDependenciesProps> = ({ 
  processId,
  processName,
  dependencies = [],
  onDependencyClick
}) => {
  // Mock data for parent and child dependencies
  const mockParentDependencies = [
    { 
      id: 'parent-1',
      name: 'SOD Roll',
      type: 'auto',
      status: 'completed',
      progress: 100,
      processId: 'PROC-1235',
    },
    { 
      id: 'parent-2',
      name: 'Books Open For Correction',
      type: 'auto',
      status: 'completed',
      progress: 100,
      processId: 'PROC-1236',
    }
  ];

  const mockChildDependencies = [
    { 
      id: 'child-1',
      name: 'Recurring Adjustments',
      type: 'auto',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1244',
    },
    { 
      id: 'child-2',
      name: 'Review Daily PnL-Generate DoD Movement',
      type: 'auto',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1246',
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'skipped':
        return <ArrowRightCircle className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
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
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Not Started</Badge>;
    }
  };

  const renderDependency = (dependency: SubStage) => {
    return (
      <div key={dependency.id} className="mb-2">
        <div 
          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/10"
          onClick={() => onDependencyClick?.(dependency)}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(dependency.status)}
            <div>
              <p className="font-medium">{dependency.name}</p>
              <p className="text-sm text-muted-foreground">Process ID: {dependency.processId}</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {getStatusBadge(dependency.status)}
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to navigate to this process</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Process Dependencies</CardTitle>
        <p className="text-sm text-muted-foreground">
          {processId} - {processName}
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="parent">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="parent">Parent Dependencies</TabsTrigger>
            <TabsTrigger value="child">Child Dependencies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parent">
            <div className="space-y-2">
              {mockParentDependencies.length > 0 ? (
                mockParentDependencies.map(dep => renderDependency(dep))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No parent dependencies found
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="child">
            <div className="space-y-2">
              {mockChildDependencies.length > 0 ? (
                mockChildDependencies.map(dep => renderDependency(dep))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No child dependencies found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProcessDependencies;