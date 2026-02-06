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
 * - Right sidebar: 300px (hidden on mobile, shown on desktop)
 */
export function ForumLayout({ 
  children, 
  leftSidebar, 
  rightSidebar,
  className 
}: ForumLayoutProps) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 py-6', className)}>
      <div className="flex gap-6">
        {/* Left Sidebar - Hidden on mobile/tablet */}
        {leftSidebar && (
          <aside className="hidden lg:block w-[250px] shrink-0">
            <div className="sticky top-24">
              <div className="rounded-lg border border-border bg-card shadow-sm">
                {leftSidebar}
              </div>
            </div>
          </aside>
        )}

        {/* Center Feed - Flexible width */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Sidebar - Hidden on mobile/tablet, shown on desktop */}
        {rightSidebar && (
          <aside className="hidden xl:block w-[300px] shrink-0">
            <div className="sticky top-24">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default ForumLayout;
