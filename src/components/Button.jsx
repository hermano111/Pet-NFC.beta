export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  ...props 
}) {
  const getVariantClasses = () => {
    if (disabled) {
      return 'bg-slate-300 text-slate-500 cursor-not-allowed'
    }

    switch (variant) {
      case 'secondary':
        return 'bg-secondary hover:bg-green-600 text-white shadow-sm hover:shadow-md active:scale-[0.98]'
      case 'outline':
        return 'bg-white hover:bg-slate-50 text-text border border-border shadow-sm hover:shadow-md active:scale-[0.98]'
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 text-text active:scale-[0.98]'
      default: // primary
        return 'bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md active:scale-[0.98]'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-6 py-3 text-base'
      case 'xl':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:transform-none flex items-center justify-center'

  return (
    <button
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}