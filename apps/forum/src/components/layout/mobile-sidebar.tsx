'use client';

import { cn } from '@/lib/utils';
import { LeftSidebar } from './left-sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MobileSidebar - Slide-in sidebar for mobile devices
 */
export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/50 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close sidebar"
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] transform bg-card shadow-xl transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full overflow-y-auto pt-20">
          <LeftSidebar />
        </div>
      </div>
    </>
  );
}

export default MobileSidebar;
