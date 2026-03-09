import { Skeleton } from '@/shared/components/ui/skeleton'

export function GraphSkeleton() {
  return (
    <div className='graph-skeleton relative flex h-full min-h-[600px] w-full flex-col gap-4 overflow-hidden bg-background p-8'>
      {/* Mock nodes layout */}
      <div className='flex h-32 items-center justify-around gap-8 opacity-50'>
        <Skeleton className='h-24 w-48 rounded-xl' />
        <Skeleton className='h-24 w-48 rounded-xl' />
        <Skeleton className='h-24 w-48 rounded-xl' />
      </div>
      <div className='flex h-32 items-center justify-around gap-8 opacity-50'>
        <Skeleton className='h-24 w-56 rounded-xl' />
        <Skeleton className='h-28 w-64 rounded-xl' />
        <Skeleton className='h-24 w-56 rounded-xl' />
      </div>
      <div className='flex h-32 items-center justify-around gap-8 opacity-50'>
        <Skeleton className='h-24 w-48 rounded-xl' />
        <Skeleton className='h-24 w-48 rounded-xl' />
        <Skeleton className='h-24 w-48 rounded-xl' />
      </div>

      {/* Loading indicator */}
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <div className='rounded-lg border bg-background/80 px-6 py-3 shadow-sm backdrop-blur-sm'>
          <div className='flex items-center gap-3'>
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            <span className='text-sm font-medium text-foreground'>
              Loading graph...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
