interface InstabilityBadgeProps {
  value: number
}

/**
 * Neutral color scheme for Instability metric.
 * Instability is a structural property, not a danger indicator.
 * High instability in UI components (Ca=0, Ce>0) is natural, not problematic.
 */
function getInstabilityColor(_value: number): string {
  return 'border border-border/60 bg-muted/30 text-muted-foreground'
}

export function InstabilityBadge({ value }: InstabilityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 font-data text-xs ${getInstabilityColor(value)}`}
    >
      {value.toFixed(2)}
    </span>
  )
}
