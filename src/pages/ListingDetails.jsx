import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

function ListingDetails({ listings = [] }) {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

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
      .insert([
        {
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error('Erreur creation conversation :', createError)
      return
    }

    navigate(`/conversation/${created.id}`)
  }
  const [galleryImages, setGalleryImages] = useState([])
  const [activeImage, setActiveImage] = useState('')
  const [sellerProfile, setSellerProfile] = useState(null)
  const [favorited, setFavorited] = useState(false)
  const [pending, setPending] = useState(false)

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
        setActiveImage(data[0].image_url)
      }
    }

    loadImages()
  }, [id])

  const dynamicListing = listings.find(
    (listing) => listing.id === id
  )

  const listing = dynamicListing

  useEffect(() => {
    async function loadSellerProfile() {
      if (!listing?.user_id) return
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
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

  if (!listing) {
    return (
      <div className="app">
               <Nav />

        <main className="details-page">
          <h1>Annonce introuvable</h1>

          <p>
            Cette annonce n'existe pas ou n'est plus disponible.
          </p>

          <Link to="/" className="back-link">
            ← Retour aux annonces
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
             <Nav />

      <main className="details-page">
        <Link to="/" className="back-link">
          ← Retour aux annonces
        </Link>

        <div className="details-layout">
          <div className="details-image">
            <img
              src={activeImage || listing.image}
              alt={listing.title}
            />
            {galleryImages.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {galleryImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={listing.title}
                    onClick={() => setActiveImage(img.image_url)}
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border:
                        activeImage === img.image_url
                          ? '2px solid #1d4ed8'
                          : '2px solid transparent',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="details-info">
            <span className="listing-category">
              {listing.category}
            </span>

            <h1>{listing.title}</h1>

            <strong className="details-price">
              {listing.price} FCFA
            </strong>

            <p className="details-location">
              📍 {listing.location}
            </p>

            <span className="condition">
              {listing.condition}
            </span>

            <div className="details-description">
              <h2>Description</h2>

              <p>
                {listing.description}
              </p>
            </div>
            <div className="seller-box">
              <h2>À propos du vendeur</h2>
              <p>
                👤{' '}
                <Link to={`/vendeur/${listing.user_id}`}>
                  {sellerProfile?.full_name || 'Vendeur AFRYA MARKET'}
                </Link>
              </p>
              <p>
                📍 {listing.location}
              </p>
            </div>

            <div className="details-actions">
              <button
                className="contact-button"
                onClick={() =>
                  handleContactSeller(listing.user_id, listing.id)
                }
              >
                💬 Contacter le vendeur
              </button>

              <button
                className={`favorite-button ${favorited ? 'is-favorited' : ''}`}
                onClick={handleToggleFavorite}
                disabled={pending}
              >
                {favorited ? '🔖 Retirer des favoris' : '🔖 Ajouter aux favoris'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ListingDetails
