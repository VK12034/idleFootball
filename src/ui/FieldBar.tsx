import { BALANCE } from '../config/balance';
import type { EventKind, Team } from '../game/types';

/** The runner never passes the goal line pixel; 96% keeps him inside the paint. */
const onField = (progress: number) => `${Math.min(96, Math.max(0, progress) * 0.9)}%`;

const FLOAT_COLOR: Record<EventKind, string> = {
  play: '#ffffff',
  bigPlay: '#8cf25b',
  touchdown: '#ffe452',
  stop: '#ff5a5f',
};

/**
 * One team's drive, drawn as a strip of turf. `mini` is the version that sits
 * in a list row; the full one carries the yard readout and the marker showing
 * how close the closest stopped drive got.
 */
export default function FieldBar({
  team,
  mini,
  scoring,
  stopped,
  highlight,
}: {
  team: Team;
  mini?: boolean;
  /** True while the touchdown celebration is on screen. */
  scoring?: boolean;
  /** True while the stop is on screen. */
  stopped?: boolean;
  highlight?: boolean;
}) {
  const lines = mini
    ? 'repeating-linear-gradient(90deg,transparent 0 37px,rgba(255,255,255,.45) 37px 40px)'
    : 'repeating-linear-gradient(90deg,transparent 0 33px,rgba(255,255,255,.4) 33px 37px)';

  // The newest few only — a wall of numbers reads as noise.
  const floaters = team.floaters.slice(mini ? -2 : -4);

  return (
    <div className="relative">
      <div
        className={`field ${mini ? 'h-6' : 'h-[74px] border-4'} ${highlight ? 'tut-glow' : ''}`}
      >
        <div className="absolute inset-0" style={{ background: lines }} />

        {/* how far the closest stopped drive got: the one that still stings */}
        {!mini && team.closestStop > 0 && (
          <div
            className="absolute inset-y-0 w-[3px] opacity-80"
            style={{
              left: onField(team.closestStop),
              background: 'repeating-linear-gradient(180deg,#ff5a5f 0 5px,transparent 5px 9px)',
            }}
          />
        )}

        {/* end zone, painted in the team's own colours */}
        <div
          className={`absolute inset-y-0 right-0 ${scoring ? 'animate-blink' : ''}`}
          style={{
            width: mini ? 26 : 34,
            background: mini
              ? `repeating-linear-gradient(45deg,${team.colors.primary} 0 6px,#1b2a6b 6px 12px)`
              : `repeating-linear-gradient(45deg,${team.colors.primary} 0 8px,#1b2a6b 8px 16px)`,
          }}
        />

        {/* the runner */}
        <div
          className={`absolute border-ink ${
            mini ? 'top-[3px] h-3 w-3 border-[3px]' : 'top-5 h-7 w-5 border-4'
          }`}
          style={{ left: onField(team.progress), background: team.colors.secondary }}
        />

        {!mini && (
          <span className="absolute bottom-[3px] left-1.5 text-[15px] text-[#d6ffd0]">
            {Math.floor(team.progress)} YD
          </span>
        )}

        {/* the drive dying, in red */}
        {stopped && (
          <div
            className="pointer-events-none absolute inset-0 bg-[#ff2d2d]"
            style={{ animation: `stopFlash ${BALANCE.ui.flashDurationMs}ms steps(6,end)` }}
          />
        )}
      </div>

      {/* numbers lifting off the field — the reason to keep watching */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {floaters.map((f) => (
          <span
            key={f.id}
            className="floater"
            style={{
              left: onField(f.pos),
              top: mini ? -2 : 4,
              color: FLOAT_COLOR[f.kind],
              fontSize: mini ? 8 : 10,
              animation: `floatUp ${BALANCE.ui.floaterMs}ms linear forwards`,
            }}
          >
            {f.kind === 'play' ? f.text : f.text.split(' ')[0]}
          </span>
        ))}
      </div>
    </div>
  );
}
