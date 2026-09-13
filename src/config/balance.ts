// Every tunable number lives here. No logic, no imports.
//
// Design rules for this game:
//   - Teams ONLY move forward. Nothing ever takes yards away.
//   - Yards are both the progress bar and the currency.
//   - 100 yards = touchdown, which pays a bonus and starts a new drive.

export const BALANCE = {
  field: {
    /** Yards from your own goal line to the end zone. */
    length: 100,
  },

  team: {
    /** A brand new team gains this many yards every second. */
    yardsPerSecond: 5,
    /** Extra yards banked for reaching the end zone. */
    touchdownBonus: 25,
    /** Odds per second that a team rips off a big play. */
    bigPlayChance: 0.02,
    /** Yards a big play jumps you forward. */
    bigPlayYards: 20,
  },

  upgrades: {
    speed: {
      baseCost: 50,
      costGrowth: 1.15,
      /** Yards per second added per level. */
      perLevel: 1,
      maxLevel: 200,
    },
    power: {
      baseCost: 75,
      costGrowth: 1.15,
      /** Touchdown bonus yards added per level. */
      perLevel: 10,
      maxLevel: 200,
    },
    bigPlay: {
      baseCost: 120,
      costGrowth: 1.18,
      /** Added chance per second, and added yards, per level. */
      chancePerLevel: 0.015,
      yardsPerLevel: 5,
      maxLevel: 100,
    },
    specialty: {
      baseCost: 200,
      costGrowth: 1.2,
      maxLevel: 100,
    },
  },

  /**
   * Every team has one identity. All of them are bonuses — none of them
   * carry a downside, because nothing in this game punishes you.
   * `perLevel` is how much the specialty upgrade adds to that team's stat.
   */
  playbooks: {
    balanced: {
      label: 'All-Rounder',
      specialtyName: 'TEAMWORK',
      blurb: 'A little bit better at everything.',
      speed: 1.1,
      touchdownBonus: 1.1,
      bigPlay: 1.1,
      yards: 1,
      perLevel: { speed: 0.05, touchdownBonus: 0.05, bigPlay: 0.05, yards: 0 },
    },
    groundAndPound: {
      label: 'Bulldozer',
      specialtyName: 'POWER RUN',
      blurb: 'Huge touchdown bonuses.',
      speed: 1,
      touchdownBonus: 1.6,
      bigPlay: 1,
      yards: 1,
      perLevel: { speed: 0, touchdownBonus: 0.3, bigPlay: 0, yards: 0 },
    },
    airRaid: {
      label: 'Bomb Squad',
      specialtyName: 'DEEP SHOT',
      blurb: 'Big plays happen way more often.',
      speed: 1,
      touchdownBonus: 1,
      bigPlay: 2.5,
      yards: 1,
      perLevel: { speed: 0, touchdownBonus: 0, bigPlay: 0.6, yards: 0 },
    },
    hurryUp: {
      label: 'Speedster',
      specialtyName: 'TEMPO',
      blurb: 'Runs down the field faster.',
      speed: 1.3,
      touchdownBonus: 1,
      bigPlay: 1,
      yards: 1,
      perLevel: { speed: 0.12, touchdownBonus: 0, bigPlay: 0, yards: 0 },
    },
    defensive: {
      label: 'Ball Hawk',
      specialtyName: 'TAKEAWAY',
      blurb: 'Banks extra yards from every play.',
      speed: 1,
      touchdownBonus: 1,
      bigPlay: 1,
      yards: 1.3,
      perLevel: { speed: 0, touchdownBonus: 0, bigPlay: 0, yards: 0.12 },
    },
  },

  /** Buying the next team. Cost climbs with how many you already own. */
  unlock: {
    baseCost: 500,
    growth: 1.55,
  },

  /** Yards-per-minute readout is smoothed so it does not jitter. */
  rate: { halfLifeMs: 20_000 },

  ui: {
    flashDurationMs: 1100,
    logLength: 6,
  },

  offline: { maxHours: 4 },

  /** Guard rail so a giant dt cannot lock the loop up. */
  tick: { maxSecondsPerStep: 4 * 60 * 60 },
} as const;
