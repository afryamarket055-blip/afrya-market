import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

const STATUS_LABELS = {
  pending: 'En attente du vendeur',
  accepted: 'Acceptee - AFRYA DEAL en cours',
  deal_locked: 'AFRYA DEAL signe - paiement en attente',
  paid: 'Payee - en attente expedition',
  shipped: 'Expediee - en attente de reception',
  delivered: 'Recue - en attente de cloture',
  completed: 'Commande terminee',
  cancelled: 'Commande annulee',
}

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Commande creee' },
  { key: 'accepted', label: 'Acceptee par le vendeur' },
  { key: 'deal_locked', label: 'AFRYA DEAL signe' },
  { key: 'paid', label: 'Paiement confirme' },
  { key: 'shipped', label: 'Expediee' },
  { key: 'delivered', label: 'Recue' },
  { key: 'completed', label: 'Terminee' },
]

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function OrderDetails() {
  const { id } = useParams()
  const { user } = useAuth()

  const [order, setOrder] = useState(null)
  const [listing, setListing] = useState(null)
  const [buyerProfile, setBuyerProfile] = useState(null)
  const [sellerProfile, setSellerProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const [dealChecked, setDealChecked] = useState(false)
  const [paymentReference, setPaymentReference] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const momoNumber = import.meta.env.VITE_MOMO_NUMBER || '+229 00 00 00 00'

  useEffect(() => {
    async function load() {
      if (!user || !id) return

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur chargement commande:', error)
        setError('Commande introuvable ou acces refuse.')
        setLoading(false)
        return
      }

      setOrder(data)

      const [listingRes, buyerRes, sellerRes] = await Promise.all([
        supabase.from('listings').select('*').eq('id', data.listing_id).single(),
        supabase.from('profiles').select('id, full_name, shop_name, is_pro').eq('id', data.buyer_id).single(),
        supabase.from('profiles').select('id, full_name, shop_name, is_pro').eq('id', data.seller_id).single(),
      ])

      setListing(listingRes.data)
      setBuyerProfile(buyerRes.data)
      setSellerProfile(sellerRes.data)
      setLoading(false)
    }
    load()
  }, [id, user])

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main className="loading-state">
          <p>Chargement de la commande...</p>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="app">
        <Nav />
        <main className="order-page">
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>{error || 'Commande introuvable.'}</p>
            <Link to="/" className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Retour a l accueil
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const isBuyer = user.id === order.buyer_id
  const isSeller = user.id === order.seller_id
  const role = isBuyer ? 'Acheteur' : 'Vendeur'

  const otherParty = isBuyer ? sellerProfile : buyerProfile
  const otherDisplayName = otherParty?.shop_name || otherParty?.full_name || 'Utilisateur'

  // ----- Timeline index -----
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status)

  // ----- Actions helpers -----
  async function updateOrder(updates) {
    setActionLoading(true)
    setActionError('')

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id)

    setActionLoading(false)

    if (error) {
      console.error('Erreur mise a jour:', error)
      setActionError('Erreur lors de la mise a jour.')
      return false
    }

    setOrder((prev) => ({ ...prev, ...updates }))
    return true
  }

  async function handleAccept() {
    await updateOrder({ status: 'accepted' })
  }

  async function handleRefuse() {
    await updateOrder({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancel_reason: 'Refusee par le vendeur',
    })
  }

  async function handleSignDeal() {
    if (!dealChecked) return

    const updates = {}
    if (isBuyer) updates.deal_signed_buyer_at = new Date().toISOString()
    if (isSeller) updates.deal_signed_seller_at = new Date().toISOString()

    // Simuler le nouvel etat pour verifier les 2 signatures
    const newBuyerSigned = isBuyer ? updates.deal_signed_buyer_at : order.deal_signed_buyer_at
    const newSellerSigned = isSeller ? updates.deal_signed_seller_at : order.deal_signed_seller_at

    if (newBuyerSigned && newSellerSigned) {
      updates.status = 'deal_locked'
    }

    await updateOrder(updates)
  }

  async function handleMarkPaid(e) {
    e.preventDefault()
    if (!paymentReference.trim()) return

    await updateOrder({
      status: 'paid',
      payment_reference: paymentReference.trim(),
      paid_at: new Date().toISOString(),
    })
  }

  async function handleShip() {
    await updateOrder({
      status: 'shipped',
      shipped_at: new Date().toISOString(),
    })
  }

  async function handleConfirmDelivery() {
    await updateOrder({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
  }

  async function handleComplete() {
    await updateOrder({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
  }

  async function handleCancelConfirm() {
    if (!cancelReason.trim()) return
    const ok = await updateOrder({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancel_reason: cancelReason.trim(),
    })
    if (ok) {
      setCancelModalOpen(false)
      setCancelReason('')
    }
  }

  const canCancel =
    order.status !== 'shipped' &&
    order.status !== 'delivered' &&
    order.status !== 'completed' &&
    order.status !== 'cancelled'

  return (
    <div className="app order-details-v2">
      <Nav />
      <main className="order-page">
        <Link to="/" className="back-link">← Retour</Link>

        <header className="order-header">
          <h1>Commande</h1>
          <p className="order-ref">Reference : {order.id.slice(0, 8)}</p>
        </header>

        <div className="order-status-badge">
          <span className={'order-status order-status-' + order.status}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>

        {/* TIMELINE */}
        {order.status !== 'cancelled' && (
          <div className="order-timeline">
            {TIMELINE_STEPS.map((step, index) => {
              const isDone = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <div
                  key={step.key}
                  className={
                    'timeline-step' +
                    (isDone ? ' is-done' : '') +
                    (isCurrent ? ' is-current' : '')
                  }
                >
                  <div className="timeline-dot">
                    {isDone ? '✓' : index + 1}
                  </div>
                  <span className="timeline-label">{step.label}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* LISTING */}
        {listing && (
          <div className="order-listing-card">
            <Link to={'/annonce/' + listing.id} className="order-listing-link">
              {listing.image && (
                <img src={listing.image} alt="" className="order-listing-img" />
              )}
              <div className="order-listing-info">
                <strong>{listing.title}</strong>
                <p>{Number(order.price).toLocaleString('fr-FR')} FCFA</p>
              </div>
            </Link>
          </div>
        )}

        {/* INFOS */}
        <div className="order-info-card">
          <div className="order-info-row">
            <span>Votre role</span>
            <strong>{role}</strong>
          </div>
          <div className="order-info-row">
            <span>Autre partie</span>
            <strong>{otherDisplayName}</strong>
          </div>
          <div className="order-info-row">
            <span>Mode de reception</span>
            <strong>
              {order.delivery_method === 'pickup'
                ? 'Retrait en main propre'
                : 'Livraison'}
            </strong>
          </div>
          {order.delivery_address && (
            <div className="order-info-row">
              <span>Adresse</span>
              <strong>{order.delivery_address}</strong>
            </div>
          )}
          {order.buyer_note && (
            <div className="order-info-row">
              <span>Message</span>
              <strong className="order-note">{order.buyer_note}</strong>
            </div>
          )}
          <div className="order-info-row">
            <span>Date</span>
            <strong>{formatDateTime(order.created_at)}</strong>
          </div>
          {order.payment_reference && (
            <div className="order-info-row">
              <span>Code paiement</span>
              <strong className="order-ref-code">{order.payment_reference}</strong>
            </div>
          )}
          {order.cancel_reason && (
            <div className="order-info-row">
              <span>Motif annulation</span>
              <strong className="order-note">{order.cancel_reason}</strong>
            </div>
          )}
        </div>

        {actionError && <p className="form-error">{actionError}</p>}

        {/* ZONE ACTION selon statut */}

        {order.status === 'pending' && isSeller && (
          <div className="order-action-box">
            <h3>Nouvelle commande</h3>
            <p>Acceptez ou refusez cette commande.</p>
            <div className="order-action-buttons">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAccept}
                disabled={actionLoading}
              >
                Accepter la commande
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRefuse}
                disabled={actionLoading}
              >
                Refuser
              </button>
            </div>
          </div>
        )}

        {order.status === 'pending' && isBuyer && (
          <div className="order-action-box">
            <h3>Commande envoyee</h3>
            <p>En attente de l acceptation du vendeur.</p>
          </div>
        )}

        {order.status === 'accepted' && (
          <div className="order-deal-box">
            <h3>AFRYA DEAL</h3>
            <div className="order-deal-text">
              <p>
                L acheteur s engage a payer{' '}
                <strong>{Number(order.price).toLocaleString('fr-FR')} FCFA</strong>{' '}
                au vendeur via MoMo des la signature du present accord.
              </p>
              <p>
                Le vendeur s engage a remettre l article decrit
                ({listing?.title || 'article'}) dans l etat annonce.
              </p>
              <p>
                La reception doit etre confirmee par l acheteur dans les 7 jours
                suivant l expedition.
              </p>
            </div>

            <div className="order-deal-signatures">
              <div className={
                'order-signature' +
                (order.deal_signed_buyer_at ? ' is-signed' : '')
              }>
                <span>Acheteur</span>
                {order.deal_signed_buyer_at ? (
                  <strong>Signe le {formatDateTime(order.deal_signed_buyer_at)}</strong>
                ) : (
                  <strong>En attente</strong>
                )}
              </div>
              <div className={
                'order-signature' +
                (order.deal_signed_seller_at ? ' is-signed' : '')
              }>
                <span>Vendeur</span>
                {order.deal_signed_seller_at ? (
                  <strong>Signe le {formatDateTime(order.deal_signed_seller_at)}</strong>
                ) : (
                  <strong>En attente</strong>
                )}
              </div>
            </div>

            {((isBuyer && !order.deal_signed_buyer_at) ||
              (isSeller && !order.deal_signed_seller_at)) && (
              <>
                <label className="order-deal-check">
                  <input
                    type="checkbox"
                    checked={dealChecked}
                    onChange={(e) => setDealChecked(e.target.checked)}
                  />
                  <span>J accepte les termes ci-dessus et je signe l AFRYA DEAL</span>
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSignDeal}
                  disabled={!dealChecked || actionLoading}
                >
                  {actionLoading ? 'Signature...' : 'Signer l AFRYA DEAL'}
                </button>
              </>
            )}
          </div>
        )}

        {order.status === 'deal_locked' && isBuyer && (
          <form className="order-payment-box" onSubmit={handleMarkPaid}>
            <h3>Paiement</h3>
            <p>
              L AFRYA DEAL est signee par les deux parties. Envoyez maintenant
              <strong> {Number(order.price).toLocaleString('fr-FR')} FCFA</strong> au
              vendeur via MTN MoMo ou Moov Money :
            </p>
            <div className="order-momo">
              <span>{momoNumber}</span>
            </div>
            <p className="order-payment-note">
              Une fois le transfert effectue, saisissez le code de transaction
              recu par SMS.
            </p>
            <div className="form-group">
              <label htmlFor="payRef">Code de transaction</label>
              <input
                id="payRef"
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Ex : MP250918.1234.A56789"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!paymentReference.trim() || actionLoading}
            >
              {actionLoading ? 'Validation...' : 'Confirmer le paiement'}
            </button>
          </form>
        )}

        {order.status === 'deal_locked' && isSeller && (
          <div className="order-action-box">
            <h3>En attente du paiement</h3>
            <p>L acheteur doit effectuer le paiement via MoMo et saisir le code de transaction.</p>
          </div>
        )}

        {order.status === 'paid' && isSeller && (
          <div className="order-action-box">
            <h3>Paiement recu</h3>
            <p>Vous avez recu le paiement. Marquez la commande comme expediee une fois l article envoye.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleShip}
              disabled={actionLoading}
            >
              Marquer comme expediee
            </button>
          </div>
        )}

        {order.status === 'paid' && isBuyer && (
          <div className="order-action-box">
            <h3>Paiement enregistre</h3>
            <p>En attente de l expedition par le vendeur.</p>
          </div>
        )}

        {order.status === 'shipped' && isBuyer && (
          <div className="order-action-box">
            <h3>Article expedie</h3>
            <p>Si vous avez bien recu l article, confirmez la reception.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmDelivery}
              disabled={actionLoading}
            >
              J ai recu mon article
            </button>
          </div>
        )}

        {order.status === 'shipped' && isSeller && (
          <div className="order-action-box">
            <h3>En attente de confirmation</h3>
            <p>L acheteur doit confirmer la reception.</p>
          </div>
        )}

        {order.status === 'delivered' && isSeller && (
          <div className="order-action-box">
            <h3>Article recu par l acheteur</h3>
            <p>Cloturez la commande pour finaliser la transaction.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={actionLoading}
            >
              Cloturer la commande
            </button>
          </div>
        )}

        {order.status === 'delivered' && isBuyer && (
          <div className="order-action-box">
            <h3>Reception confirmee</h3>
            <p>En attente de la cloture par le vendeur.</p>
          </div>
        )}

        {order.status === 'completed' && (
          <div className="order-completed-box">
            <div className="order-completed-icon">✓</div>
            <h3>Commande terminee</h3>
            <p>Merci d avoir utilise AFRYA MARKET.</p>
            {isBuyer && (
              <Link
                to={'/vendeur/' + order.seller_id}
                className="btn btn-secondary"
              >
                Laisser un avis au vendeur
              </Link>
            )}
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="order-action-box order-cancelled-box">
            <h3>Commande annulee</h3>
            <p>{order.cancel_reason || 'Cette commande a ete annulee.'}</p>
          </div>
        )}

        {canCancel && (
          <div className="order-cancel-zone">
            <button
              type="button"
              className="order-cancel-link"
              onClick={() => setCancelModalOpen(true)}
            >
              Annuler la commande
            </button>
          </div>
        )}

        {cancelModalOpen && (
          <div className="modal-overlay" onClick={() => setCancelModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-close"
                onClick={() => setCancelModalOpen(false)}
              >
                ✕
              </button>
              <h2>Annuler la commande</h2>
              <p className="modal-subtitle">
                Merci d indiquer la raison de l annulation.
              </p>
              <div className="form-group">
                <label htmlFor="cancelReason">Motif</label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex : Je ne suis plus interesse..."
                  maxLength={300}
                  rows={3}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCancelModalOpen(false)}
                  disabled={actionLoading}
                >
                  Retour
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleCancelConfirm}
                  disabled={!cancelReason.trim() || actionLoading}
                >
                  {actionLoading ? 'Annulation...' : 'Confirmer l annulation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default OrderDetails
