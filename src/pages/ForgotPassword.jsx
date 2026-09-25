import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ForgotPassword() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await resetPassword(email.trim())

    setLoading(false)

    if (error) {
      setError("Impossible d envoyer l email. Verifiez l adresse saisie.")
      return
    }

    setSent(true)
  }

  return (
    <div className="auth-page">
      <aside className="auth-left">
        <Link to="/" className="auth-logo">
          AFRYA <span>MARKET</span>
        </Link>

        <div className="auth-left-content">
          <h2>
            Recuperez
            <br />
            <span>votre compte</span>
          </h2>
          <p>
            Un mot de passe oublie, ca arrive. Saisissez votre email et
            nous vous enverrons un lien pour en choisir un nouveau.
          </p>
        </div>

        <p className="auth-copyright">
          © {new Date().getFullYear()} AFRYA MARKET
        </p>
      </aside>

      <section className="auth-right">
        <div className="auth-card">
          <Link to="/" className="auth-mobile-logo">
            AFRYA <span>MARKET</span>
          </Link>

          {sent ? (
            <div className="auth-success">
              <div className="auth-success-icon">📧</div>
              <h2>Email envoye !</h2>
              <p>
                Si un compte existe avec cet email, vous recevrez un lien de
                reinitialisation dans quelques minutes.
              </p>
              <p className="auth-success-note">
                Pensez a verifier vos spams.
              </p>
              <Link to="/connexion" className="btn btn-primary auth-submit">
                Retour a la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1>Mot de passe oublie ?</h1>
              <p className="auth-subtitle">
                Saisissez votre email pour recevoir un lien de reinitialisation.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {error && <p className="form-error">{error}</p>}

                <button
                  type="submit"
                  className="btn btn-primary auth-submit"
                  disabled={loading}
                >
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>

              <p className="auth-footer">
                <Link to="/connexion">← Retour a la connexion</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default ForgotPassword
