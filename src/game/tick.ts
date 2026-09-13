import { BALANCE } from '../config/balance';
import { advanceTeam, type Rng } from './drive';
import { getMods } from './ratings';
import type { GameState } from './types';

/**
 * Advances the whole game by dt milliseconds. Free of React so offline
 * progress can call it once with a very large dt.
 * Mutates and returns the same object — the caller owns identity.
 */
export function tick(state: GameState, dtMs: number, rng: Rng = Math.random): GameState {
  if (dtMs <= 0) return state;

  const dtSeconds = Math.min(dtMs / 1000, BALANCE.tick.maxSecondsPerStep);
  const now = state.elapsed + dtMs;
  let earned = 0;

  for (const team of state.teams) {
    const mods = getMods(team);
    const out = advanceTeam(team, mods, dtSeconds, rng);
    earned += out.yardsBanked;

    // drive.ts flags events with -1; stamp the real clock here so the UI can
    // decide how long to keep the celebration on screen.
    if (team.touchdownAt === -1) team.touchdownAt = now;
    if (team.bigPlayAt === -1) team.bigPlayAt = now;

    for (const e of out.events) {
      team.log.unshift({ id: team.touchdowns * 1000 + team.bigPlays, text: e.text, kind: e.kind });
    }
    if (team.log.length > BALANCE.ui.logLength) team.log.length = BALANCE.ui.logLength;
  }

  state.bank += earned;
  state.lifetimeYards += earned;
  state.elapsed = now;

  const decay = Math.pow(0.5, dtMs / BALANCE.rate.halfLifeMs);
  state.emaYards = state.emaYards * decay + earned;
  state.emaTime = state.emaTime * decay + dtMs;

  return state;
}

export function yardsPerMinute(state: GameState): number {
  if (state.emaTime <= 0) return 0;
  return (state.emaYards / state.emaTime) * 60_000;
}
