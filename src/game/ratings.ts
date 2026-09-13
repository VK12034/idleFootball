import { BALANCE } from '../config/balance';
import type { PlayType, Team } from './types';

/**
 * Everything the play/drive code needs, derived once per snap from
 * group ratings + playbook. Traits fold in here in a later step.
 */
export interface Mods {
  playIntervalMs: number;
  weights: Record<PlayType, number>;

  floorScale: number;
  ceilingScale: number;
  /** MULTIPLIES the rb/wr yardage product. Not an adder. */
  qbMultiplier: number;
  runYardScale: number;
  allYardScale: number;

  /** 0..1. Drives the extra failure a low-rated offense suffers. */
  competence: number;
  runStuffChance: number;
  shortIncompletionChance: number;
  deepIncompletionChance: number;

  fumbleChance: number;
  shortIntChance: number;
  deepIntChance: number;

  explosiveChance: number;
  conversionChance: number;

  fgRange: number;
  fgAccuracyBonus: number;
}

/** rating 1 -> 0, rising with diminishing returns and never reaching 1. */
export function competenceOf(rating: number): number {
  const s = BALANCE.ratingPenalty.competenceScale;
  return 1 - 1 / (1 + Math.max(0, rating - 1) * s);
}

export function getMods(team: Team): Mods {
  const g = team.groups;
  const pb = BALANCE.playbooks[team.playbook];
  const r = BALANCE.ratings;
  const p = BALANCE.play;
  const rp = BALANCE.ratingPenalty;

  // Skill competence is driven by the ball carriers, tempo/security by the line.
  const skill = (g.runningBacks + g.receivers) / 2;
  const competence = competenceOf(skill);
  const shortfall = 1 - competence;

  const weights = { ...pb.weights } as Record<PlayType, number>;
  weights.deepPass *= pb.deepWeightScale;
  if (pb.deepDisabled) weights.deepPass = 0;

  const interval =
    (p.basePlayIntervalMs / (1 + (g.oline - 1) * r.tempoPerOl)) * pb.intervalScale;

  return {
    playIntervalMs: interval,
    weights,

    floorScale: 1 + (g.runningBacks - 1) * r.floorPerRb,
    ceilingScale: 1 + (g.receivers - 1) * r.ceilingPerWr,
    qbMultiplier: 1 + (g.quarterback - 1) * r.qbMultiplierPerPoint,
    runYardScale: pb.runYardScale,
    allYardScale: pb.allYardScale,

    competence,
    runStuffChance: rp.runStuffAtZero * shortfall,
    shortIncompletionChance:
      p.shortPass.incompletionChance + rp.shortIncompletionAtZero * shortfall,
    deepIncompletionChance:
      p.deepPass.incompletionChance + rp.deepIncompletionAtZero * shortfall,

    fumbleChance:
      p.run.fumbleChance * (1 - Math.min(0.9, (g.oline - 1) * r.fumbleReductionPerOl)),
    shortIntChance: p.shortPass.intChance * pb.intScale,
    deepIntChance: p.deepPass.intChance * pb.intScale,

    explosiveChance:
      p.explosiveBaseChance * (1 + (g.receivers - 1) * r.explosivePerWr) * pb.explosiveScale,
    conversionChance:
      r.conversionBase + (g.runningBacks - 1) * r.conversionPerRb + pb.conversionBonus,

    fgRange:
      BALANCE.fieldGoal.baseRange + g.specialTeams * BALANCE.fieldGoal.rangePerSpecialTeams,
    fgAccuracyBonus: g.specialTeams * BALANCE.fieldGoal.accuracyPerSpecialTeams,
  };
}
