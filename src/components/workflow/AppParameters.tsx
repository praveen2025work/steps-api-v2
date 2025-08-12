import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useApplicationParameters } from '@/hooks/useWorkflowService';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the type based on the API response structure
interface AppParameter {
  appId: number;
  paramId: number;
  name: string;
  value: string;
  active: 'Y' | 'N';
  updatedBy: string;
  ignore: 'Y' | 'N';
}

interface AppParametersProps {
  applicationId: number;
  applicationName: string;
}

const AppParameters: React.FC<AppParametersProps> = ({
  applicationId,
  applicationName,
}) => {
  // Use the dedicated hook for managing application parameters
  const {
    parameters,
    loading,
    error,
    refresh: fetchParameters,
    saveParameter,
  } = useApplicationParameters(applicationId);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState<AppParameter | null>(null);
  const [paramToDelete, setParamToDelete] = useState<AppParameter | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    value: '',
    active: true,
    ignore: false,
  });

  useEffect(() => {
    if (applicationId) {
      fetchParameters();
    }
  }, [applicationId, fetchParameters]);

  const handleFormChange = (field: keyof typeof formState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenDialog = (param: AppParameter | null = null) => {
    setSelectedParam(param);
    if (param) {
      setFormState({
        name: param.name,
        value: param.value,
        active: param.active === 'Y',
        ignore: param.ignore === 'Y',
      });
    } else {
      setFormState({ name: '', value: '', active: true, ignore: false });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      appId: applicationId,
      paramId: selectedParam?.paramId || 0,
      name: formState.name,
      value: formState.value,
      active: formState.active ? 'Y' : 'N',
      ignore: formState.ignore ? 'Y' : 'N',
      updatedBy: 'system', // This should be replaced with the actual user
    };

    try {
      await saveParameter(payload);
      showSuccessToast(
        `Parameter "${payload.name}" has been ${
          selectedParam ? 'updated' : 'saved'
        } successfully.`
      );
      setIsDialogOpen(false);
      fetchParameters();
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to save parameter.');
    }
  };

  const handleDelete = async () => {
    if (!paramToDelete) return;

    const payload = {
      ...paramToDelete,
      active: 'N' as 'N',
      updatedBy: 'system',
    };

    try {
      await saveParameter(payload);
      showSuccessToast(`Parameter "${paramToDelete.name}" has been deleted.`);
      setIsDeleteDialogOpen(false);
      setParamToDelete(null);
      fetchParameters();
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to delete parameter.');
    }
  };

  const filteredParameters = (parameters || []).filter(
    (param) =>
      param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parameters..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchParameters}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Parameter
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredParameters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No parameters found.
                </TableCell>
              </TableRow>
            ) : (
              filteredParameters.map((param) => (
                <TableRow key={param.paramId}>
                  <TableCell className="font-medium">{param.name}</TableCell>
                  <TableCell>{param.value}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        param.active === 'Y'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {param.active === 'Y' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(param)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setParamToDelete(param);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedParam ? 'Edit' : 'Add'} Parameter
            </DialogTitle>
            <DialogDescription>
              Manage parameter for {applicationName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value
              </Label>
              <Input
                id="value"
                value={formState.value}
                onChange={(e) => handleFormChange('value', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Active
              </Label>
              <Switch
                id="active"
                checked={formState.active}
                onCheckedChange={(checked) =>
                  handleFormChange('active', checked)
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ignore" className="text-right">
                Ignore
              </Label>
              <Switch
                id="ignore"
                checked={formState.ignore}
                onCheckedChange={(checked) =>
                  handleFormChange('ignore', checked)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will delete the parameter "{paramToDelete?.name}". This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppParameters;