// Every tunable number lives here. No logic, no imports.
// Tune this file to change how the game feels; never touch mechanics for balance.

export const BALANCE = {
  drive: {
    startYardLine: 25, // own 25 after any score or turnover
    firstDownDistance: 10,
    goalLine: 100,
  },

  play: {
    // Base play interval at oline rating 1. Target: one play every 4 seconds.
    basePlayIntervalMs: 4000,

    // Raw yardage bands and failure rates for a COMPETENT offense.
    // A low-rated team does not get worse yards, it gets far more failures
    // (see ratingPenalty below). That is what makes rating 1 stall constantly.
    run: { floor: 3, ceiling: 5, fumbleChance: 0.02 },
    shortPass: { floor: 6, ceiling: 9, incompletionChance: 0.15, intChance: 0.02 },
    deepPass: { floor: 20, ceiling: 40, incompletionChance: 0.45, intChance: 0.06 },

    // A stuffed run (low-rated oline/rb) gains almost nothing.
    stuffedRun: { floor: 0, ceiling: 1 },

    explosiveBaseChance: 0.04,
    explosiveMultiplier: 2.5,
  },

  // How rated skill converts into competence, 0..1.
  // c = 1 - 1 / (1 + (rating - 1) * competenceScale)
  // rating 1 -> 0.00   rating 10 -> 0.57   rating 35 -> 0.84   rating 99 -> 0.94
  ratingPenalty: {
    competenceScale: 0.15,
    // Extra failure applied at competence 0, scaling to zero at competence 1.
    runStuffAtZero: 0.86,
    shortIncompletionAtZero: 0.5,
    deepIncompletionAtZero: 0.4,
  },

  ratings: {
    floorPerRb: 0.08, // running backs raise the floor of every gain
    ceilingPerWr: 0.08, // receivers raise the ceiling of every gain
    qbMultiplierPerPoint: 0.1, // MULTIPLIES the rb/wr product. Buying early is a trap.
    tempoPerOl: 0.06, // oline speeds up the play clock
    fumbleReductionPerOl: 0.05, // and hangs onto the ball
    explosivePerWr: 0.05,
    // Chance a 3rd/4th down play that came up short converts anyway.
    // The base is what lifts a rating-1 team from a ~31% to a ~38% conversion rate.
    conversionBase: 0.11,
    conversionPerRb: 0.012,
  },

  fieldGoal: {
    // distance = (100 - yardLine) + endZoneAndSnap
    endZoneAndSnap: 17,
    baseRange: 40, // at specialTeams 1 -> 42 yard range, so you must reach the opp 25
    rangePerSpecialTeams: 2,
    baseAccuracy: 0.95,
    distancePenalty: 0.55, // accuracy lost at the very edge of range
    accuracyPerSpecialTeams: 0.01,
    attemptFromYardLine: 50, // only bother once past midfield
  },

  scoring: {
    touchdown: 7,
    fieldGoal: 3,
  },

  playbooks: {
    balanced: {
      weights: { run: 0.6, shortPass: 0.32, deepPass: 0.08 },
      runYardScale: 1,
      allYardScale: 1,
      intScale: 1,
      explosiveScale: 1,
      intervalScale: 1,
      conversionBonus: 0,
      deepDisabled: false,
      deepWeightScale: 1,
    },
    groundAndPound: {
      weights: { run: 0.6, shortPass: 0.32, deepPass: 0.08 },
      runYardScale: 1.3,
      allYardScale: 1,
      intScale: 1,
      explosiveScale: 1,
      intervalScale: 1,
      conversionBonus: 0.1,
      deepDisabled: true,
      deepWeightScale: 1,
    },
    airRaid: {
      weights: { run: 0.6, shortPass: 0.32, deepPass: 0.08 },
      runYardScale: 1,
      allYardScale: 1,
      intScale: 2,
      explosiveScale: 2,
      intervalScale: 1,
      conversionBonus: 0,
      deepDisabled: false,
      deepWeightScale: 2,
    },
    hurryUp: {
      weights: { run: 0.6, shortPass: 0.32, deepPass: 0.08 },
      runYardScale: 1,
      allYardScale: 0.8,
      intScale: 1,
      explosiveScale: 1,
      intervalScale: 0.5,
      conversionBonus: 0,
      deepDisabled: false,
      deepWeightScale: 1,
    },
    defensive: {
      weights: { run: 0.6, shortPass: 0.32, deepPass: 0.08 },
      runYardScale: 1,
      allYardScale: 1,
      intScale: 1,
      explosiveScale: 1,
      intervalScale: 1,
      conversionBonus: 0,
      deepDisabled: false,
      deepWeightScale: 1,
    },
  },

  // Points-per-minute readout is an exponential moving average so it settles
  // instead of jittering with every touchdown.
  rate: { halfLifeMs: 180_000 },

  ui: { flashDurationMs: 900 },

  tick: { maxPlaysPerTeamPerTick: 20_000 },
} as const;
