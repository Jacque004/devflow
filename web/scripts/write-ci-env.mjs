/**
 * Appelé uniquement par GitHub Actions avant `vite build`.
 * Écrit web/.env.production pour que Vite charge les VITE_* de façon fiable.
 *
 * Ordre de priorité : variables d’environnement (secrets / vars GitHub), puis web/ci/pages.env.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function parseDotenv(content) {
  const out = {}
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

function loadPagesEnvFile() {
  const path = join(root, 'ci', 'pages.env')
  try {
    return parseDotenv(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

let url = (process.env.VITE_SUPABASE_URL ?? '').trim()
let key = (process.env.VITE_SUPABASE_ANON_KEY ?? '').trim()
let ref = (process.env.VITE_SUPABASE_EXPECTED_REF ?? '').trim()

const fileEnv = loadPagesEnvFile()
if (fileEnv) {
  if (!url) url = (fileEnv.VITE_SUPABASE_URL ?? '').trim()
  if (!key) key = (fileEnv.VITE_SUPABASE_ANON_KEY ?? '').trim()
  if (!ref) ref = (fileEnv.VITE_SUPABASE_EXPECTED_REF ?? '').trim()
}

if (!url || !key) {
  console.error(
    '::error::VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants. ' +
      'Définis les secrets / variables GitHub (VITE_*), ou remplis et commit web/ci/pages.env (voir pages.env.example).',
  )
  process.exit(1)
}

let body = `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_ANON_KEY=${key}\nVITE_APP_ENV=production\n`
if (ref) {
  body += `VITE_SUPABASE_EXPECTED_REF=${ref}\n`
}

writeFileSync(join(root, '.env.production'), body, 'utf8')
console.log('OK: web/.env.production généré pour le build.')
