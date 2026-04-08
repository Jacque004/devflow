import { getSupabaseConfigIssues } from './env'

type ReportContext = Record<string, unknown>

export async function reportError(error: Error, context?: ReportContext) {
  console.error('[DevFlow]', error, context)

  if (getSupabaseConfigIssues().length > 0) {
    return
  }

  // Import dynamique : ne pas charger @supabase/supabase-js dans le bundle initial
  // (sinon modulepreload + exécution au démarrage même si la config manque).
  const { supabase } = await import('./supabase')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const { error: insertError } = await supabase.from('error_logs').insert({
    user_id: user.id,
    message: error.message.slice(0, 2000),
    stack: error.stack ? error.stack.slice(0, 8000) : null,
    context: context ?? null,
    url: typeof window !== 'undefined' ? window.location.href : null,
  })

  if (insertError) {
    console.warn('[DevFlow] Impossible d\'enregistrer l\'erreur:', insertError.message)
  }
}

export function initGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    const err = event.error instanceof Error ? event.error : new Error(event.message)
    void reportError(err, {
      type: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const err = reason instanceof Error ? reason : new Error(String(reason))
    void reportError(err, { type: 'unhandledrejection' })
  })
}
