interface InstabilityBadgeProps {
  value: number
}

/**
 * Neutral color scheme for Instability metric.
 * Instability is a structural property, not a danger indicator.
 * High instability in UI components (Ca=0, Ce>0) is natural, not problematic.
 */
function getInstabilityColor(_value: number): string {
  // Using neutral slate colors - no red/orange/yellow/green warning colors
  return 'bg-slate-600/20 text-slate-400'
}

export function InstabilityBadge({ value }: InstabilityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono ${getInstabilityColor(value)}`}
    >
      {value.toFixed(2)}
    </span>
  )
}
