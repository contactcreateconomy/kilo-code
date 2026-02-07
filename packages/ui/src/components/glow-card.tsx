'use client';

import { type Ref } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * GlowCard — Card with hover glow effect and lift animation.
 *
 * When `hover` is true (default), hovering lifts the card by 2px
 * and applies a subtle glow border + shadow.
 */
export function GlowCard({ className, children, hover = true, ref, ...props }: GlowCardProps) {
  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative rounded-xl border bg-card p-4 transition-all duration-200',
        hover && 'hover:border-primary/50 hover:shadow-glow-sm',
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
