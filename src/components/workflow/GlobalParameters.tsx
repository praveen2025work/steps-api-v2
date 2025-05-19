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
  // Mock data for global parameters
  const [parameters, setParameters] = React.useState<GlobalParameter[]>([
    { name: 'ENV', value: 'PRODUCTION', description: 'Environment', category: 'system' },
    { name: 'LOG_LEVEL', value: 'INFO', description: 'Logging level', category: 'system' },
    { name: 'BUSINESS_DATE', value: '2025-05-19', description: 'Current business date', category: 'business' },
    { name: 'REGION', value: 'EMEA', description: 'Operating region', category: 'business' },
    { name: 'AUTH_TIMEOUT', value: '1800', description: 'Authentication timeout in seconds', category: 'security' },
    { name: 'MAX_LOGIN_ATTEMPTS', value: '5', description: 'Maximum login attempts before lockout', category: 'security' },
  ]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

  const filteredParameters = parameters.filter(param => 
    (param.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     param.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === null || param.category === categoryFilter)
  );

  const handleRefresh = () => {
    // In a real application, this would fetch fresh data
    showSuccessToast("Global parameters refreshed successfully");
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