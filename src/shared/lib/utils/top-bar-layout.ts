export interface TopBarLayoutClasses {
  header: string
  brandRow: string
  navigation: string
  navigationGroup: string
  navigationItem: string
  actions: string
  helpGroup: string
  divider: string
}

export function resolveTopBarLayoutClasses(): TopBarLayoutClasses {
  return {
    header:
      'flex min-h-14 flex-col gap-3 border-b border-border bg-background px-3 py-3 sm:px-4 md:grid md:h-14 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-3 md:px-4 md:py-0',
    brandRow:
      'flex min-w-0 items-center justify-between gap-3 md:justify-start',
    navigation: 'flex w-full justify-center md:w-auto md:justify-self-center',
    navigationGroup: 'flex w-full max-w-sm md:w-auto md:max-w-none',
    navigationItem: 'flex-1 md:flex-none',
    actions:
      'flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto md:justify-end',
    helpGroup: 'flex min-w-0 flex-wrap items-center gap-1.5',
    divider: 'hidden h-5 w-px shrink-0 bg-border/70 md:block'
  }
}
