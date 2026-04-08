import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description: string
  /** Icone decorative (accessibilite : masquee aux lecteurs d'ecran). */
  icon?: LucideIcon
}

export function EmptyState({ title, description, icon: Icon }: EmptyStateProps) {
  return (
    <div className="empty-state flex flex-col gap-3 sm:flex-row sm:items-start">
      {Icon ? (
        <span className="shrink-0 text-[var(--muted)] opacity-85" aria-hidden>
          <Icon className="h-10 w-10 stroke-[1.35]" strokeLinecap="round" strokeLinejoin="round" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3>{title}</h3>
        <p className="muted">{description}</p>
      </div>
    </div>
  )
}
