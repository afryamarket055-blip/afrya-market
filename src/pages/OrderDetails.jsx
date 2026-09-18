import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const STATUS_LABELS = {
  pending: 'En attente du vendeur',
  accepted: 'Acceptee - signature AFRYA DEAL en cours',
  deal_locked: 'AFRYA DEAL signe - paiement en attente',
  paid: 'Payee - en attente expedition',
  shipped: 'Expediee - en attente reception',
  delivered: 'Recue - en attente de cloture',
  completed: 'Terminee',
  cancelled: 'Annulee',
}

function OrderDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      if (!user || !id) return

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur chargement commande:', error)
        setError('Commande introuvable ou acces refuse.')
        setLoading(false)
        return
      }

      setOrder(data)

      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('id', data.listing_id)
        .single()

      setListing(listingData)
      setLoading(false)
    }
    load()
  }, [id, user])

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main className="loading-state">
          <p>Chargement de la commande...</p>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="app">
        <Nav />
        <main className="order-page">
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>{error || 'Commande introuvable.'}</p>
            <Link to="/" className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Retour a l accueil
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const isBuyer = user.id === order.buyer_id
  const role = isBuyer ? 'Acheteur' : 'Vendeur'

  return (
    <div className="app order-details-v2">
      <Nav />
      <main className="order-page">
        <Link to="/" className="back-link">← Retour</Link>

        <header className="order-header">
          <h1>Commande</h1>
          <p className="order-ref">Reference : {order.id.slice(0, 8)}</p>
        </header>

        <div className="order-status-badge">
          <span className={'order-status order-status-' + order.status}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>

        {listing && (
          <div className="order-listing-card">
            <Link to={'/annonce/' + listing.id} className="order-listing-link">
              {listing.image && (
                <img src={listing.image} alt="" className="order-listing-img" />
              )}
              <div className="order-listing-info">
                <strong>{listing.title}</strong>
                <p>{Number(order.price).toLocaleString('fr-FR')} FCFA</p>
              </div>
            </Link>
          </div>
        )}

        <div className="order-info-card">
          <div className="order-info-row">
            <span>Votre role</span>
            <strong>{role}</strong>
          </div>
          <div className="order-info-row">
            <span>Mode de reception</span>
            <strong>
              {order.delivery_method === 'pickup'
                ? 'Retrait en main propre'
                : 'Livraison'}
            </strong>
          </div>
          {order.delivery_address && (
            <div className="order-info-row">
              <span>Adresse</span>
              <strong>{order.delivery_address}</strong>
            </div>
          )}
          {order.buyer_note && (
            <div className="order-info-row">
              <span>Message</span>
              <strong className="order-note">{order.buyer_note}</strong>
            </div>
          )}
          <div className="order-info-row">
            <span>Date</span>
            <strong>
              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
          </div>
        </div>

        <div className="order-todo">
          <p>
            Le workflow de la commande (accepter, AFRYA DEAL, paiement, expedition)
            sera disponible a l etape suivante.
          </p>
        </div>
      </main>
    </div>
  )
}

export default OrderDetails
