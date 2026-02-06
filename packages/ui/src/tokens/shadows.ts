export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // shadow-sm (Card)
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', // shadow-md (hover cards)
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', // shadow-lg (dropdowns, notifications)
  glow: '0 0 20px var(--glow-color)', // Custom glow
  glowStrong: '0 0 30px var(--glow-color-strong)', // Strong glow
  glowSm: '0 0 10px var(--glow-color)', // Subtle glow (search, sign-in button)
} as const;

export const glowVars = {
  '--glow-color': 'rgba(99, 102, 241, 0.3)',
  '--glow-color-strong': 'rgba(99, 102, 241, 0.5)',
} as const;
