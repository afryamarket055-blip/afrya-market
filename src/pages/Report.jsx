import { useState } from 'react'
import Nav from '../components/Nav'

const TYPES = [
  'Annonce suspecte',
  'Utilisateur suspect',
  'Bug technique',
  'Probleme de paiement',
  'Contenu inapproprie',
  'Autre',
]

const EMAIL = 'afryaone@gmail.com'

const INFO_CARDS = [
  {
    icon: '⚠️',
    title: 'Annonce suspecte',
    text: 'Prix trop bas, photos volees, description douteuse.',
  },
  {
    icon: '🚫',
    title: 'Utilisateur suspect',
    text: 'Comportement abusif, tentative d arnaque, harcelement.',
  },
  {
    icon: '🐛',
    title: 'Bug technique',
    text: 'Un bouton ne marche pas, une page affiche une erreur.',
  },
  {
    icon: '💬',
    title: 'Autre chose',
    text: 'Tout autre probleme que vous rencontrez.',
  },
]

function Report() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState(TYPES[0])
  const [target, setTarget] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    const body = [
      'Nom : ' + name,
      '',
      'Email : ' + email,
      '',
      'Type de probleme : ' + type,
      target ? 'Cible : ' + target : '',
      '',
      'Description :',
      description,
    ].filter(Boolean).join('\n')

    const subject = '[Signalement] ' + type

    const mailtoUrl =
      'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body)

    window.location.href = mailtoUrl
  }

  return (
    <div className="app report-v2">
      <Nav />
      <main className="report-page">
        <header className="report-hero">
          <span className="report-badge">SIGNALER</span>
          <h1>Signaler un probleme</h1>
          <p className="report-subtitle">
            Aidez-nous a garder AFRYA MARKET sur. Chaque signalement est
            examine par notre equipe.
          </p>
        </header>

        <section className="report-info">
          <h2>Que souhaitez-vous signaler ?</h2>
          <div className="report-info-grid">
            {INFO_CARDS.map((card, i) => (
              <div key={i} className="report-info-card">
                <div className="report-info-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="report-form-wrapper">
          <h2>Description du probleme</h2>
          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Votre nom</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Votre email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type de probleme</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="target">Concerne (optionnel)</label>
              <input
                id="target"
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Lien de l annonce ou nom d utilisateur"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description detaillee</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez le probleme le plus precisement possible..."
                rows={6}
                maxLength={2000}
                required
              />
              <small className="form-hint">
                {description.length} / 2000 caracteres
              </small>
            </div>

            <button type="submit" className="btn btn-primary btn-lg report-submit">
              Envoyer le signalement
            </button>

            <p className="report-form-note">
              En cliquant, votre application mail s ouvrira avec le message
              pre-rempli. Vous pouvez aussi nous ecrire directement a{' '}
              <a href={'mailto:' + EMAIL}>{EMAIL}</a>.
            </p>
          </form>
        </section>
      </main>
    </div>
  )
}

export default Report
