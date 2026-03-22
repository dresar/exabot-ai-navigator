import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
  pulse?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  subtitle,
  pulse = false,
}: StatCardProps) {
  const badgeClass =
    changeType === "positive"
      ? "stat-badge-positive"
      : changeType === "negative"
      ? "stat-badge-negative"
      : "stat-badge-neutral";

  const TrendIcon =
    changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : Minus;

  return (
    <div className="glass-card p-5 hover:scale-[1.02] transition-all duration-200 group cursor-default relative overflow-hidden">
      {/* Background accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity ${iconColor.replace("text-", "bg-")}`} />

      <div className="flex items-start justify-between relative">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold tracking-tight animate-fade-in">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {change && (
            <div className={badgeClass}>
              <TrendIcon className="w-3 h-3" />
              {change}
            </div>
          )}
        </div>

        <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-200 shrink-0 relative`}>
          <Icon className="w-5 h-5" />
          {pulse && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
