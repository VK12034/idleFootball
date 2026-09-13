import { BALANCE } from '../config/balance';
import { draftCost } from './draft';
import type { GameState, Team, UpgradeId } from './types';
import { UPGRADE_IDS } from './types';

/** Cost of the next level of one upgrade on one team. */
export function upgradeCost(team: Team, id: UpgradeId): number {
  const cfg = BALANCE.upgrades[id];
  return Math.ceil(cfg.baseCost * Math.pow(cfg.costGrowth, team.levels[id]));
}

export function isMaxed(team: Team, id: UpgradeId): boolean {
  return team.levels[id] >= BALANCE.upgrades[id].maxLevel;
}

/** Cost of the next team, based on how many you already own. */
export function unlockCost(ownedCount: number): number {
  return Math.ceil(
    BALANCE.unlock.baseCost * Math.pow(BALANCE.unlock.growth, Math.max(0, ownedCount - 1)),
  );
}

/** Spends yards and levels the upgrade. Returns false if you cannot afford it. */
export function buyUpgrade(state: GameState, teamId: string, id: UpgradeId): boolean {
  const team = state.teams.find((t) => t.id === teamId);
  if (!team || isMaxed(team, id)) return false;
  const cost = upgradeCost(team, id);
  if (state.bank < cost) return false;
  state.bank -= cost;
  team.levels[id] += 1;
  return true;
}

// ------------------------------------------------------------- next goal ---

export interface Goal {
  kind: 'upgrade' | 'team' | 'draft';
  label: string;
  detail: string;
  cost: number;
  /** How much of the cost you have, 0-1. */
  progress: number;
  /** Seconds until you can afford it at the current rate; 0 if you can now. */
  eta: number;
  teamId?: string;
  upgradeId?: UpgradeId;
}

/**
 * The single cheapest thing you cannot buy yet — the one that should always be
 * about twenty seconds away. If everything on offer is already affordable it
 * returns the cheapest of those instead, so the player is never looking at a
 * screen with nothing to want.
 */
export function nextGoal(state: GameState, yardsPerSecond: number): Goal | null {
  const goals: Goal[] = [];
  const add = (g: Omit<Goal, 'progress' | 'eta'>) =>
    goals.push({
      ...g,
      progress: Math.min(1, state.bank / g.cost),
      eta: state.bank >= g.cost ? 0 : Math.max(0, (g.cost - state.bank) / Math.max(0.01, yardsPerSecond)),
    });

  for (const team of state.teams) {
    for (const id of UPGRADE_IDS) {
      if (isMaxed(team, id)) continue;
      add({
        kind: 'upgrade',
        label: UPGRADE_LABEL[id],
        detail: team.name.toUpperCase(),
        cost: upgradeCost(team, id),
        teamId: team.id,
        upgradeId: id,
      });
    }
  }

  add({
    kind: 'team',
    label: 'NEW TEAM',
    detail: 'ANOTHER TEAM RUNNING',
    cost: unlockCost(state.teams.length),
  });

  add({
    kind: 'draft',
    label: 'DRAFT PICK',
    detail: 'ROLL FOR A PLAYER',
    cost: draftCost(state.draftPulls),
  });

  const wanted = goals.filter((g) => g.eta > 0).sort((a, b) => a.cost - b.cost);
  if (wanted.length > 0) return wanted[0];
  return goals.sort((a, b) => a.cost - b.cost)[0] ?? null;
}

export const UPGRADE_LABEL: Record<UpgradeId, string> = {
  speed: 'SPEED',
  power: 'POWER',
  grit: 'GRIT',
  bigPlay: 'BIG PLAYS',
  specialty: 'SPECIALTY',
};
