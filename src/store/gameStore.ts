import { create } from "zustand";
import type {
  Difficulty,
  GameSnapshot,
  GameState,
  LayoutName,
  PowerUp,
  TrayItem,
} from "../game/types";
import { generateLevel, getRandomLayout } from "../game/generator";
import { getBlockedTiles, isTilePlayable } from "../game/blocking";
import { isPowerUpKind, processTray } from "../game/matching";
import { HISTORY_LIMIT, MAX_POWER_CHARGE, TRAY_LIMIT } from "../game/constants";

const initialCharges = (): Record<PowerUp, number> => ({
  clearTray: 5,
  undo: 5,
  removeTile: 5,
});

const snap = (s: GameState): GameSnapshot => ({
  tiles: s.tiles.map((tile) => ({ ...tile })),
  tray: s.tray.map((item) => ({ ...item })),
  score: s.score,
  charges: { ...s.charges },
});

interface Actions {
  start: (difficulty?: Difficulty, layout?: LayoutName) => void;
  clickTile: (id: string) => void;
  clearTray: () => void;
  undo: () => void;
  activateRemoveTile: () => void;
  removeBlockedTile: () => void;
  removeTile: (id: string) => void;
  save: (playerId: string) => Promise<void>;
  load: (playerId: string) => Promise<void>;
}

const initialDifficulty: Difficulty = "easy";
const initialLayout = getRandomLayout();

export const useGameStore = create<GameState & Actions>((set, get) => ({
  level: 1,
  difficulty: initialDifficulty,
  layout: initialLayout,
  score: 0,
  tiles: generateLevel(1, initialDifficulty, initialLayout),
  tray: [],
  charges: initialCharges(),
  history: [],
  gameOver: false,
  won: false,
  removeMode: false,

  start: (difficulty = get().difficulty, layout = getRandomLayout()) => {
    set({
      level: 1,
      difficulty,
      layout,
      score: 0,
      tiles: generateLevel(1, difficulty, layout),
      tray: [],
      charges: initialCharges(),
      history: [],
      gameOver: false,
      won: false,
      removeMode: false,
    });
  },

  clickTile: (id) =>
    set((state) => {
      if (state.gameOver || state.won) return state;

      // Remove mode is an explicit player-selected action.
      if (state.removeMode) {
        const tile = state.tiles.find((item) => item.id === id);
        if (!tile || tile.removed) return state;

        // Only blocked tiles may be removed with this power-up.
        if (isTilePlayable(state.tiles, id)) return state;

        const history = [...state.history, snap(state)].slice(-HISTORY_LIMIT);
        const tiles = state.tiles.map((item) =>
          item.id === id ? { ...item, removed: true } : item,
        );

        const won = tiles.every((item) => item.removed);

        return {
          ...state,
          tiles,
          history,
          removeMode: false,
          charges: {
            ...state.charges,
            removeTile: state.charges.removeTile - 1,
          },
          won,
          gameOver: won,
        };
      }

      const tile = state.tiles.find((item) => item.id === id);
      if (!tile || tile.removed || !isTilePlayable(state.tiles, id))
        return state;

      const history = [...state.history, snap(state)].slice(-HISTORY_LIMIT);
      const tiles = state.tiles.map((item) =>
        item.id === id ? { ...item, removed: true } : item,
      );

      const tray: TrayItem[] = [
        ...state.tray,
        { id: tile.id, kind: tile.kind },
      ];

      const result = processTray(tray);

      const charges = { ...state.charges };
      // Power-up tiles grant a charge only when three of that power-up match.
      if (result.matchedKind && isPowerUpKind(result.matchedKind)) {
        charges[result.matchedKind] = Math.min(
          MAX_POWER_CHARGE,
          charges[result.matchedKind] + 1,
        );
      }

      const won = tiles.every((item) => item.removed);

      // Important: the sixth tile is allowed to enter the tray. If it does not
      // create a match and therefore remains in a full tray, the game ends now.
      const trayFullWithoutMatch =
        !result.matched && result.tray.length >= TRAY_LIMIT;

      return {
        ...state,
        tiles,
        tray: result.tray,
        score: state.score + result.score,
        charges,
        history,
        won,
        gameOver: won || trayFullWithoutMatch,
      };
    }),

  clearTray: () =>
    set((state) => {
      if (
        state.gameOver ||
        state.won ||
        state.charges.clearTray <= 0 ||
        state.tray.length === 0
      )
        return state;

      return {
        ...state,
        tray: [],
        charges: {
          ...state.charges,
          clearTray: state.charges.clearTray - 1,
        },
        history: [...state.history, snap(state)].slice(-HISTORY_LIMIT),
      };
    }),

  undo: () =>
    set((state) => {
      if (state.charges.undo <= 0 || state.history.length === 0) return state;

      const history = [...state.history];
      const previous = history.pop()!;
      const undoCharges = state.charges.undo - 1;

      // Do NOT restore previous.charges.undo here. The charge belongs to the
      // current player state, otherwise every undo restores the same charge.
      return {
        ...state,
        ...previous,
        charges: {
          ...previous.charges,
          undo: undoCharges,
        },
        history,
        removeMode: false,
        gameOver: false,
        won: false,
      };
    }),

  activateRemoveTile: () =>
    set((state) => {
      if (
        state.gameOver ||
        state.won ||
        state.charges.removeTile <= 0 ||
        getBlockedTiles(state.tiles).length === 0
      )
        return state;

      return {
        ...state,
        removeMode: !state.removeMode,
      };
    }),

  removeBlockedTile: () =>
    set((state) => {
      if (
        state.gameOver ||
        state.won ||
        state.charges.removeTile <= 0 ||
        getBlockedTiles(state.tiles).length === 0
      )
        return state;

      return {
        ...state,
        removeMode: !state.removeMode,
      };
    }),

  removeTile: (id) =>
    set((state) => {
      if (!state.removeMode) return state;
      const tile = state.tiles.find((item) => item.id === id);
      if (!tile || tile.removed || isTilePlayable(state.tiles, id))
        return state;

      const history = [...state.history, snap(state)].slice(-HISTORY_LIMIT);
      const tiles = state.tiles.map((item) =>
        item.id === id ? { ...item, removed: true } : item,
      );
      const won = tiles.every((item) => item.removed);

      return {
        ...state,
        tiles,
        history,
        removeMode: false,
        charges: {
          ...state.charges,
          removeTile: state.charges.removeTile - 1,
        },
        won,
        gameOver: won,
      };
    }),

  save: async (playerId) => {
    const state = get();
    await fetch(
      `${import.meta.env.VITE_API_URL ?? "http://localhost:3001/api"}/save/${playerId}`,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          level: state.level,
          difficulty: state.difficulty,
          layout: state.layout,
          score: state.score,
          tiles: state.tiles,
          tray: state.tray,
          charges: state.charges,
        }),
      },
    );
  },

  load: async (playerId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3001/api"}/save/${playerId}`,
      );
      if (!response.ok) return;

      const data = await response.json();
      set((state) => ({
        ...state,
        ...data,
        history: [],
        removeMode: false,
        gameOver: false,
        won: false,
      }));
    } catch {
      // Keep current state on network failure.
    }
  },
}));
