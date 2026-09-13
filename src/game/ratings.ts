import { BALANCE } from '../config/balance';
import type { Team } from './types';

/** A team's real numbers after upgrades and its playbook identity. */
export interface Mods {
  /** Yards gained every second. */
  yardsPerSecond: number;
  /** Bonus yards banked for reaching the end zone. */
  touchdownBonus: number;
  /** Odds per second of a big play. */
  bigPlayChance: number;
  /** How far forward a big play jumps. */
  bigPlayYards: number;
  /** Multiplier on every yard that reaches the bank. */
  yardMultiplier: number;
  /** Yards per second including the average value of big plays. */
  effectiveYardsPerSecond: number;
}

export function getMods(team: Team): Mods {
  const u = BALANCE.upgrades;
  const pb = BALANCE.playbooks[team.playbook];
  const lv = team.levels;
  const sp = lv.specialty;

  // The specialty upgrade grows whatever that playbook is already good at.
  const speedMult = pb.speed + pb.perLevel.speed * sp;
  const tdMult = pb.touchdownBonus + pb.perLevel.touchdownBonus * sp;
  const bigMult = pb.bigPlay + pb.perLevel.bigPlay * sp;
  const yardMult = pb.yards + pb.perLevel.yards * sp;

  const yardsPerSecond =
    (BALANCE.team.yardsPerSecond + lv.speed * u.speed.perLevel) * speedMult;

  const touchdownBonus =
    (BALANCE.team.touchdownBonus + lv.power * u.power.perLevel) * tdMult;

  const bigPlayChance = Math.min(
    0.95,
    (BALANCE.team.bigPlayChance + lv.bigPlay * u.bigPlay.chancePerLevel) * bigMult,
  );

  const bigPlayYards = BALANCE.team.bigPlayYards + lv.bigPlay * u.bigPlay.yardsPerLevel;

  // Rough per-second value, used for the rate readout and offline estimates.
  const fromBigPlays = bigPlayChance * bigPlayYards;
  const fromTouchdowns =
    ((yardsPerSecond + fromBigPlays) / BALANCE.field.length) * touchdownBonus;

  return {
    yardsPerSecond,
    touchdownBonus,
    bigPlayChance,
    bigPlayYards,
    yardMultiplier: yardMult,
    effectiveYardsPerSecond:
      (yardsPerSecond + fromBigPlays + fromTouchdowns) * yardMult,
  };
}
