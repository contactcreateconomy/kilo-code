import {
  MessageSquare,
  Heart,
  AtSign,
  Users,
  Trophy,
  Pin,
  Lock,
  Shield,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType =
  | 'reply'
  | 'upvote'
  | 'mention'
  | 'follow'
  | 'campaign'
  | 'thread_pin'
  | 'thread_lock'
  | 'mod_action';

interface NotificationIconProps {
  type: NotificationType | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<NotificationType, { icon: LucideIcon; colorClass: string }> = {
  reply: { icon: MessageSquare, colorClass: 'text-primary' },
  upvote: { icon: Heart, colorClass: 'text-destructive' },
  mention: { icon: AtSign, colorClass: 'text-primary' },
  follow: { icon: Users, colorClass: 'text-success' },
  campaign: { icon: Trophy, colorClass: 'text-warning' },
  thread_pin: { icon: Pin, colorClass: 'text-upvote' },
  thread_lock: { icon: Lock, colorClass: 'text-upvote' },
  mod_action: { icon: Shield, colorClass: 'text-upvote' },
};

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

/**
 * NotificationIcon — Renders the appropriate icon + color for a notification type.
 *
 * Uses design token colors (primary, destructive, success, warning, upvote)
 * instead of hardcoded Tailwind named colors.
 */
export function NotificationIcon({ type, size = 'md', className }: NotificationIconProps) {
  const config = iconMap[type as NotificationType] ?? { icon: Bell, colorClass: 'text-muted-foreground' };
  const Icon = config.icon;
  return <Icon className={cn(sizeMap[size], config.colorClass, className)} />;
}
