import { NAFL_TEAMS } from '../config/teams';
import { fmtBank, fmtRate } from './format';
import { useTicker } from './useTicker';

/**
 * The status bar across the top of the phone. Everything here is meant to be
 * moving: the bank eases toward its real value digit by digit, the rate is
 * live, and Draft Capital ticks up from the first minute so the itch to reset
 * starts long before the maths says it should.
 */
export default function Header({
  bank,
  yardsPerMin,
  owned,
  capital,
  pending,
  scoring,
  onHelp,
  onTeams,
  onSeason,
  highlight,
}: {
  bank: number;
  yardsPerMin: number;
  owned: number;
  /** Capital banked from past seasons. */
  capital: number;
  /** Capital this season has earned so far. */
  pending: number;
  /** True while a touchdown is on screen, for the bank pulse. */
  scoring?: boolean;
  onHelp: () => void;
  onTeams: () => void;
  onSeason: () => void;
  highlight?: string | null;
}) {
  const shown = useTicker(bank);

  return (
    <header
      className="no-select relative z-20 flex shrink-0 items-center gap-2 border-b-[6px] border-night bg-ink px-3 py-2.5"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 10px)' }}
    >
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 ${
          highlight === 'bank' ? 'tut-glow' : ''
        }`}
      >
        {/* the ball: the yards in the bank are the yards it has run */}
        <span
          className="h-[18px] w-[26px] shrink-0 border-[3px] border-[#6b2f12] bg-[#c8622e]"
          style={{ borderRadius: '9px / 6px' }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <div
            className={`pix truncate text-[14px] leading-[1.2] text-amber ${
              scoring ? 'animate-bump' : ''
            }`}
          >
            {fmtBank(shown)} YD
          </div>
          <div className="truncate text-[15px] leading-none text-lime">
            +{fmtRate(yardsPerMin)} YD / MIN
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          onClick={onTeams}
          className="text-[15px] leading-none text-[#9fd4ff]"
        >
          TEAMS <span className="pix text-[10px] text-white">{owned}/{NAFL_TEAMS.length}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSeason}
            className={`text-[15px] leading-none text-[#9fd4ff] ${
              highlight === 'capital' ? 'tut-glow' : ''
            }`}
          >
            CAP <span className="pix text-[10px] text-gold">+{pending}</span>
            {capital > 0 && <span className="text-[13px] text-[#7f9fd0]"> ({capital})</span>}
          </button>
          <button
            onClick={onHelp}
            aria-label="How to play"
            className="pix h-7 w-7 border-[3px] border-night bg-steel text-[10px] leading-none text-white"
          >
            ?
          </button>
        </div>
      </div>
    </header>
  );
}
