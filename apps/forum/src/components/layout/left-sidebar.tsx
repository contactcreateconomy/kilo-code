'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlowButton } from '@/components/ui/glow-button';
import { CategoryItem } from '@/components/ui/category-item';
import { CampaignCard } from '@/components/widgets/campaign-card';
import { mockCategories, mockPremiumCategories, mockCampaign } from '@/data/mock-data';

/**
 * LeftSidebar - Premium left sidebar with categories and campaign card
 */
export function LeftSidebar() {
  const pathname = usePathname();
  const currentCategory = pathname.startsWith('/c/') ? pathname.split('/')[2] : null;

  return (
    <div className="space-y-6">
      {/* Start Discussion Button */}
      <Link href="/t/new">
        <GlowButton className="w-full" size="lg">
          <span className="mr-2">+</span>
          Start Discussion
        </GlowButton>
      </Link>

      {/* Discover Categories */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Discover
        </h3>
        <nav className="space-y-1">
          {mockCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isActive={currentCategory === category.slug}
            />
          ))}
        </nav>
      </div>

      {/* Premium Categories */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Premium
        </h3>
        <nav className="space-y-1">
          {mockPremiumCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isActive={currentCategory === category.slug}
            />
          ))}
        </nav>
      </div>

      {/* Active Campaign */}
      <CampaignCard campaign={mockCampaign} />
    </div>
  );
}
