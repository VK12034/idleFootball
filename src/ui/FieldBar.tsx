import type { DriveState, Team } from '../game/types';

const HASHES = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function FieldBar({ team, drive }: { team: Team; drive: DriveState }) {
  const ball = Math.max(0, Math.min(100, drive.yardLine));
  const firstDown = Math.min(100, drive.yardLine + drive.yardsToFirst);

  return (
    <div className="relative h-12 w-full overflow-hidden rounded-md bg-emerald-900/70 ring-1 ring-emerald-500/20">
      {/* end zones */}
      <div
        className="absolute inset-y-0 left-0 w-[6%] opacity-70"
        style={{ background: team.colors.primary }}
      />
      <div className="absolute inset-y-0 right-0 w-[6%] bg-neutral-700/80" />

      {/* yard hashes */}
      {HASHES.map((y) => (
        <div
          key={y}
          className={`absolute inset-y-0 w-px ${y === 50 ? 'bg-white/45' : 'bg-white/15'}`}
          style={{ left: `${y}%` }}
        />
      ))}

      {/* ground gained on this drive */}
      <div
        className="absolute inset-y-0 left-0 bg-white/10 transition-[width] duration-200 ease-out"
        style={{ width: `${ball}%` }}
      />

      {/* line to gain */}
      <div
        className="absolute inset-y-0 w-[2px] bg-yellow-300 shadow-[0_0_6px_rgba(253,224,71,0.8)] transition-[left] duration-200 ease-out"
        style={{ left: `${firstDown}%` }}
      />

      {/* the ball */}
      <div
        className="absolute top-1/2 z-10 h-3.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-[45%] bg-amber-100 ring-1 ring-amber-900/70 transition-[left] duration-200 ease-out"
        style={{ left: `${ball}%` }}
      />

      <div className="pointer-events-none absolute bottom-0.5 left-[7%] text-[10px] font-medium uppercase tracking-wider text-white/35">
        own
      </div>
      <div className="pointer-events-none absolute bottom-0.5 right-[7%] text-[10px] font-medium uppercase tracking-wider text-white/35">
        opp
      </div>
    </div>
  );
}
