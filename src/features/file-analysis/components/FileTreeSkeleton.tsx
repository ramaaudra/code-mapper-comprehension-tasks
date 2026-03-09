import { Skeleton } from '@/shared/components/ui/skeleton'

export function FileTreeSkeleton() {
  return (
    <div className='flex h-full flex-col bg-background'>
      {/* Section Label */}
      <div className='px-4 py-3'>
        <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
          File Explorer
        </span>
      </div>

      {/* Skeleton Tree */}
      <div className='flex-1 space-y-2 overflow-y-auto px-2 pb-4'>
        {/* Root level items */}
        {[1, 2].map((i) => (
          <div key={`root-${i}`} className='flex h-8 items-center gap-2 px-2'>
            <Skeleton className='h-3 w-3 shrink-0 rounded-sm' /> {/* Chevron */}
            <Skeleton className='h-4 w-4 shrink-0 rounded-sm' /> {/* Icon */}
            <Skeleton className='h-4 w-24 rounded-sm' /> {/* Name */}
          </div>
        ))}

        {/* Level 1 items (nested) */}
        {[1, 2, 3].map((i) => (
          <div
            key={`l1-${i}`}
            className='ml-4 flex h-8 items-center gap-2 px-2'
          >
            <Skeleton className='h-4 w-4 shrink-0 rounded-sm' /> {/* Icon */}
            <Skeleton className='h-4 w-32 rounded-sm' /> {/* Name */}
          </div>
        ))}

        {/* Another Folder */}
        <div className='flex h-8 items-center gap-2 px-2'>
          <Skeleton className='h-3 w-3 shrink-0 rounded-sm' />
          <Skeleton className='h-4 w-4 shrink-0 rounded-sm' />
          <Skeleton className='h-4 w-20 rounded-sm' />
        </div>

        {/* Level 1 items (nested) */}
        {[1, 2].map((i) => (
          <div
            key={`l1-2-${i}`}
            className='ml-4 flex h-8 items-center gap-2 px-2'
          >
            <Skeleton className='h-3 w-3 shrink-0 rounded-sm' />
            <Skeleton className='h-4 w-4 shrink-0 rounded-sm' />
            <Skeleton className='h-4 w-28 rounded-sm' />
          </div>
        ))}

        {/* Level 2 items (nested deep) */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`l2-${i}`}
            className='ml-8 flex h-8 items-center gap-2 px-2'
          >
            <Skeleton className='h-4 w-4 shrink-0 rounded-sm' />
            <Skeleton className='h-4 w-36 rounded-sm' />
          </div>
        ))}
      </div>
    </div>
  )
}
