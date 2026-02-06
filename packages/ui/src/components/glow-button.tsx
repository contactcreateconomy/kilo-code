'use client';

import { type Ref } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * GlowButton — Button with glow effect on hover.
 *
 * Three variants (primary / secondary / ghost) and three sizes (sm / md / lg).
 * The `glow` prop (default: true) adds a box-shadow glow on primary buttons.
 *
 * Requires `--glow-color` and `--glow-color-strong` CSS custom properties
 * (provided by the shared globals.css) and `shadow-glow` / `shadow-glow-strong`
 * Tailwind utilities (provided by the shared tailwind config).
 */
export function GlowButton({
  className,
  variant = 'primary',
  size = 'md',
  glow = true,
  children,
  ref,
  ...props
}: GlowButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        glow && variant === 'primary' && 'shadow-glow hover:shadow-glow-strong',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
