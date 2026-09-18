import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const ICONS = {
  message: '💬',
  like: '❤',
  favorite: '🔖',
  review: '⭐',
  boost_activated: '🚀',
  shop_verified: '🏪',
  system: '🔔',
}

function getIcon(type) {
  return ICONS[type] || '🔔'
}

function formatRelativeDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "a l'instant"
  if (diffMin < 60) return 'il y a ' + diffMin + ' min'
  if (diffH < 24) return 'il y a ' + diffH + 'h'
  if (diffD === 1) return 'hier'
  if (diffD < 7) return 'il y a ' + diffD + ' jours'

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  })
}

function formatDayLabel(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const y = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

  if (d.getTime() === t.getTime()) return "Aujourd'hui"
  if (d.getTime() === y.getTime()) return 'Hier'

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

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

      setNotifications(data || [])
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

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !n.read)
    if (unread.length === 0) return

    setMarkingAll(true)

    const ids = unread.map((n) => n.id)
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', ids)

    setMarkingAll(false)

    if (error) {
      console.error('Erreur mark all read :', error)
      return
    }

    setNotifications((previous) =>
      previous.map((n) => ({ ...n, read: true }))
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Group by day
  const grouped = []
  let currentDay = null
  for (const n of notifications) {
    const day = new Date(n.created_at).toDateString()
    if (day !== currentDay) {
      grouped.push({ type: 'day', label: formatDayLabel(n.created_at), key: 'day-' + day })
      currentDay = day
    }
    grouped.push({ type: 'notif', notif: n })
  }

  return (
    <div className="app notifications-v2">
      <Nav />
      <main className="notifications-page">
        <header className="notifications-header">
          <div>
            <h1>Notifications</h1>
            {!loading && !error && notifications.length > 0 && (
              <p className="notifications-count">
                {unreadCount > 0
                  ? unreadCount + ' non lue' + (unreadCount > 1 ? 's' : '')
                  : 'Tout est a jour'}
              </p>
            )}
          </div>
          {!loading && !error && unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? 'Traitement...' : 'Tout marquer comme lu'}
            </button>
          )}
        </header>

        {loading ? (
          <div className="loading-state">
            <p>Chargement...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>Impossible de charger vos notifications.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>Vous n'avez aucune notification pour l'instant.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {grouped.map((item) => {
              if (item.type === 'day') {
                return (
                  <div key={item.key} className="notifications-day">
                    {item.label}
                  </div>
                )
              }

              const n = item.notif
              return (
                <button
                  key={n.id}
                  type="button"
                  className={'notification-item' + (n.read ? '' : ' is-unread')}
                  onClick={() => handleClick(n)}
                >
                  <div className="notification-icon">
                    {getIcon(n.type)}
                  </div>
                  <div className="notification-body">
                    <p className="notification-content">{n.content}</p>
                    <span className="notification-date">
                      {formatRelativeDate(n.created_at)}
                    </span>
                  </div>
                  {!n.read && <span className="notification-dot" />}
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Notifications
