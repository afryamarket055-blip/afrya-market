import { useEffect, useState, lazy, Suspense } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import './App.css'
import ListingCard from './ListingCard'
import SkeletonList from './components/SkeletonList'
import useVerifiedSellers from './hooks/useVerifiedSellers'
const VendorListings = lazy(() => import('./pages/VendorListings'))
import ListingDetails from './pages/ListingDetails'
const CreateListing = lazy(() => import('./pages/CreateListing'))
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
const Profile = lazy(() => import('./pages/Profile'))
const MyListings = lazy(() => import('./pages/MyListings'))
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
const EditListing = lazy(() => import('./pages/EditListing'))
const Conversation = lazy(() => import('./pages/Conversation'))
const Messages = lazy(() => import('./pages/Messages'))
const PublicProfile = lazy(() => import('./pages/PublicProfile'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Settings = lazy(() => import('./pages/Settings'))
const AdminReports = lazy(() => import('./pages/AdminReports'))
const AdminBoosts = lazy(() => import('./pages/AdminBoosts'))
const AdminShops = lazy(() => import('./pages/AdminShops'))
const Booster = lazy(() => import('./pages/Booster'))
const OrderDetails = lazy(() => import('./pages/OrderDetails'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const About = lazy(() => import('./pages/About'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Help = lazy(() => import('./pages/Help'))
const Security = lazy(() => import('./pages/Security'))
const Contact = lazy(() => import('./pages/Contact'))
const Report = lazy(() => import('./pages/Report'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const JeRecherche = lazy(() => import('./pages/JeRecherche'))
const DemandeDetails = lazy(() => import('./pages/DemandeDetails'))
const Demandes = lazy(() => import('./pages/Demandes'))
const MesDemandes = lazy(() => import('./pages/MesDemandes'))
import AdminRoute from './components/AdminRoute'
import { useAuth } from './context/AuthContext'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Icon from './components/Icon'
import PageMeta from './components/PageMeta'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import BottomNavWrapper from './components/BottomNavWrapper'

function Home({ listings, loading, error }) {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const verifiedIds = useVerifiedSellers(listings)

  function handleSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchText.trim()) params.set('q', searchText.trim())
    if (searchLocation.trim()) params.set('loc', searchLocation.trim())
    const qs = params.toString()
    navigate('/annonces' + (qs ? '?' + qs : ''))
  }

  const CATEGORIES = [
    { iconName: 'smartphone', name: 'Téléphones' },
    { iconName: 'laptop', name: 'Informatique' },
    { iconName: 'tv', name: 'Électroménager' },
    { iconName: 'shirt', name: 'Mode' },
    { iconName: 'sofa', name: 'Maison' },
    { iconName: 'bike', name: 'Véhicules' },
  ]

  return (
    <div className="app">
      <Nav />
      <main>
        <section className="home-hero">
          <div className="home-hero-inner">
            <span className="home-hero-greeting">Bonjour</span>
            <h1>Que cherchez-vous aujourd'hui ?</h1>
            <p className="home-hero-subtitle">
              Des milliers d'annonces près de chez vous.
            </p>

            <form className="home-search" onSubmit={handleSearch}>
              <div className="home-search-field">
                <Icon name="search" size={18} />
                <input
                  type="text"
                  placeholder="Que recherchez-vous ?"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="home-search-field">
                <Icon name="map-pin" size={18} />
                <input
                  type="text"
                  placeholder="Où ?"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="home-search-btn">
                <Icon name="search" size={18} />
                <span>Rechercher</span>
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

          <div className="category-scroll">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={'/annonces?category=' + encodeURIComponent(cat.name)}
                className="category-pill"
              >
                <span className="category-pill-icon">
                  <Icon name={cat.iconName} size={20} />
                </span>
                <span className="category-pill-label">{cat.name}</span>
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
            <SkeletonList count={8} />
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
                    sellerVerified={verifiedIds.has(listing.user_id)}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

function SimplePage({ title }) {
  return (
    <div className="app">
      <PageMeta title={title + ' — AFRYA MARKET'} />
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
  const verifiedIdsAll = useVerifiedSellers(listings)
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
      <PageMeta title="Annonces d'occasion au Bénin — AFRYA MARKET" />
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
              <span className="search-icon"><Icon name="search" size={18} /></span>
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
              <Icon name="map-pin" size={14} /> {userCity ? userCity : 'Localisation'}
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
                  <Icon name="map-pin" size={14} /> Pres de <strong>{userCity}</strong>
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
              <Icon name="map-pin" size={14} /> Voir les annonces pres de {userCity}
            </button>
          )}

          {loading ? (
            <div className="loading-state">
              <p>Chargement des annonces...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="alert-triangle" size={40} /></div>
              <p>Impossible de charger les annonces. Reessayez plus tard.</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="search" size={40} /></div>
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
                    sellerVerified={verifiedIdsAll.has(listing.user_id)}
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
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return null
  }

  if (!user) {
    return <LandingPage />
  }

  return <Home listings={listings} loading={loading} error={error} />
}

function PageLoader() {
  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <p style={{ opacity: 0.6 }}>Chargement...</p>
    </div>
  )
}

function AppContent() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    async function loadListings() {
      setLoading(true)

      // 1. Charger les utilisateurs bloques si connecte
      let blockedIds = []
      if (user) {
        const { data: blocked } = await supabase
          .from('blocks')
          .select('blocked_id')
          .eq('blocker_id', user.id)
        blockedIds = (blocked || []).map((b) => b.blocked_id)
      }

      // 2. Charger les annonces
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

      // 3. Filtrer les annonces des users bloques
      const filtered = (data || []).filter(
        (l) => !blockedIds.includes(l.user_id)
      )

      setListings(filtered)
      setLoading(false)
    }

    loadListings()
  }, [user])
  function handleCreateListing(newListing) {
    setListings((previousListings) => [
      newListing,
      ...previousListings,
    ])
  }

  return (
    <Suspense fallback={<PageLoader />}>
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
        path="/je-recherche"
        element={
          <ProtectedRoute>
            <JeRecherche />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mes-demandes"
        element={
          <ProtectedRoute>
            <MesDemandes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/demandes"
        element={<Demandes />}
      />

      <Route
        path="/demandes/:id"
        element={<DemandeDetails />}
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
        path="/mot-de-passe-oublie"
        element={<ForgotPassword />}
      />

      <Route
        path="/reinitialiser-mot-de-passe"
        element={<ResetPassword />}
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
        path="/vendeur/:id/annonces"
        element={<VendorListings />}
      />

      <Route
        path="/vendeur/:id"
        element={<PublicProfile />}
      />

      <Route
        path="/boutique/:id"
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
        path="/commande/:id"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mes-commandes"
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/a-propos"
        element={<About />}
      />

      <Route
        path="/comment-ca-marche"
        element={<HowItWorks />}
      />

      <Route
        path="/aide"
        element={<Help />}
      />

      <Route
        path="/securite"
        element={<Security />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route
        path="/signaler"
        element={<Report />}
      />

      <Route
        path="/conditions"
        element={<Terms />}
      />

      <Route
        path="/confidentialite"
        element={<Privacy />}
      />

      <Route
        path="/admin/signalements"
        element={
          <AdminRoute>
            <AdminReports />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/boosts"
        element={
          <AdminRoute>
            <AdminBoosts />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/boutiques"
        element={
          <AdminRoute>
            <AdminShops />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <AppContent />
          <BottomNavWrapper />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
