import type {TileKind} from './types';

export const TILE_LABEL: Record<TileKind, string> = {
  burger: '🍔',
  fries: '🍟',
  sushi: '🍣',
  ramen: '🍜',
  coffee: '☕',
  dessert: '🍩',
  skewer: '🍢',
  snack: '🧀',
  special: '✨',
  clearTray: '🧹',
  undo: '↩️',
  removeTile: '🪄',
};

export const TILE_NAME: Record<TileKind, string> = {
  burger: 'Burger',
  fries: 'Fries',
  sushi: 'Sushi',
  ramen: 'Ramen',
  coffee: 'Coffee',
  dessert: 'Dessert',
  skewer: 'Skewer',
  snack: 'Snack',
  special: 'Special',
  clearTray: 'Clear Tray',
  undo: 'Undo',
  removeTile: 'Remove Tile',
};

export const POWER_LABEL = {
  clearTray: 'Clear tray',
  undo: 'Undo',
  removeTile: 'Remove tile',
} as const;

export const TILE_W = 92;
export const TILE_H = 86;
export const TRAY_LIMIT = 6;
export const MAX_POWER_CHARGE = 5;
export const MATCH_SIZE = 3;
export const MATCH_SCORE = 100;
export const HISTORY_LIMIT = 20;
