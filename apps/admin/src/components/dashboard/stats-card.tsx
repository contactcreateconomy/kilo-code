import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@createconomy/ui/components/card';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dollar: DollarSign,
  'shopping-cart': ShoppingCart,
  users: Users,
  package: Package,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
}: StatsCardProps) {
  const IconComponent = icon ? iconMap[icon] : null;

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up'
      ? 'text-emerald-500'
      : trend === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {IconComponent && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <IconComponent className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`mt-1 flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {change > 0 ? '+' : ''}
            {change}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
