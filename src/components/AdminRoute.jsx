import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false)
        return
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur check admin :', error)
        setIsAdmin(false)
        return
      }
      setIsAdmin(!!data?.is_admin)
    }
    checkAdmin()
  }, [user])

  if (authLoading || isAdmin === null) {
    return (
      <div className="app">
        <main className="loading-state">
          <p>Verification des droits...</p>
        </main>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
