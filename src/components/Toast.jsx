import { useState, useEffect } from 'react'

export default function Toast({ type = 'info', message, duration = 5000, onClose }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => onClose?.(), 300) // Esperar a que termine la animación
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => onClose?.(), 300)
  }

  const getToastStyles = () => {
    const base = "fixed top-4 left-4 right-4 mx-auto max-w-sm z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 transform"
    
    switch (type) {
      case 'success':
        return `${base} bg-green-50 border-green-200 text-green-800 ${show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`
      case 'error':
        return `${base} bg-red-50 border-red-200 text-red-800 ${show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`
      case 'warning':
        return `${base} bg-yellow-50 border-yellow-200 text-yellow-800 ${show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`
      default:
        return `${base} bg-blue-50 border-blue-200 text-blue-800 ${show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={getToastStyles()} role="alert" aria-live="assertive">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-3 text-lg">{getIcon()}</span>
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent rounded"
          aria-label="Cerrar notificación"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}