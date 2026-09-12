import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { signUp } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName.trim())
    setLoading(false)

    if (error) {
      setError('Impossible de creer le compte. ' + error.message)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="auth-page">
      <aside className="auth-left">
        <Link to="/" className="auth-logo">
          AFRYA <span>MARKET</span>
        </Link>

        <div className="auth-left-content">
          <h2>
            Rejoignez
            <br />
            <span>AFRYA MARKET</span>
          </h2>
          <p>
            Publiez vos annonces gratuitement et touchez des milliers
            d acheteurs partout au Benin.
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

          {success ? (
            <div className="auth-success">
              <div className="auth-success-icon">✓</div>
              <h2>Compte cree !</h2>
              <p>
                Bienvenue sur AFRYA MARKET.
                <br />
                Vous pouvez maintenant vous connecter.
              </p>
              <Link to="/connexion" className="btn btn-primary auth-submit">
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              <h1>Creer un compte</h1>
              <p className="auth-subtitle">
                C est gratuit, et ca prend 30 secondes.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="fullName">Nom complet</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex : Marc Allagbe"
                    required
                    autoComplete="name"
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
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 6 caracteres"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="form-error">{error}</p>}

                <button
                  type="submit"
                  className="btn btn-primary auth-submit"
                  disabled={loading}
                >
                  {loading ? 'Creation...' : 'Creer mon compte'}
                </button>
              </form>

              <p className="auth-footer">
                Deja un compte ? <Link to="/connexion">Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Register
