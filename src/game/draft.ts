import { BALANCE } from '../config/balance';
import type { GameState, Player, Rarity, TraitId } from './types';
import type { Rng } from './drive';

export const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'elite'];

export const TRAIT_LABEL: Record<TraitId, string> = {
  speed: 'SPEED',
  power: 'POWER',
  grit: 'GRIT',
  bigPlay: 'BIG PLAYS',
  yards: 'EXTRA YARDS',
};

/** Positions that make sense for each trait, so a pull reads like a player. */
const TRAIT_POSITIONS: Record<TraitId, string[]> = {
  speed: ['WR', 'RB', 'CB'],
  power: ['RB', 'TE', 'OL'],
  grit: ['OL', 'LB', 'DL'],
  bigPlay: ['QB', 'WR', 'K'],
  yards: ['S', 'LB', 'QB'],
};

const FIRST = [
  'JAX', 'DEON', 'MARCUS', 'TY', 'ROMEO', 'KEZ', 'ODELL', 'BRONSON', 'CASH',
  'ELI', 'RASHAD', 'VONN', 'TREY', 'ZANE', 'MALIK', 'QUINN', 'ACE', 'BO',
  'DARNELL', 'HOLLIS', 'JUNO', 'SILAS', 'TANK', 'WYATT',
];
const LAST = [
  'STONE', 'RIVERA', 'OKAFOR', 'BURNS', 'VELA', 'KRANZ', 'DIALLO', 'MOSS',
  'HAYWOOD', 'PIKE', 'SANTOS', 'BREWER', 'NAKAMURA', 'FOLEY', 'ABARA',
  'WHITLOCK', 'DRUMMOND', 'SAGE', 'COYNE', 'IKE', 'BELLAMY', 'RUSK',
];

/** What the next pull costs. Every pull nudges the price up a little. */
export function draftCost(pulls: number): number {
  return Math.ceil(BALANCE.draft.baseCost * Math.pow(BALANCE.draft.costGrowth, pulls));
}

function pick<T>(list: readonly T[], rng: Rng): T {
  return list[Math.floor(rng() * list.length)];
}

/** Weighted rarity roll. Elite is rare enough that pulling one is a story. */
export function rollRarity(rng: Rng): Rarity {
  const r = rng();
  let acc = 0;
  for (const id of RARITIES) {
    acc += BALANCE.draft.rarities[id].weight;
    if (r < acc) return id;
  }
  return 'common';
}

/** Builds the player a pull produced. Does not touch state. */
export function rollPlayer(id: number, elapsed: number, rng: Rng = Math.random): Player {
  const rarity = rollRarity(rng);
  const trait = pick(Object.keys(TRAIT_POSITIONS) as TraitId[], rng);
  const base = BALANCE.draft.rarities[rarity].bonus;
  return {
    id,
    name: `${pick(FIRST, rng)} ${pick(LAST, rng)}`,
    position: pick(TRAIT_POSITIONS[trait], rng),
    rarity,
    trait,
    // a little spread so two epics are not the same player
    bonus: Math.round(base * (0.85 + rng() * 0.3) * 1000) / 1000,
    draftedAt: elapsed,
  };
}

/**
 * Spends the yards and signs the player. Returns null if you cannot afford it,
 * so the caller can leave the wheel alone.
 */
export function draftPlayer(state: GameState, rng: Rng = Math.random): Player | null {
  const cost = draftCost(state.draftPulls);
  if (state.bank < cost) return null;
  state.bank -= cost;
  state.draftPulls += 1;
  const player = rollPlayer(state.nextPlayerId++, state.elapsed, rng);
  state.roster.unshift(player);
  return player;
}

export type RosterBonus = Record<TraitId, number>;

const EMPTY: RosterBonus = { speed: 0, power: 0, grit: 0, bigPlay: 0, yards: 0 };

/** Everything your drafted players add up to, league-wide. */
export function rosterBonus(roster: Player[]): RosterBonus {
  const out = { ...EMPTY };
  for (const p of roster) out[p.trait] += p.bonus;
  return out;
}

export function rarityOf(rarity: Rarity) {
  return BALANCE.draft.rarities[rarity];
}
