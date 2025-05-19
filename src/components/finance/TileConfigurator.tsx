import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Eye, 
  GripVertical, 
  Plus, 
  Save, 
  Trash2, 
  X 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { TileContent } from './TileContent';
import { 
  TileConfig, 
  TileType, 
  ChartType, 
  DataSource, 
  AxisConfig 
} from '@/types/finance-types';
import { getAvailableDataSources, getDataSourceFields } from '@/lib/finance';

export function TileConfigurator() {
  const [tiles, setTiles] = useState<TileConfig[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [editingTile, setEditingTile] = useState<TileConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewTile, setPreviewTile] = useState<TileConfig | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load saved tile configurations and available data sources
  useEffect(() => {
    // Load saved configurations from localStorage
    const savedTiles = localStorage.getItem('financeTileConfigs');
    if (savedTiles) {
      setTiles(JSON.parse(savedTiles));
    } else {
      // Set default tiles if none exist
      setTiles(defaultTiles);
    }

    // Load available data sources
    const sources = getAvailableDataSources();
    setDataSources(sources);
  }, []);

  // Save configurations when tiles change
  useEffect(() => {
    if (tiles.length > 0) {
      localStorage.setItem('financeTileConfigs', JSON.stringify(tiles));
    }
  }, [tiles]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(tiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTiles(items);
  };

  const handleAddTile = () => {
    const newTile: TileConfig = {
      id: `tile-${Date.now()}`,
      title: 'New Tile',
      type: TileType.Chart,
      chartType: ChartType.Bar,
      dataSource: dataSources.length > 0 ? dataSources[0].id : '',
      xAxis: { field: '', label: 'X Axis' },
      yAxis: { field: '', label: 'Y Axis' },
      filters: [],
      refreshInterval: 60,
      isActive: true
    };
    
    setEditingTile(newTile);
    setIsDialogOpen(true);
  };

  const handleEditTile = (tile: TileConfig) => {
    setEditingTile({...tile});
    setIsDialogOpen(true);
  };

  const handlePreviewTile = (tile: TileConfig) => {
    setPreviewTile(tile);
    setIsPreviewOpen(true);
  };

  const handleDeleteTile = (tileId: string) => {
    setTiles(tiles.filter(tile => tile.id !== tileId));
  };

  const handleToggleTileActive = (tileId: string) => {
    setTiles(tiles.map(tile => 
      tile.id === tileId ? {...tile, isActive: !tile.isActive} : tile
    ));
  };

  const handleSaveTile = () => {
    if (!editingTile) return;
    
    const tileIndex = tiles.findIndex(t => t.id === editingTile.id);
    
    if (tileIndex >= 0) {
      // Update existing tile
      const updatedTiles = [...tiles];
      updatedTiles[tileIndex] = editingTile;
      setTiles(updatedTiles);
    } else {
      // Add new tile
      setTiles([...tiles, editingTile]);
    }
    
    setIsDialogOpen(false);
    setEditingTile(null);
  };

  const getAvailableFields = (dataSourceId: string) => {
    return getDataSourceFields(dataSourceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard Tiles</h2>
        <Button onClick={handleAddTile}>
          <Plus className="mr-2 h-4 w-4" /> Add New Tile
        </Button>
      </div>
      
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
                            <CardTitle>{tile.title}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Badge variant={tile.isActive ? "default" : "outline"}>
                                {tile.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handlePreviewTile(tile)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditTile(tile)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleToggleTileActive(tile.id)}
                              >
                                {tile.isActive ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteTile(tile.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription>
                            {tile.type === TileType.Chart ? `${tile.chartType} Chart` : tile.type} • 
                            Data: {dataSources.find(ds => ds.id === tile.dataSource)?.name || 'Unknown'}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">X Axis</p>
                              <p className="text-sm text-muted-foreground">{tile.xAxis.label}: {tile.xAxis.field}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Y Axis</p>
                              <p className="text-sm text-muted-foreground">{tile.yAxis.label}: {tile.yAxis.field}</p>
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
      
      {/* Edit Tile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingTile?.id.startsWith('tile-') ? 'Add New Tile' : 'Edit Tile'}</DialogTitle>
            <DialogDescription>
              Configure the tile settings and visualization options.
            </DialogDescription>
          </DialogHeader>
          
          {editingTile && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="data">Data Configuration</TabsTrigger>
                <TabsTrigger value="display">Display Options</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tile Title</Label>
                    <Input 
                      id="title" 
                      value={editingTile.title} 
                      onChange={(e) => setEditingTile({...editingTile, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tile Type</Label>
                    <Select 
                      value={editingTile.type} 
                      onValueChange={(value: TileType) => setEditingTile({...editingTile, type: value as TileType})}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TileType.Chart || " "}>Chart</SelectItem>
                        <SelectItem value={TileType.Grid || " "}>Grid</SelectItem>
                        <SelectItem value={TileType.Progress || " "}>Progress</SelectItem>
                        <SelectItem value={TileType.Text || " "}>Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {editingTile.type === TileType.Chart && (
                  <div className="space-y-2">
                    <Label htmlFor="chartType">Chart Type</Label>
                    <Select 
                      value={editingTile.chartType || ChartType.Bar} 
                      onValueChange={(value) => setEditingTile({...editingTile, chartType: value as ChartType})}
                    >
                      <SelectTrigger id="chartType">
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ChartType.Bar || " "}>Bar Chart</SelectItem>
                        <SelectItem value={ChartType.Line || " "}>Line Chart</SelectItem>
                        <SelectItem value={ChartType.Pie || " "}>Pie Chart</SelectItem>
                        <SelectItem value={ChartType.Area || " "}>Area Chart</SelectItem>
                        <SelectItem value={ChartType.Scatter || " "}>Scatter Plot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                  <Input 
                    id="refreshInterval" 
                    type="number" 
                    min="0"
                    value={editingTile.refreshInterval} 
                    onChange={(e) => setEditingTile({...editingTile, refreshInterval: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isActive" 
                    checked={editingTile.isActive}
                    onCheckedChange={(checked) => setEditingTile({...editingTile, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Select 
                    value={editingTile.dataSource} 
                    onValueChange={(value) => setEditingTile({...editingTile, dataSource: value})}
                  >
                    <SelectTrigger id="dataSource">
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map(source => (
                        <SelectItem key={source.id} value={source.id || " "}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {editingTile.dataSource && (
                  <>
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="xAxisField">X Axis Field</Label>
                        <Select 
                          value={editingTile.xAxis.field} 
                          onValueChange={(value) => setEditingTile({
                            ...editingTile, 
                            xAxis: {...editingTile.xAxis, field: value}
                          })}
                        >
                          <SelectTrigger id="xAxisField">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableFields(editingTile.dataSource).map(field => (
                              <SelectItem key={field.name} value={field.name || " "}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="xAxisLabel">X Axis Label</Label>
                        <Input 
                          id="xAxisLabel" 
                          value={editingTile.xAxis.label} 
                          onChange={(e) => setEditingTile({
                            ...editingTile, 
                            xAxis: {...editingTile.xAxis, label: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yAxisField">Y Axis Field</Label>
                        <Select 
                          value={editingTile.yAxis.field} 
                          onValueChange={(value) => setEditingTile({
                            ...editingTile, 
                            yAxis: {...editingTile.yAxis, field: value}
                          })}
                        >
                          <SelectTrigger id="yAxisField">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableFields(editingTile.dataSource).map(field => (
                              <SelectItem key={field.name} value={field.name || " "}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="yAxisLabel">Y Axis Label</Label>
                        <Input 
                          id="yAxisLabel" 
                          value={editingTile.yAxis.label} 
                          onChange={(e) => setEditingTile({
                            ...editingTile, 
                            yAxis: {...editingTile.yAxis, label: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="display" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Display Options</Label>
                  <p className="text-sm text-muted-foreground">
                    Configure how the tile appears in different view modes.
                  </p>
                </div>
                
                {/* Additional display options can be added here */}
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTile}>
              <Save className="mr-2 h-4 w-4" /> Save Tile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Tile Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTile?.title}</DialogTitle>
            <DialogDescription>
              This is how the tile will appear on the dashboard.
            </DialogDescription>
          </DialogHeader>
          
          {previewTile && (
            <div className="border rounded-lg p-4 bg-card">
              <div className="h-[300px]">
                <TileContent tile={previewTile} compact={false} />
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
}

// Default tiles for new users
const defaultTiles: TileConfig[] = [
  {
    id: 'tile-1',
    title: 'Daily P&L Overview',
    type: TileType.Chart,
    chartType: ChartType.Bar,
    dataSource: 'pnl-daily',
    xAxis: { field: 'date', label: 'Date' },
    yAxis: { field: 'value', label: 'P&L Value' },
    filters: [],
    refreshInterval: 60,
    isActive: true
  },
  {
    id: 'tile-2',
    title: 'Regional Performance',
    type: TileType.Chart,
    chartType: ChartType.Pie,
    dataSource: 'regional-performance',
    xAxis: { field: 'region', label: 'Region' },
    yAxis: { field: 'performance', label: 'Performance' },
    filters: [],
    refreshInterval: 60,
    isActive: true
  },
  {
    id: 'tile-3',
    title: 'Market Data Availability',
    type: TileType.Progress,
    dataSource: 'market-data',
    xAxis: { field: '', label: '' },
    yAxis: { field: 'percentage', label: 'Completion' },
    filters: [],
    refreshInterval: 30,
    isActive: true
  }
];