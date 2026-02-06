'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/forum';

interface CategoryItemProps {
  category: Category;
  isActive?: boolean;
}

/**
 * CategoryItem - Sidebar category item with hover animation
 */
export function CategoryItem({ category, isActive }: CategoryItemProps) {
  return (
    <Link href={`/c/${category.slug}`}>
      <motion.div
        className={cn(
          'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all',
          'hover:bg-accent group',
          isActive && 'bg-primary/10 border-l-2 border-primary'
        )}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{category.icon}</span>
          <span className={cn(
            'text-sm font-medium',
            isActive ? 'text-primary' : 'text-foreground'
          )}>
            {category.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {category.isPremium && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              🔒 {category.pointsRequired}pts
            </span>
          )}
          {!category.isPremium && category.count > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {category.count}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
