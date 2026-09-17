import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function Nav() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const userMenuRef = useRef(null)

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    setUserMenuOpen(false)
    navigate('/')
  }

  useEffect(() => {
    async function loadAdminStatus() {
      if (!user) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      setIsAdmin(!!data?.is_admin)
    }
    loadAdminStatus()
  }, [user])

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function closeMenu() {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          AFRYA <span>MARKET</span>
        </Link>

        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
          <Link to="/" onClick={closeMenu}>Accueil</Link>
          <Link to="/annonces" onClick={closeMenu}>Annonces</Link>
          <Link to="/categories" onClick={closeMenu}>Catégories</Link>

          {user && (
            <>
              <Link to="/messages" onClick={closeMenu} className="site-nav-secondary">Messages</Link>
              <Link to="/notifications" onClick={closeMenu} className="site-nav-secondary">Notifications</Link>
              <Link to="/profil" onClick={closeMenu} className="site-nav-secondary">Mon profil</Link>
              <Link to="/mes-annonces" onClick={closeMenu} className="site-nav-secondary">Mes annonces</Link>
              <Link to="/favoris" onClick={closeMenu} className="site-nav-secondary">Mes favoris</Link>
              <button
                type="button"
                className="btn btn-secondary nav-signout site-nav-secondary"
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
          {user && (
            <>
              <Link
                to="/notifications"
                className="header-icon-btn nav-bell"
                aria-label="Notifications"
                onClick={closeMenu}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </Link>

              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  👤 Mon compte
                  <span className="user-menu-chevron">▾</span>
                </button>

                {userMenuOpen && (
                  <div className="user-menu-panel">
                    <Link to="/messages" onClick={closeMenu}>Messages</Link>
                    <Link to="/profil" onClick={closeMenu}>Mon profil</Link>
                    <Link to="/mes-annonces" onClick={closeMenu}>Mes annonces</Link>
                    <Link to="/favoris" onClick={closeMenu}>Mes favoris</Link>
                    <Link to="/parametres" onClick={closeMenu}>Parametres</Link>

                    {isAdmin && (
                      <>
                        <Link to="/admin/signalements" onClick={closeMenu}>
                          Admin - Signalements
                        </Link>
                        <Link to="/admin/boosts" onClick={closeMenu}>
                          Admin - Boosts
                        </Link>
                      </>
                    )}
                    <div className="user-menu-sep" />
                    <button
                      type="button"
                      className="user-menu-signout"
                      onClick={handleSignOut}
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <Link to="/connexion" className="btn btn-secondary">
              Connexion
            </Link>
          )}

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
