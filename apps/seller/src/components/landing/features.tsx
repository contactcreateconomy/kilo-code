import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@createconomy/ui/components/card';
import {
  Package,
  Wallet,
  BarChart3,
  ShieldCheck,
  Globe,
  Star,
} from 'lucide-react';

const FEATURES = [
  {
    title: 'Easy Product Listing',
    description: 'Upload and list your digital products in minutes with our intuitive editor.',
    icon: Package,
  },
  {
    title: 'Instant Payouts',
    description: 'Get paid directly to your bank via Stripe Connect. No waiting around.',
    icon: Wallet,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track sales, views, and revenue in real-time with powerful insights.',
    icon: BarChart3,
  },
  {
    title: 'Secure Payments',
    description: 'Stripe-powered payments with built-in fraud protection for every transaction.',
    icon: ShieldCheck,
  },
  {
    title: 'Global Reach',
    description: 'Sell to customers worldwide, 24/7. Your store never sleeps.',
    icon: Globe,
  },
  {
    title: 'Customer Reviews',
    description: 'Build trust and credibility with verified customer reviews and ratings.',
    icon: Star,
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            From listing to payouts, we provide all the tools you need to build
            a thriving digital products business.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group transition-all duration-200 hover:shadow-md hover:border-primary/20"
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
