'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, Activity, Code, Palette, Rocket, Brain, Gamepad2, BookOpen,
  Newspaper, Star, Scale, List, HelpCircle, Sparkles, GraduationCap,
  Crown, Lock
} from 'lucide-react';
import { cn, Button, Badge, Separator, Card, CardContent } from '@createconomy/ui';
import { mockCategories } from '@/data/mock-data';

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Palette,
  Rocket,
  Brain,
  Gamepad2,
  BookOpen,
  Newspaper,
  Star,
  Scale,
  List,
  HelpCircle,
  Sparkles,
  GraduationCap,
};

// DISCOVER section items
const discoverItems = [
  { icon: Newspaper, label: 'News', slug: 'news', emoji: '📰' },
  { icon: Star, label: 'Review', slug: 'review', emoji: '⭐' },
  { icon: Scale, label: 'Compare', slug: 'compare', emoji: '⚖️' },
  { icon: List, label: 'List', slug: 'list', emoji: '📋' },
  { icon: HelpCircle, label: 'Help', slug: 'help', emoji: '❓' },
  { icon: Sparkles, label: 'Showcase', slug: 'showcase', emoji: '✨' },
  { icon: GraduationCap, label: 'Tutorial', slug: 'tutorial', emoji: '📚' },
  { icon: Scale, label: 'Debate', slug: 'debate', emoji: '💬' },
  { icon: Rocket, label: 'Launch', slug: 'launch', emoji: '🚀' },
];

// PREMIUM section items
const premiumItems = [
  { icon: Crown, label: 'Premium Content', slug: 'premium', locked: false },
  { icon: Lock, label: 'Exclusive Threads', slug: 'exclusive', locked: true },
];

interface LeftSidebarProps {
  className?: string;
}

/**
 * LeftSidebar - Redesigned left sidebar with DISCOVER and PREMIUM sections
 * Features: New Discussion button, DISCOVER categories, PREMIUM section, My Activity
 */
export function LeftSidebar({ className }: LeftSidebarProps) {
  const pathname = usePathname();
  const currentCategory = pathname.startsWith('/c/') ? pathname.split('/')[2] ?? null : null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(currentCategory);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <aside className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Start Discussion Button */}
      <Button asChild className="w-full group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
        <Link href="/t/new" className="flex items-center justify-center gap-2">
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          Start Discussion
        </Link>
      </Button>

      {/* DISCOVER Section */}
      <div className="mt-2">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Discover
        </h3>
        <div className="space-y-1">
          {discoverItems.map((item, index) => {
            const isSelected = selectedCategory === item.slug;
            const isHovered = hoveredCategory === item.slug;

            return (
              <Link
                key={item.slug}
                href={`/c/${item.slug}`}
                onClick={() => setSelectedCategory(item.slug)}
                onMouseEnter={() => setHoveredCategory(item.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200',
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Emoji Icon */}
                <span className={cn(
                  'text-lg transition-transform duration-200',
                  (isSelected || isHovered) && 'scale-110'
                )}>
                  {item.emoji}
                </span>

                {/* Label */}
                <span className="flex-1 text-sm font-medium">{item.label}</span>

                {/* Selection Indicator */}
                <div
                  className={cn(
                    'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300',
                    isSelected ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* PREMIUM Section */}
      <div className="mt-4">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Crown className="h-3 w-3 text-yellow-500" />
          Premium
        </h3>
        <div className="space-y-1">
          {premiumItems.map((item, index) => {
            const IconComponent = item.icon;
            const isSelected = selectedCategory === item.slug;
            const isHovered = hoveredCategory === item.slug;

            return (
              <Link
                key={item.slug}
                href={item.locked ? '#' : `/c/${item.slug}`}
                onClick={(e) => {
                  if (item.locked) {
                    e.preventDefault();
                  } else {
                    setSelectedCategory(item.slug);
                  }
                }}
                onMouseEnter={() => setHoveredCategory(item.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200',
                  item.locked && 'opacity-60 cursor-not-allowed',
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                {/* Icon */}
                <IconComponent className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  item.locked ? 'text-muted-foreground' : 'text-yellow-500',
                  (isSelected || isHovered) && !item.locked && 'scale-110'
                )} />

                {/* Label */}
                <span className="flex-1 text-sm font-medium">{item.label}</span>

                {/* Locked Badge */}
                {item.locked && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Soon
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Campaign Card */}
      <Card className="mt-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏆</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Active Campaign
            </span>
          </div>
          <h4 className="text-sm font-bold mb-1">Win Claude Pro!</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Top contributors win 3 months free
          </p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-[49%] transition-all duration-1000" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            2,450 / 5,000 pts
          </p>
        </CardContent>
      </Card>

      {/* My Activity */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <Button variant="ghost" asChild className="w-full justify-start gap-3">
          <Link href="/account">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">My Activity</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
}

export default LeftSidebar;
