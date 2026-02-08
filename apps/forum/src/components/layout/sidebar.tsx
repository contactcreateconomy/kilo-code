'use client';

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/use-forum";
import { useCommunityStats } from "@/hooks/use-community-stats";
import { PopularTagsWidget } from "@/components/tags";

interface SidebarProps {
  currentCategory?: string;
}

/**
 * Sidebar - Secondary sidebar with categories and community stats
 *
 * Fetches categories from Convex via useCategories hook.
 * Displays live community stats from useCommunityStats hook.
 */
export function Sidebar({ currentCategory }: SidebarProps) {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { stats, isLoading: statsLoading } = useCommunityStats();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Categories Section */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Categories</h2>
            <Link
              href="/c"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <nav className="space-y-1">
            {categoriesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No categories yet
              </p>
            ) : (
              categories.map((category: { _id: string; slug: string; icon?: string; name: string }) => (
                <Link
                  key={category._id}
                  href={`/c/${category.slug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    currentCategory === category.slug
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <span>{category.icon ?? "💬"}</span>
                  <span className="truncate">{category.name}</span>
                </Link>
              ))
            )}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-lg border p-4">
          <h2 className="font-semibold text-sm mb-4">Community Stats</h2>
          {statsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium">{stats?.members ?? "--"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Threads</span>
                <span className="font-medium">{stats?.discussions ?? "--"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posts</span>
                <span className="font-medium">{stats?.comments ?? "--"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-lg border p-4">
          <h2 className="font-semibold text-sm mb-4">Quick Links</h2>
          <nav className="space-y-2">
            <Link
              href="/t/new"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>➕</span>
              <span>New Thread</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>🔍</span>
              <span>Search</span>
            </Link>
            <Link
              href="/guidelines"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>📜</span>
              <span>Guidelines</span>
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>❓</span>
              <span>FAQ</span>
            </Link>
          </nav>
        </div>

        {/* Popular Tags — live from database */}
        <PopularTagsWidget limit={12} />
      </div>
    </aside>
  );
}
