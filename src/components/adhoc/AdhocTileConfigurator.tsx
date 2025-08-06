import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  GripVertical,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Activity,
  Hash
} from 'lucide-react';
import { 
  AdhocTileConfig, 
  AdhocDataSource, 
  AdhocChartType,
  AggregationType,
  AdhocFilter
} from '@/types/adhoc-types';
import AdhocTile from './AdhocTile';
import { toast } from 'sonner';

interface AdhocTileConfiguratorProps {
  tiles: AdhocTileConfig[];
  dataSources: AdhocDataSource[];
  onTilesChange: (tiles: AdhocTileConfig[]) => void;
}

const AdhocTileConfigurator: React.FC<AdhocTileConfiguratorProps> = ({
  tiles,
  dataSources,
  onTilesChange
}) => {
  const [editingTile, setEditingTile] = useState<AdhocTileConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewTile, setPreviewTile] = useState<AdhocTileConfig | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(tiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));
    
    onTilesChange(updatedItems);
  };

  const handleAddTile = () => {
    const newTile: AdhocTileConfig = {
      id: `tile-${Date.now()}`,
      title: 'New Tile',
      description: '',
      type: AdhocChartType.Bar,
      dataSourceId: dataSources.length > 0 ? dataSources[0].id : '',
      xAxis: { field: '', label: 'X Axis' },
      yAxis: { field: '', label: 'Y Axis' },
      filters: [],
      refreshInterval: 300,
      isActive: true,
      position: tiles.length,
      size: 'medium'
    };
    
    setEditingTile(newTile);
    setIsDialogOpen(true);
  };

  const handleEditTile = (tile: AdhocTileConfig) => {
    setEditingTile({ ...tile });
    setIsDialogOpen(true);
  };

  const handleDeleteTile = (tileId: string) => {
    const updated = tiles.filter(tile => tile.id !== tileId);
    onTilesChange(updated);
    toast.success('Tile deleted');
  };

  const handleToggleTileActive = (tileId: string) => {
    const updated = tiles.map(tile => 
      tile.id === tileId ? { ...tile, isActive: !tile.isActive } : tile
    );
    onTilesChange(updated);
  };

  const handlePreviewTile = (tile: AdhocTileConfig) => {
    setPreviewTile(tile);
    setIsPreviewOpen(true);
  };

  const handleSaveTile = () => {
    if (!editingTile) return;
    
    const existingIndex = tiles.findIndex(t => t.id === editingTile.id);
    
    if (existingIndex >= 0) {
      const updated = [...tiles];
      updated[existingIndex] = editingTile;
      onTilesChange(updated);
      toast.success('Tile updated');
    } else {
      onTilesChange([...tiles, editingTile]);
      toast.success('Tile added');
    }
    
    setIsDialogOpen(false);
    setEditingTile(null);
  };

  const updateEditingTile = (updates: Partial<AdhocTileConfig>) => {
    if (editingTile) {
      setEditingTile({ ...editingTile, ...updates });
    }
  };

  const getAvailableFields = (dataSourceId: string) => {
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    return dataSource ? dataSource.fields : [];
  };

  const addFilter = () => {
    if (!editingTile) return;
    
    const newFilter: AdhocFilter = {
      field: '',
      operator: 'equals',
      value: ''
    };
    
    updateEditingTile({
      filters: [...editingTile.filters, newFilter]
    });
  };

  const updateFilter = (index: number, updates: Partial<AdhocFilter>) => {
    if (!editingTile) return;
    
    const updated = [...editingTile.filters];
    updated[index] = { ...updated[index], ...updates };
    updateEditingTile({ filters: updated });
  };

  const removeFilter = (index: number) => {
    if (!editingTile) return;
    
    const updated = editingTile.filters.filter((_, i) => i !== index);
    updateEditingTile({ filters: updated });
  };

  const getChartIcon = (type: AdhocChartType) => {
    switch (type) {
      case AdhocChartType.Bar:
        return <BarChart3 className="h-4 w-4" />;
      case AdhocChartType.Line:
        return <LineChart className="h-4 w-4" />;
      case AdhocChartType.Pie:
        return <PieChart className="h-4 w-4" />;
      case AdhocChartType.Grid:
        return <Table className="h-4 w-4" />;
      case AdhocChartType.Progress:
        return <Activity className="h-4 w-4" />;
      case AdhocChartType.Metric:
        return <Hash className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  if (dataSources.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Data Sources Available</h3>
          <p className="text-muted-foreground">
            Add at least one data source before creating tiles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard Tiles</h2>
        <Button onClick={handleAddTile}>
          <Plus className="mr-2 h-4 w-4" /> Add Tile
        </Button>
      </div>

      {tiles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Tiles Configured</h3>
            <p className="text-muted-foreground mb-4">
              Create your first tile to start visualizing your data.
            </p>
            <Button onClick={handleAddTile}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tiles">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {tiles.map((tile, index) => (
                  <Draggable key={tile.id} draggableId={tile.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative"
                      >
                        <Card className={`border ${!tile.isActive ? 'opacity-60' : ''}`}>
                          <div className="absolute left-2 top-0 bottom-0 flex items-center">
                            <div {...provided.dragHandleProps} className="cursor-grab p-2">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                          
                          <CardHeader className="pl-12">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {getChartIcon(tile.type)}
                                <CardTitle>{tile.title}</CardTitle>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={tile.isActive ? "default" : "outline"}>
                                  {tile.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="secondary">{tile.type}</Badge>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePreviewTile(tile)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditTile(tile)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Switch
                                  checked={tile.isActive}
                                  onCheckedChange={() => handleToggleTileActive(tile.id)}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteTile(tile.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            {tile.description && (
                              <p className="text-sm text-muted-foreground">{tile.description}</p>
                            )}
                          </CardHeader>
                          
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Data Source:</span>
                                <p className="text-muted-foreground">
                                  {dataSources.find(ds => ds.id === tile.dataSourceId)?.name || 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">X Axis:</span>
                                <p className="text-muted-foreground">{tile.xAxis?.field || 'Not set'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Y Axis:</span>
                                <p className="text-muted-foreground">{tile.yAxis?.field || 'Not set'}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Edit Tile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTile?.id.startsWith('tile-') ? 'Add New Tile' : 'Edit Tile'}
            </DialogTitle>
            <DialogDescription>
              Configure the tile visualization and data mapping.
            </DialogDescription>
          </DialogHeader>

          {editingTile && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editingTile.title}
                      onChange={(e) => updateEditingTile({ title: e.target.value })}
                      placeholder="Tile title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select
                      value={editingTile.size}
                      onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => 
                        updateEditingTile({ size: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="xlarge">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingTile.description || ''}
                    onChange={(e) => updateEditingTile({ description: e.target.value })}
                    placeholder="Optional description for this tile"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      min="30"
                      value={editingTile.refreshInterval}
                      onChange={(e) => updateEditingTile({ refreshInterval: parseInt(e.target.value) || 300 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={editingTile.isActive}
                      onCheckedChange={(checked) => updateEditingTile({ isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Select
                    value={editingTile.dataSourceId}
                    onValueChange={(value) => updateEditingTile({ dataSourceId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingTile.dataSourceId && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="xAxisField">X Axis Field</Label>
                        <Select
                          value={editingTile.xAxis?.field || ''}
                          onValueChange={(value) => updateEditingTile({
                            xAxis: { ...editingTile.xAxis, field: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableFields(editingTile.dataSourceId).map((field) => (
                              <SelectItem key={field.name} value={field.name}>
                                {field.label} ({field.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="xAxisLabel">X Axis Label</Label>
                        <Input
                          id="xAxisLabel"
                          value={editingTile.xAxis?.label || ''}
                          onChange={(e) => updateEditingTile({
                            xAxis: { ...editingTile.xAxis, label: e.target.value }
                          })}
                          placeholder="X Axis"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yAxisField">Y Axis Field</Label>
                        <Select
                          value={editingTile.yAxis?.field || ''}
                          onValueChange={(value) => updateEditingTile({
                            yAxis: { ...editingTile.yAxis, field: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableFields(editingTile.dataSourceId).map((field) => (
                              <SelectItem key={field.name} value={field.name}>
                                {field.label} ({field.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yAxisLabel">Y Axis Label</Label>
                        <Input
                          id="yAxisLabel"
                          value={editingTile.yAxis?.label || ''}
                          onChange={(e) => updateEditingTile({
                            yAxis: { ...editingTile.yAxis, label: e.target.value }
                          })}
                          placeholder="Y Axis"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aggregation">Aggregation</Label>
                        <Select
                          value={editingTile.yAxis?.aggregation || 'none'}
                          onValueChange={(value: AggregationType) => updateEditingTile({
                            yAxis: { ...editingTile.yAxis, aggregation: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="avg">Average</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groupBy">Group By Field (Optional)</Label>
                      <Select
                        value={editingTile.groupBy || ''}
                        onValueChange={(value) => updateEditingTile({ groupBy: value || undefined })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field to group by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No grouping</SelectItem>
                          {getAvailableFields(editingTile.dataSourceId).map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="visualization" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="chartType">Chart Type</Label>
                  <Select
                    value={editingTile.type}
                    onValueChange={(value: AdhocChartType) => updateEditingTile({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AdhocChartType.Bar}>Bar Chart</SelectItem>
                      <SelectItem value={AdhocChartType.Line}>Line Chart</SelectItem>
                      <SelectItem value={AdhocChartType.Area}>Area Chart</SelectItem>
                      <SelectItem value={AdhocChartType.Pie}>Pie Chart</SelectItem>
                      <SelectItem value={AdhocChartType.Scatter}>Scatter Plot</SelectItem>
                      <SelectItem value={AdhocChartType.Grid}>Data Grid</SelectItem>
                      <SelectItem value={AdhocChartType.Progress}>Progress Bars</SelectItem>
                      <SelectItem value={AdhocChartType.Status}>Status Indicators</SelectItem>
                      <SelectItem value={AdhocChartType.Metric}>Single Metric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-2">Chart Type Description:</p>
                  <p className="text-sm">
                    {editingTile.type === AdhocChartType.Bar && "Display data as vertical bars, good for comparing categories."}
                    {editingTile.type === AdhocChartType.Line && "Show trends over time with connected data points."}
                    {editingTile.type === AdhocChartType.Area && "Similar to line chart but with filled area below the line."}
                    {editingTile.type === AdhocChartType.Pie && "Show proportions of a whole as slices of a circle."}
                    {editingTile.type === AdhocChartType.Scatter && "Plot individual data points to show relationships between variables."}
                    {editingTile.type === AdhocChartType.Grid && "Display data in a tabular format with sorting and filtering."}
                    {editingTile.type === AdhocChartType.Progress && "Show progress or completion percentages as horizontal bars."}
                    {editingTile.type === AdhocChartType.Status && "Display status indicators with colored badges."}
                    {editingTile.type === AdhocChartType.Metric && "Show a single large number or metric value."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <Label>Data Filters</Label>
                  <Button variant="outline" size="sm" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Filter
                  </Button>
                </div>

                {editingTile.filters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No filters configured. Data will show all records.</p>
                ) : (
                  <div className="space-y-3">
                    {editingTile.filters.map((filter, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Field</Label>
                          <Select
                            value={filter.field}
                            onValueChange={(value) => updateFilter(index, { field: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableFields(editingTile.dataSourceId).map((field) => (
                                <SelectItem key={field.name} value={field.name}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Operator</Label>
                          <Select
                            value={filter.operator}
                            onValueChange={(value: any) => updateFilter(index, { operator: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="greaterThan">Greater Than</SelectItem>
                              <SelectItem value="lessThan">Less Than</SelectItem>
                              <SelectItem value="between">Between</SelectItem>
                              <SelectItem value="in">In List</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Value</Label>
                          <Input
                            className="h-8"
                            value={filter.value}
                            onChange={(e) => updateFilter(index, { value: e.target.value })}
                            placeholder="Filter value"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFilter(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTile} disabled={!editingTile?.dataSourceId}>
              Save Tile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Tile Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTile?.title}</DialogTitle>
            <DialogDescription>
              This is how the tile will appear on the dashboard with sample data.
            </DialogDescription>
          </DialogHeader>

          {previewTile && (
            <div className="border rounded-lg p-4 bg-card">
              <div className="h-[400px]">
                <AdhocTile
                  tile={{
                    id: previewTile.id,
                    title: previewTile.title,
                    description: previewTile.description,
                    status: 'info',
                    lastUpdated: new Date().toISOString(),
                    data: [], // Will be populated with mock data by the service
                    isLoading: false,
                    config: previewTile
                  }}
                  onFocus={() => {}}
                  isFocused={false}
                  isFullView={true}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            {previewTile && (
              <Button onClick={() => {
                setIsPreviewOpen(false);
                handleEditTile(previewTile);
              }}>
                Edit Tile
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdhocTileConfigurator;