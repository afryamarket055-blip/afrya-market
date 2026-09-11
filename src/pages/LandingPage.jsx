import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

const FEATURES = [
  { icon: '🚀', title: 'Gratuit', text: 'Publiez vos annonces en 30 secondes.' },
  { icon: '📍', title: 'Près de vous', text: 'Trouvez ce qui se vend dans votre ville.' },
  { icon: '💬', title: 'Direct', text: 'Discutez avec les vendeurs, sans intermédiaire.' },
  { icon: '🔒', title: 'Sécurisé', text: 'Profils vérifiés, transactions en confiance.' },
]

const STEPS = [
  { num: 1, icon: '🔍', title: 'Recherchez', text: 'Trouvez ce dont vous avez besoin près de chez vous.' },
  { num: 2, icon: '📦', title: 'Consultez', text: 'Voyez les détails, photos et prix du vendeur.' },
  { num: 3, icon: '💬', title: 'Contactez', text: 'Échangez et négociez directement.' },
  { num: 4, icon: '🤝', title: 'Concluez', text: 'Achetez ou vendez en toute simplicité.' },
]

const CATEGORIES = [
  { icon: '📱', name: 'Téléphones' },
  { icon: '💻', name: 'Informatique' },
  { icon: '📺', name: 'Électroménager' },
  { icon: '👕', name: 'Mode' },
  { icon: '🛋', name: 'Maison' },
  { icon: '🏍', name: 'Véhicules' },
]

function LandingPage() {
  return (
    <div className="app">
      <Nav />
      <main>
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <span className="hero-badge">🇧🇯 Le marché numérique africain</span>
            <h1>
              Achetez. Vendez.
              <br />
              <span>Trouvez.</span>
            </h1>
            <p className="landing-hero-subtitle">
              AFRYA MARKET connecte acheteurs et vendeurs partout au Bénin —
              simplement, rapidement et en toute confiance.
            </p>
            <div className="landing-hero-actions">
              <Link to="/inscription" className="btn btn-primary btn-lg">
                Commencer maintenant
              </Link>
              <Link to="/annonces" className="btn btn-secondary btn-lg">
                Explorer les annonces
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-container">
            <div className="landing-features-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="landing-feature">
                  <div className="landing-feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-how">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span>COMMENT ÇA MARCHE</span>
              <h2>4 étapes simples</h2>
            </div>
            <div className="landing-steps">
              {STEPS.map((s) => (
                <div key={s.num} className="landing-step">
                  <div className="landing-step-num">{s.num}</div>
                  <div className="landing-step-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-categories">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span>EXPLORER</span>
              <h2>Catégories populaires</h2>
            </div>
            <div className="landing-category-grid">
              {CATEGORIES.map((c) => (
                <Link key={c.name} to="/annonces" className="landing-category">
                  <div className="landing-category-icon">{c.icon}</div>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-inner">
            <h2>Prêt à commencer ?</h2>
            <p>Rejoignez AFRYA MARKET et donnez une seconde vie à vos objets.</p>
            <div className="landing-cta-actions">
              <Link to="/inscription" className="btn btn-primary btn-lg">
                Créer mon compte
              </Link>
              <Link to="/annonces" className="btn btn-secondary btn-lg">
                Voir les annonces
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-brand">
            <div className="logo">AFRYA <span>MARKET</span></div>
            <p>Le marché numérique africain.</p>
          </div>
          <div className="footer-col">
            <h4>AFRYA MARKET</h4>
            <Link to="/">Accueil</Link>
            <Link to="/annonces">Annonces</Link>
            <Link to="/categories">Catégories</Link>
          </div>
          <div className="footer-col">
            <h4>Acheter</h4>
            <Link to="/annonces">Toutes les annonces</Link>
            <Link to="/favoris">Mes favoris</Link>
          </div>
          <div className="footer-col">
            <h4>Vendre</h4>
            <Link to="/inscription">Créer un compte</Link>
            <Link to="/vendre">Publier une annonce</Link>
          </div>
          <div className="footer-col">
            <h4>Aide</h4>
            <a href="#">Centre d'aide</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} AFRYA MARKET</span>
          <div>
            <a href="#">Conditions</a>
            <a href="#">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
