import { BALANCE } from '../config/balance';
import { isMaxed, upgradeCost } from '../game/economy';
import { getMods, type League } from '../game/ratings';
import type { Team, UpgradeId } from '../game/types';
import { fmt, fmtEta, fmtRate } from './format';

interface Row {
  id: UpgradeId;
  name: string;
  blurb: string;
  chip: string;
  value: string;
}

function rows(team: Team, league: League): Row[] {
  const mods = getMods(team, league);
  const pb = BALANCE.playbooks[team.playbook];
  return [
    {
      id: 'speed',
      name: 'SPEED',
      blurb: 'run more yards every second',
      chip: '#3fd8ff',
      value: `${fmtRate(mods.yardsPerSecond)} YD/SEC`,
    },
    {
      id: 'power',
      name: 'POWER',
      blurb: 'bigger touchdown bonus',
      chip: '#ff7a3d',
      value: `+${fmt(mods.touchdownBonus)} PER TD`,
    },
    {
      id: 'grit',
      name: 'GRIT',
      blurb: 'get stopped less often',
      chip: '#6adf62',
      value: `${(mods.driveSuccessRate * 100).toFixed(0)}% OF DRIVES SCORE`,
    },
    {
      id: 'bigPlay',
      name: 'BIG PLAYS',
      blurb: 'jump way down the field',
      chip: '#a24cf0',
      value: `${(mods.bigPlayChance * 100).toFixed(0)}% · +${fmt(mods.bigPlayYards)} YD`,
    },
    {
      id: 'specialty',
      name: pb.specialtyName,
      blurb: `grow ${pb.label.toLowerCase()} even more`,
      chip: '#ff5fa8',
      value: pb.blurb.toUpperCase(),
    },
  ];
}

/**
 * Upgrades, sorted so the cheapest thing you can act on is always at the top
 * and the cheapest thing you cannot is right behind it with a bar filling.
 * The player should never have to scan for what to want next.
 */
export default function UpgradePanel({
  team,
  bank,
  league,
  /** Yards per second, for the "how long until I can afford this" readout. */
  rate,
  onBuy,
  highlight,
}: {
  team: Team;
  bank: number;
  league: League;
  rate: number;
  onBuy: (teamId: string, id: UpgradeId) => void;
  highlight?: boolean;
}) {
  const priced = rows(team, league).map((r) => {
    const maxed = isMaxed(team, r.id);
    const cost = upgradeCost(team, r.id);
    return { ...r, maxed, cost, afford: !maxed && bank >= cost };
  });

  // affordable first, then by how soon you get there, maxed to the bottom
  priced.sort((a, b) => {
    if (a.maxed !== b.maxed) return a.maxed ? 1 : -1;
    if (a.afford !== b.afford) return a.afford ? -1 : 1;
    return a.cost - b.cost;
  });

  const nextUp = priced.find((r) => !r.afford && !r.maxed)?.id;

  return (
    <div className={highlight ? 'tut-glow' : ''}>
      {priced.map((r) => {
        const eta = (r.cost - bank) / Math.max(0.01, rate);
        return (
          <button
            key={r.id}
            onClick={() => onBuy(team.id, r.id)}
            disabled={!r.afford}
            className={`card no-select mb-2.5 ${r.afford ? '' : 'card-off'}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-[26px] w-[26px] shrink-0 border-[3px] border-ink"
                style={{ background: r.chip }}
              />
              <span className="min-w-0 flex-1">
                <span className="pix block truncate text-[10px] text-ink">
                  {r.name}
                  {r.id === nextUp && <span className="text-[#c26a00]"> · NEXT UP</span>}
                </span>
                <span className="small block truncate !text-mutedeep">{r.blurb}</span>
                <span className="block truncate text-[15px] text-[#2f7fb8]">{r.value}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="pix block text-[10px] text-ink">
                  {r.maxed ? 'MAX' : `${fmt(r.cost)} YD`}
                </span>
                <span className="block text-[15px] text-mutedeep">LV {team.levels[r.id]}</span>
              </span>
            </div>

            {/* the bar only appears on things you are saving toward */}
            {!r.afford && !r.maxed && (
              <div className="mt-2 flex items-center gap-2">
                <span className="meter flex-1">
                  <span
                    style={{ width: `${Math.min(100, (bank / r.cost) * 100)}%`, background: r.chip }}
                  />
                </span>
                <span className="shrink-0 text-[15px] text-mutedeep">{fmtEta(eta)}</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
