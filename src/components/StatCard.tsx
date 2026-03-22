import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  const changeColor = changeType === "positive" ? "text-success" : changeType === "negative" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="glass-card p-5 hover:scale-[1.02] transition-transform duration-200 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change && <p className={`text-xs font-medium ${changeColor}`}>{change}</p>}
        </div>
        <div className={`p-2.5 rounded-lg bg-primary/10 ${iconColor} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
