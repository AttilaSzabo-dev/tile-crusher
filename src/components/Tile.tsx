import type { Tile as TileType } from "../game/types";
import { TILE_LABEL, TILE_NAME } from "../game/constants";
import { isPowerUpKind } from "../game/matching";
export function Tile({
  tile,
  blocked,
  onClick,
}: {
  tile: TileType;
  blocked: boolean;
  onClick: () => void;
}) {
  const isPowerUp = isPowerUpKind(tile.kind);
  return (
    <button
      aria-label={`${TILE_NAME[tile.kind]}${isPowerUp ? " upgrade" : ""}${blocked ? " blocked" : ""}`}
      disabled={blocked}
      onClick={onClick}
      className={`absolute w-[92px] h-[86px] rounded-xl border-2 border-black/20 bg-gradient-to-br from-white to-slate-200 text-4xl shadow-[0_5px_0_rgba(0,0,0,.25),0_8px_18px_rgba(0,0,0,.18)] transition-transform ${blocked ? "cursor-not-allowed brightness-75" : "cursor-pointer hover:-translate-y-1 hover:brightness-105 active:translate-y-0"} ${isPowerUp ? "ring-2 ring-amber-300" : ""}`}
      style={{ left: tile.x, top: tile.y, zIndex: tile.z + 1 }}
    >
      {TILE_LABEL[tile.kind]}
      {isPowerUp && (
        <span className="absolute right-1 top-1 rounded-full bg-amber-400 px-1 text-xs text-black">
          +
        </span>
      )}
    </button>
  );
}
