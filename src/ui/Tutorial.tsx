import { useEffect, useRef, useState } from 'react';
import { COACH, PixelArt } from './PixelArt';

export interface TutorialStep {
  /** Which part of the UI to ring while this step is up. */
  target: string | null;
  /** Which screen the coach needs you on for this step to make sense. */
  screen: 'home' | 'team' | null;
  title: string;
  body: string;
}

export const TUTORIAL: TutorialStep[] = [
  {
    screen: 'home',
    target: null,
    title: 'HI, COACH!',
    body: 'You run the Detroit Lynx. Your job is fun: help them run down the field and score touchdowns!',
  },
  {
    screen: 'team',
    target: 'field',
    title: 'WATCH THEM RUN',
    body: 'Your team runs to the right all by itself. It never goes backward. Ever!',
  },
  {
    screen: 'team',
    target: 'field',
    title: 'REACH 100 YARDS',
    body: 'When the ball gets to 100 yards, that is a TOUCHDOWN! Then your team starts a brand new run.',
  },
  {
    screen: 'team',
    target: 'bank',
    title: 'YARDS ARE COINS',
    body: 'Every yard your team runs goes in your bank up top. Yards are what you spend on everything.',
  },
  {
    screen: 'team',
    target: 'upgrades',
    title: 'SPEND YOUR YARDS',
    body: 'Tap these to make your team better. SPEED runs faster, POWER gives bigger touchdown bonuses, BIG PLAYS jump you way down the field.',
  },
  {
    screen: 'team',
    target: 'upgrades',
    title: 'EVERY TEAM IS DIFFERENT',
    body: 'The last button is your team special move. Speedsters run fast, Bulldozers score big, Bomb Squads make huge jumps. Every team has its own!',
  },
  {
    screen: 'home',
    target: 'teamsButton',
    title: 'GET MORE TEAMS',
    body: 'Save up yards and buy more teams. All of your teams run at the same time, so more teams means way more yards!',
  },
  {
    screen: 'home',
    target: null,
    title: 'HAVE FUN!',
    body: 'That is the whole game. Watch, score, spend, grow. Your teams keep running even when you close the game. Tap ? if you want me again!',
  },
];

export default function Tutorial({
  step,
  onStep,
  onClose,
  onHeight,
}: {
  step: number;
  onStep: (n: number) => void;
  onClose: () => void;
  /** Reports the panel's rendered height so the page can reserve room for it. */
  onHeight?: (px: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const s = TUTORIAL[step];
  const last = step === TUTORIAL.length - 1;
  const [typed, setTyped] = useState('');

  // Type the coach's line out, arcade-style.
  useEffect(() => {
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setTyped(s.body.slice(0, i));
      if (i >= s.body.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [s.body]);

  // The panel is fixed to the bottom, so the page needs to know how tall it is.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || !onHeight) return;
    const ro = new ResizeObserver(() => onHeight(el.getBoundingClientRect().height));
    ro.observe(el);
    onHeight(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [onHeight]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (last) onClose();
        else onStep(step + 1);
      } else if (e.key === 'ArrowLeft' && step > 0) {
        onStep(step - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, last, onStep, onClose]);

  return (
    /* Pinned to the bottom of the viewport. App reserves exactly this much
       padding under the page so the panel never covers a team card. */
    <div
      ref={boxRef}
      className="no-select fixed inset-x-0 bottom-0 z-40 px-2 pb-2 sm:px-3 sm:pb-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      <div className="px-panel mx-auto flex max-w-3xl gap-2 p-2 sm:gap-3 sm:p-3">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <PixelArt sprite={COACH} className="h-12 w-11 animate-bob sm:h-16 sm:w-14" />
          <span className="label !text-[6px]">COACH</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="led mb-1 text-[9px] text-amber sm:mb-1.5 sm:text-[10px]">
            {s.title}
          </div>
          <p className="min-h-[4.5em] text-[16px] leading-snug text-chalk/90 sm:min-h-[3.6em] sm:text-[17px]">
            {typed}
            <span className="animate-blink">_</span>
          </p>

          <div className="mt-auto flex items-center gap-1.5 pt-2 sm:gap-2">
            <span className="hidden flex-1 gap-1 xs:flex">
              {TUTORIAL.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 border-2 border-ink ${
                    i === step ? 'bg-amber' : i < step ? 'bg-chalk/40' : 'bg-dusk'
                  }`}
                />
              ))}
            </span>
            <span className="led flex-1 text-[8px] text-chalk/35 xs:hidden">
              {step + 1}/{TUTORIAL.length}
            </span>

            {step > 0 && (
              <button className="px-btn !px-2.5 !text-[9px]" onClick={() => onStep(step - 1)}>
                Back
              </button>
            )}
            <button
              className="px-btn px-btn-amber !px-3 !text-[9px]"
              onClick={() => (last ? onClose() : onStep(step + 1))}
            >
              {last ? 'Go' : 'Next'}
            </button>
            {!last && (
              <button className="px-btn !px-2 !text-[8px] text-chalk/60" onClick={onClose}>
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
