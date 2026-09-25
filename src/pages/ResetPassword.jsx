import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      const session = data?.session

      // On accepte la session si elle existe (creee par le lien magique)
      if (session) {
        setHasSession(true)
      }

      setChecking(false)
    }
    checkSession()
  }, [])

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

    const { error } = await updatePassword(password)

    setLoading(false)

    if (error) {
      console.error('Erreur update password:', error)
      setError(
        'Impossible de modifier le mot de passe. Le lien a peut-etre expire.'
      )
      return
    }

    setSuccess(true)

    // Redirection auto apres 2 secondes
    setTimeout(() => {
      navigate('/connexion')
    }, 2500)
  }

  return (
    <div className="auth-page">
      <aside className="auth-left">
        <Link to="/" className="auth-logo">
          AFRYA <span>MARKET</span>
        </Link>

        <div className="auth-left-content">
          <h2>
            Nouveau
            <br />
            <span>mot de passe</span>
          </h2>
          <p>
            Choisissez un mot de passe solide et unique. Ne le partagez
            jamais avec personne.
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

          {checking ? (
            <div className="auth-success">
              <p>Verification du lien...</p>
            </div>
          ) : success ? (
            <div className="auth-success">
              <div className="auth-success-icon">✓</div>
              <h2>Mot de passe change !</h2>
              <p>
                Votre mot de passe a ete mis a jour avec succes.
                Redirection vers la connexion...
              </p>
              <Link to="/connexion" className="btn btn-primary auth-submit">
                Se connecter maintenant
              </Link>
            </div>
          ) : !hasSession ? (
            <div className="auth-success">
              <div className="auth-success-icon">⚠</div>
              <h2>Lien invalide ou expire</h2>
              <p>
                Ce lien de reinitialisation n est plus valide. Vous devez
                demander un nouveau lien.
              </p>
              <Link to="/mot-de-passe-oublie" className="btn btn-primary auth-submit">
                Demander un nouveau lien
              </Link>
            </div>
          ) : (
            <>
              <h1>Nouveau mot de passe</h1>
              <p className="auth-subtitle">
                Choisissez un mot de passe d au moins 6 caracteres.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="password">Nouveau mot de passe</label>
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
                  <label htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </label>
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
                  {loading ? 'Modification...' : 'Reinitialiser le mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default ResetPassword
