import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function ChartCard({ title, subtitle, children, className, headerAction }: ChartCardProps) {
  return (
    <Card className={cn(
      "glass-effect border-border/30 backdrop-blur-xl",
      "hover:shadow-glow transition-all duration-500",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground/70 mt-2">{subtitle}</p>
          )}
        </div>
        {headerAction}
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
