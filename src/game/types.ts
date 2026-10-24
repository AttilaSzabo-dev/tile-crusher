export type TileKind =
  | 'burger'
  | 'fries'
  | 'sushi'
  | 'ramen'
  | 'coffee'
  | 'dessert'
  | 'skewer'
  | 'snack'
  | 'special'
  | 'clearTray'
  | 'undo'
  | 'removeTile';

export type PowerUp = 'clearTray' | 'undo' | 'removeTile';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type LayoutName =
  | 'grid'
  | 'diamond'
  | 'cross'
  | 'snake'
  | 'pyramid'
  | 'corners';

export interface Tile {
  id: string;
  kind: TileKind;
  x: number;
  y: number;
  z: number;
  removed: boolean;
}

export interface TrayItem {
  id: string;
  kind: TileKind;
}

export interface GameSnapshot {
  tiles: Tile[];
  tray: TrayItem[];
  score: number;
  charges: Record<PowerUp, number>;
}

export interface GameState {
  level: number;
  difficulty: Difficulty;
  layout: LayoutName;
  score: number;
  tiles: Tile[];
  tray: TrayItem[];
  charges: Record<PowerUp, number>;
  history: GameSnapshot[];
  gameOver: boolean;
  won: boolean;
  removeMode: boolean;
}
