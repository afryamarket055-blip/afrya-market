import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import Icon from '../components/Icon'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'

const STATUS_LABELS = {
  active: { label: 'Active', icon: 'check-circle', bg: '#e7f5ed', color: '#0a7a3a' },
  found: { label: 'Trouvée', icon: 'check', bg: '#e7eaf5', color: '#2c3e9e' },
  expired: { label: 'Expirée', icon: 'clock', bg: '#f5eae7', color: '#9e4a2c' },
  cancelled: { label: 'Annulée', icon: 'x', bg: '#f5e7e7', color: '#9e2c2c' },
}

const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'active', label: 'Actives' },
  { key: 'found', label: 'Trouvées' },
  { key: 'cancelled', label: 'Annulées' },
]

function MesDemandes() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data, error } = await supabase
        .from('demands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement mes demandes :', error)
        setError('Impossible de charger vos demandes.')
        setLoading(false)
        return
      }
      setDemands(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  async function updateStatus(id, newStatus) {
    setBusyId(id)
    const { error } = await supabase
      .from('demands')
      .update({ status: newStatus })
      .eq('id', id)
    setBusyId(null)
    if (error) {
      console.error('Erreur mise a jour statut :', error)
      return
    }
    setDemands((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    )
  }

  async function handleDelete(id) {
    setConfirmDialog({
      title: 'Supprimer cette demande ?',
      message: 'Cette action est irreversible.',
      confirmLabel: 'Supprimer',
      danger: true,
      onConfirm: () => doDelete(id),
    })
  }

  async function doDelete(id) {
    setConfirmDialog(null)
    setBusyId(id)
    const { error } = await supabase.from('demands').delete().eq('id', id)
    setBusyId(null)
    if (error) {
      console.error('Erreur suppression :', error)
      return
    }
    setDemands((prev) => prev.filter((d) => d.id !== id))
  }

  const filtered = demands.filter((d) =>
    filter === 'all' ? true : d.status === filter
  )

  if (!user) {
    navigate('/connexion')
    return null
  }

  return (
    <div className="app">
      <Nav />
      <main style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Mes demandes</h1>
            <p style={{ color: '#666', margin: '4px 0 0' }}>
              Gérez vos recherches en cours.
            </p>
          </div>
          <Link to="/je-recherche" className="btn btn-primary">
            + Nouvelle demande
          </Link>
        </header>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                background: filter === f.key ? '#1a4dd1' : 'white',
                color: filter === f.key ? 'white' : '#333',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: filter === f.key ? 'bold' : 'normal',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Chargement de vos demandes..." />
        ) : error ? (
          <EmptyState icon={<Icon name="alert-triangle" size={40} />} title="Erreur" message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Icon name="search" size={40} />}
            title={
              demands.length === 0
                ? 'Aucune demande pour le moment'
                : 'Aucune demande dans ce filtre'
            }
            message={
              demands.length === 0
                ? 'Publiez votre première demande et laissez les vendeurs vous proposer leurs produits.'
                : "Essayez un autre filtre."
            }
          />
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {filtered.map((demand) => {
              const s = STATUS_LABELS[demand.status] || STATUS_LABELS.active
              const isActive = demand.status === 'active'
              const busy = busyId === demand.id
              return (
                <div
                  key={demand.id}
                  style={{
                    padding: '16px 20px',
                    border: '1px solid #eee',
                    borderRadius: '10px',
                    background: 'white',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: s.bg,
                          color: s.color,
                          marginBottom: '6px',
                        }}
                      >
                        <Icon name={s.icon} size={12} /> {s.label}
                      </span>
                      <h3 style={{ margin: '4px 0 6px', fontSize: '17px' }}>
                        {demand.title}
                      </h3>
                      <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                        <Icon name="map-pin" size={12} /> {demand.city} · {demand.category}
                        {demand.budget_max && (
                          <>
                            {' · '}
                            Budget max : {Number(demand.budget_max).toLocaleString('fr-FR')} FCFA
                          </>
                        )}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#999', whiteSpace: 'nowrap' }}>
                      {new Date(demand.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                    <Link
                      to={'/demandes/' + demand.id}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                    >
                      Voir
                    </Link>
                    {isActive && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 14px', fontSize: '13px' }}
                        disabled={busy}
                        onClick={() => updateStatus(demand.id, 'found')}
                      >
                        <Icon name="check" size={14} /> J'ai trouvé
                      </button>
                    )}
                    {isActive && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 14px', fontSize: '13px' }}
                        disabled={busy}
                        onClick={() => updateStatus(demand.id, 'cancelled')}
                      >
                        <Icon name="x" size={14} /> Annuler
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '6px 14px',
                        fontSize: '13px',
                        color: '#9e2c2c',
                        borderColor: '#f5c9c9',
                      }}
                      disabled={busy}
                      onClick={() => handleDelete(demand.id)}
                    >
                      <Icon name="trash" size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {confirmDialog && (
        <ConfirmDialog
          {...confirmDialog}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}

export default MesDemandes
