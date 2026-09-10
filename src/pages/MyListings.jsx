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
        setLoading(false)
        return
      }

      setListings(data)
      setLoading(false)
    }

    loadMyListings()
  }, [user])

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

          {loading ? (
            <div className="loading-state">
              <p>Chargement...</p>
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
