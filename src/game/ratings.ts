import { BALANCE } from '../config/balance';
import { rosterBonus, type RosterBonus } from './draft';
import { capitalMultiplier } from './prestige';
import type { GameState, Team } from './types';

/** Everything outside a single team that still changes its numbers. */
export interface League {
  bonus: RosterBonus;
  capital: number;
}

export const NO_LEAGUE: League = {
  bonus: { speed: 0, power: 0, grit: 0, bigPlay: 0, yards: 0 },
  capital: 0,
};

export function leagueOf(state: GameState): League {
  return { bonus: rosterBonus(state.roster), capital: state.capital };
}

/** A team's real numbers after upgrades, playbook, drafted players and capital. */
export interface Mods {
  /** Yards gained every second. */
  yardsPerSecond: number;
  /** Bonus yards banked for reaching the end zone. */
  touchdownBonus: number;
  /** Odds per second of a big play. */
  bigPlayChance: number;
  /** How far forward a big play jumps. */
  bigPlayYards: number;
  /** Odds per second of being stopped, outside the red zone. */
  stopChance: number;
  /** Share of drives that reach the end zone, 0-1. */
  driveSuccessRate: number;
  /** Multiplier on every yard that reaches the bank. */
  yardMultiplier: number;
  /** Yards per second including big plays, touchdowns and stops. */
  effectiveYardsPerSecond: number;
}

/**
 * Stops get likelier the closer a team is to scoring. This is the near-miss:
 * pure math would spread stops evenly, and a drive that dies at the 45 is
 * forgettable.
 */
export function stopChanceAt(progress: number, baseChance: number): number {
  const { redZone, maxBoost } = BALANCE.nearMiss;
  if (progress <= redZone) return baseChance;
  const t = Math.min(1, (progress - redZone) / (BALANCE.field.length - redZone));
  return baseChance * (1 + (maxBoost - 1) * t);
}

/** Average of the red-zone ramp across a whole drive. */
const AVG_ZONE_BOOST =
  1 +
  ((BALANCE.nearMiss.maxBoost - 1) / 2) *
    ((BALANCE.field.length - BALANCE.nearMiss.redZone) / BALANCE.field.length);

export function getMods(team: Team, league: League = NO_LEAGUE): Mods {
  const u = BALANCE.upgrades;
  const pb = BALANCE.playbooks[team.playbook];
  const lv = team.levels;
  const sp = lv.specialty;
  const b = league.bonus;

  // The specialty upgrade grows whatever that playbook is already good at.
  const speedMult = pb.speed + pb.perLevel.speed * sp;
  const tdMult = pb.touchdownBonus + pb.perLevel.touchdownBonus * sp;
  const bigMult = pb.bigPlay + pb.perLevel.bigPlay * sp;
  const yardMult = pb.yards + pb.perLevel.yards * sp;
  const gritMult = pb.grit + pb.perLevel.grit * sp;

  const yardsPerSecond =
    (BALANCE.team.yardsPerSecond + lv.speed * u.speed.perLevel) * speedMult * (1 + b.speed);

  const touchdownBonus =
    (BALANCE.team.touchdownBonus + lv.power * u.power.perLevel) * tdMult * (1 + b.power);

  const bigPlayChance = Math.min(
    0.95,
    (BALANCE.team.bigPlayChance + lv.bigPlay * u.bigPlay.chancePerLevel) *
      bigMult *
      (1 + b.bigPlay),
  );

  const bigPlayYards = BALANCE.team.bigPlayYards + lv.bigPlay * u.bigPlay.yardsPerLevel;

  // Grit works the other way round: more of it, fewer stops.
  const stopChance =
    (BALANCE.team.stopChance * Math.pow(u.grit.stopMultiplier, lv.grit)) /
    (gritMult * (1 + b.grit));

  const perSecond = yardsPerSecond + bigPlayChance * bigPlayYards;
  const secondsPerDrive = BALANCE.field.length / Math.max(0.01, perSecond);
  const driveSuccessRate = Math.max(
    0.05,
    Math.pow(Math.max(0, 1 - stopChance * AVG_ZONE_BOOST), secondsPerDrive),
  );

  const yardMultiplier = yardMult * (1 + b.yards) * capitalMultiplier(league.capital);

  // Rough per-second value, used for the rate readout and offline estimates.
  const fromTouchdowns = (perSecond / BALANCE.field.length) * touchdownBonus * driveSuccessRate;

  return {
    yardsPerSecond,
    touchdownBonus,
    bigPlayChance,
    bigPlayYards,
    stopChance,
    driveSuccessRate,
    yardMultiplier,
    effectiveYardsPerSecond: (perSecond + fromTouchdowns) * yardMultiplier,
  };
}
