import type { Goal } from '../game/economy';
import { fmt, fmtEta } from './format';

const TINT: Record<Goal['kind'], string> = {
  upgrade: '#3fd8ff',
  team: '#8cf25b',
  draft: '#a24cf0',
};

/**
 * The one thing you cannot quite afford yet, with a bar filling toward it.
 * There is always exactly one of these on the home screen, so the answer to
 * "what am I waiting for?" is never nothing.
 */
export default function NextGoal({
  goal,
  bank,
  onGo,
  highlight,
}: {
  goal: Goal;
  bank: number;
  onGo: () => void;
  highlight?: boolean;
}) {
  const ready = goal.eta <= 0;

  return (
    <button className={`card mb-2.5 ${highlight ? 'tut-glow' : ''}`} onClick={onGo}>
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="h-[22px] w-[22px] shrink-0 border-[3px] border-ink"
          style={{ background: TINT[goal.kind] }}
        />
        <span className="min-w-0 flex-1">
          <span className="pix block truncate text-[10px] text-ink">
            {ready ? 'READY NOW' : 'NEXT UP'} · {goal.label}
          </span>
          <span className="small block truncate">{goal.detail}</span>
        </span>
        <span className="pix shrink-0 text-[10px]" style={{ color: ready ? '#2f8f3a' : '#c26a00' }}>
          {ready ? 'BUY IT' : fmtEta(goal.eta)}
        </span>
      </div>

      <span className="meter">
        <span
          style={{
            width: `${Math.min(100, goal.progress * 100)}%`,
            background: ready ? '#6adf62' : TINT[goal.kind],
          }}
        />
      </span>
      <span className="mt-1 block text-[15px] text-mutedeep">
        {fmt(bank)} / {fmt(goal.cost)} YD
      </span>
    </button>
  );
}
