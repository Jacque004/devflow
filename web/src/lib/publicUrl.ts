/** Fichiers servis depuis public/ — préfixe base Vite (ex. /devflow/ sur GitHub Pages). */
export function publicUrl(path: string): string {
  const p = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${p}`
}
