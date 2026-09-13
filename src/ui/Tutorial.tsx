import { useEffect, useState } from 'react';
import { COACH, PixelArt } from './PixelArt';

export interface TutorialStep {
  /** Which part of the UI to ring while this step is up. */
  target: string | null;
  /** Which screen the coach needs you on for this step to make sense. */
  screen: 'home' | 'team' | null;
  body: string;
}

export const TUTORIAL: TutorialStep[] = [
  {
    screen: 'home',
    target: 'live',
    body: 'hi coach! you run the detroit lynx. help them run down the field.',
  },
  {
    screen: 'team',
    target: 'field',
    body: 'your team runs to the right all by itself. watch the yards fly off it.',
  },
  {
    screen: 'team',
    target: 'field',
    body: 'get all the way to 100 and that is a TOUCHDOWN. big bonus!',
  },
  {
    screen: 'team',
    target: 'field',
    body: 'sometimes a drive gets stopped. you keep every yard you ran - you only miss the bonus.',
  },
  {
    screen: 'team',
    target: 'bank',
    body: 'see? the bank never goes down on its own. yards you earn are yours.',
  },
  {
    screen: 'team',
    target: 'upgrades',
    body: 'GRIT means fewer stops. buy it when a drive dies at the 3 and it will sting less.',
  },
  {
    screen: 'home',
    target: 'goal',
    body: 'this bar is the next thing you can afford. there is always one waiting.',
  },
  {
    screen: 'home',
    target: 'teamsButton',
    body: "buy a second team and both run at the same time. that's the big one!",
  },
  {
    screen: 'home',
    target: 'draftButton',
    body: 'the draft is a gamble. mostly ordinary players, but elites are out there.',
  },
  {
    screen: 'home',
    target: 'seasonButton',
    body: 'draft capital grows the whole time. start a new season to keep it forever.',
  },
];

/**
 * The coach, sitting at the bottom of whatever screen you are on. He points at
 * one thing at a time and you tap OK to move him along.
 */
export default function Tutorial({
  step,
  onStep,
  onClose,
}: {
  step: number;
  onStep: (n: number) => void;
  onClose: () => void;
}) {
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

  const next = () => (last ? onClose() : onStep(step + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' && step > 0) {
        onStep(step - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      className="no-select sticky bottom-0 z-30 mt-4 flex items-start gap-2.5 border-[5px] border-night bg-ink p-2.5"
      style={{ boxShadow: '0 6px 0 0 rgba(0,0,0,.3)' }}
    >
      <PixelArt sprite={COACH} className="animate-bobslow h-11 w-9 shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="text-[17px] leading-tight text-white">
          COACH: {typed}
          <span className="animate-blink">_</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[15px] text-[#9fd4ff]">
          <span>
            {step + 1}/{TUTORIAL.length}
          </span>
          {!last && (
            <button onClick={onClose} className="text-[#9fd4ff] underline">
              SKIP
            </button>
          )}
        </div>
      </div>

      <button
        onClick={next}
        className="pix min-h-[44px] shrink-0 border-4 border-night bg-lime px-2 py-1.5 text-[9px] text-ink"
      >
        OK
      </button>
    </div>
  );
}
