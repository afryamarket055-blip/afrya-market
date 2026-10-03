import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'
import PageMeta from '../components/PageMeta'
import ListingCard from '../ListingCard'
import SkeletonList from '../components/SkeletonList'
import EmptyState from '../components/EmptyState'

const CATEGORIES = [
  'Toutes',
  'Téléphones',
  'Informatique',
  'Électroménager',
  'Mode',
  'Maison',
  'Véhicules',
  'Autres',
]

function VendorListings() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [vendor, setVendor] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const activeCategory = searchParams.get('categorie') || 'Toutes'
  const sortBy = searchParams.get('tri') || 'recent'

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: vendorData, error: vendorError } = await supabase
        .from('profiles_public')
        .select('id, full_name, shop_name, avatar_url, shop_logo, city, country, is_pro, is_verified')
        .eq('id', id)
        .single()

      if (vendorError) {
        setError("Vendeur introuvable.")
        setLoading(false)
        return
      }
      setVendor(vendorData)

      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', id)
        .eq('status', 'disponible')

      if (activeCategory !== 'Toutes') {
        query = query.eq('category', activeCategory)
      }

      if (sortBy === 'prix_asc') {
        query = query.order('price', { ascending: true })
      } else if (sortBy === 'prix_desc') {
        query = query.order('price', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data: listingsData, error: listingsError } = await query

      if (listingsError) {
        console.error('Erreur chargement annonces vendeur :', listingsError)
        setError('Impossible de charger les annonces.')
        setLoading(false)
        return
      }

      setListings(listingsData || [])
      setLoading(false)
    }

    load()
  }, [id, activeCategory, sortBy])

  function setCategory(cat) {
    const params = new URLSearchParams(searchParams)
    if (cat === 'Toutes') params.delete('categorie')
    else params.set('categorie', cat)
    setSearchParams(params)
  }

  function setSort(sort) {
    const params = new URLSearchParams(searchParams)
    if (sort === 'recent') params.delete('tri')
    else params.set('tri', sort)
    setSearchParams(params)
  }

  if (loading) {
    return (
      <div className="app">
        <Nav />
        <main className="vendor-listings-page">
          <SkeletonList count={8} />
        </main>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="app">
        <PageMeta title="Vendeur introuvable — AFRYA MARKET" />
        <Nav />
        <main className="vendor-listings-page">
          <EmptyState
            icon="❌"
            title="Vendeur introuvable"
            message={error || "Ce vendeur n'existe plus."}
          />
        </main>
      </div>
    )
  }

  const displayName = vendor.shop_name || vendor.full_name || 'Vendeur'
  const location = [vendor.city, vendor.country].filter(Boolean).join(', ')

  return (
    <div className="app">
      <PageMeta
        title={'Annonces de ' + displayName + ' — AFRYA MARKET'}
        description={'Decouvrez toutes les annonces de ' + displayName + ' sur AFRYA MARKET.'}
      />
      <Nav />
      <main className="vendor-listings-page">
        <Link to={'/vendeur/' + id} className="back-link">
          ← Retour au profil
        </Link>

        <header className="vendor-listings-header">
          <div className="vendor-listings-info">
            {(vendor.shop_logo || vendor.avatar_url) ? (
              <img
                src={vendor.shop_logo || vendor.avatar_url}
                alt={displayName}
                className="vendor-listings-avatar"
              />
            ) : (
              <div className="vendor-listings-avatar vendor-listings-avatar-placeholder">
                👤
              </div>
            )}
            <div>
              <h1>{displayName}</h1>
              {location && (
                <p className="vendor-listings-location">📍 {location}</p>
              )}
              <p className="vendor-listings-count">
                {listings.length} annonce{listings.length > 1 ? 's' : ''} active{listings.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Link to={'/vendeur/' + id} className="btn btn-secondary">
            Voir le profil
          </Link>
        </header>

        <div className="vendor-listings-filters">
          <div className="vendor-listings-cats">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={'filter-pill' + (activeCategory === cat ? ' is-active' : '')}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSort(e.target.value)}
            className="vendor-listings-sort"
          >
            <option value="recent">Plus récentes</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
          </select>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Aucune annonce"
            message={
              activeCategory !== 'Toutes'
                ? 'Aucune annonce dans cette catégorie.'
                : "Ce vendeur n'a aucune annonce active pour le moment."
            }
          />
        ) : (
          <div className="listing-grid">
            {listings.map((l) => (
              <Link
                key={l.id}
                to={'/annonce/' + l.id}
                className="listing-link"
              >
                <ListingCard
                  id={l.id}
                  title={l.title}
                  price={l.price}
                  location={l.location}
                  condition={l.condition}
                  category={l.category}
                  image={l.image}
                  status={l.status}
                  boostedUntil={l.boosted_until}
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default VendorListings
