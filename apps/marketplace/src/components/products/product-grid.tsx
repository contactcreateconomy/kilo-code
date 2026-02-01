import { ProductCard } from "./product-card";
import type { Product } from "@/types";

interface ProductGridProps {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  minPrice?: number;
  maxPrice?: number;
}

// Mock function to get products - replace with Convex query
async function getProducts(filters: ProductGridProps): Promise<Product[]> {
  // This would be replaced with actual Convex query
  return [
    {
      id: "1",
      slug: "premium-website-template",
      name: "Premium Website Template",
      description: "A beautiful, responsive website template",
      price: 49.99,
      images: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      ],
      category: { id: "1", name: "Templates", slug: "templates" },
      seller: { id: "1", name: "Creative Studio", avatar: "" },
      rating: 4.9,
      reviewCount: 128,
      salesCount: 1250,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      slug: "complete-react-course",
      name: "Complete React Course",
      description: "Learn React from scratch",
      price: 79.99,
      images: [
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      ],
      category: { id: "2", name: "Courses", slug: "courses" },
      seller: { id: "2", name: "Code Academy", avatar: "" },
      rating: 4.8,
      reviewCount: 256,
      salesCount: 2100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      slug: "icon-pack-pro",
      name: "Icon Pack Pro",
      description: "500+ premium icons",
      price: 29.99,
      images: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      ],
      category: { id: "3", name: "Graphics", slug: "graphics" },
      seller: { id: "3", name: "Design Hub", avatar: "" },
      rating: 4.7,
      reviewCount: 89,
      salesCount: 890,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function ProductGrid(props: ProductGridProps) {
  const products = await getProducts(props);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
