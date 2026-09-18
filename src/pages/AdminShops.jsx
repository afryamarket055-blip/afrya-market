import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'verified', label: 'Verifiees' },
  { value: 'unverified', label: 'Non verifiees' },
]

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function AdminShops() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)
  const [listingsCounts, setListingsCounts] = useState({})

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, shop_name, shop_category, shop_description, shop_logo, shop_banner, is_verified, pro_since, created_at')
        .eq('is_pro', true)
        .order('pro_since', { ascending: false })

      if (error) {
        console.error('Erreur chargement boutiques:', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      setShops(data || [])

      if (data && data.length > 0) {
        const ids = data.map((s) => s.id)
        const { data: listings } = await supabase
          .from('listings')
          .select('user_id')
          .in('user_id', ids)

        const counts = {}
        for (const l of listings || []) {
          counts[l.user_id] = (counts[l.user_id] || 0) + 1
        }
        setListingsCounts(counts)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleToggleVerify(shopId, currentStatus) {
    setUpdating(shopId)
    const next = !currentStatus

    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: next })
      .eq('id', shopId)

    setUpdating(null)

    if (error) {
      console.error('Erreur update:', error)
      alert('Erreur lors de la mise a jour.')
      return
    }

    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, is_verified: next } : s))
    )
  }

  const filtered =
    filter === 'all'
      ? shops
      : shops.filter((s) =>
          filter === 'verified' ? s.is_verified : !s.is_verified
        )

  const counts = {
    all: shops.length,
    verified: shops.filter((s) => s.is_verified).length,
    unverified: shops.filter((s) => !s.is_verified).length,
  }

  return (
    <div className="app admin-shops-v2">
      <Nav />
      <main className="admin-page">
        <header className="admin-header">
          <h1>Boutiques pro</h1>
          <p className="admin-subtitle">
            Verifiez les boutiques des vendeurs professionnels.
          </p>
        </header>

        <div className="admin-filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={
                'admin-filter-btn' + (filter === f.value ? ' is-active' : '')
              }
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {counts[f.value] > 0 && (
                <span className="admin-filter-count">{counts[f.value]}</span>
              )}
            </button>
          ))}
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
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <p>Aucune boutique dans cette categorie.</p>
          </div>
        ) : (
          <div className="admin-list">
            {filtered.map((shop) => (
              <div key={shop.id} className="admin-card">
                <div className="admin-card-header">
                  <span className={'admin-badge ' + (shop.is_verified ? 'admin-badge-active' : 'admin-badge-pending')}>
                    {shop.is_verified ? 'VERIFIEE' : 'NON VERIFIEE'}
                  </span>
                  {shop.pro_since && (
                    <span className="admin-card-date">
                      Depuis {formatDate(shop.pro_since)}
                    </span>
                  )}
                </div>

                <div className="admin-shop-content">
                  {shop.shop_logo ? (
                    <img src={shop.shop_logo} alt="" className="admin-shop-logo" />
                  ) : (
                    <div className="admin-shop-logo admin-shop-logo-placeholder">🏪</div>
                  )}

                  <div className="admin-shop-info">
                    <p className="admin-card-row">
                      <strong>{shop.shop_name || '(sans nom)'}</strong>
                    </p>
                    <p className="admin-card-row">
                      <strong>Vendeur :</strong> {shop.full_name || 'Inconnu'}
                    </p>
                    {shop.shop_category && (
                      <p className="admin-card-row">
                        <strong>Categorie :</strong> {shop.shop_category}
                      </p>
                    )}
                    <p className="admin-card-row">
                      <strong>Annonces :</strong> {listingsCounts[shop.id] || 0}
                    </p>
                    {shop.shop_description && (
                      <p className="admin-card-details">
                        "{shop.shop_description}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="admin-card-actions">
                  <Link
                    to={'/boutique/' + shop.id}
                    className="btn btn-secondary btn-sm"
                  >
                    Voir la boutique
                  </Link>
                  {shop.is_verified ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleToggleVerify(shop.id, true)}
                      disabled={updating === shop.id}
                    >
                      Retirer la verification
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleToggleVerify(shop.id, false)}
                      disabled={updating === shop.id}
                    >
                      Verifier la boutique
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminShops
