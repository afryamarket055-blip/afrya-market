import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import Icon from '../components/Icon'
import SmartListingModal from '../components/SmartListingModal'
import { validateImageFile, MAX_IMAGES_PER_LISTING } from '../lib/imageValidation'
import { compressAndRename } from '../lib/imageCompression'

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

  // Image de couverture actuelle (listings.image)
  const [coverImage, setCoverImage] = useState('')

  // Images existantes (listing_images) : [{ id, image_url, position }]
  const [existingImages, setExistingImages] = useState([])

  // Nouvelles images a uploader : [{ file, previewUrl }]
  const [newFiles, setNewFiles] = useState([])

  // IDs d'images existantes a supprimer au submit
  const [removedIds, setRemovedIds] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [smartModalOpen, setSmartModalOpen] = useState(false)

  useEffect(() => {
    async function loadListing() {
      // 1. Charger l'annonce
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur chargement annonce :', error)
        setError('Impossible de charger cette annonce.')
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
      setCoverImage(data.image || '')

      // 2. Charger les images additionnelles
      const { data: imgs, error: imgErr } = await supabase
        .from('listing_images')
        .select('id, image_url, position')
        .eq('listing_id', id)
        .order('position', { ascending: true })

      if (imgErr) {
        console.error('Erreur chargement images :', imgErr)
      }

      setExistingImages(imgs || [])
      setLoading(false)
    }

    loadListing()
  }, [id])

  function handleSmartApply({ title, description, category }) {
    setFormData((previous) => ({
      ...previous,
      title: title || previous.title,
      description: description || previous.description,
      category: category || previous.category,
    }))
    setError('')
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // Total images actuellement affichees
  const visibleExisting = existingImages.filter((i) => !removedIds.includes(i.id))
  const totalVisible = visibleExisting.length + newFiles.length

  function handleAddFiles(event) {
    const selected = Array.from(event.target.files || [])
    if (selected.length === 0) return

    // Verifier la limite
    if (totalVisible + selected.length > MAX_IMAGES_PER_LISTING) {
      setMessage('Maximum ' + MAX_IMAGES_PER_LISTING + ' photos au total.')
      event.target.value = ''
      return
    }

    // Valider chaque fichier
    for (const file of selected) {
      const check = validateImageFile(file)
      if (!check.valid) {
        setMessage(check.reason)
        event.target.value = ''
        return
      }
    }

    const additions = selected.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setNewFiles((prev) => [...prev, ...additions])
    setMessage('')
    event.target.value = ''
  }

  function handleRemoveExisting(imageId) {
    // Marquer pour suppression (on ne supprime en DB qu'au submit)
    setRemovedIds((prev) => [...prev, imageId])

    // Reverrouiller la preview locale si c'etait la cover
    const removed = existingImages.find((i) => i.id === imageId)
    if (removed && removed.image_url === coverImage) {
      setCoverImage('')
    }
  }

  function handleRestoreExisting(imageId) {
    setRemovedIds((prev) => prev.filter((rid) => rid !== imageId))
  }

  function handleRemoveNew(index) {
    setNewFiles((prev) => {
      const copy = [...prev]
      const [removed] = copy.splice(index, 1)
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      return copy
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    if (totalVisible === 0) {
      setError('Ajoutez au moins une photo.')
      setSaving(false)
      return
    }

    // ---- 1. Uploader les nouvelles images ----
    const uploadedUrls = []

    for (const item of newFiles) {
      const compressedFile = await compressAndRename(item.file)
      const safeFileName = compressedFile.name
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeFileName}`

      const { error: upErr } = await supabase.storage
        .from('listing-images')
        .upload(filePath, compressedFile, {
          contentType: compressedFile.type,
          upsert: false,
          cacheControl: '3600',
        })

      if (upErr) {
        console.error('Erreur upload :', upErr)
        setError("Erreur lors de l'envoi d'une photo.")
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)

      uploadedUrls.push(urlData.publicUrl)
    }

    // ---- 2. Supprimer les images marquees ----
    if (removedIds.length > 0) {
      const { error: delErr } = await supabase
        .from('listing_images')
        .delete()
        .in('id', removedIds)

      if (delErr) {
        console.error('Erreur suppression images :', delErr)
        setError('Erreur lors de la suppression des photos.')
        setSaving(false)
        return
      }
    }

    // ---- 3. Determiner la position maximale existante ----
    const remaining = existingImages.filter((i) => !removedIds.includes(i.id))
    let maxPosition = -1
    for (const img of remaining) {
      const p = Number(img.position)
      if (!Number.isNaN(p) && p > maxPosition) maxPosition = p
    }

    // ---- 4. Inserer les nouvelles images a max+1, max+2, ... ----
    if (uploadedUrls.length > 0) {
      const rows = uploadedUrls.map((url, idx) => ({
        listing_id: id,
        image_url: url,
        position: maxPosition + 1 + idx,
      }))

      const { error: insErr } = await supabase
        .from('listing_images')
        .insert(rows)

      if (insErr) {
        console.error('Erreur insert nouvelles images :', insErr)
        setError("Erreur lors de l'enregistrement des nouvelles photos.")
        setSaving(false)
        return
      }
    }

    // ---- 5. Definir l'image de couverture ----
    // Priorite : image restante la moins positionnee, sinon 1ere nouvelle
    let finalCover = coverImage
    if (remaining.length > 0) {
      const sorted = [...remaining].sort((a, b) => Number(a.position) - Number(b.position))
      finalCover = sorted[0].image_url
    } else if (uploadedUrls.length > 0) {
      finalCover = uploadedUrls[0]
    }

    // ---- 6. Mettre a jour l'annonce ----
    const { error: upListingErr } = await supabase
      .from('listings')
      .update({
        title: formData.title,
        price: Number(formData.price),
        location: formData.location,
        condition: formData.condition,
        category: formData.category,
        image: finalCover,
        description: formData.description,
      })
      .eq('id', id)

    setSaving(false)

    if (upListingErr) {
      console.error('Erreur mise a jour :', upListingErr)
      setError("Erreur lors de la mise a jour de l'annonce.")
      return
    }

    setMessage('Annonce mise a jour avec succes !')
    setTimeout(() => {
      navigate('/mes-annonces')
    }, 1000)
  }

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p>Chargement de l annonce...</p>
        </main>
      </div>
    )
  }

  const canAddMore = totalVisible < MAX_IMAGES_PER_LISTING

  return (
    <div className="app">
      <Nav />
      <main
        style={{
          padding: '80px 20px',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h1>Modifier l annonce</h1>

        <div
          style={{
            marginBottom: '24px',
            padding: '18px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#fff',
              color: '#2563eb',
              flexShrink: 0,
            }}
          >
            <Icon name="sparkles" size={22} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>
              Ameliorer avec l'IA
            </div>
            <div style={{ fontSize: '14px', opacity: 0.75 }}>
              Decris ton article, l'IA redige une meilleure annonce.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSmartModalOpen(true)}
            className="btn btn-primary"
            style={{ flexShrink: 0 }}
          >
            Essayer
          </button>
        </div>

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
            <label htmlFor="category">Categorie</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Choisir une categorie</option>
              <option value="Telephones">Telephones</option>
              <option value="Informatique">Informatique</option>
              <option value="Electromenager">Electromenager</option>
              <option value="Mode">Mode</option>
              <option value="Maison">Maison</option>
              <option value="Vehicules">Vehicules</option>
              <option value="Autres">Autres</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="condition">Etat</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              <option value="">Choisir l etat</option>
              <option value="Neuf">Neuf</option>
              <option value="Comme neuf">Comme neuf</option>
              <option value="Tres bon etat">Tres bon etat</option>
              <option value="Bon etat">Bon etat</option>
              <option value="Etat correct">Etat correct</option>
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
            <label>
              Photos ({totalVisible} / {MAX_IMAGES_PER_LISTING})
            </label>
            <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '-6px', marginBottom: '10px' }}>
              La premiere photo sert de couverture.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              {/* Images existantes */}
              {existingImages.map((img) => {
                const isRemoved = removedIds.includes(img.id)
                return (
                  <div
                    key={img.id}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      opacity: isRemoved ? 0.35 : 1,
                    }}
                  >
                    <img
                      src={img.image_url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                      decoding="async"
                    />
                    <button
                      type="button"
                      onClick={() => (isRemoved ? handleRestoreExisting(img.id) : handleRemoveExisting(img.id))}
                      aria-label={isRemoved ? 'Restaurer' : 'Retirer'}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isRemoved ? '#10b981' : '#ef4444',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isRemoved ? '↺' : '×'}
                    </button>
                  </div>
                )
              })}

              {/* Nouvelles images (preview) */}
              {newFiles.map((item, idx) => (
                <div
                  key={'new-' + idx}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px dashed #2563eb',
                  }}
                >
                  <img
                    src={item.previewUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                    decoding="async"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNew(idx)}
                    aria-label="Retirer"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#ef4444',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {canAddMore ? (
              <>
                <input
                  id="new-images"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleAddFiles}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="new-images"
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Icon name="plus" size={16} />
                  Ajouter des photos
                </label>
              </>
            ) : (
              <p style={{ fontSize: '13px', opacity: 0.6 }}>
                Maximum atteint ({MAX_IMAGES_PER_LISTING} photos).
              </p>
            )}
          </div>

          {message && <p style={{ color: '#047857' }}>{message}</p>}
          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%' }}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </main>

      {smartModalOpen && (
        <SmartListingModal
          onClose={() => setSmartModalOpen(false)}
          onApply={handleSmartApply}
        />
      )}
    </div>
  )
}

export default EditListing
