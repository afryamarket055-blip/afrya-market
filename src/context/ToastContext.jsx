import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type, message, duration) => {
    const id = ++nextId
    const defaultDuration =
      type === 'error' || type === 'warning' ? 5000 : 3500
    const finalDuration = duration || defaultDuration

    setToasts((previous) => {
      // Limiter a 3 toasts visibles
      const next = [...previous, { id, type, message }]
      return next.slice(-3)
    })

    setTimeout(() => {
      removeToast(id)
    }, finalDuration)

    return id
  }, [removeToast])

  const toast = {
    success: (msg, duration) => addToast('success', msg, duration),
    error: (msg, duration) => addToast('error', msg, duration),
    warning: (msg, duration) => addToast('warning', msg, duration),
    info: (msg, duration) => addToast('info', msg, duration),
  }

  const ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={'toast toast-' + t.type}
            role="alert"
            onClick={() => removeToast(t.id)}
          >
            <span className="toast-icon">{ICONS[t.type] || '•'}</span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback silencieux : si le hook est appele hors provider, on utilise alert()
    // pour ne rien casser. A terme, tous les composants seront sous provider.
    return {
      success: (msg) => console.log('[toast.success]', msg),
      error: (msg) => console.error('[toast.error]', msg),
      warning: (msg) => console.warn('[toast.warning]', msg),
      info: (msg) => console.log('[toast.info]', msg),
    }
  }
  return ctx
}

export default ToastContext
