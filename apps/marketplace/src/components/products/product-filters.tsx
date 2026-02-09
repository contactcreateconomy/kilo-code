"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Label } from "@createconomy/ui";
import { Card, CardContent } from "@createconomy/ui/components/card";
import { Badge } from "@createconomy/ui/components/badge";
import { SlidersHorizontal, X } from "lucide-react";

interface ProductFiltersProps {
  selectedCategory?: string;
  minPrice?: string;
  maxPrice?: string;
}

const categories = [
  { slug: "templates", name: "Templates" },
  { slug: "courses", name: "Courses" },
  { slug: "graphics", name: "Graphics" },
  { slug: "plugins", name: "Plugins" },
  { slug: "fonts", name: "Fonts" },
  { slug: "audio", name: "Audio" },
];

export function ProductFilters({
  selectedCategory,
  minPrice,
  maxPrice,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
  };

  const hasActiveFilters = !!(selectedCategory || minPrice || maxPrice);

  return (
    <Card>
      <CardContent className="p-4 space-y-6">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto px-2 py-1 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() =>
                  updateFilters(
                    "category",
                    selectedCategory === category.slug ? null : category.slug
                  )
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedCategory === category.slug
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {category.name}
                {selectedCategory === category.slug && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                    ✓
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Price Range
          </h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="minPrice" className="sr-only">
                Min Price
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="Min"
                value={minPrice || ""}
                onChange={(e) => updateFilters("minPrice", e.target.value || null)}
              />
            </div>
            <span className="flex items-center text-muted-foreground">–</span>
            <div className="flex-1">
              <Label htmlFor="maxPrice" className="sr-only">
                Max Price
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Max"
                value={maxPrice || ""}
                onChange={(e) => updateFilters("maxPrice", e.target.value || null)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
