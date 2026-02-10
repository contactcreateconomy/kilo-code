import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@createconomy/ui";
import {
  ShoppingBag,
  Users,
  Shield,
  Zap,
  Globe,
  Heart,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Createconomy — the marketplace for creators to discover and sell premium digital products.",
};

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="container py-12">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Empowering Creators,
          <br />
          <span className="text-primary">One Product at a Time</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Createconomy is a digital marketplace that connects talented creators
          with people who value quality. We believe every creator deserves a
          platform to share their work and earn from their craft.
        </p>
      </div>

      {/* Stats */}
      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4">
        <StatCard value="10K+" label="Creators" />
        <StatCard value="50K+" label="Products" />
        <StatCard value="200K+" label="Customers" />
        <StatCard value="150+" label="Countries" />
      </div>

      {/* Mission */}
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-2xl font-bold">Our Mission</h2>
        <p className="mt-4 text-center text-muted-foreground">
          We&apos;re building the most creator-friendly marketplace on the
          internet. Our mission is to democratize digital commerce by giving
          creators the tools, audience, and infrastructure they need to turn
          their passion into a sustainable business.
        </p>
      </div>

      {/* How It Works */}
      <div className="mt-20">
        <h2 className="text-center text-2xl font-bold">How It Works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              1
            </div>
            <h3 className="mt-4 font-semibold">Create</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Build your digital products — templates, courses, graphics,
              plugins, and more. Upload them to your seller dashboard with rich
              descriptions and previews.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              2
            </div>
            <h3 className="mt-4 font-semibold">Sell</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Set your prices, manage your storefront, and reach thousands of
              potential buyers. We handle payments, delivery, and customer
              support tools.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              3
            </div>
            <h3 className="mt-4 font-semibold">Earn</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get paid directly via Stripe Connect. Track your earnings, manage
              orders, and grow your business with analytics and insights.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mt-20">
        <h2 className="text-center text-2xl font-bold">Our Values</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ValueCard
            icon={Heart}
            title="Creator First"
            description="Every decision we make starts with the question: does this help creators succeed? We're built by creators, for creators."
          />
          <ValueCard
            icon={Shield}
            title="Trust & Safety"
            description="We maintain high quality standards and protect both buyers and sellers with secure payments, reviews, and dispute resolution."
          />
          <ValueCard
            icon={Zap}
            title="Simplicity"
            description="Selling should be easy. We handle the complex infrastructure so creators can focus on what they do best — creating."
          />
          <ValueCard
            icon={Globe}
            title="Global Reach"
            description="Our marketplace is accessible worldwide. Creators from any country can sell to customers anywhere on the planet."
          />
          <ValueCard
            icon={Users}
            title="Community"
            description="We foster a vibrant community through our forum where creators share knowledge, get feedback, and support each other."
          />
          <ValueCard
            icon={ShoppingBag}
            title="Fair Commerce"
            description="Competitive commission rates, transparent pricing, and fair policies that benefit both creators and customers."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-20 max-w-2xl rounded-lg border bg-card p-8 text-center">
        <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
        <p className="mt-2 text-muted-foreground">
          Join thousands of creators and customers on Createconomy.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/products">
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signup">Become a Seller</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
