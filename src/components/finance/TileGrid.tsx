import React from 'react';
import { TileData, ViewMode } from '@/types/finance-types';
import FinanceTile from './FinanceTile';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Filter, ArrowUpDown } from 'lucide-react';

interface TileGridProps {
  tiles: TileData[];
  columns: number;
  viewMode: ViewMode;
  focusedTile: string | null;
  splitTile: string | null;
  onTileFocus: (tileId: string) => void;
  isLoading: boolean;
}

const TileGrid: React.FC<TileGridProps> = ({
  tiles,
  columns,
  viewMode,
  focusedTile,
  splitTile,
  onTileFocus,
  isLoading
}) => {
  if (isLoading && tiles.length === 0) {
    return (
      <div className={`grid grid-cols-1 ${
        columns === 1 ? 'md:grid-cols-1' : 
        columns === 2 ? 'md:grid-cols-2' : 
        columns === 3 ? 'md:grid-cols-3' : 
        columns === 4 ? 'md:grid-cols-4' : 
        'md:grid-cols-5'
      } gap-4`}>
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="w-full">
            <Skeleton className="w-full h-64 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Render detailed data grid for a specific tile
  const renderDetailedDataGrid = (tileId: string) => {
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || !tile.slides || tile.slides.length === 0) return null;
    
    // Find a slide with grid data if available
    const gridSlide = tile.slides.find(s => s.chartType === 'grid');
    
    if (gridSlide && gridSlide.data && gridSlide.columns) {
      return (
        <Card className="mt-4">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Detailed Data: {tile.title}</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="grid">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="pivot">Pivot View</TabsTrigger>
              </TabsList>
              <TabsContent value="grid" className="mt-2">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {gridSlide.columns.map((column, index) => (
                          <TableHead key={index} className="font-medium">
                            <div className="flex items-center gap-1">
                              {column.label}
                              <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gridSlide.data.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {gridSlide.columns?.map((column, colIndex) => (
                            <TableCell key={colIndex}>
                              {row[column.key]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="pivot" className="mt-2">
                <div className="p-8 text-center text-muted-foreground">
                  Pivot view coming soon
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No detailed data available for this tile</p>
        </CardContent>
      </Card>
    );
  };

  // Render tile selector for Full View
  const renderTileSelector = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {tiles.map(tile => (
          <Button
            key={tile.id}
            variant={focusedTile === tile.id ? "default" : "outline"}
            size="sm"
            onClick={() => onTileFocus(tile.id)}
            className="flex items-center gap-1"
          >
            <div className={`w-2 h-2 rounded-full ${
              tile.status === 'success' ? 'bg-emerald-500' :
              tile.status === 'warning' ? 'bg-amber-500' :
              tile.status === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}></div>
            {tile.title}
          </Button>
        ))}
      </div>
    );
  };

  if (viewMode === 'full' && focusedTile) {
    const tile = tiles.find(t => t.id === focusedTile);
    if (!tile) {
      return (
        <div className="w-full p-8 bg-muted/20 rounded-lg text-center">
          <p className="text-muted-foreground">Selected tile not found</p>
        </div>
      );
    }
    
    return (
      <div className="w-full space-y-4">
        {renderTileSelector()}
        <FinanceTile 
          tile={tile} 
          onFocus={() => onTileFocus(tile.id)} 
          isFocused={true}
          isFullView={true}
        />
        {renderDetailedDataGrid(tile.id)}
      </div>
    );
  }

  if (viewMode === 'split' && splitTile) {
    const mainTile = tiles.find(t => t.id === splitTile);
    const otherTiles = tiles.filter(t => t.id !== splitTile);
    
    if (!mainTile) {
      return (
        <div className="w-full p-8 bg-muted/20 rounded-lg text-center">
          <p className="text-muted-foreground">Selected tile not found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-[60%]">
            <FinanceTile 
              tile={mainTile} 
              onFocus={() => onTileFocus(mainTile.id)} 
              isFocused={true}
              isFullView={false}
            />
          </div>
          <div className="w-full md:w-[40%]">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
              {otherTiles.map(tile => (
                <FinanceTile 
                  key={tile.id} 
                  tile={tile} 
                  onFocus={() => onTileFocus(tile.id)} 
                  isFocused={false}
                  isFullView={false}
                  isCompact={true}
                />
              ))}
            </div>
          </div>
        </div>
        {renderDetailedDataGrid(mainTile.id)}
      </div>
    );
  }

  // Default tile view
  return (
    <div className={`grid grid-cols-1 ${
      columns === 1 ? 'md:grid-cols-1' : 
      columns === 2 ? 'md:grid-cols-2' : 
      columns === 3 ? 'md:grid-cols-3' : 
      columns === 4 ? 'md:grid-cols-4' : 
      'md:grid-cols-5'
    } gap-4`}>
      {tiles.map(tile => (
        <FinanceTile 
          key={tile.id} 
          tile={tile} 
          onFocus={() => onTileFocus(tile.id)} 
          isFocused={false}
          isFullView={false}
        />
      ))}
    </div>
  );
};

export default TileGrid;