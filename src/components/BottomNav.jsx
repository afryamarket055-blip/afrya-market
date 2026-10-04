import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()

  const items = [
    { to: '/', iconName: 'home', label: 'Accueil', exact: true },
    { to: '/annonces', iconName: 'search', label: 'Rechercher' },
    { to: '/vendre', iconName: 'plus-circle', label: 'Publier' },
    { to: user ? '/messages' : '/connexion', iconName: 'message', label: 'Messages' },
    { to: user ? '/profil' : '/connexion', iconName: 'user', label: 'Profil' },
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
          <span className="bottom-nav-icon">
            <Icon name={item.iconName} size={22} />
          </span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default BottomNav
