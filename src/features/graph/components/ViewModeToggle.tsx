import { FileCode, Folder } from '@phosphor-icons/react'

import { cn } from '@/lib/utils'

import type { ComponentType } from 'react'

export type ViewMode = 'file' | 'module'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

interface ViewModeOption {
  value: ViewMode
  label: string
  shortLabel: string
  Icon: ComponentType<{ size?: number }>
}

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  { value: 'file', label: 'File View', shortLabel: 'File', Icon: FileCode },
  {
    value: 'module',
    label: 'Module View',
    shortLabel: 'Module',
    Icon: Folder
  }
]

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div
      role='group'
      aria-label='Graph view mode'
      className='flex max-w-full items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1 shadow-sm'
    >
      {VIEW_MODE_OPTIONS.map(({ value, label, shortLabel, Icon }) => (
        <button
          key={value}
          type='button'
          onClick={() => onChange(value)}
          aria-label={label}
          aria-pressed={mode === value}
          className={cn(
            'flex min-h-10 min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 sm:px-3.5',
            mode === value
              ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          )}
        >
          <Icon size={16} />
          <span className='sm:hidden'>{shortLabel}</span>
          <span className='hidden sm:inline'>{label}</span>
        </button>
      ))}
    </div>
  )
}
