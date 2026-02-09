import { Card, CardContent } from '@createconomy/ui/components/card';
import { Users, ShoppingBag, DollarSign, Star } from 'lucide-react';

const STATS = [
  {
    label: 'Sellers',
    value: '10,000+',
    icon: Users,
  },
  {
    label: 'Products Sold',
    value: '500,000+',
    icon: ShoppingBag,
  },
  {
    label: 'Paid to Creators',
    value: '$2M+',
    icon: DollarSign,
  },
  {
    label: 'Average Rating',
    value: '4.9/5',
    icon: Star,
  },
] as const;

export function StatsBar() {
  return (
    <section className="border-y bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-0 bg-transparent shadow-none text-center">
                <CardContent className="flex flex-col items-center gap-2 p-4">
                  <Icon className="h-6 w-6 text-primary" />
                  <div className="text-2xl font-bold tracking-tight md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
