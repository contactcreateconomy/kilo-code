export const colors = {
  light: {
    background: 'oklch(0.985 0.002 285)',
    foreground: 'oklch(0.145 0.015 285)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.145 0.015 285)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.145 0.015 285)',
    primary: 'oklch(0.585 0.233 264)', // Indigo — the brand color
    primaryForeground: 'oklch(1 0 0)',
    secondary: 'oklch(0.965 0.015 285)',
    secondaryForeground: 'oklch(0.25 0.02 285)',
    muted: 'oklch(0.955 0.01 285)',
    mutedForeground: 'oklch(0.5 0.02 285)',
    accent: 'oklch(0.92 0.04 285)',
    accentForeground: 'oklch(0.25 0.02 285)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(1 0 0)',
    border: 'oklch(0.91 0.015 285)',
    input: 'oklch(0.91 0.015 285)',
    ring: 'oklch(0.585 0.233 264)',
    // Chart colors
    chart1: 'oklch(0.585 0.233 264)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    // Sidebar
    sidebar: 'oklch(1 0 0)',
    sidebarForeground: 'oklch(0.145 0.015 285)',
    sidebarPrimary: 'oklch(0.585 0.233 264)',
    sidebarPrimaryForeground: 'oklch(1 0 0)',
    sidebarAccent: 'oklch(0.955 0.02 285)',
    sidebarAccentForeground: 'oklch(0.25 0.02 285)',
    sidebarBorder: 'oklch(0.91 0.015 285)',
    sidebarRing: 'oklch(0.585 0.233 264)',
  },
  dark: {
    background: 'oklch(0.145 0.01 285)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.18 0.01 285)',
    cardForeground: 'oklch(0.985 0 0)',
    popover: 'oklch(0.18 0.01 285)',
    popoverForeground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.585 0.233 264)', // Same indigo in dark mode
    primaryForeground: 'oklch(1 0 0)',
    secondary: 'oklch(0.269 0.01 285)',
    secondaryForeground: 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0.01 285)',
    mutedForeground: 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0.02 285)',
    accentForeground: 'oklch(0.985 0 0)',
    destructive: 'oklch(0.396 0.141 25.723)',
    destructiveForeground: 'oklch(0.985 0 0)',
    border: 'oklch(0.3 0.015 285)',
    input: 'oklch(0.3 0.015 285)',
    ring: 'oklch(0.585 0.233 264)',
    // Chart colors
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    // Sidebar
    sidebar: 'oklch(0.205 0 0)',
    sidebarForeground: 'oklch(0.985 0 0)',
    sidebarPrimary: 'oklch(0.488 0.243 264.376)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.269 0 0)',
    sidebarAccentForeground: 'oklch(0.985 0 0)',
    sidebarBorder: 'oklch(0.269 0 0)',
    sidebarRing: 'oklch(0.439 0 0)',
  },
  // Semantic colors (fixed, not theme-dependent)
  semantic: {
    success: '#22c55e', // green-500 (activity dot)
    successLight: 'rgba(34, 197, 94, 0.1)',
    warning: '#f59e0b',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    error: '#ef4444',
    errorLight: 'rgba(239, 68, 68, 0.1)',
    info: 'oklch(0.585 0.233 264)', // same as primary
    infoLight: 'rgba(99, 102, 241, 0.1)',
  },
  // Category badge colors (from forum discussion-card)
  category: {
    programming: {
      bg: 'bg-blue-500',
      text: 'text-white',
      hover: 'hover:bg-blue-600',
    },
    design: {
      bg: 'bg-pink-500',
      text: 'text-white',
      hover: 'hover:bg-pink-600',
    },
    startups: {
      bg: 'bg-orange-500',
      text: 'text-white',
      hover: 'hover:bg-orange-600',
    },
    aiMl: {
      bg: 'bg-violet-500',
      text: 'text-white',
      hover: 'hover:bg-violet-600',
    },
    gaming: {
      bg: 'bg-green-500',
      text: 'text-white',
      hover: 'hover:bg-green-600',
    },
    learning: {
      bg: 'bg-cyan-500',
      text: 'text-white',
      hover: 'hover:bg-cyan-600',
    },
  },
  // Glow effect colors (from forum glow system)
  glow: {
    color: 'rgba(99, 102, 241, 0.3)', // primary with 0.3 alpha
    colorStrong: 'rgba(99, 102, 241, 0.5)', // primary with 0.5 alpha
    dotLight: 'rgba(99, 102, 241, 0.15)', // dot grid light mode
    dotDark: 'rgba(99, 102, 241, 0.1)', // dot grid dark mode
    hoverGlow: 'rgba(99, 102, 241, 0.06)', // card hover glow
  },
} as const;
