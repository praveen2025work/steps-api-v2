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
  // Get the workflow summary data from global storage
  const summaryData = (window as any).currentWorkflowSummary;
  
  // Extract dependency and process data from the summary
  const dependencyData = summaryData?.dependencyData || [];
  const processData = summaryData?.processData || [];
  const fileData = summaryData?.fileData || [];
  
  console.log('[ProcessDependencies] Debug info:', {
    processId,
    processName,
    dependencyDataLength: dependencyData.length,
    processDataLength: processData.length,
    fileDataLength: fileData.length,
    sampleDependency: dependencyData[0],
    sampleProcess: processData[0]
  });
  
  // Extract the numeric process ID from the processId string (e.g., "PROC-1237" -> "1237")
  const numericProcessId = processId.replace('PROC-', '');
  
  // Find the current process in processData
  const currentProcess = processData.find((p: any) => 
    p.workflow_Process_Id?.toString() === numericProcessId
  );
  
  console.log('[ProcessDependencies] Current process:', currentProcess);
  
  // Get dependencies for the current process
  const currentProcessDependencies = dependencyData.filter((dep: any) => 
    dep.workflow_Process_Id?.toString() === numericProcessId
  );
  
  // Get processes that depend on the current process (child dependencies)
  const childDependencies = dependencyData.filter((dep: any) => 
    dep.dependency_Substage_Id === currentProcess?.subStage_Id
  );
  
  console.log('[ProcessDependencies] Dependencies found:', {
    currentProcessDependencies: currentProcessDependencies.length,
    childDependencies: childDependencies.length
  });
  
  // Transform parent dependencies (processes this process depends on)
  const mockParentDependencies: Dependency[] = currentProcessDependencies.map((dep: any) => {
    // Find the dependency process details
    const depProcess = processData.find((p: any) => 
      p.subStage_Id === dep.dependency_Substage_Id
    );
    
    // Get files for this dependency process
    const depFiles = fileData.filter((file: any) => 
      file.workflow_Process_Id === depProcess?.workflow_Process_Id
    ).map((file: any) => ({
      id: `file-${file.workflow_Process_Id}-${file.name}`,
      name: file.name || 'Unknown File',
      type: file.name?.split('.').pop()?.toUpperCase() || 'Unknown',
      size: file.value || 'Unknown Size',
      lastModified: file.updatedon || new Date().toISOString().split('T')[0]
    }));
    
    // Map status
    let status = 'not-started';
    const depStatus = (dep.dep_Status || '').toUpperCase().trim();
    switch (depStatus) {
      case 'COMPLETED':
      case 'COMPLETE':
        status = 'completed';
        break;
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
      case 'RUNNING':
        status = 'in progress';
        break;
      case 'FAILED':
      case 'ERROR':
        status = 'failed';
        break;
      case 'SKIPPED':
      case 'SKIP':
        status = 'skipped';
        break;
    }
    
    return {
      id: `parent-${dep.dependency_Substage_Id}`,
      name: depProcess?.subStage_Name || `Dependency ${dep.dependency_Substage_Id}`,
      type: depProcess?.auto === 'Y' ? 'auto' : 'manual',
      status: status,
      progress: status === 'completed' ? 100 : (status === 'in progress' ? 50 : 0),
      processId: `PROC-${depProcess?.workflow_Process_Id || dep.dependency_Substage_Id}`,
      files: depFiles
    };
  });
  
  // Transform child dependencies (processes that depend on this process)
  const mockChildDependencies: Dependency[] = childDependencies.map((dep: any) => {
    // Find the process that has this dependency
    const childProcess = processData.find((p: any) => 
      p.workflow_Process_Id === dep.workflow_Process_Id
    );
    
    // Get files for this child process
    const childFiles = fileData.filter((file: any) => 
      file.workflow_Process_Id === dep.workflow_Process_Id
    ).map((file: any) => ({
      id: `file-${file.workflow_Process_Id}-${file.name}`,
      name: file.name || 'Unknown File',
      type: file.name?.split('.').pop()?.toUpperCase() || 'Unknown',
      size: file.value || 'Unknown Size',
      lastModified: file.updatedon || new Date().toISOString().split('T')[0]
    }));
    
    // Map status from the child process
    let status = 'not-started';
    const childStatus = (childProcess?.status || '').toUpperCase().trim();
    switch (childStatus) {
      case 'COMPLETED':
      case 'COMPLETE':
        status = 'completed';
        break;
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
      case 'RUNNING':
        status = 'in progress';
        break;
      case 'FAILED':
      case 'ERROR':
        status = 'failed';
        break;
      case 'SKIPPED':
      case 'SKIP':
        status = 'skipped';
        break;
    }
    
    return {
      id: `child-${dep.workflow_Process_Id}`,
      name: childProcess?.subStage_Name || `Process ${dep.workflow_Process_Id}`,
      type: childProcess?.auto === 'Y' ? 'auto' : 'manual',
      status: status,
      progress: status === 'completed' ? 100 : (status === 'in progress' ? 50 : 0),
      processId: `PROC-${dep.workflow_Process_Id}`,
      files: childFiles
    };
  });

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
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return "bg-green-500";
        case 'in progress':
          return "bg-blue-500";
        case 'skipped':
          return "bg-amber-500";
        case 'failed':
          return "bg-red-500";
        default:
          return "bg-gray-500";
      }
    };

    return (
      <div key={dependency.id} className="mb-3 border rounded-md overflow-hidden relative">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(dependency.status)}`}></div>
        <div className="p-2 pl-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{dependency.name}</p>
              <p className="text-xs text-muted-foreground">ID: {dependency.processId}</p>
            </div>
            <div className="flex items-center gap-2">
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
          
          {dependency.files && dependency.files.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium mb-1">Files:</p>
              <div className="flex flex-wrap gap-1">
                {dependency.files.map(file => (
                  <Button 
                    key={file.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center text-xs h-7 px-2"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {file.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
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