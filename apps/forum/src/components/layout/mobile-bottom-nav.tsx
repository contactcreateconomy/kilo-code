'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', href: '/' },
  { id: 'explore', label: 'Explore', icon: '🔍', href: '/c' },
  { id: 'create', label: 'Create', icon: '✏️', href: '/t/new' },
  { id: 'notifications', label: 'Alerts', icon: '🔔', href: '/account/notifications' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/account' },
];

/**
 * MobileBottomNav - Fixed bottom navigation for mobile devices
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  
  const getActiveId = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/c')) return 'explore';
    if (pathname === '/t/new') return 'create';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.startsWith('/account')) return 'profile';
    return 'home';
  };

  const activeId = getActiveId();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-t" />

      {/* Navigation Items */}
      <div className="relative flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = item.id === activeId;
          const isCreate = item.id === 'create';

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-w-[60px] py-1 rounded-xl transition-colors',
                isCreate && 'min-w-[50px]'
              )}
            >
              {/* Create button special styling */}
              {isCreate ? (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                >
                  <span className="text-xl text-white">{item.icon}</span>
                </motion.div>
              ) : (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: 'spring', duration: 0.3 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.span
                    className={cn(
                      'text-xl relative z-10',
                      isActive ? 'scale-110' : 'scale-100'
                    )}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.span>

                  {/* Label */}
                  <span
                    className={cn(
                      'text-[10px] mt-0.5 relative z-10 transition-colors',
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}

              {/* Notification badge — hidden until notifications system is implemented */}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
