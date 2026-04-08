import { Skeleton } from '../ui/Skeleton'

/** Bloc de chargement aligne sur les cartes de contenu (titre + ligne secondaire). */
export function PageSectionSkeleton() {
  return (
    <article className="card">
      <Skeleton height={26} className="w-4/5 max-w-md" />
      <Skeleton height={18} className="mt-3 w-full max-w-sm" />
    </article>
  )
}
