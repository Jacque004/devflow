import type { ReactNode } from 'react'
import { getSupabaseConfigIssues } from '../../lib/env'

type Props = {
  children: ReactNode
}

/**
 * Empeche de lancer l app si .env ne cible pas un projet Supabase utilisable :
 * tous les appels auth (login, inscription, mails, etc.) passent par le client defini ici.
 */
export function SupabaseConfigGate({ children }: Props) {
  const issues = getSupabaseConfigIssues()

  if (issues.length > 0) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-[var(--bg)]">
        <section className="auth-card max-w-lg w-full" role="alert">
          <h1 className="text-xl font-semibold mb-2">Configuration Supabase</h1>
          <p className="muted mb-4">
            Les flux d authentification et les modeles d e-mail du dashboard ne peuvent fonctionner que si cette
            application utilise le <strong>meme projet</strong> que celui configure dans Supabase (URL + cle anon dans
            <code className="mx-1 text-sm">web/.env</code>
            ). Pour un deploiement GitHub Pages, ajoute les memes variables en secrets Actions (
            <code className="text-sm">VITE_SUPABASE_URL</code>, <code className="text-sm">VITE_SUPABASE_ANON_KEY</code>
            ).
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[0.95rem] text-[var(--text)] mb-6">
            {issues.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
          <p className="muted text-sm">
            Dashboard : Project Settings → API. Verifie aussi que les Redirect URLs couvrent ton origine (ex. profil,
            reinitialisation mot de passe).
          </p>
        </section>
      </div>
    )
  }

  return <>{children}</>
}
