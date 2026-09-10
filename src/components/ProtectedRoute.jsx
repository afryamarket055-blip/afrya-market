import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="app">
        <main className="loading-state">
          <p>Chargement...</p>
        </main>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
