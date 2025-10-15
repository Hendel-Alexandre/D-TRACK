import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  subtitle,
  className,
  children,
}: StatCardProps) {
  return (
    <Card className={cn("p-6 bg-card border-border/50 hover:border-border transition-colors", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-xl bg-primary/10", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-sm font-medium",
              changeType === "positive" && "text-green-500",
              changeType === "negative" && "text-red-500",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
      
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
