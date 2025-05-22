import React from 'react';
import { Network, CheckCircle, Clock, ArrowRightCircle, XCircle, FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface DependencyFile {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
}

interface Dependency {
  id: string;
  name: string;
  type?: string;
  status: string;
  progress?: number;
  processId: string;
  files?: DependencyFile[];
}

const ProcessDependencies: React.FC<ProcessDependenciesProps> = ({ 
  processId,
  processName,
  dependencies = [],
  onDependencyClick
}) => {
  // Mock data for parent and child dependencies
  const mockParentDependencies: Dependency[] = [
    { 
      id: 'parent-1',
      name: 'SOD Roll',
      type: 'auto',
      status: 'completed',
      progress: 100,
      processId: 'PROC-1235',
      files: [
        { id: "FILE-P001", name: "sod_roll.xlsx", type: "Excel", size: "1.5 MB", lastModified: "2025-05-21" },
        { id: "FILE-P002", name: "sod_config.json", type: "JSON", size: "0.2 MB", lastModified: "2025-05-21" }
      ]
    },
    { 
      id: 'parent-2',
      name: 'Books Open For Correction',
      type: 'auto',
      status: 'completed',
      progress: 100,
      processId: 'PROC-1236',
      files: [
        { id: "FILE-P003", name: "books_status.xlsx", type: "Excel", size: "0.8 MB", lastModified: "2025-05-21" }
      ]
    }
  ];

  const mockChildDependencies: Dependency[] = [
    { 
      id: 'child-1',
      name: 'Recurring Adjustments',
      type: 'auto',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1244',
      files: [
        { id: "FILE-C001", name: "adjustments.xlsx", type: "Excel", size: "0.7 MB", lastModified: "2025-05-21" }
      ]
    },
    { 
      id: 'child-2',
      name: 'Review Daily PnL-Generate DoD Movement',
      type: 'auto',
      status: 'not-started',
      progress: 0,
      processId: 'PROC-1246',
      files: [
        { id: "FILE-C002", name: "pnl_movement.xlsx", type: "Excel", size: "1.2 MB", lastModified: "2025-05-21" },
        { id: "FILE-C003", name: "dod_report.pdf", type: "PDF", size: "2.5 MB", lastModified: "2025-05-21" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in progress':
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
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'in progress':
        return <Badge className="bg-blue-500/10 text-blue-500">In Progress</Badge>;
      case 'skipped':
        return <Badge className="bg-amber-500/10 text-amber-500">Skipped</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Not Started</Badge>;
    }
  };

  const renderDependency = (dependency: Dependency) => {
    return (
      <div key={dependency.id} className="mb-4 border rounded-lg overflow-hidden">
        <div className="p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(dependency.status)}
              <div>
                <p className="font-medium">{dependency.name}</p>
                <p className="text-xs text-muted-foreground">Process ID: {dependency.processId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(dependency.status)}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onDependencyClick?.(dependency as SubStage)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View process details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {dependency.files && dependency.files.length > 0 && (
          <div className="p-3 border-t">
            <p className="text-sm font-medium mb-2">Associated Files:</p>
            <div className="flex flex-wrap gap-2">
              {dependency.files.map(file => (
                <Button 
                  key={file.id}
                  variant="outline"
                  size="sm"
                  className="flex items-center text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {file.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">Process Dependencies</h3>
          <p className="text-sm text-muted-foreground">
            {processId} - {processName}
          </p>
        </div>
        <Network className="h-5 w-5 text-muted-foreground" />
      </div>
      
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
              <div className="text-center p-4 text-muted-foreground border rounded-md">
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
              <div className="text-center p-4 text-muted-foreground border rounded-md">
                No child dependencies found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcessDependencies;