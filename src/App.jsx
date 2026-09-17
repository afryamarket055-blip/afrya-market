import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import './App.css'
import ListingCard from './ListingCard'
import ListingDetails from './pages/ListingDetails'
import CreateListing from './pages/CreateListing'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import MyListings from './pages/MyListings'
import LandingPage from './pages/LandingPage'
import EditListing from './pages/EditListing'
import Conversation from './pages/Conversation'
import Messages from './pages/Messages'
import PublicProfile from './pages/PublicProfile'
import Notifications from './pages/Notifications'
import Favorites from './pages/Favorites'
import Settings from './pages/Settings'
import AdminReports from './pages/AdminReports'
import Booster from './pages/Booster'
import AdminRoute from './components/AdminRoute'
import { useAuth } from './context/AuthContext'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'

function Home({ listings, loading, error }) {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  function handleSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchText.trim()) params.set('q', searchText.trim())
    if (searchLocation.trim()) params.set('loc', searchLocation.trim())
    const qs = params.toString()
    navigate('/annonces' + (qs ? '?' + qs : ''))
  }

  const CATEGORIES = [
    { icon: '📱', name: 'Téléphones', desc: 'Smartphones & accessoires' },
    { icon: '💻', name: 'Informatique', desc: 'PC, laptops & accessoires' },
    { icon: '📺', name: 'Électroménager', desc: 'TV, frigos & appareils' },
    { icon: '👕', name: 'Mode', desc: 'Vêtements & chaussures' },
    { icon: '🛋', name: 'Maison', desc: 'Meubles & décoration' },
    { icon: '🏍', name: 'Véhicules', desc: 'Motos, voitures & pièces' },
  ]

  return (
    <div className="app">
      <Nav />
      <main>
        <section className="home-hero">
          <div className="home-hero-inner">
            <span className="home-hero-greeting">Bonjour 👋</span>
            <h1>Que cherchez-vous aujourd'hui ?</h1>
            <p className="home-hero-subtitle">
              Des milliers d'annonces près de chez vous.
            </p>

            <form className="home-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <input
                type="text"
                placeholder="📍 Où ?"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Rechercher
              </button>
            </form>
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading">
            <div>
              <span>EXPLORER</span>
              <h2>Catégories populaires</h2>
            </div>
          </div>

          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={'/annonces?category=' + encodeURIComponent(cat.name)}
                className="category-card"
              >
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading">
            <div>
              <span>RÉCEMMENT AJOUTÉS</span>
              <h2>Les dernières annonces</h2>
            </div>
            <Link to="/annonces">Voir tout →</Link>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Chargement des annonces...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p>Impossible de charger les annonces. Réessayez plus tard.</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <p>Aucune annonce pour l'instant.</p>
            </div>
          ) : (
            <div className="listing-grid">
              {listings.map((listing) => (
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
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-brand">
            <div className="logo">AFRYA <span>MARKET</span></div>
            <p>Le marché numérique africain.</p>
          </div>

          <div className="footer-col">
            <h4>AFRYA MARKET</h4>
            <a href="#">À propos</a>
            <a href="#">Comment ça marche</a>
            <a href="#">Sécurité</a>
          </div>

          <div className="footer-col">
            <h4>Acheter</h4>
            <Link to="/annonces">Annonces</Link>
            <Link to="/categories">Catégories</Link>
            <a href="#">Favoris</a>
          </div>

          <div className="footer-col">
            <h4>Vendre</h4>
            <Link to="/vendre">Publier une annonce</Link>
            <Link to="/mes-annonces">Mes annonces</Link>
            <a href="#">Vendre professionnellement</a>
          </div>

          <div className="footer-col">
            <h4>Aide</h4>
            <a href="#">Centre d'aide</a>
            <a href="#">Contact</a>
            <a href="#">Signaler un problème</a>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} AFRYA MARKET</span>
          <div>
            <a href="#">Conditions</a>
            <a href="#">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SimplePage({ title }) {
  return (
    <div className="app">
           <Nav />

      <main
        style={{
          padding: '80px 20px',
          textAlign: 'center',
        }}
      >
        <h1>{title}</h1>

        <p>
          Cette page sera construite à l'étape suivante.
        </p>

        <Link to="/">
          ← Retour à l'accueil
        </Link>
      </main>
    </div>
  )
}

function AllListings({ listings, loading, error }) {
  const [userLocation, setUserLocation] = useState(null)
  const [locationMessage, setLocationMessage] = useState("")
  const [userCity, setUserCity] = useState(null)
  const [showNearby, setShowNearby] = useState(false)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [searchCategory, setSearchCategory] = useState(searchParams.get('category') || '')

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setSearchCategory(searchParams.get('category') || '')
  }, [searchParams])

  async function handleGetLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        'La geolocalisation n est pas disponible sur cet appareil.'
      )
      return
    }
    setLocationMessage('Recherche de votre localisation...')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fr`
          )
          const data = await response.json()
          const address = data.address || {}
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            'Ville inconnue'
          setUserCity(city)
          setLocationMessage(`Localisation detectee : ${city}`)
        } catch (error) {
          setLocationMessage(
            `Position detectee : ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          )
        }
      },
      () => {
        setLocationMessage(
          'Localisation refusee ou indisponible. Vous pouvez continuer sans elle.'
        )
      }
    )
  }

  function resetSearch() {
    setSearch('')
    setSearchCategory('')
    setShowNearby(false)
  }

  const filteredListings = listings.filter((listing) => {
    if (searchCategory && listing.category !== searchCategory) {
      return false
    }
    if (showNearby && userCity) {
      const listingLocation = (listing.location || '').toLowerCase()
      if (!listingLocation.includes(userCity.toLowerCase())) {
        return false
      }
    }
    const searchText = search.toLowerCase()
    return (
      listing.title?.toLowerCase().includes(searchText) ||
      listing.location?.toLowerCase().includes(searchText) ||
      listing.category?.toLowerCase().includes(searchText)
    )
  })

  const hasActiveFilter = search || searchCategory || showNearby

  return (
    <div className="app">
      <Nav />

      <main>
        <section className="listings">
          <div className="all-listings-header">
            <div>
              <h1>Toutes les annonces</h1>
              <p className="all-listings-count">
                {loading
                  ? 'Chargement...'
                  : filteredListings.length + ' annonce' + (filteredListings.length > 1 ? 's' : '') + ' trouvee' + (filteredListings.length > 1 ? 's' : '')}
              </p>
            </div>
            <Link to="/vendre" className="btn btn-primary">
              + Vendre un article
            </Link>
          </div>

          <div className="all-listings-toolbar">
            <div className="all-listings-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Rechercher une annonce..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              className="toolbar-btn"
              onClick={handleGetLocation}
            >
              📍 {userCity ? userCity : 'Localisation'}
            </button>

            <button type="button" className="toolbar-btn" disabled>
              ⚙ Filtrer
            </button>

            <button type="button" className="toolbar-btn" disabled>
              ↕ Trier
            </button>
          </div>

          {(searchCategory || showNearby || locationMessage) && (
            <div className="all-listings-chips">
              {searchCategory && (
                <div className="filter-chip">
                  Categorie : <strong>{searchCategory}</strong>
                  <button
                    type="button"
                    onClick={() => setSearchCategory('')}
                    aria-label="Retirer le filtre categorie"
                  >
                    ✕
                  </button>
                </div>
              )}
              {showNearby && userCity && (
                <div className="filter-chip">
                  📍 Pres de <strong>{userCity}</strong>
                  <button
                    type="button"
                    onClick={() => setShowNearby(false)}
                    aria-label="Retirer le filtre localisation"
                  >
                    ✕
                  </button>
                </div>
              )}
              {locationMessage && (
                <p className="location-message">{locationMessage}</p>
              )}
            </div>
          )}

          {userCity && !showNearby && (
            <button
              type="button"
              className="nearby-toggle"
              onClick={() => setShowNearby(true)}
            >
              📍 Voir les annonces pres de {userCity}
            </button>
          )}

          {loading ? (
            <div className="loading-state">
              <p>Chargement des annonces...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-icon">⚠</div>
              <p>Impossible de charger les annonces. Reessayez plus tard.</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>Aucune annonce ne correspond a votre recherche.</p>
              {hasActiveFilter && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: '12px' }}
                  onClick={resetSearch}
                >
                  Reinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="listing-grid">
              {filteredListings.map((listing) => (
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
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function HomeRouter({ listings, loading, error }) {
  const { user } = useAuth()
  const [showLanding, setShowLanding] = useState(
    !user && !localStorage.getItem('afrya_visited')
  )

  useEffect(() => {
    if (!user && !localStorage.getItem('afrya_visited')) {
      localStorage.setItem('afrya_visited', 'true')
    }
  }, [user])

  if (showLanding) {
    return <LandingPage />
  }

  return <Home listings={listings} loading={loading} error={error} />
}

function AppContent() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    async function loadListings() {
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('boosted_until', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur Supabase :', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      setListings(data || [])
      setLoading(false)
    }

    loadListings()
  }, [])
  function handleCreateListing(newListing) {
    setListings((previousListings) => [
      newListing,
      ...previousListings,
    ])
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<HomeRouter listings={listings} loading={loading} error={error} />}
      />

      <Route
        path="/annonce/:id"
        element={
          <ListingDetails listings={listings} />
        }
      />
<Route
  path="/annonces"
  element={
    <AllListings listings={listings} loading={loading} error={error} />
  }
/>

      <Route
        path="/categories"
        element={
          <SimplePage title="Catégories" />
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendre"
        element={
          <ProtectedRoute>
            <CreateListing onCreateListing={handleCreateListing} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/connexion"
        element={<Login />}
      />

      <Route
        path="/inscription"
        element={<Register />}
      />

      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mes-annonces"
        element={
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/modifier/:id"
        element={
          <ProtectedRoute>
            <EditListing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/conversation/:id"
        element={
          <ProtectedRoute>
            <Conversation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendeur/:id"
        element={<PublicProfile />}
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/favoris"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />

      <Route
        path="/parametres"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booster/:listingId"
        element={
          <ProtectedRoute>
            <Booster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/signalements"
        element={
          <AdminRoute>
            <AdminReports />
          </AdminRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <BottomNav />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
