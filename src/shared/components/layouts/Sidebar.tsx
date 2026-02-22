import { Suspense } from 'react'

import { Skeleton } from '@/shared/components/ui/skeleton'

interface SidebarProps {
  isCollapsed: boolean
  children: React.ReactNode
}

function FileTreeSkeleton() {
  return (
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-36" />
    </div>
  )
}

export function Sidebar({ isCollapsed, children }: SidebarProps) {
  return (
    <div
      className={`transition-all duration-200 ease-out overflow-hidden shrink-0 ${
        isCollapsed
          ? 'w-0 min-w-0'
          : 'w-80 border-r border-border bg-background'
      }`}
    >
      {!isCollapsed && (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={<FileTreeSkeleton />}>{children}</Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
