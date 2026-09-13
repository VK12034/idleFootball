import type { OfflineReport as Report } from '../game/save';
import { fmt } from './format';

function fmtAway(ms: number): string {
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins} MINUTES`;
  const h = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${h} HOUR${h === 1 ? '' : 'S'}` : `${h}H ${rest}M`;
}

function Line({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b-[3px] border-[#dfe4f5] py-1.5 last:border-0">
      <span className="text-[17px] text-mutedeep">{label}</span>
      <span className="pix text-[10px]" style={{ color: color ?? '#1b2a6b' }}>
        {value}
      </span>
    </div>
  );
}

/**
 * Coming back deserves a moment. Four hours of running is a story — games
 * played, yards made, the team that carried it — not a silent number bump.
 */
export default function OfflineReport({
  report,
  onCollect,
}: {
  report: Report;
  onCollect: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0e1440]/80 px-4">
      <div
        className="w-full border-[5px] border-ink bg-chalk p-3"
        style={{ boxShadow: '0 8px 0 0 #0e1440', animation: 'reveal 320ms steps(5,end)' }}
      >
        <div className="pix mb-1 text-center text-[13px] text-ink">WHILE YOU WERE OUT</div>
        <div className="mb-2.5 text-center text-[17px] text-mutedeep">
          YOUR TEAMS RAN FOR {fmtAway(report.ms)}
        </div>

        <Line label="Drives played" value={fmt(report.drives)} />
        <Line label="Touchdowns" value={fmt(report.touchdowns)} color="#2f8f3a" />
        <Line label="Drives stopped" value={fmt(report.stops)} color="#a11d22" />
        <Line label="Big plays" value={fmt(report.bigPlays)} color="#7a2fb8" />
        <Line label="Best team" value={report.bestTeam.toUpperCase()} />

        <div className="mt-2.5 border-[4px] border-ink bg-amber p-2 text-center">
          <div className="text-[16px] text-ink">YARDS BANKED</div>
          <div className="pix mt-1 text-[20px] text-ink">+{fmt(report.yards)}</div>
        </div>

        <button onClick={onCollect} className="btn mt-3 w-full bg-lime px-3 py-3">
          <span className="pix text-[11px] text-ink">COLLECT</span>
        </button>
      </div>
    </div>
  );
}
