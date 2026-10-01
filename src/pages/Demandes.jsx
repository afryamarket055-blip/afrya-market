import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import LoadingState from '../components/LoadingState'
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

function Demandes() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const activeCategory = searchParams.get('categorie') || 'Toutes'
  const activeCity = searchParams.get('ville') || ''

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('demands')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)

      if (activeCategory !== 'Toutes') {
        query = query.eq('category', activeCategory)
      }
      if (activeCity.trim()) {
        query = query.ilike('city', '%' + activeCity.trim() + '%')
      }

      const { data, error } = await query

      if (error) {
        console.error('Erreur chargement demandes :', error)
        setError('Impossible de charger les demandes.')
        setLoading(false)
        return
      }

      setDemands(data || [])
      setLoading(false)
    }

    load()
  }, [activeCategory, activeCity])

  function setCategory(cat) {
    const params = new URLSearchParams(searchParams)
    if (cat === 'Toutes') params.delete('categorie')
    else params.set('categorie', cat)
    setSearchParams(params)
  }

  function setCity(value) {
    const params = new URLSearchParams(searchParams)
    if (!value.trim()) params.delete('ville')
    else params.set('ville', value)
    setSearchParams(params)
  }

  return (
    <div className="app">
      <Nav />
      <main style={{ padding: '80px 20px', maxWidth: '960px', margin: '0 auto' }}>
        <header style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ margin: 0 }}>Demandes</h1>
              <p style={{ color: '#666', margin: '4px 0 0' }}>
                Ce que les acheteurs recherchent en ce moment.
              </p>
            </div>
            <Link to="/je-recherche" className="btn btn-primary">
              + Je recherche
            </Link>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Filtrer par ville (ex : Cotonou)"
            value={activeCity}
            onChange={(e) => setCity(e.target.value)}
            style={{ flex: '1 1 240px', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                background: activeCategory === cat ? '#1a4dd1' : 'white',
                color: activeCategory === cat ? 'white' : '#333',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: activeCategory === cat ? 'bold' : 'normal',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Chargement des demandes..." />
        ) : error ? (
          <EmptyState icon="⚠" title="Erreur" message={error} />
        ) : demands.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Aucune demande pour le moment"
            message={
              activeCategory !== 'Toutes' || activeCity
                ? "Essayez d'élargir vos filtres."
                : "Soyez le premier à publier une demande !"
            }
          />
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {demands.map((demand) => {
              const isMine = user && user.id === demand.user_id
              return (
                <Link
                  key={demand.id}
                  to={'/demandes/' + demand.id}
                  style={{
                    display: 'block',
                    padding: '16px 20px',
                    border: isMine ? '2px solid #1a4dd1' : '1px solid #eee',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '17px' }}>
                        {demand.title}
                        {isMine && (
                          <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#e7eaf5', color: '#2c3e9e' }}>
                            Ma demande
                          </span>
                        )}
                      </h3>
                      <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                        📍 {demand.city} · {demand.category}
                        {demand.budget_max && (
                          <>
                            {' · '}
                            Budget max : {Number(demand.budget_max).toLocaleString('fr-FR')} FCFA
                          </>
                        )}
                      </p>
                      {demand.description && (
                        <p style={{ margin: '8px 0 0', color: '#555', fontSize: '14px', lineHeight: 1.4 }}>
                          {demand.description.length > 140
                            ? demand.description.slice(0, 140) + '...'
                            : demand.description}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#999', whiteSpace: 'nowrap' }}>
                      {new Date(demand.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Demandes
