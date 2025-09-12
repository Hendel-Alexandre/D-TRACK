// Temporary fix for chart component type issues
import * as React from "react"

export const ChartContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
)

export const ChartTooltip = ({ children }: { children?: React.ReactNode }) => (
  <div>{children}</div>
)

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, any>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
)

export const ChartLegend = ({ children }: { children?: React.ReactNode }) => (
  <div>{children}</div>
)

export const ChartLegendContent = React.forwardRef<HTMLDivElement, any>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
)

export const useChart = () => ({
  config: {}
})

ChartTooltipContent.displayName = "ChartTooltipContent"
ChartLegendContent.displayName = "ChartLegendContent"