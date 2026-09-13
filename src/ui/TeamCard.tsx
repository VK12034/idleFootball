import { BALANCE } from '../config/balance';
import { getMods } from '../game/ratings';
import type { Team } from '../game/types';
import FieldBar from './FieldBar';

const ORDINAL = ['', '1st', '2nd', '3rd', '4th'];

function fieldPositionText(yardLine: number) {
  const y = Math.round(yardLine);
  if (y === 50) return 'midfield';
  return y < 50 ? `own ${y}` : `opp ${100 - y}`;
}

function flashClass(team: Team, elapsed: number) {
  if (elapsed - team.flashAt > BALANCE.ui.flashDurationMs) return '';
  switch (team.flash) {
    case 'touchdown':
      return 'animate-flashTd';
    case 'turnover':
      return 'animate-flashTurnover';
    default:
      return '';
  }
}

function resultTone(team: Team) {
  switch (team.flash) {
    case 'touchdown':
      return 'text-yellow-300';
    case 'fieldGoal':
      return 'text-emerald-300';
    case 'turnover':
      return 'text-red-400';
    case 'stop':
      return 'text-orange-300';
    case 'firstDown':
      return 'text-sky-300';
    default:
      return 'text-neutral-300';
  }
}

export default function TeamCard({ team, elapsed }: { team: Team; elapsed: number }) {
  const mods = getMods(team);
  const drive = team.drive;
  const toGoal = BALANCE.drive.goalLine - drive.yardLine;
  const goalToGo = drive.yardsToFirst >= toGoal;
  const conversionRate = team.driveSets > 0 ? team.driveConversions / team.driveSets : 0;
  const yardsPerPlay = team.playsRun > 0 ? team.yardsGained / team.playsRun : 0;

  const recent = elapsed - team.flashAt <= BALANCE.ui.flashDurationMs;

  return (
    <div
      className={`rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 ${flashClass(
        team,
        elapsed,
      )}`}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-6 w-1.5 rounded-full"
            style={{ background: team.colors.primary }}
          />
          <h2 className="text-base font-semibold tracking-tight">{team.name}</h2>
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            Tier {team.tier} · {team.playbook}
          </span>
        </div>
        <div className="text-right text-xs text-neutral-500">
          {team.pointsScored.toLocaleString()} pts
        </div>
      </div>

      <FieldBar team={team} drive={drive} />

      <div className="mt-3 flex items-center justify-between gap-4 text-sm">
        <div className="font-medium text-neutral-200">
          {ORDINAL[drive.down]} &amp;{' '}
          {goalToGo ? 'Goal' : Math.max(1, Math.round(drive.yardsToFirst))}
          <span className="ml-2 text-neutral-500">
            at {fieldPositionText(drive.yardLine)}
          </span>
        </div>
        <div
          key={team.playsRun}
          className={`${resultTone(team)} ${
            recent ? 'animate-popIn' : ''
          } text-right text-sm font-medium`}
        >
          {team.lastPlayText}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 border-t border-neutral-800 pt-3 text-[11px] text-neutral-500 sm:grid-cols-4">
        <Stat label="play clock" value={`${(mods.playIntervalMs / 1000).toFixed(1)}s`} />
        <Stat label="conversion" value={`${(conversionRate * 100).toFixed(0)}%`} />
        <Stat label="yds / play" value={yardsPerPlay.toFixed(2)} />
        <Stat label="plays" value={team.playsRun.toLocaleString()} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="uppercase tracking-wider">{label}</span>
      <span className="font-medium text-neutral-300">{value}</span>
    </div>
  );
}
