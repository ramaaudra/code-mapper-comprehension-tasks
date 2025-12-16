import { Skeleton } from '@/shared/components/ui/skeleton'

export function GraphSkeleton() {
  return (
    <div className="graph-skeleton h-full w-full min-h-[600px] bg-background p-8 flex flex-col gap-4 relative overflow-hidden">
      {/* Mock nodes layout */}
      <div className="flex gap-8 justify-around items-center h-32 opacity-50">
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-24 w-48 rounded-xl" />
      </div>
      <div className="flex gap-8 justify-around items-center h-32 opacity-50">
        <Skeleton className="h-24 w-56 rounded-xl" />
        <Skeleton className="h-28 w-64 rounded-xl" />
        <Skeleton className="h-24 w-56 rounded-xl" />
      </div>
      <div className="flex gap-8 justify-around items-center h-32 opacity-50">
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-24 w-48 rounded-xl" />
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm px-6 py-3 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium text-foreground">
              Loading graph...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
