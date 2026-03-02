import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { AppProviders } from '@/shared/components/providers/AppProviders'
import { queryClient } from '@/shared/lib/queryClient'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders queryClient={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </AppProviders>
  </StrictMode>
)
