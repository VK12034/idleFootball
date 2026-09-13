import { BALANCE } from '../config/balance';
import type { Mods } from './ratings';
import type { PlayResult, PlayType } from './types';

export type Rng = () => number;

const between = (rng: Rng, lo: number, hi: number) => lo + rng() * (hi - lo);

function pickPlayType(rng: Rng, mods: Mods): PlayType {
  const w = mods.weights;
  const total = w.run + w.shortPass + w.deepPass;
  let roll = rng() * total;
  if ((roll -= w.run) <= 0) return 'run';
  if ((roll -= w.shortPass) <= 0) return 'shortPass';
  return 'deepPass';
}

/** Applies the rb/wr yard band plus the QB multiplier and playbook scales. */
function rollYards(
  rng: Rng,
  mods: Mods,
  band: { floor: number; ceiling: number },
  isRun: boolean,
): number {
  const floor = band.floor * mods.floorScale;
  const ceiling = Math.max(floor, band.ceiling * mods.ceilingScale);
  let yards = between(rng, floor, ceiling) * mods.qbMultiplier * mods.allYardScale;
  if (isRun) yards *= mods.runYardScale;
  return yards;
}

/**
 * Runs one snap. Pure: same rng sequence gives the same play.
 * Does not know about downs, field position, or scoring.
 */
export function runPlay(mods: Mods, rng: Rng = Math.random): PlayResult {
  const p = BALANCE.play;
  const type = pickPlayType(rng, mods);

  let yards = 0;
  let outcome: PlayResult['outcome'] = 'gain';
  let canBeExplosive = false;

  if (type === 'run') {
    if (rng() < mods.fumbleChance) {
      return { type, yards: 0, explosive: false, outcome: 'fumble', converted: false };
    }
    if (rng() < mods.runStuffChance) {
      yards = between(rng, p.stuffedRun.floor, p.stuffedRun.ceiling);
    } else {
      yards = rollYards(rng, mods, p.run, true);
      canBeExplosive = true;
    }
  } else if (type === 'shortPass') {
    if (rng() < mods.shortIntChance) {
      return { type, yards: 0, explosive: false, outcome: 'interception', converted: false };
    }
    if (rng() < mods.shortIncompletionChance) {
      outcome = 'incompletion';
    } else {
      yards = rollYards(rng, mods, p.shortPass, false);
      canBeExplosive = true;
    }
  } else {
    if (rng() < mods.deepIntChance) {
      return { type, yards: 0, explosive: false, outcome: 'interception', converted: false };
    }
    if (rng() < mods.deepIncompletionChance) {
      outcome = 'incompletion';
    } else {
      yards = rollYards(rng, mods, p.deepPass, false);
      canBeExplosive = true;
    }
  }

  let explosive = false;
  if (canBeExplosive && rng() < mods.explosiveChance) {
    explosive = true;
    yards *= p.explosiveMultiplier;
  }

  return { type, yards: Math.round(yards), explosive, outcome, converted: false };
}

export const PLAY_LABEL: Record<PlayType, string> = {
  run: 'Run',
  shortPass: 'Short pass',
  deepPass: 'Deep pass',
};
