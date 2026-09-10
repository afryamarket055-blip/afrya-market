import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'

function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    location: '',
    condition: '',
    description: '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [newImageFile, setNewImageFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadListing() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur chargement annonce :', error)
        setLoading(false)
        return
      }

      setFormData({
        title: data.title || '',
        category: data.category || '',
        price: data.price || '',
        location: data.location || '',
        condition: data.condition || '',
        description: data.description || '',
      })
      setImageUrl(data.image || '')
      setLoading(false)
    }

    loadListing()
  }, [id])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files[0]
    if (file) {
      setNewImageFile(file)
      setImageUrl(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    let finalImageUrl = imageUrl

    if (newImageFile) {
      const safeFileName = newImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')
      const filePath = `${Date.now()}-${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, newImageFile)

      if (uploadError) {
        console.error('Erreur upload image :', uploadError)
        setMessage("Erreur lors de l'envoi de la photo.")
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)

      finalImageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from('listings')
      .update({
        title: formData.title,
        price: Number(formData.price),
        location: formData.location,
        condition: formData.condition,
        category: formData.category,
        image: finalImageUrl,
        description: formData.description,
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      console.error('Erreur mise à jour :', error)
      setMessage("Erreur lors de la mise à jour de l'annonce.")
      return
    }

    setMessage('✓ Annonce mise à jour avec succès !')
    setTimeout(() => {
      navigate('/mes-annonces')
    }, 1000)
  }

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p>Chargement de l'annonce...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Nav />
      <main
        style={{
          padding: '80px 20px',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        <h1>Modifier l'annonce</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Catégorie</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Choisir une catégorie</option>
              <option value="Téléphones">📱 Téléphones</option>
              <option value="Informatique">💻 Informatique</option>
              <option value="Électroménager">📺 Électroménager</option>
              <option value="Mode">👕 Mode</option>
              <option value="Maison">🛋 Maison</option>
              <option value="Véhicules">🏍 Véhicules</option>
              <option value="Autres">📦 Autres</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="condition">État</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              <option value="">Choisir l'état</option>
              <option value="Neuf">Neuf</option>
              <option value="Comme neuf">Comme neuf</option>
              <option value="Très bon état">Très bon état</option>
              <option value="Bon état">Bon état</option>
              <option value="État correct">État correct</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Prix (FCFA)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Localisation</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Photo actuelle</label>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Aperçu"
                style={{ width: '150px', display: 'block', marginBottom: '10px' }}
              />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
            />
          </div>

          {message && <p>{message}</p>}

          <button type="submit" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditListing
