import { BALANCE } from '../config/balance';
import { advanceTeam, type Rng } from './drive';
import { getMods, leagueOf } from './ratings';
import type { GameState } from './types';

let nextFloaterId = 1;

/**
 * Advances the whole game by dt milliseconds. Free of React so offline
 * progress can call it once with a very large dt.
 * Mutates and returns the same object — the caller owns identity.
 */
export function tick(state: GameState, dtMs: number, rng: Rng = Math.random): GameState {
  if (dtMs <= 0) return state;

  const dtSeconds = Math.min(dtMs / 1000, BALANCE.tick.maxSecondsPerStep);
  const now = state.elapsed + dtMs;
  const league = leagueOf(state);
  let earned = 0;

  for (const team of state.teams) {
    const mods = getMods(team, league);
    const out = advanceTeam(team, mods, dtSeconds, rng);
    earned += out.yardsBanked;

    // drive.ts flags events with -1; stamp the real clock here so the UI can
    // decide how long to keep the celebration on screen.
    if (team.touchdownAt === -1) team.touchdownAt = now;
    if (team.bigPlayAt === -1) team.bigPlayAt = now;
    if (team.stoppedAt === -1) team.stoppedAt = now;

    for (const e of out.events) {
      // Every event floats up off the field; only the notable ones are logged.
      team.floaters.push({ id: nextFloaterId++, text: e.text, kind: e.kind, at: now, pos: e.pos });
      if (e.kind !== 'play') {
        team.log.unshift({ id: nextFloaterId, text: e.text, kind: e.kind });
      }
    }

    if (team.floaters.length > 0) {
      team.floaters = team.floaters.filter((f) => now - f.at < BALANCE.ui.floaterMs);
      if (team.floaters.length > BALANCE.ui.maxFloaters) {
        team.floaters = team.floaters.slice(-BALANCE.ui.maxFloaters);
      }
    }
    if (team.log.length > BALANCE.ui.logLength) team.log.length = BALANCE.ui.logLength;
  }

  state.bank += earned;
  state.lifetimeYards += earned;
  state.seasonYards += earned;
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
