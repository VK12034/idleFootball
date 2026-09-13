import { useEffect, useRef, useState } from 'react';
import { BALANCE } from '../config/balance';
import { draftCost, rarityOf, RARITIES, TRAIT_LABEL } from '../game/draft';
import type { GameState, Player, Rarity } from '../game/types';
import BackBar from './BackBar';
import { fmt } from './format';

function PlayerCard({ player, fresh }: { player: Player; fresh?: boolean }) {
  const r = rarityOf(player.rarity);
  return (
    <div
      className="mb-2 flex items-center gap-2.5 border-[5px] border-ink bg-chalk p-2"
      style={{
        boxShadow: '0 6px 0 0 #1b2a6b',
        animation: fresh ? 'reveal 420ms steps(6,end)' : undefined,
      }}
    >
      <span
        className="pix flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-ink text-[9px] text-ink"
        style={{ background: r.color }}
      >
        {player.position}
      </span>
      <span className="min-w-0 flex-1">
        <span className="pix block truncate text-[10px] text-ink">{player.name}</span>
        <span className="small block truncate">
          +{Math.round(player.bonus * 100)}% {TRAIT_LABEL[player.trait]} · ALL TEAMS
        </span>
      </span>
      <span
        className="pix shrink-0 border-[3px] border-ink px-1.5 py-1 text-[8px] text-ink"
        style={{ background: r.color }}
      >
        {r.label}
      </span>
    </div>
  );
}

/**
 * The draft. You are not buying a stat, you are pulling a lever: the wheel
 * spins, most of the time you sign a body, and once in a long while you sign
 * someone you will tell people about.
 */
export default function DraftPanel({
  state,
  onDraft,
  onBack,
}: {
  state: GameState;
  /** Performs the pull and returns the player, or null if you cannot pay. */
  onDraft: () => Player | null;
  onBack: () => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [reel, setReel] = useState<Rarity>('common');
  const [result, setResult] = useState<Player | null>(null);
  const timers = useRef<{ spin?: number; land?: number }>({});

  useEffect(
    () => () => {
      clearInterval(timers.current.spin);
      clearTimeout(timers.current.land);
    },
    [],
  );

  const cost = draftCost(state.draftPulls);
  const afford = state.bank >= cost;

  const pull = () => {
    if (spinning) return;
    const player = onDraft();
    if (!player) return;

    setResult(null);
    setSpinning(true);
    timers.current.spin = window.setInterval(() => {
      setReel(RARITIES[Math.floor(Math.random() * RARITIES.length)]);
    }, 90);
    timers.current.land = window.setTimeout(() => {
      clearInterval(timers.current.spin);
      setSpinning(false);
      setReel(player.rarity);
      setResult(player);
    }, BALANCE.draft.suspenseMs);
  };

  const shown = rarityOf(spinning ? reel : (result?.rarity ?? reel));

  return (
    <>
      <BackBar title="THE DRAFT" onBack={onBack} />

      <div className="card mb-3">
        {/* the wheel */}
        <div
          className="mb-2.5 flex h-[86px] items-center justify-center border-[4px] border-ink"
          style={{
            background: shown.color,
            animation: spinning ? 'reelShake 90ms steps(2,end) infinite' : undefined,
          }}
        >
          <span className="pix text-[16px] text-ink">
            {spinning ? shown.label : result ? shown.label : 'READY'}
          </span>
        </div>

        {result && !spinning && <PlayerCard player={result} fresh />}

        <button
          onClick={pull}
          disabled={!afford || spinning}
          className={`btn mb-1 w-full px-3 py-3 ${afford && !spinning ? 'bg-lime' : 'bg-lock'}`}
        >
          <span className="pix text-[11px] text-ink">
            {spinning ? 'SCOUTING...' : `DRAFT PICK · ${fmt(cost)} YD`}
          </span>
        </button>

        {!afford && !spinning && (
          <>
            <span className="meter mt-1.5">
              <span
                style={{ width: `${Math.min(100, (state.bank / cost) * 100)}%`, background: '#a24cf0' }}
              />
            </span>
            <div className="mt-1 text-[15px] text-mutedeep">
              {fmt(state.bank)} / {fmt(cost)} YD
            </div>
          </>
        )}

        <p className="mt-1.5 text-[16px] leading-tight text-mutedeep">
          Every player you sign helps <span className="text-ink">all</span> of your teams, forever
          — and they stay through a new season.
        </p>
      </div>

      <div className="pix mb-2 text-[10px] text-shell">
        YOUR SQUAD · {state.roster.length}
      </div>

      {state.roster.length === 0 ? (
        <div className="card text-[17px] text-mutedeep">
          Nobody signed yet. Pull the lever.
        </div>
      ) : (
        state.roster.map((p) => <PlayerCard key={p.id} player={p} />)
      )}
    </>
  );
}
