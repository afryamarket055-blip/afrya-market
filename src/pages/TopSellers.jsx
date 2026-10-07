import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'
import PageMeta from '../components/PageMeta'
import Icon from '../components/Icon'
import EmptyState from '../components/EmptyState'
import SkeletonList from '../components/SkeletonList'

const MAX_SELLERS = 50

function TopSellers() {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      // 1. Charger les vendeurs verifies
      const { data: profiles, error: profErr } = await supabase
        .from('profiles_public')
        .select('id, full_name, shop_name, avatar_url, shop_logo, city, country, is_pro')
        .eq('is_verified', true)
        .limit(MAX_SELLERS)

      if (profErr) {
        console.error('Erreur chargement vendeurs :', profErr)
        setError(profErr.message)
        setLoading(false)
        return
      }

      if (!profiles || profiles.length === 0) {
        setSellers([])
        setLoading(false)
        return
      }

      const ids = profiles.map((p) => p.id)

      // 2. Compter les annonces actives par vendeur
      const { data: listings } = await supabase
        .from('listings')
        .select('user_id')
        .in('user_id', ids)
        .eq('status', 'disponible')

      const counts = {}
      for (const l of listings || []) {
        counts[l.user_id] = (counts[l.user_id] || 0) + 1
      }

      // 3. Fusionner + trier par nombre d'annonces desc
      const enriched = profiles
        .map((p) => ({ ...p, listings_count: counts[p.id] || 0 }))
        .sort((a, b) => b.listings_count - a.listings_count)

      setSellers(enriched)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="app">
      <PageMeta
        title="Vendeurs verifies — AFRYA MARKET"
        description="Decouvrez les vendeurs verifies d AFRYA MARKET. Profils controles, transactions fiables."
      />
      <Nav />

      <main
        style={{
          padding: '40px 20px 80px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <header style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#ecfdf5',
              color: '#047857',
              marginBottom: '16px',
            }}
          >
            <Icon name="shield" size={32} />
          </div>
          <h1>Vendeurs verifies</h1>
          <p style={{ opacity: 0.7, marginTop: '8px', maxWidth: '560px', margin: '8px auto 0' }}>
            Ces vendeurs ont valide leur identite aupres de notre equipe.
            Achetez en toute confiance.
          </p>
        </header>

        {loading ? (
          <SkeletonList count={6} />
        ) : error ? (
          <EmptyState
            icon={<Icon name="alert-triangle" size={40} />}
            title="Erreur"
            message={error}
          />
        ) : sellers.length === 0 ? (
          <EmptyState
            icon={<Icon name="shield" size={40} />}
            title="Aucun vendeur verifie pour le moment"
            message="Les vendeurs verifies apparaitront ici au fur et a mesure."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {sellers.map((seller) => {
              const name = seller.shop_name || seller.full_name || 'Vendeur'
              const avatar = seller.shop_logo || seller.avatar_url
              const location = [seller.city, seller.country].filter(Boolean).join(', ')
              const count = seller.listings_count

              return (
                <Link
                  key={seller.id}
                  to={'/vendeur/' + seller.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 18px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    background: '#fff',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#6b7280',
                      }}
                    >
                      <Icon name="user" size={28} />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '2px',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '15px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {name}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: '#ecfdf5',
                          color: '#047857',
                          fontSize: '11px',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        ✓ Verifie
                      </span>
                    </div>

                    {location && (
                      <div
                        style={{
                          fontSize: '13px',
                          opacity: 0.6,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {location}
                      </div>
                    )}

                    <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 500, marginTop: '4px' }}>
                      {count} annonce{count > 1 ? 's' : ''} active{count > 1 ? 's' : ''}
                    </div>
                  </div>

                  <Icon name="chevron-right" size={18} />
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default TopSellers
