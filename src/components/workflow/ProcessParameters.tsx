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
  // Mock data for parameters
  const [parameters, setParameters] = React.useState<Parameter[]>([
    { name: 'BATCH_SIZE', value: '1000', description: 'Number of records to process in a batch' },
    { name: 'VALIDATION_THRESHOLD', value: '0.95', description: 'Minimum validation score' },
    { name: 'RETRY_COUNT', value: '3', description: 'Number of retry attempts' },
    { name: 'TIMEOUT_SECONDS', value: '300', description: 'Operation timeout in seconds' },
    { name: 'LOG_LEVEL', value: 'INFO', description: 'Logging level for this process' },
  ]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [editValue, setEditValue] = React.useState('');

  const filteredParameters = parameters.filter(param => 
    param.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    param.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (index: number) => {
    const newParameters = [...parameters];
    newParameters[index].isEditing = true;
    setEditValue(newParameters[index].value);
    setParameters(newParameters);
  };

  const handleSave = (index: number) => {
    const newParameters = [...parameters];
    newParameters[index].value = editValue;
    newParameters[index].isEditing = false;
    setParameters(newParameters);
    showSuccessToast(`Parameter ${newParameters[index].name} updated successfully`);
  };

  const handleCancel = (index: number) => {
    const newParameters = [...parameters];
    newParameters[index].isEditing = false;
    setParameters(newParameters);
  };

  const handleRefresh = () => {
    // In a real application, this would fetch fresh data
    showSuccessToast("Parameters refreshed successfully");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Process Parameters</CardTitle>
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
                <TableHead className="w-[30%]">Description</TableHead>
                <TableHead className="w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParameters.length > 0 ? (
                filteredParameters.map((param, index) => (
                  <TableRow key={param.name}>
                    <TableCell className="font-medium">{param.name}</TableCell>
                    <TableCell>
                      {param.isEditing ? (
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        param.value
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{param.description}</TableCell>
                    <TableCell>
                      {param.isEditing ? (
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSave(index)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCancel(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(index)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No parameters found
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

export default ProcessParameters;