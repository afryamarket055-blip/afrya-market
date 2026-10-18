import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Filet de sécurité pour afficher l'erreur à l'écran si ça crash
window.addEventListener('error', (event) => {
  document.body.innerHTML = `
    <div style="padding:20px;background:#fee2e2;color:#991b1b;font-family:sans-serif;">
      <h2>Erreur au démarrage</h2>
      <p><strong>Message :</strong> ${event.message}</p>
      <p><strong>Fichier :</strong> ${event.filename}:${event.lineno}</p>
    </div>
  `;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
