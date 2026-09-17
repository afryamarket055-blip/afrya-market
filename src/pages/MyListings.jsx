import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'
import ListingCard from '../ListingCard'

function MyListings() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    favorites: 0,
    contacts: 0,
  })
  const [cityStats, setCityStats] = useState({
    items: [],
    otherCount: 0,
    otherPercent: 0,
    nullCount: 0,
    total: 0,
  })

  useEffect(() => {
    async function loadMyListings() {
      if (!user) return

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement mes annonces :', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      setListings(data)
      setLoading(false)
    }

    loadMyListings()
  }, [user])

  useEffect(() => {
    async function loadStats() {
      if (!user || listings.length === 0) {
        setStats({ views: 0, likes: 0, favorites: 0, contacts: 0 })
        return
      }

      const ids = listings.map((l) => l.id)

      const [viewsRes, likesRes, favoritesRes, contactsRes] = await Promise.all([
        supabase
          .from('listing_views')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', ids),
        supabase
          .from('listing_likes')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', ids),
        supabase
          .from('listing_favorites')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', ids),
        supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id),
      ])

      setStats({
        views: viewsRes.count || 0,
        likes: likesRes.count || 0,
        favorites: favoritesRes.count || 0,
        contacts: contactsRes.count || 0,
      })
    }

    loadStats()
  }, [user, listings])

  useEffect(() => {
    async function loadCityStats() {
      if (!user || listings.length === 0) {
        setCityStats({ items: [], otherCount: 0, otherPercent: 0, nullCount: 0, total: 0 })
        return
      }

      const ids = listings.map((l) => l.id)

      const { data, error } = await supabase
        .from('listing_views')
        .select('viewer_city')
        .in('listing_id', ids)

      if (error) {
        console.error('Erreur chargement villes :', error)
        return
      }

      const cityCount = {}
      let nullCount = 0

      for (const v of data || []) {
        if (!v.viewer_city) {
          nullCount++
        } else {
          cityCount[v.viewer_city] = (cityCount[v.viewer_city] || 0) + 1
        }
      }

      const total = (data || []).length
      const sorted = Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)

      const top5 = sorted.slice(0, 5)
      const restCount = sorted.slice(5).reduce((sum, c) => sum + c.count, 0)

      const items = top5.map((c) => ({
        city: c.city,
        count: c.count,
        percent: total > 0 ? Math.round((c.count / total) * 100) : 0,
      }))

      setCityStats({
        items,
        otherCount: restCount,
        otherPercent: total > 0 ? Math.round((restCount / total) * 100) : 0,
        nullCount,
        total,
      })
    }

    loadCityStats()
  }, [user, listings])

  async function handleDelete(listingId) {
    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette annonce ?'
    )
    if (!confirmed) return

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)

    if (error) {
      console.error('Erreur suppression :', error)
      alert("Erreur lors de la suppression de l'annonce.")
      return
    }

    setListings((previous) =>
      previous.filter((listing) => listing.id !== listingId)
    )
  }

  async function handleToggleSold(listingId, currentStatus) {
    const newStatus = currentStatus === 'vendu' ? 'disponible' : 'vendu'

    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listingId)

    if (error) {
      console.error('Erreur changement statut :', error)
      alert('Erreur lors de la mise à jour du statut.')
      return
    }

    setListings((previous) =>
      previous.map((listing) =>
        listing.id === listingId ? { ...listing, status: newStatus } : listing
      )
    )
  }

  return (
    <div className="app">
      <Nav />
      <main>
        <section className="listings">
          <div className="section-heading">
            <div>
              <span>AFRYA MARKET</span>
              <h2>Mes annonces</h2>
            </div>
            <Link to="/vendre" className="btn btn-primary">
              + Vendre un article
            </Link>
          </div>

            {!loading && !error && listings.length > 0 && (
              <section className="stats-dashboard">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👁</div>
                    <div className="stat-value">{stats.views}</div>
                    <div className="stat-label">Vues</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">❤</div>
                    <div className="stat-value">{stats.likes}</div>
                    <div className="stat-label">Likes</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🔖</div>
                    <div className="stat-value">{stats.favorites}</div>
                    <div className="stat-label">Favoris</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-value">{stats.contacts}</div>
                    <div className="stat-label">Contacts</div>
                  </div>
                </div>
              </section>
            )}

            {!loading && !error && listings.length > 0 && cityStats.total > 0 && (
              <section className="city-stats">
                <h2>Origine des vues</h2>
                <div className="city-stats-list">
                  {cityStats.items.map((item) => (
                    <div key={item.city} className="city-stat-row">
                      <span className="city-stat-name">{item.city}</span>
                      <div className="city-stat-bar">
                        <div
                          className="city-stat-bar-fill"
                          style={{ width: item.percent + '%' }}
                        />
                      </div>
                      <span className="city-stat-percent">{item.percent}%</span>
                      <span className="city-stat-count">({item.count})</span>
                    </div>
                  ))}
                  {cityStats.otherCount > 0 && (
                    <div className="city-stat-row">
                      <span className="city-stat-name">Autres</span>
                      <div className="city-stat-bar">
                        <div
                          className="city-stat-bar-fill"
                          style={{ width: cityStats.otherPercent + '%' }}
                        />
                      </div>
                      <span className="city-stat-percent">{cityStats.otherPercent}%</span>
                      <span className="city-stat-count">({cityStats.otherCount})</span>
                    </div>
                  )}
                  {cityStats.nullCount > 0 && (
                    <div className="city-stat-row city-stat-row-muted">
                      <span className="city-stat-name">Non renseignee</span>
                      <span className="city-stat-count">({cityStats.nullCount})</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {loading ? (
            <div className="loading-state">
              <p>Chargement...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p>Impossible de charger vos annonces. Réessayez plus tard.</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>Vous n'avez encore publié aucune annonce.</p>
              <Link to="/vendre" className="btn btn-primary" style={{ marginTop: '12px' }}>
                Publier ma première annonce
              </Link>
            </div>
          ) : (
            <div className="listing-grid">
              {listings.map((listing) => (
                <div key={listing.id} className="my-listing-item">
                  <Link to={`/annonce/${listing.id}`} className="listing-link">
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

                  <div className="my-listing-status">
                    {listing.status === 'vendu' ? (
                      <span className="status-dot status-dot-sold">🔴 Vendue</span>
                    ) : (
                      <span className="status-dot status-dot-active">🟢 Active</span>
                    )}
                  </div>

                  <div className="my-listing-actions">
                    <Link to={`/modifier/${listing.id}`} className="btn btn-secondary">
                      Modifier
                    </Link>
                      <Link to={`/booster/${listing.id}`} className="btn btn-secondary">
                        Booster
                      </Link>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleToggleSold(listing.id, listing.status)}
                    >
                      {listing.status === 'vendu' ? 'Marquer disponible' : 'Marquer vendu'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(listing.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default MyListings
