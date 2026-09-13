export type PlaybookId =
  | 'balanced'
  | 'groundAndPound'
  | 'airRaid'
  | 'hurryUp'
  | 'defensive';

/** The four things you can spend yards on, per team. */
export type UpgradeId = 'speed' | 'power' | 'bigPlay' | 'specialty';

export const UPGRADE_IDS: UpgradeId[] = ['speed', 'power', 'bigPlay', 'specialty'];

export type EventKind = 'touchdown' | 'bigPlay';

export interface LogEntry {
  id: number;
  text: string;
  kind: EventKind;
}

export interface Team {
  id: string;
  name: string;
  playbook: PlaybookId;
  colors: { primary: string; secondary: string };

  /** How far down the field this team is, 0 to 100. Only ever goes up. */
  progress: number;
  levels: Record<UpgradeId, number>;

  // --- lifetime counters ---
  touchdowns: number;
  yardsGained: number;
  bigPlays: number;

  // --- presentation ---
  /** Game-clock time of the last touchdown / big play, for the flash. */
  touchdownAt: number;
  bigPlayAt: number;
  log: LogEntry[];

  /** Accumulates to one second so big-play rolls happen on a steady beat. */
  rollTimer: number;
}

export interface GameState {
  version: number;
  /** Yards in the bank. This is the only currency. */
  bank: number;
  lifetimeYards: number;
  /** Total game-clock milliseconds elapsed. Used as the animation clock. */
  elapsed: number;
  lastSavedAt: number;
  teams: Team[];

  // yards-per-minute EMA accumulators
  emaYards: number;
  emaTime: number;
}
