import { TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface DetailPanelTabItem {
  value: string
  label: string
  badge?: ReactNode
}

interface DetailPanelTabsProps {
  items: DetailPanelTabItem[]
  className?: string
}

export function DetailPanelTabs({ items, className }: DetailPanelTabsProps) {
  return (
    <div className={cn('overflow-x-auto px-4 pt-2', className)}>
      <TabsList className='h-9 w-full justify-start rounded-none border-b bg-transparent p-0'>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className='rounded-none px-4 pb-2 pt-1.5 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none'
          >
            {item.label}
            {item.badge ? (
              <span className='ml-1.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground'>
                {item.badge}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
