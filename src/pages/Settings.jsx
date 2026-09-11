import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

function Settings() {
  const { user } = useAuth()
  const [phoneVisible, setPhoneVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('phone_visible')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur chargement parametres :', error)
        setLoading(false)
        return
      }

      setPhoneVisible(data.phone_visible || false)
      setLoading(false)
    }
    loadProfile()
  }, [user])

  async function handleTogglePhoneVisible(event) {
    const next = event.target.checked
    setPhoneVisible(next)
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ phone_visible: next })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      console.error('Erreur sauvegarde :', error)
      setPhoneVisible(!next)
      setMessage('Erreur lors de la sauvegarde.')
      return
    }
    setMessage('Preference enregistree.')
  }

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main className="loading-state">
          <p>Chargement des parametres...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app settings-v2">
      <Nav />
      <main className="settings-page">
        <h1>Parametres</h1>
        <p className="settings-subtitle">
          Gerez votre compte et vos preferences.
        </p>

        <section className="settings-section">
          <h2>Compte</h2>
          <div className="settings-card">
            <Link to="/profil" className="settings-row settings-row-link">
              <div>
                <strong>Mon profil</strong>
                <p>Nom, bio, ville, photo</p>
              </div>
              <span className="settings-arrow">→</span>
            </Link>
            <Link to="/mes-annonces" className="settings-row settings-row-link">
              <div>
                <strong>Mes annonces</strong>
                <p>Gerer mes publications</p>
              </div>
              <span className="settings-arrow">→</span>
            </Link>
            <Link to="/favoris" className="settings-row settings-row-link">
              <div>
                <strong>Mes favoris</strong>
                <p>Annonces enregistrees</p>
              </div>
              <span className="settings-arrow">→</span>
            </Link>
          </div>
        </section>

        <section className="settings-section">
          <h2>Confidentialite</h2>
          <div className="settings-card">
            <label className="settings-row settings-row-toggle">
              <div>
                <strong>Afficher mon telephone publiquement</strong>
                <p>
                  Si active, votre numero apparait sur votre profil public
                  et sur vos annonces.
                </p>
              </div>
              <input
                type="checkbox"
                checked={phoneVisible}
                onChange={handleTogglePhoneVisible}
                disabled={saving}
              />
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Securite</h2>
          <div className="settings-card">
            <div className="settings-row settings-row-disabled">
              <div>
                <strong>Mot de passe</strong>
                <p>Modifier votre mot de passe</p>
              </div>
              <span className="settings-badge">Bientot</span>
            </div>
            <div className="settings-row settings-row-disabled">
              <div>
                <strong>Sessions actives</strong>
                <p>Gerer les appareils connectes</p>
              </div>
              <span className="settings-badge">Bientot</span>
            </div>
            <div className="settings-row settings-row-disabled">
              <div>
                <strong>Supprimer mon compte</strong>
                <p>Action irreversible</p>
              </div>
              <span className="settings-badge">Bientot</span>
            </div>
          </div>
        </section>

        {message && <p className="settings-message">{message}</p>}
      </main>
    </div>
  )
}

export default Settings
