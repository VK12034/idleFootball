import { NAFL_TEAMS } from '../config/teams';
import { unlockCost } from '../game/economy';
import { getMods } from '../game/ratings';
import type { GameState, Team } from '../game/types';
import { fmt, fmtRate } from './format';
import {
  CLIPBOARD,
  DUMBBELL,
  FOOTBALL,
  helmet,
  PixelArt,
  STADIUM,
  type Sprite,
} from './PixelArt';

/** One owned team, condensed: tap to open its field. */
function LiveRow({ team, onOpen }: { team: Team; onOpen: () => void }) {
  const mods = getMods(team);
  return (
    <button
      onClick={onOpen}
      className="px-inset flex w-full items-center gap-2 px-2 py-2 text-left hover:bg-[#2b2290]"
      style={{ minHeight: 58 }}
    >
      <PixelArt
        sprite={helmet(team.colors.primary, team.colors.secondary)}
        className="h-6 w-7 shrink-0"
      />
      <span className="min-w-0 flex-1">
        <span className="led block truncate text-[10px] text-chalk">
          {team.name.toUpperCase()}
        </span>
        <span className="block truncate text-[13px] leading-tight text-chalk/60">
          {Math.floor(team.progress)} / 100 yd · {fmtRate(mods.yardsPerSecond)} yd/sec
        </span>
        {/* mini progress bar so the drive reads at a glance */}
        <span className="mt-1 block h-1.5 w-full border-2 border-ink bg-ink">
          <span
            className="block h-full bg-turf"
            style={{ width: `${Math.min(100, team.progress)}%` }}
          />
        </span>
      </span>
      <span className="led shrink-0 text-[9px] text-amber">{fmt(team.touchdowns)} TD</span>
    </button>
  );
}

function MenuButton({
  label,
  sub,
  accent,
  icon,
  locked,
  onClick,
  highlight,
}: {
  label: string;
  sub: string;
  accent: string;
  icon: Sprite;
  locked?: boolean;
  onClick?: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`px-panel flex items-center gap-2.5 p-2.5 text-left sm:gap-3 sm:p-3 ${
        locked ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#5d54f0] active:translate-y-[3px]'
      } ${highlight ? 'tut-glow' : ''}`}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-ink"
        style={{ background: accent }}
      >
        <PixelArt sprite={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="led block text-[10px] text-chalk sm:text-[11px]">{label}</span>
        <span className="block truncate text-[13px] leading-tight text-chalk/55">{sub}</span>
      </span>
      {locked ? (
        <span className="led shrink-0 bg-ink px-1.5 py-1 text-[7px] text-chalk/60">SOON</span>
      ) : (
        <span className="led shrink-0 text-[12px] text-chalk/40">&rsaquo;</span>
      )}
    </button>
  );
}

export default function MainMenu({
  state,
  onOpenTeams,
  onOpenUpgrades,
  onOpenTeam,
  highlight,
}: {
  state: GameState;
  onOpenTeams: () => void;
  onOpenUpgrades: () => void;
  onOpenTeam: (id: string) => void;
  highlight?: string | null;
}) {
  const next = unlockCost(state.teams.length);

  return (
    <div className="flex flex-col gap-3">
      {/* ---- title ---- */}
      <div className="px-panel flex items-center gap-3 p-3">
        <PixelArt sprite={FOOTBALL} className="h-8 w-11 shrink-0 animate-bob" />
        <div className="min-w-0">
          <h1 className="led text-[15px] text-amber drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] sm:text-[19px]">
            GRIDIRON
          </h1>
          <p className="text-[13px] text-chalk/60">Run forever. Score forever.</p>
        </div>
      </div>

      {/* ---- your teams, live ---- */}
      <div className={`px-panel p-2 sm:p-3 ${highlight === 'live' ? 'tut-glow' : ''}`}>
        <div className="label mb-2 !text-[8px] !text-lime">your teams · running now</div>
        <div className="flex flex-col gap-1.5">
          {state.teams.map((t) => (
            <LiveRow key={t.id} team={t} onOpen={() => onOpenTeam(t.id)} />
          ))}
        </div>
      </div>

      {/* ---- menu ---- */}
      <div className={`flex flex-col gap-2 ${highlight === 'menu' ? 'tut-glow' : ''}`}>
        <MenuButton
          label="UPGRADES"
          sub="Make your teams faster"
          accent="#a3f542"
          icon={DUMBBELL}
          onClick={onOpenUpgrades}
          highlight={highlight === 'upgradesButton'}
        />
        <MenuButton
          label="TEAMS"
          sub={`${state.teams.length} of ${NAFL_TEAMS.length} · next costs ${fmt(next)} yd`}
          accent="#45d9ff"
          icon={helmet('#160e46', '#fffdf2')}
          onClick={onOpenTeams}
          highlight={highlight === 'teamsButton'}
        />
        <MenuButton label="DRAFT" sub="Sign new players" accent="#ffd23f" icon={CLIPBOARD} locked />
        <MenuButton
          label="TROPHIES"
          sub="Rewards for big milestones"
          accent="#c56bff"
          icon={STADIUM}
          locked
        />
      </div>
    </div>
  );
}
