import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Globe, 
  Clock, 
  Users, 
  Shield,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { AdhocDashboardConfig, AdhocViewMode } from '@/types/adhoc-types';
import { toast } from 'sonner';

interface AdhocDashboardSettingsProps {
  config: AdhocDashboardConfig;
  onConfigChange: (config: AdhocDashboardConfig) => void;
}

const AdhocDashboardSettings: React.FC<AdhocDashboardSettingsProps> = ({
  config,
  onConfigChange
}) => {
  const updateConfig = (updates: Partial<AdhocDashboardConfig>) => {
    onConfigChange({
      ...config,
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteDashboard = () => {
    if (confirm('Are you sure you want to delete this dashboard? This action cannot be undone.')) {
      // In a real app, this would call the delete API
      toast.success('Dashboard deleted');
      // Navigate back or clear the current dashboard
    }
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${config.name.replace(/\s+/g, '_')}_config.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Dashboard configuration exported');
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string) as AdhocDashboardConfig;
        
        // Merge with current config, keeping the current ID and timestamps
        const mergedConfig = {
          ...importedConfig,
          id: config.id,
          createdAt: config.createdAt,
          updatedAt: new Date().toISOString()
        };
        
        onConfigChange(mergedConfig);
        toast.success('Dashboard configuration imported');
      } catch (error) {
        console.error('Failed to import configuration:', error);
        toast.error('Failed to import configuration - invalid file format');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard Settings</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportConfig}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                Import
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="My Dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">Dashboard ID</Label>
                <Input
                  id="id"
                  value={config.id}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Describe what this dashboard shows..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Created By</Label>
                <Input value={config.createdBy} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Created At</Label>
                <Input 
                  value={new Date(config.createdAt).toLocaleString()} 
                  disabled 
                  className="bg-muted" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultColumns">Default Columns</Label>
                <Select
                  value={config.defaultColumns.toString()}
                  onValueChange={(value) => updateConfig({ defaultColumns: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Column</SelectItem>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                    <SelectItem value="4">4 Columns</SelectItem>
                    <SelectItem value="5">5 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultViewMode">Default View Mode</Label>
                <Select
                  value={config.defaultViewMode}
                  onValueChange={(value: AdhocViewMode) => updateConfig({ defaultViewMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tile">Tile View</SelectItem>
                    <SelectItem value="split">Split View</SelectItem>
                    <SelectItem value="full">Full View</SelectItem>
                    <SelectItem value="table">Table View</SelectItem>
                    <SelectItem value="grid">Grid View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Refresh Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Global Refresh Interval (seconds)</Label>
              <Input
                id="refreshInterval"
                type="number"
                min="30"
                value={config.refreshInterval}
                onChange={(e) => updateConfig({ refreshInterval: parseInt(e.target.value) || 300 })}
              />
              <p className="text-sm text-muted-foreground">
                This sets the default refresh interval for all tiles. Individual tiles can override this setting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Public Dashboard</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anyone with the link to view this dashboard
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={config.isPublic}
                onCheckedChange={(checked) => updateConfig({ isPublic: checked })}
              />
            </div>

            {config.isPublic && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Public dashboards can be viewed by anyone with the URL. 
                  Make sure your data sources don't contain sensitive information.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dashboard Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {config.dataSources.length}
                </div>
                <div className="text-sm text-muted-foreground">Data Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {config.tiles.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Tiles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {config.tiles.filter(t => t.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Tiles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-800">Delete Dashboard</h4>
                <p className="text-sm text-red-600">
                  Permanently delete this dashboard and all its configurations. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteDashboard}>
                Delete Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(config.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dashboard ID:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {config.id}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <Badge variant="secondary">1.0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdhocDashboardSettings;