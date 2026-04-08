import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { ToastProvider } from './hooks/useToast'
import { initGlobalErrorHandlers } from './lib/error-reporting'
import { AppErrorBoundary } from './components/layout/AppErrorBoundary'
import { AuthSync } from './components/system/AuthSync'
import { SupabaseConfigGate } from './components/system/SupabaseConfigGate'

initGlobalErrorHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <SupabaseConfigGate>
        <ToastProvider>
          <AuthSync />
          <RouterProvider router={router} />
        </ToastProvider>
      </SupabaseConfigGate>
    </AppErrorBoundary>
  </StrictMode>,
)
