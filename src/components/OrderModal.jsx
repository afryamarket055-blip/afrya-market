import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function OrderModal({ listing, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [deliveryMethod, setDeliveryMethod] = useState('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [buyerNote, setBuyerNote] = useState('')
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!user) return

    setSending(true)
    setErrorMsg('')

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Veuillez renseigner une adresse de livraison.')
      setSending(false)
      return
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          buyer_id: user.id,
          seller_id: listing.user_id,
          listing_id: listing.id,
          price: Number(listing.price),
          delivery_method: deliveryMethod,
          delivery_address:
            deliveryMethod === 'delivery' ? deliveryAddress.trim() : null,
          buyer_note: buyerNote.trim() || null,
        },
      ])
      .select()
      .single()

    setSending(false)

    if (error) {
      console.error('Erreur creation commande:', error)
      if (error.code === '23505') {
        setErrorMsg('Vous avez deja une commande en cours sur cette annonce.')
      } else {
        setErrorMsg('Erreur lors de la creation de la commande.')
      }
      return
    }

    onClose()
    navigate('/commande/' + data.id)
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

        <h2>Commander cet article</h2>
        <p className="modal-subtitle">
          {listing.title} - {Number(listing.price).toLocaleString('fr-FR')} FCFA
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mode de reception</label>
            <div className="order-radio-group">
              <label className="order-radio">
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                <div>
                  <strong>Retrait en main propre</strong>
                  <p>Vous recuperez l article directement aupres du vendeur.</p>
                </div>
              </label>
              <label className="order-radio">
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  checked={deliveryMethod === 'delivery'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                <div>
                  <strong>Livraison</strong>
                  <p>Les modalites de livraison seront convenues avec le vendeur.</p>
                </div>
              </label>
            </div>
          </div>

          {deliveryMethod === 'delivery' && (
            <div className="form-group">
              <label htmlFor="deliveryAddress">Adresse de livraison</label>
              <input
                id="deliveryAddress"
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Ex : Cotonou, Fidjrosse, pres du carrefour"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="buyerNote">Message au vendeur (optionnel)</label>
            <textarea
              id="buyerNote"
              value={buyerNote}
              onChange={(e) => setBuyerNote(e.target.value)}
              placeholder="Precisez un details, une question, ou vos disponibilites..."
              maxLength={500}
              rows={3}
            />
            <small className="form-hint">{buyerNote.length} / 500 caracteres</small>
          </div>

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
              {sending ? 'Envoi...' : 'Envoyer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderModal
