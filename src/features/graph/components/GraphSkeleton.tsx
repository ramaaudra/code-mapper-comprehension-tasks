import { Skeleton } from '@/shared/components/ui/skeleton'

export function GraphSkeleton() {
  return (
    <div className="graph-skeleton h-full w-full min-h-[600px] bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col gap-4">
      {/* Mock nodes layout */}
      <div className="flex gap-8 justify-around items-center h-32">
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-24 w-48 rounded-xl" />
      </div>
      <div className="flex gap-8 justify-around items-center h-32">
        <Skeleton className="h-24 w-56 rounded-xl" />
        <Skeleton className="h-28 w-64 rounded-xl bg-emerald-200 dark:bg-emerald-900" />
        <Skeleton className="h-24 w-56 rounded-xl" />
      </div>
      <div className="flex gap-8 justify-around items-center h-32">
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-24 w-48 rounded-xl" />
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 dark:bg-slate-800/90 px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Loading graph...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
