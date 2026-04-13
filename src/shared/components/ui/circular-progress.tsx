import { cn } from '@/shared/lib/utils'

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  className,
  children
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(Math.max(value / max, 0), 1)
  const strokeDashoffset = circumference - percentage * circumference

  // Color based on value
  const getColor = () => {
    if (percentage >= 0.8) {
      return 'text-status-success-solid'
    }
    if (percentage >= 0.6) {
      return 'text-status-caution-solid'
    }
    if (percentage >= 0.4) {
      return 'text-status-warning-solid'
    }
    return 'text-status-critical-solid'
  }

  return (
    <div
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
    >
      <svg className='-rotate-90 transform' width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          className='text-muted'
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          className={cn(
            'transition-[stroke-dashoffset,color] duration-500',
            getColor()
          )}
        />
      </svg>
      {/* Center content */}
      <div className='absolute inset-0 flex items-center justify-center'>
        {children}
      </div>
    </div>
  )
}
