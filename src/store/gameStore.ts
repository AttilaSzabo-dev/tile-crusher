import {create} from 'zustand';import type {GameSnapshot,GameState,PowerUp,Tile,TrayItem} from '../game/types';import {generateLevel} from '../game/generator';import {TRAY_LIMIT} from '../game/constants';
const initialCharges=()=>({clearTray:5,undo:5,removeTile:5});
const snap=(s:GameState):GameSnapshot=>({tiles:s.tiles.map(t=>({...t})),tray:s.tray.map(t=>({...t})),score:s.score,charges:{...s.charges}});
interface Actions{start:()=>void;clickTile:(id:string)=>void;clearTray:()=>void;undo:()=>void;removeBlockedTile:()=>void;save:(playerId:string)=>Promise<void>;load:(playerId:string)=>Promise<void>}
export const useGameStore=create<GameState&Actions>((set,get)=>({level:1,score:0,tiles:generateLevel(),tray:[],charges:initialCharges(),history:[],gameOver:false,won:false,
 start:()=>set({level:1,score:0,tiles:generateLevel(1),tray:[],charges:initialCharges(),history:[],gameOver:false,won:false}),
 clickTile:(id)=>set(s=>{const tile=s.tiles.find(t=>t.id===id);if(!tile||tile.removed||s.gameOver)return s;const top=s.tiles.filter(t=>!t.removed&&t.z>tile.z&&Math.abs(t.x-t.x)<999);const blocked=top.some(t=>Math.abs(t.x-tile.x)<80&&Math.abs(t.y-tile.y)<72);if(blocked)return s;if(s.tray.length>=TRAY_LIMIT)return {...s,gameOver:true};
   const history=[...s.history,snap(s)].slice(-20);const tiles=s.tiles.map(t=>t.id===id?{...t,removed:true}:t);const tray=[...s.tray,{id:tile.id,kind:tile.kind} as TrayItem];let score=s.score;let charges={...s.charges};
   if(tile.powerUp)charges[tile.powerUp]++;let nextTray=tray;
   const same=nextTray.filter(t=>t.kind===tile.kind);if(same.length>=3){let remaining=2;nextTray=[];for(const item of tray){if(item.kind===tile.kind&&remaining>0)remaining--;else nextTray.push(item)}score+=100;}
   const won=tiles.every(t=>t.removed);return {...s,tiles,tray:nextTray,score,charges,history,won,gameOver:won};}),
 clearTray:()=>set(s=>s.charges.clearTray>0?{tray:[],charges:{...s.charges,clearTray:s.charges.clearTray-1},history:[...s.history,snap(s)].slice(-20)}:s),
 undo:()=>set(s=>{if(!s.charges.undo||!s.history.length)return s;const h=[...s.history];const prev=h.pop()!;return {...s,...prev,charges:{...prev.charges,undo:Math.max(0,prev.charges.undo-1)},history:h,gameOver:false,won:false}}),
 removeBlockedTile:()=>set(s=>{if(!s.charges.removeTile)return s;const candidates=s.tiles.filter(t=>!t.removed);if(!candidates.length)return s;const target=candidates[Math.floor(Math.random()*candidates.length)];return {...s,tiles:s.tiles.map(t=>t.id===target.id?{...t,removed:true}:t),charges:{...s.charges,removeTile:s.charges.removeTile-1},history:[...s.history,snap(s)].slice(-20)}}),
 save:async(playerId)=>{const s=get();await fetch(`${import.meta.env.VITE_API_URL||'http://localhost:3001/api'}/save/${playerId}`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({level:s.level,score:s.score,tiles:s.tiles,tray:s.tray,charges:s.charges})})},
 load:async(playerId)=>{try{const r=await fetch(`${import.meta.env.VITE_API_URL||'http://localhost:3001/api'}/save/${playerId}`);if(!r.ok)return;const d=await r.json();set(s=>({...s,...d,history:[],gameOver:false,won:false}))}catch{}}
}));
