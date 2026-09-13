import { BALANCE } from '../config/balance';
import { stopChanceAt, type Mods } from './ratings';
import type { EventKind, Team } from './types';

export type Rng = () => number;

export interface DriveEvent {
  kind: EventKind;
  text: string;
  /** Where on the field it happened, 0-100. */
  pos: number;
}

export interface AdvanceResult {
  /** Yards to add to the bank, already multiplied. */
  yardsBanked: number;
  touchdowns: number;
  bigPlays: number;
  stops: number;
  events: DriveEvent[];
}

/** How the stop reads on screen. Short, specific, and about *this* drive. */
function stopText(progress: number, rng: Rng): string {
  const toGoal = Math.max(1, Math.round(BALANCE.field.length - progress));
  // Deep in the red zone it is always a short-yardage heartbreak.
  const down = progress >= BALANCE.nearMiss.redZone ? 1 + Math.floor(rng() * 2) : 1 + Math.floor(rng() * 4);
  return `4TH AND ${down} AT THE ${toGoal}. STOPPED.`;
}

/**
 * Moves a team forward by dt seconds.
 *
 * Banked yards only ever go up — nothing here can reduce them. A drive, on the
 * other hand, can be stopped, which costs the touchdown bonus and starts the
 * next drive from scratch. Stops are weighted towards the red zone on purpose.
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
    return { yardsBanked: 0, touchdowns: 0, bigPlays: 0, stops: 0, events };
  }

  // --- steady forward progress ---
  let rawYards = mods.yardsPerSecond * dtSeconds;

  // --- rolls, once per whole second ---
  team.rollTimer += dtSeconds;
  const rolls = Math.floor(team.rollTimer);
  team.rollTimer -= rolls;

  const offline = rolls > 32;

  // --- big plays ---
  let bigPlays = 0;
  if (rolls > 0 && mods.bigPlayChance > 0) {
    if (!offline) {
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
      pos: team.progress,
      text:
        bigPlays === 1
          ? `BIG PLAY! +${Math.round(mods.bigPlayYards)}`
          : `${bigPlays} BIG PLAYS! +${Math.round(bigPlays * mods.bigPlayYards)}`,
    });
  }

  // ------------------------------------------------------------- offline ---
  // Hours of catch-up are settled statistically: simulating every second of a
  // four hour absence is neither necessary nor honest about the odds.
  if (offline) {
    const advanced = team.progress + rawYards;
    const drives = Math.floor(advanced / BALANCE.field.length);
    team.progress = advanced % BALANCE.field.length;

    const expectedTds = drives * mods.driveSuccessRate;
    const touchdowns = Math.min(
      drives,
      Math.floor(expectedTds) + (rng() < expectedTds % 1 ? 1 : 0),
    );
    const stops = drives - touchdowns;

    let bonus = 0;
    if (touchdowns > 0) {
      bonus = touchdowns * mods.touchdownBonus;
      team.touchdowns += touchdowns;
    }
    if (stops > 0) team.stops += stops;

    const yardsBanked = (rawYards + bonus) * mods.yardMultiplier;
    team.yardsGained += yardsBanked;
    return { yardsBanked, touchdowns, bigPlays, stops, events };
  }

  // -------------------------------------------------------------- online ---

  // --- the stop, rolled before the yards land so it reads off the field
  //     position you can actually see ---
  let stopped = false;
  if (mods.stopChance > 0) {
    for (let i = 0; i < rolls; i++) {
      if (rng() < stopChanceAt(team.progress, mods.stopChance)) {
        stopped = true;
        break;
      }
    }
  }

  if (stopped) {
    const text = stopText(team.progress, rng);
    team.stops += 1;
    team.stoppedAt = -1; // tick stamps the real time
    team.lastStopText = text;
    team.closestStop = Math.max(team.closestStop, team.progress);
    events.push({ kind: 'stop', text, pos: team.progress });
    team.progress = 0;
    team.playTimer = 0;

    // The yards already run are still yards. Nothing is ever clawed back.
    const yardsBanked = rawYards * mods.yardMultiplier;
    team.yardsGained += yardsBanked;
    return { yardsBanked, touchdowns: 0, bigPlays, stops: 1, events };
  }

  // --- the play clock: a visible number every second or so ---
  team.playTimer += dtSeconds;
  const interval = BALANCE.team.playIntervalSeconds;
  if (team.playTimer >= interval) {
    const plays = Math.floor(team.playTimer / interval);
    team.playTimer -= plays * interval;
    const gain = Math.max(1, Math.round(mods.yardsPerSecond * interval * plays));
    events.push({ kind: 'play', text: `+${gain}`, pos: team.progress });
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
    team.lastStopText = '';
    events.push({
      kind: 'touchdown',
      pos: BALANCE.field.length,
      text:
        touchdowns === 1
          ? `TOUCHDOWN! +${Math.round(mods.touchdownBonus)}`
          : `${touchdowns} TOUCHDOWNS! +${Math.round(bonus)}`,
    });
  }

  const yardsBanked = (rawYards + bonus) * mods.yardMultiplier;
  team.yardsGained += yardsBanked;

  return { yardsBanked, touchdowns, bigPlays, stops: 0, events };
}
