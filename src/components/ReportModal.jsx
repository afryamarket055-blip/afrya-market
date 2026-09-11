import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const REASONS = [
  { value: 'inappropriate', label: 'Contenu inapproprie' },
  { value: 'scam', label: 'Arnaque ou fraude' },
  { value: 'spam', label: 'Spam ou publicite' },
  { value: 'fake', label: 'Fausse annonce / faux profil' },
  { value: 'other', label: 'Autre raison' },
]

function ReportModal({ targetType, targetId, onClose }) {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMsg('')
    setMessage('')

    if (!user) {
      setErrorMsg('Vous devez etre connecte pour signaler.')
      return
    }
    if (!reason) {
      setErrorMsg('Veuillez choisir une raison.')
      return
    }

    setSending(true)

    const { error } = await supabase
      .from('reports')
      .insert([
        {
          reporter_id: user.id,
          target_type: targetType,
          target_id: targetId,
          reason: reason,
          details: details.trim() || null,
        },
      ])

    setSending(false)

    if (error) {
      console.error('Erreur signalement :', error)
      setErrorMsg("Erreur lors de l'envoi du signalement.")
      return
    }

    setMessage('Merci. Votre signalement a ete transmis.')
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>

        <h2>Signaler</h2>
        <p className="modal-subtitle">
          Aidez-nous a garder AFRYA MARKET sur. Tous les signalements sont
          examines manuellement.
        </p>

        {!user ? (
          <div className="modal-info">
            <p>Vous devez etre connecte pour signaler un contenu.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reason">Raison</label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="">Choisir une raison</option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="details">Details (optionnel)</label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Decrivez le probleme..."
                maxLength={500}
                rows={4}
              />
              <small className="form-hint">
                {details.length} / 500 caracteres
              </small>
            </div>

            {message && <p className="form-success">{message}</p>}
            {errorMsg && <p className="form-error">{errorMsg}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={sending}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending}
              >
                {sending ? 'Envoi...' : 'Signaler'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ReportModal
