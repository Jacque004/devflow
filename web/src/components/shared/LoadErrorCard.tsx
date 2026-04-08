type LoadErrorCardProps = {
  message: string
  onRetry: () => void
}

export function LoadErrorCard({ message, onRetry }: LoadErrorCardProps) {
  return (
    <article className="card">
      <p className="field-error">{message}</p>
      <button type="button" onClick={onRetry}>
        Reessayer
      </button>
    </article>
  )
}
