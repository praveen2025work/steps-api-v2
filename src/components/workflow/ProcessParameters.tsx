import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Edit, Save, X } from 'lucide-react';
import { showSuccessToast } from '@/lib/toast';

interface Parameter {
  name: string;
  value: string;
  description: string;
  isEditing?: boolean;
}

interface ProcessParametersProps {
  processId: string;
  processName: string;
}

const ProcessParameters: React.FC<ProcessParametersProps> = ({ processId, processName }) => {
  // Get the workflow summary data from global storage
  const summaryData = (window as any).currentWorkflowSummary;
  
  // Extract process parameters from the summary data
  const processParams = summaryData?.processParams || [];
  
  console.log('[ProcessParameters] Debug info:', {
    processId,
    processName,
    processParamsLength: processParams.length,
    sampleProcessParam: processParams[0],
    allProcessIds: processParams.map((p: any) => p.workflow_Process_Id)
  });
  
  // Extract the numeric process ID from the processId string (e.g., "PROC-1237" -> "1237")
  let numericProcessId = processId;
  if (processId.startsWith('PROC-')) {
    numericProcessId = processId.replace('PROC-', '');
  } else if (processId.startsWith('task-')) {
    numericProcessId = processId.replace('task-', '');
  }
  
  // Filter parameters for the current process - try multiple matching strategies
  const currentProcessParams = processParams.filter((param: any) => {
    if (!param.workflow_Process_Id) return false;
    
    const paramProcessId = param.workflow_Process_Id?.toString();
    
    // Try exact matches with different formats
    const matches = [
      // Direct workflow_Process_Id match (exact)
      paramProcessId === numericProcessId,
      // Match with original processId format
      paramProcessId === processId,
      // Match with PROC- prefix
      paramProcessId === `PROC-${numericProcessId}`,
      // Match with task- prefix
      paramProcessId === `task-${numericProcessId}`,
      // Try parsing as number and comparing
      parseInt(paramProcessId) === parseInt(numericProcessId)
    ];
    
    return matches.some(match => match);
  });

  console.log('[ProcessParameters] Filtered parameters:', {
    processId,
    numericProcessId,
    currentProcessParamsLength: currentProcessParams.length,
    currentProcessParams: currentProcessParams.slice(0, 3), // Show first 3 for debugging
    allProcessIds: processParams.map((p: any) => p.workflow_Process_Id).slice(0, 10) // Show first 10 process IDs
  });

  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingParam, setEditingParam] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');

  // Transform API data to display format with better field mapping
  const parameters = currentProcessParams.map((param: any, index: number) => {
    // Use parameterName as the primary name field
    const paramName = param.parameterName || param.resolvedParameterName || param.parameter_Name || `Parameter ${index + 1}`;
    
    // Use parameterValue as the primary value field
    const paramValue = param.parameterValue || param.resolvedParameterValue || param.parameter_Value || param.value || 'Not Set';
    
    // Create a meaningful description
    let description = param.description || param.parameter_Description;
    if (!description) {
      if (param.substage_Name && param.substage_Name !== 'parameterName') {
        description = `Parameter for ${param.substage_Name}`;
      } else {
        description = `Process parameter for ${processName}`;
      }
    }
    
    return {
      workflow_Process_Id: param.workflow_Process_Id,
      name: paramName,
      value: paramValue,
      description: description,
      isEditing: false,
      // Additional fields for debugging
      rawParam: param
    };
  });

  const filteredParameters = parameters.filter((param: any) => 
    param.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    param.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (param: any) => {
    setEditingParam(param.workflow_Process_Id + param.name);
    setEditValue(param.value);
  };

  const handleSave = (param: any) => {
    // In a real application, this would make an API call to update the parameter
    setEditingParam(null);
    showSuccessToast(`Parameter ${param.name} updated successfully`);
  };

  const handleCancel = () => {
    setEditingParam(null);
    setEditValue('');
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh - in real app this would refetch data
    setTimeout(() => {
      setLoading(false);
      showSuccessToast("Process parameters refreshed successfully");
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Process Parameters</h3>
          <p className="text-sm text-muted-foreground">
            {processId} - {processName}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search parameters..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[40%]">Value</TableHead>
              <TableHead className="w-[30%]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading parameters...
                </TableCell>
              </TableRow>
            ) : filteredParameters.length > 0 ? (
              filteredParameters.map((param: any, index: number) => {
                const paramKey = param.workflow_Process_Id + param.name;
                const isEditing = editingParam === paramKey;
                
                return (
                  <TableRow key={paramKey}>
                    <TableCell className="font-medium">{param.name}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8"
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSave(param)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{param.value}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(param)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{param.description}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                    <p>No process parameters found</p>
                    <p className="text-xs">Parameters will appear here when available for this process</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProcessParameters;