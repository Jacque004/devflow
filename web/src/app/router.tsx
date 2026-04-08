import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { LegalDocumentLayout } from '../components/layout/LegalDocumentLayout'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { GuestRoute } from '../components/layout/GuestRoute'
import { Skeleton } from '../components/ui/Skeleton'

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('../features/auth/pages/SignupPage').then((m) => ({ default: m.SignupPage })))
const ForgotPasswordPage = lazy(() =>
  import('../features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('../features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ProjectsPage = lazy(() =>
  import('../features/projects/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectDetailPage = lazy(() =>
  import('../features/projects/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const SnippetsPage = lazy(() =>
  import('../features/snippets/pages/SnippetsPage').then((m) => ({ default: m.SnippetsPage })),
)
const JournalPage = lazy(() =>
  import('../features/journal/pages/JournalPage').then((m) => ({ default: m.JournalPage })),
)
const AboutPage = lazy(() => import('../features/about/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const TermsPage = lazy(() => import('../features/legal/pages/TermsPage').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('../features/legal/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))

function RouteLoader() {
  return (
    <section className="card">
      <Skeleton height={26} />
      <Skeleton height={18} />
    </section>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Suspense fallback={<RouteLoader />}>
          <LoginPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <GuestRoute>
        <Suspense fallback={<RouteLoader />}>
          <SignupPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/mot-de-passe-oublie',
    element: (
      <GuestRoute>
        <Suspense fallback={<RouteLoader />}>
          <ForgotPasswordPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/reinitialiser-mot-de-passe',
    element: (
      <Suspense fallback={<RouteLoader />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/cgu',
    element: <LegalDocumentLayout />,
    children: [{ index: true, element: <Suspense fallback={<RouteLoader />}><TermsPage /></Suspense> }],
  },
  {
    path: '/politique-confidentialite',
    element: <LegalDocumentLayout />,
    children: [{ index: true, element: <Suspense fallback={<RouteLoader />}><PrivacyPage /></Suspense> }],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <Suspense fallback={<RouteLoader />}><DashboardPage /></Suspense> },
      { path: '/projects', element: <Suspense fallback={<RouteLoader />}><ProjectsPage /></Suspense> },
      { path: '/projects/:projectId', element: <Suspense fallback={<RouteLoader />}><ProjectDetailPage /></Suspense> },
      { path: '/snippets', element: <Suspense fallback={<RouteLoader />}><SnippetsPage /></Suspense> },
      { path: '/journal', element: <Suspense fallback={<RouteLoader />}><JournalPage /></Suspense> },
      { path: '/profil', element: <Suspense fallback={<RouteLoader />}><ProfilePage /></Suspense> },
      { path: '/a-propos', element: <Suspense fallback={<RouteLoader />}><AboutPage /></Suspense> },
    ],
  },
])
