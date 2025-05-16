import React from 'react';
import { TileData, ViewMode } from '@/types/finance-types';
import FinanceTile from './FinanceTile';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="w-full">
        <FinanceTile 
          tile={tile} 
          onFocus={() => onTileFocus(tile.id)} 
          isFocused={true}
          isFullView={true}
        />
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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-[70%]">
          <FinanceTile 
            tile={mainTile} 
            onFocus={() => onTileFocus(mainTile.id)} 
            isFocused={true}
            isFullView={false}
          />
        </div>
        <div className="w-full md:w-[30%]">
          <div className={`grid grid-cols-1 gap-4`}>
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