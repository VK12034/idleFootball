import { BALANCE } from '../config/balance';
import type { GameState, Team, UpgradeId } from './types';

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
