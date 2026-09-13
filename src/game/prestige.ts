import { BALANCE } from '../config/balance';
import { teamFromConfig } from './generate';
import { STARTER_TEAM_ID } from '../config/teams';
import type { GameState } from './types';

/**
 * Draft Capital earned by the season you are playing right now. Deliberately
 * cheap at the bottom end: you watch it tick to 1 inside the first few
 * minutes, long before resetting is anywhere near optimal.
 */
export function pendingCapital(state: GameState): number {
  return Math.floor(Math.sqrt(Math.max(0, state.seasonYards) / BALANCE.prestige.yardsPerPoint));
}

/** Yards still to run before the pending capital number ticks up again. */
export function yardsToNextCapital(state: GameState): number {
  const next = pendingCapital(state) + 1;
  return Math.max(0, next * next * BALANCE.prestige.yardsPerPoint - state.seasonYards);
}

/** Every yard you earn is multiplied by this. */
export function capitalMultiplier(capital: number): number {
  return 1 + capital * BALANCE.prestige.bonusPerPoint;
}

/**
 * Starts a new season: banks the pending capital, keeps the players you
 * drafted, and puts everything else back to zero.
 */
export function startNewSeason(state: GameState): boolean {
  const gained = pendingCapital(state);
  if (gained < 1) return false;

  state.capital += gained;
  state.seasons += 1;
  state.seasonYards = 0;
  state.bank = 0;
  state.teams = [teamFromConfig(STARTER_TEAM_ID)];
  state.emaYards = 0;
  state.emaTime = 0;
  return true;
}
