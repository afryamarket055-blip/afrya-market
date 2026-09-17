import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import ListingCard from '../ListingCard'
import ReportModal from '../components/ReportModal'

function formatMemberSince(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.toLocaleString('fr-FR', { month: 'long' })
  return `${month} ${year}`
}

function ListingDetails({ listings = [] }) {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [galleryImages, setGalleryImages] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [sellerProfile, setSellerProfile] = useState(null)
  const [similarListings, setSimilarListings] = useState([])
  const [favorited, setFavorited] = useState(false)
  const [viewsCount, setViewsCount] = useState(0)
  const [pending, setPending] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  const dynamicListing = listings.find((listing) => listing.id === id)
  const listing = dynamicListing

  // ----- Gallery -----
  useEffect(() => {
    async function loadImages() {
      const { data, error } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', id)
        .order('position', { ascending: true })

      if (error) {
        console.error('Erreur chargement photos :', error)
        return
      }

      if (data && data.length > 0) {
        setGalleryImages(data)
        setActiveIndex(0)
      }
    }
    loadImages()
  }, [id])

  // ----- Favorite state -----
  useEffect(() => {
    async function loadFavoriteState() {
      if (!user || !id) {
        setFavorited(false)
        return
      }
      const { data } = await supabase
        .from('listing_favorites')
        .select('id')
        .eq('listing_id', id)
        .eq('user_id', user.id)
        .maybeSingle()
      setFavorited(!!data)
    }
    loadFavoriteState()
  }, [id, user])

  // ----- Seller profile -----
  useEffect(() => {
    async function loadSellerProfile() {
      if (!listing?.user_id) return
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, created_at')
        .eq('id', listing.user_id)
        .single()
      if (error) {
        console.error('Erreur chargement profil vendeur :', error)
        return
      }
      setSellerProfile(data)
    }
    loadSellerProfile()
  }, [listing])

  // ----- Similar listings -----
  useEffect(() => {
    async function loadSimilar() {
      if (!listing?.category || !listing?.id) return
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', listing.category)
        .neq('id', listing.id)
        .limit(4)
      if (error) {
        console.error('Erreur chargement annonces similaires :', error)
        return
      }
      setSimilarListings(data || [])
    }
    loadSimilar()
  }, [listing])

  // ----- Actions -----
  async function handleContactSeller(sellerId, listingId) {
    if (!user) {
      navigate('/connexion')
      return
    }
    if (user.id === sellerId) {
      alert('Vous ne pouvez pas contacter votre propre annonce.')
      return
    }

    const { data: existing, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .maybeSingle()

    if (searchError) {
      console.error('Erreur recherche conversation :', searchError)
      return
    }
    if (existing) {
      navigate(`/conversation/${existing.id}`)
      return
    }

    const { data: created, error: createError } = await supabase
      .from('conversations')
      .insert([{ listing_id: listingId, buyer_id: user.id, seller_id: sellerId }])
      .select()
      .single()

    if (createError) {
      console.error('Erreur creation conversation :', createError)
      return
    }
    navigate(`/conversation/${created.id}`)
  }

  // ----- Views count (affichage) -----
  useEffect(() => {
    async function loadViewsCount() {
      if (!listing?.id) return
      const { count } = await supabase
        .from('listing_views')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listing.id)
      setViewsCount(count || 0)
    }
    loadViewsCount()
  }, [listing])

  // ----- View tracking (1 vue / 24h / annonce, cote client) -----
  useEffect(() => {
    if (!listing?.id) return

    // Skip si le vendeur regarde sa propre annonce
    if (user && listing.user_id === user.id) return

    const storageKey = 'afrya_viewed_' + listing.id
    const lastViewed = localStorage.getItem(storageKey)
    const now = Date.now()
    const DAY_MS = 24 * 60 * 60 * 1000

    if (lastViewed && now - Number(lastViewed) < DAY_MS) {
      return
    }

    // Marquer TOUT DE SUITE pour bloquer les appels en double (StrictMode, re-renders)
    localStorage.setItem(storageKey, String(now))

    async function recordView() {
      const payload = { listing_id: listing.id }
      if (user?.id) payload.viewer_id = user.id

      const { error } = await supabase
        .from('listing_views')
        .insert([payload])

      // 23505 = duplicate key (deja vu aujourd'hui) -> silencieux
      if (error && error.code !== '23505') {
        console.debug('Vue non enregistree :', error.message)
      }
    }

    recordView()
  }, [listing, user])

  async function handleToggleFavorite() {
    if (!user) {
      navigate('/connexion')
      return
    }
    if (pending || !id) return
    setPending(true)

    if (favorited) {
      const { error } = await supabase
        .from('listing_favorites')
        .delete()
        .eq('listing_id', id)
        .eq('user_id', user.id)
      if (!error) setFavorited(false)
    } else {
      const { error } = await supabase
        .from('listing_favorites')
        .insert([{ listing_id: id, user_id: user.id }])
      if (!error) setFavorited(true)
    }
    setPending(false)
  }

  function goToPrev() {
    if (galleryImages.length <= 1) return
    setActiveIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
  }

  function goToNext() {
    if (galleryImages.length <= 1) return
    setActiveIndex((i) => (i + 1) % galleryImages.length)
  }

  // ----- Empty state -----
  if (!listing) {
    return (
      <div className="app">
        <Nav />
        <main className="details-page">
          <h1>Annonce introuvable</h1>
          <p>Cette annonce n'existe pas ou n'est plus disponible.</p>
          <Link to="/annonces" className="back-link">← Retour aux annonces</Link>
        </main>
      </div>
    )
  }

  const mainImage =
    galleryImages.length > 0
      ? galleryImages[activeIndex]?.image_url
      : listing.image

  return (
    <div className="app details-v2">
      <Nav />

      <main className="details-page">
        <Link to="/annonces" className="back-link">← Retour aux annonces</Link>

        <div className="details-layout">
          <div className="details-gallery">
            <div className="details-main-image">
              <img src={mainImage} alt={listing.title} />
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-nav gallery-prev"
                    onClick={goToPrev}
                    aria-label="Image precedente"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="gallery-nav gallery-next"
                    onClick={goToNext}
                    aria-label="Image suivante"
                  >
                    ›
                  </button>
                  <span className="gallery-counter">
                    {activeIndex + 1} / {galleryImages.length}
                  </span>
                </>
              )}
              {listing.status === 'vendu' && (
                <span className="badge badge-sold details-badge">VENDU</span>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="details-thumbnails">
                {galleryImages.map((img, index) => (
                  <button
                    key={img.id}
                    type="button"
                    className={
                      'thumbnail' + (index === activeIndex ? ' is-active' : '')
                    }
                    onClick={() => setActiveIndex(index)}
                    aria-label={'Image ' + (index + 1)}
                  >
                    <img src={img.image_url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="details-info">
            <span className="listing-category">{listing.category}</span>

            <h1 className="details-title">{listing.title}</h1>

            <strong className="details-price">{listing.price} FCFA</strong>

            <div className="details-meta">
              <p className="details-location">📍 {listing.location}</p>
              <span className="condition">{listing.condition}</span>
              {viewsCount > 0 && (
                <span className="details-views">👁 {viewsCount} vue{viewsCount > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="details-actions">
              {user && listing.user_id === user.id ? (
                <Link
                  to={'/booster/' + listing.id}
                  className="btn btn-primary btn-lg"
                >
                  Booster cette annonce
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => handleContactSeller(listing.user_id, listing.id)}
                >
                  💬 Contacter le vendeur
                </button>
              )}

              <button
                type="button"
                className={`icon-action ${favorited ? 'is-favorited' : ''}`}
                onClick={handleToggleFavorite}
                disabled={pending}
                aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                {favorited ? '🔖' : '📑'}
              </button>

              <button
                type="button"
                className="icon-action"
                disabled
                aria-label="Partager"
                title="Partager (bientot)"
              >
                📤
              </button>
            </div>

            <div className="seller-box">
              <h2>Vendeur</h2>
              <div className="seller-row">
                {sellerProfile?.avatar_url ? (
                  <img
                    src={sellerProfile.avatar_url}
                    alt=""
                    className="seller-avatar"
                  />
                ) : (
                  <div className="seller-avatar seller-avatar-placeholder">👤</div>
                )}
                <div className="seller-info">
                  <Link to={`/vendeur/${listing.user_id}`} className="seller-name">
                    {sellerProfile?.full_name || 'Vendeur AFRYA MARKET'}
                  </Link>
                  {sellerProfile?.created_at && (
                    <span className="seller-since">
                      Membre depuis {formatMemberSince(sellerProfile.created_at)}
                    </span>
                  )}
                </div>
                <Link to={`/vendeur/${listing.user_id}`} className="seller-link">
                  Voir profil →
                </Link>
              </div>
            </div>

            <button
              type="button"
              className="report-link"
              onClick={() => setReportModalOpen(true)}
            >
              ⚠ Signaler cette annonce
            </button>
          </div>
        </div>

        <section className="details-description">
          <h2>Description</h2>
          <p>{listing.description || 'Aucune description fournie.'}</p>
        </section>

        {similarListings.length > 0 && (
          <section className="details-similar">
            <h2>Annonces similaires</h2>
            <div className="listing-grid">
              {similarListings.map((item) => (
                <Link
                  key={item.id}
                  to={'/annonce/' + item.id}
                  className="listing-link"
                >
                  <ListingCard
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    location={item.location}
                    condition={item.condition}
                    category={item.category}
                    image={item.image}
                    status={item.status}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
        {reportModalOpen && (
          <ReportModal
            targetType="listing"
            targetId={listing.id}
            onClose={() => setReportModalOpen(false)}
          />
        )}
      </main>
    </div>
  )
}

export default ListingDetails
