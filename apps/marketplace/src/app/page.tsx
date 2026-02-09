import Link from "next/link";
import Image from "next/image";
import { Button, Badge, Card, CardContent } from "@createconomy/ui";
import {
  Package,
  Users,
  ShieldCheck,
  Store,
  Palette,
  CreditCard,
  Zap,
  Tag,
  Headphones,
  ArrowRight,
  Star,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Section 1: Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/[0.02] to-background py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Discover Digital Products from{" "}
              <span className="text-primary">Independent Creators</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Browse thousands of digital products — templates, courses, tools,
              art, and more — from creators who care about quality.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signup">Start Selling</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
              >
                <Package className="h-4 w-4" />
                10,000+ Products
              </Badge>
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
              >
                <Users className="h-4 w-4" />
                5,000+ Creators
              </Badge>
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                Secure Payments
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Stats Bar */}
      <section className="border-y bg-muted/30 py-12 md:py-16">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat) => (
              <Card key={stat.label} className="border-0 bg-transparent shadow-none">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Trending Now (Featured Products) */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Trending Now
              </h2>
              <p className="mt-2 text-muted-foreground">
                Hand-picked products from our best creators
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/products" className="flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
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
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
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

      {/* Section 4: Why Choose Us (Features Grid) */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Why Choose Createconomy
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to buy and sell digital products
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-start gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: CTA Section */}
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
              <Link href="/auth/signup">Join as a Creator</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const statsData = [
  { icon: Package, value: "10,000+", label: "Products Available" },
  { icon: Users, value: "50,000+", label: "Happy Customers" },
  { icon: Store, value: "5,000+", label: "Creators" },
  { icon: ShieldCheck, value: "100%", label: "Secure Transactions" },
];

const featuredProducts = [
  {
    slug: "premium-website-template",
    name: "Premium Website Template",
    seller: "Creative Studio",
    price: 49.99,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
  },
  {
    slug: "complete-react-course",
    name: "Complete React Course",
    seller: "Code Academy",
    price: 79.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
  },
  {
    slug: "icon-pack-pro",
    name: "Icon Pack Pro",
    seller: "Design Hub",
    price: 29.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
  },
  {
    slug: "ui-component-library",
    name: "UI Component Library",
    seller: "UI Masters",
    price: 99.99,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400",
  },
];

const features = [
  {
    icon: Palette,
    title: "Curated Quality",
    description:
      "Every product is reviewed to ensure high quality standards.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Stripe-powered payments with buyer protection.",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Digital products delivered instantly after purchase.",
  },
  {
    icon: Users,
    title: "Creator Community",
    description:
      "Join a thriving community of independent creators.",
  },
  {
    icon: Tag,
    title: "Fair Pricing",
    description: "Competitive pricing with no hidden fees.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support for buyers and sellers.",
  },
];
