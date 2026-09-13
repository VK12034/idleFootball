// Headless balance check. Run: npm run sim
// Verifies the opening numbers: ~2.1 yards/play, 4s play clock, ~38% conversion.
import { advanceDrive, freshDrive } from '../src/game/drive';
import { newGame } from '../src/game/generate';
import { getMods } from '../src/game/ratings';
import { tick } from '../src/game/tick';

const MINUTES = 600;

// --- whole-game pass, exactly as the rAF loop drives it ---
const state = newGame();
for (let i = 0; i < MINUTES * 60; i++) tick(state, 1000);
const t = state.teams[0];

console.log(`Ridgeview Mules — rating 1 everywhere, ${MINUTES} simulated minutes\n`);
const rows: Record<string, string> = {
  'yards / play': (t.yardsGained / t.playsRun).toFixed(2),
  'plays / min': (t.playsRun / MINUTES).toFixed(2),
  'seconds / play': ((MINUTES * 60) / t.playsRun).toFixed(2),
  'conversion rate': `${((t.driveConversions / t.driveSets) * 100).toFixed(1)}%`,
  'drives / min': (t.drivesRun / MINUTES).toFixed(2),
  'plays / drive': (t.playsRun / t.drivesRun).toFixed(2),
  'points / min': (state.lifetimePoints / MINUTES).toFixed(3),
  'points / drive': (state.lifetimePoints / t.drivesRun).toFixed(3),
  'total points': Math.floor(state.lifetimePoints).toLocaleString(),
};
for (const [k, v] of Object.entries(rows)) console.log(' ', k.padEnd(17), v);

// --- how drives actually end, which is the real feel of the early game ---
const mods = getMods(t);
const tally: Record<string, number> = {};
let drive = freshDrive();
let deathYardLineSum = 0;
let deaths = 0;
const DRIVES = 200_000;
for (let ended = 0; ended < DRIVES; ) {
  const before = drive.yardLine;
  const out = advanceDrive(drive, mods, 1);
  const endedAt = Math.min(100, before + Math.max(0, out.result.yards));
  drive = out.drive;
  if (!out.driveEnded) continue;
  ended++;
  const key = out.text.includes('TOUCHDOWN')
    ? 'touchdown'
    : out.text.includes('FIELD GOAL')
      ? 'field goal made'
      : out.text.includes('NO RANGE')
        ? 'FG attempt out of range'
        : out.text.includes('MISSED')
          ? 'FG missed'
          : out.text.includes('INTERCEPTED')
            ? 'interception'
            : out.text.includes('FUMBLE')
              ? 'fumble'
              : 'turnover on downs';
  tally[key] = (tally[key] ?? 0) + 1;
  if (key !== 'touchdown') {
    deathYardLineSum += endedAt;
    deaths++;
  }
}
console.log('\nhow drives end:');
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(' ', k.padEnd(25), `${((v / DRIVES) * 100).toFixed(1)}%`);
}
const avgDeath = deathYardLineSum / deaths;
console.log(
  `
  drives that fail die on average at the ${
    avgDeath < 50 ? `own ${avgDeath.toFixed(1)}` : `opponent ${(100 - avgDeath).toFixed(1)}`
  }`,
);
