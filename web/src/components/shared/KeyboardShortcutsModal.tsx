import { Modal } from '../ui/Modal'

const ROWS = [
  {
    keys: '/',
    description: 'Placer le focus dans le champ de recherche global (sur les pages qui en proposent un).',
  },
  {
    keys: '?',
    description: "Afficher cette fenetre d'aide.",
  },
  {
    keys: 'Échap',
    description: 'Fermer la fenetre modale ouverte.',
  },
] as const

type KeyboardShortcutsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal title="Raccourcis clavier" isOpen={isOpen} onClose={onClose}>
      <ul className="flex list-none flex-col gap-3 p-0 text-sm">
        {ROWS.map((row) => (
          <li key={row.keys} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
            <kbd className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-xs font-medium text-[var(--text)]">
              {row.keys}
            </kbd>
            <span className="text-[var(--muted)]">{row.description}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
