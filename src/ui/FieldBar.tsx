import { BALANCE } from '../config/balance';
import type { Team } from '../game/types';
import { FOOTBALL, GOALPOST, PixelArt } from './PixelArt';

/** End zone takes the right-hand slice; the 100 yards fill the rest. */
const EZ = 12;
const pct = (progress: number) =>
  (Math.max(0, Math.min(100, progress)) / 100) * (100 - EZ);

const MARKS = [25, 50, 75];

export default function FieldBar({
  team,
  scoring,
  highlight,
}: {
  team: Team;
  /** True while the touchdown celebration is on screen. */
  scoring?: boolean;
  highlight?: boolean;
}) {
  const ball = pct(team.progress);
  const yards = Math.floor(team.progress);

  return (
    <div
      className={`scanlines relative h-[72px] w-full overflow-hidden border-[3px] border-ink sm:h-[84px] ${
        highlight ? 'tut-glow' : ''
      }`}
      style={{
        background: 'repeating-linear-gradient(90deg,#4fd167 0 18px,#45bd5c 18px 36px)',
      }}
    >
      {/* ground already covered — a bright trail so progress is obvious */}
      <div
        className="absolute inset-y-0 left-0 bg-white/25"
        style={{ width: `${ball}%` }}
      />

      {/* quarter marks */}
      {MARKS.map((m) => (
        <div
          key={m}
          className="absolute inset-y-0 w-[3px] bg-chalk/60"
          style={{ left: `${pct(m)}%` }}
        />
      ))}

      {/* end zone */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-center border-l-[3px] border-chalk ${
          scoring ? 'animate-blink' : ''
        }`}
        style={{
          width: `${EZ}%`,
          background: `repeating-linear-gradient(45deg, ${team.colors.primary} 0 8px, ${team.colors.secondary} 8px 16px)`,
        }}
      >
        <PixelArt
          sprite={GOALPOST}
          className="h-8 w-7 drop-shadow-[2px_2px_0_rgba(0,0,0,0.45)] sm:h-10 sm:w-9"
        />
      </div>

      {/* the ball */}
      <PixelArt
        sprite={FOOTBALL}
        className="absolute top-1/2 z-10 h-6 w-9 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_3px_0_rgba(0,0,0,0.4)] sm:h-7 sm:w-10"
        style={{ left: `${ball}%` }}
      />

      {/* how far along, in plain numbers */}
      <span className="led absolute bottom-1 left-1.5 text-[9px] text-ink/70 sm:text-[10px]">
        {yards} / {BALANCE.field.length} YD
      </span>
    </div>
  );
}
