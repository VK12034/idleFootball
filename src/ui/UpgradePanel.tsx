import { BALANCE } from '../config/balance';
import { isMaxed, upgradeCost } from '../game/economy';
import { getMods } from '../game/ratings';
import type { Team, UpgradeId } from '../game/types';
import { fmt, fmtRate } from './format';

interface Row {
  id: UpgradeId;
  name: string;
  blurb: string;
  accent: string;
  value: string;
}

function rows(team: Team): Row[] {
  const mods = getMods(team);
  const pb = BALANCE.playbooks[team.playbook];
  return [
    {
      id: 'speed',
      name: 'SPEED',
      blurb: 'Run down the field faster',
      accent: '#45d9ff',
      value: `${fmtRate(mods.yardsPerSecond)} yd/sec`,
    },
    {
      id: 'power',
      name: 'POWER',
      blurb: 'Bigger touchdown bonus',
      accent: '#ff5a5f',
      value: `+${fmt(mods.touchdownBonus)} per TD`,
    },
    {
      id: 'bigPlay',
      name: 'BIG PLAYS',
      blurb: 'Surprise jumps down the field',
      accent: '#a3f542',
      value: `${(mods.bigPlayChance * 100).toFixed(0)}% · +${fmt(mods.bigPlayYards)} yd`,
    },
    {
      id: 'specialty',
      name: pb.specialtyName,
      blurb: pb.blurb,
      accent: '#ffd23f',
      value: `${pb.label} boost`,
    },
  ];
}

export default function UpgradePanel({
  team,
  bank,
  onBuy,
  highlight,
}: {
  team: Team;
  bank: number;
  onBuy: (teamId: string, id: UpgradeId) => void;
  highlight?: boolean;
}) {
  return (
    <div className={`px-panel p-2 sm:p-3 ${highlight ? 'tut-glow' : ''}`}>
      <div className="label mb-2 !text-[8px] !text-lime">make this team better</div>

      <div className="flex flex-col gap-1.5">
        {rows(team).map((r) => {
          const maxed = isMaxed(team, r.id);
          const cost = upgradeCost(team, r.id);
          const afford = bank >= cost;
          const level = team.levels[r.id];

          return (
            <button
              key={r.id}
              onClick={() => onBuy(team.id, r.id)}
              disabled={maxed || !afford}
              className={`px-inset flex items-center gap-2 px-2 py-2 text-left ${
                maxed || !afford
                  ? 'cursor-not-allowed opacity-45'
                  : 'hover:bg-[#2f2699] active:translate-y-[2px]'
              }`}
              style={{ minHeight: 58 }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center border-[3px] border-ink"
                style={{ background: r.accent }}
              >
                <span className="led text-[10px] text-ink">{level}</span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="led block truncate text-[10px] text-chalk">{r.name}</span>
                <span className="block truncate text-[13px] leading-tight text-chalk/55">
                  {r.blurb}
                </span>
                <span className="block truncate text-[13px] leading-tight text-sky/80">
                  {r.value}
                </span>
              </span>

              <span
                className={`led shrink-0 border-[3px] border-ink px-1.5 py-1 text-[9px] ${
                  maxed ? 'bg-ink text-chalk/50' : afford ? 'bg-amber text-ink' : 'bg-ink text-chalk/50'
                }`}
              >
                {maxed ? 'MAX' : fmt(cost)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
