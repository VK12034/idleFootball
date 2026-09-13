import { useCallback, useEffect, useRef, useState } from 'react';
import { buyUpgrade, unlockCost } from '../game/economy';
import { teamFromConfig } from '../game/generate';
import { load, save } from '../game/save';
import { tick, yardsPerMinute } from '../game/tick';
import type { GameState, UpgradeId } from '../game/types';
import Header from './Header';
import MainMenu from './MainMenu';
import { fmt } from './format';
import { CROWD, FOOTBALL, PixelArt } from './PixelArt';
import TeamCard from './TeamCard';
import TeamsPanel from './TeamsPanel';
import Tutorial, { TUTORIAL } from './Tutorial';
import UpgradePanel from './UpgradePanel';

/** How often the rAF loop is allowed to push a render. */
const RENDER_INTERVAL_MS = 100;
/** Clamp a single frame's dt so a background tab does not fire a huge jump. */
const MAX_FRAME_DT_MS = 250;

const TUTORIAL_SEEN_KEY = 'gridiron.tutorialSeen';

type View =
  | { name: 'home' }
  | { name: 'teams' }
  | { name: 'upgrades' }
  | { name: 'team'; id: string };

function fmtDuration(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'a moment';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  const h = `${hours} hour${hours === 1 ? '' : 's'}`;
  return rest === 0 ? h : `${h} ${rest} min`;
}

/** Decorative pixel crowd so the page reads like a stadium. */
function Stands() {
  return (
    <div className="mt-1 select-none" aria-hidden="true">
      <div className="scanlines relative overflow-hidden border-[3px] border-ink bg-deep">
        <PixelArt sprite={CROWD} stretch className="block h-12 w-full opacity-80 sm:h-16" />
      </div>
      <div className="h-3 border-x-[3px] border-b-[3px] border-ink bg-dusk" />
    </div>
  );
}

export default function App() {
  // Load once, fast-forwarding whatever time passed while the game was closed.
  const loadedRef = useRef<ReturnType<typeof load> | null>(null);
  if (loadedRef.current === null) loadedRef.current = load();

  // The authoritative state lives in a ref and is mutated by the loop.
  const stateRef = useRef<GameState>(loadedRef.current.state);
  const [welcomeBack, setWelcomeBack] = useState(
    loadedRef.current.offlineYards >= 1 ? loadedRef.current : null,
  );
  // Bumping this is the only thing that re-renders, at ~10Hz.
  const [, setFrame] = useState(0);
  const forceRender = useCallback(() => setFrame((f) => f + 1), []);

  const [view, setView] = useState<View>({ name: 'home' });

  const [tutHeight, setTutHeight] = useState(0);
  const handleTutHeight = useCallback((px: number) => setTutHeight(px), []);

  const [tutStep, setTutStep] = useState<number | null>(() => {
    try {
      return localStorage.getItem(TUTORIAL_SEEN_KEY) ? null : 0;
    } catch {
      return 0;
    }
  });

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

  // Persist every 10 seconds and whenever the page goes away.
  useEffect(() => {
    const id = setInterval(() => save(stateRef.current), 10_000);
    const flush = () => save(stateRef.current);
    window.addEventListener('beforeunload', flush);
    // iOS never fires beforeunload reliably; this one does.
    document.addEventListener('visibilitychange', flush);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', flush);
      save(stateRef.current);
    };
  }, []);

  const state = stateRef.current;
  const step = tutStep === null ? null : TUTORIAL[tutStep];
  const highlight = step?.target ?? null;

  // The coach points at parts of the screen, so put the player where he is looking.
  useEffect(() => {
    if (!step) return;
    if (step.screen === 'team') {
      const first = stateRef.current.teams[0];
      if (first) {
        setView((v) => (v.name === 'team' && v.id === first.id ? v : { name: 'team', id: first.id }));
      }
    } else if (step.screen === 'home') {
      setView((v) => (v.name === 'home' ? v : { name: 'home' }));
    }
  }, [step]);

  const closeTutorial = () => {
    setTutStep(null);
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
    } catch {
      /* private mode, no harm */
    }
  };

  const handleBuy = useCallback(
    (teamId: string, id: UpgradeId) => {
      buyUpgrade(stateRef.current, teamId, id);
      forceRender();
    },
    [forceRender],
  );

  const handleBuyTeam = useCallback(
    (id: string) => {
      const s = stateRef.current;
      if (s.teams.some((t) => t.id === id)) return;
      const cost = unlockCost(s.teams.length);
      if (s.bank < cost) return;
      s.bank -= cost;
      s.teams.push(teamFromConfig(id));
      forceRender();
    },
    [forceRender],
  );

  const openTeam = (id: string) => setView({ name: 'team', id });

  const activeTeam =
    view.name === 'team' ? state.teams.find((t) => t.id === view.id) ?? null : null;

  const title =
    view.name === 'home'
      ? null
      : view.name === 'teams'
        ? 'TEAMS'
        : view.name === 'upgrades'
          ? 'UPGRADES'
          : activeTeam?.name ?? 'TEAM';

  const goBack = () => setView(view.name === 'team' ? { name: 'teams' } : { name: 'home' });

  return (
    <div className="min-h-full">
      <Header
        bank={state.bank}
        yardsPerMin={yardsPerMinute(state)}
        onHelp={() => setTutStep(0)}
        onBack={view.name === 'home' ? undefined : goBack}
        title={title}
        highlight={highlight}
      />

      <main
        className="mx-auto flex max-w-3xl flex-col gap-2 px-2 py-2 sm:gap-3 sm:px-3 sm:py-3"
        style={{ paddingBottom: tutStep === null ? 24 : tutHeight + 16 }}
      >
        {welcomeBack && (
          <button
            className="px-panel flex items-center gap-3 p-3 text-left"
            onClick={() => setWelcomeBack(null)}
          >
            <PixelArt sprite={FOOTBALL} className="h-7 w-10 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="led block text-[10px] text-amber">WELCOME BACK!</span>
              <span className="block text-[14px] leading-tight text-chalk/70">
                Your teams ran for {fmtDuration(welcomeBack.offlineMs)} and made{' '}
                <span className="text-amber">{fmt(welcomeBack.offlineYards)} yards</span>.
              </span>
            </span>
            <span className="led shrink-0 text-[9px] text-chalk/40">OK</span>
          </button>
        )}

        {view.name === 'home' && (
          <MainMenu
            state={state}
            onOpenTeams={() => setView({ name: 'teams' })}
            onOpenUpgrades={() => setView({ name: 'upgrades' })}
            onOpenTeam={openTeam}
            highlight={highlight}
          />
        )}

        {view.name === 'teams' && (
          <TeamsPanel state={state} onOpenTeam={openTeam} onBuyTeam={handleBuyTeam} />
        )}

        {view.name === 'upgrades' &&
          state.teams.map((t) => (
            <div key={t.id} className="flex flex-col gap-1">
              <div className="led px-1 text-[10px] text-chalk">{t.name.toUpperCase()}</div>
              <UpgradePanel team={t} bank={state.bank} onBuy={handleBuy} />
            </div>
          ))}

        {view.name === 'team' &&
          (activeTeam ? (
            <TeamCard
              team={activeTeam}
              elapsed={state.elapsed}
              bank={state.bank}
              onBuy={handleBuy}
              highlight={highlight}
            />
          ) : (
            <div className="px-panel p-4 text-[16px] text-chalk/70">
              You do not own that team yet.
            </div>
          ))}

        <Stands />
      </main>

      {tutStep !== null && (
        <Tutorial
          step={tutStep}
          onStep={setTutStep}
          onClose={closeTutorial}
          onHeight={handleTutHeight}
        />
      )}
    </div>
  );
}
