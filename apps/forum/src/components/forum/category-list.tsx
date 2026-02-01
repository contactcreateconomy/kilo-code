import { CategoryCard } from "@/components/forum/category-card";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  threadCount: number;
  postCount: number;
  icon?: string;
  color?: string;
  lastThread?: {
    id: string;
    title: string;
    author: {
      username: string;
    };
    createdAt: Date | string;
  };
}

interface CategoryListProps {
  categories: Category[];
  emptyMessage?: string;
  layout?: "grid" | "list";
}

export function CategoryList({
  categories,
  emptyMessage = "No categories found",
  layout = "list",
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <div className="text-4xl mb-4">📁</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} {...category} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryCard key={category.id} {...category} />
      ))}
    </div>
  );
}
