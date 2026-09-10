import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement notifications :', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      setNotifications(data)
      setLoading(false)
    }

    loadNotifications()
  }, [user])

  async function handleClick(notification) {
    if (!notification.read) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id)

      setNotifications((previous) =>
        previous.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      )
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  return (
    <div className="app">
      <Nav />
      <main style={{ padding: '40px 20px', maxWidth: '650px', margin: '0 auto' }}>
        <h1>Notifications</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p>Impossible de charger vos notifications. Réessayez plus tard.</p>
        ) : notifications.length === 0 ? (
          <p>Vous n'avez aucune notification pour l'instant.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleClick(notification)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: notification.read ? 'white' : '#eff6ff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0 }}>{notification.content}</p>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                {!notification.read && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#1d4ed8',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Notifications
