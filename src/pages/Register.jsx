import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
function Register() {
  const { signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signUp(email, password)

    setLoading(false)

    if (error) {
      setError("Impossible de créer le compte. " + error.message)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="app">
           <Nav />
      <main
        style={{
          padding: '80px 20px',
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        <h1>Créer un compte</h1>

        {success ? (
          <p>
                       ✓ Compte créé avec succès !
            <br />
            <Link to="/connexion">Se connecter maintenant</Link>
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <p style={{ color: 'red' }}>{error}</p>
              )}
              <button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
            <p style={{ marginTop: '20px' }}>
              Déjà un compte ?{' '}
              <Link to="/connexion">Se connecter</Link>
            </p>
          </>
        )}
      </main>
    </div>
  )
}

export default Register
