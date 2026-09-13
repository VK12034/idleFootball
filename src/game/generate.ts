import { STARTER_TEAM_ID, TEAMS_BY_ID } from '../config/teams';
import type { GameState, Team } from './types';

/** Builds a playable team from its league config, fresh at level 0. */
export function teamFromConfig(id: string): Team {
  const cfg = TEAMS_BY_ID.get(id);
  if (!cfg) throw new Error(`Unknown team id: ${id}`);
  return {
    id: cfg.id,
    name: cfg.name,
    playbook: cfg.playbook,
    colors: cfg.colors,
    progress: 0,
    levels: { speed: 0, power: 0, grit: 0, bigPlay: 0, specialty: 0 },
    touchdowns: 0,
    yardsGained: 0,
    bigPlays: 0,
    stops: 0,
    closestStop: 0,
    touchdownAt: -1e9,
    bigPlayAt: -1e9,
    stoppedAt: -1e9,
    lastStopText: '',
    log: [],
    floaters: [],
    rollTimer: 0,
    playTimer: 0,
  };
}

/** A brand new save: one team, no upgrades, empty bank. */
export function newGame(): GameState {
  return {
    version: 3,
    bank: 0,
    lifetimeYards: 0,
    seasonYards: 0,
    elapsed: 0,
    lastSavedAt: Date.now(),
    emaYards: 0,
    emaTime: 0,
    teams: [teamFromConfig(STARTER_TEAM_ID)],
    roster: [],
    draftPulls: 0,
    nextPlayerId: 1,
    capital: 0,
    seasons: 0,
  };
}
