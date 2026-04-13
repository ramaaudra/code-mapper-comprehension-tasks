interface SkipLinkProps {
  href: string
  label: string
}

export function SkipLink({ href, label }: SkipLinkProps) {
  return (
    <a
      href={href}
      className='sr-only absolute left-4 top-4 z-[120] rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground shadow-md focus:not-sr-only focus-visible:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    >
      {label}
    </a>
  )
}
