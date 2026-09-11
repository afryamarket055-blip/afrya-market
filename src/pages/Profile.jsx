import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

function Profile() {
  const { user } = useAuth()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('Bénin')
  const [phoneVisible, setPhoneVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur chargement profil :', error)
        setErrorMsg('Impossible de charger votre profil.')
        setLoading(false)
        return
      }

      setFullName(data.full_name || '')
      setPhone(data.phone || '')
      setAvatarUrl(data.avatar_url || '')
      setBio(data.bio || '')
      setCity(data.city || '')
      setCountry(data.country || 'Bénin')
      setPhoneVisible(data.phone_visible || false)
      setLoading(false)
    }

    loadProfile()
  }, [user])

  function handleImageChange(event) {
    const file = event.target.files[0]
    if (file) {
      setImageFile(file)
      setAvatarUrl(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setErrorMsg('')

    let finalAvatarUrl = avatarUrl

    if (imageFile) {
      const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
      const filePath = user.id + '-' + Date.now() + '-' + safeFileName

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('Erreur upload photo :', uploadError)
        setErrorMsg("Erreur lors de l'envoi de la photo.")
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)

      finalAvatarUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        avatar_url: finalAvatarUrl,
        bio: bio,
        city: city,
        country: country,
        phone_visible: phoneVisible,
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      console.error('Erreur mise à jour profil :', error)
      setErrorMsg('Erreur lors de la mise à jour du profil.')
      return
    }

    setAvatarUrl(finalAvatarUrl)
    setImageFile(null)
    setMessage('Profil mis à jour avec succès.')
  }

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

  return (
    <div className="app profile-v2">
      <Nav />
      <main className="profile-page">
        <h1>Mon profil</h1>
        <p className="profile-subtitle">
          Ces informations apparaissent sur votre profil public.
        </p>

        <form onSubmit={handleSubmit} className="profile-form card">
          <div className="profile-avatar-block">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Photo de profil" className="profile-avatar" />
            ) : (
              <div className="profile-avatar profile-avatar-placeholder">👤</div>
            )}
            <label htmlFor="avatar" className="btn btn-secondary profile-avatar-btn">
              Changer la photo
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              hidden
            />
          </div>

          <div className="profile-section">
            <h2>Compte</h2>

            <div className="form-group">
              <label htmlFor="fullName">Nom complet</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled />
              <small className="form-hint">
                L'email ne peut pas etre modifie ici.
              </small>
            </div>
          </div>

          <div className="profile-section">
            <h2>Profil public</h2>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Presentez-vous en quelques mots..."
                maxLength={200}
                rows={3}
              />
              <small className="form-hint">{bio.length} / 200 caracteres</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ville</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Ex : Cotonou"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Pays</label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="Ex : Benin"
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Contact</h2>

            <div className="form-group">
              <label htmlFor="phone">Telephone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Ex : 90 00 00 00"
              />
            </div>

            <label className="profile-checkbox">
              <input
                type="checkbox"
                checked={phoneVisible}
                onChange={(event) => setPhoneVisible(event.target.checked)}
              />
              <span>Afficher mon telephone publiquement</span>
            </label>
            <small className="form-hint">
              Si decoche, votre numero reste prive. Les acheteurs vous
              contacteront uniquement par la messagerie.
            </small>
          </div>

          {message && <p className="form-success">{message}</p>}
          {errorMsg && <p className="form-error">{errorMsg}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default Profile
