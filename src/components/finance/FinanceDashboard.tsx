import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Grid2X2, Maximize2, SplitSquareVertical, RefreshCw, Settings, 
  BarChart4, LineChart, PieChart, Table2, LayoutGrid, Filter, SlidersHorizontal, Search
} from 'lucide-react';
import TileGrid from './TileGrid';
import { TileData, ViewMode } from '@/types/finance-types';
import { generateMockTiles } from '@/lib/finance';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<TileStatus[]>([]);
  const [selectedChartTypes, setSelectedChartTypes] = useState<ChartType[]>([]);
  const [sortField, setSortField] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort tiles
  const filteredTiles = tiles.filter(tile => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      tile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(tile.status);
    
    // Chart type filter
    const matchesChartType = selectedChartTypes.length === 0 || 
      tile.slides.some(slide => selectedChartTypes.includes(slide.chartType));
    
    return matchesSearch && matchesStatus && matchesChartType;
  }).sort((a, b) => {
    // Sort by selected field
    if (sortField === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    } else if (sortField === 'status') {
      return sortDirection === 'asc' 
        ? a.status.localeCompare(b.status) 
        : b.status.localeCompare(a.status);
    } else if (sortField === 'lastUpdated') {
      return sortDirection === 'asc' 
        ? a.lastUpdated.localeCompare(b.lastUpdated) 
        : b.lastUpdated.localeCompare(a.lastUpdated);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTiles.length / pageSize);
  const paginatedTiles = filteredTiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSortDirection = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleStatus = (status: TileStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const toggleChartType = (chartType: ChartType) => {
    setSelectedChartTypes(prev => 
      prev.includes(chartType) 
        ? prev.filter(t => t !== chartType) 
        : [...prev, chartType]
    );
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
          {/* View Mode Tabs */}
          <Tabs defaultValue="tile" className="w-full md:w-auto" onValueChange={(value) => handleViewModeChange(value as ViewMode)}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="tile" title="Tile View">
                <Grid2X2 className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Tiles</span>
              </TabsTrigger>
              <TabsTrigger value="summary" title="Summary View">
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="grid" title="Grid View">
                <Table2 className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Grid</span>
              </TabsTrigger>
              <TabsTrigger value="pivot" title="Pivot View">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Pivot</span>
              </TabsTrigger>
              <TabsTrigger value="split" title="Split View">
                <SplitSquareVertical className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Split</span>
              </TabsTrigger>
              <TabsTrigger value="full" title="Full View">
                <Maximize2 className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Full</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2 ml-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter by Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['success', 'warning', 'error', 'info', 'neutral'] as TileStatus[]).map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`status-${status}`} 
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={() => toggleStatus(status)}
                        />
                        <Label htmlFor={`status-${status}`} className="capitalize">{status}</Label>
                      </div>
                    ))}
                  </div>
                  
                  <h4 className="font-medium">Filter by Chart Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['bar', 'line', 'pie', 'grid', 'progress', 'status'] as ChartType[]).map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`chart-${type}`} 
                          checked={selectedChartTypes.includes(type)}
                          onCheckedChange={() => toggleChartType(type)}
                        />
                        <Label htmlFor={`chart-${type}`} className="capitalize">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Columns selector (only for tile view) */}
            {viewMode === 'tile' && (
              <Select value={columns.toString()} onValueChange={(value) => setColumns(parseInt(value))}>
                <SelectTrigger className="w-[130px]">
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
            )}
            
            {/* Refresh button */}
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Settings button */}
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Example image from the provided URL */}
      {viewMode === 'summary' && (
        <div className="mb-6">
          <Image 
            src="https://assets.co.dev/19129c8d-1c91-4384-9bc0-e0d1fdc82154/image-2ffb6b4.png"
            alt="Financial Dashboard Example"
            width={1200}
            height={800}
            className="w-full h-auto rounded-lg border shadow-sm"
          />
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="rounded-md border">
          <div className="p-4 bg-muted/50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Financial Data Grid</h3>
              <div className="flex items-center gap-2">
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-sm cursor-pointer" onClick={() => toggleSortDirection('title')}>
                    <div className="flex items-center">
                      Title
                      {sortField === 'title' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-sm cursor-pointer" onClick={() => toggleSortDirection('status')}>
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm cursor-pointer" onClick={() => toggleSortDirection('lastUpdated')}>
                    <div className="flex items-center">
                      Last Updated
                      {sortField === 'lastUpdated' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTiles.map(tile => (
                  <tr key={tile.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">{tile.title}</td>
                    <td className="px-4 py-3">{tile.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${tile.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                        ${tile.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${tile.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                        ${tile.status === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                        ${tile.status === 'neutral' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {tile.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{tile.lastUpdated}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => handleTileFocus(tile.id)}>
                        <Maximize2 className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTiles.length)} of {filteredTiles.length} entries
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pivot View (placeholder) */}
      {viewMode === 'pivot' && (
        <div className="bg-muted/30 border rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Pivot View</h3>
          <p className="text-muted-foreground mb-4">This view is a placeholder for future implementation.</p>
          <p className="text-muted-foreground">The pivot view will allow for dynamic cross-tabulation of financial data.</p>
        </div>
      )}

      {/* Tile, Split, and Full views use the existing TileGrid component */}
      {(viewMode === 'tile' || viewMode === 'split' || viewMode === 'full') && (
        <TileGrid 
          tiles={filteredTiles} 
          columns={columns} 
          viewMode={viewMode} 
          focusedTile={focusedTile}
          splitTile={splitTile}
          onTileFocus={handleTileFocus}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default FinanceDashboard;