import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

function LandingPage() {
  return (
    <div className="app">
      <Nav />
      <main>
        <section
          className="hero"
          style={{ textAlign: 'center', padding: '60px 20px' }}
        >
          <span className="hero-badge">
            🇧🇯 Le marché numérique africain
          </span>
          <h1>
            Achetez. Vendez.
            <br />
            <span>Trouvez.</span>
          </h1>
          <p>
            AFRYA MARKET connecte acheteurs et vendeurs partout au Bénin,
            simplement et en toute confiance.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginTop: '30px',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/inscription" className="sell-button">
              Commencer
            </Link>
            <Link to="/connexion">J'ai déjà un compte</Link>
          </div>
        </section>

        <section
          className="how-it-works"
          style={{ padding: '60px 20px', textAlign: 'center' }}
        >
          <h2>Comment ça marche ?</h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              flexWrap: 'wrap',
              marginTop: '30px',
            }}
          >
            <div className="category-card">
              <div className="category-icon">🔍</div>
              <h3>Recherchez</h3>
              <p>Trouvez ce dont vous avez besoin, près de chez vous.</p>
            </div>
            <div className="category-card">
              <div className="category-icon">📦</div>
              <h3>Consultez l'annonce</h3>
              <p>Voyez les détails, photos et prix du vendeur.</p>
            </div>
            <div className="category-card">
              <div className="category-icon">💬</div>
              <h3>Contactez le vendeur</h3>
              <p>Échangez et négociez directement.</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🤝</div>
              <h3>Concluez la vente</h3>
              <p>Achetez ou vendez en toute simplicité.</p>
            </div>
          </div>
        </section>

        <section
          style={{ padding: '40px 20px', textAlign: 'center' }}
        >
          <h2>Prêt à commencer ?</h2>
          <Link to="/inscription" className="sell-button">
            Créer mon compte gratuitement
          </Link>
        </section>
      </main>
      <footer className="footer">
        <div className="logo">
          AFRYA <span>MARKET</span>
        </div>
        <p>Le marché numérique africain.</p>
      </footer>
    </div>
  )
}

export default LandingPage
