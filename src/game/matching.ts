import type {PowerUp, TileKind, TrayItem} from './types';
import {MATCH_SCORE, MATCH_SIZE} from './constants';

export interface MatchResult {
  tray: TrayItem[];
  matched: boolean;
  matchedKind?: TileKind;
  score: number;
}

export function isPowerUpKind(kind: TileKind): kind is PowerUp {
  return kind === 'clearTray' || kind === 'undo' || kind === 'removeTile';
}

/** Removes exactly three of the first matching kind, if any. */
export function processTray(tray: TrayItem[]): MatchResult {
  const counts = new Map<TileKind, number>();
  for (const item of tray) counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);

  const matchedKind = [...counts.entries()]
    .find(([, count]) => count >= MATCH_SIZE)?.[0];

  if (!matchedKind) return {tray, matched: false, score: 0};

  let removed = 0;
  const nextTray = tray.filter(item => {
    if (item.kind === matchedKind && removed < MATCH_SIZE) {
      removed++;
      return false;
    }
    return true;
  });

  return {tray: nextTray, matched: true, matchedKind, score: MATCH_SCORE};
}
