import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Déploiement projet GitHub Pages : https://<user>.github.io/<repo>/
// Sans ce base, les assets pointent vers /assets/... (404). En CI, GITHUB_ACTIONS est défini.
const pagesBase = process.env.GITHUB_ACTIONS === 'true' ? '/devflow/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base: pagesBase,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
