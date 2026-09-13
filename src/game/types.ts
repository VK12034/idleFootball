export type PlayType = 'run' | 'shortPass' | 'deepPass';

export type PlaybookId =
  | 'balanced'
  | 'groundAndPound'
  | 'airRaid'
  | 'hurryUp'
  | 'defensive';

export type PositionGroup =
  | 'oline'
  | 'runningBacks'
  | 'receivers'
  | 'quarterback'
  | 'specialTeams';

export type GroupRatings = Record<PositionGroup, number>;

export type Position = 'QB' | 'RB' | 'WR' | 'OL' | 'K';

export type TraitId =
  | 'cannonArm'
  | 'scrambler'
  | 'gameManager'
  | 'burner'
  | 'possession'
  | 'bruiser'
  | 'ironMan'
  | 'wall';

export type TraitRarity = 'common' | 'rare' | 'elite';

export interface Trait {
  id: TraitId;
  name: string;
  rarity: TraitRarity;
  position: Position | 'any';
  description: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position: Position;
  jersey: number;
  rating: number;
  traits: TraitId[];
  /** Drives remaining on an injury. 0 = healthy. */
  injuredDrives: number;
}

export interface DriveState {
  /** 0 = own goal line, 100 = opponent goal line. */
  yardLine: number;
  down: number;
  yardsToFirst: number;
}

/** What a single snap produced, before downs or scoring are applied. */
export interface PlayResult {
  type: PlayType;
  yards: number;
  explosive: boolean;
  outcome: 'gain' | 'incompletion' | 'fumble' | 'interception';
  /** True when the gain came from a conversion roll rather than raw yardage. */
  converted: boolean;
}

export type FlashKind = 'none' | 'firstDown' | 'touchdown' | 'fieldGoal' | 'turnover' | 'stop';

export interface Team {
  id: string;
  name: string;
  tier: number;
  playbook: PlaybookId;
  colors: { primary: string; secondary: string };
  groups: GroupRatings;
  /** Levels purchased per group; rating = 1 + level until rosters land in step 3. */
  levels: GroupRatings;
  roster: Player[];
  drive: DriveState;

  // --- runtime, not part of the design but persisted ---
  /** Milliseconds banked toward the next snap. */
  accumulator: number;
  lastPlayText: string;
  flash: FlashKind;
  /** Game-clock timestamp the flash started, for UI animation. */
  flashAt: number;
  pointsScored: number;
  playsRun: number;
  yardsGained: number;
  drivesRun: number;
  driveConversions: number;
  driveSets: number;
}

export interface GameState {
  version: number;
  bank: number;
  lifetimePoints: number;
  /** Multiplies every point payout. Promotions raise this in a later step. */
  payoutMultiplier: number;
  /** Total game-clock milliseconds elapsed. Used as the animation clock. */
  elapsed: number;
  lastSavedAt: number;
  teams: Team[];

  // points-per-minute EMA accumulators
  emaPoints: number;
  emaTime: number;
}
