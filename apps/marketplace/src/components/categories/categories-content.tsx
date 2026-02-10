"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Card, Skeleton } from "@createconomy/ui";
import { Layers } from "lucide-react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400";

function CategoriesGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-0">
          <Skeleton className="aspect-[4/3] rounded-t-lg" />
          <Skeleton className="h-16 rounded-b-lg" />
        </div>
      ))}
    </div>
  );
}

export function CategoriesContent() {
  const categoryTree = useQuery(api.functions.categories.listCategories, {});

  if (categoryTree === undefined) {
    return <CategoriesGridSkeleton />;
  }

  // Show only root categories (the tree nodes themselves)
  const rootCategories = categoryTree;

  if (rootCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Layers className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">No categories yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back later for product categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rootCategories.map((category) => (
        <Link
          key={category._id}
          href={`/categories/${category.slug}`}
          className="group"
        >
          <Card className="overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={category.imageUrl ?? PLACEHOLDER_IMAGE}
                alt={category.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-semibold text-white">
                  {category.name}
                </h2>
              </div>
            </div>
            {category.description && (
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
