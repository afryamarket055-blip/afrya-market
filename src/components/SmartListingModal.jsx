import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Icon from './Icon'
import { validateImageFile } from '../lib/imageValidation'
import { compressAndRename } from '../lib/imageCompression'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const base64 = String(result).split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function SmartListingModal({ onClose, onApply }) {
  const [mode, setMode] = useState('text') // 'text' | 'photo'
  const [hint, setHint] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const check = validateImageFile(file)
    if (!check.valid) {
      setError(check.reason)
      event.target.value = ''
      return
    }

    setError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function resetPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview('')
    setResult(null)
    setError('')
  }

  async function callGenerate(variant) {
    setLoading(true)
    setError('')

    try {
      let payload

      if (mode === 'photo') {
        if (!photoFile) {
          setError('Choisis une photo de ton article.')
          setLoading(false)
          return
        }

        const compressed = await compressAndRename(photoFile)
        const base64 = await fileToBase64(compressed)

        payload = {
          image_base64: base64,
          mime_type: compressed.type || 'image/jpeg',
          hint: hint.trim(),
        }
      } else {
        const clean = hint.trim()
        if (clean.length < 3) {
          setError('Decris ton article en au moins 3 caracteres.')
          setLoading(false)
          return
        }
        payload = { hint: clean, variant: variant }
      }

      const functionName = mode === 'photo' ? 'smart-listing-vision' : 'smart-listing'
      const { data, error: fnError } = await supabase.functions.invoke(functionName, {
        body: payload,
      })

      if (fnError) {
        console.error('Edge function error:', fnError)
        setError("Impossible de contacter l'assistant. Reessayez.")
        setLoading(false)
        return
      }

      if (!data || data.error) {
        setError(data?.error || "L'assistant n'a pas pu generer l'annonce.")
        setLoading(false)
        return
      }

      setResult(data)
    } catch (err) {
      console.error('Erreur inattendue:', err)
      setError('Une erreur est survenue. Reessayez.')
    }
    setLoading(false)
  }

  function handleApply() {
    if (!result) return
    onApply(result)
    onClose()
  }

  function handleNewVariant(variant) {
    if (mode === 'photo') return
    callGenerate(variant)
  }

  function handleReset() {
    setResult(null)
    setError('')
  }

  return (
    <div
      className="modal-overlay"
      onClick={loading ? undefined : onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '24px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="sparkles" size={22} />
            Assistant AFRYA
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fermer"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '4px 8px' }}
          >
            x
          </button>
        </div>

        {!result ? (
          <>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: '#f3f4f6', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => { setMode('text'); setError('') }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: mode === 'text' ? '#fff' : 'transparent',
                  fontWeight: mode === 'text' ? 600 : 400,
                  boxShadow: mode === 'text' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Texte
              </button>
              <button
                type="button"
                onClick={() => { setMode('photo'); setError('') }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: mode === 'photo' ? '#fff' : 'transparent',
                  fontWeight: mode === 'photo' ? 600 : 400,
                  boxShadow: mode === 'photo' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Photo
              </button>
            </div>

            {mode === 'text' && (
              <p style={{ opacity: 0.75, marginTop: 0, marginBottom: '16px' }}>
                Decris ton article en quelques mots. L'IA generera un titre, une description et une categorie.
              </p>
            )}

            {mode === 'photo' && (
              <p style={{ opacity: 0.75, marginTop: 0, marginBottom: '16px' }}>
                Prends une photo de ton article. L'IA identifiera l'objet et redigera l'annonce.
              </p>
            )}

            {mode === 'photo' && (
              <div className="form-group">
                <label>Photo de l'article</label>
                {photoPreview ? (
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <img
                      src={photoPreview}
                      alt="Apercu"
                      style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '10px' }}
                      loading="lazy"
                      decoding="async"
                    />
                    <button
                      type="button"
                      onClick={resetPhoto}
                      disabled={loading}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handlePhotoChange}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="photo-input"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '32px 20px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: '#f9fafb',
                        color: '#6b7280',
                      }}
                    >
                      <Icon name="camera" size={32} />
                      <span style={{ fontWeight: 500 }}>Choisir une photo</span>
                      <span style={{ fontSize: '13px', opacity: 0.7 }}>JPG, PNG ou WEBP</span>
                    </label>
                  </>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="hint">
                {mode === 'photo' ? 'Contexte (optionnel)' : 'Description courte'}
              </label>
              <textarea
                id="hint"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder={mode === 'photo'
                  ? 'Ex : achete en 2024, vendu avec chargeur'
                  : 'Ex : iphone 13 bon etat 150000 cotonou'}
                rows={2}
                disabled={loading}
              />
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: '14px', margin: '8px 0' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => callGenerate('default')}
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <>
                    <Icon name="loader" size={16} />
                    Generation...
                  </>
                ) : (
                  <>
                    <Icon name="sparkles" size={16} />
                    Generer l'annonce
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ opacity: 0.75, marginTop: 0, marginBottom: '16px' }}>
              Voici ce que l'IA a prepare :
            </p>

            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px', fontWeight: 600 }}>TITRE</div>
                <div style={{ fontWeight: 500 }}>{result.title}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px', fontWeight: 600 }}>CATEGORIE</div>
                <div>{result.category}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px', fontWeight: 600 }}>DESCRIPTION</div>
                <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{result.description}</div>
              </div>
            </div>

            {mode === 'text' && (
              <>
                <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px', fontWeight: 600 }}>
                  Pas satisfait ? Essaie une autre version :
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <button type="button" onClick={() => handleNewVariant('shorter')} disabled={loading} className="btn btn-secondary btn-sm">Plus courte</button>
                  <button type="button" onClick={() => handleNewVariant('detailed')} disabled={loading} className="btn btn-secondary btn-sm">Plus detaillee</button>
                  <button type="button" onClick={() => handleNewVariant('attractive')} disabled={loading} className="btn btn-secondary btn-sm">Plus vendeuse</button>
                </div>
              </>
            )}

            {loading && (
              <p style={{ fontSize: '13px', opacity: 0.7, margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="loader" size={14} />
                Regeneration...
              </p>
            )}

            {error && (
              <p style={{ color: '#dc2626', fontSize: '14px', margin: '8px 0' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={handleReset} disabled={loading} className="btn btn-secondary" style={{ flex: 1 }}>
                Recommencer
              </button>
              <button type="button" onClick={handleApply} disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                Utiliser cette annonce
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SmartListingModal
