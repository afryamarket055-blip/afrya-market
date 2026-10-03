function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line-lg" />
        <div className="skeleton-line skeleton-line-sm" />
        <div className="skeleton-line skeleton-line-xs" />
      </div>
    </div>
  )
}

export default SkeletonCard
