import { Tile } from './Tile';
import type { TileData } from './Tile';

export function TileGrid({ tiles }: { tiles: TileData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <Tile key={tile.code} tile={tile} />
      ))}
    </div>
  );
}

export type { TileData };
