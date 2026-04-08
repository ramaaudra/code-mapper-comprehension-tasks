import { ShortcutBadge } from '@/shared/components/ui/shortcut-badge'

import { graphCopy } from '../content/graphCopy'

export const GRAPH_SHORTCUTS_HINT_ID = 'graph-shortcuts-hint'

export function GraphShortcutsHint() {
  return (
    <aside
      id={GRAPH_SHORTCUTS_HINT_ID}
      role='note'
      className='pointer-events-none absolute bottom-4 left-4 z-20 max-w-xs rounded-lg border border-border bg-background/90 px-3 py-2.5 text-sm shadow-sm backdrop-blur'
    >
      <p className='text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80'>
        {graphCopy.canvas.shortcuts.title}
      </p>
      <ul className='mt-2 space-y-1.5'>
        {graphCopy.canvas.shortcuts.items.map((shortcut) => (
          <li key={shortcut.key} className='flex items-center gap-2'>
            <ShortcutBadge className='min-w-[1.75rem] justify-center px-2 py-0.5 text-[11px]'>
              {shortcut.key}
            </ShortcutBadge>
            <span className='text-xs leading-snug text-foreground/80'>
              {shortcut.label}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
