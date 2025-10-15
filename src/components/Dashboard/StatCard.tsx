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
  const gradientClass = iconColor.includes('orange') 
    ? 'bg-gradient-orange' 
    : iconColor.includes('purple') 
    ? 'bg-gradient-purple' 
    : iconColor.includes('blue') 
    ? 'bg-gradient-blue' 
    : 'bg-gradient-primary';

  return (
    <Card className={cn(
      "liquid-card glass-effect border-border/30 backdrop-blur-xl",
      "hover:shadow-glow transition-all duration-500",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground/80 mb-2 font-medium">{title}</p>
          <h3 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70 mt-2">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-3 rounded-2xl backdrop-blur-sm",
            gradientClass
          )}>
            <Icon className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center gap-2 mt-4">
          <span
            className={cn(
              "text-sm font-semibold",
              changeType === "positive" && "text-green-400",
              changeType === "negative" && "text-red-400",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </span>
          <span className="text-xs text-muted-foreground/60">vs last period</span>
        </div>
      )}
      
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
