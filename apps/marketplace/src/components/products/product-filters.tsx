"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Label } from "@createconomy/ui";

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

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 font-semibold">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() =>
                updateFilters(
                  "category",
                  selectedCategory === category.slug ? null : category.slug
                )
              }
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedCategory === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 font-semibold">Price Range</h3>
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

      {/* Clear Filters */}
      {(selectedCategory || minPrice || maxPrice) && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      )}
    </div>
  );
}
