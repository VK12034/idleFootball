import { BALANCE } from '../config/balance';
import { NAFL_TEAMS, type ConferenceId, type TeamConfig } from '../config/teams';
import { unlockCost } from '../game/economy';
import type { GameState, Team } from '../game/types';
import BackBar from './BackBar';
import { fmt } from './format';
import Helmet from './Helmet';

const CONFERENCES: ConferenceId[] = ['IRON', 'GOLD'];
const DIVISIONS = ['EAST', 'NORTH', 'SOUTH', 'WEST'] as const;

function TeamRow({
  cfg,
  team,
  cost,
  affordable,
  onOpen,
  onBuy,
}: {
  cfg: TeamConfig;
  team?: Team;
  cost: number;
  affordable: boolean;
  onOpen: () => void;
  onBuy: () => void;
}) {
  const pb = BALANCE.playbooks[cfg.playbook];
  const owned = !!team;
  const label = owned ? 'OPEN' : affordable ? 'BUY' : 'LOCKED';
  const face = owned ? 'bg-gold' : affordable ? 'bg-lime' : 'bg-[#cfd6ef]';
  const status = owned
    ? `RUNNING · ${pb.label.toUpperCase()} · ${fmt(team.touchdowns)} TD`
    : `${pb.label.toUpperCase()} · COSTS ${fmt(cost)} YD`;

  return (
    <div
      className={`mb-2.5 border-[5px] border-ink p-2.5 ${owned ? 'bg-chalk' : 'bg-paper'}`}
      style={{ boxShadow: '0 6px 0 0 #1b2a6b' }}
    >
      <div className="flex items-center gap-2.5">
        <Helmet
          primary={cfg.colors.primary}
          secondary={cfg.colors.secondary}
          playbook={cfg.playbook}
          size={40}
          className={owned || affordable ? '' : 'opacity-70'}
        />
        <div className="min-w-0 flex-1">
          <div className="pix truncate text-[10px] text-ink">{cfg.name.toUpperCase()}</div>
          <div className="small truncate">{status}</div>
        </div>
        <button
          onClick={owned ? onOpen : onBuy}
          disabled={!owned && !affordable}
          className={`pix btn shrink-0 border-4 px-2.5 py-2 text-[9px] text-ink ${face}`}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

export default function TeamsPanel({
  state,
  onOpenTeam,
  onBuyTeam,
  onBack,
}: {
  state: GameState;
  onOpenTeam: (id: string) => void;
  onBuyTeam: (id: string) => void;
  onBack: () => void;
}) {
  const owned = new Map(state.teams.map((t) => [t.id, t]));
  const cost = unlockCost(state.teams.length);
  const affordable = state.bank >= cost;

  return (
    <>
      <BackBar title="ALL TEAMS" onBack={onBack} />

      <div className="card mb-3">
        <div className="pix text-[10px] text-ink">
          {owned.size} / {NAFL_TEAMS.length} TEAMS
        </div>
        <p className="mt-1 text-[17px] leading-tight text-mutedeep">
          Every team you own runs at the same time. The next one costs{' '}
          <span className="text-[#c26a00]">{fmt(cost)} yards</span>.
        </p>
      </div>

      {CONFERENCES.map((conf) => (
        <div key={conf} className="mb-2">
          <div
            className="pix mb-2 border-[5px] border-ink px-2 py-1.5 text-[10px] text-ink"
            style={{ background: conf === 'IRON' ? '#3fd8ff' : '#ffd23f' }}
          >
            {conf} CONFERENCE
          </div>

          {DIVISIONS.map((div) => {
            const teams = NAFL_TEAMS.filter((t) => t.conference === conf && t.division === div);
            const here = teams.filter((t) => owned.has(t.id)).length;
            return (
              <div key={div} className="mb-1">
                <div className="mb-1 flex items-baseline justify-between px-0.5">
                  <span className="pix text-[8px] text-shell">
                    {conf} {div}
                  </span>
                  <span className="text-[15px] text-[#3c4a86]">
                    {here}/{teams.length}
                  </span>
                </div>
                {teams.map((cfg) => (
                  <TeamRow
                    key={cfg.id}
                    cfg={cfg}
                    team={owned.get(cfg.id)}
                    cost={cost}
                    affordable={affordable}
                    onOpen={() => onOpenTeam(cfg.id)}
                    onBuy={() => onBuyTeam(cfg.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
