import { useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

const CATEGORIES = [
  { key: 'all', label: 'Tout', icon: '📋' },
  { key: 'compte', label: 'Compte', icon: '👤' },
  { key: 'annonces', label: 'Annonces', icon: '📦' },
  { key: 'achats', label: 'Achats', icon: '🛒' },
  { key: 'ventes', label: 'Ventes', icon: '🏪' },
  { key: 'paiement', label: 'Paiement', icon: '💰' },
  { key: 'securite', label: 'Sécurité', icon: '🛡️' },
]

const FAQ = [
  {
    cat: 'compte',
    q: 'Comment créer un compte sur AFRYA MARKET ?',
    a: 'Cliquez sur "S inscrire" en haut à droite, remplissez votre nom, email et mot de passe. C est gratuit et ça prend 30 secondes. Un email de confirmation vous sera envoyé.',
  },
  {
    cat: 'compte',
    q: 'Comment modifier mes informations personnelles ?',
    a: 'Rendez-vous dans "Mon compte" → "Mon profil". Vous pouvez y modifier votre nom, votre bio, votre ville, votre téléphone et votre photo de profil.',
  },
  {
    cat: 'compte',
    q: 'J ai oublié mon mot de passe, que faire ?',
    a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Un lien de réinitialisation vous sera envoyé par email.',
  },
  {
    cat: 'annonces',
    q: 'Comment publier une annonce ?',
    a: 'Cliquez sur "+ Vendre un article", ajoutez vos photos, remplissez le titre, la description, le prix et la localisation, puis publiez. Votre annonce est immédiatement visible.',
  },
  {
    cat: 'annonces',
    q: 'Comment modifier ou supprimer mon annonce ?',
    a: 'Allez dans "Mon compte" → "Mes annonces". Vous y trouverez les boutons "Modifier" et "Supprimer" pour chaque annonce.',
  },
  {
    cat: 'annonces',
    q: 'Combien d annonces puis-je publier ?',
    a: 'Il n y a aucune limite. Publiez autant d annonces que vous le souhaitez, gratuitement.',
  },
  {
    cat: 'achats',
    q: 'Comment acheter un article sur AFRYA MARKET ?',
    a: 'Trouvez l article qui vous intéresse, cliquez sur "Commander", choisissez votre mode de réception (retrait ou livraison), puis validez. Le vendeur sera notifié.',
  },
  {
    cat: 'achats',
    q: 'Comment suivre ma commande ?',
    a: 'Rendez-vous dans "Mon compte" → "Mes commandes". Vous y verrez toutes vos commandes avec leur statut : en attente, acceptée, payée, expédiée, reçue, terminée.',
  },
  {
    cat: 'ventes',
    q: 'Comment vendre un article ?',
    a: 'Créez un compte, publiez votre annonce avec de belles photos et une description honnête. Les acheteurs intéressés vous contacteront directement.',
  },
  {
    cat: 'ventes',
    q: 'Comment devenir vendeur professionnel ?',
    a: 'Dans "Paramètres" → "Boutique pro", activez votre boutique. Ajoutez un logo, une bannière et une description. Votre profil deviendra une vraie boutique.',
  },
  {
    cat: 'ventes',
    q: 'Comment booster mon annonce ?',
    a: 'Sur votre annonce, cliquez sur "Booster". Choisissez un pack (500, 1000 ou 2500 FCFA) et payez via Mobile Money. Votre annonce apparaîtra en priorité.',
  },
  {
    cat: 'paiement',
    q: 'Quels sont les moyens de paiement acceptés ?',
    a: 'Pour l instant, les paiements se font via Mobile Money (MTN MoMo, Moov Money). Le paiement sécurisé intégré arrive bientôt.',
  },
  {
    cat: 'paiement',
    q: 'Comment fonctionne le paiement sécurisé ?',
    a: 'Bientôt, AFRYA MARKET proposera un système de paiement sécurisé avec escrow : les fonds sont retenus jusqu à confirmation de la livraison.',
  },
  {
    cat: 'securite',
    q: 'Comment éviter les arnaques ?',
    a: 'Vérifiez les avis du vendeur, privilégiez les vendeurs vérifiés, rencontrez-vous dans un lieu public, et ne payez jamais en avance sans garantie.',
  },
  {
    cat: 'securite',
    q: 'Comment signaler un comportement suspect ?',
    a: 'Sur une annonce ou un profil, cliquez sur "Signaler". Choisissez la raison et décrivez le problème. Notre équipe examine chaque signalement.',
  },
]

function Help() {
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const filtered = FAQ.filter((f) => {
    if (activeCat !== 'all' && f.cat !== activeCat) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    }
    return true
  })

  function toggleFaq(index) {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="app help-v2">
      <Nav />
      <main className="help-page">
        <header className="help-hero">
          <span className="help-badge">AIDE</span>
          <h1>Centre d aide</h1>
          <p className="help-subtitle">
            Trouvez rapidement des réponses à vos questions.
          </p>
          <div className="help-search">
            <span className="help-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="help-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={'help-cat' + (activeCat === cat.key ? ' is-active' : '')}
              onClick={() => setActiveCat(cat.key)}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="help-empty">
            <div className="help-empty-icon">🔍</div>
            <p>Aucune question ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="help-faq">
            {filtered.map((item, i) => (
              <div key={i} className={'help-faq-item' + (openFaq === i ? ' is-open' : '')}>
                <button
                  type="button"
                  className="help-faq-question"
                  onClick={() => toggleFaq(i)}
                >
                  <span>{item.q}</span>
                  <span className="help-faq-chevron">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="help-faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <section className="help-contact">
          <h2>Besoin d aide supplémentaire ?</h2>
          <p>Notre équipe est là pour vous aider.</p>
          <div className="help-contact-actions">
            <Link to="/contact" className="btn btn-primary">
              Contacter le support
            </Link>
            <Link to="/signaler" className="btn btn-secondary">
              Signaler un problème
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Help
