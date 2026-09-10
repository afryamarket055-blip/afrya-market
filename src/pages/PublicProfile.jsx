import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

function PublicProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur chargement profil public :', error)
        setLoading(false)
        return
      }

      setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [id])

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p>Chargement du profil...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Nav />
      <main
        style={{
          padding: '60px 20px',
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '16px',
            }}
          />
        ) : (
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 16px',
            }}
          >
            👤
          </div>
        )}

        <h1>{profile?.full_name || 'Vendeur AFRYA MARKET'}</h1>

        {profile?.phone && (
          <p style={{ color: '#6b7280' }}>📞 {profile.phone}</p>
        )}
      </main>
    </div>
  )
}

export default PublicProfile
