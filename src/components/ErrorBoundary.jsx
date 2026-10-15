import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
        }}>
          <h1 style={{ color: '#1d4ed8', marginBottom: '16px' }}>
            AFRYA MARKET
          </h1>
          <p style={{ marginBottom: '20px', color: '#374151' }}>
            Une erreur est survenue. Rechargez la page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Recharger
          </button>
          {this.state.error && (
            <p style={{ marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
              {this.state.error.message}
            </p>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
