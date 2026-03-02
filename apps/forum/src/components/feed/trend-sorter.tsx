"use client";

import { Flame, Star, TrendingUp, Clock3 } from "lucide-react";
import { cn } from "@createconomy/ui";
import type { FeedTabType } from "@/types/forum";

const sortItems = [
  { key: "top", label: "Top", Icon: TrendingUp },
  { key: "hot", label: "Hot", Icon: Flame },
  { key: "new", label: "New", Icon: Clock3 },
  { key: "fav", label: "Fav", Icon: Star },
] as const;

interface TrendSorterProps {
  activeTab: FeedTabType;
  onChange: (next: FeedTabType) => void;
}

export function TrendSorter({ activeTab, onChange }: TrendSorterProps) {
  const current = sortItems.some((item) => item.key === activeTab) ? activeTab : "top";
  const activeIndex = Math.max(
    0,
    sortItems.findIndex((item) => item.key === current)
  );

  return (
    <div className="relative rounded-full border border-border/80 bg-card/70 p-1 backdrop-blur-md">
      <div
        className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(25%-0.25rem)] rounded-full bg-primary shadow-[0_8px_24px_rgba(14,165,233,0.28)] transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      <div className="relative z-10 grid grid-cols-4">
        {sortItems.map(({ key, label, Icon }) => {
          const isActive = current === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                "flex h-9 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors duration-200",
                isActive ? "text-black" : "text-foreground/80 hover:text-primary"
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
