export const layout = {
  radius: '0.5rem', // --radius base
  radiusSm: 'calc(0.5rem - 4px)', // 4px
  radiusMd: 'calc(0.5rem - 2px)', // 6px
  radiusLg: '0.5rem', // 8px
  radiusXl: 'calc(0.5rem + 4px)', // 12px
  radiusFull: '9999px', // pills, badges, avatars
  container: {
    maxWidth: '1400px', // from shared config
    padding: '2rem',
  },
  forumLayout: {
    maxWidth: '80rem', // max-w-7xl = 1280px
    leftSidebar: '250px',
    rightSidebar: '300px',
    gap: '1.5rem', // gap-6
    stickyTop: '6rem', // top-24
  },
  navbar: {
    height: '4rem', // h-16
    zIndex: 50,
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },
} as const;
