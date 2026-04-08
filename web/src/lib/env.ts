/**
 * Identifiant du projet heberge (partie avant .supabase.co). null pour une stack locale ou une URL inattendue.
 */
export function parseSupabaseProjectRef(supabaseUrl: string): string | null {
  try {
    const { hostname } = new URL(supabaseUrl)
    const match = /^([a-z0-9_-]+)\.supabase\.co$/i.exec(hostname)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

function readRawEnv() {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() ?? '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '',
    appEnv: import.meta.env.VITE_APP_ENV ?? 'development',
    expectedProjectRef: import.meta.env.VITE_SUPABASE_EXPECTED_REF?.trim() ?? '',
  }
}

/** Problemes de config qui empechent d utiliser le bon projet Supabase (ou tout projet). */
export function getSupabaseConfigIssues(): string[] {
  const { supabaseUrl, supabaseAnonKey, expectedProjectRef } = readRawEnv()
  const issues: string[] = []

  if (!supabaseUrl) {
    issues.push('VITE_SUPABASE_URL est vide : copie l URL du projet (Settings → API) dans web/.env')
  }
  if (!supabaseAnonKey) {
    issues.push('VITE_SUPABASE_ANON_KEY est vide : copie la cle anon du meme projet dans web/.env')
  }

  if (supabaseUrl && supabaseAnonKey && expectedProjectRef) {
    const parsed = parseSupabaseProjectRef(supabaseUrl)
    if (parsed !== null && parsed !== expectedProjectRef) {
      issues.push(
        `L URL pointe vers le projet "${parsed}" mais VITE_SUPABASE_EXPECTED_REF indique "${expectedProjectRef}". Les modeles Auth du dashboard s appliquent au projet dont l URL est dans .env.`,
      )
    }
  }

  return issues
}

export const env = readRawEnv()

for (const key of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const) {
  if (!import.meta.env[key]) {
    console.warn(`[DevFlow] Variable manquante: ${key}`)
  }
}
