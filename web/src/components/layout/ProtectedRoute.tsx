import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { Skeleton } from '../ui/Skeleton'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const initialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)

  if (!initialized) {
    return (
      <section className="auth-card" aria-busy="true" aria-live="polite">
        <h1>Chargement...</h1>
        <Skeleton height={24} />
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
