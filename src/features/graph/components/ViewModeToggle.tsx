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
    <div className='flex max-w-full items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-1 shadow-sm'>
      {VIEW_MODE_OPTIONS.map(({ value, label, shortLabel, Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          aria-label={label}
          className={cn(
            'flex min-w-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all sm:px-3 sm:text-sm',
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
