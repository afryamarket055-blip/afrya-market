import Nav from '../components/Nav'

const SECTIONS = [
  {
    title: '1. Objet',
    body: [
      'Les présentes Conditions Générales d\'Utilisation (ci-après "CGU") régissent l\'utilisation de la plateforme AFRYA MARKET, accessible à l\'adresse afryamarket.com.',
      'AFRYA MARKET est une marketplace numérique éditée par AFRYA ONE. Elle met en relation des acheteurs et des vendeurs de biens et services, principalement au Bénin et à terme en Afrique de l\'Ouest.',
      'AFRYA MARKET agit en qualité d\'intermédiaire technique. Elle n\'est ni vendeur, ni acheteur des biens échangés entre utilisateurs.',
    ],
  },
  {
    title: '2. Acceptation des CGU',
    body: [
      'L\'utilisation de la plateforme implique l\'acceptation pleine et entière des présentes CGU.',
      'En créant un compte, en publiant une annonce ou en utilisant un service d\'AFRYA MARKET, l\'utilisateur reconnaît avoir lu, compris et accepté les CGU.',
      'L\'utilisateur qui n\'accepte pas ces conditions doit cesser immédiatement d\'utiliser la plateforme.',
    ],
  },
  {
    title: '3. Inscription et compte utilisateur',
    body: [
      'L\'inscription est gratuite et réservée aux personnes physiques ou morales majeures et capables.',
      'L\'utilisateur s\'engage à fournir des informations exactes, complètes et à jour, et à les actualiser régulièrement.',
      'L\'utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son compte.',
      'AFRYA MARKET se réserve le droit de suspendre ou supprimer tout compte en cas de violation des CGU ou d\'activité frauduleuse.',
    ],
  },
  {
    title: '4. Fonctionnement de la plateforme',
    body: [
      'AFRYA MARKET permet aux utilisateurs de :',
      '• publier des annonces avec photos, description et prix ;',
      '• rechercher et consulter des annonces ;',
      '• contacter d\'autres utilisateurs via la messagerie interne ;',
      '• commander des articles et suivre leur commande ;',
      '• laisser des avis et signaler des comportements suspects ;',
      '• souscrire à des services payants (boosts, boutique professionnelle).',
      'AFRYA MARKET peut modifier, suspendre ou interrompre tout ou partie de ses services à tout moment, sans préavis.',
    ],
  },
  {
    title: '5. Obligations des utilisateurs',
    body: [
      'L\'utilisateur s\'engage à ne pas :',
      '• publier de contenus illégaux, mensongers, diffamatoires ou trompeurs ;',
      '• usurper l\'identité d\'un tiers ou créer de faux comptes ;',
      '• publier des annonces pour des produits interdits par la loi béninoise ;',
      '• harceler, menacer ou escroquer d\'autres utilisateurs ;',
      '• contourner les systèmes de sécurité ou tenter de pirater la plateforme ;',
      '• utiliser la plateforme à des fins de spam ou de publicité non autorisée.',
      'Tout manquement peut entraîner la suspension immédiate du compte et, le cas échéant, des poursuites judiciaires.',
    ],
  },
  {
    title: '6. Annonces et contenus',
    body: [
      'L\'utilisateur qui publie une annonce garantit en être le légitime propriétaire et disposer du droit de la vendre.',
      'Les photos publiées doivent être authentiques et représenter le produit réel mis en vente.',
      'AFRYA MARKET se réserve le droit de supprimer, sans préavis, toute annonce contraire aux présentes CGU ou à la loi.',
      'L\'utilisateur reste seul responsable du contenu qu\'il publie.',
    ],
  },
  {
    title: '7. Transactions entre utilisateurs',
    body: [
      'Les transactions sont conclues directement entre l\'acheteur et le vendeur.',
      'AFRYA MARKET n\'est pas partie à la transaction et ne peut être tenue responsable de son exécution.',
      'Les utilisateurs sont invités à la plus grande prudence, notamment :',
      '• privilégier les rencontres en lieu public ;',
      '• vérifier le produit avant paiement ;',
      '• utiliser la messagerie interne ;',
      '• consulter les avis et le statut du vendeur.',
    ],
  },
  {
    title: '8. Services payants et boosts',
    body: [
      'AFRYA MARKET propose des services payants (boosts, abonnements professionnels).',
      'Le paiement s\'effectue via les moyens indiqués sur la plateforme (Mobile Money, etc.).',
      'Le boost activé n\'est pas remboursable une fois validé, sauf erreur technique imputable à AFRYA MARKET.',
      'AFRYA MARKET se réserve le droit de modifier ses tarifs à tout moment, avec information préalable des utilisateurs.',
    ],
  },
  {
    title: '9. Responsabilité',
    body: [
      'AFRYA MARKET met en œuvre les moyens raisonnables pour assurer la disponibilité et la sécurité de la plateforme, sans garantie de résultat.',
      'AFRYA MARKET ne peut être tenue responsable :',
      '• des interruptions de service, pertes de données ou dysfonctionnements indépendants de sa volonté ;',
      '• des agissements frauduleux d\'un utilisateur ;',
      '• des dommages indirects résultant de l\'utilisation de la plateforme.',
      'La responsabilité d\'AFRYA MARKET, si elle était engagée, serait limitée au montant des sommes effectivement versées par l\'utilisateur au cours des 12 derniers mois.',
    ],
  },
  {
    title: '10. Propriété intellectuelle',
    body: [
      'Tous les éléments de la plateforme (marque, logo, code, design, textes) sont la propriété exclusive d\'AFRYA ONE.',
      'Toute reproduction, représentation ou utilisation non autorisée est interdite.',
      'L\'utilisateur conserve la propriété des contenus qu\'il publie, mais accorde à AFRYA MARKET une licence non exclusive, mondiale et gratuite pour les afficher et les promouvoir sur la plateforme.',
    ],
  },
  {
    title: '11. Données personnelles',
    body: [
      'Le traitement des données personnelles est détaillé dans notre Politique de Confidentialité.',
      'AFRYA MARKET s\'engage à respecter la réglementation applicable, notamment le Code du numérique du Bénin et, par bonne pratique, le RGPD.',
    ],
  },
  {
    title: '12. Modification des CGU',
    body: [
      'AFRYA MARKET peut modifier les présentes CGU à tout moment.',
      'Les utilisateurs seront informés des modifications par tout moyen approprié (email, notification sur la plateforme).',
      'La poursuite de l\'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU.',
    ],
  },
  {
    title: '13. Loi applicable et juridiction',
    body: [
      'Les présentes CGU sont régies par le droit béninois.',
      'Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence exclusive des tribunaux compétents de Cotonou, République du Bénin.',
    ],
  },
]

function Terms() {
  return (
    <div className="app legal-v2">
      <Nav />
      <main className="legal-page">
        <header className="legal-hero">
          <span className="legal-badge">LÉGAL</span>
          <h1>Conditions Générales d\'Utilisation</h1>
          <p className="legal-meta">
            Dernière mise à jour : 25 septembre 2026
          </p>
        </header>

        <div className="legal-content">
          {SECTIONS.map((s, i) => (
            <section key={i} className="legal-section">
              <h2>{s.title}</h2>
              {s.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="legal-footer">
          <p>
            Pour toute question relative à ces CGU, contactez-nous à{' '}
            <a href="mailto:afryaone@gmail.com">afryaone@gmail.com</a>.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Terms
