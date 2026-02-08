import Link from "next/link";
import Image from "next/image";
import { Button, Card, CardContent } from "@createconomy/ui";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Discover Premium{" "}
              <span className="text-primary">Digital Products</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              The marketplace for creators. Find templates, courses, graphics,
              and more from talented creators worldwide.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signin">Start Selling</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Browse by Category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find exactly what you need from our curated categories
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
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
                      <h3 className="text-lg font-semibold text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-white/80">
                        {category.productCount} products
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Featured Products
              </h2>
              <p className="mt-2 text-muted-foreground">
                Hand-picked products from our best creators
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/products?featured=true">View All</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="line-clamp-1 font-semibold group-hover:text-primary">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      by {product.seller}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 text-sm">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-2 text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Start Selling?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join thousands of creators earning money from their digital
              products. No upfront costs, just create and sell.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-8"
            >
              <Link href="/auth/signin">Create Your Store</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Mock data
const categories = [
  {
    slug: "templates",
    name: "Templates",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400",
    productCount: 1250,
  },
  {
    slug: "courses",
    name: "Courses",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    productCount: 890,
  },
  {
    slug: "graphics",
    name: "Graphics",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    productCount: 2100,
  },
  {
    slug: "plugins",
    name: "Plugins",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    productCount: 560,
  },
];

const featuredProducts = [
  {
    slug: "premium-website-template",
    name: "Premium Website Template",
    seller: "Creative Studio",
    price: 49.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
  },
  {
    slug: "complete-react-course",
    name: "Complete React Course",
    seller: "Code Academy",
    price: 79.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
  },
  {
    slug: "icon-pack-pro",
    name: "Icon Pack Pro",
    seller: "Design Hub",
    price: 29.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
  },
  {
    slug: "ui-component-library",
    name: "UI Component Library",
    seller: "UI Masters",
    price: 99.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400",
  },
];

const stats = [
  { value: "50K+", label: "Products" },
  { value: "10K+", label: "Creators" },
  { value: "500K+", label: "Customers" },
  { value: "$10M+", label: "Paid to Creators" },
];

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
