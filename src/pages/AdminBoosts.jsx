import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const STATUS_LABELS = {
  pending: 'En attente',
  active: 'Actif',
  expired: 'Expire',
  cancelled: 'Annule',
}

const PACK_LABELS = {
  starter: 'Decouverte',
  standard: 'Standard',
  premium: 'Premium',
}

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'active', label: 'Actifs' },
  { value: 'cancelled', label: 'Annules' },
]

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffH < 1) return 'il y a moins d 1h'
  if (diffH < 24) return 'il y a ' + diffH + 'h'
  if (diffD === 1) return 'hier'
  if (diffD < 30) return 'il y a ' + diffD + ' jours'

  return date.toLocaleDateString('fr-FR')
}

function AdminBoosts() {
  const [boosts, setBoosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('boosts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement boosts:', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      const enriched = data || []

      if (enriched.length > 0) {
        const listingIds = [...new Set(enriched.map((b) => b.listing_id))]
        const userIds = [...new Set(enriched.map((b) => b.user_id))]

        const [listingsRes, profilesRes] = await Promise.all([
          supabase.from('listings').select('id, title, image, status').in('id', listingIds),
          supabase.from('profiles').select('id, full_name').in('id', userIds),
        ])

        const listingsMap = {}
        for (const l of listingsRes.data || []) listingsMap[l.id] = l
        const profilesMap = {}
        for (const p of profilesRes.data || []) profilesMap[p.id] = p

        for (const b of enriched) {
          b.listing = listingsMap[b.listing_id] || null
          b.profile = profilesMap[b.user_id] || null
        }
      }

      setBoosts(enriched)
      setLoading(false)
    }
    load()
  }, [])

  async function handleStatusChange(boostId, newStatus) {
    setUpdating(boostId)
    const { error } = await supabase
      .from('boosts')
      .update({ status: newStatus })
      .eq('id', boostId)

    setUpdating(null)

    if (error) {
      console.error('Erreur update:', error)
      alert('Erreur lors de la mise a jour.')
      return
    }

    setBoosts((prev) =>
      prev.map((b) => (b.id === boostId ? { ...b, status: newStatus } : b))
    )
  }

  const filtered =
    filter === 'all' ? boosts : boosts.filter((b) => b.status === filter)

  const counts = {
    all: boosts.length,
    pending: boosts.filter((b) => b.status === 'pending').length,
    active: boosts.filter((b) => b.status === 'active').length,
    cancelled: boosts.filter((b) => b.status === 'cancelled').length,
  }

  return (
    <div className="app admin-boosts-v2">
      <Nav />
      <main className="admin-page">
        <header className="admin-header">
          <h1>Boosts</h1>
          <p className="admin-subtitle">
            Validez les demandes de boost des annonces.
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
            <div className="empty-icon">✓</div>
            <p>Aucun boost dans cette categorie.</p>
          </div>
        ) : (
          <div className="admin-list">
            {filtered.map((b) => (
              <div key={b.id} className="admin-card">
                <div className="admin-card-header">
                  <span className={'admin-badge admin-badge-' + b.status}>
                    {STATUS_LABELS[b.status] || b.status}
                  </span>
                  <span className="admin-card-date">
                    {formatDate(b.created_at)}
                  </span>
                </div>

                <div className="admin-card-body">
                  <p className="admin-card-row">
                    <strong>Annonce :</strong>{' '}
                    {b.listing ? (
                      <Link to={'/annonce/' + b.listing.id} className="admin-target-link">
                        {b.listing.title} (Voir →)
                      </Link>
                    ) : (
                      '(supprimee)'
                    )}
                  </p>
                  <p className="admin-card-row">
                    <strong>Vendeur :</strong>{' '}
                    {b.profile?.full_name || 'Inconnu'}
                  </p>
                  <p className="admin-card-row">
                    <strong>Formule :</strong>{' '}
                    {PACK_LABELS[b.pack] || b.pack} - {b.amount} FCFA / {b.duration_days} jours
                  </p>
                  <p className="admin-card-row">
                    <strong>Code transaction :</strong>{' '}
                    <span className="admin-code">{b.payment_reference || '-'}</span>
                  </p>
                  {b.status === 'active' && b.expires_at && (
                    <p className="admin-card-row">
                      <strong>Expire :</strong>{' '}
                      {new Date(b.expires_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <div className="admin-card-actions">
                  {b.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusChange(b.id, 'active')}
                        disabled={updating === b.id}
                      >
                        Activer le boost
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatusChange(b.id, 'cancelled')}
                        disabled={updating === b.id}
                      >
                        Rejeter
                      </button>
                    </>
                  )}

                  {b.status === 'active' && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      disabled={updating === b.id}
                    >
                      Annuler le boost
                    </button>
                  )}

                  {b.listing && (
                    <Link
                      to={'/annonce/' + b.listing.id}
                      className="btn btn-secondary btn-sm"
                    >
                      Voir l annonce
                    </Link>
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

export default AdminBoosts
