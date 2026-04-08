import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { AppProviders } from '@/shared/components/providers/AppProviders'
import { lazyWithPreload } from '@/shared/lib/performance/lazy-with-preload'
import { shouldRenderQueryDevtools } from '@/shared/lib/performance/runtime-flags'
import { queryClient } from '@/shared/lib/queryClient'

import App from './App.tsx'

const QueryDevtools = shouldRenderQueryDevtools(import.meta.env.DEV)
  ? lazyWithPreload(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools
      }))
    )
  : null

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders queryClient={queryClient}>
      <App />
      {QueryDevtools ? (
        <Suspense fallback={null}>
          <QueryDevtools initialIsOpen={false} buttonPosition='bottom-right' />
        </Suspense>
      ) : null}
    </AppProviders>
  </StrictMode>
)
