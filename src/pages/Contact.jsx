import { useState } from 'react'
import Nav from '../components/Nav'

const SUBJECTS = [
  'Question générale',
  'Partenariat',
  'Signaler un bug',
  'Suggestion',
  'Autre',
]

const EMAIL = 'afryaone@gmail.com'
const PHONE = '+229 01 40 34 98 17'

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    const body = `Nom : ${name}

Email : ${email}

Sujet : ${subject}

Message :
${message}`

    const mailtoUrl = `mailto:${EMAIL}?subject=${encodeURIComponent(
      '[' + subject + '] Message de ' + name
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailtoUrl
  }

  return (
    <div className="app contact-v2">
      <Nav />
      <main className="contact-page">
        <header className="contact-hero">
          <span className="contact-badge">CONTACT</span>
          <h1>Nous contacter</h1>
          <p className="contact-subtitle">
            Une question, un partenariat, une suggestion ?
            Écrivez-nous, nous vous répondrons sous 24-48h.
          </p>
        </header>

        <div className="contact-grid">
          {/* Infos */}
          <aside className="contact-info">
            <h2>Nos coordonnées</h2>

            <a href={`mailto:${EMAIL}`} className="contact-info-card">
              <div className="contact-info-icon">✉️</div>
              <div>
                <strong>Email</strong>
                <span>{EMAIL}</span>
              </div>
            </a>

            <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="contact-info-card">
              <div className="contact-info-icon">📞</div>
              <div>
                <strong>Téléphone</strong>
                <span>{PHONE}</span>
              </div>
            </a>

            <div className="contact-info-note">
              <div className="contact-info-note-icon">⏱️</div>
              <div>
                <strong>Temps de réponse</strong>
                <span>24 à 48h en moyenne</span>
              </div>
            </div>
          </aside>

          {/* Formulaire */}
          <section className="contact-form-wrapper">
            <h2>Envoyer un message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nom complet</label>
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
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Sujet</label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre demande..."
                  rows={6}
                  maxLength={2000}
                  required
                />
                <small className="form-hint">
                  {message.length} / 2000 caractères
                </small>
              </div>

              <button type="submit" className="btn btn-primary btn-lg contact-submit">
                Envoyer le message
              </button>

              <p className="contact-form-note">
                En cliquant, votre application mail s ouvrira avec le message
                pré-rempli.
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Contact
