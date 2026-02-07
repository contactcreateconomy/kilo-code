'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar/navbar';
import { LeftSidebar } from '@/components/layout/left-sidebar';
import { RightSidebar } from '@/components/layout/right-sidebar';
import { DiscussionFeed } from '@/components/feed/discussion-feed';
import { GoogleOneTap } from '@/components/auth/google-one-tap';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { WidgetErrorFallback } from '@/components/ui/widget-error-fallback';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

/**
 * ForumHomePage - Main forum homepage matching reference design
 * Includes Google One Tap sign-in for seamless authentication
 */
export default function ForumHomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="dot-grid-background min-h-screen bg-background font-sans">
      {/* Google One Tap - Only show when not authenticated */}
      {!isAuthenticated && !isLoading && (
        <GoogleOneTap
          onSuccess={() => {
            console.debug('Successfully signed in via Google One Tap');
          }}
          onError={(error) => {
            console.error('Google One Tap error:', error);
          }}
          context="signin"
          autoSelect={false}
        />
      )}

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
              <ErrorBoundary fallback={<WidgetErrorFallback label="Sidebar" />}>
                <LeftSidebar className="rounded-lg border border-border bg-card shadow-sm" />
              </ErrorBoundary>
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
              <ErrorBoundary fallback={<WidgetErrorFallback label="Sidebar" />}>
                <LeftSidebar />
              </ErrorBoundary>
            </div>
          </div>

          {/* Center Feed */}
          <main className="min-w-0 flex-1">
            <ErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    The discussion feed couldn&apos;t load. Please try refreshing the page.
                  </p>
                </div>
              }
            >
              <DiscussionFeed />
            </ErrorBoundary>
          </main>

          {/* Right Sidebar - Desktop & Tablet */}
          <div className="hidden w-[300px] shrink-0 xl:block">
            <div className="sticky top-24">
              <ErrorBoundary fallback={<WidgetErrorFallback label="Sidebar" />}>
                <RightSidebar />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
