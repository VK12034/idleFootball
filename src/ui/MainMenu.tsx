import { BALANCE } from '../config/balance';
import { draftCost } from '../game/draft';
import type { Goal as NextGoalType } from '../game/economy';
import { getMods, type League } from '../game/ratings';
import { pendingCapital } from '../game/prestige';
import type { GameState, Team } from '../game/types';
import FieldBar from './FieldBar';
import { fmt, fmtRate } from './format';
import Helmet from './Helmet';
import NextGoal from './NextGoal';

/** One owned team's drive, as a tappable card. */
function DriveCard({
  team,
  league,
  elapsed,
  onOpen,
}: {
  team: Team;
  league: League;
  elapsed: number;
  onOpen: () => void;
}) {
  const mods = getMods(team, league);
  const pb = BALANCE.playbooks[team.playbook];
  const toGo = Math.max(1, Math.ceil(BALANCE.field.length - team.progress));
  const scoring = elapsed - team.touchdownAt <= BALANCE.ui.flashDurationMs;
  const stopped = elapsed - team.stoppedAt <= BALANCE.ui.flashDurationMs;

  return (
    <button className={`card mb-2.5 ${scoring ? 'animate-bump' : ''}`} onClick={onOpen}>
      <div className="mb-2 flex items-center gap-2">
        <Helmet
          primary={team.colors.primary}
          secondary={team.colors.secondary}
          playbook={team.playbook}
          size={38}
        />
        <div className="min-w-0 flex-1">
          <div className="pix truncate text-[10px] text-ink">{team.name.toUpperCase()}</div>
          <div className="small truncate">
            {pb.label.toUpperCase()} · {fmtRate(mods.yardsPerSecond)} YD/SEC
          </div>
        </div>
        <div className="pix shrink-0 text-[10px] text-flame">{fmt(team.touchdowns)} TD</div>
      </div>

      <FieldBar team={team} mini scoring={scoring} stopped={stopped} />

      <div className="mt-1 flex justify-between text-[15px]">
        {stopped ? (
          <span className="truncate text-[#a11d22]">{team.lastStopText}</span>
        ) : (
          <>
            <span className="text-mute">{Math.floor(team.progress)} YARD LINE</span>
            <span className="text-mute">{toGo} TO GO</span>
          </>
        )}
      </div>
    </button>
  );
}

function Tile({
  label,
  sub,
  bg,
  onClick,
  highlight,
}: {
  label: string;
  sub: string;
  bg: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn min-h-[74px] px-2 py-3.5 text-ink ${highlight ? 'tut-glow' : ''}`}
      style={{ background: bg }}
    >
      <span className="pix text-[11px]">{label}</span>
      <span className="mt-1.5 block text-[16px]">{sub}</span>
    </button>
  );
}

export default function MainMenu({
  state,
  league,
  elapsed,
  goal,
  rate,
  onOpenTeams,
  onOpenUpgrades,
  onOpenTeam,
  onOpenDraft,
  onOpenSeason,
  onGoal,
  highlight,
}: {
  state: GameState;
  league: League;
  elapsed: number;
  goal: NextGoalType | null;
  rate: number;
  onOpenTeams: () => void;
  onOpenUpgrades: () => void;
  onOpenTeam: (id: string) => void;
  onOpenDraft: () => void;
  onOpenSeason: () => void;
  onGoal: (goal: NextGoalType) => void;
  highlight?: string | null;
}) {
  const pending = pendingCapital(state);

  return (
    <>
      <div className="my-1.5 mb-4 text-center">
        <div
          className="pix text-[30px] leading-[1.15] text-white"
          style={{ textShadow: '0 5px 0 #1b2a6b, 0 9px 0 rgba(0,0,0,.25)' }}
        >
          GRID
          <br />
          IRON
        </div>
        <div className="mt-3 inline-block border-4 border-ink bg-amber px-2.5 py-[3px] text-[18px] text-ink">
          YARDS ARE FOREVER. DRIVES ARE NOT.
        </div>
      </div>

      {goal && (
        <NextGoal
          goal={goal}
          bank={state.bank}
          onGo={() => onGoal(goal)}
          highlight={highlight === 'goal'}
        />
      )}

      <div className={`pix mb-2 text-[10px] text-shell ${highlight === 'live' ? 'tut-glow' : ''}`}>
        LIVE DRIVES
      </div>
      {state.teams.map((t) => (
        <DriveCard
          key={t.id}
          team={t}
          league={league}
          elapsed={elapsed}
          onOpen={() => onOpenTeam(t.id)}
        />
      ))}

      <div className="mt-1.5 grid grid-cols-2 gap-2.5">
        <Tile
          label="TEAMS"
          sub="BUY A NEW TEAM"
          bg="#8cf25b"
          onClick={onOpenTeams}
          highlight={highlight === 'teamsButton'}
        />
        <Tile
          label="UPGRADE"
          sub={`${fmt(rate * 60)} YD / MIN`}
          bg="#ffd23f"
          onClick={onOpenUpgrades}
          highlight={highlight === 'upgradesButton'}
        />
        <Tile
          label="DRAFT"
          sub={`${fmt(draftCost(state.draftPulls))} YD A PULL`}
          bg="#c58cff"
          onClick={onOpenDraft}
          highlight={highlight === 'draftButton'}
        />
        <Tile
          label="SEASON"
          sub={`+${pending} DRAFT CAPITAL`}
          bg="#3fd8ff"
          onClick={onOpenSeason}
          highlight={highlight === 'seasonButton'}
        />
      </div>
    </>
  );
}
