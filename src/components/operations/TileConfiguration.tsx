import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BarChart3, List, Table, Activity, PieChart, LineChart, Clock, Map } from 'lucide-react';
import type { TileConfig, TileType } from '@/types/operations-types';

// Sample tile templates
const tileTemplates: TileConfig[] = [
  {
    id: 'status-template',
    type: 'status',
    title: 'Application Status',
    description: 'Shows the current status of an application',
    dataSource: {
      type: 'api',
      source: '/api/status/{applicationId}'
    },
    visualization: {
      type: 'status',
      options: {
        showIcon: true,
        showMessage: true
      }
    }
  },
  {
    id: 'metric-template',
    type: 'metric',
    title: 'Process Count',
    description: 'Shows the count of processes by status',
    dataSource: {
      type: 'api',
      source: '/api/metrics/process-count'
    },
    visualization: {
      type: 'metric',
      options: {
        showChange: true,
        format: 'number'
      }
    }
  },
  {
    id: 'chart-template',
    type: 'chart',
    title: 'Process Duration',
    description: 'Shows the average duration of processes over time',
    dataSource: {
      type: 'api',
      source: '/api/metrics/process-duration'
    },
    visualization: {
      type: 'line-chart',
      options: {
        xAxis: 'time',
        yAxis: 'duration',
        showLegend: true
      }
    }
  },
  {
    id: 'list-template',
    type: 'list',
    title: 'Recent Processes',
    description: 'Shows recently executed processes',
    dataSource: {
      type: 'api',
      source: '/api/processes/recent'
    },
    visualization: {
      type: 'list',
      options: {
        maxItems: 5,
        showStatus: true
      }
    }
  },
  {
    id: 'table-template',
    type: 'table',
    title: 'Process Status',
    description: 'Shows status of all processes',
    dataSource: {
      type: 'api',
      source: '/api/processes/status'
    },
    visualization: {
      type: 'table',
      options: {
        columns: [
          { key: 'name', label: 'Process' },
          { key: 'status', label: 'Status' },
          { key: 'duration', label: 'Duration' }
        ],
        maxRows: 5
      }
    }
  }
];

export default function TileConfiguration() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTileType, setSelectedTileType] = useState<TileType>('metric');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const getTileTypeIcon = (type: TileType) => {
    switch (type) {
      case 'status':
        return <Activity className="h-10 w-10" />;
      case 'metric':
        return <PieChart className="h-10 w-10" />;
      case 'chart':
        return <BarChart3 className="h-10 w-10" />;
      case 'list':
        return <List className="h-10 w-10" />;
      case 'table':
        return <Table className="h-10 w-10" />;
      case 'timeline':
        return <Clock className="h-10 w-10" />;
      case 'map':
        return <Map className="h-10 w-10" />;
      default:
        return <Activity className="h-10 w-10" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tile Configuration</h2>
          <p className="text-muted-foreground">
            Create and manage dashboard tiles for the operations center
          </p>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Create New Tile
        </Button>
      </div>
      
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Tiles</TabsTrigger>
          <TabsTrigger value="layouts">Dashboard Layouts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tileTemplates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.title}</CardTitle>
                      <CardDescription>{template.type}</CardDescription>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                      {getTileTypeIcon(template.type)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{template.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">Preview</Button>
                  <Button size="sm">Use Template</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4 py-4">
          <div className="flex justify-center items-center h-64 border rounded-md">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No custom tiles created yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>Create Your First Tile</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="layouts" className="space-y-4 py-4">
          <div className="flex justify-center items-center h-64 border rounded-md">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No dashboard layouts configured yet</p>
              <Button>Create Dashboard Layout</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create Tile Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Tile</DialogTitle>
            <DialogDescription>
              Configure a new dashboard tile for your operations center
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="data">Data Source</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" className="col-span-3" placeholder="Enter tile title" />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Tile Type</Label>
                <Select value={selectedTileType} onValueChange={(value) => setSelectedTileType(value as TileType)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select tile type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="metric">Metric</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="map">Map</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" className="col-span-3" placeholder="Enter tile description" />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refresh" className="text-right">Auto Refresh</Label>
                <div className="flex items-center space-x-4 col-span-3">
                  <Switch id="refresh" />
                  <Input 
                    type="number" 
                    placeholder="Refresh interval (seconds)" 
                    className="w-64" 
                    min={5} 
                    defaultValue={30} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataSourceType" className="text-right">Source Type</Label>
                <Select defaultValue="api">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select data source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">API Endpoint</SelectItem>
                    <SelectItem value="static">Static Data</SelectItem>
                    <SelectItem value="function">Function</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endpoint" className="text-right">API Endpoint</Label>
                <Input id="endpoint" className="col-span-3" placeholder="/api/data/endpoint" />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="parameters" className="text-right pt-2">Parameters</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Parameter name" className="flex-1" />
                    <Input placeholder="Value" className="flex-1" />
                    <Button variant="outline" size="icon">+</Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transformation" className="text-right">Transform Data</Label>
                <div className="col-span-3 flex items-center space-x-4">
                  <Switch id="transformation" />
                  <span className="text-sm text-muted-foreground">Apply data transformation</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="visualization" className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Visualization Type</Label>
                <div className="col-span-3">
                  {selectedTileType === 'chart' && (
                    <Select defaultValue="bar">
                      <SelectTrigger>
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedTileType === 'metric' && (
                    <Select defaultValue="number">
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              {/* Visualization options would change based on the selected type */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Options</Label>
                <div className="col-span-3 space-y-2">
                  {selectedTileType === 'metric' && (
                    <>
                      <div className="flex items-center space-x-4">
                        <Switch id="showChange" defaultChecked />
                        <Label htmlFor="showChange">Show change indicator</Label>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Switch id="showLabel" defaultChecked />
                        <Label htmlFor="showLabel">Show label</Label>
                      </div>
                    </>
                  )}
                  
                  {selectedTileType === 'chart' && (
                    <>
                      <div className="flex items-center space-x-4">
                        <Switch id="showLegend" defaultChecked />
                        <Label htmlFor="showLegend">Show legend</Label>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Switch id="showGrid" defaultChecked />
                        <Label htmlFor="showGrid">Show grid lines</Label>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Switch id="showTooltip" defaultChecked />
                        <Label htmlFor="showTooltip">Show tooltips</Label>
                      </div>
                    </>
                  )}
                  
                  {selectedTileType === 'table' && (
                    <>
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="maxRows" className="w-32">Max rows:</Label>
                        <Input id="maxRows" type="number" defaultValue={5} min={1} max={20} className="w-20" />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Switch id="pagination" />
                        <Label htmlFor="pagination">Enable pagination</Label>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Switch id="sorting" defaultChecked />
                        <Label htmlFor="sorting">Enable sorting</Label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button>Create Tile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}