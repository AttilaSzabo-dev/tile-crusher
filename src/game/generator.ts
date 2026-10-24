import type { Difficulty, LayoutName, Tile, TileKind } from "./types";
import { TILE_W } from "./constants";
import { getPlayableTiles } from "./blocking";

const kinds: TileKind[] = [
  "burger",
  "fries",
  "sushi",
  "ramen",
  "coffee",
  "dessert",
  "skewer",
  "snack",
  "special",
  // Power-ups are first-class tile kinds: they also appear in groups of three.
  "clearTray",
  "undo",
  "removeTile",
];

const layouts: LayoutName[] = [
  "grid",
  "diamond",
  "cross",
  "snake",
  "pyramid",
  "corners",
];

const difficultyConfig: Record<
  Difficulty,
  {
    cols: number;
    rows: number;
    layers: number;
    jitter: number;
    layerOffsetX: number;
    layerOffsetY: number;
  }
> = {
  easy: {
    cols: 6,
    rows: 4,
    layers: 3,
    jitter: 12,
    layerOffsetX: 26,
    layerOffsetY: 22,
  },
  normal: {
    cols: 6,
    rows: 5,
    layers: 4,
    jitter: 10,
    layerOffsetX: 22,
    layerOffsetY: 20,
  },
  hard: {
    cols: 6,
    rows: 5,
    layers: 5,
    jitter: 8,
    layerOffsetX: 18,
    layerOffsetY: 18,
  },
};

const random = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

function isInsideDiamond(
  x: number,
  y: number,
  cols: number,
  rows: number,
  radius: number,
) {
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  return Math.abs(x - cx) + Math.abs(y - cy) <= radius;
}

function cellExists(
  layout: LayoutName,
  x: number,
  y: number,
  z: number,
  cols: number,
  rows: number,
  layers: number,
): boolean {
  if (layout === "grid") return true;

  if (layout === "diamond") {
    const radius = Math.max(2, Math.min(cols, rows) / 2 + z * 0.35);
    return isInsideDiamond(x, y, cols, rows, radius);
  }

  if (layout === "cross") {
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);
    return Math.abs(x - cx) <= 1 || Math.abs(y - cy) <= 1;
  }

  if (layout === "snake") {
    return true;
  }

  if (layout === "pyramid") {
    const shrink = Math.max(0, layers - 1 - z);
    const minX = Math.floor(shrink / 2);
    const maxX = cols - 1 - minX;
    const minY = Math.floor(shrink / 2);
    const maxY = rows - 1 - minY;
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }

  // corners: keep a little more material around the four corners.
  const edgeX = x === 0 || x === cols - 1;
  const edgeY = y === 0 || y === rows - 1;
  return edgeX || edgeY || z === layers - 1;
}

function createPositions(difficulty: Difficulty, layout: LayoutName) {
  const config = difficultyConfig[difficulty];
  const positions: Array<{ x: number; y: number; z: number }> = [];

  // Build lower layers first only for visual consistency; blocking uses z.
  for (let z = 0; z < config.layers; z++) {
    for (let y = 0; y < config.rows; y++) {
      for (let x = 0; x < config.cols; x++) {
        if (
          !cellExists(layout, x, y, z, config.cols, config.rows, config.layers)
        )
          continue;

        const snakeOffset =
          layout === "snake" && y % 2 === 1 ? TILE_W * 0.45 : 0;
        const jitterX = (Math.random() - 0.5) * config.jitter;
        const jitterY = (Math.random() - 0.5) * config.jitter;

        positions.push({
          x: x * TILE_W + z * config.layerOffsetX + snakeOffset + jitterX,
          y: y * 78 + z * config.layerOffsetY + jitterY,
          z,
        });
      }
    }
  }

  // The tray works in groups of three, so the board must be divisible by 3.
  while (positions.length % 3 !== 0) {
    // Remove from the lowest layer first. This has the least impact on blocking.
    const lowest = Math.min(...positions.map((p) => p.z));
    const index = positions.findIndex((p) => p.z === lowest);
    if (index === -1) break;
    positions.splice(index, 1);
  }

  return positions;
}

/**
 * Assign kinds using a simulated solution order.
 * At every step we choose currently playable tiles in groups of three and
 * give those three the same kind. Therefore the generated board always has
 * at least one valid solution path, independent of the visual layout.
 */
function assignSolvableKinds(tiles: Tile[]): void {
  const active = tiles.map((tile) => ({ ...tile }));
  let previousKind: TileKind | undefined;

  while (active.length > 0) {
    const chosen: Tile[] = [];

    for (let i = 0; i < 3; i++) {
      const playable = getPlayableTiles(active);
      if (playable.length === 0) {
        throw new Error(
          "Unable to construct a solvable level from this layout.",
        );
      }

      const differentKinds = kinds.filter((kind) => kind !== previousKind);
      const kind = random(differentKinds);
      const tile = random(playable);

      chosen.push(tile);
      active.splice(
        active.findIndex((item) => item.id === tile.id),
        1,
      );

      if (i === 2) {
        previousKind = kind;
        for (const selected of chosen) {
          const target = tiles.find((item) => item.id === selected.id)!;
          target.kind = kind;
        }
      } else {
        // Temporarily mark selected tiles removed so the next pick can expose
        // tiles underneath. Their final kind is assigned after the third pick.
        tile.removed = true;
      }
    }

    // Reset temporary removal for chosen tiles in the simulated array only.
    // The selected objects are already removed from active, so nothing else is needed.
  }
}

export function generateLevel(
  level = 1,
  difficulty: Difficulty = "easy",
  layout: LayoutName = random(layouts),
): Tile[] {
  const positions = createPositions(difficulty, layout);

  const tiles: Tile[] = positions.map((position, index) => ({
    id: `${level}-${index}`,
    kind: "burger",
    x: position.x,
    y: position.y,
    z: position.z,
    removed: false,
  }));

  assignSolvableKinds(tiles);

  // Power-up kinds are assigned by assignSolvableKinds exactly like food kinds.
  // A charge is awarded only when a matching trio is cleared in the tray.

  return tiles;
}

export function getRandomLayout(): LayoutName {
  return random(layouts);
}
