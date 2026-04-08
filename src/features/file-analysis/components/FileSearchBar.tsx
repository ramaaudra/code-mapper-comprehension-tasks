import { forwardRef, useImperativeHandle, useRef } from 'react'

import { Search } from '@/shared/components/ui/icons'
import { Input } from '@/shared/components/ui/input'
import { ShortcutBadge } from '@/shared/components/ui/shortcut-badge'
import { ActionTooltip } from '@/shared/components/ui/simple-tooltip'
import { usePlatform } from '@/shared/hooks/usePlatform'

import { useFileAnalysisInteraction } from '../context/FileAnalysisContext'

export interface FileSearchBarRef {
  focus: () => void
}

export const FileSearchBar = forwardRef<FileSearchBarRef>(
  function FileSearchBar(_, ref) {
    const { searchQuery, setSearchQuery } = useFileAnalysisInteraction()
    const inputRef = useRef<HTMLInputElement>(null)
    const { modifierKey } = usePlatform()
    const shortcutLabel = modifierKey === '⌘' ? '⌘F' : 'Ctrl + F'

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }))

    return (
      <ActionTooltip
        label='Find file'
        shortcut={shortcutLabel}
        side='bottom'
        asChild
      >
        <div className='relative w-full' role='search'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            ref={inputRef}
            type='search'
            aria-label='Find a file by name or path'
            placeholder='Find file'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 pr-24'
          />
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-y-0 right-3 flex items-center'
          >
            <ShortcutBadge>{shortcutLabel}</ShortcutBadge>
          </div>
        </div>
      </ActionTooltip>
    )
  }
)
