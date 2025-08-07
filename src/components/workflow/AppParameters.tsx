import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Info, Plus, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useApplicationParameters } from '@/hooks/useWorkflowService';
import { ApplicationParameter } from '@/types/application-types';

interface AppParametersProps {
  processId: string;
  processName: string;
}

const AppParameters: React.FC<AppParametersProps> = ({ processId, processName }) => {
  // Get the workflow summary data from the WorkflowDetailView component
  const summaryData = React.useMemo(() => {
    // Try to get from global window first (fallback)
    const globalSummary = (window as any).currentWorkflowSummary;
    // In the future, this should be passed as a prop from WorkflowDetailView
    return globalSummary;
  }, []);

  const applicationData = React.useMemo(() => {
    // Try to get from global window first (fallback)
    const globalApp = (window as any).currentWorkflowApplication;
    // In the future, this should be passed as a prop from WorkflowDetailView
    return globalApp;
  }, []);
  
  // Extract app parameters from the summary data
  const appParams = summaryData?.appParams || [];
  const applications = summaryData?.applications || [];
  
  // Find the current application info
  const currentApp = applications.find((app: any) => 
    app.appId === applicationData?.appId
  ) || { appId: applicationData?.appId || 0, name: 'Unknown Application' };

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [searchTerm, setSearchTerm] = React.useState('');

  // Transform API data to display format
  const parameters = React.useMemo(() => {
    if (!appParams || appParams.length === 0) return [];
    
    return appParams.map((param: any) => ({
      param_Id: param.param_Id,
      name: param.name,
      value: param.value,
      updatedBy: param.updatedBy,
      updatedOn: param.updatedOn
    }));
  }, [appParams]);

  const filteredParameters = parameters.filter((param: any) => 
    param.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    param.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh - in real app this would refetch data
    setTimeout(() => {
      setLoading(false);
      showSuccessToast("Application parameters refreshed successfully");
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Application Parameters</h3>
          <p className="text-sm text-muted-foreground">
            {currentApp.name} (ID: {currentApp.appId})
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
              <TableHead className="w-[30%]">Updated By</TableHead>
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
              filteredParameters.map((param: any) => (
                <TableRow key={param.param_Id}>
                  <TableCell className="font-medium">{param.name}</TableCell>
                  <TableCell className="font-mono text-sm">{param.value}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {param.updatedBy}
                    {param.updatedOn && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(param.updatedOn).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Info className="h-8 w-8 text-muted-foreground/50" />
                    <p>No application parameters found</p>
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

export default AppParameters;