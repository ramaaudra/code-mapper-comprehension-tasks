import { memo } from 'react'

export interface MetricCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: React.ReactNode
  variant?: 'minimal' | 'detailed'
  status?: 'default' | 'warning' | 'destructive'
}

export const MetricCard = memo(function MetricCard({
  label,
  value,
  subValue,
  icon,
  variant = 'minimal',
  status = 'default'
}: MetricCardProps) {
  if (variant === 'minimal') {
    return (
      <div className="rounded-lg bg-muted/20 p-6 min-h-[140px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            {label}
          </span>
          {icon && <span className="p-2 text-muted-foreground">{icon}</span>}
        </div>
        <div className="mt-3 text-5xl font-semibold tabular-nums text-foreground tracking-tight">
          {value}
        </div>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </div>
    )
  }

  const statusColors = {
    default: 'text-muted-foreground',
    warning: 'text-orange-500',
    destructive: 'text-destructive'
  }

  return (
    <div className="rounded-lg bg-muted/20 p-6 min-h-[140px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
          {label}
        </span>
        {icon && <span className={`p-2 ${statusColors[status]}`}>{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-5xl font-semibold tabular-nums text-foreground tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-sm text-muted-foreground">{subValue}</span>
        )}
      </div>
    </div>
  )
})
