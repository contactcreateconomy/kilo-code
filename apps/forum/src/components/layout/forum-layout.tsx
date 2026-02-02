'use client';

import { cn } from '@/lib/utils';

interface ForumLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  className?: string;
}

/**
 * ForumLayout - Three-column layout wrapper for the forum
 * - Left sidebar: 250px (hidden on mobile/tablet)
 * - Center feed: flexible width
 * - Right sidebar: 320px (hidden on mobile, shown on desktop)
 */
export function ForumLayout({ 
  children, 
  leftSidebar, 
  rightSidebar,
  className 
}: ForumLayoutProps) {
  return (
    <div className={cn('container mx-auto px-4 py-6', className)}>
      <div className="flex gap-6">
        {/* Left Sidebar - Hidden on mobile/tablet */}
        {leftSidebar && (
          <aside className="hidden lg:block w-[220px] xl:w-[250px] shrink-0">
            <div className="sticky top-20">
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* Center Feed - Flexible width */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Sidebar - Hidden on mobile/tablet, shown on desktop */}
        {rightSidebar && (
          <aside className="hidden xl:block w-[280px] 2xl:w-[320px] shrink-0">
            <div className="sticky top-20">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
