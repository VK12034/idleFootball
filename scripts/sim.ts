// Headless balance check. Run: npm run sim
import { upgradeCost, unlockCost } from '../src/game/economy';
import { newGame } from '../src/game/generate';
import { getMods } from '../src/game/ratings';
import { tick, yardsPerMinute } from '../src/game/tick';

const state = newGame();
const team = state.teams[0];
const mods = getMods(team);

console.log(`${team.name} — brand new team\n`);
console.log('  yards / second  ', mods.yardsPerSecond.toFixed(2));
console.log('  seconds / TD    ', (100 / mods.yardsPerSecond).toFixed(1));
console.log('  touchdown bonus ', mods.touchdownBonus.toFixed(1));
console.log('  big play chance ', `${(mods.bigPlayChance * 100).toFixed(1)}%/sec`);

// One minute of real play, stepped like the rAF loop does.
for (let i = 0; i < 600; i++) tick(state, 100);
console.log('\nafter 1 minute:');
console.log('  yards banked    ', Math.floor(state.bank));
console.log('  yards / minute  ', yardsPerMinute(state).toFixed(0));
console.log('  touchdowns      ', team.touchdowns);
console.log('  big plays       ', team.bigPlays);

console.log('\nfirst purchases:');
console.log('  SPEED lv1       ', upgradeCost(team, 'speed'), 'yd');
console.log('  POWER lv1       ', upgradeCost(team, 'power'), 'yd');
console.log('  BIG PLAYS lv1   ', upgradeCost(team, 'bigPlay'), 'yd');
console.log('  SPECIALTY lv1   ', upgradeCost(team, 'specialty'), 'yd');
console.log('  2nd team        ', unlockCost(1), 'yd');
console.log('  3rd team        ', unlockCost(2), 'yd');
console.log('  10th team       ', unlockCost(9), 'yd');

// Long run to see where you land with no input at all.
// The loop steps 100ms at a time: 10 steps per second.
const IDLE_MINUTES = 10;
const idle = newGame();
for (let i = 0; i < 10 * 60 * IDLE_MINUTES; i++) tick(idle, 100);
console.log(`\n${IDLE_MINUTES} idle minutes, no upgrades bought:`);
console.log('  yards banked    ', Math.floor(idle.bank));
console.log('  touchdowns      ', idle.teams[0].touchdowns);
