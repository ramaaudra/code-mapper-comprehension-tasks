import { Badge } from '@/shared/components/ui/badge'
import { Search } from '@/shared/components/ui/icons'
import { Input } from '@/shared/components/ui/input'

import { architectureCopy } from '../content/architectureCopy'

interface ArchitectureReviewToolbarProps {
  searchQuery: string
  totalModules: number
  filteredFoldersCount: number
  onSearchQueryChange: (value: string) => void
}

export function ArchitectureReviewToolbar({
  searchQuery,
  totalModules,
  filteredFoldersCount,
  onSearchQueryChange
}: ArchitectureReviewToolbarProps) {
  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-4'>
        <div className='max-w-sm flex-1 space-y-2'>
          <label
            htmlFor='architecture-module-search'
            className='block text-xs font-medium tracking-label text-muted-foreground'
          >
            {architectureCopy.page.searchLabel}
          </label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              id='architecture-module-search'
              value={searchQuery}
              onChange={(event) => {
                onSearchQueryChange(event.target.value)
              }}
              placeholder={architectureCopy.page.searchPlaceholder}
              aria-describedby='architecture-triage-count'
              className='pl-9'
            />
          </div>
        </div>
        <Badge
          id='architecture-triage-count'
          variant='outline'
          className='text-xs'
        >
          {filteredFoldersCount} of {totalModules} modules
        </Badge>
      </div>

      <p className='text-sm text-muted-foreground'>
        {architectureCopy.page.triageCue}
      </p>
    </div>
  )
}
