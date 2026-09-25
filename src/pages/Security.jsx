import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

const ENGAGEMENTS = [
  {
    icon: '✓',
    title: 'Vendeurs vérifiés',
    text: 'Les vendeurs professionnels sont validés manuellement par notre équipe avant d obtenir le badge "Vérifié".',
  },
  {
    icon: '✓',
    title: 'Avis authentiques',
    text: 'Seuls les utilisateurs ayant réellement discuté avec un vendeur peuvent laisser un avis. Un avis par paire.',
  },
  {
    icon: '✓',
    title: 'Messagerie sécurisée',
    text: 'Vos conversations sont privées. Personne d autre que vous et votre interlocuteur ne peut les lire.',
  },
  {
    icon: '✓',
    title: 'Système de signalement',
    text: 'Chaque annonce et chaque profil peut être signalé. Notre équipe examine chaque signalement.',
  },
]

const BUYER_TIPS = [
  {
    num: 1,
    title: 'Rencontrez-vous dans un lieu public',
    text: 'Privilégiez les endroits fréquentés : marché, centre commercial, station de taxi. Évitez les lieux isolés.',
  },
  {
    num: 2,
    title: 'Vérifiez l article avant de payer',
    text: 'Inspectez le produit, testez-le si possible. Ne vous fiez jamais uniquement aux photos.',
  },
  {
    num: 3,
    title: 'Ne payez jamais à l avance',
    text: 'Tant que le paiement sécurisé n est pas actif, payez uniquement en main propre, au moment de la remise.',
  },
  {
    num: 4,
    title: 'Méfiez-vous des prix trop bas',
    text: 'Un iPhone à 50 000 FCFA, c est une arnaque. Comparez toujours les prix du marché.',
  },
  {
    num: 5,
    title: 'Consultez les avis du vendeur',
    text: 'Un vendeur avec plusieurs avis positifs est plus fiable. Méfiez-vous des profils récents sans historique.',
  },
  {
    num: 6,
    title: 'Utilisez la messagerie interne',
    text: 'Ne partagez jamais vos coordonnées bancaires ou personnelles hors de la plateforme.',
  },
]

const SELLER_TIPS = [
  {
    num: 1,
    title: 'Rencontrez-vous dans un lieu public',
    text: 'Pour votre sécurité, donnez rendez-vous dans un endroit fréquenté de jour.',
  },
  {
    num: 2,
    title: 'Ne donnez jamais l article avant paiement',
    text: 'Attendez d avoir reçu le paiement complet avant de remettre l article.',
  },
  {
    num: 3,
    title: 'Vérifiez les billets / le paiement',
    text: 'Si paiement en espèces, vérifiez l authenticité des billets. Si Mobile Money, vérifiez la réception avant de partir.',
  },
  {
    num: 4,
    title: 'Évitez de vous déplacer trop loin',
    text: 'Privilégiez votre ville ou quartier. Un acheteur sérieux acceptera de venir à vous.',
  },
]

function Security() {
  return (
    <div className="app security-v2">
      <Nav />
      <main className="security-page">
        <header className="security-hero">
          <span className="security-badge">SÉCURITÉ</span>
          <h1>Votre sécurité, notre priorité</h1>
          <p className="security-subtitle">
            AFRYA MARKET met tout en œuvre pour que chaque transaction se
            déroule en toute confiance.
          </p>
        </header>

        {/* Engagements */}
        <section className="security-section">
          <h2 className="security-section-title">Nos engagements</h2>
          <div className="security-engagements">
            {ENGAGEMENTS.map((e, i) => (
              <div key={i} className="security-engagement">
                <div className="security-engagement-icon">{e.icon}</div>
                <h3>{e.title}</h3>
                <p>{e.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conseils acheteurs */}
        <section className="security-section security-section-alt">
          <h2 className="security-section-title">🛒 Conseils pour acheter en sécurité</h2>
          <div className="security-tips">
            {BUYER_TIPS.map((tip) => (
              <div key={tip.num} className="security-tip">
                <div className="security-tip-num">{tip.num}</div>
                <div className="security-tip-body">
                  <h3>{tip.title}</h3>
                  <p>{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conseils vendeurs */}
        <section className="security-section">
          <h2 className="security-section-title">🏪 Conseils pour vendre en sécurité</h2>
          <div className="security-tips">
            {SELLER_TIPS.map((tip) => (
              <div key={tip.num} className="security-tip">
                <div className="security-tip-num">{tip.num}</div>
                <div className="security-tip-body">
                  <h3>{tip.title}</h3>
                  <p>{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Que faire en cas de problème */}
        <section className="security-alert">
          <div className="security-alert-icon">🚨</div>
          <h2>Un problème ? Un comportement suspect ?</h2>
          <p>
            Signalez-le nous immédiatement. Chaque signalement est examiné
            par notre équipe sous 24-48h.
          </p>
          <div className="security-alert-actions">
            <Link to="/signaler" className="btn btn-primary btn-lg">
              Signaler un problème
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              Nous contacter
            </Link>
          </div>
        </section>

        {/* CTA final */}
        <section className="security-cta">
          <h2>Ensemble, construisons un marché sûr</h2>
          <p>
            Rejoignez AFRYA MARKET et participez à une communauté
            de confiance.
          </p>
          <Link to="/inscription" className="btn btn-primary btn-lg">
            Créer mon compte
          </Link>
        </section>
      </main>
    </div>
  )
}

export default Security
