import { useRef } from 'react';

/**
 * Eases a number toward its real value so the display is always *moving*
 * rather than snapping between two states. Yards tick up; spending ticks down.
 *
 * Deliberately driven by render rather than by its own timer: the game loop
 * already re-renders ~16 times a second, which is plenty to read as motion.
 */
export function useTicker(target: number, fraction = 0.25): number {
  const shown = useRef(target);
  const gap = target - shown.current;

  if (gap !== 0) {
    // Always move at least a whole yard, so small gaps still visibly close.
    const step = Math.max(1, Math.abs(gap) * fraction);
    shown.current = Math.abs(gap) <= step ? target : shown.current + Math.sign(gap) * step;
  }

  return shown.current;
}
