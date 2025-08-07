import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { showSuccessToast } from '@/lib/toast';

interface GlobalParameter {
  name: string;
  value: string;
  description: string;
  category: 'system' | 'business' | 'security';
}

interface GlobalParametersProps {
  processId: string;
  processName: string;
}

const GlobalParameters: React.FC<GlobalParametersProps> = ({ processId, processName }) => {
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
  
  // Extract daily parameters from the summary data
  const dailyParams = summaryData?.dailyParams || [];
  const applications = summaryData?.applications || [];
  
  // Find the current application info
  const currentApp = applications.find((app: any) => 
    app.appId === applicationData?.appId
  ) || { appId: applicationData?.appId || 0, name: 'Unknown Application' };

  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

  // Transform API data to display format
  const parameters = React.useMemo(() => {
    if (!dailyParams || dailyParams.length === 0) return [];
    
    return dailyParams.map((param: any) => ({
      name: param.name,
      value: param.value,
      description: param.comments || 'No description available',
      category: param.name.includes('AUTH') || param.name.includes('SECURITY') ? 'security' :
                param.name.includes('DATE') || param.name.includes('REGION') ? 'business' : 'system',
      isEditable: param.isEditable === 'Y',
      updatedBy: param.updatedBy,
      updatedOn: param.updatedOn,
      businessDate: param.businessDate
    }));
  }, [dailyParams]);

  const filteredParameters = parameters.filter((param: any) => 
    (param.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     param.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === null || param.category === categoryFilter)
  );

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh - in real app this would refetch data
    setTimeout(() => {
      setLoading(false);
      showSuccessToast("Daily parameters refreshed successfully");
    }, 1000);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'system':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">System</Badge>;
      case 'business':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">Business</Badge>;
      case 'security':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">Security</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Global Parameters</CardTitle>
        <p className="text-sm text-muted-foreground">
          {processId} - {processName}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parameters..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={categoryFilter === null ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setCategoryFilter(null)}
            >
              All
            </Button>
            <Button 
              variant={categoryFilter === 'system' ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setCategoryFilter('system')}
            >
              System
            </Button>
            <Button 
              variant={categoryFilter === 'business' ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setCategoryFilter('business')}
            >
              Business
            </Button>
            <Button 
              variant={categoryFilter === 'security' ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setCategoryFilter('security')}
            >
              Security
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[25%]">Value</TableHead>
                <TableHead className="w-[25%]">Description</TableHead>
                <TableHead className="w-[25%]">Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParameters.length > 0 ? (
                filteredParameters.map((param) => (
                  <TableRow key={param.name}>
                    <TableCell className="font-medium">{param.name}</TableCell>
                    <TableCell>{param.value}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">{param.description}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                <Globe className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Global parameter</p>
                              <p>Affects all applications and processes</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(param.category)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No global parameters found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalParameters;