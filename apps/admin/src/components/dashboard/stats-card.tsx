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
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {change !== undefined && (
        <p className={`mt-1 text-sm ${trendColors[trend]}`}>
          {trendIcons[trend]} {change > 0 ? '+' : ''}
          {change}% from last period
        </p>
      )}
    </div>
  );
}
