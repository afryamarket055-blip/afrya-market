import { useState, useEffect } from 'react'

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false)
  const [promptInstall, setPromptInstall] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Vérifier si l'app est déjà installée (mode standalone)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setSupportsPWA(true)
      setPromptInstall(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const onClick = async (evt) => {
    evt.preventDefault()
    if (!promptInstall) {
      return
    }
    promptInstall.prompt()
    const { outcome } = await promptInstall.userChoice
    if (outcome === 'accepted') {
      setSupportsPWA(false)
    }
    setPromptInstall(null)
  }

  // Ne rien afficher si déjà installé ou si le navigateur ne supporte pas
  if (isInstalled || !supportsPWA) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        right: '20px',
        maxWidth: '400px',
        margin: '0 auto',
        backgroundColor: '#1d4ed8',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 9999,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/icon-192.png" alt="Afrya" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Installer AFRYA MARKET</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Accès rapide depuis votre écran d'accueil</span>
        </div>
      </div>
      <button
        onClick={onClick}
        style={{
          backgroundColor: 'white',
          color: '#1d4ed8',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Installer
      </button>
    </div>
  )
}
