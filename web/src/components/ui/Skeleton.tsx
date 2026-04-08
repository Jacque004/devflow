type SkeletonProps = {
  height?: number
  className?: string
}

export function Skeleton({ height = 16, className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`.trim()} style={{ height }} aria-hidden="true" />
}
