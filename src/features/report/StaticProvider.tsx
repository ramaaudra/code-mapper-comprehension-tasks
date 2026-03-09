import { DataContext } from '@/shared/context/DataContext'

import type { ReportData } from './types'
import type { ReactNode } from 'react'

declare global {
  interface Window {
    __CODE_MAPPER_DATA__?: ReportData
  }
}

interface StaticProviderProps {
  children: ReactNode
}

export function StaticProvider({ children }: StaticProviderProps) {
  const data = window.__CODE_MAPPER_DATA__

  if (!data) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold text-destructive'>Error</h1>
          <p className='mt-2 text-muted-foreground'>
            Report data not found. Open this file from a generated report.
          </p>
        </div>
      </div>
    )
  }

  const value = {
    analysisData: data.analysisData,
    architectureData: data.architectureData,
    isLoading: false,
    error: null,
    refetch: () => {},
    generatedAt: data.generatedAt
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
