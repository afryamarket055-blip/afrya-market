import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Icon from './Icon'

function SmartListingModal({ onClose, onApply }) {
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [lastVariant, setLastVariant] = useState(null)

  async function callGenerate(variant) {
    const clean = hint.trim()
    if (clean.length < 3) {
      setError('Decris ton article en au moins 3 caracteres.')
      return
    }

    setLoading(true)
    setError('')
    setLastVariant(variant)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('smart-listing', {
        body: { hint: clean, variant: variant },
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
    if (!result) return
    callGenerate(variant)
  }

  function handleReset() {
    setResult(null)
    setError('')
    setLastVariant(null)
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
            <p style={{ opacity: 0.75, marginTop: 0, marginBottom: '16px' }}>
              Decris ton article en quelques mots. L'IA generera un titre, une description et une categorie.
            </p>

            <div className="form-group">
              <label htmlFor="hint">Description courte</label>
              <textarea
                id="hint"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Ex : iphone 13 bon etat 150000 cotonou"
                rows={3}
                disabled={loading}
                autoFocus
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
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px', fontWeight: 600 }}>
                  TITRE
                </div>
                <div style={{ fontWeight: 500 }}>{result.title}</div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px', fontWeight: 600 }}>
                  CATEGORIE
                </div>
                <div>{result.category}</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px', fontWeight: 600 }}>
                  DESCRIPTION
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{result.description}</div>
              </div>
            </div>

            <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px', fontWeight: 600 }}>
              Pas satisfait ? Essaie une autre version :
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleNewVariant('shorter')}
                disabled={loading}
                className="btn btn-secondary btn-sm"
              >
                Plus courte
              </button>
              <button
                type="button"
                onClick={() => handleNewVariant('detailed')}
                disabled={loading}
                className="btn btn-secondary btn-sm"
              >
                Plus detaillee
              </button>
              <button
                type="button"
                onClick={() => handleNewVariant('attractive')}
                disabled={loading}
                className="btn btn-secondary btn-sm"
              >
                Plus vendeuse
              </button>
            </div>

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
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Recommencer
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
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
