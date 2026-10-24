import type {Tile,TileKind} from './types';
const kinds:TileKind[]=['burger','fries','sushi','ramen','coffee','dessert','skewer','snack'];
const pick=<T,>(a:T[])=>a[Math.floor(Math.random()*a.length)];
export function generateLevel(level=1):Tile[]{
 const tiles:Tile[]=[];let id=0;
 const cols=7,rows=4;
 const positions:Array<[number,number,number]>=[];
 for(let z=0;z<3;z++)for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const jitter=(Math.random()-.5)*12;
   positions.push([x*92+z*26+jitter,y*78+z*22,z]);
 }
 // Keep the board solvable-ish by generating each kind in groups of 3.
 const total=positions.length;const pool:TileKind[]=[];
 for(let i=0;i<total;i+=3){const k=pick(kinds);pool.push(k,k,k)}
 pool.sort(()=>Math.random()-.5);
 positions.forEach(([x,y,z],i)=>tiles.push({id:`${level}-${id++}`,kind:pool[i],x,y,z,removed:false}));
 const specialCount=Math.max(2,Math.floor(level/2));
 for(let i=0;i<specialCount;i++){const t=tiles[Math.floor(Math.random()*tiles.length)];if(!t.powerUp)t.powerUp=pick(['clearTray','undo','removeTile'] as const)}
 return tiles;
}
