import type {Tile} from './types';
import {TILE_H, TILE_W} from './constants';

export function overlaps(a: Tile, b: Tile): boolean {
  return (
    a.x < b.x + TILE_W &&
    a.x + TILE_W > b.x &&
    a.y < b.y + TILE_H &&
    a.y + TILE_H > b.y
  );
}

export function isTileBlocked(tiles: Tile[], tile: Tile): boolean {
  return tiles.some(other => {
    if (other.removed || other.id === tile.id) return false;
    if (other.z <= tile.z) return false;
    return overlaps(tile, other);
  });
}

export function isTilePlayable(tiles: Tile[], tileId: string): boolean {
  const tile = tiles.find(item => item.id === tileId);
  return !!tile && !tile.removed && !isTileBlocked(tiles, tile);
}

export function getPlayableTiles(tiles: Tile[]): Tile[] {
  return tiles.filter(tile => !tile.removed && isTilePlayable(tiles, tile.id));
}

export function getBlockedTiles(tiles: Tile[]): Tile[] {
  return tiles.filter(tile => !tile.removed && isTileBlocked(tiles, tile));
}
