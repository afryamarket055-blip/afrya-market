import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import PageMeta from '../components/PageMeta'
import Icon from '../components/Icon'

const COUNTRIES = ['Benin', 'Togo', "Cote d'Ivoire", 'Niger', 'Nigeria', 'Autre']

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function Verification() {
  const { user } = useAuth()
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('Benin')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Erreur chargement demande :', error)
      }
      setExisting(data || null)
      setLoading(false)
    }
    load()
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const cleanPhone = phone.trim()
    if (cleanPhone.length < 6) {
      setError('Entrez un numero de telephone valide.')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from('verification_requests').insert([
      {
        user_id: user.id,
        phone: cleanPhone,
        country: country,
        status: 'pending',
      },
    ])

    setSubmitting(false)

    if (error) {
      console.error('Erreur creation demande :', error)
      setError("Impossible d'envoyer la demande. Reessayez.")
      return
    }

    setSuccess(true)
    setExisting({
      status: 'pending',
      phone: cleanPhone,
      country: country,
      created_at: new Date().toISOString(),
    })
  }

  if (loading) {
    return (
      <div className="app">
        <PageMeta title="Verification — AFRYA MARKET" />
        <Nav />
        <main className="loading-state">
          <p>Chargement...</p>
        </main>
      </div>
    )
  }

  const status = existing?.status

  return (
    <div className="app">
      <PageMeta
        title="Verification du compte — AFRYA MARKET"
        description="Faites verifier votre numero de telephone et obtenez le badge Verifie."
      />
      <Nav />

      <main
        style={{
          padding: '60px 20px 100px',
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#eff6ff',
              color: '#2563eb',
              marginBottom: '16px',
            }}
          >
            <Icon name="shield" size={32} />
          </div>
          <h1>Verification du compte</h1>
          <p style={{ opacity: 0.7, marginTop: '8px' }}>
            Obtenez le badge Verifie et rassurez vos acheteurs.
          </p>
        </header>

        {status === 'approved' && (
          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
            <h2 style={{ color: '#047857', margin: 0 }}>Compte verifie</h2>
            <p style={{ marginTop: '12px', color: '#065f46' }}>
              Votre compte est verifie. Le badge est visible sur vos annonces et votre profil.
            </p>
          </div>
        )}

        {status === 'pending' && (
          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
            }}
          >
            <h2 style={{ margin: 0, color: '#92400e' }}>Demande en cours</h2>
            <p style={{ marginTop: '12px', color: '#78350f' }}>
              Nous avons recu votre demande pour le numero <strong>{existing.phone}</strong>.
            </p>
            <p style={{ marginTop: '12px', color: '#78350f' }}>
              Notre equipe vous contactera sous 24h a ce numero pour finaliser la verification.
            </p>
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#92400e' }}>
              Demande envoyee le {formatDate(existing.created_at)}
            </p>
          </div>
        )}

        {(status === 'rejected' || (!status && !success)) && (
          <>
            {status === 'rejected' && existing?.rejection_reason && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  marginBottom: '20px',
                  color: '#991b1b',
                }}
              >
                <strong>Demande precedente refusee</strong>
                <p style={{ marginTop: '6px', fontSize: '14px' }}>
                  Raison : {existing.rejection_reason}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: '#fff',
              }}
            >
              <h2 style={{ marginTop: 0 }}>Demander la verification</h2>
              <p style={{ opacity: 0.7, marginTop: '4px', marginBottom: '20px' }}>
                Entrez le numero sur lequel nous pouvons vous joindre par WhatsApp.
              </p>

              <div className="form-group">
                <label htmlFor="country">Pays</label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={submitting}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Numero de telephone</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : +229 97 12 34 56"
                  required
                  disabled={submitting}
                  autoComplete="tel"
                />
                <small style={{ display: 'block', marginTop: '6px', opacity: 0.6 }}>
                  Incluez l'indicatif pays (ex : +229 pour le Benin).
                </small>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {submitting ? 'Envoi...' : 'Demander la verification'}
              </button>
            </form>
          </>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/profil" style={{ fontSize: '14px' }}>
            ← Retour au profil
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Verification
