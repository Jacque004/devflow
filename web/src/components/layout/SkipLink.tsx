/** Lien affiché au premier focus clavier — saute la barre latérale vers le contenu principal. */
export function SkipLink() {
  return (
    <a
      href="#contenu-principal"
      className="skip-to-main"
    >
      Aller au contenu principal
    </a>
  )
}
