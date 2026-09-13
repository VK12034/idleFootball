import { BALANCE } from '../config/balance';
import type { Mods } from './ratings';
import type { EventKind, Team } from './types';

export type Rng = () => number;

export interface DriveEvent {
  kind: EventKind;
  text: string;
}

export interface AdvanceResult {
  /** Yards to add to the bank, already multiplied. */
  yardsBanked: number;
  touchdowns: number;
  bigPlays: number;
  events: DriveEvent[];
}

/**
 * Moves a team forward by dt seconds. Progress only ever increases, so there
 * is no failure case to handle: no downs, no turnovers, no losses.
 *
 * Safe to call with a very large dt (offline catch-up).
 */
export function advanceTeam(
  team: Team,
  mods: Mods,
  dtSeconds: number,
  rng: Rng = Math.random,
): AdvanceResult {
  const events: DriveEvent[] = [];
  if (dtSeconds <= 0) {
    return { yardsBanked: 0, touchdowns: 0, bigPlays: 0, events };
  }

  // --- steady forward progress ---
  let rawYards = mods.yardsPerSecond * dtSeconds;

  // --- big plays, rolled once per whole second ---
  team.rollTimer += dtSeconds;
  const rolls = Math.floor(team.rollTimer);
  team.rollTimer -= rolls;

  let bigPlays = 0;
  if (rolls > 0 && mods.bigPlayChance > 0) {
    if (rolls <= 32) {
      // Normal play: roll each second so streaks feel real.
      for (let i = 0; i < rolls; i++) if (rng() < mods.bigPlayChance) bigPlays++;
    } else {
      // Offline catch-up: take the expected count instead of looping for hours.
      const expected = rolls * mods.bigPlayChance;
      bigPlays = Math.floor(expected) + (rng() < expected % 1 ? 1 : 0);
    }
  }
  if (bigPlays > 0) {
    rawYards += bigPlays * mods.bigPlayYards;
    team.bigPlays += bigPlays;
    team.bigPlayAt = -1; // tick stamps the real time
    events.push({
      kind: 'bigPlay',
      text:
        bigPlays === 1
          ? `BIG PLAY! +${Math.round(mods.bigPlayYards)}`
          : `${bigPlays} BIG PLAYS! +${Math.round(bigPlays * mods.bigPlayYards)}`,
    });
  }

  // --- touchdowns ---
  const advanced = team.progress + rawYards;
  const touchdowns = Math.floor(advanced / BALANCE.field.length);
  team.progress = advanced % BALANCE.field.length;

  let bonus = 0;
  if (touchdowns > 0) {
    bonus = touchdowns * mods.touchdownBonus;
    team.touchdowns += touchdowns;
    team.touchdownAt = -1; // tick stamps the real time
    events.push({
      kind: 'touchdown',
      text:
        touchdowns === 1
          ? `TOUCHDOWN! +${Math.round(mods.touchdownBonus)}`
          : `${touchdowns} TOUCHDOWNS! +${Math.round(bonus)}`,
    });
  }

  const yardsBanked = (rawYards + bonus) * mods.yardMultiplier;
  team.yardsGained += yardsBanked;

  return { yardsBanked, touchdowns, bigPlays, events };
}
