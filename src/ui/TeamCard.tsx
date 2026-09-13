import { BALANCE } from '../config/balance';
import { getMods, type League } from '../game/ratings';
import type { Team, UpgradeId } from '../game/types';
import BackBar from './BackBar';
import FieldBar from './FieldBar';
import { fmt, fmtRate } from './format';
import Helmet from './Helmet';
import UpgradePanel from './UpgradePanel';

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="border-[3px] border-ink bg-paper px-1 py-1 text-center">
      <div className="text-[14px] leading-none text-mute">{label}</div>
      <div className="pix mt-1 text-[9px]" style={{ color: color ?? '#1b2a6b' }}>
        {value}
      </div>
    </div>
  );
}

export default function TeamCard({
  team,
  elapsed,
  bank,
  league,
  rate,
  onBuy,
  onBack,
  highlight,
}: {
  team: Team;
  elapsed: number;
  bank: number;
  league: League;
  rate: number;
  onBuy: (teamId: string, id: UpgradeId) => void;
  onBack: () => void;
  highlight?: string | null;
}) {
  const mods = getMods(team, league);
  const pb = BALANCE.playbooks[team.playbook];

  const scoring = elapsed - team.touchdownAt <= BALANCE.ui.flashDurationMs;
  const stopped = elapsed - team.stoppedAt <= BALANCE.ui.flashDurationMs;
  const bigPlay = elapsed - team.bigPlayAt <= BALANCE.ui.flashDurationMs;

  return (
    <>
      <BackBar title={team.name.toUpperCase()} onBack={onBack} />

      <div
        className={`no-select mb-4 border-[5px] border-ink bg-chalk p-2.5 ${
          scoring ? 'animate-bump' : ''
        }`}
        style={{ boxShadow: '0 7px 0 0 #1b2a6b' }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Helmet
            primary={team.colors.primary}
            secondary={team.colors.secondary}
            playbook={team.playbook}
            size={48}
          />
          <div className="min-w-0 flex-1 text-[17px] leading-tight text-mute">
            {pb.label.toUpperCase()}
            <br />
            <span className="text-ink">
              {fmtRate(mods.yardsPerSecond)} YD/SEC · {fmt(team.touchdowns)} TOUCHDOWNS
            </span>
          </div>
        </div>

        <FieldBar
          team={team}
          scoring={scoring}
          stopped={stopped}
          highlight={highlight === 'field'}
        />

        {/* One line, and it is about this drive: the near-miss has to be the
            loudest thing on the screen when it happens. */}
        {scoring ? (
          <div className="pix animate-pop mt-2 text-center text-[12px] text-[#2f8f3a]">
            TOUCHDOWN! +{fmt(mods.touchdownBonus)}
          </div>
        ) : stopped ? (
          <div className="mt-2 border-[3px] border-[#a11d22] bg-[#ff5a5f] px-2 py-1.5 text-center">
            <div className="pix text-[10px] leading-[1.4] text-white">{team.lastStopText}</div>
            <div className="text-[16px] text-white">
              YOU KEPT THE YARDS — GRIT STOPS THIS HAPPENING
            </div>
          </div>
        ) : bigPlay ? (
          <div className="pix animate-pop mt-2 text-center text-[12px] text-[#7a2fb8]">
            BIG PLAY!
          </div>
        ) : (
          team.lastStopText && (
            <div className="mt-2 text-center text-[15px] text-[#a11d22]">
              LAST DRIVE: {team.lastStopText}
            </div>
          )
        )}

        <div className={`mt-2 grid grid-cols-3 gap-1.5 ${highlight === 'stats' ? 'tut-glow' : ''}`}>
          <Stat label="TD BONUS" value={`+${fmt(mods.touchdownBonus)}`} color="#c26a00" />
          <Stat
            label="DRIVES SCORED"
            value={`${(mods.driveSuccessRate * 100).toFixed(0)}%`}
            color="#2f8f3a"
          />
          <Stat label="STOPPED" value={fmt(team.stops)} color="#a11d22" />
          <Stat label="BIG PLAYS" value={fmt(team.bigPlays)} color="#7a2fb8" />
          <Stat
            label="CLOSEST STOP"
            value={team.closestStop > 0 ? `${Math.round(100 - team.closestStop)} OUT` : '—'}
            color="#a11d22"
          />
          <Stat label="YARDS MADE" value={fmt(team.yardsGained)} />
        </div>
      </div>

      <div className="pix mb-2 text-[10px] text-shell">SPEND YARDS</div>
      <UpgradePanel
        team={team}
        bank={bank}
        league={league}
        rate={rate}
        onBuy={onBuy}
        highlight={highlight === 'upgrades'}
      />
    </>
  );
}
