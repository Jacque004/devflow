/**
 * Appelé uniquement par GitHub Actions avant `vite build`.
 * Écrit web/.env.production pour que Vite charge les VITE_* de façon fiable (évite les soucis d env héritée du shell).
 */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const url = (process.env.VITE_SUPABASE_URL ?? '').trim()
const key = (process.env.VITE_SUPABASE_ANON_KEY ?? '').trim()
const ref = (process.env.VITE_SUPABASE_EXPECTED_REF ?? '').trim()

if (!url || !key) {
  console.error(
    '::error::Configure le dépôt GitHub : Settings → Secrets and variables → Actions. ' +
      'Ajoute les secrets (ou variables) nommés exactement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ' +
      '(valeurs = Project URL et clé anon dans Supabase → Project Settings → API). Puis relance le workflow.',
  )
  process.exit(1)
}

let body = `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_ANON_KEY=${key}\nVITE_APP_ENV=production\n`
if (ref) {
  body += `VITE_SUPABASE_EXPECTED_REF=${ref}\n`
}

writeFileSync(join(root, '.env.production'), body, 'utf8')
console.log('OK: web/.env.production généré pour le build.')
