import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
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
      setError("Email ou mot de passe incorrect.")
      return
    }

    navigate('/')
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
        <h1>Connexion</h1>
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
            />
          </div>
          {error && (
            <p style={{ color: 'red' }}>{error}</p>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p style={{ marginTop: '20px' }}>
          Pas encore de compte ?{' '}
          <Link to="/inscription">S'inscrire</Link>
        </p>
      </main>
    </div>
  )
}

export default Login
