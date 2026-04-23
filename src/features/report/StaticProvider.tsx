import { startTransition, useEffect, useMemo, useState } from 'react'

import { DataContext } from '@/shared/context/DataContext'
import { normalizeAnalysisData } from '@/shared/lib/analysis-normalization'
import { scheduleIdleWork } from '@/shared/lib/performance/schedule-idle-work'

import {
  readEmbeddedReportBootstrap,
  readEmbeddedReportData
} from './lib/report-payload'

import type { ReportBootstrapData, ReportData } from './types'
import type { ReactNode } from 'react'

declare global {
  interface Window {
    __TAUTA_DATA__?: ReportData
    __CODE_MAPPER_DATA__?: ReportData
    __TAUTA_REPORT_BOOTSTRAP__?: ReportBootstrapData
    __CODE_MAPPER_REPORT_BOOTSTRAP__?: ReportBootstrapData
  }
}

interface StaticProviderProps {
  children: ReactNode
}

export function StaticProvider({ children }: StaticProviderProps) {
  const bootstrap = readEmbeddedReportBootstrap(window)
  const [data, setData] = useState<ReportData | null>(() => {
    if (bootstrap) {
      return null
    }

    return readEmbeddedReportData(document, window)
  })
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    if (data) {
      return
    }

    return scheduleIdleWork(
      () => {
        const nextData = readEmbeddedReportData(document, window)

        if (!nextData) {
          setLoadError(
            new Error(
              'Report data not found. Open this file from a generated report.'
            )
          )
          return
        }

        startTransition(() => {
          setData(nextData)
        })
      },
      globalThis,
      {
        idleTimeoutMs: 600,
        fallbackDelayMs: 16
      }
    )
  }, [data])

  const value = useMemo(
    () => ({
      analysisData: normalizeAnalysisData(data?.analysisData),
      architectureData: data?.architectureData ?? null,
      isLoading: data == null && loadError == null,
      error: loadError,
      refetch: () => {},
      generatedAt: data?.generatedAt ?? bootstrap?.generatedAt,
      runtimeMode: 'report' as const,
      reportBootstrap: bootstrap
    }),
    [bootstrap, data, loadError]
  )

  if (!bootstrap && !data && loadError) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='max-w-md rounded-xl border border-status-critical-border bg-status-critical-surface px-5 py-4 text-center text-status-critical-foreground shadow-sm'>
          <h1 className='text-xl font-semibold'>Error</h1>
          <p className='mt-2 text-sm text-status-critical-foreground/85'>
            {loadError.message}
          </p>
        </div>
      </div>
    )
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
