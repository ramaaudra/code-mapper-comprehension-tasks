import { FileCode, Folder } from '@phosphor-icons/react'
import type { ComponentType } from 'react'

import { cn } from '@/lib/utils'

export type ViewMode = 'file' | 'module'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

interface ViewModeOption {
  value: ViewMode
  label: string
  Icon: ComponentType<{ size?: number }>
}

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  { value: 'file', label: 'File View', Icon: FileCode },
  { value: 'module', label: 'Module View', Icon: Folder }
]

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
      {VIEW_MODE_OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            mode === value
              ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          )}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  )
}
