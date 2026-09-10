import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function Nav() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  useEffect(() => {
    if (!user) return

    async function loadUnreadCount() {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Erreur chargement notifications :', error)
        return
      }

      setUnreadCount(count || 0)
    }

    loadUnreadCount()

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setUnreadCount((previous) => previous + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          AFRYA <span>MARKET</span>
        </Link>

        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
          <Link to="/" onClick={closeMenu}>Accueil</Link>
          <Link to="/categories" onClick={closeMenu}>Catégories</Link>
          <Link to="/annonces" onClick={closeMenu}>Annonces</Link>
          <Link to="/messages" onClick={closeMenu}>Messages</Link>

          {user && (
            <>
              <Link to="/notifications" onClick={closeMenu} className="nav-bell">
                🔔 Notifications
                {unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </Link>
              <Link to="/profil" onClick={closeMenu}>Mon profil</Link>
              <Link to="/mes-annonces" onClick={closeMenu}>Mes annonces</Link>
              <button
                type="button"
                className="btn btn-secondary nav-signout"
                onClick={handleSignOut}
              >
                Déconnexion
              </button>
            </>
          )}
          {!user && (
            <Link to="/connexion" onClick={closeMenu}>Connexion</Link>
          )}
        </nav>

        <div className="site-header-actions">
          <Link to="/vendre" className="btn btn-primary sell-button">
            + Vendre un article
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Nav
