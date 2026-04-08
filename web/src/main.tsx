import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initGlobalErrorHandlers } from './lib/error-reporting'
import { AppErrorBoundary } from './components/layout/AppErrorBoundary'
import { SupabaseConfigGate } from './components/system/SupabaseConfigGate'

const AppShell = lazy(() => import('./AppShell'))

initGlobalErrorHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <SupabaseConfigGate>
        <Suspense
          fallback={
            <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg)] text-[var(--muted)]">
              Chargement…
            </div>
          }
        >
          <AppShell />
        </Suspense>
      </SupabaseConfigGate>
    </AppErrorBoundary>
  </StrictMode>,
)
