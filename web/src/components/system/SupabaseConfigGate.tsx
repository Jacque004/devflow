import type { ReactNode } from 'react'
import { getSupabaseConfigIssues } from '../../lib/env'

type Props = {
  children: ReactNode
}

function detectGithubPages(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname.endsWith('github.io')
}

/**
 * Empeche de lancer l app si .env ne cible pas un projet Supabase utilisable :
 * tous les appels auth (login, inscription, mails, etc.) passent par le client defini ici.
 */
export function SupabaseConfigGate({ children }: Props) {
  const onGithubPages = detectGithubPages()
  const issues = getSupabaseConfigIssues(onGithubPages ? 'github-pages' : 'local')

  if (issues.length > 0) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-[var(--bg)]">
        <section className="auth-card max-w-lg w-full" role="alert">
          <h1 className="text-xl font-semibold mb-2">Configuration Supabase</h1>
          {onGithubPages ? (
            <>
              <p className="muted mb-4">
                Sur GitHub Pages il n y a pas de fichier <code className="text-sm">.env</code> : les variables{' '}
                <code className="text-sm">VITE_*</code> doivent etre injectees <strong>au moment du build</strong> sur
                GitHub Actions (elles sont alors figees dans le JavaScript deploye).
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-[0.95rem] text-[var(--text)] mb-4">
                <li>
                  Depot GitHub → <strong>Settings</strong> → <strong>Secrets and variables</strong> →{' '}
                  <strong>Actions</strong> → <strong>New repository secret</strong>.
                </li>
                <li>
                  Cree <code className="text-sm">VITE_SUPABASE_URL</code> (Project URL) et{' '}
                  <code className="text-sm">VITE_SUPABASE_ANON_KEY</code> (cle anon) — memes valeurs que dans le
                  dashboard Supabase → Project Settings → API.
                </li>
                <li>
                  Onglet <strong>Actions</strong> → workflow <strong>Deploy GitHub Pages</strong> →{' '}
                  <strong>Run workflow</strong> (ou pousse un commit) pour regenere le site.
                </li>
              </ol>
            </>
          ) : (
            <p className="muted mb-4">
              Les flux d authentification necessitent le <strong>meme projet</strong> Supabase que ton dashboard : URL +
              cle anon dans <code className="mx-1 text-sm">web/.env</code> (voir <code className="text-sm">.env.example</code>
              ).
            </p>
          )}
          <ul className="list-disc pl-5 space-y-2 text-[0.95rem] text-[var(--text)] mb-6">
            {issues.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
          <p className="muted text-sm">
            Supabase : Project Settings → API. Dans Authentication → URL Configuration, ajoute ton URL de site (ex.{' '}
            <code className="text-sm">https://&lt;user&gt;.github.io/devflow/</code>) dans Site URL et Redirect URLs si
            besoin.
          </p>
        </section>
      </div>
    )
  }

  return <>{children}</>
}
