import { BALANCE } from '../config/balance';
import { PLAY_LABEL, runPlay, type Rng } from './play';
import type { Mods } from './ratings';
import type { DriveState, FlashKind, PlayResult } from './types';

export interface DriveOutcome {
  drive: DriveState;
  result: PlayResult;
  points: number;
  text: string;
  flash: FlashKind;
  /** A set of downs ended this snap (converted or not) — used for conversion rate. */
  setEnded: boolean;
  setConverted: boolean;
  driveEnded: boolean;
}

export function freshDrive(): DriveState {
  return {
    yardLine: BALANCE.drive.startYardLine,
    down: 1,
    yardsToFirst: BALANCE.drive.firstDownDistance,
  };
}

function fgDistance(yardLine: number) {
  return Math.round(BALANCE.drive.goalLine - yardLine + BALANCE.fieldGoal.endZoneAndSnap);
}

/** Returns [made, distance, inRange]. */
function attemptFieldGoal(mods: Mods, yardLine: number, rng: Rng) {
  const fg = BALANCE.fieldGoal;
  const distance = fgDistance(yardLine);
  if (distance > mods.fgRange) return { made: false, distance, inRange: false };
  const accuracy = Math.min(
    0.99,
    fg.baseAccuracy - (distance / mods.fgRange) * fg.distancePenalty + mods.fgAccuracyBonus,
  );
  return { made: rng() < accuracy, distance, inRange: true };
}

/**
 * Runs one snap and folds it into the drive: downs, first downs, scoring,
 * turnovers, and the consolation field goal when a drive dies past midfield.
 */
export function advanceDrive(
  drive: DriveState,
  mods: Mods,
  payoutMultiplier: number,
  rng: Rng = Math.random,
): DriveOutcome {
  const { goalLine } = BALANCE.drive;
  const result = runPlay(mods, rng);

  // Late-down conversion: film study / running backs willing the ball forward.
  if (
    result.outcome !== 'fumble' &&
    result.outcome !== 'interception' &&
    drive.down >= 3 &&
    result.yards < drive.yardsToFirst &&
    rng() < mods.conversionChance
  ) {
    result.yards = drive.yardsToFirst;
    result.outcome = 'gain';
    result.converted = true;
  }

  const label = PLAY_LABEL[result.type];

  // --- turnovers end the drive immediately ---
  if (result.outcome === 'fumble' || result.outcome === 'interception') {
    return {
      drive: freshDrive(),
      result,
      points: 0,
      text: result.outcome === 'fumble' ? 'FUMBLE LOST' : 'INTERCEPTED',
      flash: 'turnover',
      setEnded: true,
      setConverted: false,
      driveEnded: true,
    };
  }

  const yardLine = drive.yardLine + result.yards;

  // --- touchdown ---
  if (yardLine >= goalLine) {
    return {
      drive: freshDrive(),
      result,
      points: BALANCE.scoring.touchdown * payoutMultiplier,
      text: `${label}, ${result.yards} yd — TOUCHDOWN`,
      flash: 'touchdown',
      setEnded: true,
      setConverted: true,
      driveEnded: true,
    };
  }

  const gainText =
    result.outcome === 'incompletion'
      ? `${label} incomplete`
      : `${label}, +${result.yards}${result.explosive ? ' EXPLOSIVE' : ''}`;

  // --- first down ---
  if (result.yards >= drive.yardsToFirst) {
    const toGoal = goalLine - yardLine;
    return {
      drive: {
        yardLine,
        down: 1,
        yardsToFirst: Math.min(BALANCE.drive.firstDownDistance, toGoal),
      },
      result,
      points: 0,
      text: `${gainText} — ${result.converted ? 'CONVERTED' : 'FIRST DOWN'}`,
      flash: 'firstDown',
      setEnded: true,
      setConverted: true,
      driveEnded: false,
    };
  }

  const remaining = drive.yardsToFirst - result.yards;

  // --- still alive ---
  if (drive.down < 4) {
    return {
      drive: { yardLine, down: drive.down + 1, yardsToFirst: remaining },
      result,
      points: 0,
      text: gainText,
      flash: 'none',
      setEnded: false,
      setConverted: false,
      driveEnded: false,
    };
  }

  // --- 4th down failed: field goal if we got past midfield ---
  if (yardLine > BALANCE.fieldGoal.attemptFromYardLine) {
    const fg = attemptFieldGoal(mods, yardLine, rng);
    if (fg.made) {
      return {
        drive: freshDrive(),
        result,
        points: BALANCE.scoring.fieldGoal * payoutMultiplier,
        text: `${fg.distance} yd FIELD GOAL — GOOD`,
        flash: 'fieldGoal',
        setEnded: true,
        setConverted: false,
        driveEnded: true,
      };
    }
    return {
      drive: freshDrive(),
      result,
      points: 0,
      text: `${fg.distance} yd FG — ${fg.inRange ? 'MISSED' : 'NO RANGE'}`,
      flash: 'stop',
      setEnded: true,
      setConverted: false,
      driveEnded: true,
    };
  }

  return {
    drive: freshDrive(),
    result,
    points: 0,
    text: `${gainText} — TURNOVER ON DOWNS`,
    flash: 'stop',
    setEnded: true,
    setConverted: false,
    driveEnded: true,
  };
}
