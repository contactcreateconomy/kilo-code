'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar/navbar';
import { LeftSidebar } from '@/components/layout/left-sidebar';
import { DiscussionForm } from '@/components/discussion';
import { cn } from '@/lib/utils';

/**
 * NewDiscussionPage - Page for creating a new discussion
 * Features: Left sidebar navigation, discussion form spanning center + right
 */
export default function NewDiscussionPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="dot-grid-background min-h-screen bg-background font-sans">
      {/* Navbar */}
      <Navbar
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Desktop */}
          <div className="hidden w-[250px] shrink-0 lg:block">
            <div className="sticky top-24">
              <LeftSidebar className="rounded-lg border border-border bg-card shadow-sm" />
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          <div
            className={cn(
              'fixed inset-0 z-40 bg-foreground/50 transition-opacity duration-300 lg:hidden',
              isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsMobileMenuOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />

          {/* Mobile Sidebar */}
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-[280px] transform bg-card shadow-xl transition-transform duration-300 ease-out lg:hidden',
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="h-full overflow-y-auto pt-20">
              <LeftSidebar />
            </div>
          </div>

          {/* Main Content - Discussion Form (spans center + right) */}
          <main className="min-w-0 flex-1">
            <DiscussionForm />
          </main>
        </div>
      </div>
    </div>
  );
}
