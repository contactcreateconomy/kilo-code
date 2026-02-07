'use client';

import { useState, createContext, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedSearch } from './animated-search';
import { ThemeToggle } from './theme-toggle';
import { NotificationsDropdown } from './notifications-dropdown';
import { ProfileDropdown } from './profile-dropdown';

// Context for mobile nav state
interface MobileNavContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextType | null>(null);

export function useMobileNav() {
  const context = use(MobileNavContext);
  if (!context) {
    // Return a default value if not within provider
    return { isOpen: false, setIsOpen: () => {} };
  }
  return context;
}

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
}

/**
 * GlassmorphismNavbar - Premium navbar with glass effect
 * Features: Logo, animated search, theme toggle, notifications, profile
 */
export function GlassmorphismNavbar() {
  const { setIsOpen } = useMobileNav();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-border/50" />
      
      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="relative container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">💬</span>
            </motion.div>
            <span className="font-bold text-lg hidden sm:inline-block">
              Createconomy
            </span>
          </Link>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <AnimatedSearch />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationsDropdown />
            <ProfileDropdown />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
