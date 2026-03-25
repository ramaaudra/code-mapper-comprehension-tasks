import { QueryClient } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/index.css'
import { FileAnalysisProvider } from '@/features/file-analysis'
import { AppProviders } from '@/shared/components/providers/AppProviders'
import { ThemeProvider } from '@/shared/components/providers/ThemeProvider'

import { ReportShell } from './components/ReportShell'
import { StaticProvider } from './StaticProvider'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}

const root = createRoot(container)

// QueryClient untuk report (queries disabled, hanya untuk kompatibilitas)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: false,
      staleTime: Infinity,
      retry: false
    }
  }
})

root.render(
  <StrictMode>
    <ThemeProvider>
      <AppProviders queryClient={queryClient}>
        <StaticProvider>
          <FileAnalysisProvider>
            <ReportShell />
          </FileAnalysisProvider>
        </StaticProvider>
      </AppProviders>
    </ThemeProvider>
  </StrictMode>
)
