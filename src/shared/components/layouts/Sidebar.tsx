import { Suspense, lazy, useState } from 'react'

import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/components/ui/tabs'

// Lazy load ArchitectureTab
const ArchitectureTab = lazy(() =>
  import('@/features/architecture').then((m) => ({
    default: m.ArchitectureTab
  }))
)

interface SidebarProps {
  isCollapsed: boolean
  children: React.ReactNode
}

function ArchitectureSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export function Sidebar({ isCollapsed, children }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<string>('files')

  return (
    <div
      className={`transition-all duration-200 ease-out overflow-hidden shrink-0 ${
        isCollapsed
          ? 'w-0 min-w-0'
          : 'w-80 border-r border-border bg-background'
      }`}
    >
      {!isCollapsed && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="w-full justify-start h-10 bg-transparent p-0 border-b rounded-none shrink-0">
            <TabsTrigger
              value="files"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 text-xs"
            >
              Files
            </TabsTrigger>
            <TabsTrigger
              value="architecture"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 text-xs"
            >
              Architecture
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
            {children}
          </TabsContent>

          <TabsContent
            value="architecture"
            className="flex-1 m-0 overflow-hidden"
          >
            <Suspense fallback={<ArchitectureSkeleton />}>
              <ArchitectureTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
