import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import Nav from '../components/Nav'
import Icon from '../components/Icon'
import ConfirmDialog from '../components/ConfirmDialog'

const FILTERS = [
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Verifiees' },
  { value: 'rejected', label: 'Refusees' },
  { value: 'all', label: 'Toutes' },
]

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffH = Math.floor((now - date) / 3600000)
  const diffD = Math.floor((now - date) / 86400000)

  if (diffH < 1) return "il y a moins d'1h"
  if (diffH < 24) return 'il y a ' + diffH + 'h'
  if (diffD === 1) return 'hier'
  if (diffD < 30) return 'il y a ' + diffD + ' jours'
  return date.toLocaleDateString('fr-FR')
}

function whatsappLink(phone) {
  const clean = String(phone).replace(/[^0-9]/g, '')
  return 'https://wa.me/' + clean
}

function AdminVerifications() {
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [updating, setUpdating] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  useEffect(() => {
    async function load() {
      // 1. Charger les demandes
      const { data: reqs, error } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement :', error)
        setError(error.message)
        setLoading(false)
        return
      }

      // 2. Charger les profils associes (via profiles_public, sans jointure)
      const userIds = [...new Set((reqs || []).map((r) => r.user_id))]
      const profilesMap = {}

      if (userIds.length > 0) {
        const { data: profiles, error: profErr } = await supabase
          .from('profiles_public')
          .select('id, full_name, shop_name, avatar_url, city')
          .in('id', userIds)

        if (profErr) {
          console.error('Erreur chargement profils :', profErr)
        }

        for (const p of profiles || []) {
          profilesMap[p.id] = p
        }
      }

      // 3. Fusionner
      const enriched = (reqs || []).map((r) => ({
        ...r,
        profiles: profilesMap[r.user_id] || null,
      }))

      setRequests(enriched)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter)

  const counts = {
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    all: requests.length,
  }

  async function updateStatus(requestId, newStatus, reason) {
    setUpdating(requestId)
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason || null,
      })
      .eq('id', requestId)

    setUpdating(null)

    if (error) {
      console.error('Erreur update :', error)
      toast.error('Erreur lors de la mise a jour.')
      return
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: newStatus, rejection_reason: reason || null, reviewed_at: new Date().toISOString() }
          : r
      )
    )

    toast.success(newStatus === 'approved' ? 'Utilisateur verifie.' : 'Demande refusee.')
  }

  function handleApprove(request) {
    setConfirmDialog({
      title: 'Valider cette verification ?',
      message: 'L utilisateur recevra le badge Verifie sur son profil et ses annonces.',
      confirmLabel: 'Valider',
      onConfirm: () => {
        setConfirmDialog(null)
        updateStatus(request.id, 'approved')
      },
    })
  }

  function handleReject(request) {
    const reason = window.prompt('Raison du refus (sera affichee a l utilisateur) :')
    if (!reason || !reason.trim()) return
    updateStatus(request.id, 'rejected', reason.trim())
  }

  return (
    <div className="app">
      <Nav />

      <main className="admin-page" style={{ padding: '40px 20px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Link to="/" style={{ fontSize: '14px', opacity: 0.7 }}>← Accueil</Link>
          </div>
          <h1>Verifications</h1>
          <p style={{ opacity: 0.7, marginTop: '4px' }}>
            Gerez les demandes de verification telephone.
          </p>
        </header>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1px solid ' + (filter === f.value ? '#2563eb' : '#e5e7eb'),
                background: filter === f.value ? '#2563eb' : '#fff',
                color: filter === f.value ? '#fff' : '#111',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {f.label} ({counts[f.value]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state"><p>Chargement...</p></div>
        ) : error ? (
          <div className="empty-state"><p>Erreur : {error}</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>Aucune demande dans ce filtre.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((req) => {
              const p = req.profiles || {}
              const name = p.shop_name || p.full_name || 'Utilisateur'
              const isPending = req.status === 'pending'
              return (
                <div
                  key={req.id}
                  style={{
                    padding: '16px 20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{name}</div>
                      <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>
                        {req.country} · {req.phone}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '6px' }}>
                        Demande {formatDate(req.created_at)}
                      </div>
                      {req.rejection_reason && (
                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#991b1b' }}>
                          Raison : {req.rejection_reason}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <a
                        href={whatsappLink(req.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        WhatsApp
                      </a>

                      {isPending && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleApprove(req)}
                            disabled={updating === req.id}
                          >
                            {updating === req.id ? '...' : 'Valider'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(req)}
                            disabled={updating === req.id}
                          >
                            Refuser
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <span style={{ fontSize: '13px', color: '#047857', fontWeight: 600 }}>✓ Verifie</span>
                      )}

                      {req.status === 'rejected' && (
                        <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>✕ Refuse</span>
                      )}
                    </div>
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

export default AdminVerifications
