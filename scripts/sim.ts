// Headless balance check. Run: npm run sim
//
// This is the stand-in for "play it for ten minutes with a timer": it reports
// how fast the first upgrades land, where drives die, and when the prestige
// number first ticks over.
import { nextGoal, unlockCost, upgradeCost, buyUpgrade } from '../src/game/economy';
import { draftCost, rollPlayer } from '../src/game/draft';
import { newGame } from '../src/game/generate';
import { pendingCapital } from '../src/game/prestige';
import { getMods, leagueOf, stopChanceAt } from '../src/game/ratings';
import { tick, yardsPerMinute } from '../src/game/tick';
import { UPGRADE_IDS, type GameState } from '../src/game/types';

const STEP_MS = 100;
const secs = (steps: number) => (steps * STEP_MS) / 1000;

function fresh(): GameState {
  return newGame();
}

// --------------------------------------------------- opening 60 seconds ---
{
  const state = fresh();
  const team = state.teams[0];
  const mods = getMods(team);
  console.log(`${team.name} — brand new team\n`);
  console.log('  yards / second   ', mods.yardsPerSecond.toFixed(2));
  console.log('  seconds / drive  ', (100 / mods.yardsPerSecond).toFixed(1));
  console.log('  touchdown bonus  ', mods.touchdownBonus.toFixed(1));
  console.log('  stop chance      ', `${(mods.stopChance * 100).toFixed(2)}%/sec outside the 20`);
  console.log('  stop chance @ 97 ', `${(stopChanceAt(97, mods.stopChance) * 100).toFixed(2)}%/sec`);
  console.log('  drives scored    ', `${(mods.driveSuccessRate * 100).toFixed(0)}%`);
}

// ------------------------------------------ time to the first upgrades ----
// Buys the cheapest thing available the moment it can afford it.
{
  const state = fresh();
  const bought: string[] = [];
  for (let i = 0; i < 10 * 60 * 10 && bought.length < 6; i++) {
    tick(state, STEP_MS);
    const team = state.teams[0];
    const best = UPGRADE_IDS.map((id) => ({ id, cost: upgradeCost(team, id) })).sort(
      (a, b) => a.cost - b.cost,
    )[0];
    if (state.bank >= best.cost) {
      buyUpgrade(state, team.id, best.id);
      bought.push(`${bought.length + 1}. ${best.id} (${best.cost} yd) at ${secs(i).toFixed(1)}s`);
    }
  }
  console.log('\ntime to first upgrades (buying greedily):');
  bought.forEach((b) => console.log('  ' + b));
}

// ------------------------------------------------- where drives die -------
{
  const state = fresh();
  const team = state.teams[0];
  let stops = 0;
  let redZoneStops = 0;
  let inside5 = 0;
  let last = team.stops;
  for (let i = 0; i < 10 * 60 * 60; i++) {
    const where = team.progress;
    tick(state, STEP_MS);
    if (team.stops > last) {
      last = team.stops;
      stops++;
      if (where >= 80) redZoneStops++;
      if (where >= 95) inside5++;
    }
  }
  const drives = team.touchdowns + team.stops;
  console.log('\none hour of play, no upgrades:');
  console.log('  drives           ', drives);
  console.log('  touchdowns       ', team.touchdowns);
  console.log('  stops            ', stops, `(${((stops / drives) * 100).toFixed(0)}% of drives)`);
  console.log('  stopped inside 20', `${((redZoneStops / Math.max(1, stops)) * 100).toFixed(0)}% of stops`);
  console.log('  stopped inside 5 ', `${((inside5 / Math.max(1, stops)) * 100).toFixed(0)}% of stops`);
}

// -------------------------------------------------- goals and prestige ----
{
  const state = fresh();
  let capitalAt = -1;
  let draftAt = -1;
  for (let i = 0; i < 10 * 60 * 30; i++) {
    tick(state, STEP_MS);
    if (capitalAt < 0 && pendingCapital(state) >= 1) capitalAt = i;
    if (draftAt < 0 && state.bank >= draftCost(0)) draftAt = i;
  }
  const mods = getMods(state.teams[0], leagueOf(state));
  const goal = nextGoal(state, mods.effectiveYardsPerSecond);
  console.log('\nno-input pacing:');
  console.log('  1st draft capital', `${secs(capitalAt).toFixed(0)}s`);
  console.log('  1st draft pull   ', `${secs(draftAt).toFixed(0)}s (${draftCost(0)} yd)`);
  console.log('  after 30 min     ', Math.floor(state.bank), 'yd banked,', yardsPerMinute(state).toFixed(0), 'yd/min');
  console.log('  next goal        ', goal && `${goal.label} ${goal.cost}yd, ${goal.eta.toFixed(0)}s away`);
  console.log('  2nd team         ', unlockCost(1), 'yd · 3rd', unlockCost(2), 'yd · 10th', unlockCost(9), 'yd');
}

// ------------------------------------------------------ draft rarities ----
{
  const counts: Record<string, number> = {};
  for (let i = 0; i < 10_000; i++) {
    const p = rollPlayer(i, 0);
    counts[p.rarity] = (counts[p.rarity] ?? 0) + 1;
  }
  console.log('\n10,000 draft pulls:');
  Object.entries(counts).forEach(([r, n]) =>
    console.log(`  ${r.padEnd(17)} ${((n / 10_000) * 100).toFixed(2)}%`),
  );
}
