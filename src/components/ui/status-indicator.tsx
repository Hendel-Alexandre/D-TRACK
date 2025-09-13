import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status?: string
  className?: string
}

export function StatusIndicator({ status = 'Available', className }: StatusIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500'
      case 'Away':
        return 'bg-yellow-500'
      case 'Busy':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div 
      className={cn(
        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
        getStatusColor(status),
        className
      )}
    />
  )
}