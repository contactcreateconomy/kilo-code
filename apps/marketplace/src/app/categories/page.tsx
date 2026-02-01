import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@createconomy/ui";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse all product categories on Createconomy. Find templates, courses, graphics, plugins, and more.",
};

// Mock categories data - replace with Convex query
const categories = [
  {
    id: "1",
    slug: "templates",
    name: "Templates",
    description: "Website templates, landing pages, and UI kits",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400",
    productCount: 1250,
  },
  {
    id: "2",
    slug: "courses",
    name: "Courses",
    description: "Online courses and educational content",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    productCount: 890,
  },
  {
    id: "3",
    slug: "graphics",
    name: "Graphics",
    description: "Icons, illustrations, and design assets",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    productCount: 2100,
  },
  {
    id: "4",
    slug: "plugins",
    name: "Plugins",
    description: "WordPress, Figma, and other plugins",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    productCount: 560,
  },
  {
    id: "5",
    slug: "fonts",
    name: "Fonts",
    description: "Typography and font families",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
    productCount: 340,
  },
  {
    id: "6",
    slug: "audio",
    name: "Audio",
    description: "Music, sound effects, and audio assets",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400",
    productCount: 780,
  },
  {
    id: "7",
    slug: "video",
    name: "Video",
    description: "Stock footage, motion graphics, and video templates",
    image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400",
    productCount: 450,
  },
  {
    id: "8",
    slug: "ebooks",
    name: "E-books",
    description: "Digital books and guides",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    productCount: 620,
  },
];

export default function CategoriesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse products by category
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group"
          >
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-semibold text-white">
                    {category.name}
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    {category.productCount.toLocaleString()} products
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
