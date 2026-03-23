import { cn } from '@/shared/lib/utils'

interface CycleEvidenceListProps {
  items: string[]
  ariaLabel?: string
  className?: string
}

export function CycleEvidenceList({
  items,
  ariaLabel,
  className
}: CycleEvidenceListProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground',
        className
      )}
      aria-label={ariaLabel}
    >
      {items.map((item, index) => (
        <span
          key={item}
          className={cn(
            'inline-flex items-center gap-3',
            index > 0 &&
              'before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/45 before:content-[""]'
          )}
        >
          {item}
        </span>
      ))}
    </div>
  )
}
