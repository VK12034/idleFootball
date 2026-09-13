import { BALANCE } from '../config/balance';
import { newGame, teamFromConfig } from './generate';
import { tick } from './tick';
import type { GameState } from './types';

const KEY = 'gridiron.save';
const VERSION = 2;

export function save(state: GameState): void {
  try {
    state.lastSavedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — the game keeps running either way */
  }
}

export interface LoadResult {
  state: GameState;
  /** Milliseconds of catch-up that were applied, 0 for a fresh save. */
  offlineMs: number;
  offlineYards: number;
}

/**
 * Reads the save, rebuilds any missing fields, then fast-forwards the game by
 * however long the player was away (capped, so leaving for a week is not a
 * jackpot). Falls back to a new game if anything looks wrong.
 */
export function load(): LoadResult {
  let parsed: Partial<GameState> | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) parsed = JSON.parse(raw) as Partial<GameState>;
  } catch {
    parsed = null;
  }

  if (!parsed || parsed.version !== VERSION || !Array.isArray(parsed.teams)) {
    return { state: newGame(), offlineMs: 0, offlineYards: 0 };
  }

  const fresh = newGame();
  const state: GameState = {
    ...fresh,
    ...parsed,
    // Rebuild teams through the config so renames and colour tweaks apply,
    // and so a hand-edited save cannot inject a broken team.
    teams: parsed.teams.flatMap((saved) => {
      if (!saved?.id) return [];
      let team;
      try {
        team = teamFromConfig(saved.id);
      } catch {
        return [];
      }
      return [
        {
          ...team,
          progress: Number(saved.progress) || 0,
          levels: { ...team.levels, ...(saved.levels ?? {}) },
          touchdowns: Number(saved.touchdowns) || 0,
          yardsGained: Number(saved.yardsGained) || 0,
          bigPlays: Number(saved.bigPlays) || 0,
        },
      ];
    }),
  };

  if (state.teams.length === 0) state.teams = fresh.teams;

  const away = Math.max(0, Date.now() - (Number(parsed.lastSavedAt) || Date.now()));
  const capped = Math.min(away, BALANCE.offline.maxHours * 60 * 60 * 1000);

  const before = state.bank;
  if (capped > 1000) tick(state, capped);

  return { state, offlineMs: capped, offlineYards: state.bank - before };
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
