import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'
import PageMeta from '../components/PageMeta'
import Icon from '../components/Icon'

const CATEGORIES = [
  { key: 'Téléphones', icon: 'smartphone' },
  { key: 'Informatique', icon: 'laptop' },
  { key: 'Électroménager', icon: 'tv' },
  { key: 'Mode', icon: 'shirt' },
  { key: 'Maison', icon: 'sofa' },
  { key: 'Véhicules', icon: 'bike' },
  { key: 'Autres', icon: 'package' },
]

function Categories() {
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCounts() {
      const { data, error } = await supabase
        .from('listings')
        .select('category')

      if (error) {
        console.error('Erreur chargement categories :', error)
        setLoading(false)
        return
      }

      const c = {}
      for (const row of data || []) {
        const cat = row.category || 'Autres'
        c[cat] = (c[cat] || 0) + 1
      }
      setCounts(c)
      setLoading(false)
    }
    loadCounts()
  }, [])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="app">
      <PageMeta
        title="Catégories — AFRYA MARKET"
        description="Parcourez toutes les catégories d'annonces sur AFRYA MARKET."
      />
      <Nav />

      <main
        style={{
          padding: '40px 20px 80px',
          maxWidth: '960px',
          margin: '0 auto',
        }}
      >
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1>Catégories</h1>
          <p style={{ opacity: 0.7, marginTop: '8px' }}>
            {loading
              ? 'Chargement...'
              : total + ' annonce' + (total > 1 ? 's' : '') + ' disponible' + (total > 1 ? 's' : '')}
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px',
          }}
        >
          {CATEGORIES.map((cat) => {
            const count = counts[cat.key] || 0
            return (
              <Link
                key={cat.key}
                to={'/annonces?category=' + encodeURIComponent(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '18px 20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={cat.icon} size={24} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>
                    {cat.key}
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '2px' }}>
                    {loading ? '—' : count + ' annonce' + (count > 1 ? 's' : '')}
                  </div>
                </div>

                <Icon name="chevron-right" size={18} />
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default Categories
