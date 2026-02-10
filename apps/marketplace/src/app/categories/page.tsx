import type { Metadata } from "next";
import { CategoriesContent } from "@/components/categories/categories-content";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse all product categories on Createconomy. Find templates, courses, graphics, plugins, and more.",
};

export default function CategoriesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse products by category
        </p>
      </div>

      <CategoriesContent />
    </div>
  );
}
