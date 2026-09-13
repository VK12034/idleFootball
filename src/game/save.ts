import { BALANCE } from '../config/balance';
import { newGame, teamFromConfig } from './generate';
import { tick } from './tick';
import type { GameState, Player } from './types';

const KEY = 'gridiron.save';
const VERSION = 3;

export function save(state: GameState): void {
  try {
    state.lastSavedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — the game keeps running either way */
  }
}

/** What your teams did while the game was closed. Shown as a summary screen. */
export interface OfflineReport {
  ms: number;
  yards: number;
  drives: number;
  touchdowns: number;
  stops: number;
  bigPlays: number;
  /** The team that banked the most while you were away. */
  bestTeam: string;
  bestYards: number;
}

export interface LoadResult {
  state: GameState;
  /** Null when nothing worth showing happened. */
  offline: OfflineReport | null;
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
    return { state: newGame(), offline: null };
  }

  const fresh = newGame();
  const state: GameState = {
    ...fresh,
    ...parsed,
    roster: Array.isArray(parsed.roster) ? (parsed.roster as Player[]) : [],
    capital: Number(parsed.capital) || 0,
    seasons: Number(parsed.seasons) || 0,
    draftPulls: Number(parsed.draftPulls) || 0,
    nextPlayerId: Number(parsed.nextPlayerId) || 1,
    seasonYards: Number(parsed.seasonYards) || 0,
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
          stops: Number(saved.stops) || 0,
          closestStop: Number(saved.closestStop) || 0,
        },
      ];
    }),
  };

  if (state.teams.length === 0) state.teams = fresh.teams;

  const away = Math.max(0, Date.now() - (Number(parsed.lastSavedAt) || Date.now()));
  const capped = Math.min(away, BALANCE.offline.maxHours * 60 * 60 * 1000);
  if (capped <= 60_000) return { state, offline: null };

  // Snapshot, run the catch-up, then diff it into something worth reading.
  const before = {
    bank: state.bank,
    teams: state.teams.map((t) => ({
      yards: t.yardsGained,
      tds: t.touchdowns,
      stops: t.stops,
      big: t.bigPlays,
    })),
  };

  tick(state, capped);

  let best = { name: '', yards: -1 };
  let touchdowns = 0;
  let stops = 0;
  let bigPlays = 0;
  state.teams.forEach((t, i) => {
    const was = before.teams[i];
    if (!was) return;
    const made = t.yardsGained - was.yards;
    touchdowns += t.touchdowns - was.tds;
    stops += t.stops - was.stops;
    bigPlays += t.bigPlays - was.big;
    if (made > best.yards) best = { name: t.name, yards: made };
  });

  const yards = state.bank - before.bank;
  if (yards < 1) return { state, offline: null };

  return {
    state,
    offline: {
      ms: capped,
      yards,
      drives: touchdowns + stops,
      touchdowns,
      stops,
      bigPlays,
      bestTeam: best.name,
      bestYards: Math.max(0, best.yards),
    },
  };
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
