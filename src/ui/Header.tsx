import { fmt, fmtRate } from './format';
import { PixelArt, WHISTLE } from './PixelArt';

function Readout({
  label,
  value,
  color,
  big,
}: {
  label: string;
  value: string;
  color: string;
  big?: boolean;
}) {
  return (
    <div className="px-inset min-w-0 px-2 py-1">
      <div className="label !text-[6px] sm:!text-[7px]">{label}</div>
      <div
        className={`led truncate ${big ? 'text-[16px] sm:text-[19px]' : 'text-[11px] sm:text-[13px]'}`}
        style={{ color, textShadow: '2px 2px 0 rgba(0,0,0,0.65)' }}
      >
        {value}
      </div>
    </div>
  );
}

export default function Header({
  bank,
  yardsPerMin,
  onHelp,
  onBack,
  title,
  highlight,
}: {
  bank: number;
  yardsPerMin: number;
  onHelp: () => void;
  /** Absent on the main menu. */
  onBack?: () => void;
  title?: string | null;
  highlight?: string | null;
}) {
  return (
    <header
      className="no-select sticky top-0 z-30 border-b-[3px] border-ink bg-[#2b23a8]/95 backdrop-blur"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto max-w-3xl px-2 py-2 sm:px-3">
        <div className="flex items-stretch gap-2">
          {onBack ? (
            <button
              className="px-btn shrink-0 !px-3 !text-[11px]"
              onClick={onBack}
              aria-label="Back"
            >
              &lsaquo;
            </button>
          ) : (
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <PixelArt sprite={WHISTLE} className="h-6 w-6" />
              <span className="led text-[11px] text-amber">GRIDIRON</span>
            </div>
          )}

          <div
            className={`grid min-w-0 flex-1 grid-cols-2 gap-2 ${
              highlight === 'bank' ? 'tut-glow' : ''
            }`}
          >
            <Readout label="yards" value={fmt(bank)} color="#ffd23f" big />
            <Readout label="per minute" value={`+${fmtRate(yardsPerMin)}`} color="#a3f542" />
          </div>

          <button
            className="px-btn shrink-0 !px-3 !text-[10px]"
            onClick={onHelp}
            aria-label="How to play"
          >
            ?
          </button>
        </div>

        {title && (
          <div className="px-inset mt-2 flex items-center gap-2 px-2 py-1">
            <span className="label !text-[6px] sm:!text-[7px]">viewing</span>
            <span className="led truncate text-[9px] text-sky sm:text-[10px]">
              {title.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
