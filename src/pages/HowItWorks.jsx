import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

const BUYER_STEPS = [
  {
    num: 1,
    icon: '🔍',
    title: 'Cherchez',
    text: 'Utilisez la barre de recherche ou explorez les catégories pour trouver ce qui vous intéresse.',
  },
  {
    num: 2,
    icon: '📦',
    title: 'Consultez',
    text: 'Photos, prix, description complète, localisation, informations du vendeur.',
  },
  {
    num: 3,
    icon: '💬',
    title: 'Contactez',
    text: 'Discutez directement avec le vendeur via la messagerie sécurisée d AFRYA MARKET.',
  },
  {
    num: 4,
    icon: '🤝',
    title: 'Commandez',
    text: 'Formalisez la transaction : mode de réception, paiement, tout est enregistré.',
  },
  {
    num: 5,
    icon: '✅',
    title: 'Recevez',
    text: 'Retrait en main propre ou livraison. Confirmez la réception et laissez un avis.',
  },
]

const SELLER_STEPS = [
  {
    num: 1,
    icon: '👤',
    title: 'Créez un compte',
    text: 'Inscription gratuite en 30 secondes. Complétez votre profil pour inspirer confiance.',
  },
  {
    num: 2,
    icon: '📸',
    title: 'Publiez',
    text: 'Ajoutez des photos, un titre clair, une description honnête et un prix juste.',
  },
  {
    num: 3,
    icon: '🔔',
    title: 'Recevez des demandes',
    text: 'Les acheteurs intéressés vous contactent directement. Vous recevez une notification.',
  },
  {
    num: 4,
    icon: '💬',
    title: 'Discutez',
    text: 'Négociez le prix, précisez les détails, répondez aux questions.',
  },
  {
    num: 5,
    icon: '💰',
    title: 'Vendez',
    text: 'Confirmez la commande, expédiez ou remettez en main propre, encaissez.',
  },
  {
    num: 6,
    icon: '🚀',
    title: 'Boostez (optionnel)',
    text: 'Gagnez en visibilité avec un boost payant. Votre annonce apparaît en priorité.',
  },
]

const TRUST_ITEMS = [
  { icon: '✓', text: 'Vendeurs vérifiés' },
  { icon: '✓', text: 'Avis authentiques' },
  { icon: '✓', text: 'Système de signalement' },
  { icon: '✓', text: 'Messagerie sécurisée' },
]

function HowItWorks() {
  return (
    <div className="app how-v2">
      <Nav />
      <main className="how-page">
        <header className="how-hero">
          <span className="how-badge">GUIDE</span>
          <h1>Comment ça marche ?</h1>
          <p className="how-subtitle">
            Publier, chercher, vendre — en quelques étapes simples.
          </p>
        </header>

        {/* ACHETEURS */}
        <section className="how-section">
          <div className="how-section-header">
            <div className="how-section-icon how-section-icon-buyer">🛒</div>
            <div>
              <h2>Comment acheter</h2>
              <p>Vous cherchez un article ? Voici comment procéder.</p>
            </div>
          </div>

          <div className="how-steps">
            {BUYER_STEPS.map((step) => (
              <div key={step.num} className="how-step">
                <div className="how-step-num">{step.num}</div>
                <div className="how-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VENDEURS */}
        <section className="how-section how-section-alt">
          <div className="how-section-header">
            <div className="how-section-icon how-section-icon-seller">🏪</div>
            <div>
              <h2>Comment vendre</h2>
              <p>Vous avez quelque chose à vendre ? Lancez-vous.</p>
            </div>
          </div>

          <div className="how-steps how-steps-seller">
            {SELLER_STEPS.map((step) => (
              <div key={step.num} className="how-step">
                <div className="how-step-num">{step.num}</div>
                <div className="how-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CONFIANCE */}
        <section className="how-trust">
          <h2>Nos engagements</h2>
          <p className="how-trust-sub">
            AFRYA MARKET est conçu pour que chaque transaction se passe en toute confiance.
          </p>
          <div className="how-trust-grid">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="how-trust-item">
                <span className="how-trust-check">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="how-trust-more">
            <Link to="/securite" className="how-trust-link">
              En savoir plus sur notre sécurité →
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="how-cta">
          <h2>Prêt à commencer ?</h2>
          <p>Rejoignez AFRYA MARKET en quelques secondes.</p>
          <div className="how-cta-actions">
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

export default HowItWorks
