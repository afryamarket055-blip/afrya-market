import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()

  const items = [
    { to: '/', icon: '🏠', label: 'Accueil', exact: true },
    { to: '/annonces', icon: '🔍', label: 'Rechercher' },
    { to: '/vendre', icon: '➕', label: 'Publier' },
    { to: user ? '/messages' : '/connexion', icon: '💬', label: 'Messages' },
    { to: user ? '/profil' : '/connexion', icon: '👤', label: 'Profil' },
  ]

  function isActive(item) {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <nav className="bottom-nav" aria-label="Navigation mobile">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className={`bottom-nav-item ${isActive(item) ? 'is-active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default BottomNav
