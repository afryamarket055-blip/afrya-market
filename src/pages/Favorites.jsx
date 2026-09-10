import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'
import ListingCard from '../ListingCard'

function Favorites() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return

      const { data, error } = await supabase
        .from('listing_favorites')
        .select('listing_id, listings(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement favoris :', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      const items = data
        .map((fav) => fav.listings)
        .filter(Boolean)

      setListings(items)
      setLoading(false)
    }

    loadFavorites()
  }, [user])

  return (
    <div className="app">
      <Nav />
      <main>
        <section className="listings">
          <div className="section-heading">
            <div>
              <span>AFRYA MARKET</span>
              <h2>Mes favoris</h2>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Chargement...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p>Impossible de charger vos favoris. Réessayez plus tard.</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔖</div>
              <p>Vous n'avez encore enregistré aucune annonce.</p>
              <Link to="/annonces" className="btn btn-primary" style={{ marginTop: '12px' }}>
                Parcourir les annonces
              </Link>
            </div>
          ) : (
            <div className="listing-grid">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/annonce/${listing.id}`}
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

export default Favorites
