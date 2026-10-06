import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import PageMeta from '../components/PageMeta'

function NotFound() {
  return (
    <div className="app">
      <PageMeta title="Page introuvable — AFRYA MARKET" />
      <Nav />

      <main
        style={{
          padding: '80px 20px',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontSize: '80px',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1,
            opacity: 0.15,
          }}
        >
          404
        </p>

        <h1 style={{ marginTop: '-20px' }}>
          Page introuvable
        </h1>

        <p
          style={{
            marginTop: '12px',
            marginBottom: '32px',
            opacity: 0.7,
          }}
        >
          Le lien est peut-être erroné, ou la page a été déplacée.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '320px',
            margin: '0 auto',
          }}
        >
          <Link
            to="/"
            style={{
              padding: '12px 20px',
              background: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            ← Retour à l'accueil
          </Link>

          <Link
            to="/annonces"
            style={{
              padding: '12px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            Voir toutes les annonces
          </Link>

          <Link
            to="/aide"
            style={{
              padding: '12px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            Centre d'aide
          </Link>
        </div>
      </main>
    </div>
  )
}

export default NotFound
