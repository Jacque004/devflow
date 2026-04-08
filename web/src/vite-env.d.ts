/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_ENV: string
  /** Sous-domaine du projet (xxxx dans https://xxxx.supabase.co) — optionnel, pour refuser une mauvaise URL */
  readonly VITE_SUPABASE_EXPECTED_REF?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
