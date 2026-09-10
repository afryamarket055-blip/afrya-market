function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      {title && <h3>{title}</h3>}
      {message && <p>{message}</p>}
      {action && <div style={{ marginTop: '12px' }}>{action}</div>}
    </div>
  )
}

export default EmptyState
