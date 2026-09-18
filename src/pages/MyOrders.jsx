import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const STATUS_LABELS = {
  pending: 'En attente',
  accepted: 'Acceptee',
  deal_locked: 'DEAL signe',
  paid: 'Payee',
  shipped: 'Expediee',
  delivered: 'Recue',
  completed: 'Terminee',
  cancelled: 'Annulee',
}

function formatRelativeDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "a l'instant"
  if (diffMin < 60) return 'il y a ' + diffMin + ' min'
  if (diffH < 24) return 'il y a ' + diffH + 'h'
  if (diffD === 1) return 'hier'
  if (diffD < 30) return 'il y a ' + diffD + ' jours'

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function MyOrders() {
  const { user } = useAuth()
  const [tab, setTab] = useState('purchases')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      if (!user) return

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or('buyer_id.eq.' + user.id + ',seller_id.eq.' + user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement commandes:', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      const enriched = data || []

      if (enriched.length > 0) {
        const listingIds = [...new Set(enriched.map((o) => o.listing_id))]
        const userIds = [
          ...new Set([
            ...enriched.map((o) => o.buyer_id),
            ...enriched.map((o) => o.seller_id),
          ]),
        ]

        const [listingsRes, profilesRes] = await Promise.all([
          supabase.from('listings').select('id, title, image').in('id', listingIds),
          supabase.from('profiles_public').select('id, full_name, shop_name, is_pro').in('id', userIds),
        ])

        const listingsMap = {}
        for (const l of listingsRes.data || []) listingsMap[l.id] = l
        const profilesMap = {}
        for (const p of profilesRes.data || []) profilesMap[p.id] = p

        for (const o of enriched) {
          o.listing = listingsMap[o.listing_id] || null
          o.buyer = profilesMap[o.buyer_id] || null
          o.seller = profilesMap[o.seller_id] || null
        }
      }

      setOrders(enriched)
      setLoading(false)
    }
    load()
  }, [user])

  const purchases = orders.filter((o) => o.buyer_id === user?.id)
  const sales = orders.filter((o) => o.seller_id === user?.id)
  const list = tab === 'purchases' ? purchases : sales

  return (
    <div className="app my-orders-v2">
      <Nav />
      <main className="my-orders-page">
        <header className="my-orders-header">
          <h1>Mes commandes</h1>
          <p className="my-orders-subtitle">
            Suivez vos achats et vos ventes.
          </p>
        </header>

        <div className="my-orders-tabs">
          <button
            type="button"
            className={'my-orders-tab' + (tab === 'purchases' ? ' is-active' : '')}
            onClick={() => setTab('purchases')}
          >
            Mes achats
            {purchases.length > 0 && (
              <span className="my-orders-count">{purchases.length}</span>
            )}
          </button>
          <button
            type="button"
            className={'my-orders-tab' + (tab === 'sales' ? ' is-active' : '')}
            onClick={() => setTab('sales')}
          >
            Mes ventes
            {sales.length > 0 && (
              <span className="my-orders-count">{sales.length}</span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Chargement...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>{error}</p>
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>
              {tab === 'purchases'
                ? 'Vous n avez passe aucune commande.'
                : 'Vous n avez recu aucune commande.'}
            </p>
            <Link
              to="/annonces"
              className="btn btn-primary"
              style={{ marginTop: '12px' }}
            >
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="my-orders-list">
            {list.map((order) => {
              const otherParty =
                tab === 'purchases' ? order.seller : order.buyer
              const otherName =
                otherParty?.shop_name ||
                otherParty?.full_name ||
                'Utilisateur'

              return (
                <Link
                  key={order.id}
                  to={'/commande/' + order.id}
                  className="my-order-card"
                >
                  {order.listing?.image ? (
                    <img
                      src={order.listing.image}
                      alt=""
                      className="my-order-img"
                    />
                  ) : (
                    <div className="my-order-img my-order-img-placeholder">📦</div>
                  )}

                  <div className="my-order-body">
                    <div className="my-order-top">
                      <strong className="my-order-title">
                        {order.listing?.title || 'Article'}
                      </strong>
                      <span className={'my-order-status my-order-status-' + order.status}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <p className="my-order-meta">
                      {tab === 'purchases' ? 'Vendeur' : 'Acheteur'} : {otherName}
                    </p>
                    <p className="my-order-meta my-order-price">
                      {Number(order.price).toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="my-order-date">
                      {formatRelativeDate(order.created_at)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default MyOrders
