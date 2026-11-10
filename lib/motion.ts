import type { Transition, Variants } from 'motion/react';

// Shared motion settings. They follow the CSS tokens in globals.css (--ease, --ease-enter):
// short, calm, no overshoot.
export const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
export const EASE_ENTER: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Sliding highlight behind the active nav item. */
export const SLIDE: Transition = { type: 'spring', bounce: 0, visualDuration: 0.3 };

/** Whole-screen swaps (loading → login → onboarding → dashboard). */
export const screenFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: EASE } },
};

/** Tab content swap. Sections inside then rise in one after another (.fs-tab in globals.css). */
export const tabSwap: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: EASE } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: EASE } },
};

/** Small text that changes in place (district name, facts). */
export const textSwap = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_ENTER } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: EASE } },
};

/** Icon that swaps for another in the same spot (menu ↔ close, sun ↔ moon). */
export const iconSwap = {
  initial: { opacity: 0, rotate: -90, scale: 0.6 },
  animate: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.2, ease: EASE_ENTER } },
  exit: { opacity: 0, rotate: 90, scale: 0.6, transition: { duration: 0.12, ease: EASE } },
};

/** Step-by-step flows: slides in from the direction you're heading. */
export const stepSlide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: EASE_ENTER } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24, transition: { duration: 0.15, ease: EASE } }),
};
