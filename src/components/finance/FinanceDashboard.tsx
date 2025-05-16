import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid2X2, Maximize2, SplitSquareVertical, RefreshCw, Settings } from 'lucide-react';
import TileGrid from './TileGrid';
import { TileData, ViewMode } from '@/types/finance-types';
import { generateMockTiles } from '@/lib/finance';

interface FinanceDashboardProps {
  workflowId?: string;
  workflowName?: string;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ workflowId, workflowName }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('tile');
  const [columns, setColumns] = useState<number>(3);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [focusedTile, setFocusedTile] = useState<string | null>(null);
  const [splitTile, setSplitTile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

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
    const interval = setInterval(() => {
      loadData();
      setLastRefreshed(new Date());
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [workflowId]);

  const handleRefresh = () => {
    setIsLoading(true);
    // In a real app, we would fetch fresh data
    setTimeout(() => {
      const data = generateMockTiles();
      setTiles(data);
      setLastRefreshed(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setFocusedTile(null);
    setSplitTile(null);
  };

  const handleTileFocus = (tileId: string) => {
    if (viewMode === 'tile') {
      setViewMode('full');
      setFocusedTile(tileId);
    } else if (viewMode === 'split') {
      setSplitTile(tileId);
    } else if (viewMode === 'full') {
      if (focusedTile === tileId) {
        setViewMode('tile');
        setFocusedTile(null);
      } else {
        setFocusedTile(tileId);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Financial Dashboard {workflowName ? `- ${workflowName}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={columns.toString()} onValueChange={(value) => setColumns(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Columns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Column</SelectItem>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
              <SelectItem value="5">5 Columns</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button 
              variant={viewMode === 'tile' ? 'default' : 'ghost'} 
              size="icon" 
              onClick={() => handleViewModeChange('tile')}
              title="Tile View"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'split' ? 'default' : 'ghost'} 
              size="icon" 
              onClick={() => handleViewModeChange('split')}
              title="Split View"
            >
              <SplitSquareVertical className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'full' ? 'default' : 'ghost'} 
              size="icon" 
              onClick={() => handleViewModeChange('full')}
              title="Full View"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TileGrid 
        tiles={tiles} 
        columns={columns} 
        viewMode={viewMode} 
        focusedTile={focusedTile}
        splitTile={splitTile}
        onTileFocus={handleTileFocus}
        isLoading={isLoading}
      />
    </div>
  );
};

export default FinanceDashboard;