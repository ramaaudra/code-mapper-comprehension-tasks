import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { TooltipProvider } from '@/shared/components/ui/tooltip'

interface AppProvidersProps {
  children: ReactNode
  queryClient: QueryClient
}

export function AppProviders({ children, queryClient }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}
