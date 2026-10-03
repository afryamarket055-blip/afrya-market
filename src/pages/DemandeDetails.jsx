import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import PageMeta from '../components/PageMeta'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'


function isRecent(dateString) {
  if (!dateString) return false
  const hours = (Date.now() - new Date(dateString).getTime()) / 3600000
  return hours < 48
}

function DemandeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [demand, setDemand] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: demandData, error: demandError } = await supabase
        .from('demands')
        .select('*')
        .eq('id', id)
        .single()

      if (demandError) {
        console.error('Erreur chargement demande :', demandError)
        setError('Demande introuvable.')
        setLoading(false)
        return
      }

      setDemand(demandData)

      // Matching V1 : category identique + ville identique (insensible a la casse)
      let query = supabase
        .from('listings')
        .select('*')
        .eq('category', demandData.category)
        .ilike('location', '%' + demandData.city + '%')
        .eq('status', 'disponible')
        .limit(12)

      // Filtrage par budget
      if (demandData.budget_max) {
        query = query.lte('price', demandData.budget_max)
      }
      if (demandData.budget_min) {
        query = query.gte('price', demandData.budget_min)
      }

      const { data: matchesData, error: matchesError } = await query

      if (matchesError) {
        console.error('Erreur chargement annonces :', matchesError)
      }

      setMatches(matchesData || [])
      setLoading(false)
    }

    load()
  }, [id])

  async function updateStatus(newStatus) {
    if (!user || user.id !== demand.user_id) return
    setUpdating(true)

    const { error } = await supabase
      .from('demands')
      .update({ status: newStatus })
      .eq('id', id)

    setUpdating(false)

    if (error) {
      console.error('Erreur mise a jour statut :', error)
      return
    }

    setDemand((previous) => ({ ...previous, status: newStatus }))
  }

  async function handlePropose(listing) {
    if (!user) {
      navigate('/connexion')
      return
    }
    if (user.id === demand.user_id) {
      alert('Vous ne pouvez pas proposer votre propre demande.')
      return
    }

    // Chercher conversation existante : acheteur = auteur de la demande, vendeur = moi
    const { data: existing, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('buyer_id', demand.user_id)
      .eq('seller_id', user.id)
      .maybeSingle()

    if (searchError) {
      console.error('Erreur recherche conversation :', searchError)
      return
    }
    if (existing) {
      navigate('/conversation/' + existing.id)
      return
    }

    const { data: created, error: createError } = await supabase
      .from('conversations')
      .insert([{
        listing_id: listing.id,
        buyer_id: demand.user_id,
        seller_id: user.id,
      }])
      .select()
      .single()

    if (createError) {
      console.error('Erreur creation conversation :', createError)
      alert(createError.message || "Impossible d'ouvrir la conversation.")
      return
    }

    // Premier message automatique
    await supabase.from('messages').insert([{
      conversation_id: created.id,
      sender_id: user.id,
      content:
        'Bonjour, je vous propose mon annonce "' + listing.title +
        '" a ' + Number(listing.price).toLocaleString('fr-FR') + ' FCFA. ' +
        'Vous pouvez la voir ici : /annonce/' + listing.id,
    }])

    navigate('/conversation/' + created.id)
  }

  function handleShareWhatsApp() {
    const baseUrl = window.location.origin
    const url = baseUrl + '/demandes/' + demand.id
    const text =
      'Regarde cette recherche sur AFRYA MARKET :\n\n' +
      '"' + demand.title + '" a ' + demand.city + '\n' +
      'Categorie : ' + demand.category + '\n' +
      (demand.budget_max
        ? 'Budget max : ' + Number(demand.budget_max).toLocaleString('fr-FR') + ' FCFA\n'
        : '') +
      '\nVoir la demande : ' + url
    const waUrl = 'https://wa.me/?text=' + encodeURIComponent(text)
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <LoadingState message="Chargement de la demande..." />
      </div>
    )
  }

  if (error || !demand) {
    return (
      <div className="app">
        <Nav />
        <EmptyState
          icon="❌"
          title="Demande introuvable"
          message="Cette demande n'existe plus ou a ete supprimee."
        />
      </div>
    )
  }

  const isOwner = user && user.id === demand.user_id
  const isActive = demand.status === 'active'

  return (
    <div className="app">
      <Nav />
      <PageMeta
        title={(demand.title || 'Demande') + ' a ' + (demand.city || '') + ' — AFRYA MARKET'}
        description={
          'Recherche : ' + (demand.title || '') + ' a ' + (demand.city || '') +
          (demand.budget_max ? ' · Budget max : ' + Number(demand.budget_max).toLocaleString('fr-FR') + ' FCFA' : '') +
          (demand.description ? ' · ' + String(demand.description).slice(0, 100) : '')
        }
        url={window.location.href}
        type="article"
      />
      <main style={{ padding: '80px 20px', maxWidth: '720px', margin: '0 auto' }}>
        <Link to="/demandes" style={{ marginBottom: '20px', display: 'inline-block' }}>
          ← Toutes les demandes
        </Link>

        <div style={{ marginBottom: '30px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              background:
                demand.status === 'active' ? '#e7f5ed' :
                demand.status === 'found' ? '#e7eaf5' :
                '#f5e7e7',
              color:
                demand.status === 'active' ? '#0a7a3a' :
                demand.status === 'found' ? '#2c3e9e' :
                '#9e2c2c',
              marginBottom: '12px',
            }}
          >
            {demand.status === 'active' && '🟢 Active'}
            {demand.status === 'found' && '✅ Trouvée'}
            {demand.status === 'expired' && '⏰ Expirée'}
            {demand.status === 'cancelled' && '❌ Annulée'}
          </span>
          {isRecent(demand.created_at) && (
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: '#fff4d6',
                color: '#8a6800',
                marginLeft: '8px',
                marginBottom: '12px',
              }}
            >
              🆕 Nouveau
            </span>
          )}

          <h1 style={{ marginBottom: '8px' }}>{demand.title}</h1>

          <p style={{ color: '#666', marginBottom: '20px' }}>
            Recherché à <strong>{demand.city}</strong> · {demand.category}
          </p>

          {demand.description && (
            <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
              {demand.description}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              padding: '16px',
              background: '#f7f7f7',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            {(demand.budget_min || demand.budget_max) && (
              <div>
                <small style={{ color: '#666', display: 'block' }}>Budget</small>
                <strong>
                  {demand.budget_min
                    ? Number(demand.budget_min).toLocaleString('fr-FR')
                    : '?'}
                  {' — '}
                  {demand.budget_max
                    ? Number(demand.budget_max).toLocaleString('fr-FR')
                    : '?'}
                  {' FCFA'}
                </strong>
              </div>
            )}

            {demand.condition_min && (
              <div>
                <small style={{ color: '#666', display: 'block' }}>État minimum</small>
                <strong>{demand.condition_min}</strong>
              </div>
            )}

            {demand.delivery && (
              <div>
                <small style={{ color: '#666', display: 'block' }}>Livraison</small>
                <strong>🛵 Souhaitée</strong>
              </div>
            )}

            {demand.deadline && (
              <div>
                <small style={{ color: '#666', display: 'block' }}>Date limite</small>
                <strong>
                  {new Date(demand.deadline).toLocaleDateString('fr-FR')}
                </strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            {isOwner && isActive && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => updateStatus('found')}
                  disabled={updating}
                >
                  ✅ J'ai trouvé
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => updateStatus('cancelled')}
                  disabled={updating}
                >
                  Annuler la demande
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                padding: '10px 18px',
                background: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '18px' }}>📱</span> Partager sur WhatsApp
            </button>
          </div>
        </div>

        <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />

        <h2 style={{ marginBottom: '20px' }}>
          {matches.length > 0
            ? `${matches.length} annonce${matches.length > 1 ? 's' : ''} correspondante${matches.length > 1 ? 's' : ''}`
            : 'Aucune annonce correspondante pour le moment'}
        </h2>

        {matches.length === 0 ? (
          <p style={{ color: '#666' }}>
            Nous n'avons pas encore trouvé d'annonce correspondant à cette demande.
            Revenez plus tard, ou créez une alerte pour être notifié.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            {matches.map((listing) => {
              const isMine = user && user.id === listing.user_id
              return (
                <div
                  key={listing.id}
                  style={{
                    border: isMine ? '2px solid #1a4dd1' : '1px solid #eee',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Link
                    to={'/annonce/' + listing.id}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      flex: 1,
                    }}
                  >
                    <img
                      src={listing.image}
                      alt={listing.title}
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '10px' }}>
                      {isMine && (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: '#e7eaf5',
                            color: '#2c3e9e',
                            marginBottom: '6px',
                            fontWeight: 'bold',
                          }}
                        >
                          Votre annonce
                        </span>
                      )}
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                        {listing.title}
                      </p>
                      <p style={{ margin: '4px 0 0', color: '#1a4dd1', fontWeight: 'bold' }}>
                        {Number(listing.price).toLocaleString('fr-FR')} FCFA
                      </p>
                      <p style={{ margin: '4px 0 0', color: '#666', fontSize: '12px' }}>
                        📍 {listing.location}
                      </p>
                    </div>
                  </Link>
                  {isMine && (
                    <button
                      type="button"
                      onClick={() => handlePropose(listing)}
                      style={{
                        margin: '0 10px 10px',
                        padding: '10px',
                        background: '#1a4dd1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Proposer mon produit →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default DemandeDetails
