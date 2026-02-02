"use client";

import { useState } from "react";
import { Plus, Activity, Code, Palette, Rocket, Brain, Gamepad2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = [
  { id: 1, name: "Programming", icon: Code, count: 1234, color: "bg-blue-500" },
  { id: 2, name: "Design", icon: Palette, count: 856, color: "bg-pink-500" },
  { id: 3, name: "Startups", icon: Rocket, count: 432, color: "bg-orange-500" },
  { id: 4, name: "AI & ML", icon: Brain, count: 2156, color: "bg-violet-500" },
  { id: 5, name: "Gaming", icon: Gamepad2, count: 678, color: "bg-green-500" },
  { id: 6, name: "Learning", icon: BookOpen, count: 345, color: "bg-cyan-500" },
];

interface LeftSidebarProps {
  className?: string;
}

export function LeftSidebar({ className }: LeftSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  return (
    <aside className={cn("flex flex-col gap-4 p-4", className)}>
      {/* New Discussion Button */}
      <Button
        className="group w-full gap-2 bg-primary font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
      >
        <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
        New Discussion
      </Button>

      {/* Categories */}
      <div className="mt-2">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            const isHovered = hoveredCategory === category.id;
            
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                    category.color,
                    isSelected || isHovered ? "scale-110 shadow-md" : ""
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1 text-sm font-medium">{category.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {category.count.toLocaleString()}
                </span>
                
                {/* Selection indicator */}
                <div
                  className={cn(
                    "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300",
                    isSelected ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* My Activity */}
      <div className="mt-auto border-t border-border pt-4">
        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 hover:bg-accent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-foreground">My Activity</span>
        </button>
      </div>
    </aside>
  );
}
