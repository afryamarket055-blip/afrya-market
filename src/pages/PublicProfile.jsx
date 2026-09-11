import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

function formatMemberSince(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

function PublicProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [listingsCount, setListingsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur chargement profil public :', error)
        setError('Ce profil n existe pas ou n est plus disponible.')
        setLoading(false)
        return
      }

      setProfile(data)

      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id)
        .neq('status', 'vendu')

      setListingsCount(count || 0)
      setLoading(false)
    }

    loadProfile()
  }, [id])

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main className="loading-state">
          <p>Chargement du profil...</p>
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="app">
        <Nav />
        <main className="public-profile-page">
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>{error || 'Profil introuvable.'}</p>
            <Link to="/annonces" className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Voir les annonces
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const name = profile.full_name || 'Vendeur AFRYA MARKET'
  const location = [profile.city, profile.country].filter(Boolean).join(', ')
  const memberSince = formatMemberSince(profile.created_at)
  const showPhone = profile.phone_visible && profile.phone

  return (
    <div className="app public-profile-v2">
      <Nav />
      <main className="public-profile-page">
        <header className="public-profile-header">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              className="public-profile-avatar"
            />
          ) : (
            <div className="public-profile-avatar public-profile-avatar-placeholder">
              👤
            </div>
          )}

          <h1>{name}</h1>

          {location && (
            <p className="public-profile-location">📍 {location}</p>
          )}

          {memberSince && (
            <p className="public-profile-since">Membre depuis {memberSince}</p>
          )}

          <div className="public-profile-stats">
            <div className="public-stat">
              <span className="public-stat-value">{listingsCount}</span>
              <span className="public-stat-label">
                annonce{listingsCount > 1 ? 's' : ''} active{listingsCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {showPhone && (
            <div className="public-profile-phone">
              📞 <a href={'tel:' + profile.phone}>{profile.phone}</a>
            </div>
          )}
        </header>

        {profile.bio && (
          <section className="public-profile-bio">
            <h2>A propos</h2>
            <p>{profile.bio}</p>
          </section>
        )}

        <div className="public-profile-actions">
          <Link
            to="/annonces"
            className="btn btn-primary"
          >
            Voir ses annonces
          </Link>
        </div>
      </main>
    </div>
  )
}

export default PublicProfile
