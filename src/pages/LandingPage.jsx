import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FEATURED_CATEGORIES_RENDER } from '../constants/categories'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PageMeta from '../components/PageMeta'
import Icon from '../components/Icon'
import SkeletonList from '../components/SkeletonList'
import ListingCard from '../ListingCard'
import useVerifiedSellers from '../hooks/useVerifiedSellers'
import { supabase } from '../lib/supabase'

const FEATURES = [
  { iconName: 'rocket', title: 'Gratuit', text: 'Publiez vos annonces en 30 secondes.' },
  { iconName: 'map-pin', title: 'Près de vous', text: 'Trouvez ce qui se vend dans votre ville.' },
  { iconName: 'message', title: 'Direct', text: 'Discutez avec les vendeurs, sans intermédiaire.' },
  { iconName: 'shield', title: 'Sécurisé', text: 'Profils vérifiés, transactions en confiance.' },
]

const STEPS = [
  { num: 1, iconName: 'search', title: 'Recherchez', text: 'Trouvez le produit qui vous intéresse près de chez vous.' },
  { num: 2, iconName: 'message', title: 'Contactez', text: 'Échangez directement avec le vendeur, sans intermédiaire.' },
  { num: 3, iconName: 'handshake', title: 'Concluez', text: 'Rencontrez-vous, vérifiez et finalisez en confiance.' },
]

const CATEGORIES = FEATURED_CATEGORIES_RENDER

function LandingPage() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ listings: null, demands: null })
  const [searchText, setSearchText] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [recentListings, setRecentListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const verifiedIds = useVerifiedSellers(recentListings)

  function handleSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchText.trim()) params.set('q', searchText.trim())
    if (searchLocation.trim()) params.set('loc', searchLocation.trim())
    const qs = params.toString()
    navigate('/annonces' + (qs ? '?' + qs : ''))
  }

  useEffect(() => {
    async function loadCounts() {
      const [listingsRes, demandsRes] = await Promise.all([
        supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'disponible'),
        supabase
          .from('demands')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
      ])
      setCounts({
        listings: listingsRes.count || 0,
        demands: demandsRes.count || 0,
      })
    }
    loadCounts()
  }, [])

  useEffect(() => {
    async function loadRecentListings() {
      setListingsLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'disponible')
        .order('boosted_until', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) {
        console.error('Erreur chargement annonces recentes :', error)
        setListingsLoading(false)
        return
      }
      setRecentListings(data || [])
      setListingsLoading(false)
    }
    loadRecentListings()
  }, [])

  return (
    <>
      <PageMeta
        title="AFRYA MARKET — Achetez et vendez d'occasion au Bénin"
        description="AFRYA MARKET, la marketplace béninoise pour acheter et vendre des produits d'occasion en toute confiance, partout au Bénin."
      />
      <div className="app">
      <Nav />
      <main>
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <span className="hero-badge"><span className="hero-badge-dot" />Marketplace Bénin · Afrique de l&apos;Ouest</span>
            <h1>
              Achetez. Vendez.
              <br />
              <span>Trouvez.</span>
            </h1>
            {counts.listings !== null && counts.demands !== null && (
              <p className="landing-hero-stats">
                <span>
                  <strong>{counts.listings}</strong> annonce{counts.listings > 1 ? 's' : ''}
                </span>
                <span className="landing-hero-stats-dot">·</span>
                <span>
                  <strong>{counts.demands}</strong> demande{counts.demands > 1 ? 's' : ''} active{counts.demands > 1 ? 's' : ''}
                </span>
              </p>
            )}
            <form className="landing-hero-search" onSubmit={handleSearch}>
              <div className="landing-hero-search-field">
                <Icon name="search" size={18} />
                <input
                  type="text"
                  placeholder="Que recherchez-vous ?"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  aria-label="Mot-clé"
                />
              </div>
              <div className="landing-hero-search-field">
                <Icon name="map-pin" size={18} />
                <input
                  type="text"
                  placeholder="Où ?"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  aria-label="Ville"
                />
              </div>
              <button type="submit" className="landing-hero-search-btn">
                <Icon name="search" size={18} />
                <span>Rechercher</span>
              </button>
            </form>

            <p className="landing-hero-subtitle">
              AFRYA MARKET connecte acheteurs et vendeurs partout au Bénin —
              simplement, rapidement et en toute confiance.
            </p>
            <div className="landing-hero-actions">
              <Link to="/vendre" className="btn btn-primary btn-lg">
                + Vendre un article
              </Link>
              <Link to="/je-recherche" className="btn btn-secondary btn-lg">
                <Icon name="search" size={18} />
                <span>Je recherche un article</span>
              </Link>
            </div>
            <p className="landing-hero-secondary-cta">
              <Link to="/annonces">Ou parcourir les annonces existantes →</Link>
            </p>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-container">
            <div className="landing-features-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="landing-feature">
                  <div className="landing-feature-icon"><Icon name={f.iconName} size={28} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-recent">
          <div className="landing-container">
            <div className="landing-section-heading landing-section-heading-row">
              <div>
                <span>RÉCEMMENT AJOUTÉS</span>
                <h2>Les dernières annonces</h2>
              </div>
              <Link to="/annonces" className="landing-see-all">
                Voir tout
                <Icon name="chevron-right" size={16} />
              </Link>
            </div>

            {listingsLoading ? (
              <SkeletonList count={8} />
            ) : recentListings.length === 0 ? (
              <div className="landing-empty">
                <div className="landing-empty-icon">
                  <Icon name="package" size={40} />
                </div>
                <p>Les premières annonces arrivent bientôt.</p>
                <Link to="/vendre" className="btn btn-primary">
                  Publier la première annonce
                </Link>
              </div>
            ) : (
              <div className="listing-grid">
                {recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={'/annonce/' + listing.id}
                    className="listing-link"
                  >
                    <ListingCard
                      id={listing.id}
                      title={listing.title}
                      price={listing.price}
                      location={listing.location}
                      condition={listing.condition}
                      category={listing.category}
                      image={listing.image}
                      status={listing.status}
                      boostedUntil={listing.boosted_until}
                      sellerVerified={verifiedIds.has(listing.user_id)}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="landing-how">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span>COMMENT ÇA MARCHE</span>
              <h2>3 étapes simples</h2>
            </div>
            <div className="landing-steps">
              {STEPS.map((s) => (
                <div key={s.num} className="landing-step">
                  <div className="landing-step-num">{s.num}</div>
                  <div className="landing-step-icon"><Icon name={s.iconName} size={32} /></div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-categories">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span>EXPLORER</span>
              <h2>Catégories populaires</h2>
            </div>
            <div className="category-scroll">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.name}
                  to={'/annonces?category=' + encodeURIComponent(c.name)}
                  className="category-pill"
                >
                  <span className="category-pill-icon">
                    <Icon name={c.iconName} size={20} />
                  </span>
                  <span className="category-pill-label">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-inner">
            <h2>Prêt à rejoindre le marché ?</h2>
            <p>Vendez ce qui dort chez vous, ou trouvez l'article qu'il vous faut.</p>
            <div className="landing-cta-actions">
              <Link to="/vendre" className="btn btn-primary btn-lg">
                + Vendre un article
              </Link>
              <Link to="/je-recherche" className="btn btn-secondary btn-lg">
                <Icon name="search" size={18} />
                <span>Je recherche un article</span>
              </Link>
            </div>
            <p className="landing-cta-note">
              Pas encore de compte ? <Link to="/inscription">Créer un compte gratuit</Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  )
}

export default LandingPage
