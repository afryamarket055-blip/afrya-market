function LoadingState({ message = 'Chargement...' }) {
  return (
    <div className="loading-state">
      <p>{message}</p>
    </div>
  )
}

export default LoadingState
