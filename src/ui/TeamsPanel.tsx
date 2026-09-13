import { BALANCE } from '../config/balance';
import { NAFL_TEAMS, type ConferenceId, type TeamConfig } from '../config/teams';
import { unlockCost } from '../game/economy';
import type { GameState } from '../game/types';
import { fmt } from './format';
import { helmet, PixelArt } from './PixelArt';

const CONFERENCES: ConferenceId[] = ['IRON', 'GOLD'];
const DIVISIONS = ['EAST', 'NORTH', 'SOUTH', 'WEST'] as const;

function TeamTile({
  cfg,
  owned,
  touchdowns,
  cost,
  affordable,
  onOpen,
  onBuy,
}: {
  cfg: TeamConfig;
  owned: boolean;
  touchdowns: number;
  cost: number;
  affordable: boolean;
  onOpen: () => void;
  onBuy: () => void;
}) {
  const pb = BALANCE.playbooks[cfg.playbook];

  if (owned) {
    return (
      <button
        onClick={onOpen}
        className="flex items-center gap-2 border-[3px] border-ink px-2 py-2 text-left hover:brightness-110 active:translate-y-[2px]"
        style={{ minHeight: 54, background: cfg.colors.primary, boxShadow: '0 4px 0 0 #120a38' }}
      >
        <PixelArt
          sprite={helmet(cfg.colors.secondary, cfg.colors.primary)}
          className="h-6 w-7 shrink-0"
        />
        <span className="min-w-0 flex-1">
          <span className="led block truncate text-[10px] text-ink">
            {cfg.name.toUpperCase()}
          </span>
          <span className="block truncate text-[13px] leading-tight text-ink/70">
            {pb.label}
          </span>
        </span>
        <span className="led shrink-0 bg-ink px-1.5 py-1 text-[8px] text-amber">
          {fmt(touchdowns)} TD
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={affordable ? onBuy : undefined}
      disabled={!affordable}
      className={`px-inset flex items-center gap-2 px-2 py-2 text-left ${
        affordable ? 'hover:bg-[#2f2699] active:translate-y-[2px]' : 'cursor-not-allowed'
      }`}
      style={{ minHeight: 54 }}
    >
      {/* keep a sliver of the team's colours so locked teams stay distinct */}
      <span
        className="-my-2 -ml-2 mr-0.5 w-1.5 shrink-0 self-stretch"
        style={{ background: cfg.colors.primary, opacity: affordable ? 0.9 : 0.5 }}
      />
      <PixelArt
        sprite={helmet(cfg.colors.primary, cfg.colors.secondary)}
        className={`h-6 w-7 shrink-0 ${affordable ? '' : 'opacity-60'}`}
      />
      <span className="min-w-0 flex-1">
        <span
          className={`led block truncate text-[10px] ${
            affordable ? 'text-chalk' : 'text-chalk/70'
          }`}
        >
          {cfg.name.toUpperCase()}
        </span>
        <span className="block truncate text-[13px] leading-tight text-chalk/45">
          {pb.label}
        </span>
      </span>
      <span
        className={`led shrink-0 border-[3px] border-ink px-1.5 py-1 text-[8px] ${
          affordable ? 'bg-amber text-ink' : 'bg-ink text-chalk/50'
        }`}
      >
        {fmt(cost)}
      </span>
    </button>
  );
}

export default function TeamsPanel({
  state,
  onOpenTeam,
  onBuyTeam,
}: {
  state: GameState;
  onOpenTeam: (id: string) => void;
  onBuyTeam: (id: string) => void;
}) {
  const owned = new Map(state.teams.map((t) => [t.id, t]));
  const cost = unlockCost(state.teams.length);
  const affordable = state.bank >= cost;

  return (
    <div className="flex flex-col gap-3">
      <div className="px-panel p-3">
        <div className="label mb-1">teams you own</div>
        <div className="led text-[15px] text-amber">
          {owned.size} / {NAFL_TEAMS.length}
        </div>
        <p className="mt-1 text-[13px] leading-snug text-chalk/60">
          Every team you own runs down the field at the same time. The next team costs{' '}
          <span className="text-amber">{fmt(cost)} yards</span>.
        </p>
      </div>

      {CONFERENCES.map((conf) => (
        <div key={conf} className="px-panel p-2 sm:p-3">
          <div
            className="label mb-2 !text-[9px]"
            style={{ color: conf === 'IRON' ? '#45d9ff' : '#ffd23f' }}
          >
            {conf} conference
          </div>

          <div className="flex flex-col gap-3">
            {DIVISIONS.map((div) => {
              const teams = NAFL_TEAMS.filter(
                (t) => t.conference === conf && t.division === div,
              );
              const ownedHere = teams.filter((t) => owned.has(t.id)).length;
              return (
                <div key={div}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="label !text-[7px]">
                      {conf} {div}
                    </span>
                    <span className="led text-[7px] text-chalk/40">
                      {ownedHere}/{teams.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {teams.map((cfg) => {
                      const team = owned.get(cfg.id);
                      return (
                        <TeamTile
                          key={cfg.id}
                          cfg={cfg}
                          owned={!!team}
                          touchdowns={team?.touchdowns ?? 0}
                          cost={cost}
                          affordable={affordable}
                          onOpen={() => onOpenTeam(cfg.id)}
                          onBuy={() => onBuyTeam(cfg.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
