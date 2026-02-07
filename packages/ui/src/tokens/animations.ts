export const transitions = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
  slower: '0.5s',
  easing: {
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
} as const;

export const staggerDelays = [
  50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
] as const;
