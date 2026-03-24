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
      <div className='min-h-[128px] rounded-xl border border-border/60 bg-muted/15 p-5'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium tracking-label text-muted-foreground/90'>
            {label}
          </span>
          {icon && <span className='p-1.5 text-muted-foreground'>{icon}</span>}
        </div>
        <div className='mt-3 font-data text-metric font-semibold tabular-nums tracking-tight text-foreground lg:text-metric-lg'>
          {value}
        </div>
        {subValue && (
          <p className='mt-1 text-sm leading-relaxed text-muted-foreground/90'>
            {subValue}
          </p>
        )}
      </div>
    )
  }

  const statusColors = {
    default: 'text-muted-foreground',
    warning: 'text-status-warning-foreground',
    destructive: 'text-status-critical-foreground'
  }

  return (
    <div className='min-h-[140px] rounded-xl border border-border/60 bg-muted/15 p-5'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium uppercase tracking-label text-muted-foreground'>
          {label}
        </span>
        {icon && <span className={`p-2 ${statusColors[status]}`}>{icon}</span>}
      </div>
      <div className='mt-3 flex items-baseline gap-2'>
        <span className='font-data text-5xl font-semibold tabular-nums tracking-tight text-foreground'>
          {value}
        </span>
        {subValue && (
          <span className='text-sm text-muted-foreground'>{subValue}</span>
        )}
      </div>
    </div>
  )
})
