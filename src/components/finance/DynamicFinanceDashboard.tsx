import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, LayoutGrid, SplitSquareVertical, Maximize2, 
  Settings, ChevronLeft, ArrowLeft, Home
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { generateMockTiles } from '@/lib/finance';
import { TileData, ViewMode } from '@/types/finance-types';
import TileGrid from './TileGrid';
import FinanceAnalysis from './FinanceAnalysis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockHierarchicalWorkflows } from '@/data/hierarchicalWorkflowData';

const DynamicFinanceDashboard: React.FC = () => {
  const router = useRouter();
  // State for dashboard configuration
  const [columns, setColumns] = useState<number>(3);
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const [focusedTile, setFocusedTile] = useState<string | null>(null);
  const [splitTile, setSplitTile] = useState<string | null>(null);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [availableWorkflows, setAvailableWorkflows] = useState<{id: string, name: string}[]>([]);
  const [navigationSource, setNavigationSource] = useState<'direct' | 'dashboard'>('direct');

  // Determine navigation source and initialize selections
  useEffect(() => {
    // Check if we came from the dashboard or workflow page
    const referrer = document.referrer;
    const isFromWorkflowOrDashboard = referrer && 
      (referrer.includes('/workflow/') || 
       referrer.includes('/dashboard') || 
       referrer === window.location.origin + '/');
    
    if (isFromWorkflowOrDashboard) {
      setNavigationSource('dashboard');
    } else {
      // If accessed directly or from sidebar menu
      setNavigationSource('direct');
      
      // Pre-select the first application if available
      if (mockHierarchicalWorkflows.length > 0 && !selectedApp) {
        const firstApp = mockHierarchicalWorkflows[0];
        setSelectedApp(firstApp.id);
        
        // Pre-select the first workflow if available
        if (firstApp.assetClasses.length > 0 && 
            firstApp.assetClasses[0].workflowLevels.length > 0) {
          setSelectedWorkflow(firstApp.assetClasses[0].workflowLevels[0].id);
        }
      }
    }
  }, []);

  // Update available workflows when selected app changes
  useEffect(() => {
    if (selectedApp) {
      const app = mockHierarchicalWorkflows.find(a => a.id === selectedApp);
      if (app) {
        const workflows: {id: string, name: string}[] = [];
        app.assetClasses.forEach(assetClass => {
          assetClass.workflowLevels.forEach(wf => {
            workflows.push({ id: wf.id, name: wf.name });
          });
        });
        setAvailableWorkflows(workflows);
        if (workflows.length > 0 && !selectedWorkflow) {
          setSelectedWorkflow(workflows[0].id);
        }
      }
    }
  }, [selectedApp, selectedWorkflow]);

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      // Only load data if we have both an application and workflow selected
      // or if we're coming from a workflow page (where data is contextual)
      if ((selectedApp && selectedWorkflow) || navigationSource === 'dashboard') {
        setIsLoading(true);
        try {
          // In a real app, we would fetch data from an API based on selectedApp and selectedWorkflow
          // For now, we'll use mock data but in a real implementation, we would pass these as parameters
          // to the API call: `/api/finance/dashboard?appId=${selectedApp}&workflowId=${selectedWorkflow}`
          const data = generateMockTiles();
          setTiles(data);
        } catch (error) {
          console.error('Failed to load finance dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
    
    // Set up auto-refresh interval only if we have data to refresh
    let interval: NodeJS.Timeout | null = null;
    if ((selectedApp && selectedWorkflow) || navigationSource === 'dashboard') {
      interval = setInterval(() => {
        loadData();
        setLastRefreshed(new Date());
      }, 60000); // Refresh every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedApp, selectedWorkflow, navigationSource]);

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
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const data = generateMockTiles();
      setTiles(data);
      setLastRefreshed(new Date());
      setIsLoading(false);
    }, 500);
  };

  // Handle back navigation
  const handleBack = () => {
    if (navigationSource === 'dashboard') {
      router.push('/');
    } else {
      router.back();
    }
  };

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
        <Button
          variant={columns === 5 ? "default" : "ghost"}
          size="sm"
          onClick={() => setColumns(5)}
          title="5 columns"
          className="px-2"
        >
          <div className="flex gap-0.5">
            <div className="w-1 h-4 bg-current opacity-70 rounded-sm"></div>
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
    <>
      <div className="flex flex-col space-y-6">
        
        {/* Dashboard Header with all controls in a single row */}
        <div className="bg-card rounded-lg p-2 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Left side: Application & Workflow Selection or Workflow info */}
            <div className="flex flex-wrap items-center gap-2">
              {navigationSource === 'direct' ? (
                <>
                  <Select value={selectedApp} onValueChange={setSelectedApp}>
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue placeholder="Select Application" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockHierarchicalWorkflows.map((app, index) => (
                        <SelectItem key={app.id} value={app.id || `app-id-${index}`}>{app.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={selectedWorkflow} 
                    onValueChange={setSelectedWorkflow}
                    disabled={availableWorkflows.length === 0}
                  >
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue placeholder="Select Workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkflows.map((wf, index) => (
                        <SelectItem key={wf.id} value={wf.id || `workflow-id-${index}`}>{wf.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <h3 className="text-md font-medium mr-2">eRates</h3>
              )}
              
              {/* View and Layout Controls */}
              <div className="flex items-center gap-1">
                <ViewModeControls />
                <LayoutControls />
              </div>
            </div>
            
            {/* Right side: Action buttons */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="px-2 h-8" title="Refresh">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" asChild className="px-2 h-8" title="Configure Tiles">
                <Link href="/finance/configure">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              {navigationSource !== 'direct' && (
                <Button variant="ghost" size="sm" onClick={handleBack} className="px-2 h-8" title={navigationSource === 'dashboard' ? "Return to Dashboard" : "Back"}>
                  {navigationSource === 'dashboard' ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <ArrowLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <TileGrid
              tiles={tiles}
              columns={columns}
              viewMode={viewMode}
              focusedTile={focusedTile}
              splitTile={splitTile}
              onTileFocus={handleTileFocus}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="analysis" className="mt-4">
            <FinanceAnalysis 
              selectedTile={
                focusedTile 
                  ? tiles.find(t => t.id === focusedTile) || null
                  : splitTile 
                    ? tiles.find(t => t.id === splitTile) || null
                    : null
              } 
              tiles={tiles}
            />
          </TabsContent>
          <TabsContent value="risk" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Risk metrics view coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="compliance" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Compliance view coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default DynamicFinanceDashboard;