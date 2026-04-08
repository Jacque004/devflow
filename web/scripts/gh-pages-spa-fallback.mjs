import { copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
copyFileSync(join(root, 'index.html'), join(root, '404.html'))
console.log('dist/404.html copié depuis dist/index.html (SPA GitHub Pages)')
