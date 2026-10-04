import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Icon from './Icon'

function Nav() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [ordersCount, setOrdersCount] = useState(0)
  const userMenuRef = useRef(null)

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    setUserMenuOpen(false)
    navigate('/')
  }

  useEffect(() => {
    async function loadOrdersCount() {
      if (!user) {
        setOrdersCount(0)
        return
      }
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .in('status', ['pending', 'paid', 'delivered'])

      setOrdersCount(count || 0)
    }
    loadOrdersCount()
  }, [user])

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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Mon compte'

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          AFRYA <span>MARKET</span>
        </Link>

        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
          {/* ============ MOBILE DRAWER ============ */}
          <div className="site-nav-mobile-only">
            <div className="site-nav-mobile-header">
              <div className="site-nav-user">
                <div className="site-nav-user-avatar">
                  <Icon name="user" size={22} />
                </div>
                <div className="site-nav-user-info">
                  <strong>{user ? displayName : 'Bienvenue'}</strong>
                  <span className="site-nav-user-sub">
                    {user ? 'Mon compte' : 'Connectez-vous'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="site-nav-close"
                onClick={closeMenu}
                aria-label="Fermer le menu"
              >
                <Icon name="x" size={22} />
              </button>
            </div>

            <div className="site-nav-group">
              <span className="site-nav-group-title">Explorer</span>
              <Link to="/" onClick={closeMenu}>
                <Icon name="home" size={18} />
                <span>Accueil</span>
              </Link>
              <Link to="/annonces" onClick={closeMenu}>
                <Icon name="package" size={18} />
                <span>Annonces</span>
              </Link>
              <Link to="/categories" onClick={closeMenu}>
                <Icon name="tag" size={18} />
                <span>Catégories</span>
              </Link>
              <Link to="/je-recherche" onClick={closeMenu}>
                <Icon name="search" size={18} />
                <span>Je recherche</span>
              </Link>
              <Link to="/demandes" onClick={closeMenu}>
                <Icon name="target" size={18} />
                <span>Demandes</span>
              </Link>
            </div>

            {user && (
              <div className="site-nav-group">
                <span className="site-nav-group-title">Mon compte</span>
                <Link to="/profil" onClick={closeMenu}>
                  <Icon name="user" size={18} />
                  <span>Mon profil</span>
                </Link>
                <Link to="/mes-annonces" onClick={closeMenu}>
                  <Icon name="package" size={18} />
                  <span>Mes annonces</span>
                </Link>
                <Link to="/mes-demandes" onClick={closeMenu}>
                  <Icon name="target" size={18} />
                  <span>Mes demandes</span>
                </Link>
                <Link to="/favoris" onClick={closeMenu}>
                  <Icon name="heart" size={18} />
                  <span>Mes favoris</span>
                </Link>
                <Link to="/notifications" onClick={closeMenu}>
                  <Icon name="bell" size={18} />
                  <span>Notifications</span>
                </Link>
              </div>
            )}

            {!user && (
              <div className="site-nav-auth">
                <Link to="/connexion" onClick={closeMenu} className="btn btn-secondary">
                  <Icon name="log-in" size={16} />
                  <span>Connexion</span>
                </Link>
                <Link to="/inscription" onClick={closeMenu} className="btn btn-primary">
                  <Icon name="user-plus" size={16} />
                  <span>Créer un compte</span>
                </Link>
              </div>
            )}

            {user && (
              <button
                type="button"
                className="site-nav-signout"
                onClick={handleSignOut}
              >
                <Icon name="log-out" size={18} />
                <span>Déconnexion</span>
              </button>
            )}
          </div>

          {/* ============ DESKTOP ============ */}
          <div className="site-nav-desktop-only">
            <Link to="/" onClick={closeMenu}>Accueil</Link>
            <Link to="/annonces" onClick={closeMenu}>Annonces</Link>
            <Link to="/categories" onClick={closeMenu}>Catégories</Link>
            <Link to="/je-recherche" onClick={closeMenu}>Je recherche</Link>
            <Link to="/demandes" onClick={closeMenu}>Demandes</Link>

            {user && (
              <>
                <Link to="/messages" onClick={closeMenu} className="site-nav-secondary">Messages</Link>
                <Link to="/notifications" onClick={closeMenu} className="site-nav-secondary">Notifications</Link>
                <Link to="/profil" onClick={closeMenu} className="site-nav-secondary">Mon profil</Link>
                <Link to="/mes-annonces" onClick={closeMenu} className="site-nav-secondary">Mes annonces</Link>
                <Link to="/mes-demandes" onClick={closeMenu} className="site-nav-secondary">Mes demandes</Link>
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
          </div>
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
                <Icon name="bell" size={20} />
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
                  <Icon name="user" size={16} />
                  <span>Mon compte</span>
                  {ordersCount > 0 && (
                    <span className="nav-orders-badge">{ordersCount}</span>
                  )}
                  <Icon name="chevron-down" size={14} className="user-menu-chevron" />
                </button>

                {userMenuOpen && (
                  <div className="user-menu-panel">
                    <Link to="/messages" onClick={closeMenu}>Messages</Link>
                    <Link to="/profil" onClick={closeMenu}>Mon profil</Link>
                    <Link to="/mes-annonces" onClick={closeMenu}>Mes annonces</Link>
                    <Link to="/mes-commandes" onClick={closeMenu}>Mes commandes</Link>
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
                        <Link to="/admin/boutiques" onClick={closeMenu}>
                          Admin - Boutiques
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
            {menuOpen ? <Icon name="x" size={22} /> : <Icon name="menu" size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Nav
