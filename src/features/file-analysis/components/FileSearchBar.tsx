import { forwardRef, useImperativeHandle, useRef } from 'react'

import { Search } from '@/shared/components/ui/icons'
import { Input } from '@/shared/components/ui/input'
import { ActionTooltip } from '@/shared/components/ui/simple-tooltip'
import { usePlatform } from '@/shared/hooks/usePlatform'

import { useFileAnalysisContext } from '../context/FileAnalysisContext'

export interface FileSearchBarRef {
  focus: () => void
}

export const FileSearchBar = forwardRef<FileSearchBarRef>(
  function FileSearchBar(_, ref) {
    const { searchQuery, setSearchQuery } = useFileAnalysisContext()
    const inputRef = useRef<HTMLInputElement>(null)
    const { modifierKey } = usePlatform()

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }))

    return (
      <ActionTooltip label='Find file' side='bottom' asChild>
        <div className='relative w-full'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            ref={inputRef}
            type='text'
            placeholder={`Find file ${modifierKey}F`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
      </ActionTooltip>
    )
  }
)
