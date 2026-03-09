import { Skeleton } from '@/shared/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className='h-full w-full overflow-y-auto overflow-x-hidden bg-background'>
      <div className='mx-auto max-w-full space-y-8 px-6 py-6 pb-12 md:px-8 lg:px-12'>
        {/* Header Section */}
        <div className='space-y-2'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-96' />
        </div>

        {/* Stats Grid */}
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='space-y-3 rounded-lg border bg-card p-4'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-4' />
              </div>
              <Skeleton className='h-8 w-16' />
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Left Column - Metrics Mirror */}
          <div className='min-w-0 space-y-6'>
            {/* Health Card */}
            <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
              <div className='flex flex-col space-y-1.5 p-6'>
                <Skeleton className='h-5 w-32' />
              </div>
              <div className='space-y-3 p-6 pt-0'>
                <Skeleton className='h-16 w-full rounded-lg' />
                <Skeleton className='h-16 w-full rounded-lg' />
              </div>
            </div>

            <div className='space-y-4'>
              {/* Most Depended On Card */}
              <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
                <div className='flex flex-col space-y-1.5 p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-4 w-4' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                    <Skeleton className='h-5 w-8 rounded-full' />
                  </div>
                </div>
                <div className='space-y-2 p-6 pt-0'>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className='h-12 w-full rounded-md' />
                  ))}
                </div>
              </div>

              {/* Top Importers Card */}
              <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
                <div className='flex flex-col space-y-1.5 p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-4 w-4' />
                      <Skeleton className='h-4 w-28' />
                    </div>
                    <Skeleton className='h-5 w-8 rounded-full' />
                  </div>
                </div>
                <div className='space-y-2 p-6 pt-0'>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className='h-12 w-full rounded-md' />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Issues Mirror */}
          <div className='min-w-0 space-y-4'>
            {/* Summary Card */}
            <div className='overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm'>
              <div className='flex flex-col space-y-1.5 p-6 pb-3'>
                <Skeleton className='h-5 w-36' />
              </div>
              <div className='p-6 pt-0'>
                <Skeleton className='h-20 w-full' />
              </div>
            </div>

            {/* Circular Dependencies Card */}
            <div className='overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm'>
              <div className='flex flex-col space-y-1.5 p-6 pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-40' />
                  </div>
                  <Skeleton className='h-5 w-8 rounded-full' />
                </div>
              </div>
              <div className='p-6 pt-0'>
                <div className='flex gap-2'>
                  <Skeleton className='h-5 w-16 rounded-full' />
                  <Skeleton className='h-5 w-16 rounded-full' />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              {/* Orphaned Files Card */}
              <div className='overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm'>
                <div className='flex flex-col space-y-1.5 p-6 pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-4 w-4' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                    <Skeleton className='h-5 w-8 rounded-full' />
                  </div>
                </div>
                <div className='space-y-2 p-6 pt-0'>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className='h-14 w-full rounded-md' />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
