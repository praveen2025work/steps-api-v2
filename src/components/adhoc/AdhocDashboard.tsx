import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, LayoutGrid, SplitSquareVertical, Maximize2, 
  Settings, Plus, Save, Upload, Download, Database
} from 'lucide-react';
import { useDate } from '@/contexts/DateContext';
import { formatDate } from '@/lib/dateUtils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  AdhocDashboardConfig, 
  AdhocTileData, 
  AdhocViewMode,
  AdhocDataSource,
  AdhocTileConfig
} from '@/types/adhoc-types';
import AdhocTileGrid from './AdhocTileGrid';
import AdhocDataSourceManager from './AdhocDataSourceManager';
import AdhocTileConfigurator from './AdhocTileConfigurator';
import AdhocDashboardSettings from './AdhocDashboardSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { adhocDataService } from '@/services/adhocDataService';

const AdhocDashboard: React.FC = () => {
  const router = useRouter();
  const { selectedDate } = useDate();
  
  // State for dashboard configuration
  const [dashboardConfig, setDashboardConfig] = useState<AdhocDashboardConfig | null>(null);
  const [savedDashboards, setSavedDashboards] = useState<AdhocDashboardConfig[]>([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>('');
  const [columns, setColumns] = useState<number>(3);
  const [viewMode, setViewMode] = useState<AdhocViewMode>('tile');
  const [focusedTile, setFocusedTile] = useState<string | null>(null);
  const [splitTile, setSplitTile] = useState<string | null>(null);
  const [tiles, setTiles] = useState<AdhocTileData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load saved dashboards on component mount
  useEffect(() => {
    loadSavedDashboards();
  }, []);

  // Load dashboard data when config changes
  useEffect(() => {
    if (dashboardConfig) {
      loadDashboardData();
    }
  }, [dashboardConfig, selectedDate]);

  const loadSavedDashboards = async () => {
    try {
      const dashboards = await adhocDataService.getSavedDashboards();
      setSavedDashboards(dashboards);
      
      // Auto-select first dashboard if available
      if (dashboards.length > 0 && !selectedDashboardId) {
        setSelectedDashboardId(dashboards[0].id);
        setDashboardConfig(dashboards[0]);
      }
    } catch (error) {
      console.error('Failed to load saved dashboards:', error);
      toast.error('Failed to load saved dashboards');
    }
  };

  const loadDashboardData = async () => {
    if (!dashboardConfig) return;
    
    setIsLoading(true);
    try {
      const tileDataPromises = dashboardConfig.tiles
        .filter(tile => tile.isActive)
        .map(async (tileConfig) => {
          try {
            const data = await adhocDataService.fetchTileData(tileConfig, selectedDate);
            return {
              id: tileConfig.id,
              title: tileConfig.title,
              description: tileConfig.description,
              status: 'success' as const,
              lastUpdated: new Date().toISOString(),
              data,
              isLoading: false,
              config: tileConfig
            };
          } catch (error) {
            console.error(`Failed to load data for tile ${tileConfig.id}:`, error);
            return {
              id: tileConfig.id,
              title: tileConfig.title,
              description: tileConfig.description,
              status: 'error' as const,
              lastUpdated: new Date().toISOString(),
              data: [],
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false,
              config: tileConfig
            };
          }
        });

      const tileData = await Promise.all(tileDataPromises);
      setTiles(tileData);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardSelect = (dashboardId: string) => {
    const dashboard = savedDashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      setSelectedDashboardId(dashboardId);
      setDashboardConfig(dashboard);
      setColumns(dashboard.defaultColumns);
      setViewMode(dashboard.defaultViewMode);
    }
  };

  const handleCreateNewDashboard = () => {
    const newDashboard: AdhocDashboardConfig = {
      id: `dashboard-${Date.now()}`,
      name: 'New Dashboard',
      description: 'Custom configurable dashboard',
      dataSources: [],
      tiles: [],
      defaultColumns: 3,
      defaultViewMode: 'tile',
      globalFilters: [],
      refreshInterval: 300,
      isPublic: false,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setDashboardConfig(newDashboard);
    setSelectedDashboardId(newDashboard.id);
    setActiveTab('settings');
  };

  const handleSaveDashboard = async () => {
    if (!dashboardConfig) return;
    
    try {
      const updatedConfig = {
        ...dashboardConfig,
        updatedAt: new Date().toISOString()
      };
      
      await adhocDataService.saveDashboard(updatedConfig);
      setDashboardConfig(updatedConfig);
      
      // Update saved dashboards list
      const existingIndex = savedDashboards.findIndex(d => d.id === updatedConfig.id);
      if (existingIndex >= 0) {
        const updated = [...savedDashboards];
        updated[existingIndex] = updatedConfig;
        setSavedDashboards(updated);
      } else {
        setSavedDashboards([...savedDashboards, updatedConfig]);
      }
      
      toast.success('Dashboard saved successfully');
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      toast.error('Failed to save dashboard');
    }
  };

  const handleExportDashboard = () => {
    if (!dashboardConfig) return;
    
    const dataStr = JSON.stringify(dashboardConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${dashboardConfig.name.replace(/\s+/g, '_')}_config.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportDashboard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string) as AdhocDashboardConfig;
        config.id = `dashboard-${Date.now()}`; // Generate new ID
        config.updatedAt = new Date().toISOString();
        
        setDashboardConfig(config);
        setSelectedDashboardId(config.id);
        toast.success('Dashboard imported successfully');
      } catch (error) {
        console.error('Failed to import dashboard:', error);
        toast.error('Failed to import dashboard - invalid file format');
      }
    };
    reader.readAsText(file);
  };

  // Handle tile focus
  const handleTileFocus = (tileId: string) => {
    if (viewMode === 'tile') {
      setViewMode('split');
      setSplitTile(tileId);
    } else if (viewMode === 'split') {
      if (splitTile === tileId) {
        setViewMode('full');
        setFocusedTile(tileId);
      } else {
        setSplitTile(tileId);
      }
    } else if (viewMode === 'full') {
      if (focusedTile === tileId) {
        setViewMode('tile');
        setFocusedTile(null);
      } else {
        setFocusedTile(tileId);
      }
    }
  };

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (dashboardConfig) {
      loadDashboardData();
    }
  }, [dashboardConfig, selectedDate]);

  // Layout controls component
  const LayoutControls = () => {
    return (
      <div className="flex items-center gap-1 bg-card rounded-lg shadow-sm p-1">
        <Button
          variant={columns === 2 ? "default" : "ghost"}
          size="sm"
          onClick={() => setColumns(2)}
          title="2 columns"
          className="px-2"
        >
          <div className="flex gap-0.5">
            <div className="w-2 h-4 bg-current opacity-70 rounded-sm"></div>
            <div className="w-2 h-4 bg-current opacity-70 rounded-sm"></div>
          </div>
        </Button>
        <Button
          variant={columns === 3 ? "default" : "ghost"}
          size="sm"
          onClick={() => setColumns(3)}
          title="3 columns"
          className="px-2"
        >
          <div className="flex gap-0.5">
            <div className="w-1.5 h-4 bg-current opacity-70 rounded-sm"></div>
            <div className="w-1.5 h-4 bg-current opacity-70 rounded-sm"></div>
            <div className="w-1.5 h-4 bg-current opacity-70 rounded-sm"></div>
          </div>
        </Button>
        <Button
          variant={columns === 4 ? "default" : "ghost"}
          size="sm"
          onClick={() => setColumns(4)}
          title="4 columns"
          className="px-2"
        >
          <div className="flex gap-0.5">
            <div className="w-1 h-4 bg-current opacity-70 rounded-sm"></div>
            <div className="w-1 h-4 bg-current opacity-70 rounded-sm"></div>
            <div className="w-1 h-4 bg-current opacity-70 rounded-sm"></div>
            <div className="w-1 h-4 bg-current opacity-70 rounded-sm"></div>
          </div>
        </Button>
      </div>
    );
  };

  // View mode controls component
  const ViewModeControls = () => {
    return (
      <div className="flex items-center gap-1 bg-card rounded-lg shadow-sm p-1">
        <Button
          variant={viewMode === 'tile' ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setViewMode('tile');
            setFocusedTile(null);
            setSplitTile(null);
          }}
          title="Tile View"
          className="px-2"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'split' ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setViewMode('split');
            if (!splitTile && tiles.length > 0) {
              setSplitTile(tiles[0].id);
            }
          }}
          title="Split View"
          className="px-2"
        >
          <SplitSquareVertical className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'full' ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setViewMode('full');
            if (!focusedTile && tiles.length > 0) {
              setFocusedTile(tiles[0].id);
            }
          }}
          title="Full View"
          className="px-2"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Dashboard Header */}
      <div className="bg-card rounded-lg p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left side: Dashboard Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedDashboardId} onValueChange={handleDashboardSelect}>
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue placeholder="Select Dashboard" />
              </SelectTrigger>
              <SelectContent>
                {savedDashboards.map((dashboard) => (
                  <SelectItem key={dashboard.id} value={dashboard.id}>
                    {dashboard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleCreateNewDashboard} className="px-2 h-8">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
            
            {/* View and Layout Controls */}
            <div className="flex items-center gap-1">
              <ViewModeControls />
              <LayoutControls />
            </div>
          </div>
          
          {/* Right side: Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="px-2 h-8" title="Refresh">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {dashboardConfig && (
              <>
                <Button variant="outline" size="sm" onClick={handleSaveDashboard} className="px-2 h-8" title="Save Dashboard">
                  <Save className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleExportDashboard} className="px-2 h-8" title="Export Dashboard">
                  <Download className="h-4 w-4" />
                </Button>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportDashboard}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" className="px-2 h-8" title="Import Dashboard" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {dashboardConfig ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
            <TabsTrigger value="tiles">Tiles</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-4">
            <AdhocTileGrid
              tiles={tiles}
              columns={columns}
              viewMode={viewMode}
              focusedTile={focusedTile}
              splitTile={splitTile}
              onTileFocus={handleTileFocus}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="data-sources" className="mt-4">
            <AdhocDataSourceManager
              dataSources={dashboardConfig.dataSources}
              onDataSourcesChange={(dataSources) => 
                setDashboardConfig({...dashboardConfig, dataSources})
              }
            />
          </TabsContent>
          
          <TabsContent value="tiles" className="mt-4">
            <AdhocTileConfigurator
              tiles={dashboardConfig.tiles}
              dataSources={dashboardConfig.dataSources}
              onTilesChange={(tiles) => 
                setDashboardConfig({...dashboardConfig, tiles})
              }
            />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <AdhocDashboardSettings
              config={dashboardConfig}
              onConfigChange={setDashboardConfig}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Dashboard Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select an existing dashboard or create a new one to get started.
            </p>
            <Button onClick={handleCreateNewDashboard}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdhocDashboard;