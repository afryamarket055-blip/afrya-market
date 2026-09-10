import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
const initialListings = {
  'iphone-13': {
    title: 'iPhone 13 128 Go',
    price: '350 000',
    location: 'Cotonou, Littoral',
    condition: 'Très bon état',
    category: 'Téléphones',
    image:
      'https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=1200&q=80',
    description:
      "iPhone 13 128 Go en très bon état. Fonctionne parfaitement et est prêt à l'emploi.",
  },

  'hp-elitebook': {
    title: 'HP EliteBook',
    price: '180 000',
    location: 'Abomey-Calavi',
    condition: 'Bon état',
    category: 'Informatique',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
    description:
      'HP EliteBook en bon état. Ordinateur fiable, rapide et idéal pour le travail, les études et la bureautique.',
  },

  'refrigerateur-samsung': {
    title: 'Réfrigérateur Samsung',
    price: '250 000',
    location: 'Porto-Novo',
    condition: 'Très bon état',
    category: 'Électroménager',
    image:
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1200&q=80',
    description:
      'Réfrigérateur Samsung en très bon état. Fonctionne correctement et offre un bon espace de conservation.',
  },

  'canape-moderne': {
    title: 'Canapé moderne',
    price: '120 000',
    location: 'Cotonou',
    condition: 'Bon état',
    category: 'Maison',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    description:
      'Canapé moderne en bon état. Confortable et idéal pour aménager un salon.',
  },
}

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

  const listing =
    dynamicListing || initialListings[id]

  useEffect(() => {
    async function loadSellerProfile() {
      if (!listing?.user_id) return
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
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
              {sellerProfile?.phone && (
                <p>📞 {sellerProfile.phone}</p>
              )}
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

              <button className="favorite-button">
                ❤️ Ajouter aux favoris
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ListingDetails
