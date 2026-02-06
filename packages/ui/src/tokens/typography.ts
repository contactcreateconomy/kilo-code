export const typography = {
  fontFamily: {
    sans: "'Inter', 'Inter Fallback', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'JetBrains Mono Fallback', monospace",
  },
  fontSize: {
    xs: '0.75rem', // 12px — timestamps, badges, helper text
    sm: '0.875rem', // 14px — body text, nav items, button text
    base: '1rem', // 16px — large button text
    lg: '1.125rem', // 18px — card titles
    xl: '1.25rem', // 20px — featured card titles, section headings
    '2xl': '1.5rem', // 24px — CardTitle default
  },
  fontWeight: {
    normal: '400',
    medium: '500', // nav items, badges, labels
    semibold: '600', // section headers, sidebar headings
    bold: '700', // card titles, discussion titles
  },
  lineHeight: {
    none: '1', // leading-none (CardTitle)
    tight: '1.25', // tracking-tight
    normal: '1.5', // default body text
  },
  letterSpacing: {
    tight: '-0.025em', // tracking-tight (CardTitle)
    wider: '0.05em', // tracking-wider (section labels)
    widest: '0.1em', // tracking-widest (dropdown shortcuts)
  },
} as const;
