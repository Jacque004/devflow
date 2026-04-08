import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Supabase non configuré : définis VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (web/.env ou secrets GitHub Actions pour le build Pages).',
    )
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey)
  }
  return client
}

/**
 * Client Supabase créé à la première utilisation, pas au chargement du module :
 * ainsi l’écran « Configuration Supabase » peut s’afficher sans erreur quand les variables VITE_* manquent (ex. build Pages sans secrets).
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getClient()
    const value = Reflect.get(c as object, prop, c)
    if (typeof value === 'function') {
      return value.bind(c)
    }
    return value
  },
})
