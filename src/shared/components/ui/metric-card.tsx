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
          <span className='text-xs font-medium tracking-[0.04em] text-muted-foreground/90'>
            {label}
          </span>
          {icon && <span className='p-1.5 text-muted-foreground'>{icon}</span>}
        </div>
        <div className='mt-3 text-[1.95rem] font-semibold tabular-nums tracking-tight text-foreground lg:text-[2.15rem]'>
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
    warning: 'text-orange-500',
    destructive: 'text-destructive'
  }

  return (
    <div className='min-h-[140px] rounded-lg bg-muted/20 p-6'>
      <div className='flex items-center justify-between'>
        <span className='text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground'>
          {label}
        </span>
        {icon && <span className={`p-2 ${statusColors[status]}`}>{icon}</span>}
      </div>
      <div className='mt-3 flex items-baseline gap-2'>
        <span className='text-5xl font-semibold tabular-nums tracking-tight text-foreground'>
          {value}
        </span>
        {subValue && (
          <span className='text-sm text-muted-foreground'>{subValue}</span>
        )}
      </div>
    </div>
  )
})
