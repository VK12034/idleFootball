// Every tunable number lives here. No logic, no imports.
//
// Design rules for this game:
//   - Banked yards are never taken away. Nothing you have earned can be lost.
//   - A drive, though, can be stopped: you keep the yards, you lose the
//     touchdown. Stops are deliberately weighted to happen in the red zone,
//     because a drive that dies at the 3 is the one you remember.
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

    /** Odds per second that a drive gets stopped, outside the red zone. */
    stopChance: 0.0072,
    /** A play lands roughly this often; drives the floating +yard numbers. */
    playIntervalSeconds: 1.2,
  },

  /**
   * The near-miss. Pure math would scatter stops evenly down the field; we
   * ramp the odds up as a team closes on the end zone so stops cluster where
   * they sting — and where they send you straight to the upgrade screen.
   */
  nearMiss: {
    /** Progress past which the red zone starts. */
    redZone: 80,
    /** Stop odds at the goal line are this many times the base rate. */
    maxBoost: 5.5,
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
    grit: {
      baseCost: 90,
      costGrowth: 1.16,
      /** Each level multiplies the odds of being stopped by this. */
      stopMultiplier: 0.88,
      maxLevel: 60,
    },
    bigPlay: {
      baseCost: 110,
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
   * carry a downside. `perLevel` is how much the specialty upgrade adds to
   * that team's stat.
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
      grit: 1.1,
      perLevel: { speed: 0.05, touchdownBonus: 0.05, bigPlay: 0.05, yards: 0, grit: 0.05 },
    },
    groundAndPound: {
      label: 'Bulldozer',
      specialtyName: 'POWER RUN',
      blurb: 'Huge touchdown bonuses.',
      speed: 1,
      touchdownBonus: 1.6,
      bigPlay: 1,
      yards: 1,
      grit: 1,
      perLevel: { speed: 0, touchdownBonus: 0.3, bigPlay: 0, yards: 0, grit: 0 },
    },
    airRaid: {
      label: 'Bomb Squad',
      specialtyName: 'DEEP SHOT',
      blurb: 'Big plays happen way more often.',
      speed: 1,
      touchdownBonus: 1,
      bigPlay: 2.5,
      yards: 1,
      grit: 1,
      perLevel: { speed: 0, touchdownBonus: 0, bigPlay: 0.6, yards: 0, grit: 0 },
    },
    hurryUp: {
      label: 'Speedster',
      specialtyName: 'TEMPO',
      blurb: 'Runs down the field faster.',
      speed: 1.3,
      touchdownBonus: 1,
      bigPlay: 1,
      yards: 1,
      grit: 1,
      perLevel: { speed: 0.12, touchdownBonus: 0, bigPlay: 0, yards: 0, grit: 0 },
    },
    defensive: {
      label: 'Ball Hawk',
      specialtyName: 'TAKEAWAY',
      blurb: 'Banks extra yards and is hard to stop.',
      speed: 1,
      touchdownBonus: 1,
      bigPlay: 1,
      yards: 1.3,
      grit: 1.4,
      perLevel: { speed: 0, touchdownBonus: 0, bigPlay: 0, yards: 0.12, grit: 0.1 },
    },
  },

  /** Buying the next team. Cost climbs with how many you already own. */
  unlock: {
    baseCost: 500,
    growth: 1.55,
  },

  /**
   * The draft: a gamble, not a purchase. You pay yards, the wheel spins, and
   * most of the time you get a body. Elites are rare enough to be a story.
   */
  draft: {
    baseCost: 1200,
    costGrowth: 1.14,
    /** How long the rarity wheel spins before it lands, in milliseconds. */
    suspenseMs: 1700,
    rarities: {
      common: { label: 'COMMON', weight: 0.62, bonus: 0.02, color: '#8fa0c4' },
      rare: { label: 'RARE', weight: 0.27, bonus: 0.05, color: '#3fd8ff' },
      epic: { label: 'EPIC', weight: 0.095, bonus: 0.12, color: '#a24cf0' },
      elite: { label: 'ELITE', weight: 0.015, bonus: 0.3, color: '#ffd23f' },
    },
  },

  /**
   * Prestige. Draft Capital is visible from the first minute and ticks up
   * forever, so the itch to reset shows up long before the maths says yes.
   */
  prestige: {
    /** Lifetime yards needed for the first point of capital. */
    yardsPerPoint: 500,
    /** Each point of capital adds this much to every yard you earn. */
    bonusPerPoint: 0.08,
  },

  /** Yards-per-minute readout is smoothed so it does not jitter. */
  rate: { halfLifeMs: 20_000 },

  ui: {
    flashDurationMs: 1100,
    /** How long a floating +yards number lives. */
    floaterMs: 900,
    /** The full-screen touchdown flash. */
    screenFlashMs: 450,
    logLength: 6,
    maxFloaters: 5,
  },

  offline: { maxHours: 4 },

  /** Guard rail so a giant dt cannot lock the loop up. */
  tick: { maxSecondsPerStep: 4 * 60 * 60 },
} as const;
