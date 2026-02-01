interface SalesCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

export function SalesCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
}: SalesCardProps) {
  const changeColors = {
    positive: "text-[var(--success)]",
    negative: "text-[var(--destructive)]",
    neutral: "text-[var(--muted-foreground)]",
  };

  return (
    <div className="seller-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[changeType]}`}>
              {changeType === "positive" && "↑ "}
              {changeType === "negative" && "↓ "}
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
          {icon}
        </div>
      </div>
    </div>
  );
}
