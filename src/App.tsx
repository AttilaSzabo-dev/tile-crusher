import { useEffect, useMemo } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { useGameStore } from "./store/gameStore";
import { Tile } from "./components/Tile";
import { Tray } from "./components/Tray";
import { ActionButton } from "./components/ActionButton";
function playerId() {
  let id = localStorage.getItem("tile-crusher-player");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("tile-crusher-player", id);
  }
  return id;
}
export function App() {
  const s = useGameStore();
  const id = useMemo(playerId, []);
  useEffect(() => {
    s.load(id);
  }, []);
  const active = s.tiles.filter((t) => !t.removed);
  const isBlocked = (tileId: string) => {
    const tile = s.tiles.find((t) => t.id === tileId)!;
    return active.some(
      (t) =>
        t.id !== tileId &&
        t.z > tile.z &&
        Math.abs(t.x - tile.x) < 80 &&
        Math.abs(t.y - tile.y) < 72,
    );
  };
  const save = async () => s.save(id);
  return (
    <main className="game-bg min-h-screen px-4 py-4 text-white">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-bold">
            <span className="text-3xl">▤</span>
            <span>Tile Crusher</span>
          </div>
          <button
            className="rounded-full bg-black/25 p-3 hover:bg-black/40"
            onClick={() => s.start()}
            aria-label="Restart"
          >
            <ArrowLeft />
          </button>
        </header>
        <section className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-widest text-white/60">
              Level {s.level}
            </div>
            <div className="text-2xl font-black">Score {s.score}</div>
          </div>
          <button
            onClick={save}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <Save size={17} /> Save
          </button>
        </section>
        <div className="relative mx-auto h-[390px] w-full max-w-[900px] overflow-hidden rounded-3xl bg-black/10 board-shadow">
          {active.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              blocked={isBlocked(tile.id)}
              onClick={() => s.clickTile(tile.id)}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-5">
          <ActionButton
            type="clearTray"
            charges={s.charges.clearTray}
            onClick={s.clearTray}
          />
          <ActionButton type="undo" charges={s.charges.undo} onClick={s.undo} />
          <ActionButton
            type="removeTile"
            charges={s.charges.removeTile}
            onClick={s.removeBlockedTile}
          />
        </div>
        <Tray items={s.tray} />
        <div className="mx-auto max-w-[720px] text-center text-xs text-white/60">
          Match 3 identical tiles to score. Covered tiles cannot be selected.
          Power-ups can appear under tiles and restore one charge.
        </div>
        {(s.gameOver || s.won) && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 p-8 text-center shadow-2xl">
              <div className="text-4xl">{s.won ? "🏆" : "⚠️"}</div>
              <h2 className="mt-3 text-3xl font-black">
                {s.won ? "Level cleared" : "Tray full"}
              </h2>
              <p className="mt-2 text-white/70">Score: {s.score}</p>
              <button
                onClick={() => s.start()}
                className="mt-6 rounded-xl bg-amber-400 px-6 py-3 font-bold text-amber-950"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
