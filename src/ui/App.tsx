import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BALANCE } from '../config/balance';
import { buyUpgrade, nextGoal, unlockCost, type Goal } from '../game/economy';
import { draftPlayer } from '../game/draft';
import { teamFromConfig } from '../game/generate';
import { pendingCapital, startNewSeason } from '../game/prestige';
import { getMods, leagueOf } from '../game/ratings';
import { load, save, type OfflineReport as Report } from '../game/save';
import { tick, yardsPerMinute } from '../game/tick';
import type { GameState, Player, UpgradeId } from '../game/types';
import BottomNav, { type TabId } from './BottomNav';
import DraftPanel from './DraftPanel';
import Header from './Header';
import MainMenu from './MainMenu';
import OfflineReport from './OfflineReport';
import SeasonPanel from './SeasonPanel';
import Sky from './Sky';
import TeamCard from './TeamCard';
import TeamsPanel from './TeamsPanel';
import Tutorial, { TUTORIAL } from './Tutorial';

/**
 * How often the rAF loop is allowed to push a render. Fast enough that the
 * bank counter reads as a counter rather than a slideshow.
 */
const RENDER_INTERVAL_MS = 60;
/** Clamp a single frame's dt so a background tab does not fire a huge jump. */
const MAX_FRAME_DT_MS = 250;

const TUTORIAL_SEEN_KEY = 'gridiron.tutorialSeen';

type View = TabId | 'draft' | 'season';

export default function App() {
  // Load once, fast-forwarding whatever time passed while the game was closed.
  const loadedRef = useRef<ReturnType<typeof load> | null>(null);
  if (loadedRef.current === null) loadedRef.current = load();

  // The authoritative state lives in a ref and is mutated by the loop.
  const stateRef = useRef<GameState>(loadedRef.current.state);
  const [report, setReport] = useState<Report | null>(loadedRef.current.offline);
  // Bumping this is the only thing that re-renders, at ~16Hz.
  const [, setFrame] = useState(0);
  const forceRender = useCallback(() => setFrame((f) => f + 1), []);

  const [view, setView] = useState<View>('home');
  /** Which team the FIELD tab shows. Follows whatever you last opened. */
  const [selected, setSelected] = useState(() => stateRef.current.teams[0]?.id ?? '');

  // The scrolling body is its own element, so screen changes have to reset it.
  const bodyRef = useRef<HTMLDivElement | null>(null);

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

  // Roster size and capital are the only inputs, and both change rarely.
  const league = useMemo(() => leagueOf(state), [state.roster.length, state.capital]);

  // Yards per second across the whole league, behind every "how long until
  // I can afford this" readout on screen.
  const rate = state.teams.reduce((a, t) => a + getMods(t, league).effectiveYardsPerSecond, 0);
  const goal = nextGoal(state, rate);

  // The whole screen goes bright when anyone scores.
  const lastScore = state.teams.reduce((a, t) => Math.max(a, t.touchdownAt), -1e9);
  const flashing = state.elapsed - lastScore <= BALANCE.ui.screenFlashMs;

  // The coach points at parts of the screen, so put the player where he is looking.
  useEffect(() => {
    if (!step?.screen) return;
    setView(step.screen);
  }, [step]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [view, selected]);

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

  const handleBuyTeam = useCallback((id: string) => {
    const s = stateRef.current;
    if (s.teams.some((t) => t.id === id)) return;
    const cost = unlockCost(s.teams.length);
    if (s.bank < cost) return;
    s.bank -= cost;
    s.teams.push(teamFromConfig(id));
    // Drop straight onto the new team's field, the way buying one should feel.
    setSelected(id);
    setView('team');
  }, []);

  const handleDraft = useCallback((): Player | null => {
    const player = draftPlayer(stateRef.current);
    forceRender();
    return player;
  }, [forceRender]);

  const handleNewSeason = useCallback(() => {
    const s = stateRef.current;
    if (!startNewSeason(s)) return;
    setSelected(s.teams[0]?.id ?? '');
    setView('home');
  }, []);

  const openTeam = (id: string) => {
    setSelected(id);
    setView('team');
  };

  const activeTeam = state.teams.find((t) => t.id === selected) ?? state.teams[0] ?? null;

  /** Tapping the next-goal card takes you to wherever you would buy it. */
  const goToGoal = (g: Goal) => {
    if (g.kind === 'team') setView('teams');
    else if (g.kind === 'draft') setView('draft');
    else if (g.teamId) openTeam(g.teamId);
  };

  // The draft and season screens are reached from home, so HOME stays lit.
  const tab: TabId = view === 'draft' || view === 'season' ? 'home' : view;

  return (
    <div className="phone">
      <div className="screen">
        {view === 'home' && <Sky />}

        <div className="relative z-10 flex h-full flex-col">
          <Header
            bank={state.bank}
            yardsPerMin={yardsPerMinute(state)}
            owned={state.teams.length}
            capital={state.capital}
            pending={pendingCapital(state)}
            scoring={flashing}
            onHelp={() => setTutStep(0)}
            onTeams={() => setView('teams')}
            onSeason={() => setView('season')}
            highlight={highlight}
          />

          <div ref={bodyRef} className="screen-body px-3 pb-4 pt-3.5">
            {view === 'home' && (
              <MainMenu
                state={state}
                league={league}
                elapsed={state.elapsed}
                goal={goal}
                rate={rate}
                onOpenTeams={() => setView('teams')}
                onOpenUpgrades={() => setView('team')}
                onOpenTeam={openTeam}
                onOpenDraft={() => setView('draft')}
                onOpenSeason={() => setView('season')}
                onGoal={goToGoal}
                highlight={highlight}
              />
            )}

            {view === 'teams' && (
              <TeamsPanel
                state={state}
                onOpenTeam={openTeam}
                onBuyTeam={handleBuyTeam}
                onBack={() => setView('home')}
              />
            )}

            {view === 'team' &&
              (activeTeam ? (
                <TeamCard
                  team={activeTeam}
                  elapsed={state.elapsed}
                  bank={state.bank}
                  league={league}
                  rate={rate}
                  onBuy={handleBuy}
                  onBack={() => setView('home')}
                  highlight={highlight}
                />
              ) : (
                <div className="card">You do not own that team yet.</div>
              ))}

            {view === 'draft' && (
              <DraftPanel state={state} onDraft={handleDraft} onBack={() => setView('home')} />
            )}

            {view === 'season' && (
              <SeasonPanel
                state={state}
                onNewSeason={handleNewSeason}
                onBack={() => setView('home')}
              />
            )}

            {tutStep !== null && (
              <Tutorial step={tutStep} onStep={setTutStep} onClose={closeTutorial} />
            )}
          </div>

          <BottomNav active={tab} onSelect={setView} highlight={highlight} />
        </div>

        {/* the touchdown flash, over everything */}
        {flashing && (
          <div
            key={lastScore}
            className="pointer-events-none absolute inset-0 z-30 bg-[#fff9c4]"
            style={{ animation: `screenFlash ${BALANCE.ui.screenFlashMs}ms steps(5,end) forwards` }}
            aria-hidden="true"
          />
        )}

        {report && <OfflineReport report={report} onCollect={() => setReport(null)} />}
      </div>
    </div>
  );
}
