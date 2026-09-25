import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

function About() {
  return (
    <div className="app about-v2">
      <Nav />
      <main className="about-page">
        <header className="about-hero">
          <span className="about-badge">Notre histoire</span>
          <h1>AFRYA MARKET</h1>
          <p className="about-tagline">
            Le marché numérique africain.
          </p>
          <p className="about-intro">
            AFRYA MARKET connecte acheteurs et vendeurs partout au Bénin
            — et bientôt dans toute l'Afrique de l'Ouest. Une plateforme
            simple, rapide et sécurisée pour donner une seconde vie aux objets
            et permettre à chacun de développer son activité commerciale.
          </p>
        </header>

        <section className="about-section">
          <div className="about-section-grid">
            <div className="about-section-text">
              <h2>Notre mission</h2>
              <p>
                Rendre le commerce en ligne accessible à tous, particuliers
                comme professionnels, en offrant un espace de confiance où
                chaque annonce trouve son acheteur.
              </p>
              <p>
                Nous croyons qu'un marché numérique africain moderne doit
                être <strong>simple</strong>, <strong>rapide</strong>, et
                surtout <strong>adapté aux réalités locales</strong>.
              </p>
            </div>
            <div className="about-section-icon">🎯</div>
          </div>
        </section>

        <section className="about-section about-section-alt">
          <div className="about-section-grid">
            <div className="about-section-icon">🌍</div>
            <div className="about-section-text">
              <h2>Notre vision</h2>
              <p>
                Devenir la marketplace de référence en Afrique de l'Ouest,
                puis dans toute l'Afrique. Une plateforme où chaque ville,
                chaque quartier, chaque commerçant peut trouver sa place.
              </p>
              <p>
                AFRYA MARKET, c'est l'ambition de bâtir un écosystème
                commercial numérique à l'image du continent :{' '}
                <strong>dynamique, vivant et tourné vers l'avenir</strong>.
              </p>
            </div>
          </div>
        </section>

        <section className="about-values">
          <h2>Nos valeurs</h2>
          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-icon">🔒</div>
              <h3>Confiance</h3>
              <p>
                Profils vérifiés, avis authentiques, système de signalement.
                Nous protégeons nos utilisateurs.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">⚡</div>
              <h3>Simplicité</h3>
              <p>
                Publier, chercher, contacter. En 3 clics. Sans complication,
                accessible à tous.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">🇧🇯</div>
              <h3>Ancrage africain</h3>
              <p>
                Une plateforme pensée pour les réalités locales, les villes,
                les quartiers et les habitudes du continent.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>
                Un produit qui évolue constamment pour servir mieux nos
                utilisateurs et vendeurs.
              </p>
            </div>
          </div>
        </section>

        <section className="about-company">
          <h2>AFRYA ONE</h2>
          <p>
            AFRYA MARKET est un produit développé par{' '}
            <strong>AFRYA ONE</strong>, une organisation qui construit des
            solutions numériques pensées pour le continent africain.
          </p>
        </section>

        <section className="about-contact">
          <h2>Nous contacter</h2>
          <p>Une question, une suggestion, un partenariat ?</p>
          <div className="about-contact-grid">
            <a href="mailto:afryaone@gmail.com" className="about-contact-card">
              <div className="about-contact-icon">✉️</div>
              <strong>Email</strong>
              <span>afryaone@gmail.com</span>
            </a>
            <a href="tel:+2290140349817" className="about-contact-card">
              <div className="about-contact-icon">📞</div>
              <strong>Téléphone</strong>
              <span>+229 01 40 34 98 17</span>
            </a>
          </div>
        </section>

        <section className="about-cta">
          <h2>Prêt à rejoindre AFRYA MARKET ?</h2>
          <div className="about-cta-actions">
            <Link to="/inscription" className="btn btn-primary btn-lg">
              Créer mon compte
            </Link>
            <Link to="/annonces" className="btn btn-secondary btn-lg">
              Voir les annonces
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default About
