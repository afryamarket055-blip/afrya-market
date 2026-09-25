import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    setLoading(false)

    if (error) {
      setError('Email ou mot de passe incorrect.')
      return
    }

    navigate('/')
  }

  return (
    <div className="auth-page">
      <aside className="auth-left">
        <Link to="/" className="auth-logo">
          AFRYA <span>MARKET</span>
        </Link>

        <div className="auth-left-content">
          <h2>
            Achetez. Vendez.
            <br />
            <span>Trouvez.</span>
          </h2>
          <p>
            Rejoignez des milliers d acheteurs et de vendeurs partout au
            Benin. Simple, rapide, en confiance.
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

          <h1>Connexion</h1>
          <p className="auth-subtitle">Content de vous revoir.</p>

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

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="auth-footer">
            Pas encore de compte ?{' '}
            <Link to="/inscription">S inscrire</Link>
          </p>

          <p className="auth-footer-small">
            <Link to="/mot-de-passe-oublie">Mot de passe oublie ?</Link>
          </p>
        </div>
      </section>
    </div>
  )
}

export default Login
