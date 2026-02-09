"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@createconomy/ui/components/select";
import { ArrowUpDown } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
] as const;

interface ProductSortToolbarProps {
  currentSort?: string;
  resultCount?: number;
}

export function ProductSortToolbar({
  currentSort,
  resultCount,
}: ProductSortToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "newest") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {resultCount !== undefined && (
          <span>
            Showing <strong className="text-foreground">{resultCount}</strong>{" "}
            {resultCount === 1 ? "product" : "products"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select
          value={currentSort || "newest"}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
