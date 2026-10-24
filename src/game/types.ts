export type TileKind='burger'|'fries'|'sushi'|'ramen'|'coffee'|'dessert'|'skewer'|'snack'|'special';
export type PowerUp='clearTray'|'undo'|'removeTile';
export interface Tile{ id:string; kind:TileKind; x:number; y:number; z:number; removed:boolean; powerUp?:PowerUp }
export interface TrayItem{ id:string; kind:TileKind }
export interface GameState{level:number;score:number;tiles:Tile[];tray:TrayItem[];charges:Record<PowerUp,number>;history:GameSnapshot[];gameOver:boolean;won:boolean}
export interface GameSnapshot{tiles:Tile[];tray:TrayItem[];score:number;charges:Record<PowerUp,number>}
