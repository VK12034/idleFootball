import { useEffect, useRef, useState } from 'react';
import { newGame } from '../game/generate';
import { pointsPerMinute, tick } from '../game/tick';
import type { GameState } from '../game/types';
import Header from './Header';
import TeamCard from './TeamCard';

/** How often the rAF loop is allowed to push a render. */
const RENDER_INTERVAL_MS = 100;
/** Clamp a single frame's dt so a background tab does not fire thousands of plays. */
const MAX_FRAME_DT_MS = 250;

export default function App() {
  // The authoritative state lives in a ref and is mutated by the loop.
  const stateRef = useRef<GameState>(newGame());
  // Bumping this is the only thing that re-renders, at ~10Hz.
  const [, setFrame] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let sinceRender = 0;

    const loop = (now: number) => {
      const dt = Math.min(MAX_FRAME_DT_MS, now - last);
      last = now;

      tick(stateRef.current, dt);

      sinceRender += dt;
      if (sinceRender >= RENDER_INTERVAL_MS) {
        sinceRender = 0;
        setFrame((f) => f + 1);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const state = stateRef.current;

  return (
    <div className="min-h-full">
      <Header bank={state.bank} pointsPerMin={pointsPerMinute(state)} />
      <main className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4">
        {state.teams.map((team) => (
          <TeamCard key={team.id} team={team} elapsed={state.elapsed} />
        ))}
        <p className="px-1 pt-2 text-xs leading-relaxed text-neutral-600">
          Step 1: one hardcoded Tier 1 team at rating 1 across the board. It should stall
          constantly and die short of field goal range. Upgrades arrive in step 2.
        </p>
      </main>
    </div>
  );
}
