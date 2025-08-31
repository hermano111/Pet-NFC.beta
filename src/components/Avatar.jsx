import { useState } from 'react'

export default function Avatar({ src, alt, size = 'md', className = '' }) {
  const [imageError, setImageError] = useState(false)

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-16 h-16'
      case 'lg':
        return 'w-28 h-28'
      case 'xl':
        return 'w-32 h-32'
      default:
        return 'w-20 h-20'
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={`${getSizeClasses()} ${className} relative`}>
      {!imageError && src ? (
        <img
          src={src}
          alt={alt || 'Mascota'}
          className="w-full h-full rounded-full object-cover border border-border shadow-sm"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-border shadow-sm flex items-center justify-center">
          <span className="text-4xl" role="img" aria-label="Mascota">🐕</span>
        </div>
      )}
      
      {/* Indicador de estado online (opcional para futuras mejoras) */}
      <div className="absolute bottom-1 right-1 w-4 h-4 bg-secondary border-2 border-white rounded-full shadow-sm"></div>
    </div>
  )
}