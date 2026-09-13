export type PlaybookId =
  | 'balanced'
  | 'groundAndPound'
  | 'airRaid'
  | 'hurryUp'
  | 'defensive';

/** The five things you can spend yards on, per team. */
export type UpgradeId = 'speed' | 'power' | 'grit' | 'bigPlay' | 'specialty';

export const UPGRADE_IDS: UpgradeId[] = ['speed', 'power', 'grit', 'bigPlay', 'specialty'];

export type EventKind = 'touchdown' | 'bigPlay' | 'stop' | 'play';

export interface LogEntry {
  id: number;
  text: string;
  kind: EventKind;
}

/** A number that floats up off the field and fades. Never saved. */
export interface Floater {
  id: number;
  text: string;
  kind: EventKind;
  /** Game-clock ms when it spawned. */
  at: number;
  /** Where on the field it appeared, 0-100. */
  pos: number;
}

// ---------------------------------------------------------------- draft ----

export type Rarity = 'common' | 'rare' | 'epic' | 'elite';

/** What a drafted player makes better, league-wide. */
export type TraitId = 'speed' | 'power' | 'grit' | 'bigPlay' | 'yards';

export interface Player {
  id: number;
  name: string;
  position: string;
  rarity: Rarity;
  trait: TraitId;
  /** Added multiplier, e.g. 0.05 for +5%. */
  bonus: number;
  /** Game-clock ms when they were drafted, for the "NEW" tag. */
  draftedAt: number;
}

// ----------------------------------------------------------------- team ----

export interface Team {
  id: string;
  name: string;
  playbook: PlaybookId;
  colors: { primary: string; secondary: string };

  /** How far down the field this team is, 0 to 100. */
  progress: number;
  levels: Record<UpgradeId, number>;

  // --- lifetime counters ---
  touchdowns: number;
  yardsGained: number;
  bigPlays: number;
  stops: number;
  /** Furthest a stopped drive ever got, for the "so close" stat. */
  closestStop: number;

  // --- presentation ---
  /** Game-clock time of the last touchdown / big play / stop, for the flash. */
  touchdownAt: number;
  bigPlayAt: number;
  stoppedAt: number;
  /** What the last stop said, kept on screen until the next drive ends. */
  lastStopText: string;
  log: LogEntry[];
  floaters: Floater[];

  /** Accumulates to one second so big-play and stop rolls hit a steady beat. */
  rollTimer: number;
  /** Accumulates to one play, so the field can show +7 every so often. */
  playTimer: number;
}

export interface GameState {
  version: number;
  /** Yards in the bank. This is the only currency. */
  bank: number;
  lifetimeYards: number;
  /** Yards earned since the last reset — what this season's capital is worth. */
  seasonYards: number;
  /** Total game-clock milliseconds elapsed. Used as the animation clock. */
  elapsed: number;
  lastSavedAt: number;
  teams: Team[];

  // --- draft ---
  roster: Player[];
  draftPulls: number;
  nextPlayerId: number;

  // --- prestige ---
  /** Draft Capital banked from previous seasons. */
  capital: number;
  seasons: number;

  // yards-per-minute EMA accumulators
  emaYards: number;
  emaTime: number;
}
