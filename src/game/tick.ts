import { BALANCE } from '../config/balance';
import { advanceDrive } from './drive';
import type { Rng } from './play';
import { getMods } from './ratings';
import type { GameState } from './types';

/**
 * Advances the entire game by dt milliseconds. Pure of React so offline
 * progress can call it once with a very large dt.
 * Mutates and returns the same object — the caller owns identity.
 */
export function tick(state: GameState, dtMs: number, rng: Rng = Math.random): GameState {
  if (dtMs <= 0) return state;

  let earned = 0;

  for (const team of state.teams) {
    const mods = getMods(team);
    team.accumulator += dtMs;

    let plays = 0;
    while (
      team.accumulator >= mods.playIntervalMs &&
      plays < BALANCE.tick.maxPlaysPerTeamPerTick
    ) {
      team.accumulator -= mods.playIntervalMs;
      plays++;

      const out = advanceDrive(team.drive, mods, state.payoutMultiplier, rng);
      team.drive = out.drive;
      team.lastPlayText = out.text;
      team.playsRun++;
      team.yardsGained += Math.max(0, out.result.yards);
      if (out.flash !== 'none') {
        team.flash = out.flash;
        team.flashAt = state.elapsed + dtMs;
      }
      if (out.setEnded) {
        team.driveSets++;
        if (out.setConverted) team.driveConversions++;
      }
      if (out.driveEnded) team.drivesRun++;
      if (out.points > 0) {
        team.pointsScored += out.points;
        earned += out.points;
      }
    }

    // Never let a stalled frame bank unbounded time.
    if (team.accumulator > mods.playIntervalMs) team.accumulator = mods.playIntervalMs;
  }

  state.bank += earned;
  state.lifetimePoints += earned;
  state.elapsed += dtMs;

  const decay = Math.pow(0.5, dtMs / BALANCE.rate.halfLifeMs);
  state.emaPoints = state.emaPoints * decay + earned;
  state.emaTime = state.emaTime * decay + dtMs;

  return state;
}

export function pointsPerMinute(state: GameState): number {
  if (state.emaTime <= 0) return 0;
  return (state.emaPoints / state.emaTime) * 60_000;
}
