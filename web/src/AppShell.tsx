import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { ToastProvider } from './hooks/useToast'
import { AuthSync } from './components/system/AuthSync'

/**
 * Chargé uniquement lorsque la config Supabase est valide (voir main.tsx + SupabaseConfigGate),
 * pour ne pas importer le routeur ni le client Supabase si les variables VITE_* manquent.
 */
export default function AppShell() {
  return (
    <ToastProvider>
      <AuthSync />
      <RouterProvider router={router} />
    </ToastProvider>
  )
}
