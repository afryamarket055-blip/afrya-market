import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
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
import { useAuth } from './context/AuthContext'
import Nav from './components/Nav'
const initialListings = [
  {
    id: 'iphone-13',
    title: 'iPhone 13 128 Go',
    price: '350 000',
    location: 'Cotonou, Littoral',
    condition: 'Très bon état',
    category: 'Téléphones',
    image:
      'https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'hp-elitebook',
    title: 'HP EliteBook',
    price: '180 000',
    location: 'Abomey-Calavi',
    condition: 'Bon état',
    category: 'Informatique',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'refrigerateur-samsung',
    title: 'Réfrigérateur Samsung',
    price: '250 000',
    location: 'Porto-Novo',
    condition: 'Très bon état',
    category: 'Électroménager',
    image:
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'canape-moderne',
    title: 'Canapé moderne',
    price: '120 000',
    location: 'Cotonou',
    condition: 'Bon état',
    category: 'Maison',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
]

function Home({ listings }) {
  return (
    <div className="app">
            <Nav />
      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="hero-badge">
              🇧🇯 Le marché numérique africain
            </span>

            <h1>
              Achetez. Vendez.
              <br />
              <span>Trouvez.</span>
            </h1>

            <p>
              Découvrez des produits d'occasion près de chez vous
              et donnez une seconde vie aux objets.
            </p>

            <div className="search-box">
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
              />

              <input
                type="text"
                placeholder="📍 Cotonou"
              />

              <button>
                Rechercher
              </button>
            </div>
          </div>
        </section>

        <section className="categories">
          <div className="section-heading">
            <div>
              <span>EXPLORER</span>
              <h2>Catégories populaires</h2>
            </div>
          </div>

          <div className="category-grid">
            <div className="category-card">
              <div className="category-icon">📱</div>
              <h3>Téléphones</h3>
              <p>Smartphones & accessoires</p>
            </div>

            <div className="category-card">
              <div className="category-icon">💻</div>
              <h3>Informatique</h3>
              <p>PC, laptops & accessoires</p>
            </div>

            <div className="category-card">
              <div className="category-icon">📺</div>
              <h3>Électroménager</h3>
              <p>TV, frigos & appareils</p>
            </div>

            <div className="category-card">
              <div className="category-icon">👕</div>
              <h3>Mode</h3>
              <p>Vêtements & chaussures</p>
            </div>

            <div className="category-card">
              <div className="category-icon">🛋️</div>
              <h3>Maison</h3>
              <p>Meubles & décoration</p>
            </div>

            <div className="category-card">
              <div className="category-icon">🏍️</div>
              <h3>Véhicules</h3>
              <p>Motos, voitures & pièces</p>
            </div>
          </div>
        </section>

        <section className="listings">
          <div className="section-heading">
            <div>
              <span>RÉCEMMENT AJOUTÉS</span>
              <h2>Les dernières annonces</h2>
            </div>

            <Link to="/annonces">
              Voir tout →
            </Link>
          </div>

          <div className="listing-grid">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/annonce/${listing.id}`}
                className="listing-link"
              >
                <ListingCard
                  title={listing.title}
                  price={listing.price}
                  location={listing.location}
                  condition={listing.condition}
                  category={listing.category}
                  image={listing.image}
                  status={listing.status}
                />
              </Link>
            ))}
          </div>
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

function AllListings({ listings }) {
  const [userLocation, setUserLocation] = useState(null)
  const [locationMessage, setLocationMessage] = useState("")
  const [userCity, setUserCity] = useState(null)
  const [showNearby, setShowNearby] = useState(false)

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
  const [search, setSearch] = useState('')

  const filteredListings = listings.filter((listing) => {
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

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          AFRYA <span>MARKET</span>
        </div>

        <nav className="nav">
          <Link to="/">Accueil</Link>
          <Link to="/categories">Catégories</Link>
          <Link to="/annonces">Annonces</Link>
          <Link to="/messages">Messages</Link>
        </nav>

        <Link to="/vendre" className="sell-button">
          + Vendre un article
        </Link>
      </header>

      <main>
        <section className="listings">
          <div className="section-heading">
            <div>
              <span>AFRYA MARKET</span>
              <h2>Toutes les annonces</h2>
            </div>

            <Link to="/vendre">
              + Vendre un article
            </Link>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher une annonce..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="location-tools">
            <button type="button" onClick={handleGetLocation}>
              📍 Utiliser ma localisation
            </button>

            {locationMessage && <p>{locationMessage}</p>}
            {userCity && (
              <button onClick={() => setShowNearby(!showNearby)}>
                {showNearby
                  ? 'Voir toutes les annonces'
                  : `Annonces proches de ${userCity}`}
              </button>
            )}
          </div>          
<div className="listing-grid">
            {filteredListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/annonce/${listing.id}`}
                className="listing-link"
              >
                <ListingCard
                  title={listing.title}
                  price={listing.price}
                  location={listing.location}
                  condition={listing.condition}
                  category={listing.category}
                  image={listing.image}
                  status={listing.status}
                />
              </Link>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <p>Aucune annonce ne correspond à votre recherche.</p>
          )}
        </section>
      </main>
    </div>
  )
}

function HomeRouter({ listings }) {
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

  return <Home listings={listings} />
}

function AppContent() {
  const [listings, setListings] = useState(initialListings)
    const { user, signOut } = useAuth()
useEffect(() => {
    async function loadListings() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur Supabase :', error)
        return
      }

      setListings(data)
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
        element={<HomeRouter listings={listings} />}
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
    <AllListings listings={listings} />
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
        element={<Messages />}
      />

      <Route
        path="/vendre"
        element={
          <CreateListing
            onCreateListing={handleCreateListing}
          />
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
        element={<Profile />}
      />
      <Route
        path="/mes-annonces"
        element={<MyListings />}
      />
      <Route
        path="/modifier/:id"
        element={<EditListing />}
      />
      <Route
        path="/conversation/:id"
        element={<Conversation />}
      />
      <Route
        path="/vendeur/:id"
        element={<PublicProfile />}
      />
      <Route
        path="/notifications"
        element={<Notifications />}
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
