import type { HTMLMotionProps, Transition, Variants } from 'motion/react';

/**
 * Unified gentle iOS-inspired motion curves and transitions.
 * Animates only compositor-friendly properties (transform, opacity).
 */
export const UPHONE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const UPHONE_TRANSITION: Transition = {
  duration: 0.22,
  ease: UPHONE_EASE,
};

export const UPHONE_SPRING: Transition = {
  type: 'spring',
  stiffness: 360,
  damping: 32,
  mass: 0.85,
};

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: UPHONE_EASE },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.16, ease: UPHONE_EASE },
  },
};

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: UPHONE_EASE } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: UPHONE_EASE } },
};

export const drawerLeftVariants: Variants = {
  initial: { x: '-100%', opacity: 0.9 },
  animate: {
    x: 0,
    opacity: 1,
    transition: UPHONE_SPRING,
  },
  exit: {
    x: '-100%',
    opacity: 0.9,
    transition: { duration: 0.2, ease: UPHONE_EASE },
  },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: UPHONE_SPRING,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.16, ease: UPHONE_EASE },
  },
};

export const popoverMenuVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.16, ease: UPHONE_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -2,
    transition: { duration: 0.12, ease: UPHONE_EASE },
  },
};

export const toastVariants: Variants = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: UPHONE_SPRING,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: { duration: 0.15, ease: UPHONE_EASE },
  },
};

export const buttonTapFeedback: Pick<HTMLMotionProps<'button'>, 'whileTap' | 'transition'> = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.1, ease: UPHONE_EASE },
};

export const cardInteractiveMotion: Pick<
  HTMLMotionProps<'div'>,
  'whileHover' | 'whileTap' | 'transition'
> = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.99 },
  transition: { duration: 0.16, ease: UPHONE_EASE },
};
