import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Icon from './Icon'

function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  // Compter les notifications non lues (badge sur Profil)
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    async function load() {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setUnreadCount(count || 0)
    }

    load()

    const channel = supabase
      .channel(`bottomnav-notifs-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        load
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const items = [
    { to: '/', iconName: 'home', label: 'Accueil', exact: true },
    { to: '/annonces', iconName: 'search', label: 'Rechercher' },
    { to: '/vendre', iconName: 'plus', label: 'Publier', central: true },
    { to: user ? '/messages' : '/connexion', iconName: 'message', label: 'Messages' },
    { to: user ? '/profil' : '/connexion', iconName: 'user', label: 'Profil', badge: unreadCount },
  ]

  function isActive(item) {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <nav className="bottom-nav" aria-label="Navigation mobile">
      {items.map((item) => {
        if (item.central) {
          return (
            <Link
              key={item.label}
              to={item.to}
              className="bottom-nav-central"
              aria-label={item.label}
            >
              <span className="bottom-nav-central-btn">
                <Icon name={item.iconName} size={26} strokeWidth={2.5} />
              </span>
              <span className="bottom-nav-central-label">{item.label}</span>
            </Link>
          )
        }

        return (
          <Link
            key={item.label}
            to={item.to}
            className={`bottom-nav-item ${isActive(item) ? 'is-active' : ''}`}
          >
            <span className="bottom-nav-icon">
              <Icon name={item.iconName} size={22} />
              {item.badge > 0 && (
                <span className="bottom-nav-badge">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
