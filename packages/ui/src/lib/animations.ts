/**
 * @createconomy/ui — Shared Animation System
 *
 * Framer Motion variant presets extracted from the forum app's design system.
 * These provide consistent animations across all Createconomy applications.
 *
 * Usage:
 *   import { pageVariants, staggerContainerVariants } from '@createconomy/ui/lib/animations';
 *   <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
 */

import type { Variants } from 'framer-motion';

// ─── Page Transitions ────────────────────────────────────────────────

/** Fade up on enter, fade up on exit */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

// ─── Stagger Animations ──────────────────────────────────────────────

/** Container that staggers its children */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/** Individual stagger child item */
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// ─── Card Interactions ───────────────────────────────────────────────

/** Card hover with subtle scale + lift */
export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
  },
};

/** Glow shadow on hover */
export const glowVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 rgba(99, 102, 241, 0)',
  },
  hover: {
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
    transition: {
      duration: 0.3,
    },
  },
};

// ─── Micro-interactions ──────────────────────────────────────────────

/** Bounce for upvotes / likes */
export const bounceVariants: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.3, 1],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

/** Rotate for theme toggle icons */
export const rotateVariants: Variants = {
  initial: {
    rotate: 0,
    scale: 1,
  },
  animate: {
    rotate: 180,
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

// ─── Directional Slides ──────────────────────────────────────────────

/** Slide from left */
export const slideInLeftVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

/** Slide from right */
export const slideInRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
  },
};

// ─── Fades & Scales ──────────────────────────────────────────────────

/** Simple fade in/out */
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/** Scale from 90% to 100% */
export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.15,
    },
  },
};

// ─── Overlays & Drawers ──────────────────────────────────────────────

/** Dropdown menu animation */
export const dropdownVariants: Variants = {
  initial: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

/** Mobile drawer slide */
export const drawerVariants: Variants = {
  initial: {
    x: '-100%',
  },
  animate: {
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    x: '-100%',
    transition: {
      duration: 0.2,
    },
  },
};

/** Modal / backdrop overlay */
export const overlayVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// ─── Looping Animations ──────────────────────────────────────────────

/** Gentle continuous pulse */
export const pulseVariants: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Shimmer loading effect */
export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};
