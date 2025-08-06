import React from 'react';
import { AdhocTileData, AdhocViewMode } from '@/types/adhoc-types';
import AdhocTile from './AdhocTile';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Filter, ArrowUpDown } from 'lucide-react';

interface AdhocTileGridProps {
  tiles: AdhocTileData[];
  columns: number;
  viewMode: AdhocViewMode;
  focusedTile: string | null;
  splitTile: string | null;
  onTileFocus: (tileId: string) => void;
  isLoading: boolean;
}

const AdhocTileGrid: React.FC<AdhocTileGridProps> = ({
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
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-full">
            <Skeleton className="w-full h-64 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (tiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No tiles configured. Go to the Tiles tab to add some visualizations.</p>
        </CardContent>
      </Card>
    );
  }

  // Render detailed data grid for a specific tile
  const renderDetailedDataGrid = (tileId: string) => {
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || !tile.data || tile.data.length === 0) return null;
    
    // Get field names from the first data item
    const firstItem = tile.data[0];
    const fields = Object.keys(firstItem);
    
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {fields.map((field) => (
                    <TableHead key={field} className="font-medium">
                      <div className="flex items-center gap-1">
                        {field}
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tile.data.slice(0, 100).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {fields.map((field) => (
                      <TableCell key={field}>
                        {typeof row[field] === 'object' 
                          ? JSON.stringify(row[field]) 
                          : String(row[field] || '')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {tile.data.length > 100 && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing first 100 rows of {tile.data.length} total rows
            </p>
          )}
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
        <AdhocTile 
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
            <AdhocTile 
              tile={mainTile} 
              onFocus={() => onTileFocus(mainTile.id)} 
              isFocused={true}
              isFullView={false}
            />
            {renderDetailedDataGrid(mainTile.id)}
          </div>
          <div className="w-full md:w-[40%]">
            <div className={`grid grid-cols-1 gap-4`}>
              {otherTiles.map(tile => (
                <AdhocTile 
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
        <AdhocTile 
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

export default AdhocTileGrid;