'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types/forum';

// Mock notifications - will be replaced with real data
const mockNotifications: Notification[] = [
  { id: '1', title: 'New reply', message: 'Someone replied to your thread', time: '2m ago', read: false, type: 'reply' },
  { id: '2', title: 'Upvote', message: 'Your post received 10 upvotes', time: '1h ago', read: false, type: 'upvote' },
  { id: '3', title: 'Mention', message: 'You were mentioned in a discussion', time: '3h ago', read: true, type: 'mention' },
];

/**
 * NotificationsDropdown - Bell icon with badge and animated dropdown
 */
export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-80 bg-card border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors',
                        !notification.read && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        )}
                        <div className={cn('flex-1', notification.read && 'ml-5')}>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 border-t bg-muted/30">
                <button className="w-full text-sm text-primary hover:underline">
                  View all notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
