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
  applicationId: number;
  applicationName: string;
}

const AppParameters: React.FC<AppParametersProps> = ({ applicationId, applicationName }) => {
  const {
    parameters,
    loading,
    error,
    refresh,
    saveParameter,
    addParameter,
    updateParameter,
    deleteParameter
  } = useApplicationParameters(applicationId);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingParameter, setEditingParameter] = React.useState<ApplicationParameter | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    value: '',
    active: true,
    ignore: false,
    updatedBy: 'current_user' // This should come from user context
  });

  const filteredParameters = parameters.filter(param => 
    param.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    param.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    refresh();
    showSuccessToast("Application parameters refreshed successfully");
  };

  const handleAddParameter = () => {
    setEditingParameter(null);
    setFormData({
      name: '',
      value: '',
      active: true,
      ignore: false,
      updatedBy: 'current_user'
    });
    setIsDialogOpen(true);
  };

  const handleEditParameter = (parameter: ApplicationParameter) => {
    setEditingParameter(parameter);
    setFormData({
      name: parameter.name,
      value: parameter.value,
      active: parameter.active === 'Y',
      ignore: parameter.ignore === 'Y',
      updatedBy: 'current_user'
    });
    setIsDialogOpen(true);
  };

  const handleSaveParameter = async () => {
    try {
      const parameterData: ApplicationParameter = {
        appId: applicationId,
        paramId: editingParameter?.paramId || 0,
        name: formData.name,
        value: formData.value,
        active: formData.active ? 'Y' : 'N',
        ignore: formData.ignore ? 'Y' : 'N',
        updatedBy: formData.updatedBy
      };

      let success = false;
      if (editingParameter) {
        success = await updateParameter(parameterData);
      } else {
        success = await addParameter(parameterData);
      }

      if (success) {
        setIsDialogOpen(false);
        showSuccessToast(`Parameter ${editingParameter ? 'updated' : 'added'} successfully`);
      } else {
        showErrorToast(`Failed to ${editingParameter ? 'update' : 'add'} parameter`);
      }
    } catch (error) {
      showErrorToast(`Error ${editingParameter ? 'updating' : 'adding'} parameter`);
    }
  };

  const handleDeleteParameter = async (paramId: number, paramName: string) => {
    if (confirm(`Are you sure you want to delete parameter "${paramName}"?`)) {
      const success = await deleteParameter(paramId);
      if (success) {
        showSuccessToast(`Parameter "${paramName}" deleted successfully`);
      } else {
        showErrorToast(`Failed to delete parameter "${paramName}"`);
      }
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Application Parameters</CardTitle>
          <p className="text-sm text-muted-foreground">
            Application ID: {applicationId} - {applicationName}
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Error loading parameters: {error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Application Parameters</CardTitle>
        <p className="text-sm text-muted-foreground">
          Application ID: {applicationId} - {applicationName}
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
            <Button variant="outline" size="sm" onClick={handleAddParameter}>
              <Plus className="h-4 w-4 mr-2" />
              Add Parameter
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[20%]">Updated By</TableHead>
                <TableHead className="w-[15%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading parameters...
                  </TableCell>
                </TableRow>
              ) : filteredParameters.length > 0 ? (
                filteredParameters.map((param) => (
                  <TableRow key={param.paramId}>
                    <TableCell className="font-medium">{param.name}</TableCell>
                    <TableCell className="font-mono text-sm">{param.value}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={param.active === 'Y' ? 'default' : 'secondary'}>
                          {param.active === 'Y' ? 'Active' : 'Inactive'}
                        </Badge>
                        {param.ignore === 'Y' && (
                          <Badge variant="outline">Ignored</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {param.updatedBy}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditParameter(param)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit parameter</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteParameter(param.paramId, param.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete parameter</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Info className="h-8 w-8 text-muted-foreground/50" />
                      <p>No application parameters found</p>
                      <Button variant="outline" size="sm" onClick={handleAddParameter}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Parameter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Parameter Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingParameter ? 'Edit Parameter' : 'Add New Parameter'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Parameter Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., APP_TIMEOUT"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Parameter Value</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., 3600"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ignore"
                  checked={formData.ignore}
                  onCheckedChange={(checked) => setFormData({ ...formData, ignore: checked })}
                />
                <Label htmlFor="ignore">Ignore</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveParameter} disabled={!formData.name || !formData.value}>
                {editingParameter ? 'Update' : 'Add'} Parameter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AppParameters;