import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { showSuccessToast } from '@/lib/toast';

interface AppParameter {
  name: string;
  value: string;
  description: string;
  isGlobal: boolean;
}

interface AppParametersProps {
  processId: string;
  processName: string;
}

const AppParameters: React.FC<AppParametersProps> = ({ processId, processName }) => {
  // Mock data for application parameters
  const [parameters, setParameters] = React.useState<AppParameter[]>([
    { name: 'APP_TIMEOUT', value: '3600', description: 'Application timeout in seconds', isGlobal: false },
    { name: 'MAX_RETRIES', value: '3', description: 'Maximum number of retries', isGlobal: false },
    { name: 'DATA_REFRESH_INTERVAL', value: '15', description: 'Data refresh interval in minutes', isGlobal: false },
    { name: 'NOTIFICATION_ENABLED', value: 'true', description: 'Enable notifications for this application', isGlobal: false },
    { name: 'ERROR_THRESHOLD', value: '5', description: 'Error threshold before alerting', isGlobal: false },
  ]);

  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredParameters = parameters.filter(param => 
    param.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    param.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    // In a real application, this would fetch fresh data
    showSuccessToast("Application parameters refreshed successfully");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Application Parameters</CardTitle>
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
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead className="w-[30%]">Value</TableHead>
                <TableHead className="w-[40%]">Description</TableHead>
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
                                <Info className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Application-level parameter</p>
                              <p>Affects all processes in this application</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    No application parameters found
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

export default AppParameters;