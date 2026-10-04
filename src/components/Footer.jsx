import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'

// ----------------------------------------------------------------
// Liens sociaux (à mettre à jour quand les comptes officiels existent)
// ----------------------------------------------------------------
const SOCIALS = {
  whatsapp: 'https://wa.me/22990000000', // ← remplacer par le vrai numéro
  facebook: 'https://facebook.com/afryamarket',
  instagram: 'https://instagram.com/afryamarket',
}

const SECTIONS = [
  {
    key: 'afrya',
    title: 'AFRYA MARKET',
    links: [
      { to: '/a-propos', label: 'À propos' },
      { to: '/comment-ca-marche', label: 'Comment ça marche' },
      { to: '/securite', label: 'Sécurité' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    key: 'acheter',
    title: 'Acheter',
    links: [
      { to: '/annonces', label: 'Toutes les annonces' },
      { to: '/categories', label: 'Catégories' },
      { to: '/demandes', label: 'Demandes' },
      { to: '/favoris', label: 'Mes favoris' },
    ],
  },
  {
    key: 'vendre',
    title: 'Vendre',
    links: [
      { to: '/vendre', label: 'Publier une annonce' },
      { to: '/je-recherche', label: 'Publier une demande' },
      { to: '/mes-annonces', label: 'Mes annonces' },
      { to: '/parametres', label: 'Boutique pro' },
    ],
  },
  {
    key: 'aide',
    title: 'Aide',
    links: [
      { to: '/aide', label: "Centre d'aide" },
      { to: '/signaler', label: 'Signaler un problème' },
      { to: '/conditions', label: "Conditions d'utilisation" },
      { to: '/confidentialite', label: 'Confidentialité' },
    ],
  },
]

// -------------------- Icônes sociales (SVG inline) --------------------
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

// -------------------- Composant Footer --------------------
function Footer() {
  const [openSections, setOpenSections] = useState({})

  function toggle(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <div className="logo">
            AFRYA <span>MARKET</span>
          </div>
          <p>Le marché numérique africain.</p>

          <div className="footer-socials">
            <a
              href={SOCIALS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="footer-social-link"
            >
              <WhatsAppIcon />
            </a>
            <a
              href={SOCIALS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="footer-social-link"
            >
              <FacebookIcon />
            </a>
            <a
              href={SOCIALS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="footer-social-link"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        {SECTIONS.map((section) => {
          const isOpen = !!openSections[section.key]
          return (
            <div key={section.key} className="footer-col footer-col-accordion">
              <button
                type="button"
                className="footer-accordion-trigger"
                onClick={() => toggle(section.key)}
                aria-expanded={isOpen}
              >
                <span>{section.title}</span>
                <span className="footer-accordion-icon">
                  <Icon
                    name={isOpen ? 'chevron-down' : 'chevron-right'}
                    size={16}
                  />
                </span>
              </button>
              <div
                className={
                  'footer-accordion-content' + (isOpen ? ' is-open' : '')
                }
              >
                {section.links.map((link) => (
                  <Link key={link.to + link.label} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} AFRYA MARKET</span>
        <div>
          <Link to="/conditions">Conditions</Link>
          <Link to="/confidentialite">Confidentialité</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
