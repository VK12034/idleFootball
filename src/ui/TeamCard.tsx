import { BALANCE } from '../config/balance';
import { getMods } from '../game/ratings';
import type { Team, UpgradeId } from '../game/types';
import FieldBar from './FieldBar';
import { fmt, fmtRate } from './format';
import { helmet, PixelArt } from './PixelArt';
import UpgradePanel from './UpgradePanel';

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="px-inset px-1.5 py-1 text-center">
      <div className="label !text-[6px]">{label}</div>
      <div className="led mt-0.5 text-[10px]" style={{ color: color ?? '#fffdf2' }}>
        {value}
      </div>
    </div>
  );
}

export default function TeamCard({
  team,
  elapsed,
  bank,
  onBuy,
  highlight,
}: {
  team: Team;
  elapsed: number;
  bank: number;
  onBuy: (teamId: string, id: UpgradeId) => void;
  highlight?: string | null;
}) {
  const mods = getMods(team);
  const pb = BALANCE.playbooks[team.playbook];

  const scoring = elapsed - team.touchdownAt <= BALANCE.ui.flashDurationMs;
  const bigPlay = elapsed - team.bigPlayAt <= BALANCE.ui.flashDurationMs;
  const banner = scoring ? 'TOUCHDOWN!' : bigPlay ? 'BIG PLAY!' : null;
  const bannerColor = scoring ? '#ffd23f' : '#a3f542';

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <div className={`px-panel no-select p-2 sm:p-3 ${scoring ? 'animate-bump' : ''}`}>
        {/* ---- name plate ---- */}
        <div
          className="mb-2 flex items-center gap-2 border-[3px] border-ink px-2 py-1.5"
          style={{ background: team.colors.primary }}
        >
          <PixelArt
            sprite={helmet(team.colors.secondary, team.colors.primary)}
            className="h-6 w-7 shrink-0"
          />
          <span className="min-w-0 flex-1">
            <span className="led block truncate text-[9px] text-ink sm:text-[11px]">
              {team.name.toUpperCase()}
            </span>
            <span className="block truncate text-[13px] leading-tight text-ink/70">
              {pb.label}
            </span>
          </span>
          <span className="led shrink-0 bg-ink px-1.5 py-1 text-[8px] text-amber">
            {fmt(team.touchdowns)} TD
          </span>
        </div>

        {/* ---- the field ---- */}
        <div className="relative">
          <FieldBar team={team} scoring={scoring} highlight={highlight === 'field'} />
          {banner && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <span
                className="led animate-burst border-[3px] border-ink bg-ink/80 px-2 py-1.5 text-[13px] drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)] sm:px-3 sm:py-2 sm:text-[20px]"
                style={{ color: bannerColor }}
              >
                {banner}
              </span>
            </div>
          )}
        </div>

        {/* ---- readouts ---- */}
        <div
          className={`mt-2 grid grid-cols-3 gap-1.5 ${highlight === 'stats' ? 'tut-glow' : ''}`}
        >
          <Stat label="speed" value={`${fmtRate(mods.yardsPerSecond)}/s`} color="#45d9ff" />
          <Stat label="td bonus" value={`+${fmt(mods.touchdownBonus)}`} color="#ff8a8f" />
          <Stat label="yards made" value={fmt(team.yardsGained)} color="#ffd23f" />
        </div>

        {/* ---- highlights ---- */}
        <div className="px-inset mt-2 px-2 py-1.5">
          <div className="label mb-1 !text-[7px]">highlights</div>
          <ul className="space-y-[3px]">
            {team.log.length === 0 && (
              <li className="text-[14px] text-chalk/30">Driving down the field...</li>
            )}
            {team.log.map((e, i) => (
              <li
                key={`${e.id}-${i}`}
                className={`truncate text-[14px] leading-tight ${
                  e.kind === 'touchdown' ? 'text-amber' : 'text-lime'
                }`}
                style={{ opacity: 1 - i * 0.11 }}
              >
                {e.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <UpgradePanel
        team={team}
        bank={bank}
        onBuy={onBuy}
        highlight={highlight === 'upgrades'}
      />
    </div>
  );
}
