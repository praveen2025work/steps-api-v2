import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle,
  Database,
  Globe
} from 'lucide-react';
import { AdhocDataSource, AdhocDataPreview } from '@/types/adhoc-types';
import { adhocDataService } from '@/services/adhocDataService';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AdhocDataSourceManagerProps {
  dataSources: AdhocDataSource[];
  onDataSourcesChange: (dataSources: AdhocDataSource[]) => void;
}

const AdhocDataSourceManager: React.FC<AdhocDataSourceManagerProps> = ({
  dataSources,
  onDataSourcesChange
}) => {
  const [editingSource, setEditingSource] = useState<AdhocDataSource | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<AdhocDataPreview | null>(null);

  const handleAddDataSource = () => {
    const newSource: AdhocDataSource = {
      id: `datasource-${Date.now()}`,
      name: 'New Data Source',
      description: '',
      url: '',
      method: 'GET',
      headers: {},
      refreshInterval: 300,
      authentication: { type: 'none' },
      fields: []
    };
    
    setEditingSource(newSource);
    setTestResult(null);
    setIsDialogOpen(true);
  };

  const handleEditDataSource = (source: AdhocDataSource) => {
    setEditingSource({ ...source });
    setTestResult(null);
    setIsDialogOpen(true);
  };

  const handleDeleteDataSource = (sourceId: string) => {
    const updated = dataSources.filter(ds => ds.id !== sourceId);
    onDataSourcesChange(updated);
    toast.success('Data source deleted');
  };

  const handleTestConnection = async () => {
    if (!editingSource) return;
    
    setIsTestingConnection(true);
    try {
      const result = await adhocDataService.testDataSource(editingSource);
      setTestResult(result);
      
      if (result.error) {
        toast.error(`Connection test failed: ${result.error}`);
      } else {
        toast.success('Connection test successful');
        // Update fields in the editing source
        setEditingSource({
          ...editingSource,
          fields: result.fields
        });
      }
    } catch (error) {
      toast.error('Connection test failed');
      setTestResult({
        fields: [],
        sampleData: [],
        totalRows: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveDataSource = () => {
    if (!editingSource) return;
    
    const existingIndex = dataSources.findIndex(ds => ds.id === editingSource.id);
    
    if (existingIndex >= 0) {
      const updated = [...dataSources];
      updated[existingIndex] = editingSource;
      onDataSourcesChange(updated);
      toast.success('Data source updated');
    } else {
      onDataSourcesChange([...dataSources, editingSource]);
      toast.success('Data source added');
    }
    
    setIsDialogOpen(false);
    setEditingSource(null);
    setTestResult(null);
  };

  const updateEditingSource = (updates: Partial<AdhocDataSource>) => {
    if (editingSource) {
      setEditingSource({ ...editingSource, ...updates });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Data Sources</h2>
        <Button onClick={handleAddDataSource}>
          <Plus className="mr-2 h-4 w-4" /> Add Data Source
        </Button>
      </div>

      {dataSources.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Data Sources</h3>
            <p className="text-muted-foreground mb-4">
              Add your first data source to start creating visualizations.
            </p>
            <Button onClick={handleAddDataSource}>
              <Plus className="h-4 w-4 mr-2" />
              Add Data Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dataSources.map((source) => (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {source.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {source.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{source.method}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDataSource(source)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDataSource(source.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">URL: </span>
                    <span className="text-sm text-muted-foreground">{source.url}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Refresh Interval: </span>
                    <span className="text-sm text-muted-foreground">{source.refreshInterval}s</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Fields: </span>
                    <span className="text-sm text-muted-foreground">
                      {source.fields.length} field{source.fields.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {source.authentication?.type !== 'none' && (
                    <div>
                      <span className="text-sm font-medium">Authentication: </span>
                      <Badge variant="secondary">{source.authentication?.type}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Data Source Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSource?.id.startsWith('datasource-') ? 'Add Data Source' : 'Edit Data Source'}
            </DialogTitle>
            <DialogDescription>
              Configure your data source connection and test the connection to validate the setup.
            </DialogDescription>
          </DialogHeader>

          {editingSource && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingSource.name}
                    onChange={(e) => updateEditingSource({ name: e.target.value })}
                    placeholder="My Data Source"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select
                    value={editingSource.method}
                    onValueChange={(value: 'GET' | 'POST') => updateEditingSource({ method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingSource.description}
                  onChange={(e) => updateEditingSource({ description: e.target.value })}
                  placeholder="Describe what this data source provides..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={editingSource.url}
                  onChange={(e) => updateEditingSource({ url: e.target.value })}
                  placeholder="https://api.example.com/data"
                />
              </div>

              {editingSource.method === 'POST' && (
                <div className="space-y-2">
                  <Label htmlFor="body">Request Body (JSON)</Label>
                  <Textarea
                    id="body"
                    value={editingSource.body || ''}
                    onChange={(e) => updateEditingSource({ body: e.target.value })}
                    placeholder='{"key": "value"}'
                    rows={4}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                  <Input
                    id="refreshInterval"
                    type="number"
                    min="30"
                    value={editingSource.refreshInterval}
                    onChange={(e) => updateEditingSource({ refreshInterval: parseInt(e.target.value) || 300 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataPath">Data Path (JSONPath)</Label>
                  <Input
                    id="dataPath"
                    value={editingSource.dataPath || ''}
                    onChange={(e) => updateEditingSource({ dataPath: e.target.value })}
                    placeholder="$.data or data.items"
                  />
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-4">
                <Label>Authentication</Label>
                <Select
                  value={editingSource.authentication?.type || 'none'}
                  onValueChange={(value) => updateEditingSource({
                    authentication: { ...editingSource.authentication, type: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                  </SelectContent>
                </Select>

                {editingSource.authentication?.type === 'bearer' && (
                  <div className="space-y-2">
                    <Label htmlFor="token">Bearer Token</Label>
                    <Input
                      id="token"
                      type="password"
                      value={editingSource.authentication.token || ''}
                      onChange={(e) => updateEditingSource({
                        authentication: { ...editingSource.authentication, token: e.target.value }
                      })}
                      placeholder="your-bearer-token"
                    />
                  </div>
                )}

                {editingSource.authentication?.type === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editingSource.authentication.username || ''}
                        onChange={(e) => updateEditingSource({
                          authentication: { ...editingSource.authentication, username: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={editingSource.authentication.password || ''}
                        onChange={(e) => updateEditingSource({
                          authentication: { ...editingSource.authentication, password: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                )}

                {editingSource.authentication?.type === 'apikey' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKeyHeader">Header Name</Label>
                      <Input
                        id="apiKeyHeader"
                        value={editingSource.authentication.apiKeyHeader || ''}
                        onChange={(e) => updateEditingSource({
                          authentication: { ...editingSource.authentication, apiKeyHeader: e.target.value }
                        })}
                        placeholder="X-API-Key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={editingSource.authentication.apiKey || ''}
                        onChange={(e) => updateEditingSource({
                          authentication: { ...editingSource.authentication, apiKey: e.target.value }
                        })}
                        placeholder="your-api-key"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Test Connection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !editingSource.url}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {isTestingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                  {testResult && (
                    <div className="flex items-center gap-2">
                      {testResult.error ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <span className="text-sm">
                        {testResult.error ? 'Connection failed' : `Found ${testResult.totalRows} records`}
                      </span>
                    </div>
                  )}
                </div>

                {testResult && !testResult.error && testResult.sampleData.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sample Data Preview</Label>
                    <div className="border rounded-md max-h-60 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {testResult.fields.map((field) => (
                              <TableHead key={field.name}>{field.label}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testResult.sampleData.map((row, index) => (
                            <TableRow key={index}>
                              {testResult.fields.map((field) => (
                                <TableCell key={field.name}>
                                  {typeof row[field.name] === 'object'
                                    ? JSON.stringify(row[field.name])
                                    : String(row[field.name] || '')
                                  }
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {testResult?.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{testResult.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDataSource} disabled={!editingSource?.url}>
              Save Data Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdhocDataSourceManager;