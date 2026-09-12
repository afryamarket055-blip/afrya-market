import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const STATUS_LABELS = {
  pending: 'En attente',
  reviewed: 'Revu',
  dismissed: 'Rejete',
  action_taken: 'Action prise',
}

const REASON_LABELS = {
  inappropriate: 'Contenu inapproprie',
  scam: 'Arnaque ou fraude',
  spam: 'Spam ou publicite',
  fake: 'Fausse annonce / faux profil',
  other: 'Autre raison',
}

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'reviewed', label: 'Revus' },
  { value: 'dismissed', label: 'Rejetes' },
  { value: 'action_taken', label: 'Actions' },
]

function formatDate(dateString) {
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

function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    async function loadReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement signalements :', error)
        setError(error.message || 'Erreur de chargement')
        setLoading(false)
        return
      }

      const enriched = data || []

      if (enriched.length > 0) {
        const reporterIds = [...new Set(enriched.map((r) => r.reporter_id))]
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', reporterIds)

        const map = {}
        for (const p of profilesData || []) map[p.id] = p
        for (const r of enriched) r.reporter = map[r.reporter_id] || null
      }

      setReports(enriched)
      setLoading(false)
    }

    loadReports()
  }, [])

  async function handleStatusChange(reportId, newStatus) {
    setUpdating(reportId)
    const { error } = await supabase
      .from('reports')
      .update({ status: newStatus })
      .eq('id', reportId)

    setUpdating(null)

    if (error) {
      console.error('Erreur update statut :', error)
      alert('Erreur lors de la mise a jour.')
      return
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    )
  }

  const filtered =
    filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    reviewed: reports.filter((r) => r.status === 'reviewed').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
    action_taken: reports.filter((r) => r.status === 'action_taken').length,
  }

  function buildTargetLink(report) {
    if (report.target_type === 'listing') {
      return '/annonce/' + report.target_id
    }
    if (report.target_type === 'profile') {
      return '/vendeur/' + report.target_id
    }
    return null
  }

  return (
    <div className="app admin-reports-v2">
      <Nav />
      <main className="admin-page">
        <header className="admin-header">
          <h1>Signalements</h1>
          <p className="admin-subtitle">
            Modere les contenus signales par les utilisateurs.
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
            <p>Aucun signalement dans cette categorie.</p>
          </div>
        ) : (
          <div className="admin-list">
            {filtered.map((report) => {
              const targetLink = buildTargetLink(report)
              return (
                <div key={report.id} className="admin-card">
                  <div className="admin-card-header">
                    <span className={'admin-badge admin-badge-' + report.status}>
                      {STATUS_LABELS[report.status] || report.status}
                    </span>
                    <span className="admin-card-date">
                      {formatDate(report.created_at)}
                    </span>
                  </div>

                  <div className="admin-card-body">
                    <p className="admin-card-row">
                      <strong>Cible :</strong>{' '}
                      {report.target_type === 'listing' ? 'Annonce' : 'Profil'}
                      {targetLink && (
                        <>
                          {' '}
                          <Link to={targetLink} className="admin-target-link">
                            (Voir →)
                          </Link>
                        </>
                      )}
                    </p>
                    <p className="admin-card-row">
                      <strong>Raison :</strong>{' '}
                      {REASON_LABELS[report.reason] || report.reason}
                    </p>
                    <p className="admin-card-row">
                      <strong>Par :</strong>{' '}
                      {report.reporter?.full_name || 'Utilisateur inconnu'}
                    </p>
                    {report.details && (
                      <p className="admin-card-details">
                        &ldquo;{report.details}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="admin-card-actions">
                    {report.status !== 'reviewed' && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStatusChange(report.id, 'reviewed')}
                        disabled={updating === report.id}
                      >
                        Marquer revu
                      </button>
                    )}
                    {report.status !== 'dismissed' && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStatusChange(report.id, 'dismissed')}
                        disabled={updating === report.id}
                      >
                        Rejeter
                      </button>
                    )}
                    {report.status !== 'action_taken' && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatusChange(report.id, 'action_taken')}
                        disabled={updating === report.id}
                      >
                        Action prise
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminReports
