import { Skeleton } from '@/shared/components/ui/skeleton'

export function FileTreeSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Section Label */}
      <div className="px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
          File Explorer
        </span>
      </div>

      {/* Skeleton Tree */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-2">
        {/* Root level items */}
        {[1, 2].map((i) => (
          <div key={`root-${i}`} className="flex items-center gap-2 h-8 px-2">
            <Skeleton className="h-3 w-3 shrink-0 rounded-sm" /> {/* Chevron */}
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" /> {/* Icon */}
            <Skeleton className="h-4 w-24 rounded-sm" /> {/* Name */}
          </div>
        ))}

        {/* Level 1 items (nested) */}
        {[1, 2, 3].map((i) => (
          <div
            key={`l1-${i}`}
            className="flex items-center gap-2 h-8 px-2 ml-4"
          >
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" /> {/* Icon */}
            <Skeleton className="h-4 w-32 rounded-sm" /> {/* Name */}
          </div>
        ))}

        {/* Another Folder */}
        <div className="flex items-center gap-2 h-8 px-2">
          <Skeleton className="h-3 w-3 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>

        {/* Level 1 items (nested) */}
        {[1, 2].map((i) => (
          <div
            key={`l1-2-${i}`}
            className="flex items-center gap-2 h-8 px-2 ml-4"
          >
            <Skeleton className="h-3 w-3 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-28 rounded-sm" />
          </div>
        ))}

        {/* Level 2 items (nested deep) */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`l2-${i}`}
            className="flex items-center gap-2 h-8 px-2 ml-8"
          >
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-36 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
