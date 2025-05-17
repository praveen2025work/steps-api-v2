import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, LayoutGrid, SplitSquareVertical, Maximize2, 
  Settings, Download, Filter, Pin, ChevronLeft, Home
} from 'lucide-react';
import Link from 'next/link';
import { generateMockTiles } from '@/lib/finance';
import { TileData, ViewMode } from '@/types/finance-types';
import TileGrid from './TileGrid';
import FinanceAnalysis from './FinanceAnalysis';

const DynamicFinanceDashboard: React.FC = () => {
  // State for dashboard configuration
  const [columns, setColumns] = useState<number>(3);
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const [focusedTile, setFocusedTile] = useState<string | null>(null);
  const [splitTile, setSplitTile] = useState<string | null>(null);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch data from an API
        const data = generateMockTiles();
        setTiles(data);
      } catch (error) {
        console.error('Failed to load finance dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // Set up auto-refresh interval
    const interval = setInterval(() => {
      loadData();
      setLastRefreshed(new Date());
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

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

  // Layout controls component
  const LayoutControls = () => {
    return (
      <div className="flex items-center gap-2 bg-card rounded-lg shadow-sm p-1">
        <Button
          variant={columns === 2 ? "default" : "ghost"}
          size="sm"
          onClick={() => setColumns(2)}
          title="2 columns"
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
      <div className="flex items-center gap-2 bg-card rounded-lg shadow-sm p-1">
        <Button
          variant={viewMode === 'tile' ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setViewMode('tile');
            setFocusedTile(null);
            setSplitTile(null);
          }}
          title="Tile View"
        >
          <LayoutGrid className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Tiles</span>
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
        >
          <SplitSquareVertical className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Split</span>
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
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Full</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="font-bold">STEPS</span>
            </Link>
            
            <div className="flex items-center">
              <ChevronLeft className="h-4 w-4" />
              <Link href="/" className="ml-2 text-sm text-muted-foreground">
                Back to Dashboard
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              John Doe
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <ViewModeControls />
            <LayoutControls />
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span className="text-sm text-muted-foreground flex items-center ml-2">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/finance/configure">
                <Settings className="h-4 w-4 mr-1" />
                Configure Tiles
              </Link>
            </Button>
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
      </main>
    </div>
  );
};

export default DynamicFinanceDashboard;