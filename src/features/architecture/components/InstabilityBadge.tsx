interface InstabilityBadgeProps {
  value: number
}

function getInstabilityColor(value: number): string {
  if (value >= 0.8) {
    return 'bg-red-500/20 text-red-400'
  }
  if (value >= 0.6) {
    return 'bg-orange-500/20 text-orange-400'
  }
  if (value >= 0.4) {
    return 'bg-yellow-500/20 text-yellow-400'
  }
  return 'bg-green-500/20 text-green-400'
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
