import { BALANCE } from '../config/balance';
import { capitalMultiplier, pendingCapital, yardsToNextCapital } from '../game/prestige';
import type { GameState } from '../game/types';
import BackBar from './BackBar';
import { fmt } from './format';

/**
 * Prestige. The Draft Capital number is visible from the first minute and
 * never stops climbing, so wanting to reset shows up well before resetting is
 * actually the right move.
 */
export default function SeasonPanel({
  state,
  onNewSeason,
  onBack,
}: {
  state: GameState;
  onNewSeason: () => void;
  onBack: () => void;
}) {
  const pending = pendingCapital(state);
  const toNext = yardsToNextCapital(state);
  const next = pending + 1;
  const span = next * next * BALANCE.prestige.yardsPerPoint - pending * pending * BALANCE.prestige.yardsPerPoint;
  const progress = span > 0 ? 1 - toNext / span : 0;

  const now = capitalMultiplier(state.capital);
  const after = capitalMultiplier(state.capital + pending);
  const ready = pending >= 1;

  return (
    <>
      <BackBar title="NEW SEASON" onBack={onBack} />

      <div className="card mb-3 text-center">
        <div className="small">DRAFT CAPITAL WAITING</div>
        <div className="pix my-1.5 text-[30px] text-[#c26a00]">+{pending}</div>
        <div className="text-[17px] text-mutedeep">
          {fmt(toNext)} more yards to +{next}
        </div>
        <span className="meter mt-2">
          <span style={{ width: `${Math.min(100, progress * 100)}%`, background: '#ffd23f' }} />
        </span>
      </div>

      <div className="card mb-3">
        <div className="pix mb-2 text-[10px] text-ink">WHAT IT DOES</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="border-[3px] border-ink bg-paper px-1 py-1.5 text-center">
            <div className="text-[14px] leading-none text-mute">EVERY YARD NOW</div>
            <div className="pix mt-1 text-[10px] text-ink">x{now.toFixed(2)}</div>
          </div>
          <div className="border-[3px] border-ink bg-paper px-1 py-1.5 text-center">
            <div className="text-[14px] leading-none text-mute">AFTER RESET</div>
            <div className="pix mt-1 text-[10px] text-[#2f8f3a]">x{after.toFixed(2)}</div>
          </div>
        </div>

        <ul className="mt-2 space-y-1 text-[17px] leading-tight text-mutedeep">
          <li className="text-[#2f8f3a]">KEEP: your drafted players and all capital.</li>
          <li className="text-[#a11d22]">RESET: your teams, upgrades and yards in the bank.</li>
        </ul>
      </div>

      <button
        onClick={onNewSeason}
        disabled={!ready}
        className={`btn mb-3 w-full px-3 py-3.5 ${ready ? 'bg-gold' : 'bg-lock'}`}
      >
        <span className="pix text-[11px] text-ink">
          {ready ? `START SEASON ${state.seasons + 2}` : 'NEED +1 CAPITAL'}
        </span>
        <span className="mt-1.5 block text-[16px] text-mutedeep">
          {ready ? `BANK +${pending} DRAFT CAPITAL` : 'KEEP RUNNING'}
        </span>
      </button>

      <div className="card">
        <div className="flex justify-between text-[17px] text-mutedeep">
          <span>SEASONS PLAYED</span>
          <span className="text-ink">{state.seasons}</span>
        </div>
        <div className="flex justify-between text-[17px] text-mutedeep">
          <span>CAPITAL BANKED</span>
          <span className="text-ink">{state.capital}</span>
        </div>
        <div className="flex justify-between text-[17px] text-mutedeep">
          <span>LIFETIME YARDS</span>
          <span className="text-ink">{fmt(state.lifetimeYards)}</span>
        </div>
      </div>
    </>
  );
}
