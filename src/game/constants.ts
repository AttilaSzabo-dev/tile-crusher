import type {TileKind} from './types';
export const TILE_LABEL:Record<TileKind,string>={burger:'🍔',fries:'🍟',sushi:'🍣',ramen:'🍜',coffee:'☕',dessert:'🍩',skewer:'🍢',snack:'🧀',special:'✨'};
export const TILE_NAME:Record<TileKind,string>={burger:'Burger',fries:'Fries',sushi:'Sushi',ramen:'Ramen',coffee:'Coffee',dessert:'Dessert',skewer:'Skewer',snack:'Snack',special:'Special'};
export const POWER_LABEL={clearTray:'Clear tray',undo:'Undo',removeTile:'Remove tile'} as const;
export const TILE_W=92,TILE_H=86,TRAY_LIMIT=6;
