import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import ReportModal from '../components/ReportModal'

function formatMemberSince(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

function formatRelativeDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "a l'instant"
  if (diffMin < 60) return 'il y a ' + diffMin + ' min'
  if (diffH < 24) return 'il y a ' + diffH + 'h'
  if (diffD === 1) return 'hier'
  if (diffD < 30) return 'il y a ' + diffD + ' jours'

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Stars({ value }) {
  const rounded = Math.round(value)
  return (
    <span className="stars-display" aria-label={value + ' sur 5'}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
    </span>
  )
}

function PublicProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const routerLocation = useLocation()

  const [profile, setProfile] = useState(null)
  const [listingsCount, setListingsCount] = useState(0)
  const [reviews, setReviews] = useState([])
  const [myReview, setMyReview] = useState(null)
  const [canReview, setCanReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isShopMode, setIsShopMode] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)

  // Load profile + listings
  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur chargement profil public :', error)
        setError('Ce profil n existe pas ou n est plus disponible.')
        setLoading(false)
        return
      }

      setProfile(data)

      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id)
        .neq('status', 'vendu')

      setListingsCount(count || 0)
      setLoading(false)
    }

    loadProfile()
  }, [id])

  // Redirection auto /vendeur <-> /boutique selon is_pro
  useEffect(() => {
    if (!profile) return
    const isOnShopUrl = routerLocation.pathname.startsWith('/boutique/')
    if (profile.is_pro && !isOnShopUrl) {
      navigate('/boutique/' + id, { replace: true })
    } else if (!profile.is_pro && isOnShopUrl) {
      navigate('/vendeur/' + id, { replace: true })
    }
    setIsShopMode(!!profile.is_pro)
  }, [profile, routerLocation.pathname, id, navigate])

  // Load reviews + my review + canReview
  useEffect(() => {
    async function loadReviews() {
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement avis :', error)
        return
      }

      const enriched = reviewsData || []

      if (enriched.length > 0) {
        const reviewerIds = [...new Set(enriched.map((r) => r.reviewer_id))]
        const { data: profilesData } = await supabase
          .from('profiles_public')
          .select('id, full_name, avatar_url')
          .in('id', reviewerIds)

        const map = {}
        for (const p of profilesData || []) {
          map[p.id] = p
        }
        for (const r of enriched) {
          r.reviewer = map[r.reviewer_id] || null
        }
      }

      setReviews(enriched)

      if (user) {
        const mine = enriched.find((r) => r.reviewer_id === user.id)
        setMyReview(mine || null)
      } else {
        setMyReview(null)
      }
    }

    loadReviews()
  }, [id, user])

  // Check can review
  useEffect(() => {
    async function checkCanReview() {
      if (!user || user.id === id) {
        setCanReview(false)
        return
      }

      const { count } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .eq('seller_id', id)

      setCanReview((count || 0) > 0)
    }

    checkCanReview()
  }, [id, user])

  function openModal() {
    if (myReview) {
      setRatingInput(myReview.rating)
      setCommentInput(myReview.comment || '')
    } else {
      setRatingInput(5)
      setCommentInput('')
    }
    setMessage('')
    setErrorMsg('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setMessage('')
    setErrorMsg('')
  }

  async function handleSubmitReview(event) {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')
    setErrorMsg('')

    if (myReview) {
      const { error } = await supabase
        .from('reviews')
        .update({ rating: ratingInput, comment: commentInput || null })
        .eq('id', myReview.id)

      if (error) {
        console.error('Erreur mise a jour avis :', error)
        setErrorMsg("Erreur lors de l'enregistrement de l'avis.")
        setSaving(false)
        return
      }

      setReviews((prev) =>
        prev.map((r) =>
          r.id === myReview.id
            ? { ...r, rating: ratingInput, comment: commentInput || null }
            : r
        )
      )
      setMyReview((prev) => ({ ...prev, rating: ratingInput, comment: commentInput || null }))
    } else {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            reviewer_id: user.id,
            reviewee_id: id,
            rating: ratingInput,
            comment: commentInput || null,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Erreur creation avis :', error)
        setErrorMsg("Erreur lors de l'enregistrement de l'avis.")
        setSaving(false)
        return
      }

      const myProfile = { full_name: 'Vous', avatar_url: null }
      const enrichedReview = { ...data, reviewer: myProfile }
      setReviews((prev) => [enrichedReview, ...prev])
      setMyReview(data)
    }

    setSaving(false)
    setMessage('Avis enregistre.')
    setTimeout(() => closeModal(), 900)
  }

  async function handleDeleteReview() {
    if (!myReview) return
    const ok = window.confirm('Voulez-vous vraiment supprimer votre avis ?')
    if (!ok) return

    setSaving(true)
    const { error } = await supabase.from('reviews').delete().eq('id', myReview.id)
    setSaving(false)

    if (error) {
      console.error('Erreur suppression avis :', error)
      setErrorMsg('Erreur lors de la suppression.')
      return
    }

    setReviews((prev) => prev.filter((r) => r.id !== myReview.id))
    setMyReview(null)
    setMessage('Avis supprime.')
    setTimeout(() => closeModal(), 900)
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

  if (error || !profile) {
    return (
      <div className="app">
        <Nav />
        <main className="public-profile-page">
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>{error || 'Profil introuvable.'}</p>
            <Link to="/annonces" className="btn btn-secondary" style={{ marginTop: '12px' }}>
              Voir les annonces
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const name = profile.full_name || 'Vendeur AFRYA MARKET'
  const location = [profile.city, profile.country].filter(Boolean).join(', ')
  const memberSince = formatMemberSince(profile.created_at)
  const showPhone = profile.phone_visible && profile.phone
  const isOwnProfile = user && user.id === id

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
  const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0

  return (
    <div className="app public-profile-v2">
      <Nav />
      <main className="public-profile-page">
        {isShopMode && (
          <div className="shop-banner">
            {profile.shop_banner ? (
              <img src={profile.shop_banner} alt="" className="shop-banner-img" />
            ) : (
              <div className="shop-banner-placeholder" />
            )}
          </div>
        )}

        <header className={isShopMode ? 'public-profile-header shop-header' : 'public-profile-header'}>
          {isShopMode && profile.shop_logo ? (
            <img src={profile.shop_logo} alt={name} className="public-profile-avatar shop-logo" />
          ) : profile.avatar_url ? (
            <img src={profile.avatar_url} alt={name} className="public-profile-avatar" />
          ) : (
            <div className="public-profile-avatar public-profile-avatar-placeholder">👤</div>
          )}

          <div className="public-profile-name-row">
            <h1>{profile.shop_name || name}</h1>
            {profile.is_pro && (
              <div className="public-profile-badges">
                <span className="badge badge-pro">PRO</span>
                {profile.is_verified && (
                  <span className="badge badge-verified">✓ Vérifié</span>
                )}
              </div>
            )}
          </div>

          {location && <p className="public-profile-location">📍 {location}</p>}

          {reviews.length > 0 && (
            <div className="public-profile-rating">
              <Stars value={avgRating} />
              <span className="public-profile-rating-value">{avgRating.toFixed(1)}</span>
              <span className="public-profile-rating-count">
                ({reviews.length} avis)
              </span>
            </div>
          )}

          {memberSince && (
            <p className="public-profile-since">Membre depuis {memberSince}</p>
          )}

          <div className="public-profile-stats">
            <div className="public-stat">
              <span className="public-stat-value">{listingsCount}</span>
              <span className="public-stat-label">
                annonce{listingsCount > 1 ? 's' : ''} active{listingsCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {showPhone && (
            <div className="public-profile-phone">
              📞 <a href={'tel:' + profile.phone}>{profile.phone}</a>
            </div>
          )}
        </header>

        {profile.bio && (
          <section className="public-profile-bio">
            <h2>A propos</h2>
            <p>{profile.bio}</p>
          </section>
        )}

        <div className="public-profile-actions">
          <Link to="/annonces" className="btn btn-primary">
            Voir ses annonces
          </Link>
        </div>

        <section className="reviews-section">
          <div className="reviews-header">
            <h2>Avis {reviews.length > 0 && '(' + reviews.length + ')'}</h2>
            {!isOwnProfile && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={openModal}
                disabled={!user}
              >
                {myReview ? 'Modifier mon avis' : 'Laisser un avis'}
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="reviews-empty">
              <p>Aucun avis pour le moment.</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    {review.reviewer?.avatar_url ? (
                      <img
                        src={review.reviewer.avatar_url}
                        alt=""
                        className="review-avatar"
                      />
                    ) : (
                      <div className="review-avatar review-avatar-placeholder">👤</div>
                    )}
                    <div className="review-meta">
                      <strong>{review.reviewer?.full_name || 'Utilisateur'}</strong>
                      <span className="review-date">
                        {formatRelativeDate(review.created_at)}
                      </span>
                    </div>
                    <Stars value={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {!isOwnProfile && (
          <div className="public-profile-report">
            <button
              type="button"
              className="report-link"
              onClick={() => setReportModalOpen(true)}
            >
              ⚠ Signaler ce profil
            </button>
          </div>
        )}
      </main>

      {reportModalOpen && (
        <ReportModal
          targetType="profile"
          targetId={id}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={closeModal}
              aria-label="Fermer"
            >
              ✕
            </button>

            <h2>{myReview ? 'Modifier mon avis' : 'Laisser un avis'}</h2>
            <p className="modal-subtitle">Votre avis sur {name}</p>

            {!canReview && !myReview ? (
              <div className="modal-info">
                <p>
                  Vous devez avoir echange au moins un message avec ce vendeur
                  pour laisser un avis.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label>Note</label>
                  <div className="stars-input">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        className={i <= ratingInput ? 'star-filled' : 'star-empty'}
                        onClick={() => setRatingInput(i)}
                        aria-label={'Noter ' + i + ' etoile' + (i > 1 ? 's' : '')}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Commentaire (optionnel)</label>
                  <textarea
                    id="comment"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Partagez votre experience..."
                    maxLength={500}
                    rows={4}
                  />
                  <small className="form-hint">
                    {commentInput.length} / 500 caracteres
                  </small>
                </div>

                {message && <p className="form-success">{message}</p>}
                {errorMsg && <p className="form-error">{errorMsg}</p>}

                <div className="modal-actions">
                  {myReview && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteReview}
                      disabled={saving}
                    >
                      Supprimer
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicProfile
