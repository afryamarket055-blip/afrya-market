import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const PACKS = [
  {
    id: 'starter',
    name: 'Decouverte',
    price: 500,
    days: 7,
    desc: 'Ideal pour tester le boost',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 1000,
    days: 30,
    desc: 'Le plus populaire',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2500,
    days: 90,
    desc: 'Meilleur rapport qualite/prix',
  },
]

function Booster() {
  const { listingId } = useParams()
  const { user } = useAuth()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [existingBoost, setExistingBoost] = useState(null)
  const [selectedPack, setSelectedPack] = useState(null)
  const [step, setStep] = useState('select')
  const [txCode, setTxCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const momoNumber = import.meta.env.VITE_MOMO_NUMBER || '+229 00 00 00 00'

  useEffect(() => {
    async function load() {
      if (!user || !listingId) return

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single()

      if (error || !data) {
        setError('Annonce introuvable.')
        setLoading(false)
        return
      }

      if (data.user_id !== user.id) {
        setError('Vous ne pouvez pas booster cette annonce.')
        setLoading(false)
        return
      }

      setListing(data)

      const { data: boosts } = await supabase
        .from('boosts')
        .select('*')
        .eq('listing_id', listingId)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)

      if (boosts && boosts.length > 0) {
        setExistingBoost(boosts[0])
      }

      setLoading(false)
    }
    load()
  }, [user, listingId])

  async function handleSubmitPayment(event) {
    event.preventDefault()
    if (!txCode.trim() || !selectedPack) return

    setSubmitting(true)
    setSubmitError('')

    const { data, error } = await supabase
      .from('boosts')
      .insert([
        {
          listing_id: listingId,
          user_id: user.id,
          pack: selectedPack.id,
          amount: selectedPack.price,
          duration_days: selectedPack.days,
          status: 'pending',
          payment_provider: 'manual',
          payment_reference: txCode.trim(),
        },
      ])
      .select()
      .single()

    setSubmitting(false)

    if (error) {
      console.error('Erreur creation boost:', error)
      setSubmitError("Erreur lors de l'envoi. Reessayez.")
      return
    }

    setExistingBoost(data)
    setStep('success')
  }

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main className="loading-state">
          <p>Chargement...</p>
        </main>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="app">
        <Nav />
        <main className="booster-page">
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>{error || 'Annonce introuvable.'}</p>
            <Link to="/mes-annonces" className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Retour a mes annonces
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (existingBoost && step !== 'success') {
    const isActive = existingBoost.status === 'active'
    const expiresAt = existingBoost.expires_at
      ? new Date(existingBoost.expires_at).toLocaleDateString('fr-FR')
      : null

    return (
      <div className="app booster-v2">
        <Nav />
        <main className="booster-page">
          <Link to="/mes-annonces" className="back-link">← Retour a mes annonces</Link>

          <header className="booster-header">
            <h1>Boost de votre annonce</h1>
            <p className="booster-subtitle">{listing.title}</p>
          </header>

          {isActive ? (
            <div className="booster-status booster-status-active">
              <div className="booster-status-icon">🚀</div>
              <h2>Votre annonce est boostee</h2>
              <p>
                Boost actif jusqu au <strong>{expiresAt}</strong>.
                Votre annonce apparait en priorite dans les resultats.
              </p>
            </div>
          ) : (
            <div className="booster-status booster-status-pending">
              <div className="booster-status-icon">⏳</div>
              <h2>Demande en cours de validation</h2>
              <p>
                Votre demande de boost est en attente de validation.
                Elle sera activee des que le paiement sera confirme.
              </p>
              <p className="booster-tx">
                Code de transaction : <strong>{existingBoost.payment_reference}</strong>
              </p>
            </div>
          )}

          <div className="booster-actions-bottom">
            <Link to={'/annonce/' + listing.id} className="btn btn-secondary">
              Voir mon annonce
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="app booster-v2">
        <Nav />
        <main className="booster-page">
          <div className="booster-success">
            <div className="booster-success-icon">✓</div>
            <h1>Demande envoyee !</h1>
            <p>
              Votre demande de boost a bien ete enregistree.
              Elle sera activee des que le paiement sera confirme (24-48h).
            </p>
            <p className="booster-success-note">
              Vous recevrez une notification des que votre boost sera actif.
            </p>
            <div className="booster-actions-bottom">
              <Link to="/mes-annonces" className="btn btn-primary">
                Retour a mes annonces
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app booster-v2">
      <Nav />
      <main className="booster-page">
        <Link to="/mes-annonces" className="back-link">← Retour a mes annonces</Link>

        <header className="booster-header">
          <h1>Booster mon annonce</h1>
          <p className="booster-subtitle">{listing.title}</p>
        </header>

        {step === 'select' && (
          <>
            <p className="booster-intro">
              Boostez votre annonce pour qu elle apparaisse en priorite
              dans les resultats de recherche.
            </p>

            <div className="booster-packs">
              {PACKS.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  className={
                    'booster-pack' +
                    (pack.popular ? ' is-popular' : '') +
                    (selectedPack && selectedPack.id === pack.id ? ' is-selected' : '')
                  }
                  onClick={() => setSelectedPack(pack)}
                >
                  {pack.popular && (
                    <span className="booster-pack-badge">Populaire</span>
                  )}
                  <h3>{pack.name}</h3>
                  <div className="booster-pack-price">{pack.price} FCFA</div>
                  <div className="booster-pack-duration">{pack.days} jours</div>
                  <p className="booster-pack-desc">{pack.desc}</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg booster-continue"
              disabled={!selectedPack}
              onClick={() => setStep('payment')}
            >
              Continuer
            </button>
          </>
        )}

        {step === 'payment' && (
          <>
            <div className="booster-recap">
              <span>Formule choisie :</span>
              <strong>{selectedPack.name} - {selectedPack.price} FCFA / {selectedPack.days} jours</strong>
            </div>

            <div className="booster-payment">
              <h2>Comment payer ?</h2>
              <ol className="booster-steps">
                <li>
                  Envoyez <strong>{selectedPack.price} FCFA</strong> via MTN MoMo ou Moov Money au numero :
                  <div className="booster-momo">
                    <span>{momoNumber}</span>
                  </div>
                </li>
                <li>
                  Notez le <strong>code de transaction</strong> que vous recevrez par SMS.
                </li>
                <li>
                  Saisissez ce code ci-dessous et cliquez sur Valider.
                </li>
              </ol>
            </div>

            <form className="booster-form" onSubmit={handleSubmitPayment}>
              <div className="form-group">
                <label htmlFor="txCode">Code de transaction</label>
                <input
                  id="txCode"
                  type="text"
                  value={txCode}
                  onChange={(e) => setTxCode(e.target.value)}
                  placeholder="Ex : MP250916.1234.A56789"
                  required
                />
                <small className="form-hint">
                  Vous trouverez ce code dans le SMS de confirmation de votre operateur.
                </small>
              </div>

              {submitError && <p className="form-error">{submitError}</p>}

              <div className="booster-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep('select')}
                  disabled={submitting}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !txCode.trim()}
                >
                  {submitting ? 'Envoi...' : 'Valider ma demande'}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  )
}

export default Booster
