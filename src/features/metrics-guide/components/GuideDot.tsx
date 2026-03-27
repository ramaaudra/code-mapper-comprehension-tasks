interface GuideDotProps {
  emphasized?: boolean
}

export function GuideDot({ emphasized = false }: GuideDotProps) {
  return (
    <span
      className={
        emphasized
          ? 'h-4 w-4 rounded-full bg-primary'
          : 'h-3 w-3 rounded-full bg-muted-foreground/60'
      }
    />
  )
}
