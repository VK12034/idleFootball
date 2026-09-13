import { freshDrive } from './drive';
import type { GameState, GroupRatings, PlaybookId, Team } from './types';

const flatRatings = (n: number): GroupRatings => ({
  oline: n,
  runningBacks: n,
  receivers: n,
  quarterback: n,
  specialTeams: n,
});

export function createTeam(opts: {
  id: string;
  name: string;
  tier: number;
  playbook: PlaybookId;
  colors: { primary: string; secondary: string };
  rating?: number;
}): Team {
  const rating = opts.rating ?? 1;
  return {
    id: opts.id,
    name: opts.name,
    tier: opts.tier,
    playbook: opts.playbook,
    colors: opts.colors,
    groups: flatRatings(rating),
    levels: flatRatings(0),
    roster: [],
    drive: freshDrive(),
    accumulator: 0,
    lastPlayText: 'Kickoff',
    flash: 'none',
    flashAt: -1e9,
    pointsScored: 0,
    playsRun: 0,
    yardsGained: 0,
    drivesRun: 0,
    driveConversions: 0,
    driveSets: 0,
  };
}

/** A brand new save: one Tier 1 team at rating 1 everywhere. */
export function newGame(): GameState {
  return {
    version: 1,
    bank: 0,
    lifetimePoints: 0,
    payoutMultiplier: 1,
    elapsed: 0,
    lastSavedAt: Date.now(),
    emaPoints: 0,
    emaTime: 0,
    teams: [
      createTeam({
        id: 'ridgeview-mules',
        name: 'Ridgeview Mules',
        tier: 1,
        playbook: 'balanced',
        colors: { primary: '#7c5c2e', secondary: '#e0c887' },
      }),
    ],
  };
}
