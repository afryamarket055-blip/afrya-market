import Nav from '../components/Nav'

const SECTIONS = [
  {
    title: '1. Introduction',
    body: [
      'AFRYA MARKET (éditée par AFRYA ONE) accorde une importance particulière à la protection de vos données personnelles.',
      'La présente Politique de Confidentialité décrit quelles données nous collectons, pourquoi, comment nous les utilisons et quels sont vos droits.',
      'Elle s\'applique à tous les utilisateurs de la plateforme, qu\'ils soient simples visiteurs, acheteurs ou vendeurs.',
    ],
  },
  {
    title: '2. Responsable du traitement',
    body: [
      'Le responsable du traitement des données est AFRYA ONE.',
      'Contact : afryaone@gmail.com',
      'Téléphone : +229 01 40 34 98 17',
    ],
  },
  {
    title: '3. Données collectées',
    body: [
      'Nous collectons les catégories de données suivantes :',
      '• Données d\'identification : nom, email, mot de passe (chiffré), avatar, bio ;',
      '• Données de contact : téléphone (facultatif), ville, pays ;',
      '• Données de publication : annonces, photos, descriptions ;',
      '• Données d\'usage : recherches, clics, vues, likes, favoris, messages ;',
      '• Données de transaction : commandes, statuts, historique d\'achats et ventes ;',
      '• Données techniques : adresse IP, type d\'appareil, navigateur, ville approximative (via géolocalisation volontaire).',
    ],
  },
  {
    title: '4. Finalités du traitement',
    body: [
      'Vos données sont traitées pour :',
      '• la création et la gestion de votre compte ;',
      '• la mise en relation entre acheteurs et vendeurs ;',
      '• la facilitation des échanges et transactions ;',
      '• la sécurité de la plateforme (détection de fraude, modération) ;',
      '• l\'amélioration de nos services (statistiques agrégées) ;',
      '• le respect de nos obligations légales.',
    ],
  },
  {
    title: '5. Base légale du traitement',
    body: [
      'Conformément au Code du numérique du Bénin et, par bonne pratique, au RGPD, nos traitements reposent sur :',
      '• l\'exécution du contrat (fourniture du service) ;',
      '• le consentement (pour certains traitements optionnels) ;',
      '• notre intérêt légitime (sécurité, amélioration du service) ;',
      '• le respect d\'obligations légales.',
    ],
  },
  {
    title: '6. Durée de conservation',
    body: [
      'Vos données sont conservées le temps nécessaire aux finalités décrites :',
      '• données de compte : tant que le compte est actif, puis 12 mois après suppression ;',
      '• annonces : tant qu\'elles sont publiées, puis 6 mois après suppression ;',
      '• messages : 24 mois après le dernier échange ;',
      '• données de transaction : 5 ans (obligations comptables et fiscales) ;',
      '• données techniques : 12 mois maximum.',
    ],
  },
  {
    title: '7. Destinataires des données',
    body: [
      'Vos données ne sont jamais vendues à des tiers.',
      'Elles peuvent être partagées avec :',
      '• les autres utilisateurs, uniquement les informations publiques (nom, avatar, ville, annonces publiées) ;',
      '• nos prestataires techniques (hébergement Supabase, paiement Mobile Money), dans la stricte mesure nécessaire ;',
      '• les autorités compétentes, sur réquisition légale.',
    ],
  },
  {
    title: '8. Transferts hors Union Européenne',
    body: [
      'AFRYA MARKET opère depuis le Bénin. Vos données sont principalement hébergées sur les serveurs de Supabase, situés dans l\'Union Européenne.',
      'Ces transferts respectent des garanties appropriées (clauses contractuelles types de la Commission européenne).',
    ],
  },
  {
    title: '9. Vos droits',
    body: [
      'Vous disposez des droits suivants :',
      '• droit d\'accès : obtenir une copie de vos données ;',
      '• droit de rectification : corriger vos données ;',
      '• droit à l\'effacement : demander la suppression de votre compte et de vos données ;',
      '• droit à la limitation : limiter certains traitements ;',
      '• droit d\'opposition : vous opposer à certains traitements ;',
      '• droit à la portabilité : récupérer vos données dans un format lisible.',
      'Pour exercer ces droits, écrivez-nous à afryaone@gmail.com. Nous répondons sous 30 jours maximum.',
    ],
  },
  {
    title: '10. Cookies et stockage local',
    body: [
      'AFRYA MARKET utilise :',
      '• des cookies strictement nécessaires (session, authentification) ;',
      '• un stockage local (localStorage) pour améliorer votre expérience (par exemple : annonces déjà vues, préférences).',
      'Nous n\'utilisons aucun cookie publicitaire ni de traçage tiers.',
    ],
  },
  {
    title: '11. Sécurité',
    body: [
      'Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :',
      '• chiffrement HTTPS pour toutes les communications ;',
      '• politique de sécurité RLS (Row Level Security) stricte sur la base de données ;',
      '• accès restreint aux données internes ;',
      '• sauvegardes régulières.',
      'En cas de violation de données susceptible d\'engendrer un risque élevé pour vos droits, nous vous informerons dans les meilleurs délais.',
    ],
  },
  {
    title: '12. Contact',
    body: [
      'Pour toute question relative à cette politique :',
      '• Email : afryaone@gmail.com',
      '• Téléphone : +229 01 40 34 98 17',
      'Vous pouvez également introduire une réclamation auprès de l\'Autorité de Protection des Données Personnelles du Bénin (APDP).',
    ],
  },
]

function Privacy() {
  return (
    <div className="app legal-v2">
      <Nav />
      <main className="legal-page">
        <header className="legal-hero">
          <span className="legal-badge">LÉGAL</span>
          <h1>Politique de Confidentialité</h1>
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
            Cette politique peut évoluer. Nous vous informerons de toute
            modification importante par email ou notification sur la
            plateforme.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Privacy
