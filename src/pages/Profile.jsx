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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

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
        setLoading(false)
        return
      }

      setFullName(data.full_name || '')
      setPhone(data.phone || '')
      setAvatarUrl(data.avatar_url || '')
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

    let finalAvatarUrl = avatarUrl

    if (imageFile) {
      const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
      const filePath = `${user.id}-${Date.now()}-${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('Erreur upload photo :', uploadError)
        setMessage("Erreur lors de l'envoi de la photo.")
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
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      console.error('Erreur mise à jour profil :', error)
      setMessage('Erreur lors de la mise à jour du profil.')
      return
    }

    setAvatarUrl(finalAvatarUrl)
    setMessage('✓ Profil mis à jour avec succès !')
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
    <div className="app">
      <Nav />
      <main className="profile-page">
        <h1>Mon profil</h1>

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
            <label htmlFor="phone">Téléphone</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Ex : 90 00 00 00"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled />
          </div>

          {message && <p className="form-success">{message}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default Profile
